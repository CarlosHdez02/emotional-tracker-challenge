class CustomError extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
      this.name = this.constructor.name;
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  export class NotFoundError extends CustomError {
    constructor(message = 'Resource not found') {
      super(message, 404);
    }
  }
  
  export class ValidationError extends CustomError {
    constructor(message = 'Validation failed', statusCode = 400, details = []) {
      super(message, statusCode);
      this.details = details;
    }
  }
  
  export class AuthError extends CustomError {
    constructor(message = 'Authentication failed') {
      super(message, 401);
    }
  }
  
  export class ForbiddenError extends CustomError {
    constructor(message = 'Access forbidden') {
      super(message, 403);
    }
  }
  
  export const errorHandler = (err, req, res, next) => {
    console.error(`[ERROR] ${err.name}: ${err.message}`);
    
    // Default status code and message
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal server error';
    
    
    // Handle Joi validation errors
    if (err instanceof ValidationError) {
      return res.status(err.statusCode).json({
        success: false,
        error: {
          message: err.message,
          details: err.details,
          statusCode: err.statusCode
        }
      });
    }
    
    if (err instanceof AuthError) {
        return res.status(401).json({
          success: false,
          error: {
            message: err.message,
            statusCode: 401
          }
        });
      }
  
      if (err instanceof NotFoundError) {
        return res.status(404).json({
          success: false,
          error: {
            message: err.message,
            statusCode: 404
          }
        });
      }
   
    
    // Standard error response
    res.status(statusCode).json({
      success: false,
      error: {
        message,
        statusCode,
        ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
      }
    });
  };
  
  export { CustomError };