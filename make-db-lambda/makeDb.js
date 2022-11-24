"use strict";
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const fetch = require("node-fetch");
const config = require("./config/config");
const { generateHash } = require("./helpers/hash");

let conn = null;

module.exports.run = async (event, context) => {
  console.log("start run");
  try {
    context.callbackWaitsForEmptyEventLoop = false;
    if (conn == null) {
      conn = mongoose.createConnection(config.dbUrl, {
        serverSelectionTimeoutMS: 5000,
      });
      await conn.asPromise();
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
      conn.model("Protocol", ProtocolSchema);
    }
    const Protocol = conn.model("Protocol");
    const updateId = generateHash(16);

    const rawlist = await fetch("https://api.llama.fi/protocols").then((res) =>
      res.json()
    );
    console.log("got the data, updating db");
    let matched = 0;
    let modified = 0;
    let added = 0;
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
        }
      );
      if (res.matchedCount) {
        matched += 1;
        if (res.modifiedCount) {
          modified += 1;
        }
      } else if (res.upsertedCount) {
        added += 1;
      } else {
        console.log("no match no upsert?");
      }
    }
    console.log("cleanup");
    // cleanup
    const cleanupRes = await Protocol.deleteMany({
      updateId: {
        $ne: updateId,
      },
    });
    const deleted = cleanupRes.deletedCount;
    console.log(
      `Update finished.\n${matched} matched\n${modified} modified\n${added} added\n${deleted} deleted`
    );
    return true;
  } catch (error) {
    console.error("an error occured while running makeDb");
    console.error(error);
  }
};
