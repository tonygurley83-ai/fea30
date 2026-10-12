CREATE VIEW admin_canvas_view AS
SELECT
    p.id   AS project_id,
    p.name AS project_name,
    c.id   AS canvas_id,
    c.name AS canvas_name,
    c.current_version
FROM projects p
JOIN project_canvases pc
    ON pc.project_id = p.id
JOIN canvases c
    ON c.id = pc.canvas_id;
