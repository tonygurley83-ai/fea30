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

