-- Create execution role if needed
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_roles WHERE rolname = 'fea_nix_nest_egg'
    ) THEN
        CREATE ROLE fea_nix_nest_egg;
    END IF;
END
$$;

-- Allow use of public schema
GRANT USAGE ON SCHEMA public TO fea_nix_nest_egg;

-- Allow execution of existing procedures/functions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO fea_nix_nest_egg;
GRANT EXECUTE ON ALL ROUTINES IN SCHEMA public TO fea_nix_nest_egg;

-- Prevent table access
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM fea_nix_nest;

-- Make future functions executable by the role
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT EXECUTE ON FUNCTIONS TO fea_nix_nest;

-- Grant role to your Android/Termux PostgreSQL user
GRANT fea_nix_nest_egg TO u0_a158;
