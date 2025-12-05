import { Injectable } from '@nestjs/common';
import { DataLoaderService } from '../../common/service/data-loader.service';
import { UserRole } from '../../common/enums/user-role.enum';
import { UserWithoutPassword } from '../dto/user.result';
import { UserRepository } from '../repository/user.repository';

const UNKOWN_USER: UserWithoutPassword = {
  id: 'unknown',
  email: 'unknown@example.com',
  role: UserRole.USER,
  createdAt: new Date(),
  updatedAt: new Date(),
};

@Injectable()
export class UserDataLoader extends DataLoaderService<
  string,
  UserWithoutPassword
> {
  constructor(private readonly userRepository: UserRepository) {
    super();
  }

  protected async batchLoad(
    keys: readonly string[],
  ): Promise<Array<UserWithoutPassword>> {
    const users = await this.userRepository.findUsersByIds([...keys]);

    const usersMap = new Map(users.map((user) => [user.id, user]));

    for (const key of keys) {
      if (!usersMap.has(key)) {
        usersMap.set(key, UNKOWN_USER);
      }
    }

    return keys.map((key) => usersMap.get(key) || UNKOWN_USER); // 모든 키가 다 있다고 확신 불가
  }
}
