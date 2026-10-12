import React, { useEffect, useState } from "react";
import AuthService from "../FEAClientApiService/services/AuthService";
import mirror from "../src/MirrorClient";
import ProjectSidebar from "../FEAClient/src/Projects/ProjectSidebar";

function FEAMain() {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const currentUser = AuthService.getUser();
  const userId = currentUser.id;

  useEffect(() => {
    loadUser();
    loadProjects();
  }, []);

  async function loadUser() {
    try {
      const response = await fetch(`/auth/user/${userId}`);
      const data = await response.json();
      setUser(data);
    } catch (error) {
      console.error("User Load Failed", error);
    }
  }

  async function loadProjects() {
    try {
      const response = await fetch(`/auth/user/${userId}/projects`);
      const data = await response.json();
      setProjects(data);

      if (data.length > 0) {
        setSelectedId(data[0].id);
        mirror.publish({
          type: "PROJECT_CHANGED",
          project: data[0]
        });
      }
    } catch (error) {
      console.error("Project Load Failed", error);
    }
  }

  function selectProject(project) {
    setSelectedId(project.id);
    mirror.publish({
      type: "PROJECT_CHANGED",
      project
    });
  }

  // Create Project with Prompt
  async function createProject() {
    const name = window.prompt("Enter new project name:", "New Project");
    if (!name || !name.trim()) return;

    try {
      const response = await fetch(`/auth/user/${userId}/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() })
      });
      const project = await response.json();
      setProjects((prev) => [...prev, project]);
      selectProject(project);
    } catch (error) {
      console.error("Project Create Failed", error);
    }
  }

  // Rename Project (Prompted)
  async function renameProject(projectId, currentName) {
    const newName = window.prompt("Enter new name for project:", currentName);
    if (!newName || newName.trim() === "" || newName === currentName) return;

    try {
      const response = await fetch(`/auth/user/${userId}/projects/${projectId}`, {
        method: "PUT", // Or "PATCH" depending on your API
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() })
      });
      const updatedProject = await response.json();

      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? updatedProject : p))
      );

      if (selectedId === projectId) {
        mirror.publish({
          type: "PROJECT_CHANGED",
          project: updatedProject
        });
      }
    } catch (error) {
      console.error("Project Rename Failed", error);
    }
  }

  // Delete Project (Confirmed)
  async function deleteProject(projectId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project?"
    );
    if (!confirmed) return;

    try {
      await fetch(`/auth/user/${userId}/projects/${projectId}`, {
        method: "DELETE"
      });

      const updatedProjects = projects.filter((p) => p.id !== projectId);
      setProjects(updatedProjects);

      // Handle re-selection if the active project was deleted
      if (selectedId === projectId) {
        if (updatedProjects.length > 0) {
          selectProject(updatedProjects[0]);
        } else {
          setSelectedId(null);
          mirror.publish({
            type: "PROJECT_CHANGED",
            project: null
          });
        }
      }
    } catch (error) {
      console.error("Project Delete Failed", error);
    }
  }

  return (
    <ProjectSidebar
      user={user}
      projects={projects}
      selectedProjectId={selectedId}
      onProjectSelected={selectProject}
      onCreateProject={createProject}
      onRenameProject={renameProject}
      onDeleteProject={deleteProject}
    />
  );
}

export default FEAMain;
