/**
 * Chrome Extension Service Worker
 * Handles URL blocking, temporary bypasses, and provides message passing API
 */

import {
  getBlockedDomains,
  addBlockedDomain,
  removeBlockedDomain,
  getBypasses,
  addBypass,
  removeBypass,
  hasActiveBypass,
  getRemainingBypassTime
} from '../shared/storage.js';
import {
  normalizeDomain,
  getETLDPlusOne,
  findMatchingBlockedDomain
} from '../shared/domain.js';

// Constants
const ALARM_NAME = 'cleanup-bypasses';
const CLEANUP_INTERVAL_MINUTES = 1;
const CONTEXT_MENU_ID = 'block-this-site';

/**
 * Initialize the extension on install/startup
 */
chrome.runtime.onInstalled.addListener(async details => {
  console.log('Extension installed/updated:', details);

  try {
    // Set up default storage if needed
    await initializeDefaultStorage();

    // Set up context menu
    await setupContextMenu();

    // Set up cleanup alarm
    await setupCleanupAlarm();

    console.log('Service worker initialization completed');
  } catch (error) {
    console.error('Error during initialization:', error);
  }
});

/**
 * Initialize default storage values
 */
async function initializeDefaultStorage() {
  try {
    const result = await chrome.storage.local.get([
      'blockedDomains',
      'bypasses'
    ]);

    // Set default empty arrays/objects if they don't exist
    const updates = {};

    if (!result.blockedDomains) {
      updates.blockedDomains = [];
      console.log('Initialized empty blocked domains list');
    }

    if (!result.bypasses) {
      updates.bypasses = {};
      console.log('Initialized empty bypasses object');
    }

    if (Object.keys(updates).length > 0) {
      await chrome.storage.local.set(updates);
      console.log('Default storage values set:', updates);
    }
  } catch (error) {
    console.error('Error initializing default storage:', error);
  }
}

/**
 * Set up context menu for blocking sites
 */
async function setupContextMenu() {
  try {
    // Remove existing context menu items
    await chrome.contextMenus.removeAll();

    // Create "Block this site" context menu
    chrome.contextMenus.create({
      id: CONTEXT_MENU_ID,
      title: 'Block this site',
      contexts: ['page'],
      documentUrlPatterns: ['<all_urls>']
    });

    console.log('Context menu created successfully');
  } catch (error) {
    console.error('Error setting up context menu:', error);
  }
}

/**
 * Set up periodic cleanup alarm
 */
async function setupCleanupAlarm() {
  try {
    // Clear existing alarm
    await chrome.alarms.clear(ALARM_NAME);

    // Create new alarm
    await chrome.alarms.create(ALARM_NAME, {
      periodInMinutes: CLEANUP_INTERVAL_MINUTES
    });

    console.log(
      `Cleanup alarm set for every ${CLEANUP_INTERVAL_MINUTES} minute(s)`
    );
  } catch (error) {
    console.error('Error setting up cleanup alarm:', error);
  }
}

/**
 * Handle web requests to block URLs
 */
chrome.webRequest.onBeforeRequest.addListener(
  async details => {
    try {
      // Only process main frame requests (page navigation)
      if (details.type !== 'main_frame') {
        return { cancel: false };
      }

      const url = new URL(details.url);
      const requestDomain = normalizeDomain(url.hostname);

      console.log('Checking request for domain:', requestDomain);

      // Get blocked domains
      const [blockedDomains] = await Promise.all([getBlockedDomains()]);

      // Check if domain matches any blocked domain
      const matchingBlockedDomain = findMatchingBlockedDomain(
        requestDomain,
        blockedDomains
      );

      if (matchingBlockedDomain) {
        console.log('Domain matches blocked domain:', matchingBlockedDomain);

        // Check if there's an active bypass
        const hasValidBypass =
          (await hasActiveBypass(matchingBlockedDomain)) ||
          (await hasActiveBypass(requestDomain));

        if (!hasValidBypass) {
          console.log(
            'No valid bypass found, redirecting to confirmation page'
          );

          // Get extension ID for redirect URL
          const extensionId = chrome.runtime.id;
          const encodedUrl = encodeURIComponent(details.url);
          const redirectUrl = `chrome-extension://${extensionId}/src/confirm/confirm.html?url=${encodedUrl}`;

          return {
            redirectUrl: redirectUrl
          };
        } else {
          console.log('Active bypass found, allowing request');
        }
      }

      return { cancel: false };
    } catch (error) {
      console.error('Error in webRequest handler:', error);
      return { cancel: false };
    }
  },
  { urls: ['<all_urls>'], types: ['main_frame'] },
  ['blocking']
);

