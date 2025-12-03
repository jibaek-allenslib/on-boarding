import { ApiProperty } from '@nestjs/swagger';

/**
 * 사용자 정보 DTO
 */
export class UserInfoDto {
  @ApiProperty({
    description: '사용자 이메일',
    example: 'user@example.com',
  })
  email: string;

  constructor(args: { email: string }) {
    this.email = args.email;
  }
}

/**
 * 게시물 검색 결과 DTO
 * 
 * @description 검색된 게시물의 상세 정보를 포함합니다.
 * matchedFields는 어떤 필드에서 검색어가 매칭되었는지 표시합니다.
 */
export class PostSearchResultDto {
  @ApiProperty({
    description: '게시물 ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: '게시물 제목',
    example: '첫 번째 게시물',
  })
  title: string;

  @ApiProperty({
    description: '게시물 내용',
    example: '이것은 첫 번째 게시물의 내용입니다.',
  })
  content: string;

  @ApiProperty({
    description: '생성 일시 (UTC)',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: '작성자 정보',
    type: UserInfoDto,
  })
  user: UserInfoDto;

  @ApiProperty({
    description: '댓글 수',
    example: 5,
  })
  commentCount: number;

  @ApiProperty({
    description: '매칭된 필드 목록 (검색어가 발견된 필드)',
    example: ['postTitle', 'postContent'],
    isArray: true,
  })
  matchedFields: string[];

  constructor(args: {
    id: number;
    title: string;
    content: string;
    createdAt: Date;
    user: UserInfoDto;
    commentCount: number;
    matchedFields: string[];
  }) {
    this.id = args.id;
    this.title = args.title;
    this.content = args.content;
    this.createdAt = args.createdAt;
    this.user = args.user;
    this.commentCount = args.commentCount;
    this.matchedFields = args.matchedFields;
  }
}
