import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@trusttax/database';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async register(data: Prisma.UserCreateInput) {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        const user = await this.prisma.user.create({
            data: {
                ...data,
                password: hashedPassword,
            },
        });
        const { password, ...result } = user;
        return result;
    }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (user && (await bcrypt.compare(pass, user.password))) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = { email: user.email, sub: user.id, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
            user,
        };
    }

    async findById(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                orders: {
                    include: {
                        service: true
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                },
                invoices: {
                    where: {
                        status: {
                            in: ['DRAFT', 'SENT', 'OVERDUE']
                        }
                    }
                }
            }
        } as any);

        if (!user) {
            throw new UnauthorizedException('User not found or has been deleted');
        }

        const { password, ...result } = user;
        return result;
    }
}
