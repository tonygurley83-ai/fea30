CREATE OR REPLACE FUNCTION delete_project(
    p_owner_id text,
    p_project_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_rows integer;
BEGIN

    DELETE
    FROM projects
    WHERE
        id = p_project_id
    AND owner_id =
        p_owner_id::uuid;

    GET DIAGNOSTICS
        v_rows = ROW_COUNT;

    RETURN v_rows > 0;

END;
$$;
