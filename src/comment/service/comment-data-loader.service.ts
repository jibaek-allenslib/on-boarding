import { Injectable } from '@nestjs/common';
import { Comment } from '@prisma/client';
import { DataLoaderService } from '../../common/service/data-loader.service';
import { CommentRepository } from '../repository/comment.repository';

@Injectable()
export class CommentDataLoader extends DataLoaderService<number, Comment[]> {
  constructor(private readonly commentRepository: CommentRepository) {
    super();
  }

  protected async batchLoad(
    /**
     * keys: 게시물 ID 배열
     */
    keys: readonly number[],
  ): Promise<Array<Comment[]>> {
    const comments = await this.commentRepository.findCommentsByPostIds([
      ...keys,
    ]);

    // Group comments by postId
    const commentsMap = new Map<number, Comment[]>();
    comments.forEach((comment) => {
      const postId = comment.postId;
      if (!commentsMap.has(postId)) {
        commentsMap.set(postId, []);
      }
      commentsMap.get(postId)?.push(comment);
    });

    return keys.map((key) => commentsMap.get(key) || []);
  }
}
