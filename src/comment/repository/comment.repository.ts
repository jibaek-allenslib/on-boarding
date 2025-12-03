import { Injectable } from '@nestjs/common';
import { PrismaTransaction } from 'src/prisma/prisma.service';

@Injectable()
export class CommentRepository {
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
}
