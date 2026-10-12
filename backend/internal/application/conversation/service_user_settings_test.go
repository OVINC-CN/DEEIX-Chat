package conversation

import (
	"context"
	"errors"
	"sync"
	"sync/atomic"
	"testing"

	"github.com/DEEIX-AI/DEEIX-Chat/backend/internal/application/channel"
	appusersettings "github.com/DEEIX-AI/DEEIX-Chat/backend/internal/application/usersettings"
	domainusersettings "github.com/DEEIX-AI/DEEIX-Chat/backend/internal/domain/usersettings"
	memorycache "github.com/DEEIX-AI/DEEIX-Chat/backend/internal/infra/cache/memory"
	"github.com/DEEIX-AI/DEEIX-Chat/backend/internal/infra/config"
	"github.com/DEEIX-AI/DEEIX-Chat/backend/internal/repository"
)

type mutableUserSettingsRepository struct {
	repository.ConversationRepository
	mu        sync.RWMutex
	values    map[uint]map[string]string
	beforeGet func()
}

func (r *mutableUserSettingsRepository) GetUserSettingValue(_ context.Context, userID uint, key string) (string, error) {
	r.mu.RLock()
	value := r.values[userID][key]
	r.mu.RUnlock()
	if r.beforeGet != nil {
		r.beforeGet()
	}
	return value, nil
}

func (r *mutableUserSettingsRepository) GetUserSettingValues(_ context.Context, userID uint, keys []string) (map[string]string, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	values := make(map[string]string, len(keys))
	for _, key := range keys {
		values[key] = r.values[userID][key]
	}
	return values, nil
}

func (r *mutableUserSettingsRepository) ListByUserID(_ context.Context, userID uint) ([]domainusersettings.UserSetting, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	values := r.values[userID]
	items := make([]domainusersettings.UserSetting, 0, len(values))
	for key, value := range values {
		items = append(items, domainusersettings.UserSetting{UserID: userID, Key: key, Value: value})
	}
	return items, nil
}

func (r *mutableUserSettingsRepository) Upsert(_ context.Context, items []domainusersettings.UserSetting) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	for _, item := range items {
		if r.values[item.UserID] == nil {
			r.values[item.UserID] = make(map[string]string)
		}
		r.values[item.UserID][item.Key] = item.Value
	}
	return nil
}

func (r *mutableUserSettingsRepository) setValue(userID uint, key, value string) {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.values[userID][key] = value
}

type failingUpsertUserSettingsRepository struct {
	*mutableUserSettingsRepository
}

func (r *failingUpsertUserSettingsRepository) Upsert(_ context.Context, _ []domainusersettings.UserSetting) error {
	return errors.New("upsert failed")
}

type userSettingTestRepository interface {
	repository.ConversationRepository
	repository.UserSettingsRepository
}

func newUserSettingTestServices(repo userSettingTestRepository, runtimeCfg *config.Runtime) (*Service, *appusersettings.Service, repository.UserSettingCacheRepository) {
	cache := memorycache.New()
	conversationService := &Service{cfg: runtimeCfg, repo: repo, cache: cache}
	settingsService := appusersettings.NewService(repo)
	settingsService.SetCacheRefresher(conversationService.RefreshUserSettingCache)
	return conversationService, settingsService, cache
}

