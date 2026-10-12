const db = require("../server/egg/postgres");

async function create(userId, data) {
  const rawProject = data.projectId ?? data.project_id ?? null;
  const cleanProjectId =
    typeof rawProject === "object" && rawProject?.id
      ? rawProject.id
      : typeof rawProject === "string" && rawProject.trim() !== ""
      ? rawProject.trim()
      : null;

  const result = await db.query(
    `
      SELECT create_canvas(
        $1::uuid,
        $2::varchar,
        $3::jsonb,
        $4::uuid
      ) AS id
      `,
    [
      userId,
      data.name,
      data.canvasData ?? data.canvas_data ?? {},
      cleanProjectId
    ]
  );

  return result?.rows?.[0] ?? null;
}

async function findByProject(projectId) {
  const result = await db.query(
    `
      SELECT *
      FROM get_canvases_by_project_id_or_owner(
        p_project_id => $1::uuid
      )
      `,
    [projectId]
  );

  return result?.rows ?? [];
}

async function findPersonal(userId) {
  const result = await db.query(
    `
      SELECT *
      FROM get_canvases_by_project_id_or_owner(
        p_user_id => $1::uuid,
        p_is_shared => false
      )
      `,
    [userId]
  );

  return result?.rows ?? [];
}

async function findShared(userId) {
  const result = await db.query(
    `
      SELECT *
      FROM get_canvases_by_project_id_or_owner(
        p_user_id => $1::uuid,
        p_is_shared => true
      )
      `,
    [userId]
  );

  return result?.rows ?? [];
}

async function update(userId, canvasId, data) {
  const result = await db.query(
    `
      SELECT *
      FROM create_canvas_version(
        $1::uuid,
        $2::uuid,
        $3::jsonb
      )
      `,
    [
      canvasId,
      userId,
      data.canvasData ?? data.canvas_data ?? {}
    ]
  );

  return result?.rows?.[0] ?? null;
}

async function share(canvasId, targetUserId, permission) {
  const result = await db.query(
    `
      SELECT
        share_canvas(
          $1::uuid,
          $2::uuid,
          $3
        ) AS shared
      `,
    [canvasId, targetUserId, permission]
  );

  return Boolean(result?.rows?.[0]?.shared);
}

async function archive(canvasId, userId) {
  const result = await db.query(
    `
      SELECT
        archive_canvas(
          $1::uuid,
          $2::uuid
        ) AS archived
      `,
    [canvasId, userId]
  );

  return Boolean(result?.rows?.[0]?.archived);
}

async function restore(canvasId, userId) {
  const result = await db.query(
    `
      SELECT
        restore_canvas(
          $1::uuid,
          $2::uuid
        ) AS restored
      `,
    [canvasId, userId]
  );

  return Boolean(result?.rows?.[0]?.restored);
}

async function remove(userId, canvasId) {
  const result = await db.query(
    `
      SELECT
        delete_canvas(
          $1::uuid,
          $2::uuid
        ) AS deleted
      `,
    [canvasId, userId]
  );

  return Boolean(result?.rows?.[0]?.deleted);
}

module.exports = {
  create,
  findByProject,
  findPersonal,
  findShared,
  update,
  share,
  archive,
  restore,
  delete: remove
};
