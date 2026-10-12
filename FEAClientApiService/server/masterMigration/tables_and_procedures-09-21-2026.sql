CREATE OR REPLACE FUNCTION public.create_canvas_version(
    p_canvas_id uuid,
    p_user_id uuid,
    p_canvas_data jsonb
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
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
    SET
        current_version = v_version,
        canvas_data = p_canvas_data,
        updated_at = NOW()
    WHERE id = p_canvas_id;

    RETURN v_version;

END;
$$;


GRANT USAGE ON SCHEMA public TO fealty;

GRANT SELECT, INSERT, UPDATE, DELETE
ON ALL TABLES IN SCHEMA public
TO fealty;

GRANT USAGE, SELECT
ON ALL SEQUENCES IN SCHEMA public
TO fealty;

GRANT EXECUTE
ON ALL FUNCTIONS IN SCHEMA public
TO fealty;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO fealty;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT USAGE, SELECT ON SEQUENCES TO fealty;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT EXECUTE ON FUNCTIONS TO fealty;

BEGIN;

CREATE OR REPLACE FUNCTION public.create_canvas_version(
  p_canvas_id uuid,
  p_user_id uuid,
  p_canvas_data jsonb
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
DECLARE
  v_version integer;
BEGIN
  /*
   * Lock the parent canvas row so simultaneous saves cannot
   * calculate and insert the same next version number.
   *
   * Ownership is verified here before creating a version.
   */
  SELECT c.current_version + 1
  INTO v_version
  FROM public.canvases AS c
  WHERE c.id = p_canvas_id
    AND c.owner_id = p_user_id
  FOR UPDATE;

  IF v_version IS NULL THEN
    RAISE EXCEPTION
      'Canvas % not found or access denied',
      p_canvas_id
      USING ERRCODE = 'P0002';
  END IF;

  /*
   * JSON document data belongs in canvas_versions,
   * not in canvases.
   */
  INSERT INTO public.canvas_versions (
    canvas_id,
    version_number,
    canvas_data,
    created_by
  )
  VALUES (
    p_canvas_id,
    v_version,
    COALESCE(
      p_canvas_data,
      '{}'::jsonb
    ),
    p_user_id
  );

  /*
   * canvases has current_version, but it does NOT have:
   * - canvas_data
   * - updated_at
   */
  UPDATE public.canvases
  SET current_version = v_version
  WHERE id = p_canvas_id
    AND owner_id = p_user_id;

  RETURN v_version;
END;
$function$;

COMMIT;


CREATE OR REPLACE FUNCTION public.update_canvas_current_version(
  p_canvas_id uuid,
  p_user_id uuid,
  p_canvas_data jsonb
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
DECLARE
  v_version integer;
BEGIN
  /*
   * Confirm that the caller owns the canvas and obtain
   * the active version number.
   */
  SELECT c.current_version
  INTO v_version
  FROM public.canvases AS c
  WHERE c.id = p_canvas_id
    AND c.owner_id = p_user_id
  FOR UPDATE;

  IF v_version IS NULL THEN
    RAISE EXCEPTION
      'Canvas % not found or access denied',
      p_canvas_id
      USING ERRCODE = 'P0002';
  END IF;

  /*
   * Replace the JSON content of the current revision.
   * It does not create a row and does not increment
   * canvases.current_version.
   */
  UPDATE public.canvas_versions AS cv
  SET canvas_data = p_canvas_data
  WHERE cv.canvas_id = p_canvas_id
    AND cv.version_number = v_version;

  IF NOT FOUND THEN
    RAISE EXCEPTION
      'Current version % for canvas % does not exist',
      v_version,
      p_canvas_id
      USING ERRCODE = 'P0002';
  END IF;

  RETURN v_version;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_canvas_current_version(
  p_canvas_id uuid,
  p_user_id uuid,
  p_canvas_data jsonb
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
DECLARE
  v_version integer;
BEGIN
  SELECT c.current_version
  INTO v_version
  FROM public.canvases AS c
  WHERE c.id = p_canvas_id
    AND c.owner_id = p_user_id
  FOR UPDATE;

  IF v_version IS NULL THEN
    RAISE EXCEPTION
      'Canvas % not found or access denied',
      p_canvas_id
      USING ERRCODE = 'P0002';
  END IF;

  UPDATE public.canvas_versions AS cv
  SET canvas_data = p_canvas_data
  WHERE cv.canvas_id = p_canvas_id
    AND cv.version_number = v_version;

  IF NOT FOUND THEN
    RAISE EXCEPTION
      'Current version % for canvas % does not exist',
      v_version,
      p_canvas_id
      USING ERRCODE = 'P0002';
  END IF;

  RETURN v_version;
END;
$function$;


CREATE OR REPLACE FUNCTION public.save_canvas(
  p_canvas_id uuid,
  p_user_id uuid,
  p_canvas_data jsonb
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
DECLARE
  v_version integer;
BEGIN
  /*
   * Verify ownership and read the active version.
   * The row lock prevents a concurrent Save As New Version
   * from changing current_version during this save.
   */
  SELECT c.current_version
  INTO v_version
  FROM public.canvases AS c
  WHERE c.id = p_canvas_id
    AND c.owner_id = p_user_id
  FOR UPDATE;

  IF v_version IS NULL THEN
    RAISE EXCEPTION
      'Canvas % not found or access denied',
      p_canvas_id
      USING ERRCODE = 'P0002';
  END IF;

  /*
   * Actual normal save:
   * overwrite the JSON of the CURRENT version only.
   *
   * No INSERT.
   * No increment to canvases.current_version.
   */
  UPDATE public.canvas_versions AS cv
  SET canvas_data = p_canvas_data
  WHERE cv.canvas_id = p_canvas_id
    AND cv.version_number = v_version;

  IF NOT FOUND THEN
    RAISE EXCEPTION
      'Current version % for canvas % does not exist',
      v_version,
      p_canvas_id
      USING ERRCODE = 'P0002';
  END IF;

  RETURN v_version;
END;
$function$;


CREATE OR REPLACE FUNCTION public.save_canvas(
  p_canvas_id uuid,
  p_user_id uuid,
  p_canvas_data jsonb
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
DECLARE
  v_version integer;
BEGIN
  SELECT c.current_version
  INTO v_version
  FROM public.canvases AS c
  WHERE c.id = p_canvas_id
    AND c.owner_id = p_user_id
  FOR UPDATE;

  IF v_version IS NULL THEN
    RAISE EXCEPTION
      'Canvas % not found or access denied',
      p_canvas_id
      USING ERRCODE = 'P0002';
  END IF;

  UPDATE public.canvas_versions AS cv
  SET canvas_data = p_canvas_data
  WHERE cv.canvas_id = p_canvas_id
    AND cv.version_number = v_version;

  IF NOT FOUND THEN
    RAISE EXCEPTION
      'Current version % for canvas % does not exist',
      v_version,
      p_canvas_id
      USING ERRCODE = 'P0002';
  END IF;

  RETURN v_version;
END;
$function$;
