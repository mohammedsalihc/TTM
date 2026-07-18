import { Request, Response } from 'express';
import { controllerHandler } from './ControllerHandler';
import { isDuplicateKeyError } from './errors';
import { IErrorCode } from '../types';

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

// Same as asyncHandler, but a MongoDB duplicate-key error (a unique-index
// violation — e.g. two concurrent signups/creates racing on the same email)
// is caught separately and turned into a 409 instead of falling through to
// the generic 500. Used by register/employee-create/manager-create, which
// each pre-check email uniqueness but can't fully rule out that race — the
// unique index on Auth.email is the real guarantee.
export function asyncHandlerWithDuplicateKeyCatch(handler: Handler, duplicateKeyMessage: IErrorCode) {
  return async (req: Request, res: Response) => {
    try {
      await handler(req, res);
    } catch (err) {
      if (isDuplicateKeyError(err)) {
        controllerHandler.error(res, 409, duplicateKeyMessage);
        return;
      }
      console.error(err);
      controllerHandler.error(res, 500, null, err);
    }
  };
}
