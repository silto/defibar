import dotenv from "../dotenv";
dotenv.config({
  allowEmptyValues: [],
});

import mongoose, { Schema, Model, InferSchemaType } from "mongoose";
import fetch from "node-fetch";
mongoose.connect(process.env.DATABASE_URL);

const ProtocolSchema = new Schema({
  defiLlamaId: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  symbol: {
    type: String,
    required: false,
  },
  description: {
    type: String,
    required: false,
  },
  chains: {
    type: [String],
    required: false,
  },
  logoUrl: {
    type: String,
    required: false,
  },
  parentProtocol: {
    type: String,
    required: false,
  },
  tvl: {
    type: Number,
    require: false,
  },
});
type Protocol = InferSchemaType<typeof ProtocolSchema>;
type ProtocolModel = Model<Protocol>;
// ProtocolSchema.index({ name: "text", symbol: "text" });
mongoose.model("Protocol", ProtocolSchema);
const Protocol = mongoose.model<Protocol, ProtocolModel>("Protocol");

const run = async () => {
  const rawlist: Record<string, unknown>[] = await fetch("https://api.llama.fi/protocols").then(
    (res) => res.json(),
  );
  console.log(rawlist[0]);
  for (const rawProtocol of rawlist) {
    const protocol = new Protocol({
      defiLlamaId: rawProtocol.id,
      slug: rawProtocol.slug,
      name: rawProtocol.name,
      url: rawProtocol.url,
      symbol: rawProtocol.symbol,
      description: rawProtocol.description,
      chains: rawProtocol.chains,
      logoUrl: rawProtocol.logo,
      parentProtocol: rawProtocol.parentProtocol,
      tvl: rawProtocol.tvl,
    });
    await protocol.save();
    console.log("added", protocol.name);
  }
};

run();
