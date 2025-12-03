import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

/**
 * 로그인 요청 DTO
 */
export class LoginRequest {
  @ApiProperty({
    description: '이메일 주소',
    example: 'user@example.com',
    required: true,
  })
  @IsEmail({}, { message: '유효한 이메일 형식이 아닙니다.' })
  @IsNotEmpty({ message: '이메일은 필수입니다.' })
  email: string;

  @ApiProperty({
    description: '비밀번호',
    example: 'password123',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: '비밀번호는 필수입니다.' })
  password: string;
}
