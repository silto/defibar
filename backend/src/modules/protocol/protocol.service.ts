import { Model, Types } from "mongoose";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Logger } from "@nestjs/common";
import { Protocol, ProtocolDocument } from "./schemas/protocol.schema";

const searchLimit = process.env.SEARCH_LIMIT ? parseInt(process.env.SEARCH_LIMIT) : 10;

@Injectable()
export class ProtocolService {
  private readonly logger = new Logger(ProtocolService.name);
  constructor(@InjectModel(Protocol.name) private protocolModel: Model<ProtocolDocument>) {}

  searchProtocol = async (query?: string): Promise<Protocol[]> => {
    if (!query) {
      this.logger.log("Search protocol - no query");
      return this.protocolModel
        .find({})
        .sort({
          tvl: "desc",
        })
        .limit(searchLimit);
    }
    this.logger.log(`Search protocol - query: ${query}`);
    return await this.protocolModel
      .find({
        $or: [
          {
            name: new RegExp(`.*${query}.*`, "i"),
          },
          {
            symbol: new RegExp(`^${query}$`, "i"),
          },
        ],
      })
      .sort({
        tvl: "desc",
      })
      .limit(searchLimit);
  };

  findOneById = async (id: Types.ObjectId | string): Promise<Protocol> => {
    return this.protocolModel.findById(id);
  };
}
