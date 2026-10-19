-- Catalog scope (ADR-0009). Catalog tables read with app_current_library() and write with
-- app_current_editable_library(), which also requires the owner or editor role. Partial
-- dates (invariant 7) are a domain so every column that holds one checks its shape; the
-- request layer also rejects impossible days such as 2023-02-30.
CREATE FUNCTION app_current_editable_library() RETURNS uuid
  LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT m.library_id FROM library_member m
  WHERE m.library_id = nullif(current_setting('app.library_id', true), '')::uuid
    AND m.user_id = nullif(current_setting('app.user_id', true), '')
    AND m.role IN ('owner', 'editor')
$$;
--> statement-breakpoint
REVOKE ALL ON FUNCTION app_current_editable_library() FROM PUBLIC;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION app_current_editable_library() TO apple_music_app;
--> statement-breakpoint
CREATE DOMAIN partial_date AS text
  CHECK (VALUE ~ '^[0-9]{4}(-(0[1-9]|1[0-2])(-(0[1-9]|[12][0-9]|3[01]))?)?$');

-- rollback:
-- DROP DOMAIN partial_date;
-- DROP FUNCTION app_current_editable_library();
