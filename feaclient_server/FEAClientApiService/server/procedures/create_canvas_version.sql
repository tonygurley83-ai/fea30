CREATE OR REPLACE FUNCTION create_canvas_version(
    p_canvas_id UUID,
    p_content JSONB
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_next_version INTEGER;
BEGIN

    SELECT current_version + 1
    INTO v_next_version
    FROM canvases
    WHERE id = p_canvas_id;

    INSERT INTO canvas_versions (
        canvas_id,
        version_number,
        content
    )
    VALUES (
        p_canvas_id,
        v_next_version,
        p_content
    );

    UPDATE canvases
    SET current_version = v_next_version
    WHERE id = p_canvas_id;

    RETURN v_next_version;

END;
$$;
