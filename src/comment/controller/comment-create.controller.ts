import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CommentCreateService } from '../service/comment-create.service';
import { CommentCreateResponse } from '../dto/comment-create-response.dto';
import { CommentCreateRequest } from '../dto/comment-create-request.dto';
import {
  CurrentUser,
  CurrentUserData,
} from '../../auth/decorators/current-user.decorator';

@ApiTags('Comment')
@Controller('comment')
export class CommentCreateController {
  constructor(private readonly commentCreateService: CommentCreateService) {}
  @Post()
  @ApiBearerAuth()
  @ApiOperation({
    summary: '댓글 생성',
    description: '게시물에 새 댓글을 생성합니다.',
  })
  @ApiCreatedResponse({
    type: CommentCreateResponse,
    description: '댓글 생성 성공',
  })
  @ApiUnauthorizedResponse({ description: '인증이 필요합니다.' })
  async createComment(
    @Body() request: CommentCreateRequest,
    @CurrentUser() user: CurrentUserData,
  ): Promise<CommentCreateResponse> {
    return await this.commentCreateService.createComment({
      request: request,
      userId: user.id,
    });
  }
}
