/**
 * Domain utility functions
 */

/**
 * Normalize a domain name
 * @param {string} domain - The domain to normalize
 * @returns {string} Normalized domain
 */
export function normalizeDomain(domain) {
  if (!domain || typeof domain !== 'string') {
    return '';
  }
  return domain.toLowerCase().trim();
}

/**
 * Extracts the eTLD+1 (effective top-level domain + 1) from a domain
 * This is a simplified implementation and might not cover all edge cases.
 * For a robust solution, a library like psl (Public Suffix List) is recommended.
 * @param {string} domain - The domain to parse
 * @returns {string} The eTLD+1 or the original domain if it can't be parsed
 */
export function getETLDPlusOne(domain) {
  if (!domain) return '';

  const normalized = normalizeDomain(domain);
  const parts = normalized.split('.');

  if (parts.length <= 2) {
    return normalized;
  }

  // Simplified check for common TLDs
  // This is not exhaustive and a proper implementation would use the Public Suffix List
  const commonTlds = new Set([
    'com',
    'org',
    'net',
    'dev',
    'io',
    'co',
    'gov',
    'edu',
    'app'
  ]);
  const commonSecondLevelTlds = new Set([
    'co.uk',
    'com.au',
    'gov.uk',
    'com.br'
  ]);

  const lastPart = parts[parts.length - 1];
  const lastTwoParts = parts.slice(-2).join('.');

  if (commonSecondLevelTlds.has(lastTwoParts) && parts.length > 2) {
    return parts.slice(-3).join('.');
  }

  if (commonTlds.has(lastPart) && parts.length > 1) {
    return parts.slice(-2).join('.');
  }

  // Fallback for domains like 'localhost' or other special cases
  if (parts.length === 1) {
    return normalized;
  }

  // Default to returning the last two parts if no specific rule matches
  return parts.slice(-2).join('.');
}

/**
 * Check if a domain is a subdomain of another domain
 * @param {string} subdomain - The potential subdomain
 * @param {string} domain - The parent domain
 * @returns {boolean} True if it is a subdomain
 */
export function isSubdomain(subdomain, domain) {
  const normalizedSubdomain = normalizeDomain(subdomain);
  const normalizedDomain = normalizeDomain(domain);

  if (normalizedSubdomain === normalizedDomain) {
    return true;
  }

  return normalizedSubdomain.endsWith(`.${normalizedDomain}`);
}

/**
 * Find a matching blocked domain from a set of blocked domains.
 * This function checks for exact matches and subdomain matches.
 *
 * @param {string} targetDomain - The domain to check (e.g., from a URL)
 * @param {Set<string>} blockedDomains - A set of domains that are blocked.
 * @returns {string|null} The matching blocked domain or null if no match is found.
 */
export function findMatchingBlockedDomain(targetDomain, blockedDomains) {
  if (!targetDomain || !blockedDomains) {
    return null;
  }

  const normalizedTarget = normalizeDomain(targetDomain);

  // 1. Exact match
  if (blockedDomains.has(normalizedTarget)) {
    return normalizedTarget;
  }

  // 2. Subdomain match (e.g., block `google.com` should block `news.google.com`)
  // To do this, we check if the target domain ends with any of the blocked domains
  // preceded by a dot. This is more efficient than iterating through all possible
  // superdomains of the target.
  for (const blockedDomain of blockedDomains) {
    if (isSubdomain(normalizedTarget, blockedDomain)) {
      return blockedDomain;
    }
  }

  // 3. Parent domain match (e.g., block `news.google.com` should not block `google.com`)
  // This is implicitly handled by the subdomain check. We also consider blocking the root
  // eTLD+1 based on a subdomain block. For example, if `sub.example.com` is requested
  // and `example.com` is blocked, we should block.
  const etldPlusOne = getETLDPlusOne(normalizedTarget);
  if (
    etldPlusOne &&
    etldPlusOne !== normalizedTarget &&
    blockedDomains.has(etldPlusOne)
  ) {
    return etldPlusOne;
  }

  return null;
}
