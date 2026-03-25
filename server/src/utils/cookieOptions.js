const parseBool = (value) => {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim().toLowerCase();
  if (normalized === "true") return true;
  if (normalized === "false") return false;
  return undefined;
};

const configuredSameSite = process.env.COOKIE_SAME_SITE;
const inferredSameSite = process.env.NODE_ENV === "production" ? "none" : "lax";
const sameSite = configuredSameSite || inferredSameSite;

const configuredSecure = parseBool(process.env.COOKIE_SECURE);
const secure = configuredSecure ?? sameSite === "none";

export const cookieOptions = {
  httpOnly: true,
  // For cross-site frontend/backend, use SameSite=None with Secure=true.
  secure,
  sameSite,
  maxAge:
    Number(process.env.COOKIE_EXPIRE || 7) * 24 * 60 * 60 * 1000,
};
