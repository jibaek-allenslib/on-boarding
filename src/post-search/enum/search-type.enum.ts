/**
 * 검색 타입 Enum
 *
 * @description 검색할 필드를 지정하는 타입입니다.
 * 각 타입에 따라 다른 필드에서 검색이 수행됩니다.
 */
export enum SearchType {
  /**
   * 사용자 이메일에서 검색
   * @example user.email LIKE '%keyword%'
   */
  USER_EMAIL = 'USER_EMAIL',

  /**
   * 게시물 제목에서 검색
   * @example post.title LIKE '%keyword%'
   */
  POST_TITLE = 'POST_TITLE',

  /**
   * 게시물 내용에서 검색
   * @example post.content LIKE '%keyword%'
   */
  POST_CONTENT = 'POST_CONTENT',

  /**
   * 댓글 내용에서 검색
   * @example comment.content LIKE '%keyword%'
   */
  COMMENT_CONTENT = 'COMMENT_CONTENT',
}
