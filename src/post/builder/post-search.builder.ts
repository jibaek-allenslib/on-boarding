import { Prisma } from '@prisma/client';

export class PostSearchBuilder {
  private keyword?: string;

  setKeyword(keyword?: string): this {
    this.keyword = keyword;
    return this;
  }

  build(): Prisma.PostWhereInput | undefined {
    if (!this.keyword) {
      return undefined;
    }

    const conditions: Prisma.PostWhereInput[] = [];

    // 게시물 제목 검색 조건 추가 (@@fulltext 인덱스 사용)
    conditions.push({
      title: { search: this.keyword },
    });

    // 게시물 내용 검색 조건 추가 (@@fulltext 인덱스 사용)
    conditions.push({
      content: { search: this.keyword },
    });

    // 작성자 이메일 검색 조건 추가
    conditions.push({
      user: {
        email: { contains: this.keyword },
      },
    });

    // 댓글 내용 검색 조건 추가 (@@fulltext 인덱스 사용)
    conditions.push({
      comments: {
        some: {
          content: { search: this.keyword },
        },
      },
    });

    return conditions.length > 0 ? { OR: conditions } : undefined;
  }
}
