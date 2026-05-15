export function normalizeProfileName(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function slugifyProfilePart(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_");
}

export function normalizeUnifiedUsername(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 24);
}

export function buildSuggestedUnifiedUsername(
  firstName: string,
  lastName: string,
) {
  return normalizeUnifiedUsername(
    [slugifyProfilePart(firstName), slugifyProfilePart(lastName)]
      .filter(Boolean)
      .join("_"),
  );
}

export function createUnifiedUserIdSeed() {
  return Math.random().toString(36).slice(2, 7);
}

export function buildUnifiedUserId(
  firstName: string,
  lastName: string,
  seed: string,
) {
  const first = slugifyProfilePart(firstName);
  const last = slugifyProfilePart(lastName);
  const base = [first, last].filter(Boolean).join("_") || "member";
  const trimmedBase = base.slice(0, 18).replace(/^_+|_+$/g, "") || "member";
  const normalizedSeed =
    seed
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 8) || "user";

  return `sabi_${trimmedBase}_${normalizedSeed}`;
}