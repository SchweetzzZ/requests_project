import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ZodValidationPipe } from 'nestjs-zod';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser())

  app.enableCors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })

  app.useGlobalPipes(new ZodValidationPipe())

  const config = new DocumentBuilder()
    .setTitle('Internal Request Api')
    .setDescription('API de solicitações internas')
    .setVersion('1.0')
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('docs', app, document)

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
