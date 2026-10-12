router.get(
  "/api/canvases/shared",
  requireAuth,
  async (req, res) => {

    const limit =
      Number(req.query.limit || 25);

    const offset =
      Number(req.query.offset || 0);

    const canvases =
      await CanvasService
        .findSharedCanvases(
          req.user.id,
          limit,
          offset
        );

    res.json(canvases);

  }
);
