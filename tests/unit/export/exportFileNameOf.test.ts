import { describe, expect, it } from "vitest";
import { exportFileNameOf } from "../../../src/export/exportFileNameOf.ts";

const at = "2026-10-20T01:22:33.123456Z";

describe("exportFileNameOf", () => {
  it("reduces the label to lower-case ASCII words joined by hyphens, then the day", () => {
    expect(exportFileNameOf("My Library", at)).toBe("my-library-2026-10-20.json");
    expect(exportFileNameOf("  Jazz & Blues (2026)  ", at)).toBe("jazz-blues-2026-2026-10-20.json");
  });

  it("drops accents rather than splitting words at them", () => {
    expect(exportFileNameOf("Mötley Crüe & Co", at)).toBe("motley-crue-co-2026-10-20.json");
    expect(exportFileNameOf("Beyoncé", at)).toBe("beyonce-2026-10-20.json");
  });

  it("names a library whose label has no ASCII letters or digits 'library'", () => {
    expect(exportFileNameOf("ジャズ", at)).toBe("library-2026-10-20.json");
    expect(exportFileNameOf("---", at)).toBe("library-2026-10-20.json");
  });

  it("keeps at most 60 characters of the label, without a trailing hyphen", () => {
    const stem = exportFileNameOf(`${"a".repeat(59)} b`, at).replace("-2026-10-20.json", "");
    expect(stem).toBe("a".repeat(59));
  });
});
