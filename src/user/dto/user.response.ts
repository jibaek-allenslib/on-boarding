import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../common/enums/user-role.enum';

/**
 * 사용자 정보 응답 DTO
 */
export class UserResponse {
  @ApiProperty({
    description: '사용자 ID (UUID v7)',
    example: '01234567-89ab-7def-0123-456789abcdef',
  })
  id: string;

  @ApiProperty({
    description: '이메일 주소',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: '사용자 권한',
    enum: UserRole,
    example: UserRole.USER,
  })
  role: UserRole;

  @ApiProperty({
    description: '생성 시각 (UTC)',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: '수정 시각 (UTC)',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}
