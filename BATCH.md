# 배치 시스템 (BullMQ 기반)

Bull을 활용한 확장 가능한 배치 작업 시스템입니다. 1초마다 랜덤한 게시물에 랜덤한 댓글을 작성하는 기능을 포함하고 있으며, 새로운 배치 작업을 쉽게 추가할 수 있습니다.

## 주요 기능

- ✅ 여러 배치 작업을 스케줄링할 수 있는 확장 가능한 구조
- ✅ 각 배치 작업의 실행 시간, 성공 여부 자동 기록 (Wrapper/Proxy 패턴)
- ✅ 한 눈에 배치 목록을 확인할 수 있는 const 파일 구조
- ✅ BullMQ 기반의 안정적인 작업 큐 시스템

## 시스템 구조

```
src/batch/
├── batch.module.ts                    # 배치 모듈 설정
├── constants/
│   └── batch-definitions.const.ts    # 배치 작업 정의 (한 눈에 확인)
├── types/
│   └── batch-definition.type.ts      # 배치 정의 타입
├── processors/
│   └── batch.processor.ts            # BullMQ Processor (작업 실행)
├── services/
│   ├── batch-log.service.ts          # 배치 로그 관리 (Wrapper/Proxy)
│   └── random-comment.batch.service.ts # 랜덤 댓글 작성 배치
└── repository/
    └── batch-log.repository.ts       # 배치 로그 DB 작업
```

## 배치 목록

현재 등록된 배치 작업은 `src/batch/constants/batch-definitions.const.ts`에서 확인할 수 있습니다.

### 1. 랜덤 댓글 작성 배치 (random-comment)

```typescript
export const RANDOM_COMMENT_BATCH = {
  name: 'random-comment',
  schedule: '* * * * * *', // 매초 실행
  description: '랜덤한 게시물에 랜덤한 댓글을 작성하는 배치',
};
```

- **실행 주기**: 1초마다
- **동작**:
  1. 랜덤한 게시물 조회
  2. 랜덤한 사용자 조회
  3. 5개의 목 댓글 중 랜덤 선택
  4. 댓글 생성
- **목 댓글 데이터**:
  - "정말 좋은 글이네요! 많은 도움이 되었습니다."
  - "흥미로운 내용입니다. 더 자세히 알고 싶어요."
  - "공감합니다. 저도 비슷한 경험이 있어요."
  - "유익한 정보 감사합니다!"
  - "다음 글도 기대하겠습니다."

## 배치 로그

모든 배치 실행은 자동으로 `batch_logs` 테이블에 기록됩니다.

### 로그 정보
- `batchName`: 배치 작업 이름
- `status`: SUCCESS, FAILURE, RUNNING
- `startedAt`: 시작 시간
- `completedAt`: 완료 시간
- `errorMessage`: 에러 메시지 (실패 시)
- `metadata`: 추가 정보 (실행 시간 등)

### Wrapper/Proxy 패턴

`BatchLogService.executeBatchWithLogging()` 메서드가 자동으로:
1. 배치 시작 로그 생성 (상태: RUNNING)
2. 배치 작업 실행
3. 성공 시: 상태를 SUCCESS로 업데이트, 실행 시간 기록
4. 실패 시: 상태를 FAILURE로 업데이트, 에러 메시지 기록

## 새로운 배치 작업 추가하기

### 1. 배치 서비스 작성

`src/batch/services/` 디렉토리에 새로운 배치 서비스를 작성합니다.

```typescript
// src/batch/services/example.batch.service.ts
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ExampleBatchService {
  private readonly logger = new Logger(ExampleBatchService.name);

  async execute(): Promise<void> {
    // 배치 작업 로직 구현
    this.logger.log('예시 배치 실행');
  }
}
```

### 2. 배치 정의 추가

`src/batch/constants/batch-definitions.const.ts`에 배치 정의를 추가합니다.

```typescript
export const EXAMPLE_BATCH = {
  name: 'example-batch',
  schedule: '0 * * * * *', // 매분 실행
  description: '예시 배치 작업',
} as const;

export const BATCH_DEFINITIONS = [
  RANDOM_COMMENT_BATCH,
  EXAMPLE_BATCH, // 추가
] as const;
```

### 3. Processor에 case 추가

`src/batch/processors/batch.processor.ts`에 case를 추가합니다.

```typescript
switch (batchName) {
  case 'random-comment':
    await this.randomCommentBatchService.createRandomComment();
    break;
  case 'example-batch': // 추가
    await this.exampleBatchService.execute();
    break;
  default:
    throw new Error(`알 수 없는 배치 작업: ${batchName}`);
}
```

### 4. 모듈에 Provider 등록

`src/batch/batch.module.ts`의 providers에 새 서비스를 추가합니다.

```typescript
providers: [
  BatchLogRepository,
  BatchLogService,
  RandomCommentBatchService,
  ExampleBatchService, // 추가
  BatchProcessor,
],
```

## Cron 표현식

BullMQ는 6개 필드를 사용하는 Cron 표현식을 지원합니다:

```
* * * * * *
│ │ │ │ │ │
│ │ │ │ │ └─ 요일 (0-7, 0과 7은 일요일)
│ │ │ │ └─── 월 (1-12)
│ │ │ └───── 일 (1-31)
│ │ └─────── 시 (0-23)
│ └───────── 분 (0-59)
└─────────── 초 (0-59)
```

### 예시
- `* * * * * *`: 매초
- `0 * * * * *`: 매분
- `0 0 * * * *`: 매시간
- `0 0 0 * * *`: 매일 자정
- `0 0 12 * * *`: 매일 정오
- `0 0 0 * * 1`: 매주 월요일 자정

## 실행 방법

### 1. Redis 실행

```bash
# Docker를 사용하는 경우
docker run -d -p 6379:6379 redis:latest

# 또는 로컬에 설치된 Redis 실행
redis-server
```

### 2. 환경 변수 설정

`.env` 파일에 Redis 연결 정보를 설정합니다:

```env
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 3. 데이터베이스 마이그레이션

```bash
npx prisma migrate dev
```

### 4. 애플리케이션 실행

```bash
npm run start:dev
```

애플리케이션이 시작되면 `BatchModule.onModuleInit()`에서 자동으로 모든 배치 스케줄러가 등록됩니다.

## 로그 확인

애플리케이션 실행 시 다음과 같은 로그를 확인할 수 있습니다:

```
[BatchModule] 스케줄러 등록: random-comment (* * * * * *)
  └─ 랜덤한 게시물에 랜덤한 댓글을 작성하는 배치
[RandomCommentBatchService] 댓글 생성 완료 - 게시물 ID: 1, 사용자 ID: xxx
[BatchLogService] [random-comment] 배치 성공 (실행 시간: 45ms)
```

## 주의사항

- Redis가 실행 중이어야 배치 시스템이 정상 동작합니다
- 배치 스케줄을 변경한 후에는 애플리케이션을 재시작해야 합니다
- 배치 로그는 자동으로 누적되므로, 주기적으로 정리가 필요할 수 있습니다

## 확장 가능성

이 시스템은 다음과 같은 확장이 가능합니다:

- 배치 작업별로 다른 큐 사용
- 배치 작업 우선순위 설정
- 배치 작업 재시도 정책 설정
- 배치 작업 실행 결과 알림
- 배치 작업 모니터링 대시보드
