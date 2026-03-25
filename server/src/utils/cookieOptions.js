export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge:
    Number(process.env.COOKIE_EXPIRE || 7) * 24 * 60 * 60 * 1000,
};
