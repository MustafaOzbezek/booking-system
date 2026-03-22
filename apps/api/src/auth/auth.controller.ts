import { Controller, Post, Get, Body, Res, UseGuards, Request } from '@nestjs/common'
import { Response } from 'express'
import { AuthService } from './auth.service'
import { RegisterSchema, LoginSchema } from '@booking/schemas'
import { JwtAuthGuard } from './jwt-auth.guard'
import { Throttle } from '@nestjs/throttler'

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Throttle({ default: { limit: 5, ttl: 60000 } })
    @Post('register')
    async register(@Body() body: unknown, @Res({ passthrough: true }) res: Response) {
        const input = RegisterSchema.parse(body)
        const result = await this.authService.register(input)
        res.cookie('token', result.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })
        return { user: result.user }
    }

    @Throttle({ default: { limit: 5, ttl: 60000 } })
    @Post('login')
    async login(@Body() body: unknown, @Res({ passthrough: true }) res: Response) {
        const input = LoginSchema.parse(body)
        const result = await this.authService.login(input)
        res.cookie('token', result.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })
        return { user: result.user, token: result.token }
    }

    @Post('logout')
    logout(@Res({ passthrough: true }) res: Response) {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        })
        return { message: 'Cikis yapildi' }
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    getMe(@Request() req: any) {
        return { user: req.user }
    }
}