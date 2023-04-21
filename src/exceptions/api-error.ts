export default class ApiError extends Error {
    public status: number;
    public errors: any[];
  
    constructor(status: number, message: string, errors: any[] = []) {
      super(message);
      this.status = status;
      this.errors = errors;
    }
  
    static UnauthorizedError(): ApiError {
      return new ApiError(401, 'Користувач не авторизований');
    }
  
    static BadRequest(message: string, errors: any[] = []): ApiError {
      return new ApiError(400, message, errors);
    }
  }
  