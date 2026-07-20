package conversation

import (
	"encoding/json"
	"strconv"
	"strings"

	"github.com/DEEIX-AI/DEEIX-Chat/backend/internal/application/channel"
	"github.com/DEEIX-AI/DEEIX-Chat/backend/internal/infra/config"
	"github.com/DEEIX-AI/DEEIX-Chat/backend/internal/infra/llm"
)

const (
	systemPromptModeNative     = "native"
	systemPromptModeUser       = "user"
	systemPromptModeInlineUser = "inline_user"
)

const htmlVisualPromptFormatInstruction = `<format>
  <rule>Start headings at ## and use ### for subheadings; do not use #</rule>
  <rule>Respond in the user's language</rule>
  <rule>Maintain high information density and concise writing</rule>
  <rule>Keep the response format compact and avoid loosely structured content that makes reading difficult</rule>
  <rule>Label code blocks with their language, prefer complete runnable examples, and add comments for complex logic</rule>
  <html-visual>
    <rationale>
      Markdown's fixed vertical flow has inherent limitations when expressing complex logic, including reading fatigue, weak emphasis, and the lack of true charts and horizontal layouts. Proactively assess the structural complexity of the content. When Markdown alone cannot communicate the information clearly and compactly, use live-rendered HTML as the primary presentation method rather than a secondary fallback.
    </rationale>
    <css-constraint>
Never use ` + "`" + `<style>` + "`" + ` tags, ` + "`" + `class` + "`" + ` attributes, pseudo-classes, or pseudo-elements.
Visualizations must use inline styles exclusively (` + "`" + `style="..."` + "`" + `) and rely only on Flexbox and the basic box model (padding, margin, border, box-shadow, and contrasting background colors) to establish visual hierarchy.
    </css-constraint>
    <theme-variables>
      <principle>The following global frontend CSS variables may be referenced directly in inline styles. Their semantic colors, chart colors, and shadow values automatically adapt to light and dark themes. When a visualization uses backgrounds, text, borders, shadows, accent colors, or chart colors, reference the variables with var(--variable-name) in inline styles as needed instead of hard-coding colors that work in only one theme.</principle>
      <available>
        <group name="surface-and-text">--background, --foreground, --pure, --pure-foreground, --card, --card-foreground, --popover, --popover-foreground, --primary, --primary-foreground, --secondary, --secondary-foreground, --muted, --muted-foreground, --accent, --accent-foreground, --destructive, --destructive-foreground</group>
        <group name="control-and-border">--border, --input, --ring</group>
        <group name="chart">--chart-1, --chart-2, --chart-3, --chart-4, --chart-5</group>
        <group name="sidebar">--sidebar, --sidebar-foreground, --sidebar-primary, --sidebar-primary-foreground, --sidebar-accent, --sidebar-accent-foreground, --sidebar-border, --sidebar-ring</group>
        <group name="typography">--font-sans, --font-serif, --font-mono, --font-economist, --font-chat, --font-chat-weight, --font-chat-strong-weight, --ui-font-scale, --chat-font-scale, --tracking-normal</group>
        <group name="shape-and-space">--radius, --spacing</group>
        <group name="shadow">--shadow-x, --shadow-y, --shadow-blur, --shadow-spread, --shadow-opacity, --shadow-color, --shadow-2xs, --shadow-xs, --shadow-sm, --shadow, --shadow-md, --shadow-lg, --shadow-xl, --shadow-2xl</group>
      </available>
      <constraint>Reference only the variables listed above. Do not define or override CSS custom properties in style attributes, and do not invent variable names.</constraint>
      <constraint>Use semantic colors in pairs, such as --card with --card-foreground and --primary with --primary-foreground, to ensure sufficient contrast in both themes.</constraint>
      <example>style="background:var(--card);color:var(--card-foreground);border:1px solid var(--border);border-radius:var(--radius);box-shadow:var(--shadow-sm)"</example>
    </theme-variables>
    <default-trigger>
      In the following situations, do not settle for plain Markdown lists or tables; proactively switch to embedded HTML layouts:
      <case type="logic-graph">Logic and structure diagrams: flowcharts, architecture diagrams, state machines, tree hierarchies, mind maps, and any other logic involving nodes and connections. Build them with HTML/CSS DOM structures and arrow symbols.</case>
      <case type="horizontal-layout">Horizontal and comparative layouts: multidimensional comparison matrices, pros-and-cons comparisons, parameter matrices, and side-by-side displays. Use Flexbox or Grid to make effective use of horizontal space.</case>
      <case type="info-card">Data and information cards: dense, multi-field presentations that require visual grouping and separation with borders.</case>
      <case type="space-optimize">Space optimization: when substantial content would feel fragmented and excessively long in a purely vertical layout, consolidate it with components such as collapsible details or tabs.</case>
    </default-trigger>
    <vision-plus>
      Vision+ extends visual presentation capabilities and is enabled only when the user explicitly requests it.
      <capability>Inline HTML may be used to draw vector logic diagrams, structural connections, geometric shapes, and data charts, while still complying with the restrictions below.</capability>
      <capability>More complex CSS effects and advanced interactive components may be used, but never for purely decorative purposes.</capability>
      <red-line>
        1. HTML fragments must not overwhelm the main response.
        2. Every visualization fragment must serve a specific information-presenting need.
        3. Never output a complete page structure with !DOCTYPE, html, head, or body, and never wrap the entire response in a single HTML block.
        4. Graphics are limited to flowcharts, architecture diagrams, state machines, tree hierarchies, comparison matrices, and data charts. Decorative illustrations, atmospheric imagery, landscapes, and decorative icons are prohibited.
        5. When using HTML, balance token efficiency against presentation quality, rendering complexity, and error risk. Avoid over-design that produces an unbalanced result.
        6. Use especially complex HTML visualizations with caution.
      </red-line>
    </vision-plus>
    <boundary>
      <constraint>Always output self-contained fragments only: use local rendering tags such as div, style, and script, and never output a complete page structure with !DOCTYPE, html, head, or body. Violating this boundary is a critical error.</constraint>
      <constraint>Embed HTML seamlessly in the main content flow: HTML fragments must appear naturally among Markdown text, like bold text or a list, with prose explanations complementing the visual elements. Never wrap the entire response in one large HTML block.</constraint>
    </boundary>
  </html-visual>
</format>`

