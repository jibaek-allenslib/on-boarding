import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { BatchLogService } from '../services/batch-log.service';
import { RandomCommentBatchService } from '../services/random-comment.batch.service';
import { Logger } from '@nestjs/common';

/**
 * BullMQ 배치 Processor
 * - 스케줄된 배치 작업을 처리합니다
 * - 자동으로 배치 로그를 기록합니다
 */
@Processor('batch')
export class BatchProcessor extends WorkerHost {
  private readonly logger = new Logger(BatchProcessor.name);

  constructor(
    private readonly batchLogService: BatchLogService,
    private readonly randomCommentBatchService: RandomCommentBatchService,
  ) {
    super();
  }

  async process(job: Job<{ batchName: string }>): Promise<void> {
    const { batchName } = job.data;

    this.logger.log(`배치 작업 시작: ${batchName}`);

    // 배치 로그 Wrapper를 사용하여 자동으로 로그 기록
    await this.batchLogService.executeBatchWithLogging({
      batchName,
      fn: async () => {
        // 배치 이름에 따라 적절한 배치 서비스 실행
        switch (batchName) {
          case 'random-comment':
            await this.randomCommentBatchService.createRandomComment();
            break;
          // 다른 배치 작업 추가 시 case 문 추가
          // case 'example-batch':
          //   await this.exampleBatchService.execute();
          //   break;
          default:
            throw new Error(`알 수 없는 배치 작업: ${batchName}`);
        }
      },
      metadata: {
        jobId: job.id,
      },
    });

    this.logger.log(`배치 작업 완료: ${batchName}`);
  }
}
