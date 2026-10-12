// FEAClient/src/FEAMain.jsx
import React, { useCallback, useEffect, useState } from "react";
import apiClient from "./apiClient";
import ProjectSidebar from "./Projects/ProjectSidebar";
import ProjectManager from "./Projects/ProjectManager";
import mirror from "../../src/MirrorClient";

function getCanvasId(canvas) {
  return (
    canvas?.id ??
    canvas?.canvas_id ??
    canvas?.canvasId ??
    null
  );
}

function getProjectId(project) {
  return (
    project?.id ??
    project?.project_id ??
    project?.projectId ??
    null
  );
}

function FEAMain() {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [personalCanvases, setPersonalCanvases] = useState([]);
  const [sharedCanvases, setSharedCanvases] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedCanvasId, setSelectedCanvasId] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = useCallback(
    async (activeUser = user) => {
      try {
        const [projectsData, personalData, sharedData] = await Promise.all([
          apiClient("/auth/projects"),
          apiClient("/auth/canvases/personal"),
          apiClient("/auth/canvases/shared")
        ]);

        const projectsWithCanvases = await Promise.all(
          (projectsData || []).map(async (project) => {
            const projectId = getProjectId(project);
            const canvases = await apiClient(
              `/auth/canvases/project/${projectId}`
            );
            return { ...project, canvases: canvases || [] };
          })
        );

        const currentUserId =
          activeUser?.id ?? activeUser?.userId ?? null;

        const strictPersonal = (personalData || []).filter((canvas) => {
          const hasProject = Boolean(
            canvas.project_id ?? canvas.projectId
          );
          const ownerId =
            canvas.owner_id ??
            canvas.ownerId ??
            canvas.user_id ??
            canvas.userId ??
            canvas.id ??
            null;
          return (
            !hasProject &&
            (!currentUserId || String(ownerId) === String(currentUserId))
          );
        });

        const strictShared = (sharedData || []).filter((canvas) => {
          const ownerId =
            canvas.owner_id ??
            canvas.ownerId ??
            canvas.user_id ??
            canvas.userId ??
            null;
          return (
            !currentUserId || String(ownerId) !== String(currentUserId)
          );
        });

        setProjects(projectsWithCanvases);
        setPersonalCanvases(strictPersonal);
        setSharedCanvases(strictShared);
        setSelectedProjectId((currentProjectId) => {
          const selectedStillExists = projectsWithCanvases.some(
            (project) =>
              String(getProjectId(project)) === String(currentProjectId)
          );
          if (selectedStillExists) {
            return currentProjectId;
          }
          return (
            getProjectId(projectsWithCanvases[0]) ?? null
          );
        });
      } catch (err) {
        console.error("[REFRESH]", err);
      }
    },
    [user]
  );

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      try {
        setLoading(true);
        const currentUser = await apiClient("/auth/me");
        if (!mounted) {
          return;
        }
        setUser(currentUser);
        localStorage.setItem("user", JSON.stringify(currentUser));
        await refreshSession(currentUser);
      } catch (err) {
        console.error("[SESSION INIT]", err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    initialize();

    return () => {
      mounted = false;
    };
  }, [refreshSession]);

  async function createProject() {
    const name = window.prompt("Project name:");
    if (!name?.trim()) {
      return;
    }
    try {
      const project = await apiClient("/auth/projects", {
        method: "POST",
        body: JSON.stringify({ name: name.trim() })
      });
      const projectId = getProjectId(project);
      await refreshSession();
      if (projectId) {
        setSelectedProjectId(projectId);
      }
    } catch (err) {
      console.error("Project Create Failed", err);
      window.alert("Unable to create the project.");
    }
  }

  async function renameProject(project, currentName) {
    const projectId = getProjectId(project);
    if (!projectId) {
      return;
    }
    const name = window.prompt(
      "Project name:",
      currentName || project?.name || ""
    );
    if (!name?.trim()) {
      return;
    }
    try {
      await apiClient(`/auth/projects/${projectId}`, {
        method: "PUT",
        body: JSON.stringify({ name: name.trim() })
      });
      await refreshSession();
    } catch (err) {
      console.error("Project Rename Failed", err);
      window.alert("Unable to rename the project.");
    }
  }

  async function deleteProject(project) {
    const projectId = getProjectId(project);
    if (
      !projectId ||
      !window.confirm(
        `Delete project "${project?.name || "this project"}"?`
      )
    ) {
      return;
    }
    try {
      await apiClient(`/auth/projects/${projectId}`, {
        method: "DELETE"
      });
      if (String(selectedProjectId) === String(projectId)) {
        setSelectedProjectId(null);
        setSelectedCanvasId(null);
      }
      await refreshSession();
    } catch (err) {
      console.error("Project Delete Failed", err);
      window.alert("Unable to delete the project.");
    }
  }

  async function createCanvas(target) {
    const name = window.prompt("Canvas name:");
    if (!name?.trim()) {
      return;
    }
    const projectId =
      typeof target === "object" ? getProjectId(target) : null;
    const scope =
      target === "__shared__" ? "shared" : "personal";
    try {
      const canvas = await apiClient("/auth/canvases", {
        method: "POST",
        body: JSON.stringify({
          projectId,
          name: name.trim(),
          canvasData: {},
          scope
        })
      });
      const canvasId = getCanvasId(canvas);
      await refreshSession();
      if (projectId) {
        setSelectedProjectId(projectId);
      }
      if (canvasId) {
        setSelectedCanvasId(canvasId);
      }
      await refreshSession();
    } catch (err) {
      console.error("Canvas Create Failed", err);
      window.alert("Unable to create the canvas.");
    }
  }

  async function renameCanvas(canvas, currentName) {
    const canvasId = getCanvasId(canvas);
    if (!canvasId) {
      return;
    }
    const name = window.prompt(
      "Canvas name:",
      currentName || canvas?.name || ""
    );
    if (!name?.trim()) {
      return;
    }
    try {
      await apiClient(`/auth/canvases/${canvasId}`, {
        method: "PUT",
        body: JSON.stringify({
          name: name.trim(),
          canvasData: canvas?.canvasData ?? canvas?.canvas_data ?? {}
        })
      });
      await refreshSession();
    } catch (err) {
      console.error("Canvas Rename Failed", err);
      window.alert("Unable to rename the canvas.");
    }
  }

  async function deleteCanvas(canvasTarget) {
    const canvasId =
      typeof canvasTarget === "object"
        ? getCanvasId(canvasTarget)
        : canvasTarget;
    const canvasName =
      typeof canvasTarget === "object"
        ? canvasTarget?.name
        : "this canvas";
    if (
      !canvasId ||
      !window.confirm(`Delete "${canvasName}"?`)
    ) {
      return;
    }
    try {
      await apiClient(`/auth/canvases/${canvasId}`, {
        method: "DELETE"
      });
      if (String(selectedCanvasId) === String(canvasId)) {
        setSelectedCanvasId(null);
      }
      await refreshSession();
    } catch (err) {
      console.error("Canvas Delete Failed", err);
      window.alert("Unable to delete the canvas.");
    }
  }

  function handleProjectSelected(project) {
    const projectId = getProjectId(project);
    setSelectedProjectId(projectId);
    const firstCanvas = project?.canvases?.[0];
    const firstCanvasId = getCanvasId(firstCanvas);
    if (firstCanvasId) {
      setSelectedCanvasId(firstCanvasId);
    }
  }

  function handleProjectCanvasSelected(canvas) {
    setSelectedCanvasId(getCanvasId(canvas));
  }

  function handlePersonalCanvasSelected(canvas) {
    setSelectedProjectId(null);
    setSelectedCanvasId(getCanvasId(canvas));
  }

  function handleSharedCanvasSelected(canvas) {
    setSelectedProjectId(null);
    setSelectedCanvasId(getCanvasId(canvas));
  }

  if (loading) {
    return <div style={{ padding: 20 }}>Loading workspace...</div>;
  }

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        overflow: "hidden"
      }}
    >
      <div
        style={{
          width: 280,
          flexShrink: 0,
          borderRight: "1px solid #e2e8f0",
          overflow: "auto"
        }}
      >
        <ProjectSidebar
          user={user}
          projects={projects}
          personalCanvases={personalCanvases}
          sharedCanvases={sharedCanvases}
          selectedProjectId={selectedProjectId}
          activeCanvasId={selectedCanvasId}
          onProjectSelected={handleProjectSelected}
          onProjectCanvasSelected={handleProjectCanvasSelected}
          onPersonalCanvasSelected={handlePersonalCanvasSelected}
          onSharedCanvasSelected={handleSharedCanvasSelected}
          onCreateProject={createProject}
          onRenameProject={renameProject}
          onDeleteProject={deleteProject}
          onCreateCanvas={createCanvas}
          onRenameCanvas={renameCanvas}
          onDeleteCanvas={deleteCanvas}
        />
      </div>

      <div
        style={{
          flex: 1,
          overflow: "hidden"
        }}
      >
        <ProjectManager
          projectId={selectedProjectId}
          activeCanvasId={selectedCanvasId}
          user={user}
        />
      </div>
    </div>
  );
}

export default FEAMain;
