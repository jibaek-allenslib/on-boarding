import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserRepository } from '../../user/repository/user.repository';
import { UserRole } from '../../common/enums/user-role.enum';

/**
 * JWT 토큰 payload 인터페이스
 */
export interface JwtPayload {
  sub: string; // 사용자 ID
  email: string;
  role: UserRole;
}

/**
 * JWT 인증 전략
 *
 * 액세스 토큰을 검증하고 사용자 정보를 조회합니다.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly userRepository: UserRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  /**
   * JWT 토큰이 유효할 경우 호출되어 사용자 정보를 반환합니다.
   *
   * @param payload JWT 토큰에서 추출한 payload
   * @returns 사용자 정보 (password 제외)
   * @throws UnauthorizedException 사용자를 찾을 수 없는 경우
   */
  async validate(payload: JwtPayload) {
    const user = await this.userRepository.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
    }

    return user;
  }
}
