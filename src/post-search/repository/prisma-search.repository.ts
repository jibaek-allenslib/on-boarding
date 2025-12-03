import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  ISearchRepository,
  PostWithRelations,
} from './search.repository.interface';

/**
 * Prisma 기반 검색 Repository 구현체
 *
 * @description ISearchRepository 인터페이스를 Prisma로 구현한 클래스입니다.
 * keyword로 제목, 내용, 작성자 이메일, 댓글 내용을 검색합니다.
 */
@Injectable()
export class PrismaSearchRepository implements ISearchRepository {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * 공통 include 설정
   */
  private readonly includeRelations = {
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
  };

  async findPostsWithRelations(
    where?: Prisma.PostWhereInput,
  ): Promise<PostWithRelations[]> {
    return this.prismaService.post.findMany({
      where,
      include: this.includeRelations,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async searchByKeyword(keyword: string): Promise<PostWithRelations[]> {
    return this.findPostsWithRelations({
      OR: [
        // @@fulltext 인덱스 사용 (title)
        { title: { search: keyword } },
        // @@fulltext 인덱스 사용 (content)
        { content: { search: keyword } },
        // 이메일 검색
        {
          user: {
            email: { contains: keyword },
          },
        },
        // @@fulltext 인덱스 사용 (comment content)
        {
          comments: {
            some: {
              content: { search: keyword },
            },
          },
        },
      ],
    });
  }
}
