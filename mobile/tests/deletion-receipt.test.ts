import test from "node:test";
import assert from "node:assert/strict";
import { readDeletionReceipt } from "../src/account/deletionReceipt";

test("deletion success requires the matching server receipt", () => {
  const requestID = "00000000-0000-4000-8000-000000000001";
  const result = { request_id: requestID, status: "completed", auth_deleted: true };
  assert.equal(readDeletionReceipt(result, requestID).auth_deleted, true);
  assert.throws(() => readDeletionReceipt(result, "another-request"));
  assert.throws(() => readDeletionReceipt({ ...result, auth_deleted: false }, requestID));
});
