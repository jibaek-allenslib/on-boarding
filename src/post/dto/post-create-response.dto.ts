import { ApiProperty } from '@nestjs/swagger';

export class PostCreateResponse {
  @ApiProperty({
    example: 1,
    description: '생성된 포스트의 고유 ID',
  })
  id: number;

  constructor(args: { id: number }) {
    this.id = args.id;
  }
}
