import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, BatchLog } from '@prisma/client';

@Injectable()
export class BatchLogRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createBatchLog(args: {
    batchName: string;
    metadata?: Record<string, any>;
  }): Promise<BatchLog> {
    return this.prisma.batchLog.create({
      data: {
        batchName: args.batchName,
        status: 'RUNNING',
        metadata: args.metadata ? JSON.stringify(args.metadata) : null,
      },
    });
  }

  async updateBatchLogSuccess(args: {
    id: number;
    metadata?: Record<string, any>;
  }): Promise<BatchLog> {
    return this.prisma.batchLog.update({
      where: { id: args.id },
      data: {
        status: 'SUCCESS',
        completedAt: new Date(),
        metadata: args.metadata ? JSON.stringify(args.metadata) : undefined,
      },
    });
  }

  async updateBatchLogFailure(args: {
    id: number;
    errorMessage: string;
    metadata?: Record<string, any>;
  }): Promise<BatchLog> {
    return this.prisma.batchLog.update({
      where: { id: args.id },
      data: {
        status: 'FAILURE',
        completedAt: new Date(),
        errorMessage: args.errorMessage,
        metadata: args.metadata ? JSON.stringify(args.metadata) : undefined,
      },
    });
  }

  async findRecentLogs(args: {
    batchName?: string;
    limit?: number;
  }): Promise<BatchLog[]> {
    return this.prisma.batchLog.findMany({
      where: args.batchName ? { batchName: args.batchName } : undefined,
      orderBy: { startedAt: 'desc' },
      take: args.limit ?? 10,
    });
  }
}
