# Quick Test Guide - Chrome Extension

## 🚀 Ready to Test!

Your Chrome extension is now complete with all necessary files including icons. Follow these steps for immediate testing:

## Step 1: Load Extension (2 minutes)

1. Open Chrome and go to: `chrome://extensions/`
2. Enable "Developer mode" (top-right toggle)
3. Click "Load unpacked"
4. Select this folder: `/Users/hirndorf/code/projects/chrome-extension`
5. ✅ Extension should load successfully with a red "B" icon in toolbar

## Step 2: Add Test Domain (30 seconds)

1. Click the extension icon in Chrome toolbar
2. Type `facebook.com` in the input field
3. Click "Add"
4. ✅ Should appear in "Blocked Domains" list

## Step 3: Test Basic Blocking (1 minute)

1. Navigate to `https://facebook.com`
2. ✅ Should redirect to confirmation page instead of Facebook
3. ✅ URL should show: `chrome-extension://[id]/src/confirm/confirm.html?url=...`

## Step 4: Test Subdomain Blocking (1 minute)

1. Try `https://www.facebook.com`
2. Try `https://m.facebook.com`
3. ✅ Both should show confirmation page (subdomain blocking works)

## Step 5: Test "Really Go" (1 minute)

1. On confirmation page, click "Really Go"
2. ✅ Should navigate to Facebook successfully
3. Close tab, navigate to `https://facebook.com` again
4. ✅ Should show confirmation page again ("Really Go" only works once)

## Step 6: Test Temporary Bypass (2 minutes)

1. Navigate to `https://facebook.com` (blocked)
2. Select "5 minutes" from dropdown
3. Click "Bypass" button
4. ✅ Should navigate to Facebook
5. Navigate to `https://facebook.com` again
6. ✅ Should work without confirmation (bypass active)

## Step 7: Debug Console (1 minute)

1. Go to `chrome://extensions/`
2. Find your extension, click "service worker"
3. In console, paste this:

```javascript
chrome.storage.local.get(['blockedDomains', 'bypasses'], result => {
  console.log('Blocked:', result.blockedDomains);
  console.log('Bypasses:', result.bypasses);
});
```

4. ✅ Should show your stored data

## Step 8: Test Persistence (2 minutes)

1. **Before closing Chrome**: Note blocked domains in popup
2. **Close Chrome completely** (all windows)
3. **Restart Chrome**
4. Open extension popup
5. ✅ Blocked domains should still be there
6. Navigate to blocked site
7. ✅ Blocking should still work

---

## 🛠️ If Something Goes Wrong:

### Extension won't load:

- Check that `manifest.json` exists in selected folder
- Check browser console for errors
- Make sure Developer mode is enabled

### Blocking doesn't work:

1. Go to `chrome://extensions/`
2. Click "service worker" next to your extension
3. Navigate to blocked site
4. Check console for logs like:
   - "Checking request for domain: facebook.com"
   - "Domain matches blocked domain: facebook.com"

### Need to debug bypasses:

Copy/paste commands from `debug_bypasses.js` into service worker console

---

## ✅ Expected Results Summary:

**✅ SHOULD WORK:**

- Block facebook.com and all subdomains (www.facebook.com, m.facebook.com, etc.)
- "Really Go" works once per browser session
- Bypasses work for specified time (5/10/15 minutes)
- Blocked domains persist after browser restart
- Service worker logs show blocking/bypass activity

**✅ SHOULD NOT WORK (Expected):**

- "Really Go" should NOT work multiple times
- Bypasses should NOT persist after browser restart
- Extension should NOT interfere with chrome:// or file:// URLs

**🕒 Time to complete full testing: ~10 minutes**

---

## 📝 Complete Testing

For comprehensive testing of all features including edge cases, see `TESTING_GUIDE.md`
