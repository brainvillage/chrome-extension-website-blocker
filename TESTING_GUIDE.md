# Chrome Extension Testing Guide

This guide will help you load the URL Blocker extension in Chrome and thoroughly test all its functionality.

## Step 1: Load the Unpacked Extension

1. **Open Chrome Extension Management:**
   - Go to `chrome://extensions/`
   - OR click the three-dot menu → More tools → Extensions

2. **Enable Developer Mode:**
   - Toggle the "Developer mode" switch in the top-right corner

3. **Load the Extension:**
   - Click "Load unpacked" button
   - Navigate to your extension directory (where `manifest.json` is located)
   - Select the folder and click "Select Folder"

4. **Verify Installation:**
   - You should see "URL Blocker Extension" in your extensions list
   - Note the extension ID (you'll need this for debugging)
   - The extension icon should appear in your Chrome toolbar

## Step 2: Set Up Test Domains

### Add Test Domains Using the Popup:

1. **Open the Extension Popup:**
   - Click the extension icon in the Chrome toolbar

2. **Add facebook.com:**
   - In the "Enter domain to block" field, type: `facebook.com`
   - Click the "Add" button
   - Verify it appears in the "Blocked Domains" list

3. **Add Additional Test Domains:**
   - Add `youtube.com`
   - Add `twitter.com`
   - Add `reddit.com`

### Verify Domain Storage:

- Close and reopen the popup
- Confirm all domains are still listed (tests persistence)

## Step 3: Test Basic Blocking Functionality

### Test 3.1: Main Domain Blocking

1. Navigate to `https://facebook.com`
2. **Expected Result:** Should redirect to confirmation page instead of Facebook
3. **Verify:** URL bar shows `chrome-extension://[extension-id]/src/confirm/confirm.html?url=...`

### Test 3.2: Subdomain Blocking

1. Navigate to `https://www.facebook.com`
2. Navigate to `https://m.facebook.com`
3. Navigate to `https://business.facebook.com`
4. **Expected Result:** All should redirect to confirmation page
5. **Verify:** Subdomain blocking works for all variations

## Step 4: Test "Really Go" Functionality

### Test 4.1: Single Use "Really Go"

1. Navigate to `https://facebook.com`
2. On the confirmation page, click "Really Go" button
3. **Expected Result:** Should navigate to Facebook successfully
4. **Verify:** You can access the site normally

### Test 4.2: "Really Go" Only Works Once

1. Close the Facebook tab
2. Navigate to `https://facebook.com` again
3. **Expected Result:** Should show confirmation page again
4. **Verify:** The "Really Go" bypass was only temporary

## Step 5: Test Temporary Bypass Functionality

### Test 5.1: Create Temporary Bypass

1. Navigate to `https://youtube.com`
2. On confirmation page, select "5 minutes" from dropdown
3. Click "Bypass" button
4. **Expected Result:** Should navigate to YouTube successfully

### Test 5.2: Verify Bypass Duration

1. Navigate to `https://youtube.com` again (should work without confirmation)
2. Try `https://www.youtube.com` (should also work)
3. **Expected Result:** No confirmation page for 5 minutes

### Test 5.3: Test Countdown and Re-blocking

1. **Wait Method:** Wait 5+ minutes and test again
2. **OR Speed Test Method:** Use browser console to modify time:
   - Go to `chrome://extensions/`
   - Click "service worker" next to your extension
   - In the DevTools console, run:

   ```javascript
   // Force cleanup of bypasses
   chrome.runtime.sendMessage({ action: 'cleanup' });
   ```

3. Navigate to `https://youtube.com` again
4. **Expected Result:** Should show confirmation page again (bypass expired)

## Step 6: Test Data Persistence After Browser Restart

### Test 6.1: Verify Blocked Domains Persist

1. **Before Restart:**
   - Note all blocked domains in the popup
   - Create a bypass for one domain

2. **Close Chrome completely** (not just tabs - close all Chrome windows)

3. **Restart Chrome and test:**
   - Open extension popup
   - **Verify:** All blocked domains are still there
   - Navigate to blocked sites
   - **Verify:** Blocking still works

### Test 6.2: Verify Bypasses Don't Persist (Expected Behavior)

1. Create a 15-minute bypass for a domain
2. Close Chrome completely
3. Restart Chrome
4. Navigate to the bypassed domain
5. **Expected Result:** Should show confirmation page (bypasses are temporary and don't survive restart)

## Step 7: Console Logs & Debugging

### Service Worker Debugging:

1. **Access Service Worker Console:**
   - Go to `chrome://extensions/`
   - Find your extension
   - Click "service worker" link
   - This opens DevTools for the background script

2. **Monitor Logs During Testing:**

   ```
   Expected logs when blocking:
   - "Checking request for domain: facebook.com"
   - "Domain matches blocked domain: facebook.com"
   - "No valid bypass found, redirecting to confirmation page"

   Expected logs when bypass is active:
   - "Active bypass found, allowing request"

   Expected logs for bypass creation:
   - "Bypass created for facebook.com for 5 minutes"
   ```

3. **Check Storage State:**
   In the service worker console, run:
   ```javascript
   chrome.storage.local.get(['blockedDomains', 'bypasses'], result => {
     console.log('Storage state:', result);
   });
   ```

### Content Script Debugging:

1. Navigate to a blocked site's confirmation page
2. Open DevTools (F12)
3. Check console for any errors
4. Verify page elements load correctly

### Popup Debugging:

1. Right-click the extension icon
2. Select "Inspect popup"
3. Check console for any errors while using popup features

## Step 8: Additional Test Cases

### Test 8.1: Context Menu Blocking

1. Right-click on any webpage
2. **Verify:** "Block this site" appears in context menu
3. Click "Block this site"
4. **Verify:** Domain gets added to blocked list
5. **Verify:** Notification appears (if implemented)

### Test 8.2: Invalid URL Handling

1. Manually navigate to confirmation page with invalid URL:
   `chrome-extension://[extension-id]/src/confirm/confirm.html?url=invalid-url`
2. **Verify:** "Really Go" button is disabled
3. **Verify:** Error handling works gracefully

### Test 8.3: Non-HTTP URLs

1. Try navigating to `file://` or `chrome://` URLs
2. **Verify:** Extension doesn't interfere with system pages

## Step 9: Performance Testing

### Test 9.1: Multiple Tabs

1. Open multiple blocked domains in different tabs quickly
2. **Verify:** All show confirmation pages correctly
3. **Verify:** No conflicts between tabs

### Test 9.2: Rapid Navigation

1. Navigate back and forth between blocked sites quickly
2. **Verify:** Blocking works consistently
3. **Verify:** No memory leaks or performance issues

## Troubleshooting Common Issues

### Issue: Extension doesn't load

- **Check:** manifest.json syntax
- **Check:** All referenced files exist
- **Check:** Chrome Developer mode is enabled

### Issue: Blocking doesn't work

- **Check:** Service worker console for errors
- **Check:** webRequest permission is granted
- **Check:** URLs being tested are main_frame requests

### Issue: Popup doesn't open

- **Check:** popup.html and popup.js exist
- **Check:** Right-click extension icon → Inspect popup for errors

### Issue: Confirmation page doesn't work

- **Check:** confirm.html, confirm.js, and confirm.css exist
- **Check:** URL parameter is being passed correctly

## Expected Test Results Summary

✅ **Should Work:**

- Blocking main domains and all subdomains
- "Really Go" works once per session
- Temporary bypasses work for specified duration
- Bypasses expire after time limit
- Blocked domains persist after browser restart
- All console logs appear as expected

✅ **Should NOT Work (Expected Behavior):**

- "Really Go" should NOT work multiple times
- Bypasses should NOT persist after browser restart
- Extension should NOT block non-HTTP URLs

## Performance Benchmarks

- **Startup time:** < 100ms
- **Block detection:** < 50ms per request
- **Memory usage:** < 10MB for background script
- **Storage size:** < 1KB per 100 blocked domains

This completes the comprehensive testing of your Chrome extension!
