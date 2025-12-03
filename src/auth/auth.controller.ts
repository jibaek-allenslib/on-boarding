import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignupRequest } from './dto/signup.request';
import { LoginRequest } from './dto/login.request';
import { AuthResponse } from './dto/auth.response';
import { Public } from './decorators/public.decorator';

/**
 * 인증 컨트롤러
 *
 * 회원가입, 로그인, 로그아웃, 토큰 갱신, 사용자 정보 조회 엔드포인트를 제공합니다.
 */
@ApiTags('Auth')
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 회원가입
   *
   * @param dto 회원가입 요청 정보
   * @returns JWT 토큰
   */
  @Public()
  @Post('open-api/auth/signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '회원가입',
    description: '이메일과 비밀번호로 회원가입을 진행합니다.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: '회원가입 성공',
    type: AuthResponse,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: '이미 존재하는 이메일',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '유효하지 않은 입력값',
  })
  async signup(@Body() dto: SignupRequest): Promise<AuthResponse> {
    return this.authService.signup(dto);
  }

  /**
   * 로그인
   *
   * @param dto 로그인 요청 정보
   * @returns JWT 토큰
   */
  @Public()
  @Post('open-api/auth/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '로그인',
    description: '이메일과 비밀번호로 로그인을 진행합니다.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '로그인 성공',
    type: AuthResponse,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '이메일 또는 비밀번호가 일치하지 않음',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '유효하지 않은 입력값',
  })
  async login(@Body() dto: LoginRequest): Promise<AuthResponse> {
    return this.authService.login(dto);
  }
}
