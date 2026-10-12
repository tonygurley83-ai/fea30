SELECT c.*
FROM canvases c
JOIN project_canvases pc
  ON pc.canvas_id = c.id
WHERE pc.project_id = $1;
