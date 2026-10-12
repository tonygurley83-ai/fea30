CREATE OR REPLACE FUNCTION find_user_by_identity_hash(
    p_identity_hash VARCHAR
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
     WHERE identity_hash = p_identity_hash;

    RETURN v_user;

END;
$$;
