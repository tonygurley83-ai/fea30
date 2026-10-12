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
