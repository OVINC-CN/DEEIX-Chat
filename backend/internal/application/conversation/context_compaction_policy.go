package conversation

import "github.com/DEEIX-AI/DEEIX-Chat/backend/internal/infra/config"

type contextCompactionPolicy struct {
	AdminEnabled bool
	UserEnabled  bool
}

func (p contextCompactionPolicy) EffectiveEnabled() bool {
	return p.AdminEnabled && p.UserEnabled
}

func (s *Service) resolveContextCompactionPolicy(cfg config.Config) contextCompactionPolicy {
	return contextCompactionPolicy{
		AdminEnabled: cfg.ContextCompactEnabled,
		UserEnabled:  false,
	}
}
