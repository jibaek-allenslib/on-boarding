import { UserRole } from 'src/common/enums/user-role.enum';

/**
 * =========================
 * 데이터베이스 쿼리 결과 모음 DTO
 * =========================
 */

/**
 * 사용자 정보 조회 결과 (password 제외)
 */
export interface UserWithoutPassword {
  id: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 사용자 생성 데이터
 */
export interface CreateUserData {
  id: string;
  email: string;
  password: string;
  role: UserRole;
}
