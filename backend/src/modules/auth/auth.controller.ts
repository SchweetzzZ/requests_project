import { Body, Controller, Get, HttpCode, HttpStatus, Post, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { authService } from './auth.service';
import { loginDto, registerDto } from './dto/auth.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { currentUser } from '../common/decorator/current-user.decorator';

export interface AuthenticatedUser {
    userId: string;
    name: string;
}

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: authService) { }

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
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
        return { message: 'Logged in successfully', access_token }
    }
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(@Res({ passthrough: true }) res: Response) {
        res.clearCookie('access_token')
        return { message: 'Logged out successfully' }
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    @HttpCode(HttpStatus.OK)
    async getMe(@currentUser() user: AuthenticatedUser) {
        return user
    }
}