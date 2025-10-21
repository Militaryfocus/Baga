import { Request, Response, NextFunction } from 'express';
import { validate } from '../utils/validation';

export const validateRequest = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = validate(schema, req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Validation error'
      });
    }
  };
};

export const validateQuery = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = validate(schema, req.query);
      req.query = validatedData;
      next();
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Query validation error'
      });
    }
  };
};