package conversation

import (
	"encoding/json"
	"strconv"
	"strings"

	"github.com/DEEIX-AI/DEEIX-Chat/backend/internal/application/channel"
	appuicomponent "github.com/DEEIX-AI/DEEIX-Chat/backend/internal/application/uicomponent"
	domainuicomponent "github.com/DEEIX-AI/DEEIX-Chat/backend/internal/domain/uicomponent"
	"github.com/DEEIX-AI/DEEIX-Chat/backend/internal/infra/config"
	"github.com/DEEIX-AI/DEEIX-Chat/backend/internal/ports/llm"
)

const (
	systemPromptModeNative     = "native"
	systemPromptModeUser       = "user"
	systemPromptModeInlineUser = "inline_user"
)

const htmlVisualPromptFormatInstruction = `<format>
  <rule>Start headings at ## and use ### for subheadings; never use #.</rule>
  <rule>Follow the user's language.</rule>
  <rule>Keep information dense, concise, and easy to read.</rule>
  <rule>Label code blocks with their language; prefer complete runnable code and explain complex logic.</rule>
  <html-visual>
    <rationale>Evaluate the content's structure. When plain Markdown cannot convey complex relationships clearly and compactly, use live HTML rendering for the relevant parts of the answer.</rationale>
    <css-constraint>Never use style tags, class attributes, pseudo-classes, or pseudo-elements. Use inline style attributes with Flexbox, Grid, and the basic box model (padding, margin, borders, shadows, and surfaces) to establish visual hierarchy.</css-constraint>
    <theme-variables>
      <principle>The following global CSS variables track the application's light and dark themes. Use them for backgrounds, text, borders, shadows, accents, charts, and typography; never hard-code colors that work in only one theme.</principle>
      <available>
        <group name="surface-and-text">--background, --foreground, --pure, --pure-foreground, --card, --card-foreground, --popover, --popover-foreground, --primary, --primary-foreground, --secondary, --secondary-foreground, --muted, --muted-foreground, --accent, --accent-foreground, --destructive, --destructive-foreground</group>
        <group name="control-and-border">--border, --input, --ring</group>
        <group name="chart">--chart-1, --chart-2, --chart-3, --chart-4, --chart-5</group>
        <group name="typography">--font-sans, --font-serif, --font-mono, --font-economist, --font-chat, --font-chat-weight, --font-chat-strong-weight, --ui-font-scale, --chat-font-scale, --tracking-normal</group>
        <group name="shape-and-space">--radius, --spacing</group>
        <group name="shadow">--shadow-x, --shadow-y, --shadow-blur, --shadow-spread, --shadow-opacity, --shadow-color, --shadow-2xs, --shadow-xs, --shadow-sm, --shadow, --shadow-md, --shadow-lg, --shadow-xl, --shadow-2xl</group>
      </available>
      <constraint>Reference only the listed variables. Never define or override CSS custom properties in style attributes or invent variable names.</constraint>
      <constraint>Pair semantic colors, such as --card with --card-foreground and --primary with --primary-foreground, to preserve contrast in every theme.</constraint>
      <constraint>Colors and shadows may use transparent, currentColor, calc(), or color-mix(), but every var() reference must use a listed variable.</constraint>
      <example>style="background:var(--card);color:var(--card-foreground);border:1px solid var(--border);border-radius:var(--radius);box-shadow:var(--shadow-sm)"</example>
    </theme-variables>
    <default-trigger>
      Prefer inline HTML when it communicates the following content more clearly:
      <case type="logic-graph">Flowcharts, architecture, state machines, trees, and other node-and-connection structures. Build them with HTML/CSS layout and arrow symbols.</case>
      <case type="horizontal-layout">Comparison matrices, advantages and disadvantages, parameters, and side-by-side views. Use Flexbox or Grid for horizontal layout.</case>
      <case type="info-card">Dense information with multiple fields that benefits from grouped cards and borders.</case>
      <case type="space-optimize">Long vertical content that benefits from compact grouping or details/summary disclosure.</case>
    </default-trigger>
    <vision-plus>
      Enable Vision+ only when the user explicitly requests it.
      <capability>Use richer inline HTML layouts for structural diagrams, geometry, and data charts while observing the boundaries below.</capability>
      <capability>More complex CSS effects and interactions must serve information, rather than decoration.</capability>
      <red-line>Keep visual fragments proportionate to the answer. Every fragment must communicate specific information. Never output a full !DOCTYPE/html/head/body document or wrap the entire reply in one HTML block. Limit graphics to flowcharts, architecture, state machines, trees, comparison matrices, and data charts; omit decorative illustrations, scenery, and icon ornamentation. Balance token efficiency, readability, rendering difficulty, and error risk; avoid excessive complexity.</red-line>
    </vision-plus>
    <boundary>
      <constraint>Output self-contained fragments using safe local tags such as div, section, article, aside, main, p, span, details, summary, table, and a. Never use style, script, iframe, !DOCTYPE, html, head, or body.</constraint>
      <constraint>Embed fragments naturally between Markdown explanations, like a list or an emphasized paragraph. Text and visual elements must work together; never enclose the complete response in a single large HTML block.</constraint>
    </boundary>
  </html-visual>
</format>`

