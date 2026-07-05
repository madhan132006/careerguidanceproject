import { Request, Response, NextFunction } from "express";
import { JwtUtil, JwtPayload } from "../jwt";
import { RoleName } from "../entity";

// Extend Express Request object to include user payload
export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

/**
 * JWT Authentication Filter middleware (equivalent to JWTAuthenticationFilter in Spring)
 */
export function jwtAuthenticationFilter(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      error: "Authentication Errors",
      message: "Full authentication is required to access this resource. Please provide a Bearer JWT Token."
    });
  }

  try {
    const payload = JwtUtil.validateToken(authHeader);
    req.user = payload;
    next();
  } catch (err: any) {
    return res.status(401).json({
      error: "JWT Errors",
      message: err.message || "Invalid or expired JWT token."
    });
  }
}

/**
 * Role-Based Authorization Filter (equivalent to Spring Security pre-authorize or role check)
 */
export function authorizeRoles(...allowedRoles: RoleName[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: "Authentication Errors",
        message: "Authentication is required to perform this action."
      });
    }

    const hasRole = req.user.roles.some(role => allowedRoles.includes(role as RoleName));
    if (!hasRole) {
      return res.status(403).json({
        error: "Access Denied",
        message: "You do not have the necessary privileges (Role-Based Authorization) to access this endpoint."
      });
    }

    next();
  };
}

/**
 * Custom CORS configuration
 */
export function corsConfiguration(req: Request, res: Response, next: NextFunction) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
}
