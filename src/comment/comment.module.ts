import { Module } from '@nestjs/common';
import { CommentCreateService } from './service/comment-create.service';
import { CommentCreateController } from './controller/comment-create.controller';
import { CommentRepository } from './repository/comment.repository';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [CommentCreateService, CommentRepository],
  controllers: [CommentCreateController],
})
export class CommentModule {}
