import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
}