import { RateLimiter, MINUTE } from "@convex-dev/rate-limiter";
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
});