const htmlVisualPromptDefaultRequire = `Use html-visual more proactively to provide the user with a higher-quality, more effective response.`

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

// resolveMessageSystemPromptInjection 合并平台、模型、项目和本次请求级系统提示词，并按路由能力决定注入方式。
func resolveMessageSystemPromptInjection(cfg config.Config, route *channel.ResolvedRoute, projectPrompt string, htmlVisualPrompt bool) systemPromptInjection {
	if route == nil {
		return systemPromptInjection{}
	}
	content := buildResolvedMessageSystemPrompt(cfg.DefaultSystemPrompt, route.ModelSystemPrompt, projectPrompt, htmlVisualPrompt)
	if content == "" {
		return systemPromptInjection{}
	}
	return systemPromptInjection{
		Content:      content,
		InlineToUser: shouldInlineSystemPromptToUser(*route),
	}
}

// buildResolvedMessageSystemPrompt 把项目指令放在全局/模型之后、请求级输出格式之前，保持优先级稳定。
func buildResolvedMessageSystemPrompt(globalPrompt string, modelPrompt string, projectPrompt string, htmlVisualPrompt bool) string {
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
	if htmlVisualPrompt {
		layers = append(layers, systemPromptLayer{
			tag:     "format",
			scope:   "request",
			content: buildHTMLVisualPromptInstruction(),
		})
	}
	return buildSystemPromptLayers(layers)
}

func buildHTMLVisualPromptInstruction() string {
	return htmlVisualPromptFormatInstruction + "\n<require>\n  " + htmlVisualPromptDefaultRequire + "\n</require>"
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
