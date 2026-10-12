-- Allow execution of functions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO fea_nix_nest;

-- Allow execution of procedures
GRANT EXECUTE ON ALL PROCEDURES IN SCHEMA public TO fea_nix_nest;

-- Future functions/procedures
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT EXECUTE ON FUNCTIONS TO fea_nix_nest;


REVOKE INSERT, UPDATE, DELETE
ON ALL TABLES IN SCHEMA public
FROM fea_nix_nest;
