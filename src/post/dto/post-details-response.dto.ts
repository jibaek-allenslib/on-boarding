import { ApiProperty } from '@nestjs/swagger';
import { UserResponse } from '../../user/dto/user.response';

export class CommentResponse {
  @ApiProperty({ description: '댓글 ID' })
  id: number;

  @ApiProperty({ description: '댓글 내용' })
  content: string;

  @ApiProperty({ description: '작성일' })
  createdAt: Date;

  @ApiProperty({ description: '수정일' })
  updatedAt: Date;

  @ApiProperty({ description: '댓글 작성자 정보' })
  author: UserResponse;
}

export class PostDetailsResponseDto {
  @ApiProperty({ description: '게시물 ID' })
  id: number;

  @ApiProperty({ description: '게시물 제목' })
  title: string;

  @ApiProperty({ description: '게시물 내용' })
  content: string;

  @ApiProperty({ description: '작성일' })
  createdAt: Date;

  @ApiProperty({ description: '수정일' })
  updatedAt: Date;

  @ApiProperty({ description: '게시물 작성자 정보' })
  author: UserResponse;

  @ApiProperty({ description: '댓글 목록', type: [CommentResponse] })
  comments: CommentResponse[];

  @ApiProperty({ description: '댓글 갯수' })
  commentCount: number;
}
