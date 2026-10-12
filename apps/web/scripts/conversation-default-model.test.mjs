import assert from "node:assert/strict";
import test from "node:test";

import { loadTypeScriptFixture } from "./typescript-fixture.mjs";

const models = ["first", "system", "manual"].map((platformModelName) => ({ platformModelName }));

async function resolver({ manual = "manual", candidate = "system", candidateError = false } = {}) {
  const calls = [];
  const module = await loadTypeScriptFixture("entities/conversation/lib/conversation-default-model.ts", {
    "@/shared/api/conversation": {
      getConversationDefaultModelCandidate: async () => {
        calls.push("system");
        if (candidateError) throw new Error("unavailable");
        return { platformModelName: candidate };
      },
    },
    "@/shared/api/model": { listPublicModels: async () => models },
    "@/entities/user-settings": {
      loadUserSettingsSnapshot: async () => {
        calls.push("settings");
        return { "chat.default_model": manual };
      },
    },
  });
  return { resolve: module.resolveConversationDefaultModel, calls };
}

test("an available explicit model wins without loading defaults", async () => {
  const { resolve, calls } = await resolver();
  assert.deepEqual(await resolve({ accessToken: "session", explicitModel: " first " }), {
    platformModelName: "first", source: "explicit",
  });
  assert.deepEqual(calls, []);
});

test("an unavailable explicit model falls back to the recent manual choice", async () => {
  const { resolve, calls } = await resolver();
  assert.deepEqual(await resolve({ accessToken: "session", explicitModel: "deleted" }), {
    platformModelName: "manual", source: "user_default",
  });
  assert.deepEqual(calls, ["settings"]);
});

test("an unavailable manual choice uses the system default and ignores legacy project defaults", async () => {
  const { resolve } = await resolver({ manual: "deleted" });
  assert.deepEqual(await resolve({ accessToken: "session", projectDefaultModel: "first" }), {
    platformModelName: "system", source: "system_default",
  });
});

test("catalog refresh resolves against the supplied recent choice", async () => {
  const { resolve, calls } = await resolver({ manual: "system" });
  assert.deepEqual(await resolve({ accessToken: "session", availableModels: models, userDefaultModel: "manual" }), {
    platformModelName: "manual", source: "user_default",
  });
  assert.deepEqual(calls, []);
});

test("an unavailable or failing system default falls back to the first model", async (t) => {
  for (const options of [{ manual: "deleted", candidate: "deleted" }, { manual: "", candidateError: true }]) {
    await t.test(JSON.stringify(options), async () => {
      const { resolve } = await resolver(options);
      assert.deepEqual(await resolve({ accessToken: "session" }), {
        platformModelName: "first", source: "recommended",
      });
    });
  }
});

test("an empty catalog yields no model", async () => {
  const { resolve } = await resolver();
  assert.deepEqual(await resolve({ accessToken: "session", availableModels: [] }), {
    platformModelName: "", source: "none",
  });
});
