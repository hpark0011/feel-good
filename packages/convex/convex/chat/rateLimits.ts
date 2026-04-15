import { RateLimiter, MINUTE, DAY } from "@convex-dev/rate-limiter";
import { components } from "../_generated/api";

export const chatRateLimiter = new RateLimiter(components.rateLimiter, {
  sendMessage: {
    kind: "fixed window",
    rate: 10,
    period: MINUTE,
  },
  createConversation: {
    kind: "fixed window",
    rate: 3,
    period: MINUTE,
  },
  retryMessage: {
    kind: "fixed window",
    rate: 5,
    period: MINUTE,
  },
  // Daily output-spend ceiling for anonymous visitors. Token bucket so that
  // burst is bounded by `capacity` (50) while sustained throughput is capped
  // by `rate` (200 tokens per 24h). Keyed by `profileOwnerId` so that
  // rotating through fresh anon conversations cannot bypass the cap.
  sendMessageDailyAnon: {
    kind: "token bucket",
    rate: 200,
    period: DAY,
    capacity: 50,
  },
  // Daily output-spend ceiling for authenticated viewers. Keyed by
  // `appUser._id`. Higher rate/capacity than anon.
  sendMessageDailyAuth: {
    kind: "token bucket",
    rate: 500,
    period: DAY,
    capacity: 100,
  },
});
