import { Module, CacheModule } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import { ConfigModule } from '../config/config.module';

import * as redisStore from 'cache-manager-redis-store';
import { RedisCacheService } from './cache.service';

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: configService.environment.redis.host, 
        port: configService.environment.redis.port,
        ttl: configService.environment.redis.defaultTtl
      }),
    }),
  ],
  providers: [RedisCacheService],
  exports: [RedisCacheService]
})
export class RedisCacheModule {}
