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
