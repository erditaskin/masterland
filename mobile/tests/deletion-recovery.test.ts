import test from "node:test";
import assert from "node:assert/strict";
import {
  readDeletionJournal,
  readDeletionReceipt,
  reconcileDeletion,
  type DeletionJournal,
} from "../src/account/deletionJournal";
const journal: DeletionJournal = {
  requestID: "00000000-0000-4000-8000-000000000001",
  userID: "00000000-0000-4000-8000-000000000002",
  receipt: "a".repeat(64),
  namespace: "@masterland/save/controlled-testflight/v1",
};
test("deletion journals require a random receipt and stable identities", () => {
  assert.deepEqual(readDeletionJournal(JSON.stringify(journal)), journal);
  for (const change of [
    { receipt: "short" },
    { requestID: "bad" },
    { userID: null },
    { namespace: null },
  ])
    assert.throws(() =>
      readDeletionJournal(JSON.stringify({ ...journal, ...change })),
    );
});
test("lost server response can be reconciled without an Auth session", async () => {
  const calls: string[] = [];
  const result = await reconcileDeletion(journal, {
    status: async () => ({
      request_id: journal.requestID,
      status: "completed",
      auth_deleted: true,
    }),
    reset: async (id) => {
      assert.equal(id, journal.requestID);
      calls.push("reset");
    },
    clear: async () => {
      calls.push("clear");
    },
  });
  assert.equal(result, "completed");
  assert.deepEqual(calls, ["reset", "clear"]);
});
test("pending, missing, failed and offline status never erase progress", async () => {
  for (const status of [
    null,
    {
      request_id: journal.requestID,
      status: "processing",
      auth_deleted: false,
    },
    { request_id: journal.requestID, status: "failed", auth_deleted: false },
  ]) {
    await reconcileDeletion(journal, {
      status: async () => status,
      reset: async () => {
        assert.fail("Must not erase");
      },
      clear: async () => {
        assert.fail("Must retain journal");
      },
    });
  }
  await assert.rejects(
    reconcileDeletion(journal, {
      status: async () => {
        throw Error("offline");
      },
      reset: async () => {
        assert.fail();
      },
      clear: async () => {
        assert.fail();
      },
    }),
  );
});
test("mismatched receipt cannot reset another account; reset failure retains journal", async () => {
  assert.throws(() =>
    readDeletionReceipt(
      { request_id: "other", status: "completed", auth_deleted: true },
      journal.requestID,
    ),
  );
  await assert.rejects(
    reconcileDeletion(journal, {
      status: async () => ({
        request_id: journal.requestID,
        status: "completed",
        auth_deleted: true,
      }),
      reset: async () => {
        throw Error("disk full");
      },
      clear: async () => {
        assert.fail("Must retain reset intent");
      },
    }),
  );
});
