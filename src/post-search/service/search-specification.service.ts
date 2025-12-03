import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SearchRequest } from '../dto/search-request.dto';
import { SearchResponse } from '../dto/search-response.dto';
import {
  PostSearchResultDto,
  UserInfoDto,
} from '../dto/post-search-result.dto';
import { KeywordSpecification } from '../specification/post-specifications';

/**
 * Specification 패턴 방식
 *
 * @description DDD의 Specification 패턴을 사용하여 비즈니스 규칙을 조합합니다.
 *
 * 장점:
 * - 비즈니스 규칙을 명시적 객체로 표현
 * - 도메인 언어로 코드 작성 (가독성 높음)
 * - 규칙을 독립적으로 테스트 가능
 *
 * 사용 시기:
 * - DDD를 따르는 대규모 애플리케이션
 * - 복잡한 비즈니스 규칙이 있는 도메인
 */
@Injectable()
export class SearchSpecificationService {
  constructor(private readonly prismaService: PrismaService) {}

  async search(request: SearchRequest): Promise<SearchResponse> {
    const startTime = performance.now();

    const where = request.keyword
      ? new KeywordSpecification(request.keyword).toPrismaQuery()
      : undefined;

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
      method: 'specification',
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
