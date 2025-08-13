# Popup UI - Site Blocker Extension

This directory contains the popup interface for the Site Blocker Chrome extension.

## Files

- **popup.html** - HTML structure for the popup interface
- **popup.css** - Styling and responsive design for the popup
- **popup.js** - JavaScript handling DOM interactions and background communication

## UI Components

### 1. Header

- **h1 "Site Blocker"** - Main title of the extension

### 2. Block Current Site Section

- **"Block Current Site" button** - Reads the active tab URL and adds the domain to the blocked list
- **Current site info display** - Shows which domain will be blocked or status messages

### 3. Manual Domain Input

- **Text input field** - Allows manual entry of domains to block
- **"Add" button** - Adds the entered domain to the blocked list
- **Real-time validation** - Input validation with visual feedback

### 4. Blocked Domains List

- **Scrollable list (UL)** - Displays all currently blocked domains
- **Remove buttons (✕)** - Each domain has a remove icon for easy deletion
- **Empty state** - Shows message when no domains are blocked
- **Alphabetical sorting** - Domains are sorted for easy browsing

### 5. Information Hint

- **Subdomain coverage hint** - Explains that blocking a domain also blocks its subdomains
- **Visual information icon** - Clear visual indicator for the hint

### 6. UI Feedback Elements

- **Loading spinner** - Shows during async operations
- **Error messages** - User-friendly error display with auto-dismiss
- **Success feedback** - Visual confirmation of successful operations

## Features

### Core Functionality

- **Current tab detection** - Automatically identifies the current website
- **Domain validation** - Prevents invalid domain entries
- **Duplicate prevention** - Prevents adding already blocked domains
- **Real-time sync** - Updates UI when storage changes occur

### User Experience

- **Responsive design** - Works well in the popup window format (320px width)
- **Keyboard support** - Enter key works in the input field
- **Accessibility** - ARIA labels, focus management, high contrast support
- **Loading states** - Clear feedback during operations
- **Error handling** - Graceful error handling with user-friendly messages

### Communication with Background

The popup communicates with the background service worker using `chrome.runtime.sendMessage()`:

```javascript
// Supported actions:
- getBlockedDomains: Retrieve all blocked domains
- addBlockedDomain: Add a new domain to block
- removeBlockedDomain: Remove a domain from the blocked list
- getCurrentTabDomain: Get domain info for the active tab
```

### CSS Features

- **Modern design** - Clean, professional appearance
- **Smooth animations** - Hover effects and transitions
- **Dark/light theme ready** - Respects system preferences
- **Reduced motion support** - Respects user motion preferences
- **Custom scrollbars** - Styled scrollbars for the domain list

## Browser Compatibility

Designed for Chrome extensions manifest v3, compatible with:

- Chrome 88+
- Edge 88+
- Other Chromium-based browsers

## Usage

1. Click the extension icon to open the popup
2. Use "Block Current Site" to quickly block the current website
3. Or manually enter domains in the input field
4. View and manage blocked domains in the scrollable list
5. Click the ✕ icon next to any domain to unblock it

The popup automatically updates when domains are added or removed from other parts of the extension (like the context menu).
