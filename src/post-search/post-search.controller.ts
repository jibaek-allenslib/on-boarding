import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { SearchRequest } from './dto/search-request.dto';
import { SearchResponse } from './dto/search-response.dto';
import { SearchDirectService } from './service/search-direct.service';
import { SearchBuilderService } from './service/search-builder.service';
import { SearchRepositoryService } from './service/search-repository.service';
import { SearchCompositionService } from './service/search-composition.service';
import { SearchSpecificationService } from './service/search-specification.service';
import { SearchKyselyService } from './service/search-kysely.service';
import { TypedSearchBuilderService } from './service/typed-search-builder.service';
import { TypedSearchSpecificationService } from './service/typed-search-specification.service';
import { TypedSearchRequest } from './dto/typed-search-request.dto';

/**
 * 게시물 검색 Controller
 *
 * @description 8가지 다른 구현 방식으로 게시물을 검색할 수 있는 엔드포인트를 제공합니다.
 * 각 엔드포인트는 동일한 결과를 반환하지만, 내부 구현 방식이 다릅니다.
 *
 * 엔드포인트:
 * - POST /post-search/direct - Direct Service Layer 방식
 * - POST /post-search/builder - Builder 패턴 방식
 * - POST /post-search/repository - Repository 패턴 방식
 * - POST /post-search/composition - Function Composition 방식
 * - POST /post-search/specification - Specification 패턴 방식
 * - POST /post-search/kysely - Kysely 확장 방식
 * - POST /post-search/typed-builder - 타입별 검색 Builder 패턴 방식
 * - POST /post-search/typed-specification - 타입별 검색 Specification 패턴 방식
 */
@ApiTags('Post Search')
@Controller('post-search')
export class PostSearchController {
  constructor(
    private readonly searchDirectService: SearchDirectService,
    private readonly searchBuilderService: SearchBuilderService,
    private readonly searchRepositoryService: SearchRepositoryService,
    private readonly searchCompositionService: SearchCompositionService,
    private readonly searchSpecificationService: SearchSpecificationService,
    private readonly searchKyselyService: SearchKyselyService,
    private readonly typedSearchBuilderService: TypedSearchBuilderService,
    private readonly typedSearchSpecificationService: TypedSearchSpecificationService,
  ) {}

