import { ApiProperty } from '@nestjs/swagger';

export class CommentCreateResponse {
  @ApiProperty({ description: '생성된 댓글 ID', example: 1 })
  commentId: number;

  constructor(args: { commentId: number }) {
    this.commentId = args.commentId;
  }
}
