import { useTranslations } from "next-intl";
import * as React from "react";
import { toast } from "sonner";

import { useShellProjectCatalog } from "@/features/shell/hooks/use-shell-project-catalog";
import type { ProjectDraft } from "@/features/shell/types/project";
import { listVisibleKnowledgeBases } from "@/shared/api/knowledge-bases";
import type { KnowledgeBaseDTO } from "@/shared/api/knowledge-bases-types";

function getKnowledgeBaseID(knowledgeBase: KnowledgeBaseDTO): string {
  return knowledgeBase.publicID;
}

/** Loads only the visible knowledge-base picker; hidden project defaults remain untouched. */
export function useShellProjectDialogDefaults({ open, draft, setDraft, knowledgeBaseEnabled }: {
  open: boolean;
  draft: ProjectDraft | null;
  setDraft: React.Dispatch<React.SetStateAction<ProjectDraft | null>>;
  knowledgeBaseEnabled: boolean;
}) {
  const t = useTranslations("recent.projects");
  const handleCatalogLoadError = React.useCallback(() => {
    toast.error(t("defaultsLoadFailed"));
  }, [t]);
  const handleKnowledgeBaseIDsResolved = React.useCallback((
    requestedIDs: string[],
    availableIDs: ReadonlySet<string>,
  ) => {
    const requestedIDSet = new Set(requestedIDs);
    setDraft((current) => {
      if (!current) return current;
      const defaultKnowledgeBaseIDs = current.defaultKnowledgeBaseIDs
        .filter((id) => !requestedIDSet.has(id) || availableIDs.has(id))
        .slice(0, 8);
      return defaultKnowledgeBaseIDs.length === current.defaultKnowledgeBaseIDs.length &&
        defaultKnowledgeBaseIDs.every((id, index) => id === current.defaultKnowledgeBaseIDs[index])
        ? current
        : { ...current, defaultKnowledgeBaseIDs };
    });
  }, [setDraft]);
  const knowledgeBaseCatalog = useShellProjectCatalog({
    open: open && knowledgeBaseEnabled,
    selectedIDs: draft?.defaultKnowledgeBaseIDs.slice(0, 8) ?? [],
    loadPage: listVisibleKnowledgeBases,
    getID: getKnowledgeBaseID,
    onSelectedIDsResolved: handleKnowledgeBaseIDsResolved,
    onError: handleCatalogLoadError,
  });
  return { knowledgeBaseCatalog };
}
