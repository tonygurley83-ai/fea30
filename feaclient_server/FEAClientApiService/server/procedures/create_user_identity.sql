CREATE OR REPLACE FUNCTION create_user_identity(
    p_id UUID,
    p_user_id UUID,
    p_provider VARCHAR,
    p_provider_user_id VARCHAR,
    p_provider_email VARCHAR
)
RETURNS user_identities
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_identity user_identities;
BEGIN

    INSERT INTO user_identities (
        id,
        user_id,
        provider,
        provider_user_id,
        provider_email
    )
    VALUES (
        p_id,
        p_user_id,
        p_provider,
        p_provider_user_id,
        p_provider_email
    )
    RETURNING *
    INTO v_identity;

    RETURN v_identity;

END;
$$;
