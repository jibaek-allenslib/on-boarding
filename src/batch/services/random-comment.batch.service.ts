import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CommentRepository } from 'src/comment/repository/comment.repository';

// 5개의 목 댓글 데이터
const MOCK_COMMENTS = [
  '정말 좋은 글이네요! 많은 도움이 되었습니다.',
  '흥미로운 내용입니다. 더 자세히 알고 싶어요.',
  '공감합니다. 저도 비슷한 경험이 있어요.',
  '유익한 정보 감사합니다!',
  '다음 글도 기대하겠습니다.',
];

@Injectable()
export class RandomCommentBatchService {
  private readonly logger = new Logger(RandomCommentBatchService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly commentRepository: CommentRepository,
  ) {}

  /**
   * 랜덤한 게시물에 랜덤한 댓글을 작성합니다.
   */
  async createRandomComment(): Promise<void> {
    // 1. 랜덤 게시물 조회
    const randomPost = await this.getRandomPost();
    if (!randomPost) {
      this.logger.warn('게시물이 존재하지 않습니다.');
      return;
    }

    // 2. 랜덤 사용자 조회
    const randomUser = await this.getRandomUser();
    if (!randomUser) {
      this.logger.warn('사용자가 존재하지 않습니다.');
      return;
    }

    // 3. 랜덤 댓글 내용 선택
    const randomCommentContent = this.getRandomCommentContent();

    // 4. 댓글 생성
    await this.prisma.$transaction(async (tx) => {
      await this.commentRepository.createComment({
        tx,
        content: randomCommentContent,
        postId: randomPost.id,
        userId: randomUser.id,
      });
    });

    this.logger.log(
      `댓글 생성 완료 - 게시물 ID: ${randomPost.id}, 사용자 ID: ${randomUser.id}`,
    );
  }

  /**
   * 랜덤한 게시물을 조회합니다.
   */
  private async getRandomPost() {
    // 전체 게시물 수 조회
    const totalPosts = await this.prisma.post.count();
    if (totalPosts === 0) {
      return null;
    }

    // 랜덤 offset 계산
    const randomOffset = Math.floor(Math.random() * totalPosts);

    // 랜덤 게시물 조회
    const post = await this.prisma.post.findFirst({
      skip: randomOffset,
      take: 1,
    });

    return post;
  }

  /**
   * 랜덤한 사용자를 조회합니다.
   */
  private async getRandomUser() {
    // 전체 사용자 수 조회
    const totalUsers = await this.prisma.user.count();
    if (totalUsers === 0) {
      return null;
    }

    // 랜덤 offset 계산
    const randomOffset = Math.floor(Math.random() * totalUsers);

    // 랜덤 사용자 조회
    const user = await this.prisma.user.findFirst({
      skip: randomOffset,
      take: 1,
    });

    return user;
  }

  /**
   * 랜덤한 댓글 내용을 선택합니다.
   */
  private getRandomCommentContent(): string {
    const randomIndex = Math.floor(Math.random() * MOCK_COMMENTS.length);
    return MOCK_COMMENTS[randomIndex];
  }
}
