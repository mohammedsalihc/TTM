import { Response } from 'express';
import { ZodType, z } from 'zod';
import { status_code } from '../constants/statusCode';
import { error_message } from '../constants/errorMessages';
import { Environment, IErrorCode, IServerError } from '../types';
import { firstValidationMessage } from './validationHandler';

export class ControllerHandler {
  public jsonResponse<T>(response: Response, result?: T | null) {
    if (result !== undefined && result !== null) {
      response.type('application/json');
      return response.status(200).json(result);
    } else {
      return response.status(200).json({ status: 'success' });
    }
  }

  // Runs a Zod schema against raw input (req.body or req.query) and, on
  // failure, writes the 400 response itself and returns null — callers just
  // do `const data = this.validate(schema, req.body, res); if (!data) return;`
  // instead of repeating the parse/message/error-response boilerplate.
  public validate<T>(schema: ZodType<T>, data: unknown, response: Response): T | null {
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      const message = firstValidationMessage(parsed.error, error_message.body_validation_error.message);
      this.error(
        response,
        400,
        { message, code: error_message.body_validation_error.code },
        z.treeifyError(parsed.error),
      );
      return null;
    }
    return parsed.data;
  }

  public error(response: Response, code: number, message_detail?: IErrorCode | null, error?: unknown) {
    const msg = message_detail?.message || status_code[code];
    const error_response: IServerError = {
      status: code,
      message: msg,
      error_message_code: message_detail?.code || code?.toString(),
      error: [error],
    };
    if (process.env.ENVIRONMENT === Environment.PRODUCTION) {
      delete error_response.error;
    }
    return response.status(code).json(error_response);
  }
}

// Singleton for use outside class-based controllers (e.g. plain middleware
// functions) that still want the same response shape.
export const controllerHandler = new ControllerHandler();
