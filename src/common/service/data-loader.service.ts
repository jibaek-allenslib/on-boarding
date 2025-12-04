import { Injectable, Scope } from '@nestjs/common';
import DataLoader = require('dataloader');

@Injectable({ scope: Scope.REQUEST })
export abstract class DataLoaderService<TKey, TValue> extends DataLoader<
  TKey,
  TValue | null
> {
  constructor() {
    super(
      async (keys: readonly TKey[]) => {
        const result = await this.batchLoad(keys);

        return result.map((result, index) => {
          if (result instanceof Error) {
            console.error(
              `${JSON.stringify(this.getCacheKey(keys[index]))} 로딩 실패`,
              result.message,
            );
            return null;
          }
          return result;
        });
      },
      {
        maxBatchSize: 100,
        cache: true,
        cacheKeyFn: (key: TKey) => this.getCacheKey(key),
      },
    );
  }

  protected getCacheKey(key: TKey): any {
    if (typeof key === 'object' && key !== null) {
      const sortedKeys = Object.keys(key).sort();
      const sortedObj = {} as any;
      sortedKeys.forEach((k) => {
        sortedObj[k] = key[k];
      });
      return sortedObj;
    }
    return key;
  }

  protected abstract batchLoad(
    keys: readonly TKey[],
  ): Promise<Array<TValue | Error | null>>;

  async loadManyAsMap(keys: TKey[]): Promise<Map<TKey, TValue>> {
    const results = await this.loadMany(keys);
    const resultMap = new Map<TKey, TValue>();

    keys.forEach((key, index) => {
      const result = results[index];
      if (result !== null && !(result instanceof Error)) {
        resultMap.set(key, result);
      }
    });

    return resultMap;
  }
}
