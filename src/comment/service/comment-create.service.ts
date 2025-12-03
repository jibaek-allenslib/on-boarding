import { Injectable } from '@nestjs/common';
import { CommentRepository } from '../repository/comment.repository';
import { PrismaClient } from '@prisma/client';
import { CommentCreateRequest } from '../dto/comment-create-request.dto';
import { CommentCreateResponse } from '../dto/comment-create-response.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CommentCreateService {
  constructor(
    private readonly commentRepository: CommentRepository,
    // PrismaClient 주입 받으면 안됨
    private readonly prisma: PrismaService,
  ) {}

  async createComment(args: {
    request: CommentCreateRequest;
    userId: string;
  }): Promise<CommentCreateResponse> {
    const comment = await this.prisma.$transaction(async (tx) => {
      return this.commentRepository.createComment({
        tx: tx,
        content: args.request.content,
        postId: args.request.postId,
        userId: args.userId,
      });
    });
    return new CommentCreateResponse({ commentId: comment.id });
  }
}
