-- Invariant 2: a performer has exactly one preferred name. The partial unique index
-- performer_name_one_preferred forbids two; these constraint triggers, checked at commit,
-- forbid none, so the preferred name can move from one name to another in one transaction.
CREATE FUNCTION performer_preferred_name_count_is_wrong(p_library uuid, p_performer uuid) RETURNS boolean
  LANGUAGE sql STABLE AS $$
  SELECT EXISTS (SELECT 1 FROM performer p WHERE p.library_id = p_library AND p.id = p_performer)
    AND (SELECT count(*) FROM performer_name n
         WHERE n.library_id = p_library AND n.performer_id = p_performer AND n.is_preferred) <> 1
$$;
--> statement-breakpoint
CREATE FUNCTION performer_preferred_name_check() RETURNS trigger
  LANGUAGE plpgsql AS $$
BEGIN
  IF TG_TABLE_NAME = 'performer' THEN
    IF performer_preferred_name_count_is_wrong(NEW.library_id, NEW.id) THEN
      RAISE EXCEPTION 'performer % needs exactly one preferred name', NEW.id
        USING ERRCODE = 'check_violation', CONSTRAINT = 'performer_has_one_preferred_name';
    END IF;
    RETURN NULL;
  END IF;
  IF TG_OP <> 'DELETE' AND performer_preferred_name_count_is_wrong(NEW.library_id, NEW.performer_id) THEN
    RAISE EXCEPTION 'performer % needs exactly one preferred name', NEW.performer_id
      USING ERRCODE = 'check_violation', CONSTRAINT = 'performer_has_one_preferred_name';
  END IF;
  IF TG_OP <> 'INSERT' AND performer_preferred_name_count_is_wrong(OLD.library_id, OLD.performer_id) THEN
    RAISE EXCEPTION 'performer % needs exactly one preferred name', OLD.performer_id
      USING ERRCODE = 'check_violation', CONSTRAINT = 'performer_has_one_preferred_name';
  END IF;
  RETURN NULL;
END
$$;
--> statement-breakpoint
CREATE CONSTRAINT TRIGGER performer_has_one_preferred_name
  AFTER INSERT ON performer DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION performer_preferred_name_check();
--> statement-breakpoint
CREATE CONSTRAINT TRIGGER performer_name_keeps_one_preferred
  AFTER INSERT OR UPDATE OR DELETE ON performer_name DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION performer_preferred_name_check();

-- rollback:
-- DROP TRIGGER performer_name_keeps_one_preferred ON performer_name;
-- DROP TRIGGER performer_has_one_preferred_name ON performer;
-- DROP FUNCTION performer_preferred_name_check();
-- DROP FUNCTION performer_preferred_name_count_is_wrong(uuid, uuid);
