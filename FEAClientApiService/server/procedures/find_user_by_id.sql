CREATE OR REPLACE FUNCTION find_user_by_id(
    p_user_id UUID
)
RETURNS user
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user user;
BEGIN

    SELECT *
      INTO v_user
      FROM user
     WHERE id = p_user_id;

    IF v_user.id IS NULL THEN
     RETURN NULL;
    END IF;

    RETURN v_user;

END;
$$;
