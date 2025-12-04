import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class PostDto {
  @ApiProperty({
    description: '게시물 ID',
    example: 1,
  })
  @Expose()
  id: number;

  @ApiProperty({
    description: '게시물 제목',
    example: '게시물 제목입니다.',
  })
  @Expose()
  title: string;

  @ApiProperty({
    description: '게시물 내용',
    example: '게시물 내용입니다.',
  })
  @Expose()
  content: string;

  @ApiProperty({
    description: '생성일시',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: '수정일시',
  })
  @Expose()
  updatedAt: Date;

  @ApiProperty({
    description: '작성자 ID',
    example: 'uuid-string',
  })
  @Expose()
  userId: string;
}
