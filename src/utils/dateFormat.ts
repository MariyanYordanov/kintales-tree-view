/**
 * Format birth/death years into a label.
 * (1940, 2020) → "1940 — 2020"
 * (1940, undefined) → "1940"
 * (undefined, undefined) → ""
 */
export function formatDateLabel(
  birthYear?: number,
  deathYear?: number,
): string {
  if (birthYear != null && deathYear != null) {
    return `${birthYear} — ${deathYear}`;
  }
  if (birthYear != null) {
    return `${birthYear}`;
  }
  if (deathYear != null) {
    return `† ${deathYear}`;
  }
  return '';
}
