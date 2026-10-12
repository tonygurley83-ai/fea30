SELECT p.*
FROM projects p
JOIN project_canvases pc
  ON pc.project_id = p.id
WHERE pc.canvas_id = $1;
