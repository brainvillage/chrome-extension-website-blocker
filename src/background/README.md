# Background Service Worker

This service worker (`serviceWorker.js`) implements the core blocking functionality for the URL Blocker Extension.

## Key Features

### 1. Default Storage Initialization

- Sets up empty blocked domains list and bypasses object on extension install
- Ensures consistent storage structure across all extension components

### 2. Web Request Blocking

- Listens to `chrome.webRequest.onBeforeRequest` for all main frame requests
- Normalizes domain names using shared utility functions
- Checks against blocked domains list and active bypasses
- Redirects blocked requests to confirmation page: `chrome-extension://<EXT_ID>/src/confirm/confirm.html?url=<ENCODED_URL>`

### 3. Message Passing API

The service worker provides a comprehensive message API for popup and confirm pages:

#### Available Actions:

- `getBlockedDomains` - Returns array of blocked domains
- `addBlockedDomain` - Adds a domain to blocked list
- `removeBlockedDomain` - Removes a domain from blocked list
- `getBypasses` - Returns active bypass dictionary
- `addBypass` - Adds temporary bypass (domain + duration)
- `removeBypass` - Removes specific bypass
- `hasActiveBypass` - Checks if domain has active bypass
- `getCurrentTabDomain` - Gets domain info for current tab
- `cleanup` - Forces cleanup of expired bypasses

#### Usage Example:

```javascript
const response = await chrome.runtime.sendMessage({
  action: 'addBlockedDomain',
  data: { domain: 'example.com' }
});
```

### 4. Periodic Cleanup

- Uses `chrome.alarms` to clean up expired bypasses every minute
- Automatically removes expired entries when querying bypasses
- Alarm name: `cleanup-bypasses`

### 5. Context Menu Integration (Optional UX)

- Adds "Block this site" right-click option on web pages
- Automatically extracts eTLD+1 domain from current page
- Shows notification when site is blocked
- Uses `getETLDPlusOne()` to ensure root domain blocking

## Error Handling

- All async operations wrapped in try-catch blocks
- Comprehensive logging for debugging
- Graceful degradation when APIs fail
- Returns safe defaults when storage operations fail

## Dependencies

- `../shared/storage.js` - Storage utility functions
- `../shared/domain.js` - Domain parsing and normalization

## Required Permissions

- `storage` - For persisting blocked domains and bypasses
- `webRequest` + `webRequestBlocking` - For intercepting requests
- `contextMenus` - For right-click blocking feature
- `alarms` - For periodic cleanup
- `notifications` - For user feedback
- `host_permissions: ["<all_urls>"]` - For monitoring all web requests
