import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { db } from '../db'
import { users } from '../db/schema'
import { eq } from 'drizzle-orm'
import * as bcrypt from 'bcryptjs'
import { RegisterInput, LoginInput } from '@booking/schemas'
import { ErrorCodes } from '../common/error-codes.enum'

const SALT_ROUNDS = 10

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name)

    constructor(private jwtService: JwtService) { }

    async register(input: RegisterInput) {
        try {
            const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS)
            const [user] = await db.insert(users).values({
                name: input.name,
                email: input.email,
                password: hashedPassword,
            }).returning()

            const token = this.jwtService.sign({ sub: user.id, email: user.email })
            this.logger.log(`Yeni kullanici kayit: ${user.email}`)
            return { token, user: { id: user.id, name: user.name, email: user.email } }
        } catch (error: any) {
            if (error?.cause?.code === '23505' || error?.code === '23505') {
                throw new ConflictException({
                    error: ErrorCodes.EMAIL_ALREADY_EXISTS,
                    message: 'Bu email adresi zaten kullanımda',
                })
            }
            throw error
        }
    }

    async login(input: LoginInput) {
        const [user] = await db.select().from(users).where(eq(users.email, input.email))
        if (!user) {
            throw new UnauthorizedException({
                error: ErrorCodes.INVALID_CREDENTIALS,
                message: 'Email veya şifre hatalı',
            })
        }

        const valid = await bcrypt.compare(input.password, user.password)
        if (!valid) {
            this.logger.warn(`Basarisiz giris denemesi: ${input.email}`)
            throw new UnauthorizedException({
                error: ErrorCodes.INVALID_CREDENTIALS,
                message: 'Email veya şifre hatalı',
            })
        }

        const token = this.jwtService.sign({ sub: user.id, email: user.email })
        this.logger.log(`Kullanici giris yapti: ${user.email}`)
        return { token, user: { id: user.id, name: user.name, email: user.email } }
    }
}