/**
 * Handle context menu clicks
 */
chrome.contextMenus.onClicked.addListener(async (info, _tab) => {
  if (info.menuItemId === CONTEXT_MENU_ID) {
    try {
      const url = new URL(info.pageUrl);
      const domain = getETLDPlusOne(url.hostname);

      if (domain) {
        await addBlockedDomain(domain);
        console.log('Added domain to blocked list:', domain);

        // Optionally show notification
        chrome.notifications?.create({
          type: 'basic',
          iconUrl: 'icons/icon48.png',
          title: 'Site Blocked',
          message: `${domain} has been added to your blocked sites.`
        });
      }
    } catch (error) {
      console.error('Error blocking site from context menu:', error);
    }
  }
});

/**
 * Handle alarm events for periodic cleanup
 */
chrome.alarms.onAlarm.addListener(async alarm => {
  if (alarm.name === ALARM_NAME) {
    try {
      console.log('Running periodic bypass cleanup');

      // Get current bypasses - this will automatically clean expired ones
      await getBypasses();

      console.log('Bypass cleanup completed');
    } catch (error) {
      console.error('Error during periodic bypass cleanup:', error);
    }
  }
});

/**
 * Message passing API for popup and confirm pages
 */
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  console.log('Received message:', request);

  handleMessage(request, _sender)
    .then(response => {
      console.log('Sending response:', response);
      sendResponse(response);
    })
    .catch(error => {
      console.error('Error handling message:', error);
      sendResponse({ success: false, error: error.message });
    });

  // Return true to indicate we'll respond asynchronously
  return true;
});

/**
 * Handle messages from popup and confirm pages
 */
async function handleMessage(request, _sender) {
  const { action, data } = request;

  try {
    switch (action) {
      case 'getBlockedDomains': {
        const blockedDomains = await getBlockedDomains();
        return {
          success: true,
          data: Array.from(blockedDomains)
        };
      }

      case 'addBlockedDomain':
        if (!data?.domain) {
          throw new Error('Domain is required');
        }
        await addBlockedDomain(data.domain);
        return { success: true };

      case 'removeBlockedDomain':
        if (!data?.domain) {
          throw new Error('Domain is required');
        }
        await removeBlockedDomain(data.domain);
        return { success: true };

      case 'getBypasses': {
        const bypasses = await getBypasses();
        return {
          success: true,
          data: bypasses
        };
      }

      case 'addBypass': {
        if (!data?.domain || !data?.duration) {
          throw new Error('Domain and duration are required');
        }
        // Convert duration from minutes to milliseconds
        const durationMs = data.duration * 60 * 1000;
        await addBypass(data.domain, durationMs);
        return { success: true };
      }

      case 'removeBypass':
        if (!data?.domain) {
          throw new Error('Domain is required');
        }
        await removeBypass(data.domain);
        return { success: true };

      case 'hasActiveBypass': {
        if (!data?.domain) {
          throw new Error('Domain is required');
        }
        const hasBypass = await hasActiveBypass(data.domain);
        return {
          success: true,
          data: hasBypass
        };
      }

      case 'getRemainingBypassTime': {
        if (!data?.domain) {
          throw new Error('Domain is required');
        }
        const remainingTime = await getRemainingBypassTime(data.domain);
        return {
          success: true,
          data: remainingTime
        };
      }

      case 'getCurrentTabDomain':
        try {
          // Query for the active tab in the current window
          const tabs = await chrome.tabs.query({
            active: true,
            currentWindow: true
          });

          if (tabs.length > 0 && tabs[0].url) {
            const url = new URL(tabs[0].url);

            // Only process web URLs
            if (url.protocol === 'http:' || url.protocol === 'https:') {
              const domain = getETLDPlusOne(url.hostname);
              return {
                success: true,
                data: {
                  domain: domain,
                  fullDomain: url.hostname,
                  url: tabs[0].url
                }
              };
            }
          }

          throw new Error('No valid web page found in current tab');
        } catch (error) {
          console.error('Error getting current tab domain:', error);
          throw new Error('Unable to get current tab domain');
        }

      case 'cleanup':
        // Force cleanup of expired bypasses
        await getBypasses();
        return { success: true };

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error(`Error handling action ${action}:`, error);
    throw error;
  }
}

/**
 * Handle extension startup
 */
chrome.runtime.onStartup.addListener(async () => {
  console.log('Extension starting up');

  try {
    // Re-initialize context menu and alarms
    await setupContextMenu();
    await setupCleanupAlarm();

    console.log('Startup initialization completed');
  } catch (error) {
    console.error('Error during startup:', error);
  }
});

console.log('Service worker loaded and ready');