const htmlVisualPromptDefaultRequire = `Use html-visual proactively when it improves the clarity and quality of the answer.`

// htmlVisualPromptComponentRouting 只在 html-visual 与交互式组件同时启用时注入。format 层的优先级高于
// ui-components 层，default-trigger 里「必须用 HTML」的条款会压过组件目录，所以分工写在 format 层并声明优先。
// 目录可能只勾选了部分组件，因此按「目录里有对应组件才用」表述，避免模型调用不存在的组件。
const htmlVisualPromptComponentRouting = `<routing>
  <rule>本次同时启用了交互式组件（见 ui-components 层）。选择表达方式时以本节为准；与上面的 default-trigger、vision-plus 冲突时，按本节执行。</rule>
  <use target="markdown">普通文字、列表、简单表格。</use>
  <use target="html-visual">说明性的静态版式：流程图、架构图、状态机、树状层级、对比矩阵、优劣势对照、信息卡、时间线、折叠收纳。</use>
  <use target="ui-components">需要用户操作或读数的数据：图表、KPI 指标、同构条目、十行以上的表格、计算与调参、排期、逐步引导、测验、文本对比。优先用 ui-components 目录里对应的组件，不要用 HTML 手绘图表或数据卡片；目录里没有对应组件时才用 HTML。</use>
  <use target="artifact">用户明确要完整网页、小游戏或可运行的前端代码：输出到语言为 html 的代码块，客户端会在侧栏预览；不要内联渲染。</use>
  <rule>判断口径：同样是对比或卡片，内容是要操作、读数的数据就用组件，是给人看的版式就用 HTML。</rule>
</routing>`

// htmlVisualPromptLiveComponentUse 生成可交互格式下 routing 的 ui-components 一行。何时用组件交给组件层的
// <when>，这里不写数字门槛，免得 format 层的优先级把它压回去；只列出本次勾选的 panel 与 widget。
func htmlVisualPromptLiveComponentUse(panel, widget bool) string {
	content := "图表、指标、同类条目与表格、计算与调参、排期、逐步引导、测验、文本对比"
	var blocks []string
	if panel {
		blocks = append(blocks, "需要联动的可交互 panel（包括讲解公式时能拖动参数的演示与示意图）")
	}
	if widget {
		blocks = append(blocks, "讲解过程用的内联交互图解（widget：动画、三维示意、流场）")
	}
	if len(blocks) > 0 {
		content += "，以及" + strings.Join(blocks, "和")
	}
	return `  <use target="ui-components">需要用户操作或读数的内容：` + content + `。何时用、用哪种以 ui-components 层的 <when> 为准，命中时优先于 html-visual；不要用 HTML 手绘图表、数据卡片或表单控件，目录里没有对应组件时才用 HTML。</use>`
}

