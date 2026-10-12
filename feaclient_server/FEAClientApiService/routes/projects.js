const router = require("express").Router({ mergeParams: true });
const requireAuth = require("../middleware/requireAuth");
const ProjectService = require("../services/ProjectService");
const crypto = require("crypto");

function getAuthId(req) {
  return String(req.user.userId || req.user.id);
}

// GET /auth/projects
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const authId = getAuthId(req);

    console.log(
      `[AUTHORIZED] ${req.user.email}`
    );

    const projects =
      await ProjectService.getProjects(
        authId
      );

    res.json(projects || []);
  } catch (err) {
    next(err);
  }
});

// GET /auth/projects/:projectId
router.get(
  "/:projectId",
  requireAuth,
  async (req, res, next) => {
    try {
      const authId =
        getAuthId(req);

      const project =
        await ProjectService.getProject(
          authId,
          req.params.projectId
        );

      if (!project) {
        return res.status(404).json({
          error: "Project not found"
        });
      }

      res.json(project);
    } catch (err) {
      next(err);
    }
  }
);

// POST /auth/projects
router.post(
  "/",
  requireAuth,
  async (req, res, next) => {
    try {
      const authId =
        getAuthId(req);

      const projectId =
        crypto.randomUUID();

      const body =
        req.body || {};

      const name =
        (
          body.name ||
          body.title ||
          ""
        ).trim();

      if (!name) {
        return res.status(400).json({
          error:
            "Project name required"
        });
      }

      const project =
        await ProjectService.createProject(
          authId,
          name,
          projectId
        );

      res.status(201).json(
        project
      );
    } catch (err) {
      next(err);
    }
  }
);

// PUT /auth/projects/:projectId
router.put(
  "/:projectId",
  requireAuth,
  async (req, res, next) => {
    try {
      const authId =
        getAuthId(req);

      const project =
        await ProjectService.updateProject(
          authId,
          req.params.projectId,
          req.body || {}
        );

      if (!project) {
        return res.status(404).json({
          error:
            "Project not found"
        });
      }

      res.json(project);
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /auth/projects/:projectId
router.delete(
  "/:projectId",
  requireAuth,
  async (req, res, next) => {
    try {
      const authId =
        getAuthId(req);

      const deleted =
        await ProjectService.deleteProject(
          authId,
          req.params.projectId
        );

      if (!deleted) {
        return res.status(404).json({
          error:
            "Project not found"
        });
      }

      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
