import { Model, Types } from "mongoose";
import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Logger } from "@nestjs/common";
import { Protocol, ProtocolDocument } from "./schemas/protocol.schema";

const MAX_QUERY_LENGTH = 100;
const MAX_SEARCH_LIMIT = 100;

export function parseSearchLimit(value: string | undefined): number {
  if (value === undefined) return 10;
  if (!/^[1-9]\d*$/.test(value) || Number(value) > MAX_SEARCH_LIMIT) {
    throw new Error(`SEARCH_LIMIT must be an integer from 1 to ${MAX_SEARCH_LIMIT}`);
  }
  return Number(value);
}

const searchLimit = parseSearchLimit(process.env.SEARCH_LIMIT);

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

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
    if (query.length > MAX_QUERY_LENGTH) {
      throw new BadRequestException(`query must be at most ${MAX_QUERY_LENGTH} characters`);
    }
    const escapedQuery = escapeRegex(query);
    this.logger.log(`Search protocol - query: ${query}`);
    return await this.protocolModel
      .find({
        $or: [
          {
            name: new RegExp(escapedQuery, "i"),
          },
          {
            symbol: new RegExp(`^${escapedQuery}$`, "i"),
          },
        ],
      })
      .sort({
        tvl: "desc",
      })
      .limit(searchLimit);
  };

  findOneById = async (id: Types.ObjectId | string): Promise<Protocol | null> => {
    return this.protocolModel.findById(id);
  };
}
