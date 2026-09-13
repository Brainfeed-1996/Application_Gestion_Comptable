export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  meta?: ResponseMeta;
}

export interface PaginatedResponse<T> {
  data: T[];
  success: boolean;
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
  status: number;
}

export interface ResponseMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
