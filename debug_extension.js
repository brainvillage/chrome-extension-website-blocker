// Debug script to test the extension's functionality
// Run this in the extension's service worker console

console.log("=== Extension Debug Test ===");

// Test 1: Check if service worker is running
console.log("1. Service Worker Status: RUNNING");

// Test 2: Check storage
chrome.storage.local.get(['blockedDomains', 'bypasses'], (result) => {
  console.log("2. Current Storage:", result);
});

// Test 3: Add a test domain
chrome.storage.local.set({
  blockedDomains: ['example.com', 'facebook.com']
}, () => {
  console.log("3. Added test domains: example.com, facebook.com");
});

// Test 4: Test webRequest listener
console.log("4. webRequest listener should be active");
console.log("   Try navigating to facebook.com to test");

// Test 5: Check permissions
chrome.permissions.getAll((permissions) => {
  console.log("5. Extension permissions:", permissions);
});
