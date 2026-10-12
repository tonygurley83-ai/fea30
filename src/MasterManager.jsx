// src/MasterManager.jsx
import React, { useEffect, useState } from "react";

import mirror from "./MirrorClient";
import CanvasTooler from "./CanvasTooler";
import NullProject from "./NullProject";
import NullCanvas from "./NullCanvas";
import HistoryManager from "./HistoryManager";
import ClipboardManager from "./ClipboardManager";
import LoginPage from "./LoginPage";
import FEAMain from "./FEAMain";
import UnifiedToolbar from "../FEAClient/src/UnifiedToolbar";
import LayersPanel from "../FEAClient/src/LayersPanel";
import PropertiesPanel from "../FEAClient/src/PropertiesPanel";
import renderCanvas from "../FEAClient/src/CanvasRenderEngine";

function MasterManager() {
  const [project, setProject] = useState(NullProject);
  const [canvas, setCanvas] = useState(NullCanvas);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);
  const [isCanvasDirty, setIsCanvasDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // Tool + view state (wired to UnifiedToolbar and CanvasTooler)
  const [tool, setTool] = useState("select");
  const [gridVisible, setGridVisible] = useState(true);
  const [snapEnabled, setSnapEnabled] = useState(true);

  function getAuthHeaders() {
    const token = localStorage.getItem("jwt");
    const headers = { "Content-Type": "application/json" };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  }

  async function persistCanvas(canvasToSave) {
    const canvasId = canvasToSave?.id ?? project?.activeCanvasId;
    if (!canvasId) {
      throw new Error("Cannot save canvas: no canvas ID");
    }

    const response = await fetch(`/auth/canvases/${canvasId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        canvasData: {
          version: canvasToSave?.version ?? 1,
          grid: canvasToSave?.grid ?? {},
          nodes: canvasToSave?.nodes ?? [],
          elements:
            canvasToSave?.elements ?? canvasToSave?.nodes ?? [],
          layers: canvasToSave?.layers ?? []
        }
      })
    });

    if (response.status === 401) {
      setAuthenticated(false);
      throw new Error("Authentication expired");
    }

    if (!response.ok) {
      const responseText = await response.text();
      throw new Error(
        `Canvas save failed: HTTP ${response.status} ${responseText}`
      );
    }

    return response.json();
  }

  const selectedNode =
    canvas?.nodes?.find((node) => node.id === selectedNodeId) ?? null;

  useEffect(() => {
    const unsubscribe = mirror.subscribe("PROJECT_CHANGED", (message) => {
      if (!message?.project) {
        return;
      }
      setProject(message.project);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    async function checkAuth() {
      try {
        const token = localStorage.getItem("jwt");
        if (!token) {
          setAuthenticated(false);
          return;
        }

        const response = await fetch("/auth/user", {
          headers: getAuthHeaders()
        });

        setAuthenticated(response.ok);
      } catch (error) {
        console.error("Auth Check Failed", error);
        setAuthenticated(false);
      } finally {
        setAuthLoading(false);
      }
    }

    checkAuth();
  }, []);

  useEffect(() => {
    async function loadCanvas() {
      if (!project?.activeCanvasId) {
        return;
      }

      try {
        const response = await fetch(
          `/auth/canvases/${project.activeCanvasId}`,
          { headers: getAuthHeaders() }
        );

        console.log("[CANVAS STATUS]", response.status);

        if (response.status === 401) {
          setAuthenticated(false);
          return;
        }

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const canvasRecord = await response.json();
        const renderedCanvas = renderCanvas(project, canvasRecord);

        console.log("[RENDERED CANVAS]", renderedCanvas);
        console.log("[RENDERED NODES]", renderedCanvas.nodes);

        setCanvas(renderedCanvas);
        setIsCanvasDirty(false);
        setSelectedNodeId(null);
      } catch (error) {
        console.error("Canvas Load Failed", error);
      }
    }

    loadCanvas();
  }, [project?.activeCanvasId]);

  const handleCanvasChange = (updatedCanvas) => {
    if (canvas) {
      HistoryManager.save(canvas);
    }
    setCanvas(updatedCanvas);
    setIsCanvasDirty(true);
  };

  const undoCanvas = () => {
    const previous = HistoryManager.undo(canvas);
    if (!previous) {
      return;
    }
    setCanvas(previous);
    setIsCanvasDirty(true);
    setSelectedNodeId(null);
  };

  const redoCanvas = () => {
    const next = HistoryManager.redo(canvas);
    if (!next) {
      return;
    }
    setCanvas(next);
    setIsCanvasDirty(true);
    setSelectedNodeId(null);
  };

  const saveCanvas = async () => {
    if (!canvas || !canvas.id || !isCanvasDirty || isSaving) {
      return;
    }

    setIsSaving(true);

    try {
      const savedCanvasRecord = await persistCanvas(canvas);
      const renderedCanvas = renderCanvas(project, savedCanvasRecord);

      setCanvas(renderedCanvas);
      setIsCanvasDirty(false);
      setLastSaved(new Date());
    } catch (error) {
      console.error("Canvas Save Failed", error);
    } finally {
      setIsSaving(false);
    }
  };

  const copyNode = () => {
    if (!selectedNode) {
      return;
    }
    ClipboardManager.copy(selectedNode);
  };

  const pasteNode = () => {
    const pastedNode = ClipboardManager.paste();
    if (!pastedNode || !canvas) {
      return;
    }

    const clonedNode = {
      ...pastedNode,
      id: `${pastedNode.id}_${Date.now()}`,
      x: (pastedNode.x ?? 0) + 20,
      y: (pastedNode.y ?? 0) + 20
    };

    handleCanvasChange({
      ...canvas,
      nodes: [...(canvas.nodes ?? []), clonedNode]
    });

    setSelectedNodeId(clonedNode.id);
  };

  const shareProject = () => {
    mirror.publish({
      type: "PROJECT_SHARE_REQUEST",
      project
    });
  };

  useEffect(() => {
    if (!canvas?.id || !isCanvasDirty) {
      return undefined;
    }

    const timer = setInterval(() => {
      saveCanvas();
    }, 30000);

    return () => clearInterval(timer);
  }, [canvas, isCanvasDirty]);

  if (authLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh"
        }}
      >
        Loading...
      </div>
    );
  }

  if (!authenticated) {
    return <LoginPage />;
  }

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden"
      }}
    >
      <div
        style={{
          width: 260,
          minWidth: 260,
          display: "flex",
          flexDirection: "column",
          borderRight: "1px solid #D1D5DB",
          background: "#FFFFFF"
        }}
      >
        <FEAMain />
        <LayersPanel layers={canvas?.layers ?? []} />
      </div>

      <div
        style={{
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          display: "flex",
          flexDirection: "column"
        }}
      >
        {canvas && (
          <UnifiedToolbar
            canvas={canvas}
            tool={tool}
            setTool={setTool}
            gridVisible={gridVisible}
            snapEnabled={snapEnabled}
            onToggleGrid={() => setGridVisible((v) => !v)}
            onToggleSnap={() => setSnapEnabled((v) => !v)}
            onUndo={undoCanvas}
            onRedo={redoCanvas}
            onCopy={copyNode}
            onPaste={pasteNode}
            onSave={saveCanvas}
            onShare={shareProject}
            isSaving={isSaving}
            isDirty={isCanvasDirty}
          />
        )}

        {lastSaved && (
          <div
            style={{
              padding: "8px 16px",
              background: "#F0FDF4",
              color: "#166534",
              borderBottom: "1px solid #D1FAE5",
              fontSize: 14
            }}
          >
            Last saved: {lastSaved.toLocaleTimeString()}
          </div>
        )}

        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflow: "hidden",
            background: "#F8FAFC"
          }}
        >
          {canvas && (
            <CanvasTooler
              canvas={canvas}
              onCanvasChange={handleCanvasChange}
              selectedNodeId={selectedNodeId}
              onNodeSelected={setSelectedNodeId}
              tool={tool}
              gridVisible={gridVisible}
              snapEnabled={snapEnabled}
            />
          )}
        </div>
      </div>

      <PropertiesPanel selectedNode={selectedNode} />
    </div>
  );
}

export default MasterManager;
