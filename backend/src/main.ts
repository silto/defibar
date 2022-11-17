import dotenv from "./dotenv";
dotenv.config({
  allowEmptyValues: [],
});

import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.SERVER_PORT ?? 4500);
}
bootstrap();
