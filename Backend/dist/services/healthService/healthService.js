"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthService = void 0;
class HealthService {
    static getHealthStatus(version) {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            version,
            message: 'API health check passed',
        };
    }
    static getRootInfo(version) {
        return {
            message: 'Welcome to the AG Sindh Updates API',
            documentation: 'Add documentation URL here',
            available_versions: [`/api/${version}`],
        };
    }
}
exports.HealthService = HealthService;
