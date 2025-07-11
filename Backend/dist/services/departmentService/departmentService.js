"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepartmentService = void 0;
const prisma_1 = require("../../../generated/prisma");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new prisma_1.PrismaClient();
class DepartmentService {
    static async createDepartmentWithAccount(data) {
        // Check if username already exists
        const existingUser = await prisma.user.findUnique({ where: { username: data.username } });
        if (existingUser) {
            throw new Error('Username already exists');
        }
        // Hash password
        const hashed = await bcryptjs_1.default.hash(data.password, 10);
        // Create user with role 'other_department'
        const user = await prisma.user.create({
            data: {
                username: data.username,
                password: hashed,
                role: 'other_department',
            },
        });
        // Create department and link user
        const department = await prisma.department.create({
            data: {
                name: data.name,
                code: data.code,
                head: data.head,
                contact: data.contact,
                status: data.status,
                userId: user.id,
            },
        });
        return { department, user: { id: user.id, username: user.username, role: user.role } };
    }
    static async getAllDepartments() {
        return prisma.department.findMany({ include: { user: true } });
    }
    static async getDepartmentById(id) {
        return prisma.department.findUnique({ where: { id }, include: { user: true } });
    }
    static async updateDepartmentById(id, data) {
        // If username or password present, update user
        const userUpdate = {};
        if ('username' in data && data.username)
            userUpdate.username = data.username;
        if ('password' in data && data.password)
            userUpdate.password = await bcryptjs_1.default.hash(data.password, 10);
        if (Object.keys(userUpdate).length > 0) {
            const department = await prisma.department.findUnique({ where: { id } });
            if (!department || !department.userId)
                throw new Error('Department or linked user not found');
            await prisma.user.update({ where: { id: department.userId }, data: userUpdate });
        }
        // Update department fields
        const { username, password, ...deptData } = data;
        return prisma.department.update({ where: { id }, data: deptData, include: { user: true } });
    }
    static async deleteDepartmentById(id) {
        // Delete department and linked user
        const department = await prisma.department.findUnique({ where: { id } });
        if (!department)
            throw new Error('Department not found');
        if (department.userId) {
            await prisma.user.delete({ where: { id: department.userId } });
        }
        return prisma.department.delete({ where: { id } });
    }
    static async setDepartmentStatus(id, status) {
        if (!['active', 'inactive'].includes(status)) {
            throw new Error('Status must be either active or inactive');
        }
        return prisma.department.update({
            where: { id },
            data: { status },
            include: { user: true }
        });
    }
}
exports.DepartmentService = DepartmentService;
