CREATE OR REPLACE FUNCTION
create_canvas(
    p_project_id UUID,
    p_user_id UUID,
    p_name VARCHAR,
    p_canvas_data JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS
$$
DECLARE
    v_canvas_id UUID;
BEGIN

    INSERT INTO canvases
    (
        project_id,
        name,
        current_version,
        created_by
    )
    VALUES
    (
        p_project_id,
        p_name,
        1,
        p_user_id
    )
    RETURNING id
    INTO v_canvas_id;

    INSERT INTO canvas_versions
    (
        canvas_id,
        version_number,
        canvas_data,
        created_by
    )
    VALUES
    (
        v_canvas_id,
        1,
        p_canvas_data,
        p_user_id
    );

    RETURN v_canvas_id;

END;
$$;
