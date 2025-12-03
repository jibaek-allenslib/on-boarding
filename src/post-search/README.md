# Post Search Module

게시물 검색 기능을 6가지 다른 구현 방식으로 제공하는 모듈입니다.

## 개요

이 모듈은 동일한 검색 기능을 6가지 다른 설계 패턴/아키텍처 스타일로 구현하여, 각 방식의 장단점과 적용 시나리오를 비교할 수 있도록 합니다.

## 검색 대상 필드

- **User.email**: 사용자 이메일
- **Post.title**: 게시물 제목
- **Post.content**: 게시물 내용
- **Comment.content**: 댓글 내용

## API 엔드포인트

모든 엔드포인트는 동일한 Request/Response 형식을 사용합니다.

### 공통 Request Body

```typescript
{
  "keyword": "검색어",           // 모든 필드 검색
  "userEmail": "user@example.com", // 사용자 이메일 검색
  "postTitle": "제목",           // 게시물 제목 검색
  "postContent": "내용",         // 게시물 내용 검색
  "commentContent": "댓글"       // 댓글 내용 검색
}
```

모든 필드는 선택적(optional)이며, 제공된 필드에 대해서만 검색을 수행합니다.

### 공통 Response Body

```typescript
{
  "posts": [
    {
      "id": 1,
      "title": "게시물 제목",
      "content": "게시물 내용",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "user": {
        "email": "user@example.com"
      },
      "commentCount": 5,
      "matchedFields": ["postTitle", "userEmail"]  // 매칭된 필드 목록
    }
  ],
  "total": 10,
  "executionTime": 45.5,  // 실행 시간 (ms)
  "method": "builder"     // 사용된 방식
}
```

## 6가지 구현 방식

### 1. Direct Service Layer (`POST /post-search/direct`)

서비스에서 직접 Prisma 쿼리를 작성하는 가장 단순한 방식입니다.

**장점:**
- 가장 직관적이고 이해하기 쉬움
- 추가 추상화 없이 빠른 프로토타이핑 가능
- 코드가 직선적이고 명확함

**단점:**
- 재사용성이 낮음
- 복잡한 쿼리 로직이 서비스에 혼재
- 테스트가 어려움 (Prisma 의존성)

**사용 시기:**
- 빠른 프로토타이핑이 필요한 경우
- 단순한 CRUD 작업
- 일회성 쿼리

**파일 위치:**
- `services/search-direct.service.ts`

---

### 2. Builder Pattern (`POST /post-search/builder`)

SearchQueryBuilder를 사용하여 쿼리를 선언적으로 구성합니다.

**장점:**
- 선언적이고 읽기 쉬운 코드
- 타입 안전성 보장
- 재사용 가능한 PRESETS 제공
- 조건의 조합이 명확함

**단점:**
- 빌더 클래스 유지보수 필요
- 단순한 쿼리에는 오버엔지니어링일 수 있음

**사용 시기:**
- 복잡한 동적 쿼리가 필요한 경우
- 쿼리 조합 패턴이 자주 재사용되는 경우
- 타입 안전성이 중요한 경우

**파일 위치:**
- `builders/search-query.builder.ts`
- `services/search-builder.service.ts`

**사용 예시:**
```typescript
const builder = new SearchQueryBuilder();
const where = builder
  .filterByKeyword('test')
  .filterByUserEmail('user@example.com')
  .build();

// 또는 PRESET 사용
const where = SearchQueryBuilder.PRESETS.FULL_TEXT_SEARCH('test');
```

---

### 3. Repository Pattern (`POST /post-search/repository`)

데이터 접근 로직을 Repository로 완전히 캡슐화합니다.

**장점:**
- 데이터 접근 로직 완전 캡슐화
- 계층 분리 명확 (Service ← Repository ← DB)
- 테스트 시 Mock 구현체로 쉽게 교체 가능
- 데이터 소스 변경이 쉬움 (Prisma → TypeORM 등)

**단점:**
- 추가적인 인터페이스와 구현체 필요
- 간단한 CRUD에는 오버엔지니어링
- 보일러플레이트 코드 증가

**사용 시기:**
- 대규모 애플리케이션
- 명확한 계층 분리가 필요한 경우
- 테스트 용이성이 중요한 경우
- 데이터 소스 변경 가능성이 있는 경우

**파일 위치:**
- `repositories/search.repository.interface.ts`
- `repositories/prisma-search.repository.ts`
- `services/search-repository.service.ts`

**아키텍처:**
```
Controller → Service → ISearchRepository → PrismaSearchRepository → DB
```

---

### 4. Function Composition (`POST /post-search/composition`)

작은 순수 함수들을 조합하여 쿼리를 생성합니다.

**장점:**
- 작은 순수 함수들로 구성되어 테스트 용이
- 함수 재사용성 높음
- 함수형 프로그래밍 스타일
- 각 함수가 독립적이고 명확함
- 조합이 유연함

**단점:**
- 함수형 패러다임에 익숙하지 않으면 이해 어려움
- 많은 작은 함수들 관리 필요
- OOP 중심 코드베이스와 스타일 불일치 가능

