import { Module } from '@nestjs/common';
import { PostCreateService as PostCreateService } from './service/post-create.service';
import { PostCreateController } from './controller/post-create.controller';
import { PostListController } from './controller/post-list.controller';
import { PostRepository } from './repository/post.repository';
import { PostListCursorConnectionService } from './service/post-list-cursor.connection.service';
import { PostListOffsetConnectionService } from './service/post-list-offset.connection.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [
    PostCreateService,
    PostRepository,
    PostListCursorConnectionService,
    PostListOffsetConnectionService,
  ],
  controllers: [PostCreateController, PostListController],
})
export class PostModule {}
