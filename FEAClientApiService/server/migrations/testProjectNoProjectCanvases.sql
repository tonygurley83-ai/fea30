SELECT
  p.name,
  c.name
FROM project_canvases pc
JOIN projects p
  ON p.id = pc.project_id
JOIN canvases c
  ON c.id = pc.canvas_id
ORDER BY
  p.name,
  c.name;
