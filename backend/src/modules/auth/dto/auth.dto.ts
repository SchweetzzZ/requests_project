import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const registerSchema = z.object({
  user: z.string().min(3),
  password: z.string().min(8),
});
export class registerDto extends createZodDto(registerSchema) {}

export const loginSchema = z.object({
  user: z.string().min(3),
  password: z.string().min(8),
});
export class loginDto extends createZodDto(loginSchema) {}

export const jwtPayloadSchema = z.object({
  sub: z.string(),
  name: z.string(),
});
export type JwtPayload = z.infer<typeof jwtPayloadSchema>;

export const loginResponseSchema = z.object({
  message: z.string(),
  access_token: z.string(),
});
export class LoginResponseDto extends createZodDto(loginResponseSchema) {}

export const logoutResponseSchema = z.object({
  message: z.string(),
});
export class LogoutResponseDto extends createZodDto(logoutResponseSchema) {}

export const meResponseSchema = z.object({
  userId: z.string(),
  name: z.string(),
});
export class MeResponseDto extends createZodDto(meResponseSchema) {}
