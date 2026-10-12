CREATE OR REPLACE FUNCTION get_projects(
    p_owner_id text
)
RETURNS TABLE (
    id uuid,
    name text,
    canvases json
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN

    RETURN QUERY

    SELECT
        p.id,
        p.name,

        COALESCE(
            json_agg(
                json_build_object(
                    'id', c.id,
                    'name', c.name,
                    'currentVersion', c.current_version
                )
            )
            FILTER (
                WHERE c.id IS NOT NULL
            ),
            '[]'::json
        ) AS canvases

    FROM projects p

    LEFT JOIN canvases c
        ON c.project_id = p.id

    WHERE
        p.owner_id = p_owner_id::uuid

    GROUP BY
        p.id,
        p.name

    ORDER BY
        p.name;

END;
$$;
