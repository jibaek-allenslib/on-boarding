import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from '../repository/user.repository';
import { UserResponse } from '../dto/user.response';

/**
 * 사용자 서비스
 *
 * 사용자 정보 조회 등의 기능을 제공합니다.
 */
@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * 사용자 정보 조회
   *
   * @param userId 사용자 ID
   * @returns 사용자 정보 (비밀번호 제외)
   * @throws UnauthorizedException 사용자를 찾을 수 없는 경우
   */
  async getMe(userId: string): Promise<UserResponse> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
    }

    return user;
  }
}
