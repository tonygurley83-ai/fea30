CREATE ROLE indrachahallahuahaskuahllykuana
LOGIN
PASSWORD 'fealty';


-- Create database
CREATE DATABASE fea_nix_source
    WITH
    OWNER = indrachahallahuahaskuahllykuana
    ENCODING = 'UTF8'
    TEMPLATE = template0;

-- Optional: create application user
CREATE USER fealty
    WITH PASSWORD 'Phoenix44!';

-- Create role
CREATE ROLE fea_nix_nest LOGIN PASSWORD 'indrachahallahuahaskuahllykuana';

-- Allow connecting to DB
GRANT CONNECT ON DATABASE fea_nix_source TO fea_nix_nest;

--Allow select methods
GRANT SELECT ON public.user TO fea_nix_nest;

-- Allow using schema
GRANT USAGE ON SCHEMA public TO fea_nix_nest;

-- Remove direct table access
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM fea_nix_nest;

-- Grant execute on all existing functions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO fea_nix_nest;

-- Grant execute on all future functions
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT EXECUTE ON FUNCTIONS TO fea_nix_nest;

\i ../migrations/table-users_create.sql
\i ../migrations/table-user_profiles_create.sql
\i ../migrations/table-user_identities_create.sql
\i ../migrations/table-projects_create.sql
\i ../migrations/table-canvases_create.sql
\i ../migrations/table-project_members_create.sql
\i ../migrations/table-project_canvases_create.sql
\i ../migrations/table-canvas_versions_create.sql
\i ../migrations/table-canvas_share_links_create.sql

\i ../procedures/trigger-updated_at.sql
\i ../procedures/create_project.sql
\i ../procedures/create_canvas.sql
\i ../procedures/create_canvas_version.sql
\i ../procedures/share_canvas.sql
\i ../procedures/get_project_canvases.sql
\i ../procedures/view_canvas_current_version.sql
\i ../procedures/view_admin_project_canvases.sql
#\i ../procedures/admin-or-shared_get_canvas_projects.sql

