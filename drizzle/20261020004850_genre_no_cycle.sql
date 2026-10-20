-- A genre is never its own ancestor (docs/design/catalog.md, slice D). Moves take an
-- advisory lock per library first, so two concurrent moves cannot close a loop between
-- them; a new genre cannot close one, and genre_parent_not_self covers a genre as its own
-- parent.
CREATE FUNCTION genre_no_cycle_check() RETURNS trigger
  LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.parent_id IS NULL OR NEW.parent_id IS NOT DISTINCT FROM OLD.parent_id THEN
    RETURN NEW;
  END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended('genre-tree:' || NEW.library_id::text, 0));
  IF EXISTS (
    WITH RECURSIVE ancestor(id) AS (
      SELECT NEW.parent_id
      UNION
      SELECT g.parent_id FROM genre g JOIN ancestor a ON g.library_id = NEW.library_id AND g.id = a.id
      WHERE g.parent_id IS NOT NULL
    )
    SELECT 1 FROM ancestor WHERE ancestor.id = NEW.id
  ) THEN
    RAISE EXCEPTION 'genre % would be its own ancestor', NEW.id
      USING ERRCODE = 'check_violation', CONSTRAINT = 'genre_no_cycle';
  END IF;
  RETURN NEW;
END
$$;
--> statement-breakpoint
CREATE TRIGGER genre_no_cycle
  BEFORE UPDATE OF parent_id ON genre
  FOR EACH ROW EXECUTE FUNCTION genre_no_cycle_check();

-- rollback:
-- DROP TRIGGER genre_no_cycle ON genre;
-- DROP FUNCTION genre_no_cycle_check();
