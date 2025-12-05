import { Module } from '@nestjs/common';
import { CommentCreateService } from './service/comment-create.service';
import { CommentCreateController } from './controller/comment-create.controller';
import { CommentRepository } from './repository/comment.repository';
import { CommentDataLoader } from './service/comment-data-loader.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CommentCreateController],
  providers: [CommentCreateService, CommentRepository, CommentDataLoader],
  exports: [CommentRepository, CommentDataLoader],
})
export class CommentModule {}
