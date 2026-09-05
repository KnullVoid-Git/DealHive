import toast from 'react-hot-toast';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  displayName: string;
}

const CONFIGS: Record<string, RateLimitConfig> = {
  ai_suggest: { maxRequests: 3, windowMs: 60000, displayName: 'AI counter-offer analysis queries' },
  auth_action: { maxRequests: 5, windowMs: 60000, displayName: 'authentication requests' },
  db_write: { maxRequests: 20, windowMs: 60000, displayName: 'database writes' }
};

export const rateLimiter = {
  /**
   * Checks if a specific action is within rate limits
   * Returns metadata about the current usage quota
   */
  checkLimit: (action: keyof typeof CONFIGS): { allowed: boolean; remaining: number; resetMs: number } => {
    const config = CONFIGS[action];
    if (!config) return { allowed: true, remaining: 99, resetMs: 0 };

    const now = Date.now();
    const storageKey = `dealhive_rate_${action}`;
    const stored = localStorage.getItem(storageKey);
    let timestamps: number[] = stored ? JSON.parse(stored) : [];

    // Filter out timestamps older than the configuration sliding window
    timestamps = timestamps.filter(t => now - t < config.windowMs);

    if (timestamps.length >= config.maxRequests) {
      const oldestActive = timestamps[0];
      const resetMs = config.windowMs - (now - oldestActive);
      return { allowed: false, remaining: 0, resetMs };
    }

    // Add current timestamp and persist
    timestamps.push(now);
    localStorage.setItem(storageKey, JSON.stringify(timestamps));

    return {
      allowed: true,
      remaining: config.maxRequests - timestamps.length,
      resetMs: config.windowMs - (now - timestamps[0])
    };
  },

  /**
   * Enforces the rate limit and throws a standard error, showing a toast toast block
   */
  checkAndThrow: (action: keyof typeof CONFIGS): void => {
    const status = rateLimiter.checkLimit(action);
    if (!status.allowed) {
      const secondsLeft = Math.ceil(status.resetMs / 1000);
      const msg = `Security Block: Too many ${CONFIGS[action].displayName}. Retry in ${secondsLeft}s.`;
      toast.error(msg, { id: `rate-limit-${action}` });
      throw new Error(`RATE_LIMIT_EXCEEDED:${action}:${secondsLeft}`);
    }
  },

  /**
   * Gets stats for display in the developer diagnostics settings
   */
  getStats: (action: keyof typeof CONFIGS) => {
    const config = CONFIGS[action];
    if (!config) return { max: 0, current: 0, remaining: 0, windowSecs: 0 };
    const now = Date.now();
    const stored = localStorage.getItem(`dealhive_rate_${action}`);
    let timestamps: number[] = stored ? JSON.parse(stored) : [];
    timestamps = timestamps.filter(t => now - t < config.windowMs);
    return {
      max: config.maxRequests,
      current: timestamps.length,
      remaining: Math.max(0, config.maxRequests - timestamps.length),
      windowSecs: Math.round(config.windowMs / 1000)
    };
  },

  /**
   * Clears limits for reset purposes
   */
  clearLimit: (action: keyof typeof CONFIGS): void => {
    localStorage.removeItem(`dealhive_rate_${action}`);
  }
};
