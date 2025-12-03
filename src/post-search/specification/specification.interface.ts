import { Prisma } from '@prisma/client';

/**
 * Specification 인터페이스
 * 
 * @description DDD(Domain-Driven Design)의 Specification 패턴을 구현합니다.
 * 비즈니스 규칙을 재사용 가능하고 조합 가능한 객체로 표현합니다.
 * 
 * 장점:
 * - 비즈니스 규칙을 명시적인 객체로 표현
 * - 규칙의 조합이 직관적 (AND, OR, NOT)
 * - 복잡한 비즈니스 로직을 도메인 언어로 표현
 * - 재사용성과 테스트 용이성
 * 
 * 단점:
 * - 많은 클래스 파일 필요 (각 규칙마다)
 * - 간단한 조건에는 오버엔지니어링
 * - 러닝 커브가 높음
 * 
 * 사용 시기:
 * - 복잡한 비즈니스 규칙이 있는 경우
 * - DDD를 따르는 프로젝트
 * - 규칙의 조합이 자주 변경되는 경우
 */
export interface ISpecification<T> {
  /**
   * 주어진 엔티티가 specification을 만족하는지 확인
   * 
   * @param entity 검증할 엔티티
   * @returns 만족 여부
   */
  isSatisfiedBy(entity: T): boolean;

  /**
   * Prisma where 조건으로 변환
   * 
   * @returns Prisma where 조건
   */
  toPrismaQuery(): Prisma.PostWhereInput;

  /**
   * 다른 specification과 AND 조합
   */
  and(other: ISpecification<T>): ISpecification<T>;

  /**
   * 다른 specification과 OR 조합
   */
  or(other: ISpecification<T>): ISpecification<T>;

  /**
   * NOT 조건
   */
  not(): ISpecification<T>;
}

/**
 * Specification 추상 클래스
 * 
 * @description 공통 조합 로직을 구현합니다.
 */
export abstract class Specification<T> implements ISpecification<T> {
  abstract isSatisfiedBy(entity: T): boolean;
  abstract toPrismaQuery(): Prisma.PostWhereInput;

  and(other: ISpecification<T>): ISpecification<T> {
    return new AndSpecification(this, other);
  }

  or(other: ISpecification<T>): ISpecification<T> {
    return new OrSpecification(this, other);
  }

  not(): ISpecification<T> {
    return new NotSpecification(this);
  }
}

/**
 * AND Specification
 */
export class AndSpecification<T> extends Specification<T> {
  constructor(
    private readonly left: ISpecification<T>,
    private readonly right: ISpecification<T>,
  ) {
    super();
  }

  isSatisfiedBy(entity: T): boolean {
    return (
      this.left.isSatisfiedBy(entity) && this.right.isSatisfiedBy(entity)
    );
  }

  toPrismaQuery(): Prisma.PostWhereInput {
    return {
      AND: [this.left.toPrismaQuery(), this.right.toPrismaQuery()],
    };
  }
}

/**
 * OR Specification
 */
export class OrSpecification<T> extends Specification<T> {
  constructor(
    private readonly left: ISpecification<T>,
    private readonly right: ISpecification<T>,
  ) {
    super();
  }

  isSatisfiedBy(entity: T): boolean {
    return (
      this.left.isSatisfiedBy(entity) || this.right.isSatisfiedBy(entity)
    );
  }

  toPrismaQuery(): Prisma.PostWhereInput {
    return {
      OR: [this.left.toPrismaQuery(), this.right.toPrismaQuery()],
    };
  }
}

/**
 * NOT Specification
 */
export class NotSpecification<T> extends Specification<T> {
  constructor(private readonly spec: ISpecification<T>) {
    super();
  }

  isSatisfiedBy(entity: T): boolean {
    return !this.spec.isSatisfiedBy(entity);
  }

  toPrismaQuery(): Prisma.PostWhereInput {
    return {
      NOT: this.spec.toPrismaQuery(),
    };
  }
}
