// Client-side rate limiting utilities
import { getSecurityConfig } from '../security.config';

interface RateLimitEntry {
    count: number;
    firstAttempt: number;
    lastAttempt: number;
    isLocked: boolean;
    lockUntil?: number;
}

type RateLimitType = 'login' | 'api';

class RateLimiter {
    private attempts: Map<string, RateLimitEntry> = new Map();
    private config = getSecurityConfig();

    private getConfig(type: RateLimitType) {
        return type === 'login' 
            ? this.config.RATE_LIMITING.LOGIN_ATTEMPTS
            : this.config.RATE_LIMITING.API_REQUESTS;
    }

    private getMaxAttempts(type: RateLimitType): number {
        const config = this.getConfig(type);
        return 'MAX_ATTEMPTS' in config ? config.MAX_ATTEMPTS : config.MAX_REQUESTS;
    }

    // Check if an action is rate limited
    isRateLimited(key: string, type: RateLimitType = 'api'): boolean {
        const now = Date.now();
        const entry = this.attempts.get(key);
        
        if (!entry) return false;

        const config = this.getConfig(type);
        const maxAttempts = this.getMaxAttempts(type);

        // Check if still locked out
        if (entry.isLocked && entry.lockUntil && now < entry.lockUntil) {
            return true;
        }

        // Check if window has expired
        if (now - entry.firstAttempt > config.WINDOW_MS) {
            // Reset the entry
            this.attempts.delete(key);
            return false;
        }

        // Check if exceeded max attempts
        return entry.count >= maxAttempts;
    }

    // Record an attempt
    recordAttempt(key: string, type: RateLimitType = 'api'): void {
        const now = Date.now();
        const entry = this.attempts.get(key) || {
            count: 0,
            firstAttempt: now,
            lastAttempt: now,
            isLocked: false
        };

        const config = this.getConfig(type);
        const maxAttempts = this.getMaxAttempts(type);

        // If window expired, reset
        if (now - entry.firstAttempt > config.WINDOW_MS) {
            entry.count = 1;
            entry.firstAttempt = now;
            entry.isLocked = false;
            entry.lockUntil = undefined;
        } else {
            entry.count++;
        }

        entry.lastAttempt = now;

        // Lock if exceeded attempts (for login type)
        if (type === 'login' && entry.count >= maxAttempts) {
            entry.isLocked = true;
            const loginConfig = config as typeof this.config.RATE_LIMITING.LOGIN_ATTEMPTS;
            entry.lockUntil = now + (loginConfig.LOCKOUT_MS || 0);
            
            console.warn(`Rate limit exceeded for ${key}. Locked until ${new Date(entry.lockUntil).toLocaleTimeString()}`);
        }

        this.attempts.set(key, entry);
    }

    // Get remaining attempts
    getRemainingAttempts(key: string, type: RateLimitType = 'api'): number {
        const maxAttempts = this.getMaxAttempts(type);
        const entry = this.attempts.get(key);
        
        if (!entry) {
            return maxAttempts;
        }

        const config = this.getConfig(type);
        const now = Date.now();
        
        // If window expired, return max
        if (now - entry.firstAttempt > config.WINDOW_MS) {
            return maxAttempts;
        }

        return Math.max(0, maxAttempts - entry.count);
    }

    // Get time until unlock (for login)
    getTimeUntilUnlock(key: string): number {
        const entry = this.attempts.get(key);
        if (!entry || !entry.isLocked || !entry.lockUntil) {
            return 0;
        }

        return Math.max(0, entry.lockUntil - Date.now());
    }

    // Clear rate limit for a key
    clearRateLimit(key: string): void {
        this.attempts.delete(key);
    }

    // Clean up old entries (call periodically)
    cleanup(): void {
        const now = Date.now();
        const maxAge = Math.max(
            this.config.RATE_LIMITING.LOGIN_ATTEMPTS.WINDOW_MS,
            this.config.RATE_LIMITING.API_REQUESTS.WINDOW_MS
        );

        for (const [key, entry] of this.attempts.entries()) {
            if (now - entry.lastAttempt > maxAge) {
                this.attempts.delete(key);
            }
        }
    }
}

// Singleton instance
const rateLimiter = new RateLimiter();

// Cleanup old entries every 5 minutes
setInterval(() => {
    rateLimiter.cleanup();
}, 5 * 60 * 1000);

export default rateLimiter;

// Helper functions for common use cases
export const checkLoginRateLimit = (identifier: string): boolean => {
    return rateLimiter.isRateLimited(`login:${identifier}`, 'login');
};

export const recordLoginAttempt = (identifier: string): void => {
    rateLimiter.recordAttempt(`login:${identifier}`, 'login');
};

export const getLoginAttemptsRemaining = (identifier: string): number => {
    return rateLimiter.getRemainingAttempts(`login:${identifier}`, 'login');
};

export const getLoginLockoutTime = (identifier: string): number => {
    return rateLimiter.getTimeUntilUnlock(`login:${identifier}`);
};

export const clearLoginRateLimit = (identifier: string): void => {
    rateLimiter.clearRateLimit(`login:${identifier}`);
}; 