import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { SearchRequest } from '../dto/search-request.dto';
import { SearchResponse } from '../dto/search-response.dto';
import {
  PostSearchResultDto,
  UserInfoDto,
} from '../dto/post-search-result.dto';

/**
 * 기본 조건 생성 함수들
 *
 * @description 각 필드별로 검색 조건을 생성하는 순수 함수들입니다.
 * 작은 단위로 분리되어 있어 테스트와 재사용이 용이합니다.
 */

/**
 * 게시물 제목 검색 조건 생성
 *
 * @param query 검색어
 * @returns Prisma where 조건
 */
const titleContains = (query: string): Prisma.PostWhereInput => ({
  title: { contains: query, mode: 'insensitive' as const },
});

/**
 * 게시물 내용 검색 조건 생성
 *
 * @param query 검색어
 * @returns Prisma where 조건
 */
const contentContains = (query: string): Prisma.PostWhereInput => ({
  content: { contains: query, mode: 'insensitive' as const },
});

/**
 * 작성자 이메일 검색 조건 생성
 *
 * @param email 이메일 검색어
 * @returns Prisma where 조건
 */
const userEmailContains = (email: string): Prisma.PostWhereInput => ({
  user: {
    email: { contains: email, mode: 'insensitive' as const },
  },
});

/**
 * 댓글 내용 검색 조건 생성
 *
 * @param query 검색어
 * @returns Prisma where 조건
 */
const commentContentContains = (query: string): Prisma.PostWhereInput => ({
  comments: {
    some: {
      content: { contains: query, mode: 'insensitive' as const },
    },
  },
});

/**
 * 조합 유틸리티 함수들
 *
 * @description 여러 조건을 논리 연산자로 결합하는 함수들입니다.
 */

/**
 * 여러 조건을 OR로 결합
 *
 * @param conditions 결합할 조건들
 * @returns OR로 결합된 Prisma where 조건
 *
 * @example
 * combineOr(
 *   titleContains('hello'),
 *   contentContains('hello')
 * )
 */
const combineOr = (
  ...conditions: Prisma.PostWhereInput[]
): Prisma.PostWhereInput => ({
  OR: conditions,
});

/**
 * 여러 조건을 AND로 결합
 *
 * @param conditions 결합할 조건들
 * @returns AND로 결합된 Prisma where 조건
 *
 * @example
 * combineAnd(
 *   titleContains('hello'),
 *   userEmailContains('user@example.com')
 * )
 */
const combineAnd = (
  ...conditions: Prisma.PostWhereInput[]
): Prisma.PostWhereInput => ({
  AND: conditions,
});

/**
 * Function Composition 방식
 *
 * @description 작은 순수 함수들을 조합하여 쿼리를 생성합니다.
 * 함수형 프로그래밍 패러다임을 따릅니다.
 *
 * 장점:
 * - 작은 순수 함수로 구성되어 테스트 용이
 * - 각 함수가 독립적이고 재사용 가능
 * - 함수 조합으로 복잡한 쿼리 구성 가능
 * - 함수형 프로그래밍 스타일
 *
 * 단점:
 * - 함수형 패러다임에 익숙하지 않으면 이해 어려움
 * - 많은 작은 함수들 관리 필요
 *
 * 사용 시기:
 * - 함수형 프로그래밍을 선호하는 팀
 * - 작은 단위의 테스트가 중요한 경우
 * - 조건 조합이 복잡하고 다양한 경우
 *
 * @example
 * // keyword로 모든 필드 검색
 * const conditions = [
 *   titleContains(keyword),
 *   contentContains(keyword),
 *   userEmailContains(keyword),
 *   commentContentContains(keyword),
 * ];
 * const where = combineOr(...conditions);
 */
@Injectable()
export class SearchCompositionService {
  constructor(private readonly prismaService: PrismaService) {}

  async search(request: SearchRequest): Promise<SearchResponse> {
    const startTime = performance.now();

    // keyword가 있으면 모든 필드에서 검색 조건 생성
    let where: Prisma.PostWhereInput | undefined;

    if (request.keyword) {
      const conditions = [
        titleContains(request.keyword),
        contentContains(request.keyword),
        userEmailContains(request.keyword),
        commentContentContains(request.keyword),
      ];

      // OR로 조합 (하나라도 매칭되면 포함)
      where = combineOr(...conditions);
    }

    const posts = await this.prismaService.post.findMany({
      where,
      include: {
        user: {
          select: {
            email: true,
          },
        },
        comments: {
          select: {
            id: true,
            content: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const results = posts.map((post) =>
      this.mapToSearchResult(post, request),
    );

    const executionTime = performance.now() - startTime;

    return new SearchResponse({
      posts: results,
      total: results.length,
      executionTime,
      method: 'composition',
    });
  }

  private mapToSearchResult(post: any, request: SearchRequest): PostSearchResultDto {
    const matchedFields: string[] = [];

    if (request.keyword) {
      const lowerKeyword = request.keyword.toLowerCase();

      if (post.user.email.toLowerCase().includes(lowerKeyword)) {
        matchedFields.push('userEmail');
      }
      if (post.title.toLowerCase().includes(lowerKeyword)) {
        matchedFields.push('postTitle');
      }
      if (post.content.toLowerCase().includes(lowerKeyword)) {
        matchedFields.push('postContent');
      }

      const hasMatchingComment = post.comments.some((comment: any) =>
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
      user: new UserInfoDto({ email: post.user.email }),
      commentCount: post.comments.length,
      matchedFields,
    });
  }
}

/**
 * 순수 함수들을 export하여 다른 곳에서도 사용 가능하게 함
 *
 * @description 이 함수들은 독립적으로 테스트하거나 다른 서비스에서 재사용할 수 있습니다.
 */
export const SearchFilterFunctions = {
  // 기본 조건 생성 함수들
  titleContains,
  contentContains,
  userEmailContains,
  commentContentContains,

  // 조합 유틸리티
  combineOr,
  combineAnd,
};