CREATE OR REPLACE FUNCTION create_user(
    p_id UUID,
    p_email VARCHAR,
    p_display_name VARCHAR,
    p_role VARCHAR,
    p_identity_hash VARCHAR
)
RETURNS public.user
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user public.user;
BEGIN

    INSERT INTO public.user (
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

CREATE OR REPLACE FUNCTION find_user_by_email(
    p_email VARCHAR
)
RETURNS SETOF public.user
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT * 
    FROM public.user 
    WHERE email = p_email;
END;
$$;

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

REVOKE ALL ON public.user FROM fea_nix_nest;
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

-- Create login user
CREATE ROLE fea_nix
WITH LOGIN
PASSWORD 'indrachamagrapulhuakanhakam'
IN ROLE fea_nix_nest;

-- Allow connection to database
GRANT CONNECT ON DATABASE fea_nix_source TO fea_nix_nest;

-- Connect to the database
\c fea_nix_source

-- Allow use of schema
GRANT USAGE ON SCHEMA public TO fea_nix_nest;

-- Grant execute on all existing procedures/functions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO fea_nix_nest;
GRANT EXECUTE ON ALL ROUTINES IN SCHEMA public TO fea_nix_nest;

-- Grant execute on future procedures/functions
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT EXECUTE ON FUNCTIONS TO fea_nix_nest;

CREATE USER fea_nix
WITH PASSWORD 'Phoenix44!&$@password1'
IN ROLE fea_nix_nest;

--newest
ALTER TABLE canvases
ALTER COLUMN project_id DROP NOT NULL;
ALTER TABLE canvases
ADD COLUMN project_id UUID NULL;

CREATE OR REPLACE FUNCTION
create_canvas(
    p_user_id UUID,
    p_name VARCHAR,
    p_canvas_data JSONB,
    p_project_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS
$$
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

CREATE OR REPLACE FUNCTION
delete_canvas(
    p_canvas_id UUID,
    p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS
$$
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

--newest

CREATE OR REPLACE FUNCTION
create_project(
    p_owner_id TEXT,
    p_name TEXT
)
RETURNS TABLE(project_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
AS
$$
DECLARE
    v_project_id UUID;
BEGIN

    v_project_id :=
        gen_random_uuid();

    INSERT INTO projects
    (
        id,
        owner_id,
        name
    )
    VALUES
    (
        v_project_id,
        p_owner_id::uuid,
        p_name
    );

    RETURN QUERY
    SELECT v_project_id;

END;
$$;

CREATE OR REPLACE FUNCTION
create_canvas(
    p_user_id UUID,
    p_name VARCHAR,
    p_canvas_data JSONB,
    p_project_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS
$$
DECLARE
    v_canvas_id UUID;
BEGIN

    INSERT INTO canvases
    (
        name,
        owner_id,
        current_version,
        project_id
    )
    VALUES
    (
        p_name,
        p_user_id,
        1,
        p_project_id
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

    IF p_project_id IS NOT NULL THEN

        INSERT INTO project_canvases
        (
            project_id,
            canvas_id
        )
        VALUES
        (
            p_project_id,
            v_canvas_id
        )
        ON CONFLICT DO NOTHING;

    END IF;

    RETURN v_canvas_id;

END;
$$;


CREATE OR REPLACE FUNCTION
delete_canvas(
    p_canvas_id UUID,
    p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS
$$
BEGIN

    IF NOT EXISTS
    (
        SELECT 1
        FROM canvases
        WHERE id = p_canvas_id
        AND owner_id = p_user_id
    )
    THEN
        RETURN FALSE;
    END IF;

    DELETE FROM canvases
    WHERE id = p_canvas_id;

    RETURN TRUE;

END;
$$;

--newest
CREATE OR REPLACE FUNCTION
find_project_canvases(
    p_project_id UUID
)
RETURNS TABLE
(
    id UUID,
    name VARCHAR,
    current_version INTEGER,
    created_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
AS
$$
SELECT
    c.id,
    c.name,
    c.current_version,
    c.created_at
FROM canvases c

INNER JOIN project_canvases pc
    ON pc.canvas_id = c.id

WHERE pc.project_id = p_project_id

ORDER BY c.created_at DESC;
$$;

CREATE OR REPLACE FUNCTION
find_personal_canvases(
    p_user_id UUID
)
RETURNS TABLE
(
    id UUID,
    name VARCHAR,
    current_version INTEGER,
    created_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
AS
$$
SELECT
    c.id,
    c.name,
    c.current_version,
    c.created_at
FROM canvases c

WHERE c.owner_id = p_user_id

AND NOT EXISTS
(
    SELECT 1
    FROM project_canvases pc
    WHERE pc.canvas_id = c.id
)

ORDER BY c.created_at DESC;
$$;

CREATE OR REPLACE FUNCTION
find_shared_canvases(
    p_user_id UUID
)
RETURNS TABLE
(
    id UUID,
    name VARCHAR,
    current_version INTEGER,
    permission VARCHAR
)
LANGUAGE sql
SECURITY DEFINER
AS
$$
SELECT
    c.id,
    c.name,
    c.current_version,
    cs.permission
FROM canvases c

INNER JOIN canvas_shares cs
    ON cs.canvas_id = c.id

WHERE cs.user_id = p_user_id

ORDER BY c.name;
$$;

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

DROP FUNCTION create_canvas(
    uuid,
    uuid,
    character varying,
    jsonb
);

BEGIN;

-- =====================================================
-- PROJECT FUNCTIONS
-- =====================================================

CREATE OR REPLACE FUNCTION create_project(
    p_owner_id text,
    p_name text
)
RETURNS SETOF projects
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_project_id uuid;
BEGIN

    v_project_id :=
        gen_random_uuid();

    INSERT INTO projects (
        id,
        owner_id,
        name
    )
    VALUES (
        v_project_id,
        p_owner_id::uuid,
        p_name
    );

    RETURN QUERY
    SELECT *
    FROM projects
    WHERE id = v_project_id;

END;
$$;


CREATE OR REPLACE FUNCTION get_projects(
    p_owner_id text
)
RETURNS TABLE(
    id uuid,
    name text,
    canvases json
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN

    RETURN QUERY

    SELECT
        p.id,
        p.name,

        COALESCE(
            json_agg(
                json_build_object(
                    'id', c.id,
                    'name', c.name,
                    'currentVersion', c.current_version
                )
            )
            FILTER (
                WHERE c.id IS NOT NULL
            ),
            '[]'::json
        ) AS canvases

    FROM projects p

    LEFT JOIN canvases c
        ON c.project_id = p.id

    WHERE p.owner_id =
        p_owner_id::uuid

    GROUP BY
        p.id,
        p.name

    ORDER BY
        p.name;

END;
$$;


CREATE OR REPLACE FUNCTION get_project(
    p_owner_id text,
    p_project_id uuid
)
RETURNS SETOF projects
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN

    RETURN QUERY

    SELECT *
    FROM projects
    WHERE
        id = p_project_id
    AND owner_id =
        p_owner_id::uuid;

END;
$$;


CREATE OR REPLACE FUNCTION update_project(
    p_owner_id text,
    p_project_id uuid,
    p_name text
)
RETURNS SETOF projects
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN

    RETURN QUERY

    UPDATE projects
    SET name = p_name
    WHERE
        id = p_project_id
    AND owner_id =
        p_owner_id::uuid
    RETURNING *;

END;
$$;


CREATE OR REPLACE FUNCTION delete_project(
    p_owner_id text,
    p_project_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_rows integer;
BEGIN

    DELETE
    FROM projects
    WHERE
        id = p_project_id
    AND owner_id =
        p_owner_id::uuid;

    GET DIAGNOSTICS
        v_rows = ROW_COUNT;

    RETURN v_rows > 0;

END;
$$;


-- =====================================================
-- CANVAS TABLE ENHANCEMENTS
-- =====================================================

ALTER TABLE canvases
ADD COLUMN IF NOT EXISTS archived boolean
NOT NULL DEFAULT false;

ALTER TABLE canvases
ADD COLUMN IF NOT EXISTS archived_at timestamptz;


-- =====================================================
-- CANVAS SHARING
-- =====================================================

CREATE TABLE IF NOT EXISTS canvas_shares
(
    canvas_id uuid NOT NULL,
    user_id uuid NOT NULL,
    permission text NOT NULL,

    PRIMARY KEY (
        canvas_id,
        user_id
    )
);


-- =====================================================
-- CANVAS VERSIONING
-- =====================================================

CREATE TABLE IF NOT EXISTS canvas_versions
(
    canvas_id uuid NOT NULL,

    version integer NOT NULL,

    canvas_data jsonb NOT NULL,

    created_by uuid NOT NULL,

    created_at timestamptz
        NOT NULL DEFAULT now(),

    PRIMARY KEY (
        canvas_id,
        version
    )
);


-- =====================================================
-- CANVAS ARCHIVE FUNCTIONS
-- =====================================================

CREATE OR REPLACE FUNCTION archive_canvas(
    p_canvas_id uuid,
    p_user_id text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_rows integer;
BEGIN

    UPDATE canvases
    SET
        archived = true,
        archived_at = now()
    WHERE
        id = p_canvas_id
    AND owner_id =
        p_user_id::uuid;

    GET DIAGNOSTICS
        v_rows = ROW_COUNT;

    RETURN v_rows > 0;

END;
$$;


CREATE OR REPLACE FUNCTION restore_canvas(
    p_canvas_id uuid,
    p_user_id text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_rows integer;
BEGIN

    UPDATE canvases
    SET
        archived = false,
        archived_at = NULL
    WHERE
        id = p_canvas_id
    AND owner_id =
        p_user_id::uuid;

    GET DIAGNOSTICS
        v_rows = ROW_COUNT;

    RETURN v_rows > 0;

END;
$$;


-- =====================================================
-- SHARING FUNCTIONS
-- =====================================================

CREATE OR REPLACE FUNCTION share_canvas(
    p_canvas_id uuid,
    p_target_user_id text,
    p_permission text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
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
        p_target_user_id::uuid,
        p_permission
    )
    ON CONFLICT (
        canvas_id,
        user_id
    )
    DO UPDATE
    SET permission =
        EXCLUDED.permission;

    RETURN true;

END;
$$;


CREATE OR REPLACE FUNCTION unshare_canvas(
    p_canvas_id uuid,
    p_target_user_id text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_rows integer;
BEGIN

    DELETE
    FROM canvas_shares
    WHERE
        canvas_id = p_canvas_id
    AND user_id =
        p_target_user_id::uuid;

    GET DIAGNOSTICS
        v_rows = ROW_COUNT;

    RETURN v_rows > 0;

END;
$$;


-- =====================================================
-- VERSION HISTORY
-- =====================================================

CREATE OR REPLACE FUNCTION get_canvas_versions(
    p_canvas_id uuid
)
RETURNS TABLE
(
    version integer,
    created_by uuid,
    created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN

    RETURN QUERY

    SELECT
        cv.version,
        cv.created_by,
        cv.created_at

    FROM canvas_versions cv

    WHERE
        cv.canvas_id =
        p_canvas_id

    ORDER BY
        cv.version DESC;

END;
$$;


CREATE OR REPLACE FUNCTION get_canvas_version(
    p_canvas_id uuid,
    p_version integer
)
RETURNS TABLE
(
    canvas_data jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN

    RETURN QUERY

    SELECT
        cv.canvas_data

    FROM canvas_versions cv

    WHERE
        cv.canvas_id =
            p_canvas_id
    AND cv.version =
            p_version;

END;
$$;


CREATE OR REPLACE FUNCTION restore_canvas_version(
    p_canvas_id uuid,
    p_version integer,
    p_user_id uuid
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN

    RETURN create_canvas_version(
        p_canvas_id,
        p_user_id,
        (
            SELECT canvas_data
            FROM canvas_versions
            WHERE
                canvas_id = p_canvas_id
            AND version = p_version
        )
    );

END;
$$;


-- =====================================================
-- PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION create_project(text,text)
TO fea_nix_nest;

GRANT EXECUTE ON FUNCTION get_projects(text)
TO fea_nix_nest;

GRANT EXECUTE ON FUNCTION get_project(text,uuid)
TO fea_nix_nest;

GRANT EXECUTE ON FUNCTION update_project(text,uuid,text)
TO fea_nix_nest;

GRANT EXECUTE ON FUNCTION delete_project(text,uuid)
TO fea_nix_nest;

GRANT EXECUTE ON FUNCTION archive_canvas(uuid,text)
TO fea_nix_nest;

GRANT EXECUTE ON FUNCTION restore_canvas(uuid,text)
TO fea_nix_nest;

GRANT EXECUTE ON FUNCTION share_canvas(uuid,text,text)
TO fea_nix_nest;

GRANT EXECUTE ON FUNCTION unshare_canvas(uuid,text)
TO fea_nix_nest;

GRANT EXECUTE ON FUNCTION get_canvas_versions(uuid)
TO fea_nix_nest;

GRANT EXECUTE ON FUNCTION get_canvas_version(uuid,integer)
TO fea_nix_nest;

GRANT EXECUTE ON FUNCTION restore_canvas_version(uuid,integer,uuid)
TO fea_nix_nest;

CREATE OR REPLACE FUNCTION get_projects(
    p_owner_id text
)
RETURNS TABLE
(
    id uuid,
    name text,
    canvases json
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN

    RETURN QUERY

    SELECT
        p.id,
        p.name::text,

        COALESCE(
            json_agg(
                json_build_object(
                    'id', c.id,
                    'name', c.name,
                    'currentVersion', c.current_version
                )
            )
            FILTER (
                WHERE c.id IS NOT NULL
            ),
            '[]'::json
        ) AS canvases

    FROM projects p

    LEFT JOIN canvases c
        ON c.project_id = p.id

    WHERE
        p.owner_id =
            p_owner_id::uuid

    GROUP BY
        p.id,
        p.name

    ORDER BY
        p.name;

END;
$$;


COMMIT;

-- Functions that return rows
CREATE OR REPLACE FUNCTION get_user_canvases(p_user_id INT)
RETURNS TABLE(id INT, name TEXT, owner_id INT, project_id INT, canvas_data JSONB, created_at TIMESTAMPTZ) AS $$
BEGIN
  RETURN QUERY
  SELECT c.id, c.name, c.owner_id, c.project_id, c.canvas_data, c.created_at
  FROM canvases c
  WHERE c.owner_id = p_user_id
     OR c.project_id IN (
          SELECT pm.project_id FROM project_members pm WHERE pm.user_id = p_user_id
        )
     OR c.id IN (
          SELECT cs.canvas_id FROM canvas_shares cs WHERE cs.user_id = p_user_id
        )
  ORDER BY c.created_at DESC;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_personal_canvases(p_user_id INT)
RETURNS TABLE(id INT, name TEXT, owner_id INT, canvas_data JSONB, created_at TIMESTAMPTZ) AS $$
BEGIN
  RETURN QUERY
  SELECT c.id, c.name, c.owner_id, c.canvas_data, c.created_at
  FROM canvases c
  WHERE c.owner_id = p_user_id AND c.project_id IS NULL
  ORDER BY c.created_at DESC;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_shared_canvases(p_user_id INT)
RETURNS TABLE(id INT, name TEXT, owner_id INT, canvas_data JSONB, created_at TIMESTAMPTZ) AS $$
BEGIN
  RETURN QUERY
  SELECT c.id, c.name, c.owner_id, c.canvas_data, c.created_at
  FROM canvases c
  JOIN canvas_shares cs ON cs.canvas_id = c.id
  WHERE cs.user_id = p_user_id
  ORDER BY c.created_at DESC;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_project_canvases(p_project_id INT)
RETURNS TABLE(id INT, name TEXT, owner_id INT, canvas_data JSONB, created_at TIMESTAMPTZ) AS $$
BEGIN
  RETURN QUERY
  SELECT c.id, c.name, c.owner_id, c.canvas_data, c.created_at
  FROM canvases c
  WHERE c.project_id = p_project_id
  ORDER BY c.created_at DESC;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_canvas_by_id(p_canvas_id INT)
RETURNS TABLE(id INT, name TEXT, owner_id INT, project_id INT, canvas_data JSONB, created_at TIMESTAMPTZ) AS $$
BEGIN
  RETURN QUERY
  SELECT c.id, c.name, c.owner_id, c.project_id, c.canvas_data, c.created_at
  FROM canvases c WHERE c.id = p_canvas_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_canvas(
  p_owner_id INT,
  p_project_id INT,
  p_name TEXT,
  p_canvas_data JSONB
) RETURNS TABLE(id INT, name TEXT, owner_id INT, project_id INT, canvas_data JSONB, created_at TIMESTAMPTZ) AS $$
DECLARE
  new_id INT;
BEGIN
  INSERT INTO canvases (owner_id, project_id, name, canvas_data)
  VALUES (p_owner_id, p_project_id, p_name, p_canvas_data)
  RETURNING canvases.id INTO new_id;
  RETURN QUERY SELECT * FROM get_canvas_by_id(new_id);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_canvas(
  p_user_id INT,
  p_canvas_id INT,
  p_name TEXT,
  p_canvas_data JSONB
) RETURNS TABLE(id INT, name TEXT, owner_id INT, project_id INT, canvas_data JSONB, created_at TIMESTAMPTZ) AS $$
DECLARE
  updated INT;
BEGIN
  UPDATE canvases
  SET name = COALESCE(p_name, name),
      canvas_data = COALESCE(p_canvas_data, canvas_data)
  WHERE id = p_canvas_id AND owner_id = p_user_id
  RETURNING id INTO updated;

  IF updated IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY SELECT * FROM get_canvas_by_id(updated);
END;
$$ LANGUAGE plpgsql;

-- Procedures (no return set)
CREATE OR REPLACE PROCEDURE share_canvas(
  p_canvas_id INT,
  p_target_user_id INT,
  p_permission TEXT
) AS $$
BEGIN
  INSERT INTO canvas_shares (canvas_id, user_id, permission)
  VALUES (p_canvas_id, p_target_user_id, p_permission)
  ON CONFLICT (canvas_id, user_id) DO UPDATE SET permission = EXCLUDED.permission;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE PROCEDURE delete_canvas(
  p_user_id INT,
  p_canvas_id INT
) AS $$
BEGIN
  DELETE FROM canvases WHERE id = p_canvas_id AND owner_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

DROP FUNCTION IF EXISTS get_canvases_by_project_id_or_owner;

CREATE OR REPLACE FUNCTION get_canvases_by_project_id_or_owner(
  p_project_id UUID DEFAULT NULL,
  p_user_id UUID DEFAULT NULL,
  p_is_shared BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  owner_id UUID,
  project_id UUID,
  canvas_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.owner_id,
    c.project_id,
    c.canvas_data,
    c.created_at
  FROM canvases c
  WHERE 
    -- 1. Fetch by Project ID when provided
    (p_project_id IS NOT NULL AND c.project_id = p_project_id)
    OR
    -- 2. Fetch Personal Canvases (no project, owned by user)
    (
      p_project_id IS NULL 
      AND NOT p_is_shared 
      AND c.project_id IS NULL 
      AND c.owner_id = p_user_id
    )
    OR
    -- 3. Fetch Shared Canvases (no project, owned by someone else)
    (
      p_project_id IS NULL 
      AND p_is_shared 
      AND c.project_id IS NULL 
      AND c.owner_id != p_user_id
    );
END;
$$;

ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

DROP FUNCTION IF EXISTS get_canvases_by_project_id_or_owner(UUID, UUID, BOOLEAN);

CREATE OR REPLACE FUNCTION get_canvases_by_project_id_or_owner(
  p_project_id UUID DEFAULT NULL,
  p_user_id UUID DEFAULT NULL,
  p_is_shared BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  owner_id UUID,
  project_id UUID,
  canvas_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.owner_id,
    c.project_id,
    c.canvas_data,
    c.created_at
  FROM canvases c
  WHERE 
    -- 1. Fetch by Project ID when provided
    (p_project_id IS NOT NULL AND c.project_id = p_project_id)
    OR
    -- 2. Fetch Personal Canvases (no project, owned by user)
    (
      p_project_id IS NULL 
      AND NOT p_is_shared 
      AND c.project_id IS NULL 
      AND c.owner_id = p_user_id
    )
    OR
    -- 3. Fetch Shared Canvases (no project, owned by someone else)
    (
      p_project_id IS NULL 
      AND p_is_shared 
      AND c.project_id IS NULL 
      AND c.owner_id != p_user_id
    );
END;
$$;

-- Grant execution permission to all database users
GRANT EXECUTE ON FUNCTION get_canvases_by_project_id_or_owner(UUID, UUID, BOOLEAN) TO PUBLIC;

DROP FUNCTION IF EXISTS delete_canvas(UUID, UUID);

CREATE OR REPLACE FUNCTION delete_canvas(
  p_canvas_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER := 0;
BEGIN
  DELETE FROM canvases
  WHERE id = p_canvas_id 
    AND owner_id = p_user_id;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count > 0;
END;
$$;

GRANT EXECUTE ON FUNCTION delete_canvas(UUID, UUID) TO PUBLIC;

DROP FUNCTION IF EXISTS public.get_projects(uuid);
DROP FUNCTION IF EXISTS public.get_project(uuid, uuid);
DROP FUNCTION IF EXISTS public.create_project(uuid, varchar, uuid);
DROP FUNCTION IF EXISTS public.update_project(uuid, uuid, varchar);
DROP FUNCTION IF EXISTS public.delete_project(uuid, uuid);

DROP FUNCTION IF EXISTS get_projects(text);

CREATE OR REPLACE FUNCTION get_projects(
    p_owner_id text
)
RETURNS TABLE (
    id uuid,
    name varchar,
    canvases json
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.name,
        COALESCE(
            json_agg(
                json_build_object(
                    'id', c.id,
                    'name', c.name,
                    'currentVersion', c.current_version
                )
            ) FILTER (WHERE c.id IS NOT NULL),
            '[]'::json
        ) AS canvases
    FROM projects p
    LEFT JOIN canvases c ON c.project_id = p.id
    WHERE p.owner_id = p_owner_id::uuid
    GROUP BY p.id, p.name
    ORDER BY p.name;
END;
$$;

GRANT EXECUTE ON FUNCTION get_projects(text) TO fea_nix_nest;

DROP FUNCTION IF EXISTS get_canvases_by_project_id_or_owner(UUID, UUID, BOOLEAN);
----migration-002
DROP FUNCTION IF EXISTS find_personal_canvases(UUID);

CREATE OR REPLACE FUNCTION find_personal_canvases(
    p_user_id UUID
)
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    current_version INTEGER,
    canvas_data JSONB,
    created_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
AS $$
SELECT
    c.id,
    c.name,
    c.current_version,
    cv.canvas_data,
    c.created_at
FROM canvases c
LEFT JOIN canvas_versions cv 
    ON cv.canvas_id = c.id 
   AND cv.version_number = c.current_version
WHERE c.owner_id = p_user_id
  AND c.project_id IS NULL
ORDER BY c.created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION find_personal_canvases(UUID) TO PUBLIC;

DROP FUNCTION IF EXISTS get_canvases_by_project_id_or_owner(UUID, UUID, BOOLEAN);

CREATE OR REPLACE FUNCTION get_canvases_by_project_id_or_owner(
  p_project_id UUID DEFAULT NULL,
  p_user_id UUID DEFAULT NULL,
  p_is_shared BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  owner_id UUID,
  project_id UUID,
  canvas_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.owner_id,
    c.project_id,
    cv.canvas_data,
    c.created_at
  FROM canvases c
  LEFT JOIN canvas_versions cv 
    ON cv.canvas_id = c.id 
   AND cv.version_number = c.current_version
  WHERE 
    (p_project_id IS NOT NULL AND c.project_id = p_project_id)
    OR
    (
      p_project_id IS NULL 
      AND NOT p_is_shared 
      AND c.project_id IS NULL 
      AND c.owner_id = p_user_id
    )
    OR
    (
      p_project_id IS NULL 
      AND p_is_shared 
      AND c.project_id IS NULL 
      AND c.owner_id != p_user_id
    );
END;
$$;

GRANT EXECUTE ON FUNCTION get_canvases_by_project_id_or_owner(UUID, UUID, BOOLEAN) TO PUBLIC;

--migration-003
CREATE TABLE IF NOT EXISTS canvas_shares (
    canvas_id UUID NOT NULL,
    user_id UUID NOT NULL,
    permission VARCHAR(50) NOT NULL DEFAULT 'read',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (canvas_id, user_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON canvas_shares TO PUBLIC;

DROP FUNCTION IF EXISTS delete_canvas(UUID, UUID);

CREATE OR REPLACE FUNCTION delete_canvas(
    p_canvas_id UUID,
    p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM canvases
        WHERE id = p_canvas_id
          AND owner_id = p_user_id
    ) THEN
        RETURN FALSE;
    END IF;

    DELETE FROM canvas_shares WHERE canvas_id = p_canvas_id;
    DELETE FROM canvas_versions WHERE canvas_id = p_canvas_id;
    DELETE FROM canvases WHERE id = p_canvas_id;

    RETURN TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION delete_canvas(UUID, UUID) TO PUBLIC;

