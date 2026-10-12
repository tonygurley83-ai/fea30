CREATE OR REPLACE FUNCTION
share_canvas(
    p_canvas_id UUID,
    p_user_id UUID,
    p_permission VARCHAR
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS
$$
BEGIN

    INSERT INTO canvas_shares
    (
        canvas_id,
        user_id,
        permission
    )
    VALUES
    (
        p_canvas_id,
        p_user_id,
        p_permission
    )

    ON CONFLICT
    (
        canvas_id,
        user_id
    )

    DO UPDATE
    SET permission =
        EXCLUDED.permission;

END;
$$;
