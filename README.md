# URL Blocker Extension

> A Chrome extension that helps you manage your web browsing by blocking unwanted URLs with customizable filtering rules and temporary bypass functionality.

## 🚀 Features

- **Smart Domain Blocking**: Block entire domains or specific subdomains
- **Temporary Bypasses**: Get temporary access to blocked sites when needed
- **Confirmation Dialog**: Double-check before visiting blocked sites
- **Right-click Context Menu**: Quickly block the current site
- **Clean Interface**: Easy-to-use popup for managing blocked domains
- **Background Processing**: Efficient service worker handles all blocking logic

## 📋 Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Development](#development)
- [Permissions](#permissions)
- [Privacy](#privacy)
- [Contributing](#contributing)
- [License](#license)

## 🔧 Installation

### From Chrome Web Store (Recommended)

_[Coming Soon - Extension not yet published]_

### Developer Installation

1. **Download or clone this repository**

   ```bash
   git clone <repository-url>
   cd chrome-extension
   ```

2. **Install development dependencies**

   ```bash
   npm install
   ```

3. **Load the extension in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right)
   - Click "Load unpacked"
   - Select the project directory
   - The extension icon will appear in your toolbar

## 📖 Usage

### Basic Operation

1. **Block a site**:
   - Click the extension icon to open the popup
   - Enter a domain (e.g., `facebook.com`) and click "Add Domain"
   - Or right-click on any webpage and select "Block this site"

2. **Manage blocked domains**:
   - View all blocked domains in the popup
   - Remove domains by clicking the "×" button
   - See if the current site is blocked

3. **Temporary access**:
   - When visiting a blocked site, you'll see a confirmation page
   - Choose to bypass temporarily (5, 15, 30, or 60 minutes)
   - Or go back to continue browsing safely

### Advanced Features

- **Context Menu**: Right-click any webpage → "Block this site"
- **Smart Matching**: Blocking `example.com` also blocks `www.example.com` and subdomains
- **Bypass Management**: Active bypasses show remaining time in the popup
- **Persistent Storage**: Your settings sync across browser sessions

### Example Scenarios

**Social Media Focus**:

```
Blocked domains:
- facebook.com
- twitter.com
- instagram.com
- reddit.com
```

**Productivity Setup**:

```
Blocked domains:
- youtube.com
- netflix.com
- twitch.tv

With 15-minute bypasses for necessary research
```

## 🛠️ Development

### Project Structure

```
url-blocker-extension/
├── src/
│   ├── background/          # Service worker (background processing)
│   │   └── serviceWorker.js
│   ├── popup/               # Extension popup interface
│   │   ├── popup.html
│   │   ├── popup.css
│   │   └── popup.js
│   ├── confirm/             # Confirmation page for blocked sites
│   │   ├── confirm.html
│   │   ├── confirm.css
│   │   └── confirm.js
│   └── shared/              # Shared utilities
│       ├── domain.js        # Domain handling logic
│       └── storage.js       # Chrome storage utilities
├── icons/                   # Extension icons (16, 32, 48, 128px)
├── manifest.json           # Extension configuration
└── debug_bypasses.js       # Debug utilities
```

### Development Commands

```bash
# Install dependencies
npm install

# Lint JavaScript files
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Format all files with Prettier
npm run format

# Check formatting
npm run format:check

# Validate code (lint + format check)
npm run validate

# Optimize icons (requires optimization tools)
./optimize_icons.sh

# Create distribution package
npm run package
```

### Loading Changes During Development

1. Make your code changes
2. Go to `chrome://extensions/`
3. Click the refresh icon on your extension
4. Test the changes

### Debugging

- **Service Worker**: `chrome://extensions/` → Click "service worker" link
- **Popup**: Right-click extension icon → "Inspect popup"
- **Confirmation Page**: Use regular DevTools (F12)
- **Debug Console**: Copy commands from `debug_bypasses.js` into service worker console

### Code Quality

This project uses:

- **ESLint**: JavaScript linting with Chrome extension rules
- **Prettier**: Code formatting for consistent style
- **Chrome Extension APIs**: Modern Manifest V3 architecture

## 🔐 Permissions

This extension requires the following permissions:

### Essential Permissions

| Permission           | Purpose                                  | Why It's Needed                             |
| -------------------- | ---------------------------------------- | ------------------------------------------- |
| `storage`            | Save blocked domains and bypass settings | Store your preferences persistently         |
| `tabs`               | Get information about the current tab    | Show current site status in popup           |
| `activeTab`          | Access the active tab's URL              | Determine if current site is blocked        |
| `webRequest`         | Monitor web requests                     | Detect navigation to blocked sites          |
| `webRequestBlocking` | Block or redirect requests               | Redirect blocked sites to confirmation page |

### Optional Permissions

| Permission      | Purpose                                  | Why It's Needed                                |
| --------------- | ---------------------------------------- | ---------------------------------------------- |
| `contextMenus`  | Add "Block this site" right-click option | Quick access to blocking functionality         |
| `alarms`        | Clean up expired bypasses                | Remove old temporary bypasses automatically    |
| `notifications` | Show blocking confirmation               | Notify when sites are blocked via context menu |
| `<all_urls>`    | Access all websites                      | Monitor and block any domain you specify       |

### Permission Transparency

- **No data collection**: We don't collect or transmit your browsing data
- **Local storage only**: All settings stored locally on your device
- **Minimal scope**: Permissions used only for stated functionality
- **Open source**: All code is available for review

## 🛡️ Privacy

### Data Handling

**What we DON'T do**:

- ❌ Collect your browsing history
- ❌ Send data to external servers
- ❌ Track your web activity
- ❌ Share information with third parties
- ❌ Store personal information

**What we DO**:

- ✅ Store blocked domains locally on your device
- ✅ Store temporary bypass settings locally
- ✅ Process web requests only to check against your blocked list
- ✅ Operate entirely offline after installation

### Data Storage

- **Location**: Chrome's local storage on your device
- **Contents**: Only domains you choose to block and bypass settings
- **Retention**: Until you remove the extension or clear the data
- **Access**: Only accessible by this extension on your device

### Network Activity

- **No external requests**: Extension works entirely offline
- **No analytics**: No usage tracking or reporting
- **No updates sent**: Your settings never leave your device

### Compliance

- **GDPR compliant**: No personal data processing
- **Chrome Web Store policy compliant**: Minimal permissions, clear purpose
- **Open source**: Full transparency in code and functionality

## 🔧 Technical Details

### Architecture

- **Manifest V3**: Modern Chrome extension architecture
- **Service Worker**: Background processing for efficient resource usage
- **Content Scripts**: Minimal injection only for confirmation dialog
- **Local Storage**: Chrome's extension storage API for persistence

### Browser Support

- **Chrome**: Version 88+ (Manifest V3 support)
- **Chromium-based browsers**: Edge, Brave, Opera (with Manifest V3)

### Performance

- **Memory usage**: < 5MB typical usage
- **CPU impact**: Minimal, only processes main frame requests
- **Storage**: < 1MB for typical usage (thousands of domains)

## 🤝 Contributing

We welcome contributions! Please read our contributing guidelines:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make changes and test thoroughly**
4. **Run code quality checks**: `npm run validate`
5. **Commit changes**: `git commit -m 'Add amazing feature'`
6. **Push to branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Development Guidelines

- Follow existing code style (ESLint + Prettier configured)
- Write clear commit messages
- Test changes thoroughly with different sites
- Update documentation for new features
- Ensure all permissions are justified and documented

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Troubleshooting

**Extension not blocking sites?**

- Check if the domain is correctly added
- Verify the extension is enabled
- Check for active bypasses in the popup

**Popup not opening?**

- Disable and re-enable the extension
- Check Chrome's extension management page for errors

**Need help?**

- Check the debug console using `debug_bypasses.js`
- Review browser console for errors
- Open an issue on GitHub with detailed information

### Reporting Issues

When reporting bugs, please include:

- Chrome version
- Extension version
- Steps to reproduce
- Expected vs actual behavior
- Console errors (if any)
