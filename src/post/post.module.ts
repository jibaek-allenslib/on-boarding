import { Module } from '@nestjs/common';
import { PostCreateService as PostCreateService } from './service/post-create.service';
import { PostCreateController } from './controller/post-create.controller';
import { PostRepository } from './repository/post.repository';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [PostCreateService, PostRepository],
  controllers: [PostCreateController],
})
export class PostModule {}
