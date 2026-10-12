const repository = require("../repositories/ProjectRepository");

async function createProject(userId, name, projectId) {
  if (!name?.trim()) {
    throw new Error("Project name required");
  }

  return repository.create(userId, name.trim(), projectId);
}

async function getProjects(userId) {
  return repository.findAll(userId);
}

async function getProject(userId, projectId) {
  return repository.findById(userId, projectId);
}

async function updateProject(userId, projectId, data) {
  if (data.name !== undefined && !data.name.trim()) {
    throw new Error("Project name required");
  }

  return repository.update(userId, projectId, {
    ...data,
    name: data.name?.trim()
  });
}

async function deleteProject(userId, projectId) {
  return repository.delete(userId, projectId);
}

module.exports = {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject
};
