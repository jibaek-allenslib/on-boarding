import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class PostCreateRequest {
  @ApiProperty({ description: '게시물 제목', example: '첫 번째 게시물' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: '게시물 내용',
    example: '이것은 첫 번째 게시물의 내용입니다.',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}
