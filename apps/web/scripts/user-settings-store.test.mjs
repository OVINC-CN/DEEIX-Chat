import assert from "node:assert/strict";
import test from "node:test";

import { loadTypeScriptFixture } from "./typescript-fixture.mjs";

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

async function fixture(t, getUserSettings = async () => ({ "chat.default_model": "initial" })) {
  // The production store retains unsubscribed sessions for a minute. Tests drive that clock.
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const calls = [];
  const store = await loadTypeScriptFixture("entities/user-settings/model/user-settings-store.ts", {
    react: {},
    "@/shared/auth/auth-session-context": { useAuthSession: () => ({ accessToken: "session" }) },
    "@/shared/api/user-settings": {
      getUserSettings,
      patchUserSettings: (token, changes) => {
        const response = deferred();
        calls.push({ token, changes, response });
        return response.promise;
      },
    },
  });
  return { store, calls };
}

test("rapid choices are sent in order and an older response preserves the latest optimistic model", async (t) => {
  const { store, calls } = await fixture(t);
  await store.loadUserSettingsSnapshot("session");
  const first = store.updateUserSettings("session", { "chat.default_model": "one" });
  const last = store.updateUserSettings("session", { "chat.default_model": "two" });
  await Promise.resolve();
  assert.equal(calls.length, 1);
  assert.equal(store.readUserSettingsSnapshot("session").settings["chat.default_model"], "two");
  calls[0].response.resolve({ "chat.default_model": "one", server: "fresh" });
  await first;
  assert.equal(calls.length, 2);
  assert.deepEqual(calls.map((call) => call.changes["chat.default_model"]), ["one", "two"]);
  assert.equal(store.readUserSettingsSnapshot("session").settings["chat.default_model"], "two");
  calls[1].response.resolve({ "chat.default_model": "two", server: "fresh" });
  await last;
  assert.deepEqual(store.readUserSettingsSnapshot("session").settings, { "chat.default_model": "two", server: "fresh" });
});

test("unsubscribe and remount share the outstanding save queue", async (t) => {
  const { store, calls } = await fixture(t);
  const unmount = store.subscribeUserSettings("session", () => {});
  await store.loadUserSettingsSnapshot("session");
  const first = store.updateUserSettings("session", { "chat.default_model": "one" });
  unmount();
  const remounted = store.subscribeUserSettings("session", () => {});
  const last = store.updateUserSettings("session", { "chat.default_model": "two" });
  await Promise.resolve();
  assert.equal(calls.length, 1);
  calls[0].response.resolve({ "chat.default_model": "one" });
  await first;
  assert.equal(store.readUserSettingsSnapshot("session").settings["chat.default_model"], "two");
  calls[1].response.resolve({ "chat.default_model": "two" });
  await last;
  remounted();
});

test("a superseded failed save does not undo the latest choice or block its request", async (t) => {
  const { store, calls } = await fixture(t);
  await store.loadUserSettingsSnapshot("session");
  const first = store.updateUserSettings("session", { "chat.default_model": "one" });
  const last = store.updateUserSettings("session", { "chat.default_model": "two" });
  await Promise.resolve();
  calls[0].response.reject(new Error("earlier save failed"));
  await first;
  assert.equal(calls.length, 2);
  assert.equal(store.readUserSettingsSnapshot("session").settings["chat.default_model"], "two");
  calls[1].response.resolve({ "chat.default_model": "two" });
  await last;
});

test("the last save failure is surfaced and rolls back to the previous saved model", async (t) => {
  const { store, calls } = await fixture(t);
  await store.loadUserSettingsSnapshot("session");
  const first = store.updateUserSettings("session", { "chat.default_model": "one" });
  const last = store.updateUserSettings("session", { "chat.default_model": "two" });
  const failure = assert.rejects(last, /last save failed/);
  await Promise.resolve();
  calls[0].response.resolve({ "chat.default_model": "one" });
  await first;
  calls[1].response.reject(new Error("last save failed"));
  await failure;
  assert.equal(store.readUserSettingsSnapshot("session").settings["chat.default_model"], "one");
});

test("a stale settings read cannot replace a more recent optimistic selection", async (t) => {
  const loading = deferred();
  const { store, calls } = await fixture(t, () => loading.promise);
  const read = store.loadUserSettingsSnapshot("session");
  const write = store.updateUserSettings("session", { "chat.default_model": "new" });
  await Promise.resolve();
  loading.resolve({ "chat.default_model": "old" });
  await read;
  assert.equal(store.readUserSettingsSnapshot("session").settings["chat.default_model"], "new");
  calls[0].response.resolve({ "chat.default_model": "new" });
  await write;
});

test("separate sessions write independently", async (t) => {
  const { store, calls } = await fixture(t);
  const first = store.updateUserSettings("session-a", { "chat.default_model": "one" });
  const second = store.updateUserSettings("session-b", { "chat.default_model": "two" });
  await Promise.resolve();
  assert.deepEqual(calls.map((call) => call.token), ["session-a", "session-b"]);
  calls[1].response.resolve({ "chat.default_model": "two" });
  calls[0].response.resolve({ "chat.default_model": "one" });
  await Promise.all([first, second]);
  assert.equal(store.readUserSettingsSnapshot("session-a").settings["chat.default_model"], "one");
  assert.equal(store.readUserSettingsSnapshot("session-b").settings["chat.default_model"], "two");
});
