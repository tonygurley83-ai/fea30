CREATE OR REPLACE FUNCTION find_identity(
    p_provider VARCHAR,
    p_provider_user_id VARCHAR
)
RETURNS user_identities
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_identity user_identities;
BEGIN

    SELECT *
      INTO v_identity
      FROM user_identities
     WHERE provider = p_provider
       AND provider_user_id = p_provider_user_id;

    IF v_identity.user_id IS NULL THEN
        RETURN NULL;
    END IF;

    RETURN v_identity;

END;
$$;
