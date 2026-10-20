// External identifiers of performers, albums, editions and recordings (docs/design/
// catalog.md, External identifiers): a namespace and a normalized value, unique per entity
// and indexed by value for lookups. Values are checked against data/identifiers before they
// are written; the same value may sit on two entities until they are merged.
import { foreignKey, index, pgTable, primaryKey, text, uuid } from "drizzle-orm/pg-core";
import { album } from "./albumTables.ts";
import { libraryIdColumn } from "./columns.ts";
import { edition } from "./editionTables.ts";
import { libraryRowPolicies } from "./libraryRowPolicies.ts";
import { performer } from "./performerTables.ts";
import { recording } from "./recordingTables.ts";

const identifierColumns = () => ({ namespace: text("namespace").notNull(), value: text("value").notNull() });

export const performerExternalId = pgTable("performer_external_id", { libraryId: libraryIdColumn(), performerId: uuid("performer_id").notNull(), ...identifierColumns() }, (t) => [
  primaryKey({ name: "performer_external_id_pk", columns: [t.libraryId, t.performerId, t.namespace, t.value] }),
  foreignKey({ name: "performer_external_id_performer_fk", columns: [t.libraryId, t.performerId], foreignColumns: [performer.libraryId, performer.id] }).onDelete("cascade"),
  index("performer_external_id_value").on(t.libraryId, t.namespace, t.value),
  ...libraryRowPolicies("performer_external_id"),
]);

export const albumExternalId = pgTable("album_external_id", { libraryId: libraryIdColumn(), albumId: uuid("album_id").notNull(), ...identifierColumns() }, (t) => [
  primaryKey({ name: "album_external_id_pk", columns: [t.libraryId, t.albumId, t.namespace, t.value] }),
  foreignKey({ name: "album_external_id_album_fk", columns: [t.libraryId, t.albumId], foreignColumns: [album.libraryId, album.id] }).onDelete("cascade"),
  index("album_external_id_value").on(t.libraryId, t.namespace, t.value),
  ...libraryRowPolicies("album_external_id"),
]);

export const editionExternalId = pgTable("edition_external_id", { libraryId: libraryIdColumn(), editionId: uuid("edition_id").notNull(), ...identifierColumns() }, (t) => [
  primaryKey({ name: "edition_external_id_pk", columns: [t.libraryId, t.editionId, t.namespace, t.value] }),
  foreignKey({ name: "edition_external_id_edition_fk", columns: [t.libraryId, t.editionId], foreignColumns: [edition.libraryId, edition.id] }).onDelete("cascade"),
  index("edition_external_id_value").on(t.libraryId, t.namespace, t.value),
  ...libraryRowPolicies("edition_external_id"),
]);

export const recordingExternalId = pgTable("recording_external_id", { libraryId: libraryIdColumn(), recordingId: uuid("recording_id").notNull(), ...identifierColumns() }, (t) => [
  primaryKey({ name: "recording_external_id_pk", columns: [t.libraryId, t.recordingId, t.namespace, t.value] }),
  foreignKey({ name: "recording_external_id_recording_fk", columns: [t.libraryId, t.recordingId], foreignColumns: [recording.libraryId, recording.id] }).onDelete("cascade"),
  index("recording_external_id_value").on(t.libraryId, t.namespace, t.value),
  ...libraryRowPolicies("recording_external_id"),
]);
