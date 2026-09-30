import { createZodDto } from "nestjs-zod"
import { z } from "zod";

export const registerSchema = z.object({
    user: z.string().min(3),
    password: z.string().min(8),
})
export class registerDto extends createZodDto(registerSchema) { }

export const loginSchema = z.object({
    user: z.string().min(3),
    password: z.string().min(8),
})
export class loginDto extends createZodDto(loginSchema) { }

export const jwtPayloadSchema = z.object({
    sub: z.string(),
    name: z.string(),
})
export type JwtPayload = z.infer<typeof jwtPayloadSchema>

export interface AuthenticatedUser {
    sub: string;
    name: string;
}