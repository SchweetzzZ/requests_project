import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ZodValidationPipe } from 'nestjs-zod';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser())

  app.enableCors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })

  app.useGlobalPipes(new ZodValidationPipe())

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
