const router =
  require("express").Router();

const CanvasService =
  require("../services/CanvasService");

const requireAuth =
  require("../middleware/requireAuth");

function getAuthUserId(req) {
  return (
    req.user?.userId ||
    req.user?.id
  );
}

// GET /auth/canvases/personal
router.get(
  "/personal",
  requireAuth,
  async (req, res, next) => {
    try {
      const userId =
        getAuthUserId(req);

      const canvases =
        await CanvasService.getPersonalCanvases(
          userId
        );

      res.json(canvases || []);
    } catch (err) {
      next(err);
    }
  }
);

// GET /auth/canvases/shared
router.get(
  "/shared",
  requireAuth,
  async (req, res, next) => {
    try {
      const userId =
        getAuthUserId(req);

      const canvases =
        await CanvasService.getSharedCanvases(
          userId
        );

      res.json(canvases || []);
    } catch (err) {
      next(err);
    }
  }
);

// GET /auth/canvases/project/:projectId
router.get(
  "/project/:projectId",
  requireAuth,
  async (req, res, next) => {
    try {
      const canvases =
        await CanvasService.getProjectCanvases(
          req.params.projectId
        );

      res.json(canvases || []);
    } catch (err) {
      next(err);
    }
  }
);

// POST /auth/canvases
router.post(
  "/",
  requireAuth,
  async (req, res, next) => {
    try {
      const userId =
        getAuthUserId(req);

      const canvas =
        await CanvasService.createCanvas(
          userId,
          req.body || {}
        );

      res.status(201).json(
        canvas
      );
    } catch (err) {
      next(err);
    }
  }
);

// PUT /auth/canvases/:canvasId
router.put(
  "/:canvasId",
  requireAuth,
  async (req, res, next) => {
    try {
      const userId =
        getAuthUserId(req);

      const canvas =
        await CanvasService.updateCanvas(
          userId,
          req.params.canvasId,
          req.body || {}
        );

      if (!canvas) {
        return res.status(404).json({
          error: "Canvas not found"
        });
      }

      res.json(canvas);
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /auth/canvases/:canvasId
router.delete(
  "/:canvasId",
  requireAuth,
  async (req, res, next) => {
    try {
      const userId =
        getAuthUserId(req);

      const deleted =
        await CanvasService.deleteCanvas(
          userId,
          req.params.canvasId
        );

      if (!deleted) {
        return res.status(404).json({
          error: "Canvas not found"
        });
      }

      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
