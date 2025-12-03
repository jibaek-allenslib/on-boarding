import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { uuidv7 } from 'uuidv7';
import { UserRepository } from '../user/repository/user.repository';
import { SignupRequest } from './dto/signup.request';
import { LoginRequest } from './dto/login.request';
import { AuthResponse } from './dto/auth.response';
import { UserRole } from '../common/enums/user-role.enum';
import { JwtPayload } from './strategies/jwt.strategy';

/**
 * 인증 서비스
 *
 * 회원가입, 로그인, 로그아웃, 토큰 갱신 등의 인증 관련 기능을 제공합니다.
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 회원가입
   *
   * @param dto 회원가입 요청 정보
   * @returns 생성된 사용자 정보 및 JWT 토큰
   * @throws ConflictException 이메일이 이미 존재하는 경우
   */
  async signup(dto: SignupRequest): Promise<AuthResponse> {
    const existingUser = await this.userRepository.findByEmail(dto.email);

    if (existingUser) {
      throw new ConflictException('이미 존재하는 이메일입니다.');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.userRepository.create({
      id: uuidv7(),
      email: dto.email,
      password: hashedPassword,
      role: UserRole.USER,
    });

    return this.generateTokens(user.id, user.email, user.role as UserRole);
  }

  /**
   * 로그인
   *
   * @param dto 로그인 요청 정보
   * @returns JWT 토큰
   * @throws UnauthorizedException 이메일 또는 비밀번호가 일치하지 않는 경우
   */
  async login(dto: LoginRequest): Promise<AuthResponse> {
    const user = await this.userRepository.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 일치하지 않습니다.',
      );
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 일치하지 않습니다.',
      );
    }

    return this.generateTokens(user.id, user.email, user.role as UserRole);
  }

  /**
   * JWT 토큰 생성 (액세스 토큰 + 리프레시 토큰)
   *
   * @param userId 사용자 ID
   * @param email 이메일
   * @param role 권한
   * @returns JWT 토큰
   */
  private async generateTokens(
    userId: string,
    email: string,
    role: UserRole,
  ): Promise<AuthResponse> {
    const payload: JwtPayload = {
      sub: userId,
      email,
      role,
    };

    const accessToken = this.jwtService.sign(
      payload as any,
      {
        secret:
          this.configService.get<string>('JWT_SECRET') || 'default-secret',
        expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') || '15m',
      } as any,
    );

    const refreshToken = this.jwtService.sign(
      payload as any,
      {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.getOrThrow<string>(
          'JWT_REFRESH_EXPIRES_IN',
        ),
      } as any,
    );

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    await this.userRepository.updateRefreshToken(userId, hashedRefreshToken);

    return {
      accessToken,
      refreshToken,
    };
  }
}
