const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const { once } = require("node:events");
const { test } = require("node:test");
const mongoose = require("mongoose");

const dbUrl = process.env.TEST_DATABASE_URL;
if (!dbUrl) throw new Error("Set TEST_DATABASE_URL to an isolated local MongoDB URL");
const parsedDbUrl = new URL(dbUrl);
if (parsedDbUrl.hostname !== "127.0.0.1" || parsedDbUrl.pathname !== "/defibar") {
  throw new Error("Integration tests may only use local 127.0.0.1/defibar");
}

const port = String(20000 + Math.floor(Math.random() * 20000));
const baseUrl = `http://127.0.0.1:${port}`;
const productionOrigin = "https://defibar.finance";
const previewOrigin = "https://ticket002.pages.dev";

async function waitForHealth(child, output) {
  for (let attempt = 0; attempt < 100; attempt++) {
    if (child.exitCode !== null) throw new Error(`API exited: ${output()}`);
    try {
      const response = await fetch(`${baseUrl}/health`);
      if (response.ok) return;
    } catch {
      // MongoDB and the HTTP listener may still be starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`API did not become healthy: ${output()}`);
}

async function search(query) {
  const response = await fetch(`${baseUrl}/graphql`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      query:
        "query Search($query: String) { searchProtocol(query: $query) { id slug name url symbol tvl } }",
      variables: { query },
    }),
  });
  assert.equal(response.status, 200);
  return response.json();
}

test("compiled API serves health, GraphQL, and scoped CORS with local MongoDB", async () => {
  const connection = await mongoose.createConnection(dbUrl).asPromise();
  const collection = connection.collection("protocols");
  const marker = `ticket002-${Date.now()}`;
  const insertedIds = [];
  let child;
  let childOutput = "";
  try {
    const inserted = await collection.insertMany([
      {
        defiLlamaId: `${marker}-a`,
        slug: `${marker}-alpha`,
        name: `${marker} Alpha`,
        url: "https://example.test/a",
        symbol: "ALPHA",
        tvl: 200,
      },
      {
        defiLlamaId: `${marker}-b`,
        slug: `${marker}-literal`,
        name: `${marker} uni.*`,
        url: "https://example.test/b",
        symbol: "UNI.*",
        tvl: 100,
      },
    ]);
    insertedIds.push(...Object.values(inserted.insertedIds));
    child = spawn(process.execPath, ["dist/main.js"], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        DATABASE_URL: dbUrl,
        PORT: port,
        NODE_ENV: "test",
        FRONTEND_URL: productionOrigin,
        FRONTEND_PREVIEW_URL: previewOrigin,
      },
      stdio: ["ignore", "pipe", "pipe"],
    });
    for (const stream of [child.stdout, child.stderr]) {
      stream.on("data", (chunk) => {
        childOutput = (childOutput + chunk.toString()).slice(-8000);
      });
    }
    await waitForHealth(child, () => childOutput);

    const health = await fetch(`${baseUrl}/health`);
    assert.deepEqual(await health.json(), { status: "ok" });

    const empty = await search("");
    assert.equal(empty.errors, undefined);
    assert.ok(empty.data.searchProtocol.some((protocol) => protocol.slug === `${marker}-alpha`));

    const named = await search(marker);
    assert.equal(named.errors, undefined);
    assert.deepEqual(
      named.data.searchProtocol.map((protocol) => protocol.slug),
      [`${marker}-alpha`, `${marker}-literal`],
    );

    const literal = await search("uni.*");
    assert.equal(literal.errors, undefined);
    assert.ok(
      literal.data.searchProtocol.some((protocol) => protocol.slug === `${marker}-literal`),
    );
    assert.ok(!literal.data.searchProtocol.some((protocol) => protocol.slug === `${marker}-alpha`));

    const longQuery = await search("a".repeat(101));
    assert.ok(longQuery.errors?.length);

    for (const origin of [
      productionOrigin,
      previewOrigin,
      "https://feature-123.ticket002.pages.dev",
    ]) {
      const preflight = await fetch(`${baseUrl}/graphql`, {
        method: "OPTIONS",
        headers: { origin, "access-control-request-method": "POST" },
      });
      assert.equal(preflight.headers.get("access-control-allow-origin"), origin);
    }
    const untrusted = await fetch(`${baseUrl}/graphql`, {
      method: "OPTIONS",
      headers: {
        origin: "https://feature-123.evil.pages.dev",
        "access-control-request-method": "POST",
      },
    });
    assert.equal(untrusted.headers.get("access-control-allow-origin"), null);
  } finally {
    if (child && child.exitCode === null) {
      child.kill("SIGTERM");
      await once(child, "exit");
    }
    if (insertedIds.length) await collection.deleteMany({ _id: { $in: insertedIds } });
    await connection.close();
  }
});
