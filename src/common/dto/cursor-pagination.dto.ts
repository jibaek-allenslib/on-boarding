import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CursorPaginationDto {
  @ApiProperty({
    description: 'after(cursor) 이후 가져올 데이터갯수',
    required: false,
    default: 10,
  })
  @Transform(({ value }) => Number(value ?? 10))
  @IsOptional()
  @IsNumber()
  @Expose()
  first: number = 10;

  @ApiProperty({
    description: 'cursor',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Expose()
  after?: string;

  @ApiProperty({
    description: '검색 키워드',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Expose()
  keyword?: string;

  // 이전 페이지 탐색해야하는 경우 before, last 추가해야함
}
