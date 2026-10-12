const repository =
  require(
    "../repositories/CanvasRepository"
  );

function createDefaultCanvasData() {
  return {
    version: 1,

    grid: {
      enabled: true,
      visible: true,
      size: 20,
      snap: true
    },

    layers: [
      {
        id: "layer-default",
        name: "Layer 1",
        visible: true,
        locked: false,
        order: 0
      }
    ],

    nodes: [],
    elements: []
  };
}

/*
 * Used only while creating a new canvas.
 *
 * New canvases need an initial document, so omitted,
 * empty, or invalid content is replaced with default data.
 */
function normalizeCanvasDataForCreate(
  raw
) {
  const candidate =
    raw?.canvasData ??
    raw?.canvas_data;

  if (
    !candidate ||
    typeof candidate !== "object" ||
    Array.isArray(candidate) ||
    Object.keys(candidate).length === 0
  ) {
    return createDefaultCanvasData();
  }

  return candidate;
}

/*
 * Used only while saving an existing canvas.
 *
 * Missing data stays missing. This deliberately does NOT
 * generate default canvas data, because a normal rename or
 * metadata update must never overwrite a canvas document.
 */
function getProvidedCanvasData(
  raw
) {
  const hasCanvasData =
    Object.prototype.hasOwnProperty.call(
      raw ?? {},
      "canvasData"
    );

  const hasCanvasDataSnakeCase =
    Object.prototype.hasOwnProperty.call(
      raw ?? {},
      "canvas_data"
    );

  if (
    !hasCanvasData &&
    !hasCanvasDataSnakeCase
  ) {
    return undefined;
  }

  const candidate =
    raw.canvasData ??
    raw.canvas_data;

  if (
    !candidate ||
    typeof candidate !== "object" ||
    Array.isArray(candidate)
  ) {
    throw new Error(
      "canvasData must be a JSON object"
    );
  }

  return candidate;
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

function getProvidedName(
  raw
) {
  const hasName =
    Object.prototype.hasOwnProperty.call(
      raw ?? {},
      "name"
    );

  if (!hasName) {
    return undefined;
  }

  if (typeof raw.name !== "string") {
    throw new Error(
      "Canvas name must be a string"
    );
  }

  const name =
    raw.name.trim();

  if (!name) {
    throw new Error(
      "Canvas name required"
    );
  }

  return name;
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

  if (
    !data ||
    typeof data !== "object"
  ) {
    throw new Error(
      "Canvas data required"
    );
  }

  const name =
    getProvidedName(data);

  if (!name) {
    throw new Error(
      "Canvas name required"
    );
  }

  const projectId =
    normalizeProjectId(
      data.projectId ??
      data.project_id
    );

  const scope =
    projectId
      ? "project"
      : data.scope === "shared"
      ? "shared"
      : "personal";

  return repository.create(
    userId,
    {
      projectId,
      name,
      canvasData:
        normalizeCanvasDataForCreate(data),
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

async function getCanvasById(
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

  return repository.findById(
    canvasId
  );
}

/*
 * Ordinary Update / Actual Save.
 *
 * It may:
 * - update canvases.name
 * - overwrite canvas_versions.canvas_data for the CURRENT
 *   version through public.save_canvas(...)
 *
 * It never:
 * - inserts a canvas_versions row
 * - increments canvases.current_version
 * - calls public.create_canvas_version(...)
 */
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

  if (
    !data ||
    typeof data !== "object"
  ) {
    throw new Error(
      "Update data required"
    );
  }

  const name =
    getProvidedName(data);

  const canvasData =
    getProvidedCanvasData(data);

  const hasName =
    name !== undefined;

  const hasCanvasData =
    canvasData !== undefined;

  if (!hasName && !hasCanvasData) {
    throw new Error(
      "Provide name, canvasData, or canvas_data"
    );
  }

  let canvas = null;
  let saved = null;

  if (hasName) {
    canvas = await repository.updateName(
      userId,
      canvasId,
      name
    );

    if (!canvas) {
      throw new Error(
        "Canvas not found or access denied"
      );
    }
  }

  if (hasCanvasData) {
    saved = await repository.update(
      userId,
      canvasId,
      {
        canvasData
      }
    );

    if (!saved) {
      throw new Error(
        "Canvas not found or access denied"
      );
    }
  }

  if (hasName && !hasCanvasData) {
    return canvas;
  }

  if (!hasName && hasCanvasData) {
    return saved;
  }

  return {
    canvas,
    saved
  };
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
  getCanvasById,
  updateCanvas,
  shareCanvas,
  deleteCanvas
};
