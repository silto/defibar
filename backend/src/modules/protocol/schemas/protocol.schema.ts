import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Schema as mongooseSchema } from "mongoose";

export type ProtocolDocument = HydratedDocument<Protocol>;

@Schema()
export class Protocol {
  @Prop({ required: true })
  defiLlamaId: string;

  @Prop({ required: true })
  slug: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  url: string;

  @Prop()
  symbol?: string;

  @Prop()
  description?: string;

  @Prop([String])
  chains?: string[];

  @Prop()
  logoUrl?: string;

  @Prop()
  parentProtocol?: string;

  @Prop()
  tvl?: number;

  @Prop()
  updateId?: string;
}

export const ProtocolSchema = SchemaFactory.createForClass(Protocol);

// ProtocolSchema.index({ name: "text", symbol: "text" });

/*

//defiLlama data format
{
    "id": "2198",
    "name": "Uniswap V3",
    "address": "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
    "symbol": "UNI",
    "url": "https://uniswap.org/",
    "description": "A fully decentralized protocol for automated liquidity provision on Ethereum. V2\r\n",
    "chain": "Multi-Chain",
    "logo": "https://icons.llama.fi/uniswap-v3.png",
    "audits": "2",
    "audit_note": null,
    "gecko_id": null,
    "cmcId": "1348",
    "category": "Dexes",
    "chains": [
      "Ethereum",
      "Polygon",
      "Arbitrum",
      "Optimism",
      "Celo"
    ],
    "module": "uniswap/index.js",
    "twitter": "Uniswap",
    "audit_links": [
      "https://github.com/Uniswap/uniswap-v3-core/tree/main/audits",
      "https://github.com/Uniswap/uniswap-v3-periphery/tree/main/audits",
      "https://github.com/ConsenSys/Uniswap-audit-report-2018-12"
    ],
    "oracles": [],
    "listedAt": 1666191475,
    "parentProtocol": "Uniswap",
    "slug": "uniswap-v3",
    "tvl": 3177464469.6730814,
    "chainTvls": {
      "Optimism": 54896780.27250787,
      "Ethereum": 2946592306.406377,
      "Polygon": 99486331.67575775,
      "Celo": 957473.1172081387,
      "Arbitrum": 75531578.20123078
    },
    "change_1h": -0.32202853979850943,
    "change_1d": -0.14969837638084016,
    "change_7d": 4.279613328225793
  },
*/
