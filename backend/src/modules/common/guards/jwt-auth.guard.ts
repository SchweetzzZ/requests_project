import { ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    handleRequest<TUser = unknown>(err: any, user: any): TUser {
        if (err || !user) {
            throw err || new UnauthorizedException("Sessão inválida ou não autenticada")
        }
        return user
    }
}