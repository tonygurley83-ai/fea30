const repository =
  require(
    "../repositories/CanvasRepository"
  );

function normalizeInput(
  raw
) {

  if (
    !raw ||
    typeof raw !== "object"
  ) {
    return {};
  }

  return {
    projectId:
      raw.projectId ??
      raw.project_id ??
      null,

    name:
      raw.name ??
      null,

    canvasData:
      raw.canvasData ??
      raw.canvas_data ??
      {},

    scope:
      raw.scope ??
      null
  };

}

function normalizeProjectId(
  raw
) {

  if (
    !raw ||
    raw === "__personal__" ||
    raw === "__shared__"
  ) {

    return null;

  }

  if (
    typeof raw === "object" &&
    raw?.id
  ) {

    return raw.id;

  }

  const value =
    String(raw).trim();

  return value.length
    ? value
    : null;

}

async function createCanvas(
  userId,
  data
) {

  if (!userId) {

    throw new Error(
      "User ID required"
    );

  }

  const input =
    normalizeInput(
      data
    );

  if (
    !input.name?.trim()
  ) {

    throw new Error(
      "Canvas name required"
    );

  }

  const projectId =
    normalizeProjectId(
      input.projectId
    );

  const scope =
    projectId
      ? "project"
      : (
          input.scope ===
          "shared"
        )
      ? "shared"
      : "personal";

  return repository.create(
    userId,
    {
      projectId,
      name:
        input.name.trim(),
      canvasData:
        input.canvasData,
      scope
    }
  );

}

async function getProjectCanvases(
  projectId
) {

  if (!projectId) {

    throw new Error(
      "Project ID required"
    );

  }

  return repository.findByProject(
    projectId
  );

}

async function getPersonalCanvases(
  userId
) {

  if (!userId) {

    throw new Error(
      "User ID required"
    );

  }

  return repository.findPersonal(
    userId
  );

}

async function getSharedCanvases(
  userId
) {

  if (!userId) {

    throw new Error(
      "User ID required"
    );

  }

  return repository.findShared(
    userId
  );

}

async function updateCanvas(
  userId,
  canvasId,
  data
) {

  if (!userId) {

    throw new Error(
      "User ID required"
    );

  }

  if (!canvasId) {

    throw new Error(
      "Canvas ID required"
    );

  }

  const input =
    normalizeInput(
      data
    );

  if (
    input.name !==
      undefined &&
    input.name !==
      null &&
    !input.name.trim()
  ) {

    throw new Error(
      "Canvas name required"
    );

  }

  return repository.update(
    userId,
    canvasId,
    {
      name:
        input.name,
      canvasData:
        input.canvasData
    }
  );

}

async function shareCanvas(
  canvasId,
  targetUserId,
  permission
) {

  if (!canvasId) {

    throw new Error(
      "Canvas ID required"
    );

  }

  if (!targetUserId) {

    throw new Error(
      "Target user ID required"
    );

  }

  return repository.share(
    canvasId,
    targetUserId,
    permission || "read"
  );

}

async function deleteCanvas(
  userId,
  canvasId
) {

  if (!userId) {

    throw new Error(
      "User ID required"
    );

  }

  if (!canvasId) {

    throw new Error(
      "Canvas ID required"
    );

  }

  return repository.delete(
    userId,
    canvasId
  );

}

module.exports = {
  createCanvas,
  getProjectCanvases,
  getPersonalCanvases,
  getSharedCanvases,
  updateCanvas,
  shareCanvas,
  deleteCanvas
};
