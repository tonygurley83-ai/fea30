const router = require("express").Router();
const requireAuth = require("../middleware/requireAuth");
const ProjectService = require("../services/ProjectService");
const AuthService = require("../services/AuthService");
const UserRepository = require("../repositories/UserRepository");
const { randomUUID } = require("crypto");

const id = randomUUID();

// Helper function to verify matching user IDs
function isAuthorized(req, res) {
  const authenticatedUserId = req.user.id;

  if (req.params.id !== authenticatedUserId) {
    res.status(403).json({ error: "Forbidden" });
    return false;
  }

  return true;
}

/*
 * Get current user (based on token)
 */
router.get("/auth/user", requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await UserRepository.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
});

/*
 * Get specific user by ID
 */
router.get("/auth/user/:id", requireAuth, async (req, res, next) => {
  if (!isAuthorized(req, res)) return;

  try {
    const user = await UserRepository.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
});

/*
 * Create user
 */
router.post("/auth/user", async (req, res, next) => {
  try {
    const user = await AuthService.createUser(req.body);
    res.status(201).json(user);
  } catch (err) {
    console.error("Create User Error:", err);

    if (err.statusCode) {
      return res.status(err.statusCode).json({ error: err.message });
    }

    res.status(500).json({ error: "Internal server error" });
  }
});

/*
 * Get user projects
 */
router.get("/auth/projects", requireAuth, async (req, res, next) => {
  if (!isAuthorized(req, res)) return;

  try {
    const projects = await ProjectService.getProjects(req.params.id);
    res.json(projects || []);
  } catch (err) {
    next(err);
  }
});

/*
 * Get project
 */
router.get(
  "/auth/projects/:projectId",
  requireAuth,
  async (req, res, next) => {
    if (!isAuthorized(req, res)) return;

    try {
      const project = await ProjectService.getProject(
        id,
        req.params.projectId
      );

      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      res.json(project);
    } catch (err) {
      next(err);
    }
  }
);

/*
 * Create project
 */
router.post("/auth/projects", requireAuth, async (req, res, next) => {
  if (!isAuthorized(req, res)) return;

  try {
    const projectName = req.body.name || req.body.title;

    if (!projectName) {
      return res.status(400).json({ error: "Project name is required" });
    }

    const project = await ProjectService.createProject(
      id,
      projectName
    );

    res.status(201).json(project);
  } catch (err) {
    next(err);
  }
});

/*
 * Update / Rename project
 */
router.put(
  "/auth/projects/:projectId",
  requireAuth,
  async (req, res, next) => {
    if (!isAuthorized(req, res)) return;

    try {
      const project = await ProjectService.updateProject(
        id,
        req.params.projectId,
        req.body
      );

      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      res.json(project);
    } catch (err) {
      next(err);
    }
  }
);

/*
 * Delete project
 */
router.delete(
  "/auth/projects/:projectId",
  requireAuth,
  async (req, res, next) => {
    if (!isAuthorized(req, res)) return;

    try {
      const deleted = await ProjectService.deleteProject(
        id,
        req.params.projectId
      );

      if (!deleted) {
        return res.status(404).json({ error: "Project not found" });
      }

      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
