import { ConflictException, Inject, Injectable, UnauthorizedException, } from '@nestjs/common';
import { DRIZZLE, type DrizzleDB } from '../db/db.constants';
import { users } from './schema/schema';
import { loginDto, registerDto, jwtPayloadSchema, type JwtPayload } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class authService {
  constructor(
    @Inject(DRIZZLE) readonly db: DrizzleDB,
    private jwtService: JwtService,
  ) { }

  async register(dto: registerDto) {
    const existingUser = await this.db.query.users.findFirst({
      where: eq(users.name, dto.user),
    });

    if (existingUser) {
      throw new ConflictException(
        'Este usuário já existe. Entre na sua conta ou escolha outro nome.',
      );
    }

    const hashPass = await bcrypt.hash(dto.password, 12);
    const [created] = await this.db.insert(users).values({
      name: dto.user,
      password: hashPass,
    }).returning({
      id: users.id,
      name: users.name,
    });

    return created;
  }

  async login(dto: loginDto) {
    const user = await this.db.query.users.findFirst({
      where: eq(users.name, dto.user),
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = jwtPayloadSchema.parse({
      sub: user.id,
      name: user.name,
    });

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
