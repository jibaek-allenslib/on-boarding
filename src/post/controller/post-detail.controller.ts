import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PostDetailService } from '../service/post-detail.service';
import { PostDetailsResponseDto } from '../dto/post-details-response.dto';
import { Public } from 'src/auth/decorators/public.decorator';
import { PostDetailDataLoaderService } from '../service/post-detail-data-loader.service';

@ApiTags('Post')
@Controller('posts')
export class PostDetailController {
  constructor(
    private readonly postDetailsService: PostDetailService,
    private readonly postDetailDataLoaderService: PostDetailDataLoaderService,
  ) {}

  @Public()
  @Get(':id')
  @ApiOperation({ summary: '게시물 상세 조회' })
  @ApiOkResponse({ type: PostDetailsResponseDto })
  async getPostDetails(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PostDetailsResponseDto> {
    return this.postDetailsService.getPostDetails(id);
  }

  @Public()
  @Get('data-loader/:id')
  @ApiOperation({ summary: '게시물 상세 조회 with Data Loader' })
  @ApiOkResponse({ type: PostDetailsResponseDto })
  async getPostDetailsWithDataLoader(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PostDetailsResponseDto> {
    return this.postDetailDataLoaderService.load(id);
  }
}
