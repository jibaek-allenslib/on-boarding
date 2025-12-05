import { Post, Comment } from '@prisma/client';
import { PostDetailsResponseDto } from '../dto/post-details-response.dto';
import { UserRole } from '../../common/enums/user-role.enum';
import { UserWithoutPassword } from 'src/user/dto/user.result';

export class PostDetailMapper {
  static toDto(args: {
    post: Post;
    author: UserWithoutPassword;
    comments: Comment[];
    commentAuthorsMap: Map<string, UserWithoutPassword>;
  }): PostDetailsResponseDto {
    const { post, author, comments, commentAuthorsMap } = args;

    const postComments = comments.map((comment) => {
      const commentAuthor = commentAuthorsMap.get(comment.userId);
      if (!commentAuthor) {
        throw new Error(`Author for comment ${comment.id} not found`);
      }

      return {
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        author: {
          id: commentAuthor.id,
          email: commentAuthor.email,
          role: commentAuthor.role as UserRole,
          createdAt: commentAuthor.createdAt,
          updatedAt: commentAuthor.updatedAt,
        },
      };
    });

    return {
      id: post.id,
      title: post.title,
      content: post.content,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      author: {
        id: author.id,
        email: author.email,
        role: author.role as UserRole,
        createdAt: author.createdAt,
        updatedAt: author.updatedAt,
      },
      comments: postComments,
      commentCount: postComments.length,
    };
  }

  static fromDeepInclude(
    post: Post & {
      user: any;
      comments: (Comment & { user: any })[];
    },
  ): PostDetailsResponseDto {
    return {
      id: post.id,
      title: post.title,
      content: post.content,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      author: {
        id: post.user.id,
        email: post.user.email,
        role: post.user.role as UserRole,
        createdAt: post.user.createdAt,
        updatedAt: post.user.updatedAt,
      },
      comments: post.comments.map((comment) => ({
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        author: {
          id: comment.user.id,
          email: comment.user.email,
          role: comment.user.role as UserRole,
          createdAt: comment.user.createdAt,
          updatedAt: comment.user.updatedAt,
        },
      })),
      commentCount: post.comments.length,
    };
  }
}
