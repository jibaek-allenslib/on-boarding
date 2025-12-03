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
  constructor(
    protected readonly configService: ConfigService,
    @Optional() connectionUrl?: string,
  ) {
    console.log('prims');
    super({
      log: [{ emit: 'event', level: 'query' }],
      ...(connectionUrl && {
        datasources: {
          db: { url: connectionUrl },
        },
      }),
    });

    const appConfig = configService.getOrThrow<AppConfig>('app');

    if (appConfig.prismaLog) {
      this.$on('query' as never, (event: Prisma.QueryEvent) => {
        console.log('Query: ' + event.query);
        console.log(`Params: ${event.params}`);
        console.log('Time: ' + event.duration + 'ms');
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
