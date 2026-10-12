ALTER FUNCTION find_user_by_id(uuid)
SECURITY DEFINER;

ALTER FUNCTION find_user_by_email(varchar)
SECURITY DEFINER;

ALTER FUNCTION find_user_by_identity_hash(varchar)
SECURITY DEFINER;

ALTER FUNCTION find_identity(varchar, varchar)
SECURITY DEFINER;

ALTER FUNCTION create_user(
  uuid,
  varchar,
  varchar,
  varchar,
  varchar
)
SECURITY DEFINER;

ALTER FUNCTION create_user_identity(
  uuid,
  uuid,
  varchar,
  varchar,
  varchar
)
SECURITY DEFINER;

ALTER FUNCTION update_last_login(uuid)
SECURITY DEFINER;


GRANT EXECUTE
ON FUNCTION find_user_by_id(uuid)
TO fea_nix_nest;

GRANT EXECUTE
ON FUNCTION find_user_by_email(varchar)
TO fea_nix_nest;

GRANT EXECUTE
ON FUNCTION find_user_by_identity_hash(varchar)
TO fea_nix_nest;

GRANT EXECUTE
ON FUNCTION find_identity(varchar, varchar)
TO fea_nix_nest;

GRANT EXECUTE
ON FUNCTION create_user(
  uuid,
  varchar,
  varchar,
  varchar,
  varchar
)
TO fea_nix_nest;

GRANT EXECUTE
ON FUNCTION create_user_identity(
  uuid,
  uuid,
  varchar,
  varchar,
  varchar
)
TO fea_nix_nest;

GRANT EXECUTE
ON FUNCTION update_last_login(uuid)
TO fea_nix_nest;

