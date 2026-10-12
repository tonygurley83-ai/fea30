function canAccessProject(
  user,
  project
) {
  if (!project.shareGroupId) {
    return true;
  }

  return user.shareGroupIds.includes(
    project.shareGroupId
  );
}

function canAccessCanvas(
  user,
  canvas
) {
  if (!canvas.shareGroupId) {
    return true;
  }

  return user.shareGroupIds.includes(
    canvas.shareGroupId
  );
}

module.exports = {
  canAccessProject,
  canAccessCanvas
};
