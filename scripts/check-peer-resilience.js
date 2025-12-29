#!/usr/bin/env node

const assert = require("assert");
const path = require("path");

const core = require(path.join(__dirname, "..", "dist"));

assert.ok(
  typeof core.usePeerRecovery === "function",
  "Expected usePeerRecovery to be exported"
);

assert.ok(
  typeof core.useMessageHistory === "function" && typeof core.useHistoryReplay === "function",
  "Expected history helpers to be exported"
);

assert.ok(
  typeof core.PeerlessStats !== "undefined",
  "Expected PeerlessStats UI export to be available"
);

console.log("Resilience exports validated");
