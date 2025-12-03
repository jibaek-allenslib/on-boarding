import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
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
  @ApiOkResponse({ type: CommentCreateResponse })
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
