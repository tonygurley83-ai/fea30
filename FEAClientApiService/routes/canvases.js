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
        await 
CanvasService.getPersonalCanvases(
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
        await 
CanvasService.getSharedCanvases(
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
        await 
CanvasService.getProjectCanvases(
          req.params.projectId
        );

      res.json(canvases || []);
    } catch (err) {
      next(err);
    }
  }
);

// GET /auth/canvases/:canvas_id
router.get(
  "/:canvas_id",
  requireAuth,
  async (req, res, next) => {
    try {
      const userId =
        getAuthUserId(req);

      const canvas =
        await CanvasService.getCanvasById(
          userId,
          req.params.canvas_id
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

router.put(
  "/:canvasId",
  requireAuth,
  async (req, res) => {
    try {
      const userId =
        getAuthUserId(req);

      console.log(
        "[CANVAS UPDATE REQUEST]",
        {
          userId,
          canvasId:
            req.params.canvasId
        }
      );

      console.log(
        "[CANVAS UPDATE BODY]",
        req.body
      );

      const canvas =
        await CanvasService.updateCanvas(
          userId,
          req.params.canvasId,
          req.body || {}
        );

      console.log(
        "[CANVAS UPDATE RESULT]",
        canvas
      );

      if (!canvas) {
        return res.status(404).json({
          error: "Canvas not found"
        });
      }

      return res.json(canvas);
    }
    catch (err) {
      console.error(
        "[CANVAS UPDATE ERROR]"
      );

      console.error(err);

      return res.status(500).json({
        error:
          err.message,
        stack:
          process.env.NODE_ENV ===
          "development"
            ? err.stack
            : undefined
      });
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

// PUT /auth/canvases/:canvas_id
router.put(
  "/:canvas_id",
  requireAuth,
  async (req, res, next) => {
    try {
      const userId =
        getAuthUserId(req);

      const canvas =
        await CanvasService.updateCanvas(
          userId,
          req.params.canvas_id,
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

// DELETE /auth/canvases/:canvas_id
router.delete(
  "/:canvas_id",
  requireAuth,
  async (req, res, next) => {
    try {
      const userId =
        getAuthUserId(req);

      const deleted =
        await CanvasService.deleteCanvas(
          userId,
          req.params.canvas_id
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

