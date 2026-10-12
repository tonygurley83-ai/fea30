async shareCanvas(
  canvasId,
  ownerUserId,
  targetUserId,
  permission
) {

  const canvas =
    await CanvasRepository
      .findById(
        canvasId
      );

  if (!canvas) {

    throw new Error(
      "Canvas not found"
    );

  }

  if (
    canvas.owner_id !==
    ownerUserId
  ) {

    throw new Error(
      "Only the canvas owner can share"
    );

  }

  const validPermissions = [
    "VIEWER",
    "EDITOR"
  ];

  if (
    !validPermissions.includes(
      permission
    )
  ) {

    throw new Error(
      "Invalid permission"
    );

  }

  return CanvasRepository
    .share(
      canvasId,
      targetUserId,
      permission
    );

}

async ensureCanvasAccess(
  canvasId,
  userId
) {

  const canvas =
    await CanvasRepository
      .findById(
        canvasId
      );

  if (!canvas) {

    throw new Error(
      "Canvas not found"
    );

  }

  if (
    canvas.owner_id ===
    userId
  ) {

    return {
      permission:
        "OWNER"
    };

  }

  const share =
    await CanvasRepository
      .findShare(
        canvasId,
        userId
      );

  if (!share) {

    throw new Error(
      "Access denied"
    );

  }

  return share;

}

async updateCanvas(
  canvasId,
  userId,
  changes
) {

  const access =
    await this
      .ensureCanvasAccess(
        canvasId,
        userId
      );

  if (
    access.permission !== "OWNER" &&
    access.permission !== "EDITOR"
  ) {

    throw new Error(
      "Edit permission required"
    );

  }

  return CanvasRepository
    .update(
      canvasId,
      changes
    );

}

