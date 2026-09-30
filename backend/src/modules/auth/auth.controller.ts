import { Body, Controller, HttpCode, HttpStatus, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { authService } from './auth.service';
import { loginDto, registerDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: authService) { }

    @Post('register')
    @HttpCode(HttpStatus.OK)
    async register(@Body() dto: registerDto) {
        return this.authService.register(dto)
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() dto: loginDto, @Res({ passthrough: true }) res: Response) {
        const { access_token } = await this.authService.login(dto)

        res.cookie('access_token', access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 1000 * 60 * 60
        })
        return { message: 'Logged in successfully' }
    }
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(@Res({ passthrough: true }) res: Response) {
        res.clearCookie('access_token')
        return { message: 'Logged out successfully' }
    }
}