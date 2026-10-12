CREATE OR REPLACE FUNCTION create_user(
    p_id UUID,
    p_email VARCHAR,
    p_display_name VARCHAR,
    p_role VARCHAR,
    p_identity_hash VARCHAR
)
RETURNS user
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user user;
BEGIN

    INSERT INTO user (
        id,
        email,
        display_name,
        role,
        identity_hash
    )
    VALUES (
        p_id,
        p_email,
        p_display_name,
        p_role,
        p_identity_hash
    )
    RETURNING *
    INTO v_user;

    RETURN v_user;

END;
$$;
