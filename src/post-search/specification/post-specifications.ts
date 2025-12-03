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
        { title: { contains: this.keyword, mode: 'insensitive' as const } },
        { content: { contains: this.keyword, mode: 'insensitive' as const } },
        {
          user: {
            email: { contains: this.keyword, mode: 'insensitive' as const },
          },
        },
        {
          comments: {
            some: {
              content: { contains: this.keyword, mode: 'insensitive' as const },
            },
          },
        },
      ],
    };
  }
}
