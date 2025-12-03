import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PostRepository } from '../repository/post.repository';
import { PostCreateRequest } from '../dto/post-create-request.dto';
import { PostCreateResponse } from '../dto/post-create-response.dto';

@Injectable()
export class PostCreateService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly postRepository: PostRepository,
  ) {}

  async createPost(args: {
    request: PostCreateRequest;
    userId?: string;
  }): Promise<PostCreateResponse> {
    const post = await this.prismaService.$transaction(async (tx) => {
      const post = await this.postRepository.createPost({
        tx,
        title: args.request.title,
        content: args.request.content,
        userId: args.userId,
      });

      return post;
    });

    return new PostCreateResponse({ id: post.id });
  }
}
