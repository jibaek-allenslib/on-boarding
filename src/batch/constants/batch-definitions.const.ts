import { BatchDefinition } from '../types/batch-definition.type';

/**
 * 배치 작업 목록
 *
 * 새로운 배치 작업을 추가하려면:
 * 1. BatchDefinition 형태로 배치를 정의
 * 2. BATCH_DEFINITIONS 배열에 추가
 * 3. batch.module.ts의 providers에 필요한 서비스 추가
 */

/**
 * 랜덤 댓글 작성 배치
 * - 1초마다 실행
 * - 랜덤한 게시물에 랜덤한 댓글 작성
 */
export const RANDOM_COMMENT_BATCH = {
  name: 'random-comment',
  schedule: '1 * * * * *', //
  description: '랜덤한 게시물에 랜덤한 댓글을 작성하는 배치',
} as const;

/**
 * 예시: 다른 배치 작업
 * - 필요에 따라 추가 가능
 */
// export const EXAMPLE_BATCH = {
//   name: 'example-batch',
//   schedule: '0 * * * * *', // 매분 실행
//   description: '예시 배치 작업',
// } as const;

/**
 * 전체 배치 작업 목록
 * - fn은 batch.processor.ts에서 주입됩니다
 */
export const BATCH_DEFINITIONS = [
  RANDOM_COMMENT_BATCH,
  // EXAMPLE_BATCH,
] as const;
