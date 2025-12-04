import { Injectable } from '@nestjs/common';
import { PrismaService, PrismaTransaction } from 'src/prisma/prisma.service';

@Injectable()
export class CommentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createComment(args: {
    tx: PrismaTransaction;
    postId: number;
    content: string;
    userId: string;
  }) {
    const { tx, postId, content, userId } = args;

    return tx.comment.create({
      data: {
        postId,
        content,
        userId,
      },
    });
  }

  /**
   * 게시물 ID 목록으로 댓글들을 조회합니다.
   * @param postIds 게시물 ID 목록
   */
  async findCommentsByPostIds(postIds: number[]) {
    return this.prisma.comment.findMany({
      where: {
        postId: { in: postIds },
      },
    });
  }
}
