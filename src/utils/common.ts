export function getDomainFromEmail(email: string): string | null {
  if (!email || !email.includes("@")) return null;

  const parts = email.split("@");
  return parts.length === 2 ? parts[1].toLowerCase() : null;
}

export function getCompanyNameFromDomain(domain: string): string | null {
  if (!domain) return null;

  // strip common prefixes
  let clean = domain.toLowerCase()
    .replace(/^www\./, "") // remove "www."
    .replace(/\.[^.]+$/, ""); // remove last extension (.com, .org, .net etc.)

  // If there are multiple dots left (e.g. co.in), strip again
  if (clean.includes(".")) {
    const parts = clean.split(".");
    clean = parts[parts.length - 1]; // take last meaningful part
  }

  // Replace hyphens/numbers with spaces, capitalize
  return clean
    .replace(/[-_]/g, " ") // turn "-" or "_" into spaces
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase()); // capitalize words
}