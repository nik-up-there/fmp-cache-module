<p align="center">
  <img src="../../images/fast_modular_project.png" />
</p>

# Module - Redis within NestJS

Author: Nik_up_there
Date: 04/04/2021

## Description

This module allows you to use Redis cache within your NestJS backend.

## Quick start :zap:

### I/Set up : General

#### Step 1
First you will need to add an environment variable in the .env file (at the root of the whole projet) :
<pre>
REDIS_PORT = 6379
</pre>

#### Step 2
Then to have a Redis instance running in local, you will need to add a "cache" block inside the dockerfile (at the root of the whole projet) :
<pre>
services:
  db:
    ...

  back:
    ...
    
  cache:
    image: "redis:alpine"
    ports:
      - "${REDIS_PORT}:${REDIS_PORT}"

  app:
    ...
</pre>
Then run 
<pre>
docker-compose up -d
</pre>
to restart the containers including the new Redis container


### II/Set up : Back-end

#### Step 1
Install needed modules with the two following commands (at the backend root): 
<pre>
npm install cache-manager
npm install cache-manager-redis-store
</pre>

#### Step 2
Add the following variables to `src/environments/environment.dev.ts` :
<pre>
    export const environment = {
        ...,
        redis: {
            host: process.env.LOCAL_IP,
            port: process.env.REDIS_PORT,
            defaultTtl: 86400
        }
    };
</pre>
N.B.: To go staging and/or prod, put the host and the port of the production Redis instance

#### Step 3
Add cache folder to the shared folder (`src/shared/`)
This folder has two files in it : `cache.module.ts` and `cache.service.ts`.
The file `cache.service.ts` contains the methods used to access and modify the cache.
Among those methods, we have : 
- set : that allows you to to set a cached value. If you specify 
- get : to retrieve the value (N.B.: after the TTL (in second), the value cached under a given key won't be able anymore and get will return undefined)
- invalidate : to delete a key (for instance if before the end of the TTL, you know that the value stored is not correct, you can invalidate the cached data earlier than the TTL would do)


### III/Using cache : Back-end

This part of the quick start will show you how to use this module inside services and controlers through your backend
As an example we will create two new endpoints in the users controler. 
Thoses endpoint are useless but it will show you how to use the cache module we juste created.

#### Step 1 :
In `src/api/users/users.module.ts`, add the following code : 
<pre>
...
import { RedisCacheModule } from '../../shared/cache/cache.module';

@Module({
  imports: [
    ...,
    RedisCacheModule
  ],
  ...
})
export class UsersModule {}
</pre>
Thanks to that, you will be able to use the Redis cache module inside the user module (in the controler and the service file)

#### Step 2 :
In `src/api/users/users.controler.ts`, add the following route : 
<pre>
    @Get('test-cache')
    async testCache(@Param() params, @Res() res) {
        // trying to fetch the value from cache
        let valueCached = await this.redisCacheService.get("testKey")

        if (Boolean(valueCached)) {
            // case where cache contains the value : we just return it 

            res.status(HttpStatus.OK).send({ count: valueCached });
        } else {
            // case where cache did not contains the value  : we fetch it, then save it to cache and return it

            // BEGIN => this code fragment simulate something that takes time to get 
            // (i.e. fetching from an external API or filtering and processing huge amount of data)
            await this.sleep(1000);
            valueCached = 345;
            // END

            // Saving the fetched value to cache for next time
            this.redisCacheService.set("testKey", 345)

            res.status(HttpStatus.OK).send({ count: valueCached });
        }
    }

    @Get('invalidate-cache')
    async invalidateCache(@Param() params, @Res() res) {
        let valueCached = await this.redisCacheService.invalidate("testKey")
        res.status(HttpStatus.OK).send({ count: valueCached });
    }

</pre>
