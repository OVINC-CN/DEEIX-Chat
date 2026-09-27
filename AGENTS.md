# Agent 协作与 OVINC 定制约定

本文件适用于整个仓库，记录 `dev` 分支的产品定制和后续开发需要保持的行为。基线为 2026-09-27 的合并提交 `1b5fbcfdda3ce425ff616070d5ba042cdb690893`（`chore: self improvement`）；可用 `git show 1b5fbcfd` 查看原始差异。用户后续明确提出的新要求优先于本文件，改变这些约定时同步更新说明。

## 工作方式与仓库入口

- **不要启动 Web 或 API 服务。** 用户已明确禁止启动开发服务；不要运行 `pnpm dev`、`dev:web`、`dev:api`、`next dev`、`next start`、`make run`、`go run ./cmd/server` 或启动编译后的 API，也不要通过桌面开发模式或临时预览绕过限制。测试、静态检查和编译可以执行；需要运行服务时，必须先获得用户新的明确授权。
- 开始工作先检查分支和工作区，保留用户已有的提交、修改与未跟踪文件。当前定制基于 `apps/web`，不要从 `dev-archive` 整体覆盖旧 `frontend` 实现或依赖。
- `apps/web` 是 Next.js 静态导出的业务界面；`apps/desktop` 是复用该产物的 Tauri 壳；`backend` 是 Go API。共享客户端逻辑位于 `packages/core`，生成的接口类型位于 `packages/api-contract`。
- 修改 Web 前阅读 `apps/web/AGENTS.md` 及已安装 Next.js 的相关指南：`apps/web/node_modules/next/dist/docs/`。保留子目录文件中 Next.js 自动维护的规则块。
- 架构说明见 `docs/ARCHITECTURE.md`，品牌说明见 `docs/BRANDING.md`，接口生成说明见 `backend/docs/README.md`。旧文档中的发布流程等可能滞后，核对当前源码与脚本。
- 保留桌面支持、模型分组、xAI、多模态、知识库检索和 Token 预算保护。品牌定制只修改显示名称与素材，保留 `DEEIX` 的包名、应用标识、存储键、许可证和版权声明。
- 版本由根目录 `VERSION` 和 `scripts/sync-version.mjs` 统一管理，不单独修改某个客户端的版本。

## 品牌、样式与入口精简

- 默认显示品牌是 **OVINC Chat**，简称 **OVINC**；登录、引导、邮件、浏览器通知及开发者控制台横幅使用 OVINC 品牌。
- 品牌 Logo **直接使用 PNG**：浅色 `/logo.png`，深色 `/logo-white.png`，favicon `/favicon.png`。旧 `logo.svg`、`logo-black.svg`、`logo-color.svg`、`logo-white.svg` 已删除。不要重新添加引用外部 PNG 的 SVG 包装文件，它们曾造成 Logo 空白。
- 品牌配置仍通过后端 `/api/v1/branding` 提供，自定义 `logoURL` 等配置继续兼容。主要入口是 `apps/web/shared/config/branding.ts`、`branding-provider.tsx`、`shared/components/app-logo.tsx` 和 `powered-by-deeix.tsx`。图标库、身份提供商图标和 Artifact 的 SVG 支持仍存在，品牌 PNG 策略不要求删除这些能力。
- 采用黑白语义配色、JetBrains Mono 和精简欢迎页。保留基础明暗主题；不恢复彩色预设、字体/字号偏好提供器与同步、外观设置、聊天宽度设置或输入高度设置。聊天内容最大宽度固定 **800px**，输入高度固定 `standard`。
- 界面固定简体中文：`DEFAULT_LOCALE`、根布局 `lang`、`AppI18nProvider` 和 `i18n/messages.ts` 使用 `zh-CN`；旧用户语言、Cookie 和浏览器语言不改变显示语言。兼容类型与旧翻译文件保留，不表示恢复语言切换入口。
- “Skills & Prompts”的导航名称与页面标题改为 **提示词**。保留 `/skills-prompt` 路由与 `skillsPrompt` 内部标识；该页面只展示提示词管理，Skills 管理页签已隐藏。
- 设置中的“订阅”入口改名为 **账单**；保留原来的 `/setting/subscription` 路由与接口语义。
- 用户菜单和管理侧栏隐藏公告入口；公告 API、页面和 `AnnouncementDialogHost` 仍保留，不把隐藏入口误认为删除公告业务。
- 初始化引导保留欢迎、账户、时区和完成步骤，移除语言、外观及两步验证引导。账户设置中的密码、两步验证等安全能力继续保留。
- 聊天中移除语音输入、助手点赞/踩和快捷记忆操作，保留设置页的记忆管理。发送/停止按钮使用圆形 `ArrowUp` / `Square`；常规交互使用静态 Lucide 图标及一致的光标，加载进度仍可使用动画。
- 关于页精简外链，保留版本、版权、许可证和内置 OVINC Logo。
- Toast 通知固定 **右上角**。`apps/web/components/ui/sonner.tsx` 在展开 props 后强制 `position="top-right"`；通知位置设置和本地偏好读取已删除，旧配置必须被忽略。回复完成通知的启用开关仍保留。

