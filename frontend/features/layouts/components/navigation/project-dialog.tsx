"use client";

import * as React from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useDialogSnapshot } from "@/shared/hooks/use-dialog-snapshot";

export type ProjectDraft = {
  publicID?: string;
  name: string;
  systemPrompt: string;
};

export function ProjectDialog({
  draft,
  setDraft,
  onOpenChange,
  onSubmit,
}: {
  draft: ProjectDraft | null;
  setDraft: React.Dispatch<React.SetStateAction<ProjectDraft | null>>;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void | Promise<void>;
}) {
  const t = useTranslations("recent.projects");
  const [submitting, setSubmitting] = React.useState(false);
  const stableDraft = useDialogSnapshot(draft);
  const open = Boolean(draft);
  const nameInputID = React.useId();
  const systemPromptInputID = React.useId();

  React.useEffect(() => {
    if (!draft) {
      setSubmitting(false);
    }
  }, [draft]);

  const handleSubmit = React.useCallback<React.FormEventHandler<HTMLFormElement>>(
    async (event) => {
      event.preventDefault();
      if (!draft?.name.trim() || submitting) {
        return;
      }
      setSubmitting(true);
      try {
        await onSubmit();
      } finally {
        setSubmitting(false);
      }
    },
    [draft?.name, onSubmit, submitting],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden sm:max-w-xl">
        <form className="contents" onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{stableDraft?.publicID ? t("editTitle") : t("createTitle")}</DialogTitle>
            <DialogDescription>{stableDraft?.publicID ? t("editDescription") : t("createDescription")}</DialogDescription>
          </DialogHeader>

          <div className="min-h-0 space-y-4 overflow-y-auto px-0.5">
            <div className="space-y-1">
              <label htmlFor={nameInputID} className="text-xs text-muted-foreground">
                {t("nameLabel")}
              </label>
              <Input
                id={nameInputID}
                autoFocus
                value={stableDraft?.name ?? ""}
                maxLength={80}
                placeholder={t("namePlaceholder")}
                onChange={(event) => {
                  setDraft((current) => current ? { ...current, name: event.target.value } : current);
                }}
                disabled={submitting}
                required
              />
            </div>
            <div className="space-y-1">
              <label htmlFor={systemPromptInputID} className="text-xs text-muted-foreground">
                {t("systemPromptLabel")}
              </label>
              <Textarea
                id={systemPromptInputID}
                value={stableDraft?.systemPrompt ?? ""}
                maxLength={12000}
                placeholder={t("systemPromptPlaceholder")}
                className="h-32 resize-none overflow-y-auto [field-sizing:fixed]"
                onChange={(event) => {
                  setDraft((current) => current ? { ...current, systemPrompt: event.target.value } : current);
                }}
                disabled={submitting}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={!draft?.name.trim() || submitting}>
              {t("save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