func TestFixedChatSettingsOverrideHistoricalRowsAndSharedCache(t *testing.T) {
	const userID uint = 17
	ctx := context.Background()
	historical := map[string]string{
		"chat.reasoning_content_passback": "false", "chat.context_compact_auto": "true", "chat.file_mode": "rag",
		"chat.show_token_usage": "false", "chat.show_model_info": "false", "chat.show_latency": "false",
		"chat.show_billing_cost": "false", "chat.auto_generate_title": "false", "chat.markdown_render": "false",
		"chat.reuse_model_options": "true", "chat.input_height": "loose", "chat.content_width": "wide",
		"chat.auto_generate_labels": "false", "chat.auto_expand_thinking": "true", "chat.auto_expand_tool_calls": "true",
	}
	want := map[string]string{
		"chat.reasoning_content_passback": "true", "chat.context_compact_auto": "false", "chat.file_mode": "full_context",
		"chat.show_token_usage": "true", "chat.show_model_info": "true", "chat.show_latency": "true",
		"chat.show_billing_cost": "true", "chat.auto_generate_title": "true", "chat.markdown_render": "true",
		"chat.reuse_model_options": "false", "chat.input_height": "standard", "chat.content_width": "compact",
		"chat.auto_generate_labels": "true", "chat.auto_expand_thinking": "false", "chat.auto_expand_tool_calls": "false",
	}
	repo := &mutableUserSettingsRepository{values: map[uint]map[string]string{userID: historical}}
	runtimeCfg := config.NewRuntime(config.Config{ContextCompactEnabled: true})
	conversationService, settingsService, cache := newUserSettingTestServices(repo, runtimeCfg)
	for key, value := range historical {
		version, err := cache.GetUserSettingCacheVersion(ctx, userID, key, userSettingCacheTTL)
		if err != nil {
			t.Fatal(err)
		}
		if err := cache.SetUserSettingCache(ctx, userID, key, version, value, userSettingCacheTTL); err != nil {
			t.Fatal(err)
		}
	}
	listed, err := settingsService.ListSettings(ctx, userID)
	if err != nil {
		t.Fatal(err)
	}
	for key, value := range want {
		got, err := conversationService.getUserSettingCached(ctx, userID, key)
		if err != nil || got != value || listed[key] != value {
			t.Fatalf("%s: runtime=%q listed=%q error=%v, want %q", key, got, listed[key], err, value)
		}
	}
	if !conversationService.reasoningContentPassbackEnabled(ctx, userID, &channel.ResolvedRoute{ReasoningContentPassback: true}) {
		t.Fatal("historical preference disabled reasoning passback")
	}
	if conversationService.resolveContextCompactionPolicy(ctx, runtimeCfg.Snapshot(), userID).EffectiveEnabled() {
		t.Fatal("historical preference enabled automatic compaction")
	}
	if !conversationService.autoGenerateConversationTitleEnabled(ctx, userID) {
		t.Fatal("historical preference disabled automatic titles")
	}
	if !conversationService.autoGenerateConversationLabelsEnabled(ctx, userID) {
		t.Fatal("historical preference disabled automatic labels")
	}
	policy, err := conversationService.GetChatFilePolicy(ctx, userID)
	if err != nil || policy.FileMode != "full_context" {
		t.Fatalf("file policy = %+v, error = %v", policy, err)
	}
	if _, err := settingsService.PatchSettings(ctx, userID, historical); err != nil {
		t.Fatal(err)
	}
	for key, value := range want {
		if historical[key] != value {
			t.Fatalf("%s: persisted %q, want %q", key, historical[key], value)
		}
		version, err := cache.GetUserSettingCacheVersion(ctx, userID, key, userSettingCacheTTL)
		if err != nil {
			t.Fatal(err)
		}
		got, ok, err := cache.GetUserSettingCache(ctx, userID, key, version)
		if err != nil || !ok || got != value {
			t.Fatalf("%s: refreshed cache=%q present=%v error=%v, want %q", key, got, ok, err, value)
		}
	}
	if _, err := settingsService.PatchSettings(ctx, userID, map[string]string{"chat.send_on_enter": "enter", "chat.restore_draft_on_failure": "false"}); err != nil {
		t.Fatal(err)
	}
	if historical["chat.send_on_enter"] != "enter" || historical["chat.restore_draft_on_failure"] != "false" {
		t.Fatal("configurable preferences were not preserved")
	}
	if _, err := settingsService.PatchSettings(ctx, userID, map[string]string{"chat.file_mode": "invalid"}); !errors.Is(err, appusersettings.ErrInvalidSettingValue) {
		t.Fatalf("invalid fixed setting was accepted: %v", err)
	}
}

