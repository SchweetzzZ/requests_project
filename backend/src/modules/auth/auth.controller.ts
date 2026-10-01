import { Body, Controller, Get, HttpCode, HttpStatus, Post, Res, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { authService } from './auth.service';
import { loginDto, registerDto, LoginResponseDto, LogoutResponseDto, MeResponseDto } from './dto/auth.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { currentUser } from '../common/decorator/current-user.decorator';

export interface AuthenticatedUser {
    userId: string;
    name: string;
}

@ApiTags('Autenticação')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: authService) { }

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Registrar um novo usuário' })
    @ApiCreatedResponse({ description: 'Usuário registrado com sucesso' })
    async register(@Body() dto: registerDto) {
        return this.authService.register(dto)
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Realizar login' })
    @ApiOkResponse({ type: LoginResponseDto })
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
    @ApiOperation({ summary: 'Realizar logout' })
    @ApiOkResponse({ type: LogoutResponseDto })
    async logout(@Res({ passthrough: true }) res: Response) {
        res.clearCookie('access_token')
        return { message: 'Logged out successfully' }
    }

    @ApiCookieAuth()
    @UseGuards(JwtAuthGuard)
    @Get('me')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Obter dados do usuário autenticado' })
    @ApiOkResponse({ type: MeResponseDto })
    async getMe(@currentUser() user: AuthenticatedUser) {
        return user
    }
}