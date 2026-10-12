async shareCanvas(
  canvas_id,
  ownerUserId,
  targetUserId,
  permission
) {

  const canvas =
    await CanvasRepository
      .findById(
        canvas_id
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
      canvas_id,
      targetUserId,
      permission
    );

}

async ensureCanvasAccess(
  canvas_id,
  userId
) {

  const canvas =
    await CanvasRepository
      .findById(
        canvas_id
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
        canvas_id,
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
  canvas_id,
  userId,
  changes
) {

  const access =
    await this
      .ensureCanvasAccess(
        canvas_id,
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
      canvas_id,
      changes
    );

}

