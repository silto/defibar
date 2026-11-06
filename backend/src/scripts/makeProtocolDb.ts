import mongoose, { Model } from "mongoose";
import { randomBytes } from "node:crypto";
import { Protocol, ProtocolSchema } from "../modules/protocol/schemas/protocol.schema";

const FEED_URL = "https://api.llama.fi/protocols";
const MINIMUM_COUNT = 5000;
const MAX_DROP_FRACTION = 0.1;
const MINIMUM_EXISTING_FOR_OVERLAP_CHECK = 100;
const MINIMUM_OVERLAP_FRACTION = 0.9;
const BATCH_SIZE = 250;

class FeedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FeedError";
  }
}

type ProtocolInput = {
  defiLlamaId: string;
  slug: string;
  name: string;
  url: string;
  symbol?: string;
  description?: string;
  chains: string[];
  logoUrl?: string;
  parentProtocol?: string;
  tvl?: number;
};

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function requiredString(value: unknown, field: string, index: number): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new FeedError(`Protocol ${index} has an invalid ${field}`);
  }
  return value;
}

function optionalString(value: unknown, field: string, index: number): string | undefined {
  if (value === null || value === undefined) return undefined;
  if (typeof value !== "string") {
    throw new FeedError(`Protocol ${index} has an invalid ${field}`);
  }
  return value;
}

function hasUnsafeCharacters(value: string): boolean {
  return [...value].some((character) => {
    const code = character.charCodeAt(0);
    return code <= 31 || code === 127 || character === "\\";
  });
}

function safeHttpUrl(value: string, field: string, index: number): string {
  // WHATWG URL parsing otherwise strips controls and accepts backslashes as slashes.
  if (hasUnsafeCharacters(value)) {
    throw new FeedError(`Protocol ${index} has an unsafe ${field}`);
  }
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new FeedError(`Protocol ${index} has an invalid ${field}`);
  }
  if (
    !["http:", "https:"].includes(parsed.protocol) ||
    !parsed.hostname ||
    parsed.username ||
    parsed.password ||
    /^[a-z][a-z0-9+.-]*:\/\/[^/?#]*@/i.test(value.trim())
  ) {
    throw new FeedError(`Protocol ${index} has an unsafe ${field}`);
  }
  return parsed.href;
}

function parseFeed(value: unknown, minimumCount: number): { protocols: ProtocolInput[]; blankUrls: number } {
  if (!Array.isArray(value) || value.length < minimumCount) {
    throw new FeedError(`Feed has fewer than ${minimumCount} protocols`);
  }
  const seenIds = new Set<string>();
  let blankUrls = 0;
  const protocols = value.map((item: unknown, index: number): ProtocolInput => {
    if (!record(item)) throw new FeedError(`Protocol ${index} is not an object`);
    const defiLlamaId = requiredString(item.id, "id", index);
    if (seenIds.has(defiLlamaId)) throw new FeedError(`Feed has a duplicate id at protocol ${index}`);
    seenIds.add(defiLlamaId);

    const rawUrl = optionalString(item.url, "url", index);
    if (rawUrl === undefined) throw new FeedError(`Protocol ${index} has no url field`);
    if (hasUnsafeCharacters(rawUrl)) {
      throw new FeedError(`Protocol ${index} has an unsafe url`);
    }
    const url = rawUrl.trim() ? safeHttpUrl(rawUrl, "url", index) : "";
    if (!url) blankUrls++;

    const rawLogo = optionalString(item.logo, "logo", index);
    if (rawLogo && hasUnsafeCharacters(rawLogo)) {
      throw new FeedError(`Protocol ${index} has an unsafe logo`);
    }
    const logoUrl = rawLogo?.trim() ? safeHttpUrl(rawLogo, "logo", index) : undefined;
    const chains = item.chains;
    if (!Array.isArray(chains) || chains.some((chain) => typeof chain !== "string")) {
      throw new FeedError(`Protocol ${index} has invalid chains`);
    }
    const tvl = item.tvl;
    if (tvl !== null && tvl !== undefined && (typeof tvl !== "number" || !Number.isFinite(tvl) || tvl < 0)) {
      throw new FeedError(`Protocol ${index} has an invalid tvl`);
    }

    return {
      defiLlamaId,
      slug: requiredString(item.slug, "slug", index),
      name: requiredString(item.name, "name", index),
      url,
      symbol: optionalString(item.symbol, "symbol", index),
      description: optionalString(item.description, "description", index),
      chains,
      logoUrl,
      parentProtocol: optionalString(item.parentProtocol, "parentProtocol", index),
      tvl: tvl === null || tvl === undefined ? undefined : tvl as number,
    };
  });
  return { protocols, blankUrls };
}

