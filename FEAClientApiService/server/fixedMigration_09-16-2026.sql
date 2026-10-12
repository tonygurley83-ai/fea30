
--
-- Fix reserved identifier
--

ALTER TABLE IF EXISTS public.user
RENAME TO "user";

--
-- Fix projects table
--

ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS active_canvas_id uuid;

ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

--
-- Fix canvases table
-- Functions expect created_by, not owner_id
--

ALTER TABLE public.canvases
ADD COLUMN IF NOT EXISTS created_by uuid;

UPDATE public.canvases
SET created_by = owner_id
WHERE created_by IS NULL;

--
-- Fix user foreign keys
--

ALTER TABLE public.user_identities
DROP CONSTRAINT IF EXISTS fk_user;

ALTER TABLE public.user_identities
ADD CONSTRAINT fk_user
FOREIGN KEY (user_id)
REFERENCES public."user"(id);

ALTER TABLE public.user_profiles
DROP CONSTRAINT IF EXISTS user_profiles_user_id_fkey;

ALTER TABLE public.user_profiles
ADD CONSTRAINT user_profiles_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES public."user"(id)
ON DELETE CASCADE;

--
-- Replace broken functions
--

CREATE OR REPLACE FUNCTION public.find_user_by_email(
    p_email varchar
)
RETURNS public."user"
LANGUAGE plpgsql
AS $$
DECLARE
    v_user public."user";
BEGIN
    SELECT *
    INTO v_user
    FROM public."user"
    WHERE email = p_email;

    RETURN v_user;
END;
$$;

CREATE OR REPLACE FUNCTION public.find_user_by_id(
    p_user_id uuid
)
RETURNS public."user"
LANGUAGE plpgsql
AS $$
DECLARE
    v_user public."user";
BEGIN
    SELECT *
    INTO v_user
    FROM public."user"
    WHERE id = p_user_id;

    RETURN v_user;
END;
$$;

CREATE OR REPLACE FUNCTION public.find_user_by_identity_hash(
    p_identity_hash varchar
)
RETURNS public."user"
LANGUAGE plpgsql
AS $$
DECLARE
    v_user public."user";
BEGIN
    SELECT *
    INTO v_user
    FROM public."user"
    WHERE identity_hash = p_identity_hash;

    RETURN v_user;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_last_login(
    p_user_id uuid
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE public."user"
    SET last_login = now()
    WHERE id = p_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_user(
    p_id uuid,
    p_email varchar,
    p_display_name varchar,
    p_role varchar,
    p_identity_hash varchar
)
RETURNS public."user"
LANGUAGE plpgsql
AS $$
DECLARE
    v_user public."user";
BEGIN
    INSERT INTO public."user"
    (
        id,
        email,
        display_name,
        role,
        identity_hash
    )
    VALUES
    (
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
