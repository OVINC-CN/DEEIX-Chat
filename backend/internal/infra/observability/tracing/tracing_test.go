package tracing

import (
	"strings"
	"testing"

	"go.opentelemetry.io/otel/attribute"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	"go.opentelemetry.io/otel/sdk/trace/tracetest"
	"go.opentelemetry.io/otel/trace"
)

// Keep the SDK's attribute limit effective for untrusted Unicode values, including
// valid replacement characters (GHSA-q7gw-24fr-5p69).
func TestAttributeValueLengthLimit(t *testing.T) {
	for _, tt := range []struct {
		name  string
		value string
		want  string
	}{
		{"replacement characters", strings.Repeat("\uFFFD", 1000), strings.Repeat("\uFFFD", 5)},
		{"mixed replacement characters", "A\uFFFDB\uFFFDCDEF", "A\uFFFDB\uFFFDC"},
		{"ASCII", "abcdefgh", "abcde"},
		{"short Unicode", "中文", "中文"},
	} {
		t.Run(tt.name, func(t *testing.T) {
			recorder := tracetest.NewSpanRecorder()
			limits := sdktrace.NewSpanLimits()
			limits.AttributeValueLengthLimit = 5
			provider := sdktrace.NewTracerProvider(sdktrace.WithSpanProcessor(recorder), sdktrace.WithRawSpanLimits(limits))
			defer func() {
				if err := provider.Shutdown(t.Context()); err != nil {
					t.Error(err)
				}
			}()
			_, span := provider.Tracer("attribute-limit-test").Start(t.Context(), "bounded",
				trace.WithAttributes(attribute.String("initial", tt.value)))
			span.SetAttributes(attribute.String("updated", tt.value), attribute.StringSlice("slice", []string{tt.value}))
			span.End()
			spans := recorder.Ended()
			if len(spans) != 1 {
				t.Fatalf("expected one completed span, got %d", len(spans))
			}
			attrs := spans[0].Attributes()
			if len(attrs) != 3 {
				t.Fatalf("expected three attributes, got %d", len(attrs))
			}
			for _, attr := range attrs {
				if attr.Key == "slice" {
					got := attr.Value.AsStringSlice()
					if len(got) != 1 || got[0] != tt.want {
						t.Errorf("slice attribute = %.30q, want [%q]", got, tt.want)
					}
				} else if got := attr.Value.AsString(); got != tt.want {
					t.Errorf("%s attribute = %.30q, want %q", attr.Key, got, tt.want)
				}
			}
		})
	}
}

func TestEnabledUsesEndpointWhenFlagUnset(t *testing.T) {
	if !enabled(Config{Endpoint: "127.0.0.1:4317"}) {
		t.Fatal("expected endpoint to enable tracing when enabled flag is unset")
	}
}

func TestEnabledFlagOverridesEndpoint(t *testing.T) {
	disabled := false
	if enabled(Config{Enabled: &disabled, Endpoint: "127.0.0.1:4317"}) {
		t.Fatal("expected explicit disabled flag to override endpoint")
	}
}

func TestInitRequiresEndpointWhenExplicitlyEnabled(t *testing.T) {
	enabled := true
	if _, err := Init(t.Context(), Config{Enabled: &enabled}); err == nil {
		t.Fatal("expected endpoint validation error")
	}
}

func TestParseHeaders(t *testing.T) {
	headers := parseHeaders("authorization=Bearer token, x-tenant = deeix-chat, invalid")
	if headers["authorization"] != "Bearer token" {
		t.Fatalf("unexpected authorization header: %q", headers["authorization"])
	}
	if headers["x-tenant"] != "deeix-chat" {
		t.Fatalf("unexpected tenant header: %q", headers["x-tenant"])
	}
	if _, ok := headers["invalid"]; ok {
		t.Fatal("expected malformed header item to be ignored")
	}
}
