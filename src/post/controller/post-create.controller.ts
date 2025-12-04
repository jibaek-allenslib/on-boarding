import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { PostCreateRequest } from '../dto/post-create-request.dto';
import { PostCreateResponse } from '../dto/post-create-response.dto';
import { PostCreateService } from '../service/post-create.service';
import {
  CurrentUser,
  CurrentUserData,
} from '../../auth/decorators/current-user.decorator';

@ApiTags('Post')
@Controller('post')
export class PostCreateController {
  constructor(private readonly postCreateService: PostCreateService) {}
  @Post()
  @ApiBearerAuth()
  @ApiOperation({
    summary: '게시물 생성',
    description: '새 게시물을 생성합니다.',
  })
  @ApiCreatedResponse({
    type: PostCreateResponse,
    description: '게시물 생성 성공',
  })
  @ApiUnauthorizedResponse({ description: '인증이 필요합니다.' })
  async createPost(
    @Body() request: PostCreateRequest,
    @CurrentUser() user: CurrentUserData,
  ): Promise<PostCreateResponse> {
    return await this.postCreateService.createPost({
      request: request,
      userId: user.id,
    });
  }
}
