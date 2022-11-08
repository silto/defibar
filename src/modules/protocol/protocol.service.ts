import { Model, Types } from "mongoose";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Protocol, ProtocolDocument } from "./schemas/protocol.schema";

const searchLimit = process.env.SEARCH_LIMIT ? parseInt(process.env.SEARCH_LIMIT) : 10;

@Injectable()
export class ProtocolService {
  constructor(@InjectModel(Protocol.name) private protocolModel: Model<ProtocolDocument>) {}

  searchProtocol = async (query?: string): Promise<Protocol[]> => {
    if (!query) {
      return this.protocolModel
        .find({})
        .sort({
          tvl: "desc",
        })
        .limit(searchLimit);
    }
    return await this.protocolModel
      .find({
        $text: {
          $search: query,
        },
      })
      .limit(searchLimit);
  };

  findOneById = async (id: Types.ObjectId | string): Promise<Protocol> => {
    return this.protocolModel.findById(id);
  };
}
