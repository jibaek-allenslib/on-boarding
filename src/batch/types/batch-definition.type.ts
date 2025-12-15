/**
 * 배치 작업 정의 타입
 */
export interface BatchDefinition {
  /** 배치 작업 이름 */
  name: string;
  /** Cron 스케줄 표현식 */
  schedule: string;
  /** 실행할 함수 */
  fn: () => Promise<void>;
  /** 배치 설명 (선택) */
  description?: string;
}

/**
 * Cron 스케줄 표현식 예시:
 * - '* * * * * *' : 매초
 * - '0 * * * * *' : 매분
 * - '0 0 * * * *' : 매시간
 * - '0 0 0 * * *' : 매일 자정
 * - '0 0 12 * * *' : 매일 정오
 * - '0 0 0 * * 0' : 매주 일요일 자정
 */
