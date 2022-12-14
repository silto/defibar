import { join } from "path";
// import { DateResolver, DateTimeResolver, GraphQLJSONObject } from "graphql-scalars";
import { Module } from "@nestjs/common";
import { LoggerModule } from "nestjs-pino";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { MongooseModule } from "@nestjs/mongoose";
import { AppService } from "@/app.service";
import { ProtocolModule } from "@/modules/protocol/protocol.module";

@Module({
  imports: [
    LoggerModule.forRoot(),
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
        // Date: DateResolver,
        // DateTime: DateTimeResolver,
        // JSONObject: GraphQLJSONObject,
      },
      playground: process.env.GRAPHQL_PLAYGROUND === "true",
      debug: process.env.NODE_ENV === "development",
    }),
    MongooseModule.forRoot(process.env.DATABASE_URL),
    ProtocolModule,
  ],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}
