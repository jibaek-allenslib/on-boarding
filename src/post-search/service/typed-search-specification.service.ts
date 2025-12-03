import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TypedSearchRequest } from '../dto/typed-search-request.dto';
import { SearchResponse } from '../dto/search-response.dto';
import {
  PostSearchResultDto,
  UserInfoDto,
} from '../dto/post-search-result.dto';
import {
  UserEmailSpecification,
  PostTitleSpecification,
  PostContentSpecification,
  CommentContentSpecification,
} from '../specification/post-specifications';
import { SearchType } from '../enum/search-type.enum';
import { ISpecification } from '../specification/specification.interface';
import { PostEntity } from '../specification/post-specifications';

/**
 * 타입별 Specification 패턴 방식
 *
 * @description SearchType에 따라 개별 Specification을 생성하고,
 * 이들을 조합(OR)하여 복잡한 검색 조건을 구성합니다.
 *
 * 장점:
 * - Specification 패턴의 강점인 "규칙 조합"을 명확히 표현
 * - 비즈니스 규칙을 독립적인 객체로 캡슐화
 * - and(), or(), not() 메서드로 직관적인 규칙 조합
 * - 각 Specification을 독립적으로 테스트 가능
 * - 복잡한 검색 조건을 도메인 언어로 표현
 *
 * 사용 시기:
 * - DDD를 따르는 프로젝트
 * - 복잡한 비즈니스 규칙이 자주 변경되는 경우
 * - 검색 조건의 조합이 다양한 경우
 */
@Injectable()
export class TypedSearchSpecificationService {
  constructor(private readonly prismaService: PrismaService) {}

  async search(request: TypedSearchRequest): Promise<SearchResponse> {
    const startTime = performance.now();

    let where = undefined;

    if (request.keyword) {
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

      // 각 SearchType에 맞는 Specification 생성
      const specifications = searchTypes.map((type) =>
        this.createSpecification(type, request.keyword),
      );

      // Specification들을 OR로 조합
      const combinedSpec = this.combineSpecifications(specifications);

      where = combinedSpec.toPrismaQuery();
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

    const results = posts.map((post) => this.mapToSearchResult(post, request));

    const executionTime = performance.now() - startTime;

    return new SearchResponse({
      posts: results,
      total: results.length,
      executionTime,
      method: 'typed-specification',
    });
  }

  /**
   * SearchType에 맞는 Specification 생성
   *
   * @description 각 SearchType에 따라 적절한 Specification 객체를 반환합니다.
   */
  private createSpecification(
    type: SearchType,
    keyword: string,
  ): ISpecification<PostEntity> {
    switch (type) {
      case SearchType.USER_EMAIL:
        return new UserEmailSpecification(keyword);

      case SearchType.POST_TITLE:
        return new PostTitleSpecification(keyword);

      case SearchType.POST_CONTENT:
        return new PostContentSpecification(keyword);

      case SearchType.COMMENT_CONTENT:
        return new CommentContentSpecification(keyword);

      default:
        throw new Error(`Unknown search type: ${type}`);
    }
  }

  /**
   * 여러 Specification을 OR로 조합
   *
   * @description Specification 패턴의 핵심 기능인 "규칙 조합"을 구현합니다.
   * 배열의 첫 번째 Specification부터 순차적으로 OR 조합합니다.
   *
   * @example
   * [UserEmailSpec, PostTitleSpec, PostContentSpec]
   * → UserEmailSpec.or(PostTitleSpec).or(PostContentSpec)
   */
  private combineSpecifications(
    specifications: ISpecification<PostEntity>[],
  ): ISpecification<PostEntity> {
    if (specifications.length === 0) {
      throw new Error('At least one specification is required');
    }

    if (specifications.length === 1) {
      return specifications[0];
    }

    // 첫 번째 Specification부터 순차적으로 OR 조합
    return specifications.reduce((combined, current) => combined.or(current));
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
