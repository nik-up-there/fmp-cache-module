import { Injectable, Inject, CACHE_MANAGER } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { ConfigService } from '../config/config.service';

@Injectable()
export class RedisCacheService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    private configService: ConfigService,
  ) {}

  private defaultTtl = this.configService.environment.redis.defaultTtl;

  async set(key: string, value: any, ttl: number = this.defaultTtl): Promise<void> {
    return await this.cache.set(key, value, { ttl });
  }

  async get(key: string): Promise<any> {
    return await this.cache.get(key)
  }
  
  async invalidate(key: string): Promise<void> {
    return await this.cache.del(key);
  }
}
