import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
  Optional,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, PrismaClient } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';
import { AppConfig } from 'src/common/app.config';
import { ConsoleLoggerService } from 'src/common/logger/console-logger.service';

// transaction을 받을 때 tx: PrismaTransaction 으로 타입 지정
// 인자로 받은 PrismaClient에서 특정 메서드들을 제외한 타입 정의 (connect, disconnect 등 사용불가)
export type PrismaTransaction = Omit<
  PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  /**
   * 쿼리의 ?? 플레이스홀더를 실제 파라미터 값으로 치환하여 실행 가능한 SQL을 반환합니다
   * @param query SQL 쿼리 문자열 (?? 플레이스홀더 포함)
   * @param params JSON 배열 형식의 파라미터 문자열
   * @returns 파라미터가 치환된 실행 가능한 SQL 문자열
   */
  private formatQueryWithParams(query: string, params: string): string {
    try {
      const paramValues = JSON.parse(params) as unknown[];
      let formattedQuery = query;

      for (const param of paramValues) {
        formattedQuery = formattedQuery.replace('?', () => {
          if (param === null || param === undefined) {
            return 'NULL';
          } else if (typeof param === 'string') {
            // 싱글 쿼트 이스케이핑
            return `'${param.replace(/'/g, "''")}'`;
          } else if (typeof param === 'number' || typeof param === 'boolean') {
            return String(param);
          } else if (param instanceof Date) {
            return `'${param.toISOString()}'`;
          } else if (typeof param === 'object') {
            return `'${JSON.stringify(param).replace(/'/g, "''")}'`;
          }
          return String(param);
        });
      }

      return formattedQuery;
    } catch (error) {
      // JSON 파싱 실패 시 원본 반환
      return `${query} -- Params: ${params}`;
    }
  }

  constructor(
    protected readonly configService: ConfigService,
    private readonly logger: ConsoleLoggerService,
    @Optional() connectionUrl?: string,
  ) {
    super({
      log: [{ emit: 'event', level: 'query' }],
      ...(connectionUrl && {
        datasources: {
          db: { url: connectionUrl },
        },
      }),
    });

    const appConfig = configService.getOrThrow<AppConfig>('app');

    // Prisma 쿼리 로그를 구조화된 형태로 출력합니다
    this.logger.setContext('PrismaService');

    if (appConfig.prismaLog) {
      this.$on('query' as never, (event: Prisma.QueryEvent) => {
        const formattedQuery = this.formatQueryWithParams(
          event.query,
          event.params,
        );
        this.logger.debug(`${formattedQuery}\n[Duration: ${event.duration}ms]`);
      });
    }
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
