import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
// import { CatsController } from './cats.controller';
import { ProtocolService } from "./protocol.service";
import { ProtocolResolver } from "./protocol.resolver";
import { Protocol, ProtocolSchema } from "./schemas/protocol.schema";

@Module({
  imports: [MongooseModule.forFeature([{ name: Protocol.name, schema: ProtocolSchema }])],
  providers: [ProtocolService, ProtocolResolver],
})
export class ProtocolModule {}
