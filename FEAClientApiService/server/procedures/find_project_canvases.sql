CREATE OR REPLACE FUNCTION
find_project_canvases(
    p_project_id UUID
)
RETURNS TABLE
(
    id UUID,
    name VARCHAR,
    current_version INTEGER,
    created_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
AS
$$
SELECT
    c.id,
    c.name,
    c.current_version,
    c.created_at
FROM canvases c

INNER JOIN project_canvases pc
    ON pc.canvas_id = c.id

WHERE pc.project_id = p_project_id

ORDER BY c.created_at DESC;
$$;
