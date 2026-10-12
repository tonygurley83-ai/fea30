CREATE OR REPLACE FUNCTION
unshare_canvas(
    p_canvas_id UUID,
    p_user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS
$$
BEGIN

    DELETE
    FROM canvas_shares

    WHERE canvas_id =
        p_canvas_id

    AND user_id =
        p_user_id;

END;
$$;
