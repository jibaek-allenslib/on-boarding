import { Injectable } from '@nestjs/common';
import { Post, Prisma } from '@prisma/client';
import { PrismaService, PrismaTransaction } from 'src/prisma/prisma.service';

import { PostSearchBuilder } from '../builder/post-search.builder';

@Injectable()
export class PostRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createPost(args: {
    tx: PrismaTransaction;
    title: string;
    content: string;
    userId: string;
  }): Promise<Post> {
    const tx = args.tx;
    return tx.post.create({
      data: {
        title: args.title,
        content: args.content,
        userId: args.userId,
      },
    });
  }

  /**
   * 게시물 목록 조회 (페이지네이션 지원)
   * @param args.skip - offset 기반 페이지네이션에서 건너뛸 개수
   * @param args.take - 가져올 개수
   * @param args.cursor - cursor 기반 페이지네이션에서 시작점
   * @param args.keyword - 검색 키워드
   */
  async findPosts(args: {
    skip?: number;
    take: number;
    cursor?: { id: number };
    keyword?: string;
  }): Promise<Post[]> {
    const where = new PostSearchBuilder().setKeyword(args.keyword).build();

    return this.prisma.post.findMany({
      skip: args.cursor ? 1 : args.skip, // cursor가 있으면 해당 cursor 다음부터
      take: args.take,
      cursor: args.cursor,
      where,
      orderBy: { id: 'desc' },
    });
  }

  /**
   * 전체 게시물 수 조회
   * @param keyword - 검색 키워드
   */
  async countPosts(keyword?: string): Promise<number> {
    const where = new PostSearchBuilder().setKeyword(keyword).build();
    return this.prisma.post.count({ where });
  }
}
