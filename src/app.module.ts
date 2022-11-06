import { join } from "path";
import { DateResolver, DateTimeResolver, GraphQLJSONObject } from "graphql-scalars";
import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { MongooseModule } from "@nestjs/mongoose";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      typePaths: ["./**/*.graphql"],
      cors: {
        origin: process.env.FRONTEND_URL,
        credentials: true,
      },
      definitions: {
        path: join(process.cwd(), "src/graphql.schema.ts"),
        outputAs: "class",
      },
      resolvers: {
        Date: DateResolver,
        DateTime: DateTimeResolver,
        JSONObject: GraphQLJSONObject,
      },
      playground: process.env.GRAPHQL_PLAYGROUND === "true",
      debug: process.env.NODE_ENV === "development",
    }),
    MongooseModule.forRoot(process.env.DATABASE_URL),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
