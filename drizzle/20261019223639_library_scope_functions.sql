-- Library scope (ADR-0003). app_current_library() returns the library named by
-- app.library_id only when the user named by app.user_id is a member of it; every
-- library table's row-level-security policy compares library_id with it.
CREATE FUNCTION app_current_library() RETURNS uuid
  LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT m.library_id FROM library_member m
  WHERE m.library_id = nullif(current_setting('app.library_id', true), '')::uuid
    AND m.user_id = nullif(current_setting('app.user_id', true), '')
$$;
--> statement-breakpoint
-- Creates a library and makes the signed-in user its owner in one step, because the
-- application role can neither see a library before it is a member nor add members.
CREATE FUNCTION app_create_library(p_label text) RETURNS uuid
  LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_user text := nullif(current_setting('app.user_id', true), '');
  v_library uuid;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'app.user_id is not set' USING ERRCODE = '42501';
  END IF;
  INSERT INTO library (label) VALUES (p_label) RETURNING id INTO v_library;
  INSERT INTO library_member (library_id, user_id, role) VALUES (v_library, v_user, 'owner');
  RETURN v_library;
END
$$;
--> statement-breakpoint
REVOKE ALL ON FUNCTION app_current_library() FROM PUBLIC;
--> statement-breakpoint
REVOKE ALL ON FUNCTION app_create_library(text) FROM PUBLIC;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION app_current_library() TO apple_music_app;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION app_create_library(text) TO apple_music_app;
--> statement-breakpoint
-- The authentication role reaches the auth schema and nothing else.
GRANT USAGE ON SCHEMA auth TO apple_music_auth;
--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA auth TO apple_music_auth;
--> statement-breakpoint
ALTER DEFAULT PRIVILEGES IN SCHEMA auth GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO apple_music_auth;

-- rollback:
-- ALTER DEFAULT PRIVILEGES IN SCHEMA auth REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLES FROM apple_music_auth;
-- REVOKE ALL ON ALL TABLES IN SCHEMA auth FROM apple_music_auth;
-- REVOKE USAGE ON SCHEMA auth FROM apple_music_auth;
-- DROP FUNCTION app_create_library(text);
-- DROP FUNCTION app_current_library();
