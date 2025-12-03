import { Controller, Get, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserService } from '../service/user.service';
import { UserResponse } from '../dto/user.response';
import {
  CurrentUser,
  CurrentUserData,
} from '../../auth/decorators/current-user.decorator';

/**
 * 사용자 컨트롤러
 *
 * 사용자 정보 조회 엔드포인트를 제공합니다.
 */
@ApiTags('User')
@Controller('api/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * 현재 사용자 정보 조회
   *
   * @param user 현재 인증된 사용자
   * @returns 사용자 정보
   */
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '내 정보 조회',
    description: '현재 로그인한 사용자의 정보를 조회합니다.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '사용자 정보 조회 성공',
    type: UserResponse,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '인증되지 않은 사용자',
  })
  async getMe(@CurrentUser() user: CurrentUserData): Promise<UserResponse> {
    return this.userService.getMe(user.id);
  }
}
