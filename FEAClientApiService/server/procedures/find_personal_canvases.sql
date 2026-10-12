CREATE OR REPLACE FUNCTION
find_personal_canvases(
    p_user_id UUID
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

WHERE c.owner_id = p_user_id

AND NOT EXISTS
(
    SELECT 1
    FROM project_canvases pc
    WHERE pc.canvas_id = c.id
)

ORDER BY c.created_at DESC;
$$;

