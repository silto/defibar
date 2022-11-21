import { Args, Query, Resolver } from "@nestjs/graphql";
import { ProtocolService } from "@/modules/protocol/protocol.service";
import { Protocol as ProtocolSchema } from "./schemas/protocol.schema";
import { Protocol } from "@/graphql.schema";

@Resolver(() => Protocol)
export class ProtocolResolver {
  constructor(private readonly protocolService: ProtocolService) {}

  @Query(() => [Protocol], { name: "searchProtocol" })
  async searchProtocol(@Args("query") query?: string): Promise<ProtocolSchema[]> {
    return this.protocolService.searchProtocol(query);
  }
}
