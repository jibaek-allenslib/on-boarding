import { Prisma } from '@prisma/client';
import { SearchType } from '../enum/search-type.enum';

/**
 * 타입별 검색 쿼리 빌더
 *
 * @description SearchType 배열에 따라 동적으로 검색 쿼리를 구성합니다.
 * 각 SearchType에 맞는 필드에서만 검색을 수행합니다.
 *
 * 사용 예시:
 * ```typescript
 * const query = new TypedSearchQueryBuilder()
 *   .filterByTypes('test', [SearchType.POST_TITLE, SearchType.POST_CONTENT])
 *   .build();
 * ```
 */
export class TypedSearchQueryBuilder {
  private condition: Prisma.PostWhereInput | undefined;

  /**
   * SearchType 배열에 따라 검색 조건 구성
   *
   * @param keyword 검색 키워드
   * @param types 검색할 필드 타입 배열 (미지정 시 모든 필드 검색)
   * @returns this (메서드 체이닝 지원)
   *
   * @description
   * 지정된 SearchType에 해당하는 필드에서만 keyword를 검색합니다.
   * types가 비어있으면 모든 필드에서 검색합니다.
   * OR 조건으로 결합되어 하나라도 매칭되면 반환됩니다.
   *
   * @example
   * // 제목과 내용에서만 검색
   * builder.filterByTypes('hello', [SearchType.POST_TITLE, SearchType.POST_CONTENT]);
   *
   * @example
   * // 모든 필드에서 검색
   * builder.filterByTypes('hello', []);
   */
  filterByTypes(keyword: string, types?: SearchType[]): this {
    if (!keyword) {
      return this;
    }

    // types가 없거나 비어있으면 아무 조건도 추가 안함
    const searchTypes = !types || types.length === 0 ? [] : types;

    const conditions: Prisma.PostWhereInput[] = [];

    for (const type of searchTypes) {
      switch (type) {
        case SearchType.USER_EMAIL:
          conditions.push(this.createUserEmailCondition(keyword));
          break;
        case SearchType.POST_TITLE:
          conditions.push(this.createPostTitleCondition(keyword));
          break;
        case SearchType.POST_CONTENT:
          conditions.push(this.createPostContentCondition(keyword));
          break;
        case SearchType.COMMENT_CONTENT:
          conditions.push(this.createCommentContentCondition(keyword));
          break;
      }
    }

    this.condition = {
      OR: conditions,
    };

    return this;
  }

  /**
   * 사용자 이메일 검색 조건 생성
   */
  private createUserEmailCondition(keyword: string): Prisma.PostWhereInput {
    return {
      user: {
        email: { contains: keyword },
      },
    };
  }

  /**
   * 게시물 제목 검색 조건 생성 (@@fulltext 인덱스 사용)
   */
  private createPostTitleCondition(keyword: string): Prisma.PostWhereInput {
    return {
      title: { search: keyword },
    };
  }

  /**
   * 게시물 내용 검색 조건 생성 (@@fulltext 인덱스 사용)
   */
  private createPostContentCondition(keyword: string): Prisma.PostWhereInput {
    return {
      content: { search: keyword },
    };
  }

  /**
   * 댓글 내용 검색 조건 생성
   * Prisma는 nested relation에서 fulltext 검색을 지원하지 않음 (contains 사용)
   */
  private createCommentContentCondition(
    keyword: string,
  ): Prisma.PostWhereInput {
    return {
      comments: {
        some: {
          content: { search: keyword },
        },
      },
    };
  }

  /**
   * 빌더 초기화
   */
  reset(): this {
    this.condition = undefined;
    return this;
  }

  /**
   * 최종 Prisma where 조건 생성
   */
  build(): Prisma.PostWhereInput | undefined {
    return this.condition;
  }
}
