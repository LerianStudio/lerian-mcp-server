/**
 * LRU Cache Implementation
 * Improves performance with intelligent caching
 */

import { LRUCache } from 'lru-cache';

export interface CacheOptions {
  max?: number;
  ttl?: number;
  updateAgeOnGet?: boolean;
}

/**
 * Generic LRU cache wrapper
 */
export class Cache<K, V> {
  private cache: LRUCache<K, V>;
  private hits: number = 0;
  private misses: number = 0;

  constructor(options: CacheOptions = {}) {
    this.cache = new LRUCache<K, V>({
      max: options.max || 100,
      ttl: options.ttl || 1000 * 60 * 5, // 5 minutes default
      updateAgeOnGet: options.updateAgeOnGet !== false
    });
  }

  /**
   * Get value from cache
   */
  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      this.hits++;
    } else {
      this.misses++;
    }
    return value;
  }

  /**
   * Set value in cache
   */
  set(key: K, value: V, ttl?: number): void {
    if (ttl) {
      this.cache.set(key, value, { ttl });
    } else {
      this.cache.set(key, value);
    }
  }

  /**
   * Check if key exists
   */
  has(key: K): boolean {
    return this.cache.has(key);
  }

  /**
   * Delete key from cache
   */
  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Get cache hit rate
   */
  getHitRate(): number {
    const total = this.hits + this.misses;
    return total === 0 ? 0 : this.hits / total;
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    hits: number;
    misses: number;
    hitRate: number;
    size: number;
    maxSize: number;
  } {
    return {
      hits: this.hits,
      misses: this.misses,
      hitRate: this.getHitRate(),
      size: this.cache.size,
      maxSize: this.cache.max
    };
  }

  /**
   * Get or compute value
   * If key exists, return cached value
   * Otherwise, compute value, cache it, and return it
   */
  async getOrCompute(key: K, compute: () => Promise<V>, ttl?: number): Promise<V> {
    const cached = this.get(key);
    if (cached !== undefined) {
      return cached;
    }

    const value = await compute();
    this.set(key, value, ttl);
    return value;
  }
}

/**
 * Create a cache instance with default settings
 */
export function createCache<K, V>(options?: CacheOptions): Cache<K, V> {
  return new Cache<K, V>(options);
}

/**
 * Global caches for common use cases
 */
export const documentCache = createCache<string, string>({
  max: 50,
  ttl: 1000 * 60 * 30 // 30 minutes
});

export const manifestCache = createCache<string, any>({
  max: 10,
  ttl: 1000 * 60 * 30 // 30 minutes
});

export const apiResponseCache = createCache<string, any>({
  max: 100,
  ttl: 1000 * 60 * 5 // 5 minutes
});

/**
 * Get all cache statistics
 */
export function getAllCacheStats(): {
  document: ReturnType<Cache<any, any>['getStats']>;
  manifest: ReturnType<Cache<any, any>['getStats']>;
  apiResponse: ReturnType<Cache<any, any>['getStats']>;
} {
  return {
    document: documentCache.getStats(),
    manifest: manifestCache.getStats(),
    apiResponse: apiResponseCache.getStats()
  };
}

/**
 * Clear all caches
 */
export function clearAllCaches(): void {
  documentCache.clear();
  manifestCache.clear();
  apiResponseCache.clear();
}
