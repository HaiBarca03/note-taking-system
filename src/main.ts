import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const server = app.getHttpAdapter().getInstance();
  server.get('/ping', (req, res) => {
    res.status(200).send('OK');
  });

  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://note-taking-system-2wig.onrender.com',
    'https://dh-notes.vercel.app',
  ];

  app.enableCors({
    origin: (origin, callback) => {
      // Cho phép server-to-server, graphql playground
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'), false);
    },
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('NestJS Swagger API')
    .setVersion('1.0')
    // nếu có auth Bearer thì bật dòng dưới
    // .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
