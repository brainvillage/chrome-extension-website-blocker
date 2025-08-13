/**
 * Debug Script for Testing Chrome Extension Bypasses
 *
 * Copy and paste these commands into the service worker console
 * (chrome://extensions → click "service worker" next to your extension)
 */

// 1. Check current storage state
console.log('=== CHECKING STORAGE STATE ===');
chrome.storage.local.get(['blockedDomains', 'bypasses'], result => {
  console.log('Blocked Domains:', result.blockedDomains);
  console.log('Active Bypasses:', result.bypasses);
  console.log('Number of bypasses:', Object.keys(result.bypasses || {}).length);
});

// 2. Force cleanup of expired bypasses
console.log('=== FORCING BYPASS CLEANUP ===');
chrome.runtime.sendMessage({ action: 'cleanup' }, response => {
  console.log('Cleanup response:', response);
});

// 3. Check specific domain bypass status
function _checkBypassStatus(domain) {
  chrome.runtime.sendMessage(
    {
      action: 'hasActiveBypass',
      data: { domain: domain }
    },
    response => {
      console.log(`Bypass status for ${domain}:`, response.data);
    }
  );

  chrome.runtime.sendMessage(
    {
      action: 'getRemainingBypassTime',
      data: { domain: domain }
    },
    response => {
      console.log(`Remaining time for ${domain}:`, response.data, 'ms');
      if (response.data > 0) {
        console.log(
          `Time remaining: ${Math.round(response.data / 1000)} seconds`
        );
      }
    }
  );
}

// 4. Add test bypasses for debugging
function _addTestBypass(domain, minutes) {
  chrome.runtime.sendMessage(
    {
      action: 'addBypass',
      data: {
        domain: domain,
        duration: minutes
      }
    },
    response => {
      console.log(`Added ${minutes}min bypass for ${domain}:`, response);
    }
  );
}

// 5. Remove specific bypass
function _removeBypass(domain) {
  chrome.runtime.sendMessage(
    {
      action: 'removeBypass',
      data: { domain: domain }
    },
    response => {
      console.log(`Removed bypass for ${domain}:`, response);
    }
  );
}

// 6. Clear all bypasses (for testing)
function _clearAllBypasses() {
  chrome.storage.local.set({ bypasses: {} }, () => {
    console.log('All bypasses cleared');
  });
}

// 7. Show all active bypasses with expiry times
function _showDetailedBypassInfo() {
  chrome.storage.local.get(['bypasses'], result => {
    const bypasses = result.bypasses || {};
    const now = Date.now();

    console.log('=== DETAILED BYPASS INFO ===');
    console.log(`Current time: ${new Date(now).toLocaleString()}`);

    Object.entries(bypasses).forEach(([domain, bypassData]) => {
      const remainingMs = bypassData.expiryTime - now;
      const remainingSec = Math.round(remainingMs / 1000);
      const isExpired = remainingMs <= 0;

      console.log(`Domain: ${domain}`);
      console.log(
        `  Created: ${new Date(bypassData.createdAt).toLocaleString()}`
      );
      console.log(
        `  Expires: ${new Date(bypassData.expiryTime).toLocaleString()}`
      );
      console.log(`  Status: ${isExpired ? '❌ EXPIRED' : '✅ ACTIVE'}`);
      console.log(
        `  Time remaining: ${isExpired ? '0' : remainingSec} seconds`
      );
      console.log('---');
    });
  });
}

console.log(`
=== CHROME EXTENSION DEBUG COMMANDS ===

Available functions:
- _checkBypassStatus('domain.com') - Check if domain has active bypass
- _addTestBypass('domain.com', 5) - Add 5-minute bypass for testing
- _removeBypass('domain.com') - Remove bypass for domain
- _clearAllBypasses() - Remove all bypasses
- _showDetailedBypassInfo() - Show detailed info about all bypasses

Example usage:
_checkBypassStatus('facebook.com');
_addTestBypass('facebook.com', 1);
_showDetailedBypassInfo();
`);
