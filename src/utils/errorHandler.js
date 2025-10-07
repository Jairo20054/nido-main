export class ApiError extends Error {
  constructor(message, status, code) {
    super(message);
    this.status = status;
    this.code = code;
    this.name = 'ApiError';
  }
}

export const handleApiError = (error) => {
  if (error instanceof ApiError) {
    return {
      message: error.message,
      status: error.status,
      code: error.code
    };
  }

  return {
    message: 'Error inesperado. Por favor intenta nuevamente.',
    status: 500,
    code: 'UNKNOWN_ERROR'
  };
};