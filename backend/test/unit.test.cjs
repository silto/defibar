const assert = require("node:assert/strict");
const { test } = require("node:test");
const { ServiceUnavailableException, BadRequestException } = require("@nestjs/common");
const { AppController } = require("../dist/app.controller.js");
const { allowedFrontendOrigins } = require("../dist/cors.js");
const {
  ProtocolService,
  parseSearchLimit,
} = require("../dist/modules/protocol/protocol.service.js");

test("health checks the MongoDB connection", async () => {
  let pinged = false;
  const connected = new AppController({
    readyState: 1,
    db: {
      admin: () => ({
        ping: async () => {
          pinged = true;
        },
      }),
    },
  });
  assert.deepEqual(await connected.health(), { status: "ok" });
  assert.equal(pinged, true);

  const disconnected = new AppController({ readyState: 0 });
  await assert.rejects(disconnected.health(), ServiceUnavailableException);
  const failedPing = new AppController({
    readyState: 1,
    db: {
      admin: () => ({
        ping: async () => {
          throw new Error("offline");
        },
      }),
    },
  });
  await assert.rejects(failedPing.health(), ServiceUnavailableException);
});

test("CORS allows the configured origins and only this Pages project's previews", () => {
  assert.deepEqual(allowedFrontendOrigins({}), []);
  const origins = allowedFrontendOrigins({
    FRONTEND_URL: "https://defibar.finance",
    FRONTEND_PREVIEW_URL: "https://defibar.pages.dev",
  });
  assert.deepEqual(origins.slice(0, 2), ["https://defibar.finance", "https://defibar.pages.dev"]);
  assert.equal(origins.length, 3);
  assert.ok(origins[2].test("https://feature-123.defibar.pages.dev"));
  for (const untrusted of [
    "http://feature.defibar.pages.dev",
    "https://feature.evil.pages.dev",
    "https://feature.defibar.pages.dev.evil.com",
    "https://nested.feature.defibar.pages.dev",
  ]) {
    assert.equal(origins[2].test(untrusted), false);
  }
  assert.deepEqual(
    allowedFrontendOrigins({ FRONTEND_PREVIEW_URL: "https://preview.example.com" }),
    ["https://preview.example.com"],
  );
});

test("SEARCH_LIMIT accepts only a bounded positive integer", () => {
  assert.equal(parseSearchLimit(undefined), 10);
  assert.equal(parseSearchLimit("100"), 100);
  for (const invalid of ["0", "101", "3.5", "5junk", "-1", "Infinity", ""]) {
    assert.throws(() => parseSearchLimit(invalid), /SEARCH_LIMIT/);
  }
});

test("search uses literal regexes and bounds query length", async () => {
  let filter;
  let resultLimit;
  const model = {
    find: (value) => {
      filter = value;
      return {
        sort: () => ({
          limit: async (value) => {
            resultLimit = value;
            return [];
          },
        }),
      };
    },
  };
  const service = new ProtocolService(model);
  await service.searchProtocol("");
  assert.deepEqual(filter, {});
  assert.equal(resultLimit, 10);

  await service.searchProtocol("uni.*");
  assert.equal(filter.$or[0].name.test("uni.*swap"), true);
  assert.equal(filter.$or[0].name.test("uniswap"), false);
  assert.equal(filter.$or[1].symbol.test("UNI.*"), true);
  assert.equal(filter.$or[1].symbol.test("UNIxxx"), false);
  await assert.rejects(service.searchProtocol("a".repeat(101)), BadRequestException);
});
