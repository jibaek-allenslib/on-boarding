import { Module } from '@nestjs/common';
import { PostCreateService as PostCreateService } from './service/post-create.service';
import { PostCreateController } from './controller/post-create.controller';
import { PostListController } from './controller/post-list.controller';
import { PostRepository } from './repository/post.repository';
import { PostListCursorConnectionService } from './service/post-list-cursor.connection.service';
import { PostListOffsetConnectionService } from './service/post-list-offset.connection.service';
import { PrismaModule } from 'src/prisma/prisma.module';

import { PostDetailController } from './controller/post-detail.controller';
import { PostDetailService } from './service/post-detail.service';
import { PostDetailDataLoaderService } from './service/post-detail-data-loader.service';

import { CommentRepository } from '../comment/repository/comment.repository';
import { UserRepository } from '../user/repository/user.repository';

@Module({
  imports: [PrismaModule],
  providers: [
    PostCreateService,
    PostRepository,
    CommentRepository,
    UserRepository,
    PostListCursorConnectionService,
    PostListOffsetConnectionService,
    PostDetailService,
    PostDetailDataLoaderService,
  ],
  controllers: [PostCreateController, PostListController, PostDetailController],
})
export class PostModule {}
