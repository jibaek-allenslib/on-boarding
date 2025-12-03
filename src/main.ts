import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global Validation Pipe //
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger Setup //
  const config = new DocumentBuilder()
    .setTitle('FanPlus On Boarding')
    .setDescription('FanPlus On Boarding API 문서')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'JWT 액세스 토큰을 입력하세요',
        in: 'header',
      },
      'bearer',
    )
    .build();
  const documents = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger-ui/index.html', app, documents, {
    swaggerOptions: {
      filter: true,
      displayRequestDuration: true,
    },
  });

  await app.listen(process.env.PORT ?? 7885);
}
bootstrap();