const htmlVisualPromptComponentRequire = `按 routing 的分工选择表达方式：说明性版式积极使用 html-visual，数据与交互使用组件。`

type systemPromptInjection struct {
	Content      string
	InlineToUser bool
}

type systemPromptLayer struct {
	tag      string
	priority int
	scope    string
	override string
	rule     string
	content  string
}

type systemPromptCapabilities struct {
	SupportsSystemPrompt      *bool  `json:"supportsSystemPrompt"`
	SupportsSystemPromptSnake *bool  `json:"supports_system_prompt"`
	SystemPromptMode          string `json:"systemPromptMode"`
	SystemPromptModeSnake     string `json:"system_prompt_mode"`
}

// requestPromptOptions 是本次请求由客户端声明的输出格式能力。
type requestPromptOptions struct {
	HTMLVisual bool
	// UIComponents 是本次会话可用的交互式组件，为空时不注入目录层。
	UIComponents []domainuicomponent.Component
	// UIBlockVersion 是客户端能渲染的块格式版本，决定目录层是否说明可交互块。
	UIBlockVersion int
}

// resolveMessageSystemPromptInjection 合并平台、模型、项目和本次请求级系统提示词，并按路由能力决定注入方式。
func resolveMessageSystemPromptInjection(cfg config.Config, route *channel.ResolvedRoute, projectPrompt string, options requestPromptOptions) systemPromptInjection {
	if route == nil {
		return systemPromptInjection{}
	}
	if !cfg.UIComponentsEnabled {
		options.UIComponents = nil
	}
	content := buildResolvedMessageSystemPrompt(cfg.DefaultSystemPrompt, route.ModelSystemPrompt, projectPrompt, options)
	if content == "" {
		return systemPromptInjection{}
	}
	return systemPromptInjection{
		Content:      content,
		InlineToUser: shouldInlineSystemPromptToUser(*route),
	}
}

// buildResolvedMessageSystemPrompt 把项目指令放在全局/模型之后、请求级输出格式之前，保持优先级稳定。
func buildResolvedMessageSystemPrompt(globalPrompt string, modelPrompt string, projectPrompt string, options requestPromptOptions) string {
	layers := []systemPromptLayer{
		{tag: "platform", content: globalPrompt},
		{tag: "model", content: modelPrompt},
		{
			tag:      "project",
			override: "no",
			rule:     "Project instructions may add project context, style, and goals, but must not override platform or model instructions.",
			content:  projectPrompt,
		},
	}
	// 静态格式的客户端只勾选了 panel 或 widget 时没有可用的目录，两层都按没有组件处理。
	catalog := ""
	if len(options.UIComponents) > 0 {
		catalog = appuicomponent.CatalogPrompt(options.UIComponents, options.UIBlockVersion)
	}
	if options.HTMLVisual {
		live := options.UIBlockVersion >= domainuicomponent.BlockFormatLive
		panel, widget := appuicomponent.Capabilities(options.UIComponents)
		layers = append(layers, systemPromptLayer{
			tag:     "format",
			scope:   "request",
			content: buildHTMLVisualPromptInstruction(catalog != "", live, live && panel, live && widget),
		})
	}
	if catalog != "" {
		layers = append(layers, systemPromptLayer{
			tag:     "ui-components",
			scope:   "request",
			content: catalog,
		})
	}
	return buildSystemPromptLayers(layers)
}

