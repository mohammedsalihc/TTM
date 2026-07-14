import { Request, Response } from 'express';
import { controllerHandler } from './ControllerHandler';

type Handler = (req: Request, res: Response) => Promise<void>;

// No global Express error-handling middleware exists in this app, so every
// controller method used to repeat its own `catch (err) { console.error(err);
// this.error(res, 500, null, err); }`. Wrapping a route with this instead
// gives the same behavior for methods that don't need a special-case catch
// (e.g. a duplicate-key check on create) without repeating it by hand.
export function asyncHandler(handler: Handler) {
  return async (req: Request, res: Response) => {
    try {
      await handler(req, res);
    } catch (err) {
      console.error(err);
      controllerHandler.error(res, 500, null, err);
    }
  };
}
