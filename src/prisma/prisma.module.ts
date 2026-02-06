import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ConsoleLoggerService } from 'src/common/logger/console-logger.service';

@Module({
  providers: [PrismaService, ConsoleLoggerService],
  exports: [PrismaService],
})
export class PrismaModule {}
