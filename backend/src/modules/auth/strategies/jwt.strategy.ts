import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import type { Request } from "express";
import type { AuthenticatedUser } from "../auth.controller";

export interface jwtPayload {
    sub: string;
    name: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request: Request): string | null => {
                    return request?.cookies?.['access_token'] ?? null;
                },
                ExtractJwt.fromAuthHeaderAsBearerToken(),
            ]),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || 'secretKey',
        });
    }

    async validate(payload: jwtPayload): Promise<AuthenticatedUser> {
        if (!payload.sub || !payload.name) {
            throw new UnauthorizedException("Token payload inválido");
        }
        return {
            userId: payload.sub,
            name: payload.name,
        };
    }
}


