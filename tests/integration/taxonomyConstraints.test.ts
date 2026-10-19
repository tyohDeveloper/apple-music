// The Phase 1 library-role CHECK predates ADR-0009 and repeats data/taxonomies/library-roles.json;
// this keeps the two equal. Later taxonomies are enforced by request schemas only.
import { describe, expect, it } from "vitest";
import libraryRoles from "../../data/taxonomies/library-roles.json" with { type: "json" };
import { queryAsRole, testConfig } from "./support/testServices.ts";

describe("taxonomy constraints", () => {
  it("lists exactly the library roles of the taxonomy", async () => {
    const result = await queryAsRole<{ definition: string }>(
      testConfig().database.adminUrl,
      "select pg_get_constraintdef(oid) as definition from pg_constraint where conname = 'library_member_role_known'",
    );
    const definition = result.rows[0]?.definition ?? "";
    const listed = [...definition.matchAll(/'([a-z-]+)'/gu)].map((match) => match[1]).sort();
    expect(listed).toEqual(libraryRoles.entries.map((entry) => entry.id).sort());
  });
});
