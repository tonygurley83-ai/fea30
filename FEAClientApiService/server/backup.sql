--
-- PostgreSQL database dump
--

\restrict zr0wCa8IrYrUWB2TI1Yxb9LivgWeijVmCd8OEa6Z1p1AKiinjqaKXPdeZulqhi5

-- Dumped from database version 18.2
-- Dumped by pg_dump version 18.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: create_canvas(uuid, uuid, character varying, jsonb); Type: FUNCTION; Schema: public; Owner: u0_a158
--

CREATE FUNCTION public.create_canvas(p_project_id uuid, p_user_id uuid, p_name character varying, p_canvas_data jsonb) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_canvas_id UUID;
BEGIN

    INSERT INTO canvases
    (
        project_id,
        name,
        current_version,
        created_by
    )
    VALUES
    (
        p_project_id,
        p_name,
        1,
        p_user_id
    )
    RETURNING id
    INTO v_canvas_id;

    INSERT INTO canvas_versions
    (
        canvas_id,
        version_number,
        canvas_data,
        created_by
    )
    VALUES
    (
        v_canvas_id,
        1,
        p_canvas_data,
        p_user_id
    );

    RETURN v_canvas_id;

END;
$$;


ALTER FUNCTION public.create_canvas(p_project_id uuid, p_user_id uuid, p_name character varying, p_canvas_data jsonb) OWNER TO u0_a158;

--
-- Name: create_canvas(uuid, character varying, jsonb, uuid); Type: FUNCTION; Schema: public; Owner: u0_a158
--

CREATE FUNCTION public.create_canvas(p_user_id uuid, p_name character varying, p_canvas_data jsonb, p_project_id uuid DEFAULT NULL::uuid) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_canvas_id UUID;
BEGIN

    INSERT INTO canvases
    (
        project_id,
        name,
        current_version,
        created_by
    )
    VALUES
    (
        p_project_id,
        p_name,
        1,
        p_user_id
    )
    RETURNING id
    INTO v_canvas_id;

    INSERT INTO canvas_versions
    (
        canvas_id,
        version_number,
        canvas_data,
        created_by
    )
    VALUES
    (
        v_canvas_id,
        1,
        p_canvas_data,
        p_user_id
    );

    RETURN v_canvas_id;

END;
$$;


ALTER FUNCTION public.create_canvas(p_user_id uuid, p_name character varying, p_canvas_data jsonb, p_project_id uuid) OWNER TO u0_a158;

--
-- Name: create_canvas_version(uuid, uuid, jsonb); Type: FUNCTION; Schema: public; Owner: u0_a158
--

CREATE FUNCTION public.create_canvas_version(p_canvas_id uuid, p_user_id uuid, p_canvas_data jsonb) RETURNS integer
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_version INTEGER;
BEGIN

    SELECT current_version + 1
    INTO v_version
    FROM canvases
    WHERE id = p_canvas_id;

    INSERT INTO canvas_versions
    (
        canvas_id,
        version_number,
        canvas_data,
        created_by
    )
    VALUES
    (
        p_canvas_id,
        v_version,
        p_canvas_data,
        p_user_id
    );

    UPDATE canvases
    SET current_version = v_version
    WHERE id = p_canvas_id;

    RETURN v_version;

END;
$$;


ALTER FUNCTION public.create_canvas_version(p_canvas_id uuid, p_user_id uuid, p_canvas_data jsonb) OWNER TO u0_a158;

--
-- Name: create_project(text, text); Type: FUNCTION; Schema: public; Owner: u0_a158
--

CREATE FUNCTION public.create_project(p_owner_id text, p_name text) RETURNS TABLE(project_id uuid)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_project_id UUID;
    v_canvas_id UUID;
BEGIN

    v_project_id :=
        gen_random_uuid();

    v_canvas_id :=
        gen_random_uuid();

    INSERT INTO projects(
        id,
        owner_id,
        name,
        active_canvas_id
    )
    VALUES(
        v_project_id,
        p_owner_id,
        p_name,
        v_canvas_id
    );

    INSERT INTO canvases(
        id,
        project_id,
        name
    )
    VALUES(
        v_canvas_id,
        v_project_id,
        'Default Canvas'
    );

    RETURN QUERY
    SELECT v_project_id;

END;
$$;


ALTER FUNCTION public.create_project(p_owner_id text, p_name text) OWNER TO u0_a158;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: user; Type: TABLE; Schema: public; Owner: u0_a158
--

