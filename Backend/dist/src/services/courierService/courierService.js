"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourierService = void 0;
const prisma_1 = require("../../../generated/prisma");
const prisma = new prisma_1.PrismaClient();
class CourierService {
    static async createCourier(data) {
        return prisma.courier.create({ data });
    }
    static async getAllCouriers() {
        return prisma.courier.findMany();
    }
    static async getCourierById(id) {
        return prisma.courier.findUnique({ where: { id } });
    }
    static async updateCourierById(id, data) {
        return prisma.courier.update({ where: { id }, data });
    }
    static async deleteCourierById(id) {
        return prisma.courier.delete({ where: { id } });
    }
}
exports.CourierService = CourierService;
