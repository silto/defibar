import dotenv from "./dotenv";
dotenv.config({
  allowEmptyValues: [],
});

import { NestFactory } from "@nestjs/core";
import { Logger, LoggerErrorInterceptor } from "nestjs-pino";
import { AppModule } from "./app.module";
import { allowedFrontendOrigins } from "./cors";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  app.useGlobalInterceptors(new LoggerErrorInterceptor());
  app.enableCors({ origin: allowedFrontendOrigins(process.env), credentials: true });
  await app.listen(process.env.PORT ?? 4500, "0.0.0.0");
}
void bootstrap();
