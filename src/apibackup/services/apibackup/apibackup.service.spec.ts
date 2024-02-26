import { Test, TestingModule } from '@nestjs/testing';
import { ApiBackupService } from './apibackup.service';

describe('ApiBackupService', () => {
  let service: ApiBackupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApiBackupService],
    }).compile();

    service = module.get<ApiBackupService>(ApiBackupService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
