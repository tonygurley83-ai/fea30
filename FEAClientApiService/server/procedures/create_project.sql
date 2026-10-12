CREATE OR REPLACE FUNCTION
create_project(
    p_owner_id TEXT,
    p_name TEXT
)
RETURNS TABLE (
    project_id UUID
)
SECURITY DEFINER
AS $$
DECLARE
    v_project_id UUID;
    v_canvas_id UUID;
BEGIN

    v_project_id :=
        gen_random_uuid();

    v_canvas_id :=
        gen_random_uuid();

    INSERT INTO projects(
        id,
        owner_id,
        name,
        active_canvas_id
    )
    VALUES(
        v_project_id,
        p_owner_id,
        p_name,
        v_canvas_id
    );

    INSERT INTO canvases(
        id,
        project_id,
        name
    )
    VALUES(
        v_canvas_id,
        v_project_id,
        'Default Canvas'
    );

    RETURN QUERY
    SELECT v_project_id;

END;
$$ LANGUAGE plpgsql;
