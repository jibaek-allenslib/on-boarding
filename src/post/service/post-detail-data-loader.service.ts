import { Injectable } from '@nestjs/common';
import { DataLoaderService } from '../../common/service/data-loader.service';
import { PostDetailsResponseDto } from '../dto/post-details-response.dto';
import { PostRepository } from '../repository/post.repository';
import { CommentRepository } from '../../comment/repository/comment.repository';
import { UserRepository } from '../../user/repository/user.repository';
import { PostDetailMapper } from '../mapper/post-detail.mapper';

@Injectable()
export class PostDetailDataLoaderService extends DataLoaderService<
  number,
  PostDetailsResponseDto
> {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly commentRepository: CommentRepository,
    private readonly userRepository: UserRepository,
  ) {
    super();
  }

  protected async batchLoad(
    keys: readonly number[],
  ): Promise<Array<PostDetailsResponseDto>> {
    // 1. 게시물 조회
    const posts = await this.postRepository.findPostsByIds([...keys]);
    const postsMap = new Map(posts.map((post) => [post.id, post]));

    // 2. 댓글 조회
    const comments = await this.commentRepository.findCommentsByPostIds([
      ...keys,
    ]);

    // 3. 사용자 ID 수집 (게시물 작성자 + 댓글 작성자)
    const userIds = new Set<string>();
    posts.forEach((post) => userIds.add(post.userId));
    comments.forEach((comment) => userIds.add(comment.userId));

    // 4. 사용자 조회 (Batch)
    const users = await this.userRepository.findUsersByIds(Array.from(userIds));
    const usersMap = new Map(users.map((user) => [user.id, user]));

    // 5. 데이터 조립
    return keys.map((key) => {
      const post = postsMap.get(key);
      if (!post) {
        throw new Error(`Post with ID ${key} not found`);
      }

      const postAuthor = usersMap.get(post.userId);
      if (!postAuthor) {
        throw new Error(`Author for post ${key} not found`);
      }

      const postComments = comments.filter((comment) => comment.postId === key);

      return PostDetailMapper.toDto({
        post,
        author: postAuthor,
        comments: postComments,
        commentAuthorsMap: usersMap,
      });
    });
  }
}
