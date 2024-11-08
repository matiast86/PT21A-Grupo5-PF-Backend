import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { UsersSeed } from './seeds/users/users-seeds';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //Seeds
  const usersSeed = app.get(UsersSeed);
  await usersSeed.seed();
  console.log('Users injection completed');

  //Swagger OpenApi settings

  const swaggerConfig = new DocumentBuilder()
    .setTitle('online-courses-platform')
    .setDescription('Description')
    .setVersion('0.0.1')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
