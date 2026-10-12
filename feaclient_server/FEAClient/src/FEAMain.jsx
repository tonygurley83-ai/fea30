import React, { useEffect, useState, useCallback } from "react";
import apiClient from "./apiClient";
import ProjectSidebar from "./Projects/ProjectSidebar";
import ProjectManager from "./Projects/ProjectManager";

function FEAMain() {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [personalCanvases, setPersonalCanvases] = useState([]);
  const [sharedCanvases, setSharedCanvases] = useState([]);

  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedCanvasId, setSelectedCanvasId] = useState(null);

  const [loading, setLoading] = useState(true);

  const refreshSession = useCallback(async (activeUser = user) => {
    try {
      const [projectsData, personalData, sharedData] =
        await Promise.all([
          apiClient("/auth/projects"),
          apiClient("/auth/canvases/personal"),
          apiClient("/auth/canvases/shared")
        ]);

      const projectsWithCanvases =
        await Promise.all(
          (projectsData || []).map(async (project) => {
            const canvases = await apiClient(
              `/auth/canvases/project/${project.id}`
            );

            return {
              ...project,
              canvases: canvases || []
            };
          })
        );

      const currentUserId = activeUser?.id;

      const strictPersonal = (personalData || []).filter(
        (canvas) => {
          const hasProject = Boolean(
            canvas.project_id || canvas.projectId
          );

          const ownerId =
            canvas.owner_id || canvas.ownerId;

          return (
            !hasProject &&
            (!currentUserId ||
              ownerId === currentUserId)
          );
        }
      );

      const strictShared = (sharedData || []).filter(
        (canvas) => {
          const ownerId =
            canvas.owner_id || canvas.ownerId;

          return currentUserId
            ? ownerId !== currentUserId
            : true;
        }
      );

      setProjects(projectsWithCanvases);
      setPersonalCanvases(strictPersonal);
      setSharedCanvases(strictShared);

      if (
        !selectedProjectId &&
        projectsWithCanvases.length > 0
      ) {
        setSelectedProjectId(
          projectsWithCanvases[0].id
        );
      }
    } catch (err) {
      console.error("[REFRESH]", err);
    }
  }, [user, selectedProjectId]);

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      try {
        setLoading(true);

        const currentUser = await apiClient(
          "/auth/me"
        );

        if (!mounted) return;

        setUser(currentUser);

        localStorage.setItem(
          "user",
          JSON.stringify(currentUser)
        );

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
  }, []);

  async function deleteCanvas(canvasTarget) {
    const canvasId =
      typeof canvasTarget === "object"
        ? canvasTarget?.id
        : canvasTarget;

    const canvasName =
      typeof canvasTarget === "object"
        ? canvasTarget?.name
        : "this canvas";

    if (
      !canvasId ||
      !window.confirm(
        `Delete "${canvasName}"?`
      )
    ) {
      return;
    }

    try {
      await apiClient(
        `/auth/canvases/${canvasId}`,
        {
          method: "DELETE"
        }
      );

      if (selectedCanvasId === canvasId) {
        setSelectedCanvasId(null);
      }

      await refreshSession();
    } catch (err) {
      console.error(
        "Canvas Delete Failed",
        err
      );
    }
  }

  if (loading) {
    return (
      <div style={{ padding: 20 }}>
        Loading workspace...
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        width: "100vw",
        height: "100vh",
        overflow: "hidden"
      }}
    >
      {/* Sidebar */}

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
          selectedCanvasId={selectedCanvasId}
          onProjectSelected={(project) => {
            setSelectedProjectId(project?.id);

            if (project?.canvases?.length) {
              setSelectedCanvasId(
                project.canvases[0].id
              );
            }
          }}
          onProjectCanvasSelected={(canvas) =>
            setSelectedCanvasId(canvas?.id)
          }
          onPersonalCanvasSelected={(canvas) =>
            setSelectedCanvasId(canvas?.id)
          }
          onSharedCanvasSelected={(canvas) =>
            setSelectedCanvasId(canvas?.id)
          }
          onDeleteCanvas={deleteCanvas}
        />
      </div>

      {/* Workspace */}

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
