import { registerAs } from '@nestjs/config';

export interface AppConfig {
  prismaLog: boolean;
}

export default registerAs('app', () => ({
  prismaLog: process.env.PRISMA_LOG === 'true',
}));
