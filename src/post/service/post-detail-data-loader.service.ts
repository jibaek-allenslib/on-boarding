import { Injectable } from '@nestjs/common';
import { Post } from '@prisma/client';
import { DataLoaderService } from '../../common/service/data-loader.service';
import { PostDetailsResponseDto } from '../dto/post-details-response.dto';
import { PostRepository } from '../repository/post.repository';
import { PostDetailMapper } from '../mapper/post-detail.mapper';
import { UserDataLoader } from '../../user/service/user-data-loader.service';
import { CommentDataLoader } from '../../comment/service/comment-data-loader.service';

const createMockPost = (id: number): Post => ({
  id,
  title: '존재하지 않는 게시물입니다.',
  content: '삭제되었거나 존재하지 않는 게시물입니다.',
  userId: 'unknown',
  createdAt: new Date(),
  updatedAt: new Date(),
  commentCount: 0,
});

@Injectable()
export class PostDetailDataLoaderService extends DataLoaderService<
  number,
  PostDetailsResponseDto
> {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly userDataLoader: UserDataLoader,
    private readonly commentDataLoader: CommentDataLoader,
  ) {
    super();
  }

  /**
   * keys.map((key) => this.commentDataLoader.load(key)),
   */
  protected async batchLoad(
    keys: readonly number[],
  ): Promise<Array<PostDetailsResponseDto>> {
    // 1. 게시물 조회
    const posts = await this.postRepository.findPostsByIds([...keys]);
    const postsMap = new Map(posts.map((post) => [post.id, post]));

    // 2. 모든 댓글 한 번에 조회
    //    - 아래 코드는 loadMany([...keys])와 동일한 동작
    //    - 같은 tick에서 모든 load()가 호출되므로 1회 batch 쿼리
    const allCommentsResults = await Promise.all(
      keys.map((key) => this.commentDataLoader.load(key)),
    );
    // 동일한 동작: await this.commentDataLoader.loadMany([...keys]);

    // 3. 댓글 결과를 Map으로 변환
    const commentsMap = new Map(
      keys.map((key, index) => [key, allCommentsResults[index] || []]),
    );

    // 4. 모든 userId 수집 (게시물 작성자 + 모든 댓글 작성자)
    const allUserIds = new Set<string>();
    posts.forEach((post) => allUserIds.add(post.userId));
    allCommentsResults.flat().forEach((comment) => {
      if (comment) allUserIds.add(comment.userId);
    });

    // 5. 모든 사용자 한 번에 조회 (1회 batch 호출)
    //    - loadManyAsMap()은 loadMany() 호출 후 Map으로 변환
    //    - await Promise.all(userIds.map((id) => this.userDataLoader.load(id))); 호출 후 Map으로 변환
    const usersMap = await this.userDataLoader.loadManyAsMap([...allUserIds]);

    // 6. 결과 조립 (동기적으로 처리 - 추가 await 없음)
    return keys.map((key) => {
      const post = postsMap.get(key) || createMockPost(key);
      const comments = commentsMap.get(key) || [];
      const author = usersMap.get(post.userId)!; // UserDataLoader guarantees return

      return PostDetailMapper.toDto({
        post,
        author,
        comments,
        commentAuthorsMap: usersMap,
      });
    });
  }
}
