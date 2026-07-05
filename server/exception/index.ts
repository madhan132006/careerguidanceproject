import { Request, Response, NextFunction } from "express";

/**
 * Standard Exception Response Object matching Spring Boot custom error models.
 */
export interface ErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}

/**
 * Express Global Exception Handler (equivalent to @ControllerAdvice in Spring)
 */
export function globalExceptionHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error("Global Exception Caught:", err);

  const timestamp = new Date().toISOString();
  const path = req.originalUrl;
  let status = 500;
  let error = "Database Errors / Internal Server Error";
  let message = err.message || "An unexpected error occurred on the server.";

  const msg = message.toLowerCase();

  if (msg.includes("invalid credentials")) {
    status = 401;
    error = "Invalid Credentials";
  } else if (msg.includes("resource not found")) {
    status = 404;
    error = "Resource Not Found";
  } else if (msg.includes("duplicate user")) {
    status = 409;
    error = "Duplicate User";
  } else if (msg.includes("validation errors")) {
    status = 400;
    error = "Validation Errors";
  } else if (msg.includes("jwt errors")) {
    status = 401;
    error = "JWT Errors";
  } else if (msg.includes("authentication errors")) {
    status = 401;
    error = "Authentication Errors";
  }

  const responseBody: ErrorResponse = {
    timestamp,
    status,
    error,
    message,
    path
  };

  res.status(status).json(responseBody);
}
