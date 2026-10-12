CREATE OR REPLACE FUNCTION find_user_by_email(
    p_email VARCHAR
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
     WHERE email = p_email;

    RETURN v_user;

END;
$$;