  @Post('direct')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Direct Service Layer 방식으로 게시물 검색',
    description: `서비스에서 직접 Prisma 쿼리를 작성하는 가장 단순한 방식입니다.
    
장점:
- 가장 직관적이고 이해하기 쉬움
- 추가 추상화 없이 빠른 프로토타이핑 가능
- 코드가 직선적이고 명확함

사용 시기:
- 빠른 프로토타이핑이 필요한 경우
- 단순한 CRUD 작업`,
  })
  @ApiOkResponse({ type: SearchResponse })
  async searchDirect(@Body() request: SearchRequest): Promise<SearchResponse> {
    return this.searchDirectService.search(request);
  }

  @Post('builder')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Builder 패턴 방식으로 게시물 검색',
    description: `SearchQueryBuilder를 사용하여 쿼리를 선언적으로 구성합니다.

장점:
- 선언적이고 읽기 쉬운 코드
- 타입 안전성 보장
- 재사용 가능한 PRESETS 제공

사용 시기:
- 복잡한 동적 쿼리가 필요한 경우
- 쿼리 조합 패턴이 자주 재사용되는 경우`,
  })
  @ApiOkResponse({ type: SearchResponse })
  async searchBuilder(@Body() request: SearchRequest): Promise<SearchResponse> {
    return this.searchBuilderService.search(request);
  }

  @Post('repository')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Repository 패턴 방식으로 게시물 검색',
    description: `데이터 접근 로직을 Repository로 완전히 캡슐화합니다.

장점:
- 명확한 계층 분리 (Service ← Repository ← DB)
- 테스트 시 Mock Repository로 쉽게 교체
- 데이터 소스 변경이 쉬움

사용 시기:
- 대규모 애플리케이션
- 명확한 계층 분리가 필요한 경우`,
  })
  @ApiOkResponse({ type: SearchResponse })
  async searchRepository(
    @Body() request: SearchRequest,
  ): Promise<SearchResponse> {
    return this.searchRepositoryService.search(request);
  }

  @Post('composition')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Function Composition 방식으로 게시물 검색',
    description: `작은 순수 함수들을 조합하여 쿼리를 생성합니다.

장점:
- 작은 순수 함수들로 구성되어 테스트 용이
- 함수 재사용성 높음
- 함수형 프로그래밍 스타일

사용 시기:
- 함수형 프로그래밍을 선호하는 팀
- 작은 단위의 테스트가 중요한 경우`,
  })
  @ApiOkResponse({ type: SearchResponse })
  async searchComposition(
    @Body() request: SearchRequest,
  ): Promise<SearchResponse> {
    return this.searchCompositionService.search(request);
  }

  @Post('specification')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Specification 패턴 방식으로 게시물 검색',
    description: `DDD의 Specification 패턴을 사용하여 비즈니스 규칙을 조합합니다.

장점:
- 비즈니스 규칙을 명시적 객체로 표현
- 규칙 조합이 직관적 (and, or, not)
- 복잡한 비즈니스 로직을 우아하게 표현

사용 시기:
- DDD를 따르는 대규모 애플리케이션
- 복잡한 비즈니스 규칙이 있는 도메인`,
  })
  @ApiOkResponse({ type: SearchResponse })
  async searchSpecification(
    @Body() request: SearchRequest,
  ): Promise<SearchResponse> {
    return this.searchSpecificationService.search(request);
  }

  @Post('kysely')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Kysely 확장 방식으로 게시물 검색',
    description: `Kysely 스타일의 쿼리 빌더를 사용합니다.

주의: prisma-extension-kysely 설치 필요
npm install prisma-extension-kysely kysely

장점:
- SQL에 가까운 직관적인 API
- 타입 안전성 보장
- 복잡한 쿼리 작성이 용이

사용 시기:
- 매우 복잡한 SQL 쿼리가 필요한 경우
- Prisma의 제약을 벗어나고 싶은 경우`,
  })
  @ApiOkResponse({ type: SearchResponse })
  async searchKysely(@Body() request: SearchRequest): Promise<SearchResponse> {
    return this.searchKyselyService.search(request);
  }

  @Post('typed-builder')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '타입별 검색 Builder 패턴 방식으로 게시물 검색',
    description: `SearchType을 지정하여 특정 필드에서만 검색합니다.

장점:
- 검색할 필드를 명시적으로 선택 가능 (USER_EMAIL, POST_TITLE, POST_CONTENT, COMMENT_CONTENT)
- 불필요한 필드 검색 제거로 성능 향상 가능
- 타입 안전성 보장
- 유연한 검색 조합

사용 시기:
- 사용자가 특정 필드에서만 검색하고 싶을 때
- 검색 범위를 제한하여 정확도를 높이고 싶을 때
- 검색 성능을 최적화하고 싶을 때

예시:
- searchTypes: [POST_TITLE, POST_CONTENT] → 제목과 내용에서만 검색
- searchTypes: [USER_EMAIL] → 작성자 이메일에서만 검색
- searchTypes: [] 또는 미지정 → 모든 필드에서 검색`,
  })
  @ApiOkResponse({ type: SearchResponse })
  async searchTypedBuilder(
    @Body() request: TypedSearchRequest,
  ): Promise<SearchResponse> {
    return this.typedSearchBuilderService.search(request);
  }

  @Post('typed-specification')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '타입별 검색 Specification 패턴 방식으로 게시물 검색',
    description: `SearchType별로 개별 Specification을 생성하고 조합합니다.

장점:
- Specification 패턴의 핵심 강점인 "규칙 조합"을 명확히 표현
- 각 SearchType별 비즈니스 규칙을 독립적인 객체로 캡슐화
- and(), or(), not() 메서드로 직관적인 규칙 조합
- 각 Specification을 독립적으로 테스트 가능
- 복잡한 검색 조건을 도메인 언어로 표현
- DDD(Domain-Driven Design) 친화적

사용 시기:
- DDD를 따르는 프로젝트에서 타입별 검색 구현
- 복잡한 비즈니스 규칙이 자주 변경되는 경우
- 검색 조건의 조합이 다양한 경우
- Builder 패턴보다 더 명시적인 규칙 표현이 필요한 경우

typed-builder와의 차이점:
- typed-builder: 쿼리 구성에 초점 (How to build query)
- typed-specification: 비즈니스 규칙 표현에 초점 (What business rules)

예시:
- searchTypes: [POST_TITLE, POST_CONTENT]
  → PostTitleSpecification.or(PostContentSpecification)
- searchTypes: [USER_EMAIL]
  → UserEmailSpecification
- searchTypes: [] 또는 미지정
  → 모든 Specification을 OR로 조합`,
  })
  @ApiOkResponse({ type: SearchResponse })
  async searchTypedSpecification(
    @Body() request: TypedSearchRequest,
  ): Promise<SearchResponse> {
    return this.typedSearchSpecificationService.search(request);
  }
}
