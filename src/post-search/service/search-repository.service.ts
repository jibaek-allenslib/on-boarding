import { Injectable } from '@nestjs/common';
import { SearchRequest } from '../dto/search-request.dto';
import { SearchResponse } from '../dto/search-response.dto';
import {
  PostSearchResultDto,
  UserInfoDto,
} from '../dto/post-search-result.dto';
import { PostWithRelations } from '../repository/search.repository.interface';
import { PrismaSearchRepository } from '../repository/prisma-search.repository';

/**
 * Repository 패턴 방식
 *
 * @description ISearchRepository 인터페이스를 통해 데이터에 접근합니다.
 * Service는 비즈니스 로직에만 집중하고, 데이터 접근은 Repository에 위임합니다.
 *
 * 장점:
 * - 명확한 계층 분리 (Service ← Repository ← DB)
 * - 데이터 접근 로직 완전 캡슐화
 * - 테스트 시 Mock Repository로 쉽게 교체
 * - 데이터 소스 변경이 쉬움
 *
 * 사용 시기:
 * - 대규모 애플리케이션
 * - 명확한 계층 분리가 필요한 경우
 */
@Injectable()
export class SearchRepositoryService {
  constructor(private readonly searchRepository: PrismaSearchRepository) {}

  async search(request: SearchRequest): Promise<SearchResponse> {
    const startTime = performance.now();

    let posts: PostWithRelations[] = [];

    if (request.keyword) {
      posts = await this.searchRepository.searchByKeyword(request.keyword);
    } else {
      posts = await this.searchRepository.findPostsWithRelations();
    }

    const results = posts.map((post) => this.mapToSearchResult(post, request));

    const executionTime = performance.now() - startTime;

    return new SearchResponse({
      posts: results,
      total: results.length,
      executionTime,
      method: 'repository',
    });
  }

  private mapToSearchResult(
    post: PostWithRelations,
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

      const hasMatchingComment = post.comments.some((comment) =>
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
