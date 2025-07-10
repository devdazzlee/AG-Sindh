import { Request, Response } from 'express';
import { HealthService } from '../../services/healthService/healthService';

export class HealthController {
  static healthCheck(req: Request, res: Response) {
    const version = req.app.get('API_VERSION');
    const data = HealthService.getHealthStatus(version);
    res.status(200).json(data);
  }

  static root(req: Request, res: Response) {
    const version = req.app.get('API_VERSION');
    const data = HealthService.getRootInfo(version);
    res.status(200).json(data);
  }
} 