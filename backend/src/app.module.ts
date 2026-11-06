import { join } from "path";
import { Module } from "@nestjs/common";
import { LoggerModule } from "nestjs-pino";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { MongooseModule } from "@nestjs/mongoose";
import { AppController } from "./app.controller";
import { ProtocolModule } from "./modules/protocol/protocol.module";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required");

@Module({
  imports: [
    LoggerModule.forRoot(),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      typePaths: [join(__dirname, "modules/**/*.graphql")],
      graphiql: process.env.GRAPHQL_PLAYGROUND === "true",
      debug: process.env.NODE_ENV === "development",
    }),
    MongooseModule.forRoot(databaseUrl),
    ProtocolModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
