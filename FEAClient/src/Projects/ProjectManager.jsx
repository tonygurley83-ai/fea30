import React, { useEffect, useState } from "react";
import mirror from "../../src/MirrorClient";
import CanvasEditor from "../Canvas/CanvasEditor";

function getAuthHeaders() {
  const token = localStorage.getItem("jwt");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json"
  };
}

function ProjectManager({ projectId, activeCanvasId, user }) {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadProject() {
      if (!projectId) {
        setProject(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/auth/user/projects/${encodeURIComponent(projectId)}`,
          {
            headers: getAuthHeaders()
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const projectData = await response.json();
        setProject(projectData);

        mirror.publish({
          type: "PROJECT_CHANGED",
          project: projectData
        });
      } catch (err) {
        console.error("[ProjectManager]", err);
        setError(err.message || "Failed to load project");
      } finally {
        setLoading(false);
      }
    }

    loadProject();
  }, [projectId]);

  const handleCreateScene = async () => {
    try {
      setError(null);
      const response = await fetch(
        `/auth/user/projects/${encodeURIComponent(projectId)}/scenes`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({ name: "New Scene" })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const newScene = await response.json();

      setProject((prev) => ({
        ...prev,
        scenes: [...(prev.scenes || []), newScene]
      }));

      mirror.publish({
        type: "SCENE_CREATED",
        projectId,
        scene: newScene
      });
    } catch (err) {
      console.error("[ProjectManager] Create scene error:", err);
      setError(err.message || "Failed to create scene");
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 24, color: "#64748b" }}>
        Loading project workspace...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 24, color: "#dc2626" }}>
        Error loading workspace: {error}
      </div>
    );
  }

  if (!project) {
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#64748b"
        }}
      >
        Select a project.
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column"
      }}
    >
      {/* Project Header */}
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid #e2e8f0",
          background: "#fff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <h2 style={{ margin: 0, fontSize: 18 }}>{project.name}</h2>
        <button
          onClick={handleCreateScene}
          style={{
            padding: "6px 12px",
            backgroundColor: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 500
          }}
        >
          + Create Scene
        </button>
      </div>

      {/* Canvas Workspace */}
      <div style={{ flex: 1, overflow: "hidden" }}>
        {activeCanvasId ? (
          <CanvasEditor canvasId={activeCanvasId} user={user} />
        ) : (
          <div
            style={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#64748b",
              fontSize: 14
            }}
          >
            Select or create a canvas.
          </div>
        )}
      </div>
    </div>
  );
}

export default ProjectManager;
