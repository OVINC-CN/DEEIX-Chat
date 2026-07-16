package settings

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/DEEIX-AI/DEEIX-Chat/backend/internal/infra/config"
	"github.com/gin-gonic/gin"
)

func TestGetBrandingReturnsRuntimeConfig(t *testing.T) {
	gin.SetMode(gin.TestMode)
	handler := &Handler{runtime: config.NewRuntime(config.Config{
		AppName:          "Example Backend",
		BrandTitle:       "Example Chat",
		BrandShortName:   "Example",
		BrandDescription: "Example description",
		BrandLogoURL:     "https://cdn.example.com/logo.svg",
		BrandFaviconURL:  "https://cdn.example.com/favicon.ico",
	})}
	router := gin.New()
	router.GET("/branding", handler.GetBranding)

	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, "/branding", nil))

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", recorder.Code)
	}
	if got := recorder.Header().Get("Cache-Control"); got != "no-cache" {
		t.Fatalf("unexpected cache policy: %q", got)
	}
	var body struct {
		Data BrandingResponse `json:"data"`
	}
	if err := json.Unmarshal(recorder.Body.Bytes(), &body); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if body.Data.Title != "Example Chat" || body.Data.LogoURL != "https://cdn.example.com/logo.svg" {
		t.Fatalf("unexpected branding response: %+v", body.Data)
	}
}
