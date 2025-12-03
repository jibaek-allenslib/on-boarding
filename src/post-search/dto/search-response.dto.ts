import { ApiProperty } from '@nestjs/swagger';
import { PostSearchResultDto } from './post-search-result.dto';

/**
 * 게시물 검색 응답 DTO
 * 
 * @description 검색 결과와 메타데이터를 포함합니다.
 * executionTime은 각 구현 방식의 성능 비교를 위해 포함됩니다.
 */
export class SearchResponse {
  @ApiProperty({
    description: '검색된 게시물 목록',
    type: [PostSearchResultDto],
  })
  posts: PostSearchResultDto[];

  @ApiProperty({
    description: '전체 검색 결과 수',
    example: 10,
  })
  total: number;

  @ApiProperty({
    description: '쿼리 실행 시간 (밀리초)',
    example: 45.5,
  })
  executionTime: number;

  @ApiProperty({
    description: '사용된 검색 방식',
    example: 'builder',
  })
  method: string;

  constructor(args: {
    posts: PostSearchResultDto[];
    total: number;
    executionTime: number;
    method: string;
  }) {
    this.posts = args.posts;
    this.total = args.total;
    this.executionTime = args.executionTime;
    this.method = args.method;
  }
}
