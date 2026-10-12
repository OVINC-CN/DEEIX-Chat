import assert from "node:assert/strict";
import test from "node:test";

import { loadTypeScriptFixture } from "./typescript-fixture.mjs";

async function settings(platform = "ctrl_enter") {
  return loadTypeScriptFixture("features/settings/utils/chat-settings.ts", {
    "@/shared/lib/platform-shortcuts": { platformSendShortcut: () => platform },
    "@/entities/model": { resolveModelPresentationGroup: () => ({ key: "default" }) },
  });
}

test("historical settings cannot override fixed chat policies", async () => {
  const { parseChatSettings, DEFAULT_CHAT_SETTINGS } = await settings();
  const fixed = {
    fileMode: "full_context", showTokenUsage: true, showModelInfo: true, showLatency: true,
    showBillingCost: true, markdownRender: true, autoGenerateTitle: true, autoGenerateLabels: true,
    reasoningContentPassback: true, contextCompactAuto: false, reuseModelOptions: false,
    autoExpandThinking: false, autoExpandToolCalls: false, inputHeight: "standard", contentWidth: "compact",
  };
  const legacy = {
    "chat.file_mode": "rag", "chat.show_token_usage": "false", "chat.show_model_info": "false",
    "chat.show_latency": "false", "chat.show_billing_cost": "false", "chat.markdown_render": "false",
    "chat.auto_generate_title": "false", "chat.auto_generate_labels": "false", "chat.reasoning_content_passback": "false",
    "chat.context_compact_auto": "true", "chat.reuse_model_options": "true", "chat.auto_expand_thinking": "true",
    "chat.auto_expand_tool_calls": "true", "chat.input_height": "loose", "chat.content_width": "wide",
  };
  for (const actual of [DEFAULT_CHAT_SETTINGS, parseChatSettings({}), parseChatSettings(legacy)]) {
    assert.deepEqual(Object.fromEntries(Object.keys(fixed).map((key) => [key, actual[key]])), fixed);
  }
});

test("unfixed preferences retain their saved values, including upstream processing visibility", async () => {
  const { parseChatSettings } = await settings();
  const saved = parseChatSettings({
    "chat.default_model": "manual", "chat.send_on_enter": "enter", "chat.show_process_trace": "false",
    "chat.restore_draft_on_failure": "false", "chat.preserve_conversation_drafts": "false",
    "chat.delete_conversation_files_by_default": "true",
  });
  assert.equal(saved.defaultModel, "manual");
  assert.equal(saved.sendShortcut, "enter");
  assert.equal(saved.showProcessTrace, false);
  assert.equal(saved.restoreDraftOnFailure, false);
  assert.equal(saved.preserveConversationDrafts, false);
  assert.equal(saved.deleteFilesByDefault, true);
});

test("new users and saved modifier shortcuts follow the current platform while explicit Enter remains", async () => {
  for (const platform of ["ctrl_enter", "meta_enter"]) {
    const { parseSendShortcut } = await settings(platform);
    for (const value of [undefined, "", "ctrl_enter", "meta_enter", "unknown"]) {
      assert.equal(parseSendShortcut(value), platform);
    }
    assert.equal(parseSendShortcut("enter"), "enter");
  }
});
