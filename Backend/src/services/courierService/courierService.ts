import { PrismaClient } from '../../../generated/prisma';

const prisma = new PrismaClient();

export class CourierService {
  static async createCourier(data: any) {
    return prisma.courier.create({ data });
  }

  static async getAllCouriers() {
    return prisma.courier.findMany();
  }

  static async getCourierById(id: string) {
    return prisma.courier.findUnique({ where: { id } });
  }

  static async updateCourierById(id: string, data: any) {
    return prisma.courier.update({ where: { id }, data });
  }

  static async deleteCourierById(id: string) {
    return prisma.courier.delete({ where: { id } });
  }
}