export async function refreshProtocols(
  model: Model<Protocol>,
  options: { fetchImpl?: typeof fetch; minimumCount?: number } = {},
): Promise<{ matched: number; modified: number; added: number; deleted: number; blankUrls: number }> {
  const minimumCount = options.minimumCount ?? MINIMUM_COUNT;
  const response = await (options.fetchImpl ?? fetch)(FEED_URL, {
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new FeedError(`Feed returned HTTP ${response.status}`);
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new FeedError("Feed returned invalid JSON");
  }
  const { protocols, blankUrls } = parseFeed(body, minimumCount);
  const existing = await model.countDocuments();
  if (protocols.length < Math.ceil(existing * (1 - MAX_DROP_FRACTION))) {
    throw new FeedError("Feed is more than 10% smaller than the current database");
  }
  if (existing >= MINIMUM_EXISTING_FOR_OVERLAP_CHECK) {
    const overlap = await model.countDocuments({
      defiLlamaId: { $in: protocols.map((protocol) => protocol.defiLlamaId) },
    });
    if (overlap < Math.ceil(existing * MINIMUM_OVERLAP_FRACTION)) {
      throw new FeedError("Feed shares fewer than 90% of IDs with the current database");
    }
  }

  // Index creation and all document writes happen only after full feed validation.
  await model.createIndexes();
  const updateId = randomBytes(16).toString("hex");
  let matched = 0;
  let modified = 0;
  let added = 0;
  for (let offset = 0; offset < protocols.length; offset += BATCH_SIZE) {
    const batch = protocols.slice(offset, offset + BATCH_SIZE);
    const result = await model.bulkWrite(
      batch.map((protocol) => ({
        updateOne: {
          filter: { defiLlamaId: protocol.defiLlamaId },
          update: { $set: { ...protocol, updateId } },
          upsert: true,
        },
      })),
      { ordered: true },
    );
    matched += result.matchedCount;
    modified += result.modifiedCount;
    added += result.upsertedCount;
  }
  const cleanup = await model.deleteMany({ updateId: { $ne: updateId } });
  return { matched, modified, added, deleted: cleanup.deletedCount, blankUrls };
}

async function main(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is required");
  // The old local .env can point to production Atlas test.protocols.
  if (new URL(databaseUrl).pathname !== "/defibar") {
    throw new Error("DATABASE_URL must select the defibar database");
  }
  const connection = mongoose.createConnection(databaseUrl, { serverSelectionTimeoutMS: 5000 });
  try {
    await connection.asPromise();
    const model = connection.model<Protocol>(Protocol.name, ProtocolSchema);
    const result = await refreshProtocols(model);
    console.log(`Updater complete: ${JSON.stringify(result)}`);
  } finally {
    await connection.close();
  }
}

if (require.main === module) {
  main().catch((error: unknown) => {
    // Mongoose connection errors can contain URI details. Never log credentials.
    if (error instanceof FeedError) console.error(`Updater failed: ${error.message}`);
    else console.error(`Updater failed: ${error instanceof Error ? error.name : "unknown error"}`);
    process.exitCode = 1;
  });
}
