type RateLimitConfig = {
  maxRequests: number;
  windowMs: number;
};

class RateLimiter {
  private requests: Map<string, number[]>;
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.requests = new Map();
    this.config = config;
  }

  isRateLimited(key: string): boolean {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    // Get existing requests for this key
    let requestTimestamps = this.requests.get(key) || [];
    
    // Remove old requests outside the window
    requestTimestamps = requestTimestamps.filter(timestamp => timestamp > windowStart);
    
    // Check if rate limit is exceeded
    if (requestTimestamps.length >= this.config.maxRequests) {
      return true;
    }
    
    // Add new request timestamp
    requestTimestamps.push(now);
    this.requests.set(key, requestTimestamps);
    
    return false;
  }

  getRemainingRequests(key: string): number {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    const requestTimestamps = this.requests.get(key) || [];
    const validRequests = requestTimestamps.filter(timestamp => timestamp > windowStart);
    
    return Math.max(0, this.config.maxRequests - validRequests.length);
  }

  getResetTime(key: string): number {
    const requestTimestamps = this.requests.get(key) || [];
    if (requestTimestamps.length === 0) {
      return 0;
    }
    
    const oldestRequest = Math.min(...requestTimestamps);
    return oldestRequest + this.config.windowMs;
  }
}

// Create rate limiters for different endpoints
export const apiRateLimiter = new RateLimiter({
  maxRequests: 100,  // 100 requests
  windowMs: 60000,   // per minute
});

export const fileUploadRateLimiter = new RateLimiter({
  maxRequests: 10,   // 10 file uploads
  windowMs: 60000,   // per minute
});

export const scanRateLimiter = new RateLimiter({
  maxRequests: 5,    // 5 scans
  windowMs: 60000,   // per minute
});