import dotenv from "../dotenv";
dotenv.config({
  allowEmptyValues: [],
});

import mongoose, { Schema, Model, InferSchemaType } from "mongoose";
import fetch from "node-fetch";
import { generateHash } from "../helpers/hash";
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
  updateId: {
    type: String,
    required: false,
  },
});
type Protocol = InferSchemaType<typeof ProtocolSchema>;
type ProtocolModel = Model<Protocol>;
// ProtocolSchema.index({ name: "text", symbol: "text" });
mongoose.model("Protocol", ProtocolSchema);
const Protocol = mongoose.model<Protocol, ProtocolModel>("Protocol");

const run = async () => {
  const updateId = generateHash(16);
  const rawlist: Record<string, unknown>[] = await fetch("https://api.llama.fi/protocols").then(
    (res) => res.json(),
  );
  console.log(rawlist[0]);
  // update or create protocols
  for (const rawProtocol of rawlist) {
    const res = await Protocol.updateOne(
      {
        defiLlamaId: rawProtocol.id,
      },
      {
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
        updateId,
      },
      {
        upsert: true,
      },
    );
    if (res.matchedCount) {
      console.log("protocol matched");
      if (res.modifiedCount) {
        console.log("protocol modified");
      }
    } else if (res.upsertedCount) {
      console.log("protocol added");
    } else {
      console.log("no match no upsert?");
    }
  }
  // cleanup
  const cleanupRes = await Protocol.deleteMany({
    updateId: {
      $ne: updateId,
    },
  });
  console.log(`cleanup: deleted ${cleanupRes.deletedCount} protocols`);
};

run();
