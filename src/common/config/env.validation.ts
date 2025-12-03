import * as Joi from 'joi';

/**
 * 환경변수 검증 스키마
 *
 * 애플리케이션 시작 시 필수 환경변수가 설정되어 있는지 검증합니다.
 * 검증 실패 시 애플리케이션이 시작되지 않습니다.
 */
export const envValidationSchema = Joi.object({
  // Database
  DATABASE_URL: Joi.string().required().description('PostgreSQL 데이터베이스 URL'),

  // JWT
  JWT_SECRET: Joi.string().required().description('JWT 액세스 토큰 시크릿 키'),
  JWT_EXPIRES_IN: Joi.string()
    .default('15m')
    .description('JWT 액세스 토큰 유효기간 (예: 15m, 1h)'),
  JWT_REFRESH_SECRET: Joi.string()
    .required()
    .description('JWT 리프레시 토큰 시크릿 키'),
  JWT_REFRESH_EXPIRES_IN: Joi.string()
    .default('7d')
    .description('JWT 리프레시 토큰 유효기간 (예: 7d, 30d)'),

  // Server
  PORT: Joi.number().default(7885).description('서버 포트 번호'),

  // Node Environment
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development')
    .description('실행 환경'),
});
