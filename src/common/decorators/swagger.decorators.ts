import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { PaginatedResponseDto } from '../dto/paginated-response.dto';
import { Connection, Edge } from '../dto/connection.dto';
import { PageInfoDto } from '../dto/page-info.dto';

export const ApiOkResponsePaginated = <DataDto extends Type<unknown>>(
  dataDto: DataDto,
) =>
  applyDecorators(
    ApiExtraModels(PaginatedResponseDto, dataDto),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(PaginatedResponseDto) },
          {
            properties: {
              nodes: {
                type: 'array',
                items: { $ref: getSchemaPath(dataDto) },
              },
            },
          },
        ],
      },
    }),
  );

export const ApiOkResponseCursorPaginated = <T extends Type<unknown>>(
  dataDto: T,
) =>
  applyDecorators(
    ApiExtraModels(Connection, Edge, PageInfoDto, dataDto),
    ApiOkResponse({
      schema: {
        allOf: [
          {
            $ref: getSchemaPath(Connection),
          },
          {
            properties: {
              edges: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    node: { $ref: getSchemaPath(dataDto) },
                    cursor: {
                      type: 'string',
                      example:
                        'eyJpZCI6NDYsInVwbG9hZEhpc3RvcnlJZCI6NywiY3JlYXRlZEF0IjoiMjAyNC0xMC0zMVQyMzo0Nj',
                    },
                  },
                },
              },
              pageInfo: { $ref: getSchemaPath(PageInfoDto) },
              totalCount: { type: 'number', example: 100 },
            },
          },
        ],
      },
    }),
  );
