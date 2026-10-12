CREATE OR REPLACE FUNCTION
delete_canvas(
    p_canvas_id UUID,
    p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS
$$
BEGIN

    IF NOT EXISTS (
        SELECT 1
        FROM canvases
        WHERE id = p_canvas_id
        AND created_by = p_user_id
    )
    THEN
        RETURN FALSE;
    END IF;

    DELETE FROM canvas_shares
    WHERE canvas_id = p_canvas_id;

    DELETE FROM canvas_versions
    WHERE canvas_id = p_canvas_id;

    DELETE FROM canvases
    WHERE id = p_canvas_id;

    RETURN TRUE;

END;
$$;
