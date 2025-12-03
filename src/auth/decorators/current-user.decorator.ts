import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserRole } from '../../common/enums/user-role.enum';

/**
 * 현재 인증된 사용자 정보
 */
export interface CurrentUserData {
  id: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 현재 인증된 사용자 정보를 가져오는 데코레이터
 *
 * @example
 * ```typescript
 * @Get('me')
 * getProfile(@CurrentUser() user: CurrentUserData) {
 *   return user;
 * }
 * ```
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): CurrentUserData => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
