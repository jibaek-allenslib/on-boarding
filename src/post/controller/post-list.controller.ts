import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Post } from '@prisma/client';
import { Connection } from 'src/common/dto/connection.dto';
import { CursorPaginationDto } from 'src/common/dto/cursor-pagination.dto';
import { OffsetPaginationDto } from 'src/common/dto/offset-pagination.dto';
import { PaginatedResponseDto } from 'src/common/dto/paginated-response.dto';
import {
  ApiOkResponseCursorPaginated,
  ApiOkResponsePaginated,
} from 'src/common/decorators/swagger.decorators';
import { PostDto } from '../dto/post.dto';
import { Public } from 'src/auth/decorators/public.decorator';
import { PostListCursorConnectionService } from '../service/post-list-cursor.connection.service';
import { PostListOffsetConnectionService } from '../service/post-list-offset.connection.service';

@ApiTags('Post')
@Controller('posts')
export class PostListController {
  constructor(
    private readonly cursorService: PostListCursorConnectionService,
    private readonly offsetService: PostListOffsetConnectionService,
  ) {}

  @Get('cursor')
  @Public()
  @ApiOperation({ summary: 'Cursor 기반 게시물 목록 조회' })
  @ApiOkResponseCursorPaginated(PostDto)
  async listWithCursor(
    @Query() query: CursorPaginationDto,
  ): Promise<Connection<Post>> {
    return this.cursorService.buildConnection(query);
  }

  @Get('offset')
  @Public()
  @ApiOperation({ summary: 'Offset 기반 게시물 목록 조회' })
  @ApiOkResponsePaginated(PostDto)
  async listWithOffset(
    @Query() query: OffsetPaginationDto,
  ): Promise<PaginatedResponseDto<PostDto>> {
    const connection = await this.offsetService.buildConnection(query);

    return {
      nodes: connection.edges.map((edge) => edge.node as unknown as PostDto),
      totalCount: connection.totalCount,
      pageInfo: connection.pageInfo,
    };
  }
}
