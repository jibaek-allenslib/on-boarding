import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

/**
 * 게시물 검색 요청 DTO
 *
 * @description keyword를 통해 게시물의 제목, 내용, 작성자 이메일, 댓글 내용을 검색합니다.
 * keyword가 포함된 게시물을 OR 조건으로 검색하여 반환합니다.
 */
export class SearchRequest {
  @ApiProperty({
    description: '검색 키워드 (제목, 내용, 작성자 이메일, 댓글 내용에서 검색)',
    example: 'test',
    required: false,
  })
  @IsString()
  @IsOptional()
  keyword?: string;
}