func TestConversationSettingsCacheDoesNotRepopulateAfterRefresh(t *testing.T) {
	const userID uint = 19
	ctx := context.Background()
	readStarted := make(chan struct{})
	releaseRead := make(chan struct{})
	var blockFirstRead atomic.Bool
	blockFirstRead.Store(true)
	repo := &mutableUserSettingsRepository{
		values: map[uint]map[string]string{
			userID: {"chat.restore_draft_on_failure": "true"},
		},
		beforeGet: func() {
			if blockFirstRead.CompareAndSwap(true, false) {
				close(readStarted)
				<-releaseRead
			}
		},
	}
	conversationService, settingsService, cache := newUserSettingTestServices(repo, nil)

	readDone := make(chan struct{})
	go func() {
		defer close(readDone)
		if value, err := conversationService.getUserSettingCached(ctx, userID, "chat.restore_draft_on_failure"); err != nil || value != "true" {
			t.Errorf("initial concurrent read = %q (err %v), want true", value, err)
		}
	}()

	<-readStarted
	if _, err := settingsService.PatchSettings(ctx, userID, map[string]string{"chat.restore_draft_on_failure": "false"}); err != nil {
		t.Fatalf("patch settings: %v", err)
	}
	close(releaseRead)
	<-readDone

	version, err := cache.GetUserSettingCacheVersion(ctx, userID, "chat.restore_draft_on_failure", userSettingCacheTTL)
	if err != nil || version == "" {
		t.Fatalf("cache version = %q (err %v), want a version", version, err)
	}
	value, ok, err := cache.GetUserSettingCache(ctx, userID, "chat.restore_draft_on_failure", version)
	if err != nil || !ok || value != "false" {
		t.Fatalf("current cache = %q (ok %v, err %v), want false", value, ok, err)
	}
	if value, err := conversationService.getUserSettingCached(ctx, userID, "chat.restore_draft_on_failure"); err != nil || value != "false" {
		t.Fatalf("updated draft restore setting = %q (err %v), want false", value, err)
	}
}

func TestConversationSettingsRefreshIsSharedAcrossServiceInstances(t *testing.T) {
	const userID uint = 20
	ctx := context.Background()
	repo := &mutableUserSettingsRepository{
		values: map[uint]map[string]string{
			userID: {"chat.restore_draft_on_failure": "true"},
		},
	}
	sharedCache := memorycache.New()
	firstConversationService := &Service{repo: repo, cache: sharedCache}
	secondConversationService := &Service{repo: repo, cache: sharedCache}
	settingsService := appusersettings.NewService(repo)
	settingsService.SetCacheRefresher(firstConversationService.RefreshUserSettingCache)

	if value, err := secondConversationService.getUserSettingCached(ctx, userID, "chat.restore_draft_on_failure"); err != nil || value != "true" {
		t.Fatalf("initial second-instance read = %q (err %v), want true", value, err)
	}
	if _, err := settingsService.PatchSettings(ctx, userID, map[string]string{"chat.restore_draft_on_failure": "false"}); err != nil {
		t.Fatalf("patch settings: %v", err)
	}
	if value, err := secondConversationService.getUserSettingCached(ctx, userID, "chat.restore_draft_on_failure"); err != nil || value != "false" {
		t.Fatalf("second-instance read after refresh = %q (err %v), want false", value, err)
	}
}

func TestConversationSettingsCacheSurvivesFailedUpsert(t *testing.T) {
	const userID uint = 18
	ctx := context.Background()
	base := &mutableUserSettingsRepository{
		values: map[uint]map[string]string{
			userID: {"chat.restore_draft_on_failure": "true"},
		},
	}
	repo := &failingUpsertUserSettingsRepository{mutableUserSettingsRepository: base}
	conversationService, settingsService, cache := newUserSettingTestServices(repo, nil)

	if value, err := conversationService.getUserSettingCached(ctx, userID, "chat.restore_draft_on_failure"); err != nil || value != "true" {
		t.Fatalf("initial cached draft restore setting = %q (err %v), want true", value, err)
	}
	versionBefore, err := cache.GetUserSettingCacheVersion(ctx, userID, "chat.restore_draft_on_failure", userSettingCacheTTL)
	if err != nil {
		t.Fatalf("cache version before failed upsert: %v", err)
	}
	base.setValue(userID, "chat.restore_draft_on_failure", "false")

	if _, err := settingsService.PatchSettings(ctx, userID, map[string]string{"chat.restore_draft_on_failure": "false"}); err == nil {
		t.Fatal("expected patch settings to fail")
	}
	versionAfter, err := cache.GetUserSettingCacheVersion(ctx, userID, "chat.restore_draft_on_failure", userSettingCacheTTL)
	if err != nil || versionAfter != versionBefore {
		t.Fatalf("cache version after failed upsert = %q (err %v), want unchanged %q", versionAfter, err, versionBefore)
	}
	if value, err := conversationService.getUserSettingCached(ctx, userID, "chat.restore_draft_on_failure"); err != nil || value != "true" {
		t.Fatalf("cached draft restore setting after failed upsert = %q (err %v), want true", value, err)
	}
}
