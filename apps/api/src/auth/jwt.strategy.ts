import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { Request } from 'express'
import { db } from '../db'
import { users } from '../db/schema'
import { eq } from 'drizzle-orm'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req: Request) => req?.cookies?.token || null,
                ExtractJwt.fromAuthHeaderAsBearerToken(),
            ]),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET!,
        })
    }

    async validate(payload: { sub: string; email: string }) {
        if (!payload?.sub) throw new UnauthorizedException()
        const [user] = await db.select().from(users).where(eq(users.id, payload.sub))
        if (!user) throw new UnauthorizedException()
        return { id: user.id, email: user.email, name: user.name }
    }
}