**사용 시기:**
- 함수형 프로그래밍을 선호하는 팀
- 작은 단위의 테스트가 중요한 경우
- 조건 조합이 복잡하고 다양한 경우
- 순수 함수의 이점을 활용하고 싶은 경우

**파일 위치:**
- `services/search-composition.service.ts`

**사용 예시:**
```typescript
// 작은 함수들을 조합
const filters = [
  createKeywordFilter('test'),
  createUserEmailFilter('user@example.com'),
  createPostTitleFilter('title')
];
const where = combineFilters(filters);

// 또는 파이프라인
const where = createSearchPipeline(request);
```

---

### 5. Specification Pattern (`POST /post-search/specification`)

DDD의 Specification 패턴을 사용하여 비즈니스 규칙을 조합합니다.

**장점:**
- 비즈니스 규칙을 명시적인 객체로 표현
- 규칙의 조합이 직관적 (AND, OR, NOT)
- 복잡한 비즈니스 로직을 도메인 언어로 표현
- 재사용성과 테스트 용이성
- 각 규칙을 독립적으로 테스트 가능

**단점:**
- 많은 클래스 파일 필요 (각 규칙마다)
- 간단한 조건에는 오버엔지니어링
- 러닝 커브가 높음
- DDD에 익숙하지 않으면 이해 어려움

**사용 시기:**
- DDD를 따르는 대규모 애플리케이션
- 복잡한 비즈니스 규칙이 있는 도메인
- 규칙의 조합이 동적으로 변경되는 경우
- 도메인 전문가와 협업이 중요한 경우

**파일 위치:**
- `specifications/specification.interface.ts`
- `specifications/post-specifications.ts`
- `services/search-specification.service.ts`

**사용 예시:**
```typescript
// 비즈니스 규칙을 자연어처럼 조합
const spec = new PostTitleSpecification('test')
  .or(new PostContentSpecification('test'))
  .and(new UserEmailSpecification('admin'));

const where = spec.toPrismaQuery();

// 또는 CompositeOrSpecification 사용
const specs = [
  new PostTitleSpecification('test'),
  new UserEmailSpecification('user@example.com')
];
const spec = new CompositeOrSpecification(specs);
```

---

### 6. Kysely Extension (`POST /post-search/kysely`)

Kysely 스타일의 타입 안전한 쿼리 빌더를 사용합니다.

**주의: 외부 라이브러리 설치 필요**
```bash
npm install prisma-extension-kysely kysely
```

**장점:**
- SQL에 가까운 직관적인 API
- 타입 안전성 보장 (TypeScript)
- 복잡한 쿼리 작성이 용이
- Prisma보다 더 세밀한 제어 가능
- 조건부 쿼리 빌딩이 깔끔함

**단점:**
- 외부 라이브러리 의존성 추가
- Prisma 생태계 벗어남
- 팀원들이 Kysely에 익숙해야 함
- 추가 설정 및 타입 생성 필요

**사용 시기:**
- 매우 복잡한 SQL 쿼리가 필요한 경우
- Prisma의 제약을 벗어나고 싶은 경우
- 기존 Kysely 사용 경험이 있는 팀

**파일 위치:**
- `services/search-kysely.service.ts`

**사용 예시 (실제 Kysely 사용 시):**
```typescript
import { kysely } from 'prisma-extension-kysely';

const xprisma = this.prismaService.$extends(kysely());

let query = xprisma.$kysely
  .selectFrom('posts')
  .leftJoin('users', 'posts.userId', 'users.id')
  .select(['posts.id', 'posts.title', 'users.email']);

if (keyword) {
  query = query.where((eb) =>
    eb.or([
      eb('posts.title', 'ilike', `%${keyword}%`),
      eb('posts.content', 'ilike', `%${keyword}%`)
    ])
  );
}

const results = await query.execute();
```

---

## 비교표

| 방식 | 복잡도 | 재사용성 | 테스트 용이성 | 타입 안전성 | 러닝 커브 | 적합한 프로젝트 규모 |
|------|--------|----------|---------------|-------------|-----------|---------------------|
| Direct Service | 낮음 | 낮음 | 낮음 | 중간 | 낮음 | 소규모 |
| Builder | 중간 | 높음 | 중간 | 높음 | 중간 | 중~대규모 |
| Repository | 중간 | 높음 | 높음 | 높음 | 중간 | 대규모 |
| Composition | 중간 | 높음 | 높음 | 중간 | 높음 | 중~대규모 |
| Specification | 높음 | 매우 높음 | 높음 | 높음 | 높음 | 대규모 (DDD) |
| Kysely | 중간 | 중간 | 중간 | 높음 | 중간 | 중~대규모 |

## 성능 비교

각 엔드포인트의 응답에 `executionTime` 필드가 포함되어 있어, 실제 환경에서 성능을 비교할 수 있습니다.

일반적으로:
- Direct Service: 가장 빠름 (추가 레이어 없음)
- Builder/Composition/Kysely: 비슷한 성능
- Repository: 약간의 오버헤드 (인터페이스 레이어)
- Specification: 가장 많은 객체 생성으로 약간의 오버헤드

