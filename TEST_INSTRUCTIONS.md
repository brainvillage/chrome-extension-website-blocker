# Testing Your URL Blocker Extension

## Steps to test the extension:

### 1. Reload the Extension
1. Go to `chrome://extensions/`
2. Find "URL Blocker Extension"
3. Click the refresh button (↻)

### 2. Add a Test Domain
1. Click the extension icon in the toolbar
2. In the popup, add a domain to block (e.g., `example.com`)
3. Click "Add Domain" or press Enter

### 3. Test Blocking
1. Try to navigate to the blocked domain (`http://example.com`)
2. You should be redirected to a confirmation page
3. From the confirmation page, you can:
   - Click "Really Go" to proceed
   - Click "Close Tab" to close
   - Set a temporary bypass

### 4. Debug Console
1. Go to `chrome://extensions/`
2. Find your extension
3. Click "service worker" to open the console
4. You should see logs when navigating to blocked sites

### 5. Expected Console Output
When working properly, you should see logs like:
```
Extension installed/updated: ...
Service worker initialization completed
Checking navigation for domain: example.com
Domain matches blocked domain: example.com
No valid bypass found, redirecting to confirmation page
```

### 6. Troubleshooting
- Make sure the extension has all required permissions
- Check the service worker console for errors
- Ensure you've added domains to the blocked list
- Test with simple domains like `example.com` first

### 7. Context Menu Test
- Right-click on any webpage
- Select "Block this site" from the context menu
- The site should be added to your blocked list automatically
