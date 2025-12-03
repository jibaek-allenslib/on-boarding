import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PostSearchController } from './post-search.controller';
import { SearchDirectService } from './service/search-direct.service';
import { SearchBuilderService } from './service/search-builder.service';
import { SearchRepositoryService } from './service/search-repository.service';
import { SearchCompositionService } from './service/search-composition.service';
import { SearchSpecificationService } from './service/search-specification.service';
import { SearchKyselyService } from './service/search-kysely.service';
import { PrismaSearchRepository } from './repository/prisma-search.repository';
import { ISearchRepository } from './repository/search.repository.interface';

/**
 * PostSearchModule
 *
 * @description 게시물 검색 기능을 제공하는 모듈입니다.
 * 6가지 다른 구현 방식의 서비스를 제공합니다.
 *
 * Providers:
 * - SearchDirectService: Direct Service Layer 방식
 * - SearchBuilderService: Builder 패턴 방식
 * - SearchRepositoryService: Repository 패턴 방식
 * - SearchCompositionService: Function Composition 방식
 * - SearchSpecificationService: Specification 패턴 방식
 * - SearchKyselyService: Kysely 확장 방식
 * - PrismaSearchRepository: ISearchRepository 구현체
 *
 * Repository 패턴 의존성 주입:
 * ISearchRepository 인터페이스에 PrismaSearchRepository 구현체를 바인딩합니다.
 * 이를 통해 SearchRepositoryService는 인터페이스에만 의존하게 됩니다.
 */
@Module({
  imports: [PrismaModule],
  controllers: [PostSearchController],
  providers: [
    // Direct Service
    SearchDirectService,

    // Builder Service
    SearchBuilderService,

    // Repository Service and its dependency
    SearchRepositoryService,
    {
      provide: 'ISearchRepository',
      useClass: PrismaSearchRepository,
    },
    // 또는 직접 인터페이스 토큰 사용:
    // {
    //   provide: ISearchRepository,
    //   useClass: PrismaSearchRepository,
    // },
    PrismaSearchRepository, // Repository 직접 주입을 위해서도 등록

    // Composition Service
    SearchCompositionService,

    // Specification Service
    SearchSpecificationService,

    // Kysely Service
    SearchKyselyService,
  ],
  exports: [
    SearchDirectService,
    SearchBuilderService,
    SearchRepositoryService,
    SearchCompositionService,
    SearchSpecificationService,
    SearchKyselyService,
  ],
})
export class PostSearchModule {}
