CREATE OR REPLACE FUNCTION
find_shared_canvases(
    p_user_id UUID
)
RETURNS TABLE
(
    id UUID,
    name VARCHAR,
    current_version INTEGER,
    permission VARCHAR
)
LANGUAGE sql
SECURITY DEFINER
AS
$$
SELECT
    c.id,
    c.name,
    c.current_version,
    cs.permission
FROM canvases c

INNER JOIN canvas_shares cs
    ON cs.canvas_id = c.id

WHERE cs.user_id = p_user_id

ORDER BY c.name;
$$;
