export class HealthService {
  static getHealthStatus(version: string) {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version,
      message: 'API health check passed',
    };
  }

  static getRootInfo(version: string) {
    return {
      message: 'Welcome to the AG Sindh Updates API',
      documentation: 'Add documentation URL here',
      available_versions: [`/api/${version}`],
    };
  }
} 