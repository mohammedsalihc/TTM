export interface IErrorCode {
  message: string;
  code: string;
}

export interface IServerError {
  status: number;
  message: string;
  error_message_code: string;
  error?: unknown[];
}
