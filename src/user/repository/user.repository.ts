import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole } from '../../common/enums/user-role.enum';
import { CreateUserData, UserWithoutPassword } from '../dto/user.result';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * ID로 사용자를 조회합니다 (password 제외).
   *
   * @param id 사용자 ID
   * @returns 사용자 정보 (password 제외) 또는 null
   */
  async findById(id: string): Promise<UserWithoutPassword | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return null;
    }

    return {
      ...user,
      role: user.role as UserRole,
    };
  }

  /**
   * 이메일로 사용자를 조회합니다 (password 포함).
   *
   * @param email 이메일
   * @returns 사용자 정보 또는 null
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * 새로운 사용자를 생성합니다.
   *
   * @param data 사용자 생성 데이터
   * @returns 생성된 사용자
   */
  async create(data: CreateUserData): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  /**
   * 사용자의 리프레시 토큰을 업데이트합니다.
   *
   * @param userId 사용자 ID
   * @param refreshToken 해시된 리프레시 토큰 (로그아웃 시 null)
   */
  async updateRefreshToken(
    userId: string,
    refreshToken: string | null,
  ): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken },
    });
  }

  /**
   * ID 목록으로 사용자들을 조회합니다 (password 제외).
   *
   * @param ids 사용자 ID 목록
   * @returns 사용자 정보 목록
   */
  async findUsersByIds(ids: string[]): Promise<UserWithoutPassword[]> {
    const users = await this.prisma.user.findMany({
      where: {
        id: { in: ids },
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return users.map((user) => ({
      ...user,
      role: user.role as UserRole,
    }));
  }
}
