import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { controllerHandler } from '../utils/ControllerHandler';
import { error_message } from '../constants/errorMessages';
import { UserRole } from '../types';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization;

  if (!token) {
    controllerHandler.error(res, 401, error_message.unauthorized);
    return;
  }

  try {
    const payload = verifyToken(token);
    req.userId = payload.userId;
    req.businessId = payload.businessId;
    req.role = payload.role;
    next();
  } catch {
    controllerHandler.error(res, 401, error_message.unauthorized);
  }
}

// Must run after requireAuth — relies on req.role already being set.
export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.role || !roles.includes(req.role)) {
      controllerHandler.error(res, 403, error_message.forbidden);
      return;
    }
    next();
  };
}
