import { Prisma, Post } from '@prisma/client';

/**
 * 검색 결과 타입 정의
 * 
 * @description Post와 관련된 User, Comments를 포함한 타입
 */
export type PostWithRelations = Post & {
  user: {
    email: string;
  };
  comments: {
    id: number;
    content: string;
  }[];
};

/**
 * 검색 Repository 인터페이스
 *
 * @description 데이터 접근 로직을 완전히 캡슐화하는 Repository 패턴의 인터페이스입니다.
 * keyword로 제목, 내용, 작성자 이메일, 댓글 내용을 검색합니다.
 */
export interface ISearchRepository {
  /**
   * Prisma where 조건으로 게시물 검색
   *
   * @param where Prisma where 조건
   * @returns 검색된 게시물 목록 (User, Comments 포함)
   */
  findPostsWithRelations(
    where?: Prisma.PostWhereInput,
  ): Promise<PostWithRelations[]>;

  /**
   * 키워드로 전체 텍스트 검색
   *
   * @param keyword 검색 키워드
   * @returns 검색된 게시물 목록
   */
  searchByKeyword(keyword: string): Promise<PostWithRelations[]>;
}
