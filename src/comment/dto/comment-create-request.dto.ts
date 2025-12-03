import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CommentCreateRequest {
  @ApiProperty({ description: '댓글 내용', example: '첫 번째 댓글' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ description: '게시글 ID', example: 1 })
  @IsInt()
  @IsNotEmpty()
  postId: number;
}
