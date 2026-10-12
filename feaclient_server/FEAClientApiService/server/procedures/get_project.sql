CREATE OR REPLACE FUNCTION get_project(
    p_owner_id text,
    p_project_id uuid
)
RETURNS SETOF projects
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN

    RETURN QUERY

    SELECT *
    FROM projects
    WHERE
        id = p_project_id
    AND owner_id =
        p_owner_id::uuid;

END;
$$;
