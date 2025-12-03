# FanPlus On Boarding API

NestJS 기반 온보딩 서비스 백엔드 API

## 주요 기능

- JWT 기반 인증 시스템
- 이메일/비밀번호 회원가입 및 로그인
- 액세스 토큰 및 리프레시 토큰 관리
- Role 기반 권한 제어 (USER, ADMIN)
- Swagger API 문서화

## 환경 설정

### 환경 변수

`.env.example` 파일을 `.env`로 복사하고 다음 값들을 설정하세요:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/db_name"

# JWT
JWT_SECRET="your-secret-key-here"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="your-refresh-secret-key-here"
JWT_REFRESH_EXPIRES_IN="7d"

# Server
PORT=7885
```

### 데이터베이스 마이그레이션

```bash
# Prisma 마이그레이션 생성
npx prisma migrate dev --name init

# Prisma Client 생성
npx prisma generate
```

## API 엔드포인트

### 인증 API

#### 회원가입 (Public)
- **POST** `/open-api/auth/signup`
- 이메일과 비밀번호로 신규 회원 가입
- Response: `{ accessToken, refreshToken }`

#### 로그인 (Public)
- **POST** `/open-api/auth/login`
- 이메일과 비밀번호로 로그인
- Response: `{ accessToken, refreshToken }`

#### 로그아웃 (Protected)
- **POST** `/api/auth/logout`
- 현재 로그인한 사용자 로그아웃
- Header: `Authorization: Bearer {accessToken}`

#### 토큰 갱신 (Public)
- **POST** `/open-api/auth/refresh`
- 리프레시 토큰으로 새 액세스 토큰 발급
- Body: `{ refreshToken }`
- Response: `{ accessToken, refreshToken }`

#### 내 정보 조회 (Protected)
- **GET** `/api/user/me`
- 현재 로그인한 사용자 정보 조회
- Header: `Authorization: Bearer {accessToken}`
- Response: `{ id, email, role, createdAt, updatedAt }`

### API 접근 권한

- `/open-api/*` : 인증 불필요 (Public)
- `/api/*` : USER 이상 권한 필요 (Protected)

## 공통 코드

### UserRole Enum

**위치**: `src/common/enums/user-role.enum.ts`

```typescript
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}
```

### Public 데코레이터

**위치**: `src/auth/decorators/public.decorator.ts`

**사용법**: 인증이 필요 없는 엔드포인트에 적용

```typescript
@Public()
@Get('health')
healthCheck() {
  return { status: 'ok' };
}
```

### CurrentUser 데코레이터

**위치**: `src/auth/decorators/current-user.decorator.ts`

**사용법**: 현재 인증된 사용자 정보 가져오기

```typescript
@Get('me')
getProfile(@CurrentUser() user: CurrentUserData) {
  return user;
}
```

**반환값**:
```typescript
{
  id: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}
```

## Swagger 문서

서버 실행 후 다음 주소에서 API 문서를 확인할 수 있습니다:

```
http://localhost:7885/swagger-ui/index.html
```

### Swagger 인증 설정

1. Swagger UI 우측 상단 "Authorize" 버튼 클릭
2. 로그인 API로 받은 `accessToken` 입력
3. "Authorize" 클릭
4. 이후 모든 Protected API 테스트 가능

## 에러 응답

모든 API는 에러 발생 시 다음 형식으로 응답합니다:

```json
{
  "statusCode": 400,
  "message": "에러 메시지",
  "error": "Bad Request"
}
```

### 주요 에러 코드

| Status Code | 설명 |
|------------|------|
| 400 | 잘못된 요청 (유효하지 않은 입력값) |
| 401 | 인증 실패 (토큰 없음, 만료, 잘못된 토큰) |
| 403 | 권한 없음 |
| 409 | 중복 (이미 존재하는 이메일) |

## 개발 가이드

### 새 API 추가 시

1. **Public API**: `@Public()` 데코레이터 추가
2. **Protected API**: 데코레이터 없이 작성 (기본적으로 인증 필요)
3. **현재 사용자 정보 필요 시**: `@CurrentUser()` 데코레이터 사용
4. **Swagger 문서화**: `@ApiOperation()`, `@ApiResponse()` 추가

### DTO 작성 규칙

- Request DTO: `~Request.ts` (예: `SignupRequest`)
- Response DTO: `~Response.ts` (예: `AuthResponse`)
- Validation: `class-validator` 데코레이터 사용
- Description: Swagger `@ApiProperty()` 필수

## 보안

- 비밀번호는 bcrypt로 해시화 (salt rounds: 10)
- 액세스 토큰: 짧은 유효기간 (기본 15분)
- 리프레시 토큰: 긴 유효기간 (기본 7일), DB에 해시화하여 저장
- JWT Secret은 환경변수로 관리
