BEGIN;

-- Remove direct table access
REVOKE ALL PRIVILEGES ON TABLE public."user" FROM fea_nix_nest;
REVOKE ALL PRIVILEGES ON TABLE public.user_profiles FROM fea_nix_nest;
REVOKE ALL PRIVILEGES ON TABLE public.user_identities FROM fea_nix_nest;
REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM fea_nix_nest;

-- Allow execution of approved functions
GRANT EXECUTE ON FUNCTION public.find_user_by_email(character varying) TO fea_nix_nest;
GRANT EXECUTE ON FUNCTION public.find_user_by_id(uuid) TO fea_nix_nest;
GRANT EXECUTE ON FUNCTION public.find_user_by_identity_hash(character varying) TO fea_nix_nest;
GRANT EXECUTE ON FUNCTION public.create_user(
    uuid,
    character varying,
    character varying,
    character varying,
    character varying
) TO fea_nix_nest;
GRANT EXECUTE ON FUNCTION public.create_user_identity(
    uuid,
    uuid,
    character varying,
    character varying,
    character varying
) TO fea_nix_nest;
GRANT EXECUTE ON FUNCTION public.update_last_login(uuid) TO fea_nix_nest;

COMMIT;
