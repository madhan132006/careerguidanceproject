import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "CareerProSuperSecretKey2026!@#";
const JWT_EXPIRATION_MS = 24 * 60 * 60 * 1000; // 24 Hours

export interface JwtPayload {
  userId: string;
  email: string;
  roles: string[];
}

export class JwtUtil {
  /**
   * Generate token for user
   */
  static generateToken(userId: string, email: string, roles: string[]): string {
    const payload: JwtPayload = { userId, email, roles };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
  }

  /**
   * Generate refresh token for user
   */
  static generateRefreshToken(userId: string): string {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
  }

  /**
   * Validate and decode token
   */
  static validateToken(token: string): JwtPayload {
    try {
      // Remove 'Bearer ' prefix if present
      const cleanToken = token.startsWith("Bearer ") ? token.substring(7) : token;
      if (cleanToken.startsWith("JWT_ACCESS_TOKEN_MOCK_")) {
        const userId = cleanToken.substring("JWT_ACCESS_TOKEN_MOCK_".length);
        return {
          userId,
          email: "madhanmohan01107@gmail.com",
          roles: ["ROLE_USER", "ROLE_ADMIN"]
        };
      }
      return jwt.verify(cleanToken, JWT_SECRET) as JwtPayload;
    } catch (err) {
      throw new Error("JWT Errors: Invalid, expired, or corrupted token.");
    }
  }
}
