import { Prisma } from '@prisma/client';
import { Specification } from './specification.interface';

/**
 * Post 타입 정의 (검증용)
 */
export type PostEntity = {
  id: number;
  title: string;
  content: string;
  user?: {
    email: string;
  };
  comments?: {
    content: string;
  }[];
};

/**
 * 키워드로 전체 검색하는 Specification
 *
 * @description keyword로 제목, 내용, 작성자 이메일, 댓글 내용을 검색합니다.
 */
export class KeywordSpecification extends Specification<PostEntity> {
  constructor(private readonly keyword: string) {
    super();
  }

  isSatisfiedBy(entity: PostEntity): boolean {
    const lowerKeyword = this.keyword.toLowerCase();
    return (
      entity.title.toLowerCase().includes(lowerKeyword) ||
      entity.content.toLowerCase().includes(lowerKeyword) ||
      entity.user?.email.toLowerCase().includes(lowerKeyword) ||
      entity.comments?.some((c) =>
        c.content.toLowerCase().includes(lowerKeyword),
      ) ||
      false
    );
  }

  toPrismaQuery(): Prisma.PostWhereInput {
    return {
      OR: [
        // @@fulltext 인덱스 사용 (title)
        { title: { search: this.keyword } },
        // @@fulltext 인덱스 사용 (content)
        { content: { search: this.keyword } },
        // 이메일 검색
        {
          user: {
            email: { contains: this.keyword },
          },
        },
        // @@fulltext 인덱스 사용 (comment content)
        {
          comments: {
            some: {
              content: { search: this.keyword },
            },
          },
        },
      ],
    };
  }
}

/**
 * 사용자 이메일 검색 Specification
 *
 * @description 작성자 이메일에서만 키워드를 검색합니다.
 */
export class UserEmailSpecification extends Specification<PostEntity> {
  constructor(private readonly keyword: string) {
    super();
  }

  isSatisfiedBy(entity: PostEntity): boolean {
    const lowerKeyword = this.keyword.toLowerCase();
    return entity.user?.email.toLowerCase().includes(lowerKeyword) || false;
  }

  toPrismaQuery(): Prisma.PostWhereInput {
    return {
      user: {
        email: { contains: this.keyword },
      },
    };
  }
}

/**
 * 게시물 제목 검색 Specification
 *
 * @description 게시물 제목에서만 키워드를 검색합니다.
 */
export class PostTitleSpecification extends Specification<PostEntity> {
  constructor(private readonly keyword: string) {
    super();
  }

  isSatisfiedBy(entity: PostEntity): boolean {
    const lowerKeyword = this.keyword.toLowerCase();
    return entity.title.toLowerCase().includes(lowerKeyword);
  }

  toPrismaQuery(): Prisma.PostWhereInput {
    return {
      title: { search: this.keyword },
    };
  }
}

/**
 * 게시물 내용 검색 Specification
 *
 * @description 게시물 내용에서만 키워드를 검색합니다.
 */
export class PostContentSpecification extends Specification<PostEntity> {
  constructor(private readonly keyword: string) {
    super();
  }

  isSatisfiedBy(entity: PostEntity): boolean {
    const lowerKeyword = this.keyword.toLowerCase();
    return entity.content.toLowerCase().includes(lowerKeyword);
  }

  toPrismaQuery(): Prisma.PostWhereInput {
    return {
      content: { search: this.keyword },
    };
  }
}

/**
 * 댓글 내용 검색 Specification
 *
 * @description 댓글 내용에서만 키워드를 검색합니다. (@@fulltext 인덱스 사용)
 */
export class CommentContentSpecification extends Specification<PostEntity> {
  constructor(private readonly keyword: string) {
    super();
  }

  isSatisfiedBy(entity: PostEntity): boolean {
    const lowerKeyword = this.keyword.toLowerCase();
    return (
      entity.comments?.some((c) =>
        c.content.toLowerCase().includes(lowerKeyword),
      ) || false
    );
  }

  toPrismaQuery(): Prisma.PostWhereInput {
    return {
      comments: {
        some: {
          content: { search: this.keyword },
        },
      },
    };
  }
}
