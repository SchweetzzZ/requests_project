import { Module } from "@nestjs/common"
import { DbModule } from "../db/db.module"
import { authService } from "./auth.service"
import { JwtModule } from "@nestjs/jwt"
import * as dotenv from "dotenv"
import { AuthController } from "./auth.controller"
dotenv.config()

@Module({
    imports: [
        DbModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: '1h' },
        }),
    ],
    controllers: [AuthController],
    providers: [authService],
})
export class AuthModule { }