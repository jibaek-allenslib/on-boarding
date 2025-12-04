import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { PageInfoDto } from './page-info.dto';

export class PaginatedResponseDto<T> {
  @ApiProperty({
    isArray: true,
    description: 'Nodes',
  })
  @Expose()
  nodes: T[];

  @ApiProperty({
    description: 'Total count',
  })
  @Expose()
  totalCount: number;

  @ApiProperty({
    description: 'Page info',
  })
  @Expose()
  pageInfo: PageInfoDto;
}
