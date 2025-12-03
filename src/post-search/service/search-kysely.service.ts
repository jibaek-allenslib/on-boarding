import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SearchRequest } from '../dto/search-request.dto';
import { SearchResponse } from '../dto/search-response.dto';
import {
  PostSearchResultDto,
  UserInfoDto,
} from '../dto/post-search-result.dto';
import kyselyExtension from 'prisma-extension-kysely';
import { Kysely, PostgresAdapter, PostgresIntrospector, PostgresQueryCompiler } from 'kysely';
import type { DB } from 'src/prisma/generated/types';

/**
 * Kysely 확장 방식
 *
 * @description prisma-extension-kysely를 사용하여 Kysely 스타일의 쿼리 빌더를 사용합니다.
 *
 * 장점:
 * - SQL에 가까운 직관적인 API
 * - 완전한 타입 안전성 (TypeScript)
 * - 복잡한 쿼리 작성이 용이
 * - 명시적인 JOIN과 조건 제어
 *
 * 단점:
 * - 추가 패키지 의존성 (kysely, prisma-extension-kysely, prisma-kysely)
 * - Prisma보다 저수준 API (더 많은 코드 필요)
 * - 초기 설정이 복잡함
 *
 * 사용 시기:
 * - 매우 복잡한 SQL 쿼리가 필요한 경우
 * - Prisma의 제약을 벗어나고 싶은 경우
 * - SQL 쿼리를 더 명시적으로 제어하고 싶은 경우
 */
@Injectable()
export class SearchKyselyService {
  constructor(private readonly prismaService: PrismaService) {}

  async search(request: SearchRequest): Promise<SearchResponse> {
    const startTime = performance.now();

    // Kysely extension으로 Prisma 확장
    const extendedPrisma = this.prismaService.$extends(
      kyselyExtension({
        kysely: (driver) =>
          new Kysely<DB>({
            dialect: {
              // Prisma driver를 Kysely와 연결
              createDriver: () => driver,
              // PostgreSQL용 adapter, introspector, compiler
              createAdapter: () => new PostgresAdapter(),
              createIntrospector: (db) => new PostgresIntrospector(db),
              createQueryCompiler: () => new PostgresQueryCompiler(),
            },
          }),
      }),
    );

    // Kysely 쿼리 빌더 시작
    let query = extendedPrisma.$kysely
      .selectFrom('posts')
      // users 테이블과 JOIN
      .innerJoin('users', 'posts.userId', 'users.id')
      // 필요한 컬럼만 select
      .select([
        'posts.id',
        'posts.title',
        'posts.content',
        'posts.createdAt',
        'users.email as userEmail',
      ])
      // 최신 게시물부터 정렬
      .orderBy('posts.createdAt', 'desc');

    // keyword가 있으면 검색 조건 추가
    if (request.keyword) {
      query = query.where(({ or, eb }) =>
        or([
          // 게시물 제목에서 검색 (대소문자 구분 없음)
          eb('posts.title', 'ilike', `%${request.keyword}%`),
          // 게시물 내용에서 검색 (대소문자 구분 없음)
          eb('posts.content', 'ilike', `%${request.keyword}%`),
          // 작성자 이메일에서 검색 (대소문자 구분 없음)
          eb('users.email', 'ilike', `%${request.keyword}%`),
        ]),
      );
    }

    // 쿼리 실행
    const kyselyResults = await query.execute();

    // 각 게시물의 댓글 정보는 별도로 조회 (Kysely로 복잡한 집계보다 간단)
    const postIds = kyselyResults.map((post) => post.id);

    const postsWithComments = await this.prismaService.post.findMany({
      where: {
        id: { in: postIds },
      },
      include: {
        comments: {
          select: {
            id: true,
            content: true,
          },
        },
      },
    });

    // 댓글 정보를 맵으로 변환
    const commentsMap = new Map(
      postsWithComments.map((post) => [post.id, post.comments]),
    );

    // 결과를 DTO로 변환
    const results = kyselyResults.map((post) => {
      const comments = commentsMap.get(post.id) || [];
      const matchedFields: string[] = [];

      if (request.keyword) {
        const lowerKeyword = request.keyword.toLowerCase();

        if (post.userEmail.toLowerCase().includes(lowerKeyword)) {
          matchedFields.push('userEmail');
        }
        if (post.title.toLowerCase().includes(lowerKeyword)) {
          matchedFields.push('postTitle');
        }
        if (post.content.toLowerCase().includes(lowerKeyword)) {
          matchedFields.push('postContent');
        }

        const hasMatchingComment = comments.some((comment) =>
          comment.content.toLowerCase().includes(lowerKeyword),
        );
        if (hasMatchingComment) {
          matchedFields.push('commentContent');
        }
      }

      return new PostSearchResultDto({
        id: post.id,
        title: post.title,
        content: post.content,
        createdAt: post.createdAt,
        user: new UserInfoDto({ email: post.userEmail }),
        commentCount: comments.length,
        matchedFields,
      });
    });

    const executionTime = performance.now() - startTime;

    return new SearchResponse({
      posts: results,
      total: results.length,
      executionTime,
      method: 'kysely',
    });
  }
}
