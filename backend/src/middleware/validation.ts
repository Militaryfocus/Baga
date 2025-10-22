import { Request, Response, NextFunction } from 'express';
import { validate } from '../utils/validation';

export const validateRequest = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedData = validate(schema, req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Validation error'
      });
      return;
    }
  };
};

export const validateQuery = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedData = validate(schema, req.query);
      req.query = validatedData as any;
      next();
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Query validation error'
      });
      return;
    }
  };
};