CREATE TABLE public.user (
    id uuid NOT NULL,
    email character varying(320) NOT NULL,
    display_name character varying(255) NOT NULL,
    role character varying(50) DEFAULT 'Engineer'::character varying NOT NULL,
    identity_hash character(64),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    last_login timestamp without time zone
);


ALTER TABLE public.user OWNER TO u0_a158;

--
-- Name: create_user(uuid, character varying, character varying, character varying, character varying); Type: FUNCTION; Schema: public; Owner: u0_a158
--

CREATE FUNCTION public.create_user(p_id uuid, p_email character varying, p_display_name character varying, p_role character varying, p_identity_hash character varying) RETURNS public.user
    LANGUAGE plpgsql SECURITY DEFINER
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


ALTER FUNCTION public.create_user(p_id uuid, p_email character varying, p_display_name character varying, p_role character varying, p_identity_hash character varying) OWNER TO u0_a158;

--
-- Name: user_identities; Type: TABLE; Schema: public; Owner: u0_a158
--

CREATE TABLE public.user_identities (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    provider character varying(50) NOT NULL,
    provider_user_id character varying(255) NOT NULL,
    provider_email character varying(320),
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_identities OWNER TO u0_a158;

--
-- Name: create_user_identity(uuid, uuid, character varying, character varying, character varying); Type: FUNCTION; Schema: public; Owner: u0_a158
--

CREATE FUNCTION public.create_user_identity(p_id uuid, p_user_id uuid, p_provider character varying, p_provider_user_id character varying, p_provider_email character varying) RETURNS public.user_identities
    LANGUAGE plpgsql SECURITY DEFINER
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


ALTER FUNCTION public.create_user_identity(p_id uuid, p_user_id uuid, p_provider character varying, p_provider_user_id character varying, p_provider_email character varying) OWNER TO u0_a158;

--
-- Name: delete_canvas(uuid, uuid); Type: FUNCTION; Schema: public; Owner: u0_a158
--

CREATE FUNCTION public.delete_canvas(p_canvas_id uuid, p_user_id uuid) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN

    IF NOT EXISTS (
        SELECT 1
        FROM canvases
        WHERE id = p_canvas_id
        AND created_by = p_user_id
    )
    THEN
        RETURN FALSE;
    END IF;

    DELETE FROM canvas_shares
    WHERE canvas_id = p_canvas_id;

    DELETE FROM canvas_versions
    WHERE canvas_id = p_canvas_id;

    DELETE FROM canvases
    WHERE id = p_canvas_id;

    RETURN TRUE;

END;
$$;


ALTER FUNCTION public.delete_canvas(p_canvas_id uuid, p_user_id uuid) OWNER TO u0_a158;

--
-- Name: find_identity(character varying, character varying); Type: FUNCTION; Schema: public; Owner: u0_a158
--

CREATE FUNCTION public.find_identity(p_provider character varying, p_provider_user_id character varying) RETURNS public.user_identities
    LANGUAGE plpgsql SECURITY DEFINER
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


ALTER FUNCTION public.find_identity(p_provider character varying, p_provider_user_id character varying) OWNER TO u0_a158;

--
-- Name: find_user_by_email(character varying); Type: FUNCTION; Schema: public; Owner: u0_a158
--

CREATE FUNCTION public.find_user_by_email(p_email character varying) RETURNS public.user
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_user user;
BEGIN

    SELECT *
      INTO v_user
      FROM user
     WHERE email = p_email;

    RETURN v_user;

END;
$$;


ALTER FUNCTION public.find_user_by_email(p_email character varying) OWNER TO u0_a158;

--
-- Name: find_user_by_id(uuid); Type: FUNCTION; Schema: public; Owner: u0_a158
--

CREATE FUNCTION public.find_user_by_id(p_user_id uuid) RETURNS public.user
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE                                             v_user user;
BEGIN

    SELECT *
      INTO v_user
      FROM user
     WHERE id = p_user_id;

    IF v_user.id IS NULL THEN
     RETURN NULL;
    END IF;

    RETURN v_user;

END;
$$;


ALTER FUNCTION public.find_user_by_id(p_user_id uuid) OWNER TO u0_a158;

--
-- Name: find_user_by_identity_hash(character varying); Type: FUNCTION; Schema: public; Owner: u0_a158
--

CREATE FUNCTION public.find_user_by_identity_hash(p_identity_hash character varying) RETURNS public.user
    LANGUAGE plpgsql SECURITY DEFINER
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


ALTER FUNCTION public.find_user_by_identity_hash(p_identity_hash character varying) OWNER TO u0_a158;

--
-- Name: share_canvas(uuid, uuid, character varying); Type: FUNCTION; Schema: public; Owner: u0_a158
--

CREATE FUNCTION public.share_canvas(p_canvas_id uuid, p_user_id uuid, p_permission character varying) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN

    INSERT INTO canvas_shares
    (
        canvas_id,
        user_id,
        permission
    )
    VALUES
    (
        p_canvas_id,
        p_user_id,
        p_permission
    )
    ON CONFLICT
    (
        canvas_id,
        user_id
    )
    DO UPDATE
    SET permission =
        EXCLUDED.permission;

END;
$$;


ALTER FUNCTION public.share_canvas(p_canvas_id uuid, p_user_id uuid, p_permission character varying) OWNER TO u0_a158;

--
-- Name: update_last_login(uuid); Type: FUNCTION; Schema: public; Owner: u0_a158
--

CREATE FUNCTION public.update_last_login(p_user_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN

    UPDATE user
       SET last_login = NOW()
     WHERE id = p_user_id;

END;
$$;


ALTER FUNCTION public.update_last_login(p_user_id uuid) OWNER TO u0_a158;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: u0_a158
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO u0_a158;

--
-- Name: canvases; Type: TABLE; Schema: public; Owner: u0_a158
--

CREATE TABLE public.canvases (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    owner_id uuid NOT NULL,
    current_version integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    project_id uuid
);


ALTER TABLE public.canvases OWNER TO u0_a158;

--
-- Name: project_canvases; Type: TABLE; Schema: public; Owner: u0_a158
--

CREATE TABLE public.project_canvases (
    project_id uuid NOT NULL,
    canvas_id uuid NOT NULL
);


ALTER TABLE public.project_canvases OWNER TO u0_a158;

--
-- Name: projects; Type: TABLE; Schema: public; Owner: u0_a158
--

CREATE TABLE public.projects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    owner_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.projects OWNER TO u0_a158;

--
-- Name: admin_canvas_view; Type: VIEW; Schema: public; Owner: u0_a158
--

CREATE VIEW public.admin_canvas_view AS
 SELECT p.id AS project_id,
    p.name AS project_name,
    c.id AS canvas_id,
    c.name AS canvas_name,
    c.current_version
   FROM ((public.projects p
     JOIN public.project_canvases pc ON ((pc.project_id = p.id)))
     JOIN public.canvases c ON ((c.id = pc.canvas_id)));


ALTER VIEW public.admin_canvas_view OWNER TO u0_a158;

--
-- Name: canvas_share_links; Type: TABLE; Schema: public; Owner: u0_a158
--

CREATE TABLE public.canvas_share_links (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    canvas_id uuid NOT NULL,
    token character varying(128) NOT NULL,
    created_by uuid NOT NULL,
    expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.canvas_share_links OWNER TO u0_a158;

--
-- Name: canvas_versions; Type: TABLE; Schema: public; Owner: u0_a158
--

CREATE TABLE public.canvas_versions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    canvas_id uuid NOT NULL,
    version_number integer NOT NULL,
    canvas_data jsonb NOT NULL,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.canvas_versions OWNER TO u0_a158;

--
-- Name: project_members; Type: TABLE; Schema: public; Owner: u0_a158
--

CREATE TABLE public.project_members (
    project_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role character varying(20) NOT NULL,
    CONSTRAINT project_members_role_check CHECK (((role)::text = ANY ((ARRAY['engineer'::character varying, 'admin'::character varying])::text[])))
);


ALTER TABLE public.project_members OWNER TO u0_a158;

--
-- Name: user_profiles; Type: TABLE; Schema: public; Owner: u0_a158
--

CREATE TABLE public.user_profiles (
    user_id uuid NOT NULL,
    display_name character varying(255) NOT NULL,
    first_name character varying(128),
    last_name character varying(128),
    company character varying(255),
    title character varying(255),
    phone character varying(50),
    avatar_url text,
    profile_complete boolean DEFAULT false NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_profiles OWNER TO u0_a158;

--
-- Name: view_canvas_current_version; Type: VIEW; Schema: public; Owner: u0_a158
--

CREATE VIEW public.view_canvas_current_version AS
 SELECT c.id AS canvas_id,
    c.name,
    c.owner_id,
    c.current_version,
    v.id AS version_id,
    v.version_number,
    v.canvas_data,
    v.created_by,
    v.created_at
   FROM (public.canvases c
     JOIN public.canvas_versions v ON (((v.canvas_id = c.id) AND (v.version_number = c.current_version))));


ALTER VIEW public.view_canvas_current_version OWNER TO u0_a158;

--
-- Data for Name: canvas_share_links; Type: TABLE DATA; Schema: public; Owner: u0_a158
--

COPY public.canvas_share_links (id, canvas_id, token, created_by, expires_at, created_at) FROM stdin;
\.


--
-- Data for Name: canvas_versions; Type: TABLE DATA; Schema: public; Owner: u0_a158
--

COPY public.canvas_versions (id, canvas_id, version_number, canvas_data, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: canvases; Type: TABLE DATA; Schema: public; Owner: u0_a158
--

COPY public.canvases (id, name, owner_id, current_version, created_at, project_id) FROM stdin;
\.


--
-- Data for Name: project_canvases; Type: TABLE DATA; Schema: public; Owner: u0_a158
--

COPY public.project_canvases (project_id, canvas_id) FROM stdin;
\.


--
-- Data for Name: project_members; Type: TABLE DATA; Schema: public; Owner: u0_a158
--

COPY public.project_members (project_id, user_id, role) FROM stdin;
\.


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: u0_a158
--

COPY public.projects (id, name, owner_id, created_at) FROM stdin;
\.


--
-- Data for Name: user_identities; Type: TABLE DATA; Schema: public; Owner: u0_a158
--

COPY public.user_identities (id, user_id, provider, provider_user_id, provider_email, created_at) FROM stdin;
\.


--
-- Data for Name: user_profiles; Type: TABLE DATA; Schema: public; Owner: u0_a158
--

COPY public.user_profiles (user_id, display_name, first_name, last_name, company, title, phone, avatar_url, profile_complete, updated_at) FROM stdin;
\.


--
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: u0_a158
--

COPY public.user (id, email, display_name, role, identity_hash, created_at, last_login) FROM stdin;
\.


--
-- Name: canvas_share_links canvas_share_links_pkey; Type: CONSTRAINT; Schema: public; Owner: u0_a158
--

ALTER TABLE ONLY public.canvas_share_links
    ADD CONSTRAINT canvas_share_links_pkey PRIMARY KEY (id);


--
-- Name: canvas_share_links canvas_share_links_token_key; Type: CONSTRAINT; Schema: public; Owner: u0_a158
--

ALTER TABLE ONLY public.canvas_share_links
    ADD CONSTRAINT canvas_share_links_token_key UNIQUE (token);


--
-- Name: canvas_versions canvas_versions_canvas_id_version_number_key; Type: CONSTRAINT; Schema: public; Owner: u0_a158
--

ALTER TABLE ONLY public.canvas_versions
    ADD CONSTRAINT canvas_versions_canvas_id_version_number_key UNIQUE (canvas_id, version_number);


--
-- Name: canvas_versions canvas_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: u0_a158
--

ALTER TABLE ONLY public.canvas_versions
    ADD CONSTRAINT canvas_versions_pkey PRIMARY KEY (id);


--
-- Name: canvases canvases_pkey; Type: CONSTRAINT; Schema: public; Owner: u0_a158
--

ALTER TABLE ONLY public.canvases
    ADD CONSTRAINT canvases_pkey PRIMARY KEY (id);


--
-- Name: project_canvases project_canvases_pkey; Type: CONSTRAINT; Schema: public; Owner: u0_a158
--

ALTER TABLE ONLY public.project_canvases
    ADD CONSTRAINT project_canvases_pkey PRIMARY KEY (project_id, canvas_id);


--
-- Name: project_members project_members_pkey; Type: CONSTRAINT; Schema: public; Owner: u0_a158
--

ALTER TABLE ONLY public.project_members
    ADD CONSTRAINT project_members_pkey PRIMARY KEY (project_id, user_id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: u0_a158
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: user_identities uq_provider_identity; Type: CONSTRAINT; Schema: public; Owner: u0_a158
--

ALTER TABLE ONLY public.user_identities
    ADD CONSTRAINT uq_provider_identity UNIQUE (provider, provider_user_id);


--
-- Name: user_identities user_identities_pkey; Type: CONSTRAINT; Schema: public; Owner: u0_a158
--

ALTER TABLE ONLY public.user_identities
    ADD CONSTRAINT user_identities_pkey PRIMARY KEY (id);


--
-- Name: user_profiles user_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: u0_a158
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_pkey PRIMARY KEY (user_id);


--
-- Name: user users_email_key; Type: CONSTRAINT; Schema: public; Owner: u0_a158
--

ALTER TABLE ONLY public.user
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: user users_identity_hash_key; Type: CONSTRAINT; Schema: public; Owner: u0_a158
--

ALTER TABLE ONLY public.user
    ADD CONSTRAINT users_identity_hash_key UNIQUE (identity_hash);


--
-- Name: user users_pkey; Type: CONSTRAINT; Schema: public; Owner: u0_a158
--

ALTER TABLE ONLY public.user
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: projects projects_updated_at; Type: TRIGGER; Schema: public; Owner: u0_a158
--

CREATE TRIGGER projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: canvas_share_links canvas_share_links_canvas_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: u0_a158
--

ALTER TABLE ONLY public.canvas_share_links
    ADD CONSTRAINT canvas_share_links_canvas_id_fkey FOREIGN KEY (canvas_id) REFERENCES public.canvases(id) ON DELETE CASCADE;


--
-- Name: canvas_versions canvas_versions_canvas_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: u0_a158
--

ALTER TABLE ONLY public.canvas_versions
    ADD CONSTRAINT canvas_versions_canvas_id_fkey FOREIGN KEY (canvas_id) REFERENCES public.canvases(id) ON DELETE CASCADE;


--
-- Name: user_identities fk_user; Type: FK CONSTRAINT; Schema: public; Owner: u0_a158
--

ALTER TABLE ONLY public.user_identities
    ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.user(id);


--
-- Name: project_canvases project_canvases_canvas_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: u0_a158
--

ALTER TABLE ONLY public.project_canvases
    ADD CONSTRAINT project_canvases_canvas_id_fkey FOREIGN KEY (canvas_id) REFERENCES public.canvases(id) ON DELETE CASCADE;


--
-- Name: project_canvases project_canvases_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: u0_a158
--

ALTER TABLE ONLY public.project_canvases
    ADD CONSTRAINT project_canvases_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: project_members project_members_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: u0_a158
--

ALTER TABLE ONLY public.project_members
    ADD CONSTRAINT project_members_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: user_profiles user_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: u0_a158
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user(id) ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA public TO fea_nix_nest;
GRANT USAGE ON SCHEMA public TO fea_nix_nest_egg;


--
-- Name: FUNCTION create_canvas(p_project_id uuid, p_user_id uuid, p_name character varying, p_canvas_data jsonb); Type: ACL; Schema: public; Owner: u0_a158
--

GRANT ALL ON FUNCTION public.create_canvas(p_project_id uuid, p_user_id uuid, p_name character varying, p_canvas_data jsonb) TO fea_nix_nest;
GRANT ALL ON FUNCTION public.create_canvas(p_project_id uuid, p_user_id uuid, p_name character varying, p_canvas_data jsonb) TO fea_nix_nest_egg;


--
-- Name: FUNCTION create_canvas(p_user_id uuid, p_name character varying, p_canvas_data jsonb, p_project_id uuid); Type: ACL; Schema: public; Owner: u0_a158
--

GRANT ALL ON FUNCTION public.create_canvas(p_user_id uuid, p_name character varying, p_canvas_data jsonb, p_project_id uuid) TO fea_nix_nest;


--
-- Name: FUNCTION create_canvas_version(p_canvas_id uuid, p_user_id uuid, p_canvas_data jsonb); Type: ACL; Schema: public; Owner: u0_a158
--

GRANT ALL ON FUNCTION public.create_canvas_version(p_canvas_id uuid, p_user_id uuid, p_canvas_data jsonb) TO fea_nix_nest;
GRANT ALL ON FUNCTION public.create_canvas_version(p_canvas_id uuid, p_user_id uuid, p_canvas_data jsonb) TO fea_nix_nest_egg;


--
-- Name: FUNCTION create_project(p_owner_id text, p_name text); Type: ACL; Schema: public; Owner: u0_a158
--

GRANT ALL ON FUNCTION public.create_project(p_owner_id text, p_name text) TO fea_nix_nest;
GRANT ALL ON FUNCTION public.create_project(p_owner_id text, p_name text) TO fea_nix_nest_egg;


--
-- Name: FUNCTION create_user(p_id uuid, p_email character varying, p_display_name character varying, p_role character varying, p_identity_hash character varying); Type: ACL; Schema: public; Owner: u0_a158
--

GRANT ALL ON FUNCTION public.create_user(p_id uuid, p_email character varying, p_display_name character varying, p_role character varying, p_identity_hash character varying) TO fea_nix_nest;
GRANT ALL ON FUNCTION public.create_user(p_id uuid, p_email character varying, p_display_name character varying, p_role character varying, p_identity_hash character varying) TO fea_nix_nest_egg;


--
-- Name: FUNCTION create_user_identity(p_id uuid, p_user_id uuid, p_provider character varying, p_provider_user_id character varying, p_provider_email character varying); Type: ACL; Schema: public; Owner: u0_a158
--

GRANT ALL ON FUNCTION public.create_user_identity(p_id uuid, p_user_id uuid, p_provider character varying, p_provider_user_id character varying, p_provider_email character varying) TO fea_nix_nest;
GRANT ALL ON FUNCTION public.create_user_identity(p_id uuid, p_user_id uuid, p_provider character varying, p_provider_user_id character varying, p_provider_email character varying) TO fea_nix_nest_egg;


--
-- Name: FUNCTION delete_canvas(p_canvas_id uuid, p_user_id uuid); Type: ACL; Schema: public; Owner: u0_a158
--

GRANT ALL ON FUNCTION public.delete_canvas(p_canvas_id uuid, p_user_id uuid) TO fea_nix_nest;


--
-- Name: FUNCTION find_identity(p_provider character varying, p_provider_user_id character varying); Type: ACL; Schema: public; Owner: u0_a158
--

GRANT ALL ON FUNCTION public.find_identity(p_provider character varying, p_provider_user_id character varying) TO fea_nix_nest;
GRANT ALL ON FUNCTION public.find_identity(p_provider character varying, p_provider_user_id character varying) TO fea_nix_nest_egg;


--
-- Name: FUNCTION find_user_by_email(p_email character varying); Type: ACL; Schema: public; Owner: u0_a158
--

GRANT ALL ON FUNCTION public.find_user_by_email(p_email character varying) TO fea_nix_nest;
GRANT ALL ON FUNCTION public.find_user_by_email(p_email character varying) TO fea_nix_nest_egg;


--
-- Name: FUNCTION find_user_by_id(p_user_id uuid); Type: ACL; Schema: public; Owner: u0_a158
--

GRANT ALL ON FUNCTION public.find_user_by_id(p_user_id uuid) TO fea_nix_nest;
GRANT ALL ON FUNCTION public.find_user_by_id(p_user_id uuid) TO fea_nix_nest_egg;


--
-- Name: FUNCTION find_user_by_identity_hash(p_identity_hash character varying); Type: ACL; Schema: public; Owner: u0_a158
--

GRANT ALL ON FUNCTION public.find_user_by_identity_hash(p_identity_hash character varying) TO fea_nix_nest;
GRANT ALL ON FUNCTION public.find_user_by_identity_hash(p_identity_hash character varying) TO fea_nix_nest_egg;


--
-- Name: FUNCTION share_canvas(p_canvas_id uuid, p_user_id uuid, p_permission character varying); Type: ACL; Schema: public; Owner: u0_a158
--

GRANT ALL ON FUNCTION public.share_canvas(p_canvas_id uuid, p_user_id uuid, p_permission character varying) TO fea_nix_nest;
GRANT ALL ON FUNCTION public.share_canvas(p_canvas_id uuid, p_user_id uuid, p_permission character varying) TO fea_nix_nest_egg;


--
-- Name: FUNCTION update_last_login(p_user_id uuid); Type: ACL; Schema: public; Owner: u0_a158
--

GRANT ALL ON FUNCTION public.update_last_login(p_user_id uuid) TO fea_nix_nest;
GRANT ALL ON FUNCTION public.update_last_login(p_user_id uuid) TO fea_nix_nest_egg;


--
-- Name: FUNCTION update_updated_at_column(); Type: ACL; Schema: public; Owner: u0_a158
--

GRANT ALL ON FUNCTION public.update_updated_at_column() TO fea_nix_nest;
GRANT ALL ON FUNCTION public.update_updated_at_column() TO fea_nix_nest_egg;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: u0_a158
--

ALTER DEFAULT PRIVILEGES FOR ROLE u0_a158 IN SCHEMA public GRANT ALL ON FUNCTIONS TO fea_nix_nest;


--
-- PostgreSQL database dump complete
--

\unrestrict zr0wCa8IrYrUWB2TI1Yxb9LivgWeijVmCd8OEa6Z1p1AKiinjqaKXPdeZulqhi5

