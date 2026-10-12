CREATE OR REPLACE VIEW view_canvas_current_version AS
SELECT
    c.id AS canvas_id,
    c.name,
    c.owner_id,
    c.current_version,

    v.id AS version_id,
    v.version_number,

    v.canvas_data,

    v.created_by,
    v.created_at

FROM canvases c

INNER JOIN canvas_versions v
    ON v.canvas_id = c.id
   AND v.version_number = c.current_version;
