import { PageInfoDto } from './page-info.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class Edge<T> {
  @ApiProperty({
    description: 'node',
    type: 'object',
    // items: { oneOf: [{ $ref: getSchemaPath(StarDto) }] },
  })
  @Expose()
  node: T;

  @ApiProperty({
    description: 'cursor',
    example:
      'eyJpZCI6NDYsInVwbG9hZEhpc3RvcnlJZCI6NywiY3JlYXRlZEF0IjoiMjAyNC0xMC0zMVQyMzo0Nj',
  })
  @Expose()
  cursor: string;
}

export class Connection<T> {
  @ApiProperty({
    description: 'Edges',
    type: [Edge],
  })
  @Expose()
  edges: Edge<T>[];

  @ApiProperty({
    description: 'Page info',
    type: PageInfoDto,
  })
  @Expose()
  @Type(() => PageInfoDto)
  pageInfo: PageInfoDto;

  @ApiProperty({
    description: 'connection의 총 개수',
  })
  @Expose()
  totalCount?: number;
}