## 固定聊天行为：不是普通默认值

以下设置是运行策略，**历史数据库值、共享缓存、前端缓存和旧客户端的合法写入都不能改变实际行为**。不要只改默认值或只隐藏开关。

| 用户设置键 | 固定值 / 行为 |
| --- | --- |
| `chat.file_mode` | `full_context` |
| `chat.show_token_usage` | `true` |
| `chat.show_model_info` | `true` |
| `chat.show_latency` | `true` |
| `chat.show_billing_cost` | `true`，实际费用展示仍受计费功能可用性限制 |
| `chat.markdown_render` | `true` |
| `chat.auto_generate_title` | `true` |
| `chat.auto_generate_labels` | `true` |
| `chat.reasoning_content_passback` | `true`，保留协议/路由能力限制 |
| `chat.context_compact_auto` | `false` |
| `chat.reuse_model_options` | `false` |
| `chat.auto_expand_thinking` | `false` |
| `chat.auto_expand_tool_calls` | `false` |
| `chat.input_height` | `standard` |
| `chat.content_width` | `compact`，对应最大宽度 800px |

- 后端统一规则位于 `backend/internal/application/usersettings/service.go` 的 `FixedValue`。`ListSettings` 覆盖历史值；`PatchSettings` 先验证旧键/旧枚举是否合法，再将合法写入规范为固定值。保留这些设置键的 API 兼容，非法输入继续报错。
- `backend/internal/application/conversation/service_cache.go` 的 `getUserSettingCached` **在访问缓存或数据库前**返回固定值，防止旧缓存恢复已停用的行为。标题/标签生成等运行入口使用这一读取方式，不能绕回原始仓储值。
- 文件策略入口是 `service_file_pipeline.go`；附件全文处理保持上传大小、全文上限、上下文预算等保护。知识库仍独立进行检索，不能因文件模式固定为全文就关闭知识库 RAG。
- 前端对应 `features/settings/utils/chat-settings.ts`、`hooks/use-settings-chat-preferences.ts` 和 `features/chat/hooks/use-chat-model-options.ts`；加载前后的行为必须一致。消息及 Markdown 组件的自动展开默认值也为关闭。
- “显示与渲染”的三个开关已全部移除：**自动生成标签开启；自动展开深度思考、自动展开工具调用关闭**。用户仍可手动展开详情。
- 发送快捷键、失败后恢复草稿、保留会话草稿、删除会话时默认删除文件等其余设置保留已有语义，不把所有用户设置一并固定。

## 模型选择与保存

- `chat.default_model` 表示最近手动选择的模型，仅在用户主动切换模型时保存。自动初始化、无效模型回退、读取会话运行记录及媒体任务的自动模型切换，不应写回该设置。
- 新对话依次选择：**最近手动选择 → 系统默认 → 首个可用模型**。显式传入的可用模型仍优先；不可用模型必须进入回退逻辑。
- 已有会话优先沿用最近一次运行的模型，保留用户在当前会话手动切换的选择。
- 前端入口：`apps/web/shared/model/conversation-default-model.ts` 与 `features/chat/hooks/use-chat-model-options.ts`。手动选择与自动选择使用独立入口，不把所有 setter 都接入持久化。
- `apps/web/shared/model/user-settings-store.ts` 对同一会话令牌的设置写入进行排队，乐观更新与响应合并保留最新选择；不得删除这一顺序保护。快速连续切换和组件重挂载不能让旧请求覆盖新选择，最后一次保存失败必须提示。
- 新用户默认 Ctrl/Cmd+Enter 发送；显式保存过 `enter` 的用户继续使用 Enter。`ctrl_enter` / `meta_enter` 按当前平台统一处理，保留快捷键偏好入口。

## 项目配置：隐藏字段与停用字段的区别

- 项目默认模型选择器、加载与提示均已移除。前端默认模型解析和后端 `CreateConversation` 都不再用项目 `DefaultModel` 补选模型。
- 项目 `defaultModel` / `DefaultModel` 的 API 存取和数据库字段继续保留，显式写入仍按现有规则验证；不删除列、不清历史值。它仅是兼容数据，不影响运行模型选择。
- 项目默认 MCP 和 Skills 的配置入口隐藏，但已有配置的运行语义继续保留。**不能套用项目模型的停用策略来禁用 MCP 或 Skills。**
- 项目编辑仅提交可见字段；省略 `defaultModel`、`mcpDefaultMode`、`defaultMCPToolIDs`、`defaultSkillIDs`，而不是提交空字符串或空数组。隐藏字段的历史数据，包括已不可用的旧选择，都要保留。
- 保留当前项目的名称、系统提示词和知识库配置。编辑知识库不应顺带规范或清空隐藏 MCP/Skills/模型字段。
- 前端入口为 `features/layouts/components/navigation/project-dialog.tsx` 的 `ProjectDraft` 和 `nav-projects.tsx` 的提交逻辑；后端入口为 `service_project.go` 的局部更新与 `service_conversation.go` 的创建会话逻辑。

