import { OffsetPaginationDto } from './offset-pagination.dto';
import { IntersectionType, PartialType } from '@nestjs/swagger';
import { CursorPaginationDto } from './cursor-pagination.dto';

export class PaginationDto extends IntersectionType(
  PartialType(CursorPaginationDto),
  PartialType(OffsetPaginationDto),
) {
  constructor() {
    super();
    this.first = undefined;
    this.perPage = undefined;
    this.page = undefined;
  }
}
