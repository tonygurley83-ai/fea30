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

