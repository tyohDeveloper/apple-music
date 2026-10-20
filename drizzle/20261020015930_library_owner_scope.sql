-- Owner scope (docs/design/apple-music-import.md, slice G). app_current_owned_library()
-- returns the scoped library only when the signed-in user owns it; the Apple Music
-- connection's write policies compare library_id with it, so only the owner connects,
-- reconnects or disconnects a library.
CREATE FUNCTION app_current_owned_library() RETURNS uuid
  LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT m.library_id FROM library_member m
  WHERE m.library_id = nullif(current_setting('app.library_id', true), '')::uuid
    AND m.user_id = nullif(current_setting('app.user_id', true), '')
    AND m.role = 'owner'
$$;
--> statement-breakpoint
REVOKE ALL ON FUNCTION app_current_owned_library() FROM PUBLIC;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION app_current_owned_library() TO apple_music_app;

-- rollback:
-- DROP FUNCTION app_current_owned_library();
