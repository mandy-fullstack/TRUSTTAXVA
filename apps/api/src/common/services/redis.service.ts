import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private client: Redis;

    onModuleInit() {
        const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

        this.client = new Redis(redisUrl, {
            // Namespacing is critical for multi-tenant or shared Redis instances
            keyPrefix: 'tt:',
            // Upstash requires TLS for the 'rediss' protocol, 
            // but if the user provided 'redis://' with --tls flag, 
            // we should handle it accordingly.
            tls: redisUrl.startsWith('rediss://') || redisUrl.includes('upstash.io') ? {} : undefined,
            maxRetriesPerRequest: 3,
            retryStrategy(times) {
                const delay = Math.min(times * 50, 2000);
                return delay;
            },
            reconnectOnError(err) {
                const targetError = 'READONLY';
                if (err.message.includes(targetError)) {
                    return true;
                }
                return false;
            }
        });

        this.client.on('connect', () => {
            console.log('✅ Connected to Redis');
        });

        this.client.on('error', (err) => {
            console.error('❌ Redis connection error:', err);
        });
    }

    async set(key: string, value: any, ttlSeconds?: number) {
        const strValue = JSON.stringify(value);
        if (ttlSeconds) {
            await this.client.set(key, strValue, 'EX', ttlSeconds);
        } else {
            await this.client.set(key, strValue);
        }
    }

    async get<T>(key: string): Promise<T | null> {
        const data = await this.client.get(key);
        if (!data) return null;
        try {
            return JSON.parse(data) as T;
        } catch (e) {
            return data as any;
        }
    }

    async del(key: string) {
        await this.client.del(key);
    }

    async getClient(): Promise<Redis> {
        return this.client;
    }

    onModuleDestroy() {
        this.client.disconnect();
    }
}
