import { JwtPayload } from './auth.types';

declare global {
  namespace Express {
    interface Request extends Partial<JwtPayload> {}
  }
}

export {};
