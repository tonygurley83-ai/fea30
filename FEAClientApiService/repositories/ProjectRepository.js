const db = require("../server/egg/postgres");

async function create(userId, name, projectId) {
  const result = await db.query(
    `
    SELECT *
    FROM create_project(
      $1,
      $2,
      $3
    )
    `,
    [userId, name, projectId]
  );

  return result?.rows?.[0] ?? null;
}

async function findAll(userId) {
  const result = await db.query(
    `
    SELECT *
    FROM get_projects(
      $1
    )
    `,
    [userId]
  );

  return result?.rows ?? [];
}

async function findById(userId, projectId) {
  const result = await db.query(
    `
    SELECT *
    FROM get_project(
      $1,
      $2
    )
    `,
    [userId, projectId]
  );

  return result?.rows?.[0] ?? null;
}

async function update(userId, projectId, data) {
  const result = await db.query(
    `
    SELECT *
    FROM update_project(
      $1,
      $2,
      $3
    )
    `,
    [userId, projectId, data.name]
  );

  return result?.rows?.[0] ?? null;
}

async function remove(userId, projectId) {
  const result = await db.query(
    `
    SELECT
      delete_project(
        $1,
        $2
      ) AS deleted
    `,
    [userId, projectId]
  );

  return Boolean(result?.rows?.[0]?.deleted);
}

module.exports = {
  create,
  findAll,
  findById,
  update,
  delete: remove
};
