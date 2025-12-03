import { Injectable } from '@nestjs/common';
import { Post } from '@prisma/client';
import { PrismaService, PrismaTransaction } from 'src/prisma/prisma.service';

@Injectable()
export class PostRepository {
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
}
