import { Module, OnModuleInit } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';

// Services
import { BatchLogService } from './services/batch-log.service';
import { RandomCommentBatchService } from './services/random-comment.batch.service';

// Processors
import { BatchProcessor } from './processors/batch.processor';

// Repository
import { BatchLogRepository } from './repository/batch-log.repository';

// Constants
import { BATCH_DEFINITIONS } from './constants/batch-definitions.const';

// Other Modules
import { PrismaModule } from 'src/prisma/prisma.module';
import { CommentModule } from 'src/comment/comment.module';

@Module({
  imports: [
    // BullMQ 큐 등록
    BullModule.registerQueue({
      name: 'batch',
    }),
    ConfigModule,
    PrismaModule,
    CommentModule,
  ],
  providers: [
    // Repository
    BatchLogRepository,
    // Services
    BatchLogService,
    RandomCommentBatchService,
    // Processors
    BatchProcessor,
  ],
  exports: [BatchLogService],
})
export class BatchModule implements OnModuleInit {
  constructor(
    @InjectQueue('batch') private readonly batchQueue: Queue,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 모듈 초기화 시 모든 배치 스케줄러를 등록합니다.
   */
  async onModuleInit() {
    // 기존 반복 작업 제거 (재시작 시 중복 방지)
    await this.batchQueue.obliterate({ force: true });

    // 각 배치 정의에 대해 스케줄러 등록
    for (const batch of BATCH_DEFINITIONS) {
      await this.batchQueue.add(
        batch.name,
        { batchName: batch.name },
        {
          repeat: {
            pattern: batch.schedule,
          },
          removeOnComplete: 100, // 완료된 작업 100개까지만 보관
          removeOnFail: 100, // 실패한 작업 100개까지만 보관
        },
      );

      console.log(
        `[BatchModule] 스케줄러 등록: ${batch.name} (${batch.schedule})`,
      );
      if (batch.description) {
        console.log(`  └─ ${batch.description}`);
      }
    }
  }
}
