import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
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
  @ApiOkResponse({ type: PostCreateResponse })
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