// buildHTMLVisualPromptInstruction 生成 html-visual 格式层；同时启用交互式组件时追加分工说明。
// 只开 html-visual 时的输出必须逐字稳定，否则该路径的提示词缓存会失效。
func buildHTMLVisualPromptInstruction(withUIComponents bool, live bool, panel bool, widget bool) string {
	if !withUIComponents {
		return htmlVisualPromptFormatInstruction + "\n<require>\n  " + htmlVisualPromptDefaultRequire + "\n</require>"
	}
	routing := htmlVisualPromptComponentRouting
	if live {
		_, after, _ := strings.Cut(routing, `  <use target="ui-components">`)
		_, rest, _ := strings.Cut(after, "</use>")
		before, _, _ := strings.Cut(routing, `  <use target="ui-components">`)
		routing = before + htmlVisualPromptLiveComponentUse(panel, widget) + rest
	}
	return htmlVisualPromptFormatInstruction + "\n" + routing + "\n<require>\n  " + htmlVisualPromptComponentRequire + "\n</require>"
}

func buildSystemPromptLayers(layers []systemPromptLayer) string {
	active := make([]systemPromptLayer, 0, len(layers))
	for _, layer := range layers {
		layer.content = strings.TrimSpace(layer.content)
		if layer.content == "" {
			continue
		}
		layer.rule = strings.TrimSpace(layer.rule)
		active = append(active, layer)
	}
	if len(active) == 0 {
		return ""
	}
	for index := range active {
		active[index].priority = compactedSystemPromptPriority(index)
	}

	var builder strings.Builder
	builder.WriteString(`<layers order="high_to_low">`)
	builder.WriteString("\n")
	builder.WriteString("<rule>")
	builder.WriteString(cdataPromptText("Read layers from top to bottom. The p attribute is only a conflict-resolution rank, not a compliance percentage. Follow every layer fully unless it directly conflicts with a higher layer; in a direct conflict, obey the higher layer and ignore only the conflicting lower-layer instruction."))
	builder.WriteString("</rule>")
	for _, layer := range active {
		builder.WriteString("\n<")
		builder.WriteString(layer.tag)
		if layer.priority > 0 {
			builder.WriteString(` p="`)
			builder.WriteString(strconv.Itoa(layer.priority))
			builder.WriteString(`"`)
		}
		if layer.scope != "" {
			builder.WriteString(` scope="`)
			builder.WriteString(layer.scope)
			builder.WriteString(`"`)
		}
		if layer.override != "" {
			builder.WriteString(` override="`)
			builder.WriteString(layer.override)
			builder.WriteString(`"`)
		}
		builder.WriteString(">")
		if layer.rule != "" {
			builder.WriteString("\n<rule>")
			builder.WriteString(cdataPromptText(layer.rule))
			builder.WriteString("</rule>")
		}
		builder.WriteString("\n<body>")
		builder.WriteString(cdataPromptText(layer.content))
		builder.WriteString("</body>")
		builder.WriteString("\n</")
		builder.WriteString(layer.tag)
		builder.WriteString(">")
	}
	builder.WriteString("\n</layers>")
	return builder.String()
}

func compactedSystemPromptPriority(index int) int {
	switch index {
	case 0:
		return 100
	case 1:
		return 80
	case 2:
		return 60
	default:
		return 40
	}
}

func cdataPromptText(value string) string {
	return "<![CDATA[" + strings.ReplaceAll(value, "]]>", "]]]]><![CDATA[>") + "]]>"
}

// shouldInlineSystemPromptToUser 判断模型是否需要把系统提示词降级写入用户消息。
func shouldInlineSystemPromptToUser(route channel.ResolvedRoute) bool {
	mode, modeSet := systemPromptModeFromCapabilities(route.ModelCapabilitiesJSON)
	if modeSet {
		switch mode {
		case systemPromptModeUser, systemPromptModeInlineUser:
			return true
		case systemPromptModeNative:
			return !chatProtocolSupportsNativeSystemPrompt(route.Protocol)
		}
	}
	if supports, ok := supportsSystemPromptFromCapabilities(route.ModelCapabilitiesJSON); ok {
		return !supports || !chatProtocolSupportsNativeSystemPrompt(route.Protocol)
	}
	if routeLooksLikeGemma(route) {
		return true
	}
	return !chatProtocolSupportsNativeSystemPrompt(route.Protocol)
}

