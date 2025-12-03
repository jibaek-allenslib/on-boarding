import { Test, TestingModule } from '@nestjs/testing';
import { PostCreateService } from './post-create.service';

describe('PostService', () => {
  let service: PostCreateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostCreateService],
    }).compile();

    service = module.get<PostCreateService>(PostCreateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
