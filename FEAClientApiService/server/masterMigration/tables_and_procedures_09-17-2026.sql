DROP FUNCTION IF EXISTS public.get_projects(uuid);
DROP FUNCTION IF EXISTS public.get_project(uuid, uuid);
DROP FUNCTION IF EXISTS public.create_project(uuid, varchar, uuid);
DROP FUNCTION IF EXISTS public.update_project(uuid, uuid, varchar);
DROP FUNCTION IF EXISTS public.delete_project(uuid, uuid);

-- 1. Get all projects
CREATE OR REPLACE FUNCTION public.get_projects(
    p_user_id uuid
)
RETURNS SETOF public.projects
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT p.*
    FROM public.projects p
    WHERE p.owner_id = p_user_id;
END;
$$;

-- 2. Get single project
CREATE OR REPLACE FUNCTION public.get_project(
    p_user_id uuid,
    p_project_id uuid
)
RETURNS SETOF public.projects
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT p.*
    FROM public.projects p
    WHERE p.id = p_project_id
      AND p.owner_id = p_user_id;
END;
$$;

-- 3. Create project
CREATE OR REPLACE FUNCTION public.create_project(
    p_user_id uuid,
    p_name varchar,
    p_project_id uuid
)
RETURNS SETOF public.projects
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    INSERT INTO public.projects (
        id,
        name,
        owner_id
    )
    VALUES (
        p_project_id,
        p_name,
        p_user_id
    )
    RETURNING *;
END;
$$;

-- 4. Update project
CREATE OR REPLACE FUNCTION public.update_project(
    p_user_id uuid,
    p_project_id uuid,
    p_name varchar
)
RETURNS SETOF public.projects
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    UPDATE public.projects
    SET name = COALESCE(p_name, name),
        updated_at = NOW()
    WHERE id = p_project_id
      AND owner_id = p_user_id
    RETURNING *;
END;
$$;

-- 5. Delete project
CREATE OR REPLACE FUNCTION public.delete_project(
    p_user_id uuid,
    p_project_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_deleted_count integer;
BEGIN
    DELETE FROM public.projects
    WHERE id = p_project_id
      AND owner_id = p_user_id;
      
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    RETURN v_deleted_count > 0;
END;
$$;
