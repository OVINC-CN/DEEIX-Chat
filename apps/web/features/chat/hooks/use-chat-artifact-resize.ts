"use client";

import * as React from "react";

/**
 * 拖动分隔条调整制品面板宽度占比：捕获指针后跟随移动更新比例，
 * 在指针释放、窗口失焦或页面隐藏时结束拖动并还原全局光标与选择状态。
 */
export function useChatArtifactResize(artifactWorkspace: {
  artifactRatio: number;
  setArtifactRatio: (ratio: number) => void;
}) {
  const [workspaceElement, setWorkspaceElement] = React.useState<HTMLDivElement | null>(null);
  const [workspaceWidth, setWorkspaceWidth] = React.useState(0);
  const workspaceRef = React.useCallback((element: HTMLDivElement | null) => setWorkspaceElement(element), []);
  const maxRatio = workspaceWidth > 0 ? Math.max(0, 1 - 360 / workspaceWidth) : 2 / 3;
  const effectiveArtifactRatio = Math.min(maxRatio, Math.max(1 / 3, artifactWorkspace.artifactRatio));
  const canInlineArtifact = workspaceWidth === 0 || workspaceWidth >= 540;

  React.useLayoutEffect(() => {
    if (!workspaceElement) return;
    const measure = () => setWorkspaceWidth(workspaceElement.getBoundingClientRect().width);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(workspaceElement);
    return () => observer.disconnect();
  }, [workspaceElement]);
  const artifactResizeCleanupRef = React.useRef<(() => void) | null>(null);
  const [artifactResizing, setArtifactResizing] = React.useState(false);

  React.useEffect(() => () => {
    artifactResizeCleanupRef.current?.();
  }, []);

  const onArtifactResizeStart = React.useCallback((event: React.PointerEvent<HTMLButtonElement>) => {
    const workspace = workspaceElement;
    if (!workspace || event.button !== 0) {
      return;
    }

    event.preventDefault();
    artifactResizeCleanupRef.current?.();
    setArtifactResizing(true);
    const resizeHandle = event.currentTarget;
    const pointerID = event.pointerId;
    const startClientX = event.clientX;
    const startRatio = effectiveArtifactRatio;

    const previousCursor = document.body.style.cursor;
    const previousUserSelect = document.body.style.userSelect;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    let stopped = false;
    const stopResize = () => {
      if (stopped) {
        return;
      }

      stopped = true;
      artifactResizeCleanupRef.current = null;
      setArtifactResizing(false);
      document.body.style.cursor = previousCursor;
      document.body.style.userSelect = previousUserSelect;
      if (resizeHandle.hasPointerCapture(pointerID)) {
        resizeHandle.releasePointerCapture(pointerID);
      }
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", stopResize);
      window.removeEventListener("pointercancel", stopResize);
      window.removeEventListener("blur", stopResize);
      document.removeEventListener("visibilitychange", stopResizeWhenHidden);
      resizeHandle.removeEventListener("lostpointercapture", stopResize);
    };
    const updateRatio = (clientX: number) => {
      const rect = workspace.getBoundingClientRect();
      if (rect.width <= 0) {
        stopResize();
        return;
      }

      const ratio = startRatio - ((clientX - startClientX) / rect.width);
      artifactWorkspace.setArtifactRatio(Math.min(Math.max(1 / 3, ratio), Math.max(0, 1 - 360 / rect.width)));
    };
    const onPointerMove = (moveEvent: PointerEvent) => updateRatio(moveEvent.clientX);
    const stopResizeWhenHidden = () => {
      if (document.visibilityState === "hidden") {
        stopResize();
      }
    };

    resizeHandle.setPointerCapture(pointerID);
    artifactResizeCleanupRef.current = stopResize;
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", stopResize);
    window.addEventListener("pointercancel", stopResize);
    window.addEventListener("blur", stopResize);
    document.addEventListener("visibilitychange", stopResizeWhenHidden);
    resizeHandle.addEventListener("lostpointercapture", stopResize);
  }, [artifactWorkspace, effectiveArtifactRatio, workspaceElement]);

  return {
    workspaceRef,
    effectiveArtifactRatio,
    canInlineArtifact,
    artifactResizing,
    onArtifactResizeStart,
  };
}
