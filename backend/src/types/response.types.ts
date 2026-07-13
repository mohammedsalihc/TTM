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

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationMeta;
}
