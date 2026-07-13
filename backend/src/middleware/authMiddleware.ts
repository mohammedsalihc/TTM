import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { controllerHandler } from '../utils/ControllerHandler';
import { error_message } from '../constants/errorMessages';

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
