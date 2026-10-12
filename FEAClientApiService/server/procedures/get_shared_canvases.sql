SELECT
    c.id,
    c.name,
    c.current_version,
    cs.permission
FROM canvases c

INNER JOIN canvas_shares cs
    ON cs.canvas_id = c.id

WHERE cs.user_id = $1

ORDER BY c.name;

