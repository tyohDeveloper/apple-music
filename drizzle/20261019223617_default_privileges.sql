-- Tables created by the migration role in schema public are readable and writable
-- by the application role; row-level security then limits which rows it sees.
-- The roles themselves are created per environment by `npm run db:bootstrap`.
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO apple_music_app;
--> statement-breakpoint
GRANT USAGE ON SCHEMA public TO apple_music_app;

-- rollback:
-- ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLES FROM apple_music_app;
-- REVOKE USAGE ON SCHEMA public FROM apple_music_app;
