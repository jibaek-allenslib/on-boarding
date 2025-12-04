import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class PageInfoDto {
  @Expose()
  @ApiProperty({
    type: String,
    description: '다음 페이지를위한 커서값',
    example:
      'NDYsInaswbG9hZEhpc3RvcnlJZCI6gdaNywiY3JlYXRlZEF0IjoiMjAyNC0xMC0zMVQyMgzob',
  })
  nextCursor: string | null;

  @Expose()
  @ApiProperty({
    type: Boolean,
    description: '조회가능한 다음페이지가 있는지에대한 여부',
  })
  hasNextPage: boolean;
}
