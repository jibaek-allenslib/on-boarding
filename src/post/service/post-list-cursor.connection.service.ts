import { Injectable } from '@nestjs/common';
import { Post, Prisma } from '@prisma/client';
import { ConnectionService } from 'src/common/service/connection.service';
import { CursorPaginationDto } from 'src/common/dto/cursor-pagination.dto';
import { PostRepository } from '../repository/post.repository';

/**
 * Cursor 기반 Post 목록 페이지네이션 서비스
 */
@Injectable()
export class PostListCursorConnectionService extends ConnectionService<
  Post,
  CursorPaginationDto
> {
  constructor(private readonly postRepository: PostRepository) {
    super();
  }

  protected async getNodes(
    args: CursorPaginationDto & {
      skip?: number;
      take: number;
      cursor?: { id: number };
    },
  ): Promise<Post[]> {
    return this.postRepository.findPosts({
      take: args.take,
      cursor: args.cursor,
      keyword: args.keyword,
    });
  }

  protected async getTotalCount(args: CursorPaginationDto): Promise<number> {
    return this.postRepository.countPosts(args.keyword);
  }

  protected getCursor(item: Post): { id: number } {
    return { id: item.id };
  }
}
