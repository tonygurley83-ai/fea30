CREATE OR REPLACE FUNCTION update_project(
    p_owner_id text,
    p_project_id uuid,
    p_name text
)
RETURNS SETOF projects
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN

    RETURN QUERY

    UPDATE projects
    SET
        name = p_name
    WHERE
        id = p_project_id
    AND owner_id =
        p_owner_id::uuid
    RETURNING *;

END;
$$;
