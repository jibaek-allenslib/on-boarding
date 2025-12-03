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
        // Prisma는 nested relation에서 fulltext 검색을 지원하지 않음 (contains 사용)
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
