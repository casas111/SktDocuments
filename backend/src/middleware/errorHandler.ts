import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: Error & { status?: number; errors?: any[] },
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const status = err.status || 500;
  const message = err.message || 'Something went wrong';
  
  console.error(`[Error] ${status} - ${message}`);
  if (err.stack) {
    console.error(err.stack);
  }

  res.status(status).json({
    success: false,
    status,
    message,
    errors: err.errors || null,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};
