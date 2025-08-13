/**
 * Wrapper around chrome.storage.local for managing blocked domains and bypasses
 */

const STORAGE_KEYS = {
  BLOCKED_DOMAINS: 'blockedDomains',
  BYPASSES: 'bypasses'
};

/**
 * Get the set of blocked domains
 * @returns {Promise<Set<string>>} Set of blocked domain strings
 */
export async function getBlockedDomains() {
  try {
    const result = await chrome.storage.local.get([
      STORAGE_KEYS.BLOCKED_DOMAINS
    ]);
    const domains = result[STORAGE_KEYS.BLOCKED_DOMAINS] || [];
    return new Set(domains);
  } catch (error) {
    console.error('Error getting blocked domains:', error);
    return new Set();
  }
}

/**
 * Add a domain to the blocked domains list
 * @param {string} domain - Domain to block
 * @returns {Promise<void>}
 */
export async function addBlockedDomain(domain) {
  if (!domain || typeof domain !== 'string') {
    throw new Error('Domain must be a non-empty string');
  }

  try {
    const blockedDomains = await getBlockedDomains();
    blockedDomains.add(domain.toLowerCase().trim());

    await chrome.storage.local.set({
      [STORAGE_KEYS.BLOCKED_DOMAINS]: Array.from(blockedDomains)
    });
  } catch (error) {
    console.error('Error adding blocked domain:', error);
    throw error;
  }
}

/**
 * Remove a domain from the blocked domains list
 * @param {string} domain - Domain to unblock
 * @returns {Promise<void>}
 */
export async function removeBlockedDomain(domain) {
  if (!domain || typeof domain !== 'string') {
    throw new Error('Domain must be a non-empty string');
  }

  try {
    const blockedDomains = await getBlockedDomains();
    blockedDomains.delete(domain.toLowerCase().trim());

    await chrome.storage.local.set({
      [STORAGE_KEYS.BLOCKED_DOMAINS]: Array.from(blockedDomains)
    });
  } catch (error) {
    console.error('Error removing blocked domain:', error);
    throw error;
  }
}

/**
 * Get the temporary bypasses dictionary
 * @returns {Promise<Object>} Dictionary of {'domain': expiryEpoch}
 */
export async function getBypasses() {
  try {
    const result = await chrome.storage.local.get([STORAGE_KEYS.BYPASSES]);
    const bypasses = result[STORAGE_KEYS.BYPASSES] || {};

    // Clean up expired bypasses
    const now = Date.now();
    const activeBypasses = {};

    for (const [domain, expiryEpoch] of Object.entries(bypasses)) {
      if (expiryEpoch > now) {
        activeBypasses[domain] = expiryEpoch;
      }
    }

    // If we cleaned up any expired bypasses, save the cleaned version
    if (Object.keys(activeBypasses).length !== Object.keys(bypasses).length) {
      await setBypasses(activeBypasses);
    }

    return activeBypasses;
  } catch (error) {
    console.error('Error getting bypasses:', error);
    return {};
  }
}

/**
 * Set the temporary bypasses dictionary
 * @param {Object} bypasses - Dictionary of {'domain': expiryEpoch}
 * @returns {Promise<void>}
 */
export async function setBypasses(bypasses) {
  if (!bypasses || typeof bypasses !== 'object') {
    throw new Error('Bypasses must be an object');
  }

  try {
    // Validate the structure and clean up expired entries
    const now = Date.now();
    const validBypasses = {};

    for (const [domain, expiryEpoch] of Object.entries(bypasses)) {
      if (
        typeof domain === 'string' &&
        typeof expiryEpoch === 'number' &&
        expiryEpoch > now
      ) {
        validBypasses[domain.toLowerCase().trim()] = expiryEpoch;
      }
    }

    await chrome.storage.local.set({
      [STORAGE_KEYS.BYPASSES]: validBypasses
    });
  } catch (error) {
    console.error('Error setting bypasses:', error);
    throw error;
  }
}

/**
 * Add a temporary bypass for a domain
 * @param {string} domain - Domain to bypass
 * @param {number} durationMs - Duration in milliseconds
 * @returns {Promise<void>}
 */
export async function addBypass(domain, durationMs) {
  if (!domain || typeof domain !== 'string') {
    throw new Error('Domain must be a non-empty string');
  }

  if (!durationMs || typeof durationMs !== 'number' || durationMs <= 0) {
    throw new Error('Duration must be a positive number');
  }

  try {
    const bypasses = await getBypasses();
    const expiryEpoch = Date.now() + durationMs;

    bypasses[domain.toLowerCase().trim()] = expiryEpoch;
    await setBypasses(bypasses);
  } catch (error) {
    console.error('Error adding bypass:', error);
    throw error;
  }
}

/**
 * Remove a temporary bypass for a domain
 * @param {string} domain - Domain to remove bypass for
 * @returns {Promise<void>}
 */
export async function removeBypass(domain) {
  if (!domain || typeof domain !== 'string') {
    throw new Error('Domain must be a non-empty string');
  }

  try {
    const bypasses = await getBypasses();
    delete bypasses[domain.toLowerCase().trim()];
    await setBypasses(bypasses);
  } catch (error) {
    console.error('Error removing bypass:', error);
    throw error;
  }
}

/**
 * Check if a domain currently has an active bypass
 * @param {string} domain - Domain to check
 * @returns {Promise<boolean>} True if domain has active bypass
 */
export async function hasActiveBypass(domain) {
  if (!domain || typeof domain !== 'string') {
    return false;
  }

  try {
    const bypasses = await getBypasses();
    const normalizedDomain = domain.toLowerCase().trim();
    return normalizedDomain in bypasses;
  } catch (error) {
    console.error('Error checking bypass status:', error);
    return false;
  }
}

/**
 * Get remaining bypass time for a domain in milliseconds
 * @param {string} domain - Domain to check
 * @returns {Promise<number>} Remaining time in milliseconds, 0 if no active bypass
 */
export async function getRemainingBypassTime(domain) {
  if (!domain || typeof domain !== 'string') {
    return 0;
  }

  try {
    const bypasses = await getBypasses();
    const normalizedDomain = domain.toLowerCase().trim();

    if (normalizedDomain in bypasses) {
      const remainingTime = bypasses[normalizedDomain] - Date.now();
      return Math.max(0, remainingTime);
    }

    return 0;
  } catch (error) {
    console.error('Error getting remaining bypass time:', error);
    return 0;
  }
}
