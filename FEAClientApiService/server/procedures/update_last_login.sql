CREATE OR REPLACE FUNCTION update_last_login(
    p_user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN

    UPDATE user
       SET last_login = NOW()
     WHERE id = p_user_id;

END;
$$;
