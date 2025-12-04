import { Injectable } from '@nestjs/common';
import { Post, Prisma } from '@prisma/client';
import { ConnectionService } from 'src/common/service/connection.service';
import { OffsetPaginationDto } from 'src/common/dto/offset-pagination.dto';
import { PostRepository } from '../repository/post.repository';

/**
 * Offset 기반 Post 목록 페이지네이션 서비스
 */
@Injectable()
export class PostListOffsetConnectionService extends ConnectionService<
  Post,
  OffsetPaginationDto
> {
  constructor(private readonly postRepository: PostRepository) {
    super();
  }

  protected async getNodes(
    args: OffsetPaginationDto & {
      skip?: number;
      take: number;
      cursor?: { id: number };
    },
  ): Promise<Post[]> {
    return this.postRepository.findPosts({
      skip: args.skip,
      take: args.take,
      keyword: args.keyword,
    });
  }

  protected async getTotalCount(args: OffsetPaginationDto): Promise<number> {
    return this.postRepository.countPosts(args.keyword);
  }

  protected getCursor(item: Post): { id: number } {
    return { id: item.id };
  }
}
