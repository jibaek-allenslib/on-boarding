import { Injectable, NotFoundException } from '@nestjs/common';
import { PostRepository } from '../repository/post.repository';
import { PostDetailsResponseDto } from '../dto/post-details-response.dto';
import { PostDetailMapper } from '../mapper/post-detail.mapper';

@Injectable()
export class PostDetailService {
  constructor(private readonly postRepository: PostRepository) {}

  async getPostDetails(postId: number): Promise<PostDetailsResponseDto> {
    const post = await this.postRepository.findPostWithDetails(postId);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return PostDetailMapper.fromDeepInclude(post);
  }
}
