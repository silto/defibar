const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const { test } = require("node:test");
const mongoose = require("mongoose");
const { Protocol, ProtocolSchema } = require("../dist/modules/protocol/schemas/protocol.schema.js");
const { refreshProtocols } = require("../dist/scripts/makeProtocolDb.js");

const dbUrl = process.env.TEST_DATABASE_URL;
if (!dbUrl) throw new Error("Set TEST_DATABASE_URL to an isolated local MongoDB URL");
const parsedDbUrl = new URL(dbUrl);
if (parsedDbUrl.hostname !== "127.0.0.1" || parsedDbUrl.pathname !== "/defibar") {
  throw new Error("Updater tests may only use local 127.0.0.1/defibar");
}

function protocol(id, changes = {}) {
  return {
    id,
    slug: `protocol-${id}`,
    name: `Protocol ${id}`,
    url: `https://example.org/${id}`,
    symbol: "TEST",
    description: "Test protocol",
    chains: ["Ethereum"],
    logo: `https://example.org/${id}.png`,
    parentProtocol: null,
    tvl: 100,
    ...changes,
  };
}

function feed(items, status = 200) {
  return async () => new Response(JSON.stringify(items), {
    status,
    headers: { "content-type": "application/json" },
  });
}

async function snapshot(model) {
  return model.collection.find({}).sort({ _id: 1 }).toArray();
}

test("updater refreshes once, remains unique on repeat, and rejects unsafe or partial feeds without writes", async () => {
  const connection = await mongoose.createConnection(dbUrl).asPromise();
  const collectionName = `protocols_ticket003_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  const model = connection.model(Protocol.name, ProtocolSchema, collectionName);
  try {
    const seeded = await model.collection.insertMany([
      { defiLlamaId: "a", slug: "old-a", name: "Old A", url: "https://example.org/a", chains: [] },
      { defiLlamaId: "b", slug: "old-b", name: "Old B", url: "", chains: [] },
      { defiLlamaId: "c", slug: "old-c", name: "Old C", url: "https://example.org/c", chains: [] },
    ]);
    const items = [
      protocol("a", { name: "Updated A" }),
      protocol("b", { url: " " }),
      protocol("d", { logo: null, tvl: null }),
    ];
    const first = await refreshProtocols(model, { fetchImpl: feed(items), minimumCount: 3 });
    assert.deepEqual(first, { matched: 2, modified: 2, added: 1, deleted: 1, blankUrls: 1 });
    assert.equal(await model.countDocuments(), 3);
    assert.equal((await model.findOne({ defiLlamaId: "a" }))._id.toString(), seeded.insertedIds[0].toString());
    assert.equal((await model.findOne({ defiLlamaId: "b" })).url, "");
    assert.equal(await model.countDocuments({ defiLlamaId: "c" }), 0);
    const indexes = await model.collection.indexes();
    assert.ok(indexes.some((index) => index.unique && index.key.defiLlamaId === 1));

    const repeated = await refreshProtocols(model, { fetchImpl: feed(items), minimumCount: 3 });
    assert.equal(repeated.added, 0);
    assert.equal(repeated.deleted, 0);
    assert.equal(await model.countDocuments(), 3);

    const stable = await snapshot(model);
    const invalidCases = [
      { name: "HTTP failure", fetchImpl: feed([], 503), minimumCount: 3 },
      { name: "invalid JSON", fetchImpl: async () => new Response("not JSON"), minimumCount: 3 },
      { name: "empty feed", fetchImpl: feed([]), minimumCount: 3 },
      { name: "short feed", fetchImpl: feed(items.slice(0, 2)), minimumCount: 3 },
      { name: "large count drop", fetchImpl: feed(items.slice(0, 2)), minimumCount: 2 },
      { name: "missing field", fetchImpl: feed([items[0], items[1], { ...items[2], slug: null }]), minimumCount: 3 },
      { name: "duplicate id", fetchImpl: feed([items[0], items[1], { ...items[2], id: "a" }]), minimumCount: 3 },
      { name: "script URL", fetchImpl: feed([items[0], items[1], { ...items[2], url: "javascript:alert(1)" }]), minimumCount: 3 },
      { name: "credential URL", fetchImpl: feed([items[0], items[1], { ...items[2], url: "https://user:password@example.org" }]), minimumCount: 3 },
      { name: "empty credential URL", fetchImpl: feed([items[0], items[1], { ...items[2], url: "https://@example.org" }]), minimumCount: 3 },
      { name: "control character URL", fetchImpl: feed([items[0], items[1], { ...items[2], url: "\n" }]), minimumCount: 3 },
      { name: "backslash URL", fetchImpl: feed([items[0], items[1], { ...items[2], url: "https://example.org\\@evil.test" }]), minimumCount: 3 },
      { name: "unsafe logo", fetchImpl: feed([items[0], items[1], { ...items[2], logo: "data:text/html,invalid" }]), minimumCount: 3 },
    ];
    for (const scenario of invalidCases) {
      await assert.rejects(refreshProtocols(model, scenario), undefined, scenario.name);
      assert.deepEqual(await snapshot(model), stable, `${scenario.name} changed existing data`);
    }
  } finally {
    await model.collection.drop().catch((error) => { if (error.codeName !== "NamespaceNotFound") throw error; });
    await connection.close();
  }
});

test("built CLI refuses the legacy test database before connecting", () => {
  const child = spawnSync(process.execPath, ["dist/scripts/makeProtocolDb.js"], {
    cwd: process.cwd(),
    env: { ...process.env, DATABASE_URL: "mongodb://127.0.0.1:27017/test" },
    encoding: "utf8",
    timeout: 5000,
  });
  assert.equal(child.status, 1);
  assert.match(child.stderr, /Updater failed/);
});

test("same-size feed with mostly different IDs cannot replace an existing collection", async () => {
  const connection = await mongoose.createConnection(dbUrl, { autoIndex: false }).asPromise();
  const collectionName = `protocols_ticket003_overlap_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  const model = connection.model(Protocol.name, ProtocolSchema, collectionName);
  try {
    await model.collection.insertMany(Array.from({ length: 100 }, (_, index) => ({
      defiLlamaId: `existing-${index}`,
      slug: `existing-${index}`,
      name: `Existing ${index}`,
      url: "https://example.org",
      chains: [],
    })));
    const before = await snapshot(model);
    const wrongFeed = Array.from({ length: 100 }, (_, index) => protocol(`different-${index}`));
    await assert.rejects(
      refreshProtocols(model, { fetchImpl: feed(wrongFeed), minimumCount: 100 }),
      /fewer than 90% of IDs/,
    );
    assert.deepEqual(await snapshot(model), before);
    assert.deepEqual((await model.collection.indexes()).map((index) => index.name), ["_id_"]);
  } finally {
    await model.collection.drop().catch((error) => { if (error.codeName !== "NamespaceNotFound") throw error; });
    await connection.close();
  }
});