**주의:** 실제 성능 차이는 미미하며, 대부분의 경우 네트워크와 DB 쿼리 시간이 지배적입니다.

## 어떤 방식을 선택해야 할까?

### 프로젝트 초기 / 프로토타이핑
→ **Direct Service** 또는 **Builder**

### 중소규모 프로젝트 / 빠른 개발
→ **Builder** 또는 **Composition**

### 대규모 프로젝트 / 엔터프라이즈
→ **Repository** 또는 **Specification** (DDD 사용 시)

### 복잡한 SQL 필요
→ **Kysely**

### 함수형 프로그래밍 선호
→ **Composition**

## 디렉토리 구조

```
src/post-search/
├── dto/
│   ├── search-request.dto.ts          # 검색 요청 DTO
│   ├── search-response.dto.ts         # 검색 응답 DTO
│   └── post-search-result.dto.ts      # 게시물 검색 결과 DTO
├── services/
│   ├── search-direct.service.ts       # Direct Service 방식
│   ├── search-builder.service.ts      # Builder 패턴 방식
│   ├── search-repository.service.ts   # Repository 패턴 방식
│   ├── search-composition.service.ts  # Function Composition 방식
│   ├── search-specification.service.ts# Specification 패턴 방식
│   └── search-kysely.service.ts       # Kysely 확장 방식
├── repositories/
│   ├── search.repository.interface.ts # Repository 인터페이스
│   └── prisma-search.repository.ts    # Prisma Repository 구현체
├── specifications/
│   ├── specification.interface.ts     # Specification 인터페이스
│   └── post-specifications.ts         # 구체적인 Specification들
├── builders/
│   └── search-query.builder.ts        # 쿼리 빌더
├── post-search.controller.ts          # Controller
├── post-search.module.ts              # Module 설정
└── README.md                          # 이 문서
```

## 사용 예시

### cURL

```bash
# Direct Service 방식
curl -X POST http://localhost:3000/post-search/direct \
  -H "Content-Type: application/json" \
  -d '{"keyword": "test"}'

# Builder 패턴 방식
curl -X POST http://localhost:3000/post-search/builder \
  -H "Content-Type: application/json" \
  -d '{"postTitle": "첫 번째", "userEmail": "user@example.com"}'

# Repository 패턴 방식
curl -X POST http://localhost:3000/post-search/repository \
  -H "Content-Type: application/json" \
  -d '{"commentContent": "댓글"}'

# Composition 방식
curl -X POST http://localhost:3000/post-search/composition \
  -H "Content-Type: application/json" \
  -d '{"keyword": "test"}'

# Specification 패턴 방식
curl -X POST http://localhost:3000/post-search/specification \
  -H "Content-Type: application/json" \
  -d '{"postContent": "내용"}'

# Kysely 방식
curl -X POST http://localhost:3000/post-search/kysely \
  -H "Content-Type: application/json" \
  -d '{"keyword": "test"}'
```

## 테스트

각 방식은 독립적으로 테스트 가능하도록 설계되었습니다.

```typescript
// Direct Service 테스트
describe('SearchDirectService', () => {
  it('should search posts by keyword', async () => {
    const result = await service.search({ keyword: 'test' });
    expect(result.posts).toBeDefined();
    expect(result.method).toBe('direct');
  });
});

// Repository 테스트 (Mock 사용)
describe('SearchRepositoryService', () => {
  it('should use repository to search', async () => {
    const mockRepo = {
      searchByKeyword: jest.fn().mockResolvedValue([]),
    };
    const service = new SearchRepositoryService(mockRepo);
    // ...
  });
});
```

## 확장 가능성

이 모듈은 다음과 같이 확장할 수 있습니다:

1. **페이지네이션 추가**
   - SearchRequest에 `page`, `limit` 필드 추가
   - 각 서비스에서 `skip`, `take` 적용

2. **정렬 기능 추가**
   - SearchRequest에 `sortBy`, `sortOrder` 필드 추가
   - 동적으로 `orderBy` 조건 생성

3. **필터 추가**
   - 날짜 범위 필터
   - 작성자 필터
   - 카테고리 필터 등

4. **Full Text Search 최적화**
   - PostgreSQL의 `to_tsvector`, `to_tsquery` 활용
   - 검색 인덱스 추가

5. **캐싱**
   - Redis를 사용한 검색 결과 캐싱
   - 자주 검색되는 키워드 캐싱

## 참고 자료

- [Prisma Documentation](https://www.prisma.io/docs)
- [NestJS Documentation](https://docs.nestjs.com)
- [Builder Pattern](https://refactoring.guru/design-patterns/builder)
- [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)
- [Specification Pattern](https://en.wikipedia.org/wiki/Specification_pattern)
- [Kysely](https://kysely.dev/)
- [Domain-Driven Design](https://www.domainlanguage.com/ddd/)

## 라이센스

이 코드는 학습 및 비교 목적으로 작성되었습니다.
