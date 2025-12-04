import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class OffsetPaginationDto {
  @ApiProperty({
    description: '가져올 데이터갯수',
    required: false,
  })
  @Transform(({ value }) => Number(value))
  @IsOptional()
  @IsNumber()
  @IsPositive()
  perPage: number = 10;

  @ApiProperty({
    description: '페이지',
    required: false,
  })
  @Transform(({ value }) => Number(value))
  @IsOptional()
  @IsNumber()
  @IsPositive()
  page: number = 1;

  @ApiProperty({
    description: '검색 키워드',
    required: false,
  })
  @IsOptional()
  @IsString()
  keyword?: string;
}
