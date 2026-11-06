const assert = require("node:assert/strict");
const { test } = require("node:test");
const { ServiceUnavailableException, BadRequestException } = require("@nestjs/common");
const { AppController } = require("../dist/app.controller.js");
const { allowedFrontendOrigins } = require("../dist/cors.js");
const { ProtocolService, parseSearchLimit } = require("../dist/modules/protocol/protocol.service.js");

test("health checks the MongoDB connection", async () => {
  let pinged = false;
  const connected = new AppController({
    readyState: 1,
    db: { admin: () => ({ ping: async () => { pinged = true; } }) },
  });
  assert.deepEqual(await connected.health(), { status: "ok" });
  assert.equal(pinged, true);

  const disconnected = new AppController({ readyState: 0 });
  await assert.rejects(disconnected.health(), ServiceUnavailableException);
  const failedPing = new AppController({
    readyState: 1,
    db: { admin: () => ({ ping: async () => { throw new Error("offline"); } }) },
  });
  await assert.rejects(failedPing.health(), ServiceUnavailableException);
});

test("CORS allows only configured frontend origins", () => {
  assert.deepEqual(allowedFrontendOrigins({}), []);
  assert.deepEqual(
    allowedFrontendOrigins({
      FRONTEND_URL: "https://defibar.finance",
      FRONTEND_PREVIEW_URL: "https://preview.pages.dev",
    }),
    ["https://defibar.finance", "https://preview.pages.dev"],
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
        sort: () => ({ limit: async (value) => { resultLimit = value; return []; } }),
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
