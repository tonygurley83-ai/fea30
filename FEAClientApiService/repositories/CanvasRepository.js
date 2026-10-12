const db = require(
  "../server/egg/postgres"
);

function getCanvasData(
  data
) {
  const hasCanvasData =
    Object.prototype.hasOwnProperty.call(
      data ?? {},
      "canvasData"
    );

  const hasCanvasDataSnakeCase =
    Object.prototype.hasOwnProperty.call(
      data ?? {},
      "canvas_data"
    );

  if (hasCanvasData) {
    return data.canvasData;
  }

  if (hasCanvasDataSnakeCase) {
    return data.canvas_data;
  }

  return undefined;
}

async function create(
  userId,
  data
) {
  const rawProject =
    data.projectId ??
    data.project_id ??
    null;

  const cleanProjectId =
    typeof rawProject === "object" &&
    rawProject?.id
      ? rawProject.id
      : typeof rawProject === "string" &&
        rawProject.trim() !== ""
      ? rawProject.trim()
      : null;

  const result = await db.query(
    `
    SELECT public.create_canvas(
      $1::uuid,
      $2::varchar,
      $3::jsonb,
      $4::uuid
    ) AS id
    `,
    [
      userId,
      data.name,
      data.canvasData ??
        data.canvas_data ??
        {},
      cleanProjectId
    ]
  );

  return result?.rows?.[0] ?? null;
}

async function findByProject(
  projectId
) {
  const result = await db.query(
    `
    SELECT *
    FROM public.get_canvases_by_project_id_or_owner(
      p_project_id => $1::uuid
    )
    `,
    [projectId]
  );

  return result?.rows ?? [];
}

async function findPersonal(
  userId
) {
  const result = await db.query(
    `
    SELECT *
    FROM public.get_canvases_by_project_id_or_owner(
      p_user_id => $1::uuid,
      p_is_shared => false
    )
    `,
    [userId]
  );

  return result?.rows ?? [];
}

async function findShared(
  userId
) {
  const result = await db.query(
    `
    SELECT *
    FROM public.get_canvases_by_project_id_or_owner(
      p_user_id => $1::uuid,
      p_is_shared => true
    )
    `,
    [userId]
  );

  return result?.rows ?? [];
}

async function findById(
  canvasId
) {
  const result = await db.query(
    `
    SELECT *
    FROM public.get_canvas(
      $1::uuid
    )
    `,
    [canvasId]
  );

  return result?.rows?.[0] ?? null;
}

/*
 * Compatibility method.
 *
 * If get_canvas() does not enforce access permissions,
 * replace this later with a user-aware SQL function.
 */
async function findAccessibleById(
  userId,
  canvasId
) {
  return findById(canvasId);
}

/*
 * Normal Save.
 *
 * Updates the JSON content stored in the active version.
 *
 * It does NOT:
 * - insert into canvas_versions
 * - increment canvases.current_version
 * - call create_canvas_version()
 */
async function update(
  userId,
  canvasId,
  data
) {
  const canvasData =
    getCanvasData(data);

  if (canvasData === undefined) {
    throw new Error(
      "canvasData or canvas_data is required " +
      "to save the canvas"
    );
  }

  const result = await db.query(
    `
    SELECT public.save_canvas(
      $1::uuid,
      $2::uuid,
      $3::jsonb
    ) AS version_number
    `,
    [
      canvasId,
      userId,
      canvasData
    ]
  );

  return result?.rows?.[0] ?? null;
}

/*
 * Rename only.
 *
 * Changes canvases.name without creating, changing, or
 * incrementing a canvas version.
 */
async function updateName(
  userId,
  canvasId,
  name
) {
  const cleanName =
    typeof name === "string"
      ? name.trim()
      : "";

  if (!cleanName) {
    throw new Error(
      "Canvas name is required"
    );
  }

  const result = await db.query(
    `
    UPDATE public.canvases
    SET name = $3::varchar
    WHERE id = $1::uuid
      AND owner_id = $2::uuid
    RETURNING *
    `,
    [
      canvasId,
      userId,
      cleanName
    ]
  );

  return result?.rows?.[0] ?? null;
}

async function share(
  canvasId,
  targetUserId,
  permission
) {
  const result = await db.query(
    `
    SELECT public.share_canvas(
      $1::uuid,
      $2::uuid,
      $3
    ) AS shared
    `,
    [
      canvasId,
      targetUserId,
      permission
    ]
  );

  return Boolean(
    result?.rows?.[0]?.shared
  );
}

async function archive(
  canvasId,
  userId
) {
  const result = await db.query(
    `
    SELECT public.archive_canvas(
      $1::uuid,
      $2::uuid
    ) AS archived
    `,
    [
      canvasId,
      userId
    ]
  );

  return Boolean(
    result?.rows?.[0]?.archived
  );
}

async function restore(
  canvasId,
  userId
) {
  const result = await db.query(
    `
    SELECT public.restore_canvas(
      $1::uuid,
      $2::uuid
    ) AS restored
    `,
    [
      canvasId,
      userId
    ]
  );

  return Boolean(
    result?.rows?.[0]?.restored
  );
}

async function remove(
  userId,
  canvasId
) {
  const result = await db.query(
    `
    SELECT public.delete_canvas(
      $1::uuid,
      $2::uuid
    ) AS deleted
    `,
    [
      canvasId,
      userId
    ]
  );

  return Boolean(
    result?.rows?.[0]?.deleted
  );
}

module.exports = {
  create,
  findByProject,
  findPersonal,
  findShared,
  findById,
  findAccessibleById,
  update,
  updateName,
  share,
  archive,
  restore,
  delete: remove
};