// chatProtocolSupportsNativeSystemPrompt 只列出已经确认能承载 system 角色的聊天协议。
func chatProtocolSupportsNativeSystemPrompt(protocol string) bool {
	switch llm.NormalizeAdapter(protocol) {
	case llm.AdapterOpenAIResponses,
		llm.AdapterOpenAIChatCompletions,
		llm.AdapterAnthropicMessages,
		llm.AdapterGoogleGenerateContent,
		llm.AdapterXAIResponses:
		return true
	default:
		return false
	}
}

func supportsSystemPromptFromCapabilities(raw string) (bool, bool) {
	payload, ok := decodeSystemPromptCapabilities(raw)
	if !ok {
		return false, false
	}
	if payload.SupportsSystemPrompt != nil {
		return *payload.SupportsSystemPrompt, true
	}
	if payload.SupportsSystemPromptSnake != nil {
		return *payload.SupportsSystemPromptSnake, true
	}
	return false, false
}

func systemPromptModeFromCapabilities(raw string) (string, bool) {
	payload, ok := decodeSystemPromptCapabilities(raw)
	if !ok {
		return "", false
	}
	for _, value := range []string{payload.SystemPromptMode, payload.SystemPromptModeSnake} {
		mode := strings.TrimSpace(strings.ToLower(value))
		if mode != "" {
			return mode, true
		}
	}
	return "", false
}

func decodeSystemPromptCapabilities(raw string) (systemPromptCapabilities, bool) {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return systemPromptCapabilities{}, false
	}
	var payload systemPromptCapabilities
	if err := json.Unmarshal([]byte(raw), &payload); err != nil {
		return systemPromptCapabilities{}, false
	}
	return payload, true
}

func routeLooksLikeGemma(route channel.ResolvedRoute) bool {
	values := []string{
		route.PlatformModelName,
		route.UpstreamModel,
		route.ModelVendor,
	}
	for _, value := range values {
		if strings.Contains(strings.ToLower(strings.TrimSpace(value)), "gemma") {
			return true
		}
	}
	return false
}

// inlineSystemPromptIntoLatestUserMessage 面向不支持 system 角色的模型，把指令注入最近一条用户消息。
func inlineSystemPromptIntoLatestUserMessage(messages []llm.Message, prompt string) []llm.Message {
	prompt = strings.TrimSpace(prompt)
	if prompt == "" {
		return messages
	}
	result := cloneLLMMessages(messages)
	for index := len(result) - 1; index >= 0; index-- {
		if result[index].Role != "user" {
			continue
		}
		result[index] = prependUserPromptInstruction(result[index], prompt)
		return result
	}
	return append([]llm.Message{{
		Role:    "user",
		Content: formatInlineSystemPrompt(prompt, ""),
	}}, result...)
}

func prependUserPromptInstruction(message llm.Message, prompt string) llm.Message {
	if len(message.Parts) == 0 {
		message.Content = formatInlineSystemPrompt(prompt, message.Content)
		return message
	}

	parts := make([]llm.ContentPart, 0, len(message.Parts)+1)
	inserted := false
	for _, part := range message.Parts {
		if !inserted && part.Kind == llm.ContentPartText {
			part.Text = formatInlineSystemPrompt(prompt, part.Text)
			inserted = true
		}
		parts = append(parts, part)
	}
	if !inserted {
		parts = append([]llm.ContentPart{{
			Kind: llm.ContentPartText,
			Text: formatInlineSystemPrompt(prompt, message.Content),
		}}, parts...)
	}
	message.Parts = parts
	return message
}

func formatInlineSystemPrompt(prompt string, userContent string) string {
	prompt = strings.TrimSpace(prompt)
	userContent = strings.TrimSpace(userContent)
	if userContent == "" {
		return "<system_instructions>\n" + prompt + "\n</system_instructions>"
	}
	return "<system_instructions>\n" + prompt + "\n</system_instructions>\n\n<user_message>\n" + userContent + "\n</user_message>"
}
