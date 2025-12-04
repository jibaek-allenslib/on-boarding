import { Connection, Edge } from '../dto/connection.dto';
import { PageInfoDto } from '../dto/page-info.dto';
import { PaginationDto } from '../dto/pagination.dto';

export abstract class ConnectionService<T, K extends PaginationDto> {
  private readonly DEFAULT_PAGE_SIZE = 10;
  private readonly DEFAULT_PAGE = 1;

  protected abstract getNodes(
    args: K & {
      skip?: number;
      take: number;
      cursor?: any;
    },
  ): Promise<T[]>;
  protected abstract getTotalCount(args: K): Promise<number>;
  protected abstract getCursor(item: T, args: K): any;

  static encode(value: string): string {
    return Buffer.from(value, 'utf8').toString('base64');
  }

  static decode(cursor: string): any {
    return Buffer.from(cursor, 'base64').toString('utf8');
  }

  private isOffsetPagination(args: K): boolean {
    return args.page !== undefined || args.perPage !== undefined;
  }

  async buildConnection(args: K): Promise<Connection<T>> {
    const isOffset = this.isOffsetPagination(args);
    const page = args.page ?? this.DEFAULT_PAGE;
    const perPage = args.perPage ?? this.DEFAULT_PAGE_SIZE;
    const first = args.first ?? this.DEFAULT_PAGE_SIZE;

    const items = await this.getNodes({
      ...args,
      skip: isOffset ? (page - 1) * perPage : undefined,
      take: isOffset ? perPage + 1 : first + 1,
      cursor:
        !isOffset && args.after
          ? JSON.parse(ConnectionService.decode(args.after))
          : undefined,
    });

    const totalCount = await this.getTotalCount(args);

    const edges: Edge<T>[] = items.map((item) => {
      const cursorObject = this.getCursor(item, args);
      const encodedCursor = ConnectionService.encode(
        JSON.stringify(cursorObject),
      );
      return {
        node: item,
        cursor: encodedCursor,
      };
    });

    const pageInfo: PageInfoDto = {
      hasNextPage: isOffset
        ? page * perPage < totalCount
        : items.length > first,
      nextCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
    };

    return {
      edges: isOffset ? edges.slice(0, perPage) : edges.slice(0, first),
      pageInfo,
      totalCount,
    };
  }
}
