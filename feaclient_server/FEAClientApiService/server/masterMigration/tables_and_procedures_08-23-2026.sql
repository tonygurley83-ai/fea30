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
~/.../server/procedures $ cat create_user_identity.sql
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

REVOKE ALL ON user FROM fea_nix_nest;
REVOKE ALL ON user_identities FROM fea_nix_nest;

GRANT EXECUTE
ON FUNCTION create_user(
    UUID,
    VARCHAR,
    VARCHAR,
    VARCHAR,
    VARCHAR
)
TO fea_nix_nest;

GRANT EXECUTE
ON FUNCTION create_user_identity(
    UUID,
    UUID,
    VARCHAR,
    VARCHAR,
    VARCHAR
)
TO fea_nix_nest;

GRANT EXECUTE
ON FUNCTION find_user_by_id(UUID)
TO fea_nix_nest;

GRANT EXECUTE
ON FUNCTION find_user_by_email(VARCHAR)
TO fea_nix_nest;

GRANT EXECUTE
ON FUNCTION find_user_by_identity_hash(VARCHAR)
TO fea_nix_nest;

GRANT EXECUTE
ON FUNCTION find_identity(
    VARCHAR,
    VARCHAR
)
TO fea_nix_nest;

GRANT EXECUTE
ON FUNCTION update_last_login(UUID)
TO fea_nix_nest;
