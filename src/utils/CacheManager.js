/**
 * CacheManager - LocalStorage based caching system
 * @class
 */
class CacheManager {
    constructor(options = {}) {
        this.prefix = options.prefix || 'aikit_cache_';
        this.maxAge = options.maxAge || 3600000; // 1 hour default
        this.maxSize = options.maxSize || 100; // Maximum cache entries
        
        this.storage = typeof window !== 'undefined' && window.localStorage 
            ? window.localStorage 
            : new MemoryStorage();
    }

    /**
     * Generate cache key from message and options
     */
    generateKey(message, options = {}) {
        const normalized = {
            message: message.trim().toLowerCase(),
            ...options
        };
        
        const str = JSON.stringify(normalized);
        return this.prefix + this.hashCode(str);
    }

    /**
     * Simple hash function
     * @private
     */
    hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash).toString(36);
    }

    /**
     * Get cached item
     */
    get(key) {
        try {
            const item = this.storage.getItem(key);
            if (!item) return null;

            const parsed = JSON.parse(item);
            const now = Date.now();

            // Check expiration
            if (now - parsed.timestamp > this.maxAge) {
                this.storage.removeItem(key);
                return null;
            }

            return parsed.data;
        } catch (error) {
            console.warn('AIKit CacheManager: Error reading cache', error);
            return null;
        }
    }

    /**
     * Set cache item
     */
    set(key, data) {
        try {
            // Check size limit
            this.enforceMaxSize();

            const item = {
                data,
                timestamp: Date.now()
            };

            this.storage.setItem(key, JSON.stringify(item));
            return true;
        } catch (error) {
            console.warn('AIKit CacheManager: Error writing cache', error);
            return false;
        }
    }

    /**
     * Enforce maximum cache size
     * @private
     */
    enforceMaxSize() {
        const keys = this.getKeys();
        
        if (keys.length >= this.maxSize) {
            // Remove oldest entries
            const entries = keys.map(key => {
                const item = this.storage.getItem(key);
                const parsed = JSON.parse(item);
                return { key, timestamp: parsed.timestamp };
            });

            entries.sort((a, b) => a.timestamp - b.timestamp);

            // Remove oldest 20%
            const toRemove = Math.ceil(this.maxSize * 0.2);
            for (let i = 0; i < toRemove; i++) {
                this.storage.removeItem(entries[i].key);
            }
        }
    }

    /**
     * Get all cache keys
     * @private
     */
    getKeys() {
        const keys = [];
        for (let i = 0; i < this.storage.length; i++) {
            const key = this.storage.key(i);
            if (key && key.startsWith(this.prefix)) {
                keys.push(key);
            }
        }
        return keys;
    }

    /**
     * Clear all cache
     */
    clear() {
        const keys = this.getKeys();
        keys.forEach(key => this.storage.removeItem(key));
    }

    /**
     * Get cache statistics
     */
    getStats() {
        const keys = this.getKeys();
        const now = Date.now();
        
        let totalSize = 0;
        let validEntries = 0;
        
        keys.forEach(key => {
            const item = this.storage.getItem(key);
            if (item) {
                totalSize += item.length;
                const parsed = JSON.parse(item);
                if (now - parsed.timestamp <= this.maxAge) {
                    validEntries++;
                }
            }
        });

        return {
            totalEntries: keys.length,
            validEntries,
            expiredEntries: keys.length - validEntries,
            totalSize,
            maxAge: this.maxAge,
            maxSize: this.maxSize
        };
    }
}

/**
 * Memory-based storage fallback (for Node.js or browsers without localStorage)
 * @class
 */
class MemoryStorage {
    constructor() {
        this.storage = new Map();
    }

    getItem(key) {
        return this.storage.get(key) || null;
    }

    setItem(key, value) {
        this.storage.set(key, value);
    }

    removeItem(key) {
        this.storage.delete(key);
    }

    key(index) {
        return Array.from(this.storage.keys())[index];
    }

    get length() {
        return this.storage.size;
    }

    clear() {
        this.storage.clear();
    }
}

// Export
// if (typeof module !== 'undefined' && module.exports) {
//     module.exports = CacheManager;
// }
export default CacheManager;
