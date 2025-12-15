import { Injectable, Logger } from '@nestjs/common';
import { BatchLogRepository } from '../repository/batch-log.repository';
import { BatchLog } from '@prisma/client';

@Injectable()
export class BatchLogService {
  private readonly logger = new Logger(BatchLogService.name);

  constructor(private readonly batchLogRepository: BatchLogRepository) {}

  /**
   * 배치 작업을 Wrapper로 실행하여 자동으로 로그를 기록합니다.
   */
  async executeBatchWithLogging<T>(args: {
    batchName: string;
    fn: () => Promise<T>;
    metadata?: Record<string, any>;
  }): Promise<T> {
    const startTime = Date.now();
    let batchLog: BatchLog | null = null;

    try {
      // 배치 로그 시작 기록
      batchLog = await this.batchLogRepository.createBatchLog({
        batchName: args.batchName,
        metadata: args.metadata,
      });

      this.logger.log(
        `[${args.batchName}] 배치 시작 (로그 ID: ${batchLog.id})`,
      );

      // 실제 배치 작업 실행
      const result = await args.fn();

      // 실행 시간 계산
      const executionTime = Date.now() - startTime;

      // 배치 로그 성공 기록
      await this.batchLogRepository.updateBatchLogSuccess({
        id: batchLog.id,
        metadata: {
          ...args.metadata,
          executionTimeMs: executionTime,
        },
      });

      this.logger.log(
        `[${args.batchName}] 배치 성공 (실행 시간: ${executionTime}ms)`,
      );

      return result;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      if (batchLog) {
        // 배치 로그 실패 기록
        await this.batchLogRepository.updateBatchLogFailure({
          id: batchLog.id,
          errorMessage,
          metadata: {
            ...args.metadata,
            executionTimeMs: executionTime,
          },
        });
      }

      this.logger.error(
        `[${args.batchName}] 배치 실패 (실행 시간: ${executionTime}ms): ${errorMessage}`,
      );

      throw error;
    }
  }

  /**
   * 특정 배치의 최근 실행 로그를 조회합니다.
   */
  async getRecentLogs(args: {
    batchName?: string;
    limit?: number;
  }): Promise<BatchLog[]> {
    return this.batchLogRepository.findRecentLogs(args);
  }
}
