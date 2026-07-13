import { Response } from 'express';
import { status_code } from '../constants/statusCode';
import { Environment, IErrorCode, IServerError } from '../types';

export class ControllerHandler {
  public jsonResponse<T>(response: Response, result?: T | null) {
    if (result) {
      response.type('application/json');
      return response.status(200).json(result);
    } else {
      return response.status(200).json({ status: 'success' });
    }
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
