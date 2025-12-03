import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { SearchType } from '../enum/search-type.enum';

/**
 * 타입별 게시물 검색 요청 DTO
 *
 * @description 검색 타입을 지정하여 특정 필드에서만 검색할 수 있습니다.
 * searchTypes가 지정되지 않으면 모든 필드에서 검색합니다.
 */
export class TypedSearchRequest {
  @ApiProperty({
    description: '검색 키워드',
    example: 'test',
    required: false,
  })
  @IsString()
  @IsOptional()
  keyword?: string;

  @ApiProperty({
    description: '검색할 필드 타입 배열 (미지정 시 모든 필드 검색)',
    enum: SearchType,
    isArray: true,
    example: [SearchType.POST_TITLE, SearchType.POST_CONTENT],
    required: false,
  })
  @IsArray()
  @IsEnum(SearchType, { each: true })
  @IsOptional()
  searchTypes?: SearchType[];
}
