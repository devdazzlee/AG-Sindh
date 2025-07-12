"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthController = void 0;
const healthService_1 = require("../../services/healthService/healthService");
class HealthController {
    static healthCheck(req, res) {
        const version = req.app.get('API_VERSION');
        const data = healthService_1.HealthService.getHealthStatus(version);
        res.status(200).json(data);
    }
    static root(req, res) {
        const version = req.app.get('API_VERSION');
        const data = healthService_1.HealthService.getRootInfo(version);
        res.status(200).json(data);
    }
}
exports.HealthController = HealthController;
