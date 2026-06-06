import { sanitizeReflectionNote } from "@/lib/sanitize";
import { REFLECTION_MAX_LENGTH } from "@/lib/constants";

describe("sanitizeReflectionNote", () => {
  it("strips HTML and escapes special characters", () => {
    const result = sanitizeReflectionNote("<script>alert(1)</script> I am <ok> & 'ready'");

    expect(result).not.toContain("<script>");
    expect(result).toContain("&amp;");
    expect(result).toContain("&#39;");
  });

  it("limits overlong input to the configured maximum", () => {
    expect(sanitizeReflectionNote("a".repeat(700))).toHaveLength(
      REFLECTION_MAX_LENGTH
    );
  });

  it("normalizes whitespace", () => {
    expect(sanitizeReflectionNote("  mock\n\npressure\t today  ")).toBe(
      "mock pressure today"
    );
  });
});
