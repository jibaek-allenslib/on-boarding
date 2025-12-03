import { Prisma } from '@prisma/client';

/**
 * 검색 쿼리 빌더
 *
 * @description Builder 패턴을 사용하여 Prisma 쿼리를 선언적으로 구성합니다.
 * keyword로 제목, 내용, 작성자 이메일, 댓글 내용을 검색합니다.
 *
 * 사용 예시:
 * ```typescript
 * const query = new SearchQueryBuilder()
 *   .filterByKeyword('test')
 *   .build();
 * ```
 */
export class SearchQueryBuilder {
  private condition: Prisma.PostWhereInput | undefined;

  /**
   * 키워드로 모든 필드 검색
   *
   * @param keyword 검색 키워드
   * @returns this (메서드 체이닝 지원)
   *
   * @description
   * 게시물 제목, 내용, 작성자 이메일, 댓글 내용에서 keyword를 검색합니다.
   * OR 조건으로 결합되어 하나라도 매칭되면 반환됩니다.
   *
   * mode: 'insensitive'는 대소문자를 구분하지 않습니다.
   * 예: "Test" 검색 시 "test", "TEST", "TeSt" 모두 매칭
   *
   * @example
   * const builder = new SearchQueryBuilder();
   * builder.filterByKeyword('hello').build();
   */
  filterByKeyword(keyword: string): this {
    if (keyword) {
      this.condition = {
        OR: [
          // 게시물 제목에서 Full Text Search (@@fulltext 인덱스 사용)
          { title: { search: keyword } },
          // 게시물 내용에서 Full Text Search (@@fulltext 인덱스 사용)
          { content: { search: keyword } },
          // 작성자 이메일에서 검색
          {
            user: {
              email: { contains: keyword },
            },
          },
          // 댓글 내용에서 Full Text Search (@@fulltext 인덱스 사용)
          {
            comments: {
              some: {
                content: { search: keyword },
              },
            },
          },
        ],
      };
    }
    return this;
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
