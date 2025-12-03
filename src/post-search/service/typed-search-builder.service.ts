import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TypedSearchRequest } from '../dto/typed-search-request.dto';
import { SearchResponse } from '../dto/search-response.dto';
import {
  PostSearchResultDto,
  UserInfoDto,
} from '../dto/post-search-result.dto';
import { TypedSearchQueryBuilder } from '../builder/typed-search-query.builder';
import { SearchType } from '../enum/search-type.enum';

/**
 * 타입별 검색 Builder 패턴 방식
 *
 * @description TypedSearchQueryBuilder를 사용하여 SearchType에 따라
 * 동적으로 쿼리를 구성합니다.
 *
 * 장점:
 * - 검색할 필드를 명시적으로 선택 가능
 * - 쿼리 로직이 빌더로 분리되어 서비스가 간결함
 * - 타입 안전성 보장
 * - 불필요한 필드 검색 제거로 성능 향상 가능
 *
 * 사용 시기:
 * - 사용자가 특정 필드에서만 검색하고 싶을 때
 * - 검색 범위를 제한하여 성능을 최적화하고 싶을 때
 */
@Injectable()
export class TypedSearchBuilderService {
  constructor(private readonly prismaService: PrismaService) {}

  async search(request: TypedSearchRequest): Promise<SearchResponse> {
    const startTime = performance.now();

    const builder = new TypedSearchQueryBuilder();

    if (request.keyword) {
      builder.filterByTypes(request.keyword, request.searchTypes);
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
      method: 'typed-builder',
    });
  }

  /**
   * Post 엔티티를 PostSearchResultDto로 변환
   *
   * @description request.searchTypes에 지정된 타입에서만 매칭 여부를 확인합니다.
   * searchTypes가 없으면 모든 필드에서 매칭 확인합니다.
   */
  private mapToSearchResult(
    post: any,
    request: TypedSearchRequest,
  ): PostSearchResultDto {
    const matchedFields: string[] = [];

    if (request.keyword) {
      const lowerKeyword = request.keyword.toLowerCase();

      // searchTypes가 없거나 비어있으면 모든 타입 검사
      const searchTypes =
        !request.searchTypes || request.searchTypes.length === 0
          ? [
              SearchType.USER_EMAIL,
              SearchType.POST_TITLE,
              SearchType.POST_CONTENT,
              SearchType.COMMENT_CONTENT,
            ]
          : request.searchTypes;

      // 각 SearchType에 따라 매칭 여부 확인
      for (const type of searchTypes) {
        switch (type) {
          case SearchType.USER_EMAIL:
            if (post.user.email.toLowerCase().includes(lowerKeyword)) {
              matchedFields.push('userEmail');
            }
            break;

          case SearchType.POST_TITLE:
            if (post.title.toLowerCase().includes(lowerKeyword)) {
              matchedFields.push('postTitle');
            }
            break;

          case SearchType.POST_CONTENT:
            if (post.content.toLowerCase().includes(lowerKeyword)) {
              matchedFields.push('postContent');
            }
            break;

          case SearchType.COMMENT_CONTENT:
            const hasMatchingComment = post.comments.some((comment: any) =>
              comment.content.toLowerCase().includes(lowerKeyword),
            );
            if (hasMatchingComment) {
              matchedFields.push('commentContent');
            }
            break;
        }
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
