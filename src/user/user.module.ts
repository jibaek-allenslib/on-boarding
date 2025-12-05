import { Module } from '@nestjs/common';
import { UserRepository } from './repository/user.repository';
import { UserService } from './service/user.service';
import { UserController } from './controller/user.controller';
import { UserDataLoader } from './service/user-data-loader.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [PrismaModule],
  controllers: [UserController],
  providers: [UserService, UserRepository, UserDataLoader],
  exports: [UserRepository, UserDataLoader],
})
export class UserModule {}
