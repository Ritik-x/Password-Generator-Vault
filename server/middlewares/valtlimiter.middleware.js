import rateLimit from "express-rate-limit";

export const vaultLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 requests per IP
  message: "Too many requests to the vault API. Please try again later.",
});
