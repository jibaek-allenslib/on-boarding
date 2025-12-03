import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SearchRequest } from '../dto/search-request.dto';
import { SearchResponse } from '../dto/search-response.dto';
import {
  PostSearchResultDto,
  UserInfoDto,
} from '../dto/post-search-result.dto';
import { SearchQueryBuilder } from '../builder/search-query.builder';

/**
 * Builder 패턴 방식
 *
 * @description SearchQueryBuilder를 사용하여 쿼리를 선언적으로 구성합니다.
 *
 * 장점:
 * - 쿼리 로직이 빌더로 분리되어 서비스가 간결함
 * - 선언적이고 읽기 쉬운 코드
 * - 타입 안전성 보장
 *
 * 사용 시기:
 * - 복잡한 동적 쿼리가 필요한 경우
 * - 쿼리 조합 패턴이 자주 재사용되는 경우
 */
@Injectable()
export class SearchBuilderService {
  constructor(private readonly prismaService: PrismaService) {}

  async search(request: SearchRequest): Promise<SearchResponse> {
    const startTime = performance.now();

    const builder = new SearchQueryBuilder();

    if (request.keyword) {
      builder.filterByKeyword(request.keyword);
    }

    const where = builder.build();

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

    const results = posts.map((post) => this.mapToSearchResult(post, request));

    const executionTime = performance.now() - startTime;

    return new SearchResponse({
      posts: results,
      total: results.length,
      executionTime,
      method: 'builder',
    });
  }

  private mapToSearchResult(
    post: any,
    request: SearchRequest,
  ): PostSearchResultDto {
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
