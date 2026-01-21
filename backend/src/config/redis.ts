/**
 * Redis Configuration and Connection Manager
 * Used for caching, rate limiting, and session management
 * FULLY OPTIONAL - Backend works without Redis
 */

import { createClient, RedisClientType } from 'redis';

let redisClient: RedisClientType | null = null;
let redisEnabled = false;
let connectionAttempted = false;

/**
 * Check if Redis should be used
 */
function isRedisEnabled(): boolean {
    // Check environment flag
    if (process.env.REDIS_ENABLED === 'false') {
        return false;
    }
    
    // In production, Redis should be explicitly enabled
    if (process.env.NODE_ENV === 'production' && process.env.REDIS_ENABLED !== 'true') {
        return false;
    }
    
    // In development, Redis is optional (default: disabled to avoid errors)
    if (process.env.NODE_ENV === 'development' && process.env.REDIS_ENABLED !== 'true') {
        return false;
    }
    
    return true;
}

/**
 * Connect to Redis (OPTIONAL)
 */
export async function connectRedis(): Promise<RedisClientType | null> {
    // If already attempted connection, return existing client or null
    if (connectionAttempted) {
        return redisClient;
    }
    
    connectionAttempted = true;
    
    // Check if Redis is enabled
    if (!isRedisEnabled()) {
        console.log('ℹ️  Redis disabled (set REDIS_ENABLED=true to enable)');
        return null;
    }

    if (redisClient?.isOpen) {
        return redisClient;
    }

    const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

    try {
        redisClient = createClient({
            url: REDIS_URL,
            socket: {
                connectTimeout: 5000, // 5 second timeout
                reconnectStrategy: false // Disable automatic reconnection
            }
        });

        // Suppress error logging after initial connection failure
        let errorLogged = false;
        redisClient.on('error', (err: Error) => {
            if (!errorLogged) {
                console.error('Redis connection error:', err.message);
                errorLogged = true;
            }
        });

        redisClient.on('ready', () => {
            console.log('✅ Redis connected and ready');
            redisEnabled = true;
        });

        // Attempt connection with timeout
        await Promise.race([
            redisClient.connect(),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Connection timeout')), 5000)
            )
        ]);

        redisEnabled = true;
        return redisClient;
    } catch (error) {
        // Log once and move on
        console.warn('⚠️  Redis not available - running without cache (this is fine)');
        redisClient = null;
        redisEnabled = false;
        return null;
    }
}

/**
 * Get Redis client (returns null if not connected)
 */
export function getRedisClient(): RedisClientType | null {
    return (redisEnabled && redisClient?.isOpen) ? redisClient : null;
}

/**
 * Check if Redis is available
 */
export function isRedisAvailable(): boolean {
    return redisEnabled && redisClient?.isOpen === true;
}

/**
 * Disconnect from Redis
 */
export async function disconnectRedis(): Promise<void> {
    if (redisClient?.isOpen) {
        await redisClient.quit();
        console.log('Redis disconnected');
    }
}

/**
 * Redis Cache Utilities
 */

/**
 * Get value from cache
 */
export async function cacheGet(key: string): Promise<string | null> {
    try {
        const client = getRedisClient();
        if (!client) return null;
        return await client.get(key);
    } catch (error) {
        console.error('Cache get error:', error);
        return null;
    }
}

/**
 * Set value in cache with TTL
 */
export async function cacheSet(
    key: string,
    value: string,
    ttl: number = 3600
): Promise<boolean> {
    try {
        const client = getRedisClient();
        if (!client) return false;
        await client.setEx(key, ttl, value);
        return true;
    } catch (error) {
        console.error('Cache set error:', error);
        return false;
    }
}

/**
 * Delete value from cache
 */
export async function cacheDelete(key: string): Promise<boolean> {
    try {
        const client = getRedisClient();
        if (!client) return false;
        await client.del(key);
        return true;
    } catch (error) {
        console.error('Cache delete error:', error);
        return false;
    }
}

/**
 * Check rate limit
 * @param key Rate limit key (e.g., 'signup:user@email.com')
 * @param max Maximum requests
 * @param windowMs Window in milliseconds
 * @returns true if within limit, false if exceeded
 */
export async function checkRateLimit(
    key: string,
    max: number,
    windowMs: number
): Promise<boolean> {
    try {
        const client = getRedisClient();
        if (!client) return true; // Allow if Redis is not available

        const rateLimitKey = `ratelimit:${key}`;
        const current = await client.incr(rateLimitKey);

        if (current === 1) {
            await client.expire(rateLimitKey, Math.ceil(windowMs / 1000));
        }

        return current <= max;
    } catch (error) {
        console.error('Rate limit check error:', error);
        return true; // Allow on error
    }
}

/**
 * Reset rate limit
 */
export async function resetRateLimit(key: string): Promise<void> {
    try {
        const client = getRedisClient();
        if (!client) return;
        await client.del(`ratelimit:${key}`);
    } catch (error) {
        console.error('Rate limit reset error:', error);
    }
}

/**
 * Increment counter
 */
export async function incrementCounter(key: string, ttl?: number): Promise<number> {
    try {
        const client = getRedisClient();
        if (!client) return 0;
        
        const count = await client.incr(key);
        
        if (count === 1 && ttl) {
            await client.expire(key, ttl);
        }
        
        return count;
    } catch (error) {
        console.error('Increment counter error:', error);
        return 0;
    }
}

/**
 * Cache with JSON serialization
 */
export async function cacheSetJSON(
    key: string,
    value: any,
    ttl: number = 3600
): Promise<boolean> {
    try {
        return await cacheSet(key, JSON.stringify(value), ttl);
    } catch (error) {
        console.error('Cache set JSON error:', error);
        return false;
    }
}

/**
 * Get cached JSON value
 */
export async function cacheGetJSON<T = any>(key: string): Promise<T | null> {
    try {
        const data = await cacheGet(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Cache get JSON error:', error);
        return null;
    }
}

export default {
    connectRedis,
    getRedisClient,
    isRedisAvailable,
    disconnectRedis,
    cacheGet,
    cacheSet,
    cacheDelete,
    cacheGetJSON,
    cacheSetJSON,
    checkRateLimit,
    resetRateLimit,
    incrementCounter
};
