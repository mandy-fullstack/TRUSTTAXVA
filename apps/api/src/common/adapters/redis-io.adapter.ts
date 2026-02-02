import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;

  async connectToRedis(): Promise<void> {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    const options = {
      keyPrefix: 'tt:socket:',
      tls:
        redisUrl.startsWith('rediss://') || redisUrl.includes('upstash.io')
          ? {}
          : undefined,
    };

    const pubClient = new Redis(redisUrl, options);
    const subClient = pubClient.duplicate();

    // ioredis connects automatically, but we can wait for ready state
    await Promise.all([
      pubClient.ping().catch((err) => {
        console.error('[RedisIoAdapter] Failed to connect pub client:', err);
        throw err;
      }),
      subClient.ping().catch((err) => {
        console.error('[RedisIoAdapter] Failed to connect sub client:', err);
        throw err;
      }),
    ]);

    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    server.adapter(this.adapterConstructor);
    return server;
  }
}