## HTML 视觉提示、Artifacts 与 PWA

- HTML 视觉提示在没有保存偏好时默认开启，**用户显式保存的 `false` 必须继续生效**；这不是强制开启策略。入口为 `features/chat/hooks/use-chat-visual-prompt.ts`，保留存储键 `deeix-chat:html-visual-prompt:v1`。
- HTML 视觉提示词采用英文，位于 `backend/internal/application/conversation/system_prompt.go`。使用当前 Web 的 CSS 语义变量，保留现有 UI Components 提示词层和安全渲染边界。
- 内联视觉输出仅使用安全 HTML 片段与内联样式；不允许整页 `html/head/body`、`style/script/iframe` 或放宽消毒规则。完整 Artifact 的预览隔离仍由现有实现处理，不混淆两种渲染场景。
- Artifact 拖动比例按实际工作区宽度限制，为聊天区保留至少 **360px**；比例下限为 1/3，工作区不足 540px 时转为独立预览，并保留原有窄屏策略。入口为 `use-chat-artifact-resize.ts`、`use-chat-artifacts.ts`、`app-chat-area.tsx` 和 `sections/chat-artifact.tsx`。
- 不重新加入归档方案中的**侧栏 150ms 延迟**或**构建时 HTML 注入**，这两项未迁入。
- 已删除 PWA manifest 路由、品牌接口的 PWA 图标字段、页面 manifest/安装图标链接和图标生成流程；同步的配置示例、Swagger 与 TypeScript 合约也已删除相应内容。
- 必须保留 `apps/web/shared/pwa/migrations/legacy-service-worker-migration.tsx` 的旧 Service Worker 清理机制。普通 favicon、品牌 PNG 和浏览器通知图标继续保留。

## 工程配置与合约维护

- OpenTelemetry 主包、trace、metric、sdk 和 OTLP trace exporter 系列统一升级到 **1.45.0**；保持 `dev` 当前依赖与 Biome，不从归档分支降级。基线同时更新了 Go 间接依赖、pnpm 完整包管理器校验信息和 lockfile；后续安装以现有配置/锁文件为准。
- `.github/workflows/` 目前仅保留 `ghcr-image.yml`。两个 metadata 步骤都设置 `latest=false`；仅 `main` 的显式规则发布 `latest`，分支/版本标签不能自动生成 `latest`。
- 已清理旧 CI、CodeQL、桌面/Release Tag/Docker Hub 发布和 stale 工作流、GitHub issue/PR 模板及仓库治理文档，以及 `.codex/skills/release-note-writer`。根 `README.md` 已简化为标题。这些是本次提交的有意变更，不在合并上游或修复文档时顺手恢复。
- HTTP 路由、DTO、验证标签或 Swagger 注释变化时，从后端源码修改，运行 `pnpm api:generate` 同步 `backend/docs/{docs.go,swagger.json,swagger.yaml}` 和 `packages/api-contract/src/types.generated.ts`，再运行 `pnpm api:check`。不手工改生成文件来掩盖源码合约问题。
- 保持现有平台边界：Tauri API 仅由 Web 的 `shared/platform` 访问；不加入 JS 读取桌面 refresh token 的命令，也不恢复 localStorage 中的服务器地址副本。

## 不启动服务的验证方式

根据改动范围选择检查，不为纯文档或文案变更重复执行完整构建。

| 范围 | 命令（从仓库根目录执行） |
| --- | --- |
| Web lint、类型与架构 | `pnpm --filter @deeix/web check` |
| Web 生产静态构建 | `pnpm --filter @deeix/web build` |
| 后端完整测试 | `pnpm --filter @deeix/api test`，等同于在 `backend` 执行 `go test ./...` |
| 后端版本及质量检查 | `pnpm --filter @deeix/api check`，包含 gofmt、go vet、staticcheck、deadcode |
| API 合约生成 / 校验 | `pnpm api:generate` / `pnpm api:check` |
| 桌面编译检查 | `pnpm --filter @deeix/desktop check`（需要 Rust 与平台工具链，仅编译 sidecar 和执行 cargo check） |
| 桌面脚本测试 | `pnpm --filter @deeix/desktop test` |

后端相关回归测试包括 `service_user_settings_test.go`（历史设置、共享缓存和固定写入）、`service_project_test.go`（项目模型失效、隐藏字段保留）、`service_file_context_test.go`（附件全文、知识库检索及预算保护）和 `system_prompt_test.go`。

前端改动重点验证快速连续切换模型、刷新/新建对话、模型失效回退、保存失败提示、项目编辑保留隐藏字段，以及 HTML 显式关闭、明暗模式、Artifact 拖动和窄屏预览。用户未授权运行服务时，用无需服务的测试/静态检查验证，并如实说明未完成的交互联调。

**测试脚本状态：** 基线提交给 Web 新增了 `pnpm test` 命令（`node --test scripts/*.test.mjs`），但未收录匹配的测试脚本；记录时工作区也无该脚本。不能据此认为干净检出已有前端回归覆盖。后续补测时先确认或补齐测试文件，再运行对应命令，并更新本条状态。
