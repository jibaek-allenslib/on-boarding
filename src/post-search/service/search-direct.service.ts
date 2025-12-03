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
 * Direct Service Layer 방식
 *
 * @description 서비스에서 직접 Prisma 쿼리를 작성하는 가장 단순한 방식입니다.
 * 검색 조건을 배열에 추가하고 OR로 결합하는 명시적인 방법을 사용합니다.
 *
 * 장점:
 * - 가장 직관적이고 이해하기 쉬움
 * - 추가 추상화 없이 빠른 프로토타이핑 가능
 * - 코드가 직선적이고 명확함
 * - 조건 추가/제거가 쉬움
 *
 * 단점:
 * - 재사용성이 낮음
 * - 복잡한 쿼리 로직이 서비스에 혼재
 * - 테스트가 어려움 (Prisma 의존성)
 *
 * 사용 시기:
 * - 빠른 프로토타이핑이 필요한 경우
 * - 단순한 CRUD 작업
 * - 일회성 쿼리
 */
@Injectable()
export class SearchDirectService {
  constructor(private readonly prismaService: PrismaService) {}

  async search(request: SearchRequest): Promise<SearchResponse> {
    const startTime = performance.now();

    // 검색 조건 배열 생성
    const conditions: Prisma.PostWhereInput[] = [];

    if (request.keyword) {
      // 게시물 제목 검색 조건 추가 (@@fulltext 인덱스 사용)
      conditions.push({
        title: { search: request.keyword },
      });

      // 게시물 내용 검색 조건 추가 (@@fulltext 인덱스 사용)
      conditions.push({
        content: { search: request.keyword },
      });

      // 작성자 이메일 검색 조건 추가
      conditions.push({
        user: {
          email: { contains: request.keyword },
        },
      });

      // Prisma는 nested relation에서 fulltext 검색을 지원하지 않음 (contains 사용)
      conditions.push({
        comments: {
          some: {
            content: { search: request.keyword },
          },
        },
      });
    }

    // 조건이 있으면 OR로 결합, 없으면 undefined
    const where = conditions.length > 0 ? { OR: conditions } : undefined;

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

    const results = posts.map((post) => {
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
    });

    const executionTime = performance.now() - startTime;

    return new SearchResponse({
      posts: results,
      total: results.length,
      executionTime,
      method: 'direct',
    });
  }
}
