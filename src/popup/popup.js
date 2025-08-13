/**
 * Popup script for Site Blocker extension
 * Handles UI interactions and communicates with background service worker
 */

// DOM elements
const elements = {
  blockCurrentSite: document.getElementById('blockCurrentSite'),
  currentSiteInfo: document.getElementById('currentSiteInfo'),
  bypassStatus: document.getElementById('bypassStatus'),
  bypassTimeRemaining: document.getElementById('bypassTimeRemaining'),
  domainInput: document.getElementById('domainInput'),
  addDomainBtn: document.getElementById('addDomainBtn'),
  domainsList: document.getElementById('domainsList'),
  emptyState: document.getElementById('emptyState'),
  loading: document.getElementById('loading'),
  errorMessage: document.getElementById('errorMessage'),
  errorText: document.querySelector('.error-text')
};

// Application state
let currentTabInfo = null;
let blockedDomains = new Set();

/**
 * Initialize the popup
 */
async function init() {
  try {
    showLoading(true);

    // Load initial data
    await Promise.all([loadCurrentTabInfo(), loadBlockedDomains()]);

    // Set up event listeners
    setupEventListeners();

    // Initial render
    renderUI();

    // Check for active bypasses
    await checkBypassStatus();

    showLoading(false);
  } catch (error) {
    console.error('Error initializing popup:', error);
    showError('Failed to initialize. Please try reopening the popup.');
    showLoading(false);
  }
}

/**
 * Set up event listeners for UI interactions
 */
function setupEventListeners() {
  // Block current site button
  elements.blockCurrentSite.addEventListener('click', handleBlockCurrentSite);

  // Add domain button
  elements.addDomainBtn.addEventListener('click', handleAddDomain);

  // Enter key in domain input
  elements.domainInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') {
      handleAddDomain();
    }
  });

  // Input validation
  elements.domainInput.addEventListener('input', handleDomainInputChange);

  // Close error message when clicking anywhere
  elements.errorMessage.addEventListener('click', () => hideError());
}

/**
 * Load current tab information
 */
async function loadCurrentTabInfo() {
  try {
    // First try to get the current tab using chrome.tabs API
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });

    if (tabs.length > 0 && tabs[0].url) {
      const url = new URL(tabs[0].url);

      // Make sure it's a web URL
      if (url.protocol === 'http:' || url.protocol === 'https:') {
        // Get the normalized domain from background script
        const response = await sendMessage('getCurrentTabDomain');
        if (response.success) {
          currentTabInfo = {
            domain: response.data.domain,
            fullDomain: response.data.fullDomain,
            url: tabs[0].url
          };
        }
      }
    }
  } catch (error) {
    console.error('Error loading current tab info:', error);
    currentTabInfo = null;
  }
}

/**
 * Load blocked domains from storage
 */
async function loadBlockedDomains() {
  try {
    const response = await sendMessage('getBlockedDomains');
    if (response.success) {
      blockedDomains = new Set(response.data);
    }
  } catch (error) {
    console.error('Error loading blocked domains:', error);
    throw error;
  }
}

/**
 * Handle blocking the current site
 */
async function handleBlockCurrentSite() {
  if (!currentTabInfo) {
    showError('Unable to get current tab information.');
    return;
  }

  try {
    setButtonLoading(elements.blockCurrentSite, true);

    await sendMessage('addBlockedDomain', { domain: currentTabInfo.domain });

    // Update local state
    blockedDomains.add(currentTabInfo.domain);

    // Re-render UI
    renderUI();

    // Show success feedback
    elements.currentSiteInfo.textContent = `✓ ${currentTabInfo.domain} blocked`;
    elements.currentSiteInfo.className = 'site-info current-domain';

    hideError();
  } catch (error) {
    console.error('Error blocking current site:', error);
    showError(`Failed to block ${currentTabInfo.domain}: ${error.message}`);
  } finally {
    setButtonLoading(elements.blockCurrentSite, false);
  }
}

/**
 * Handle adding a domain manually
 */
async function handleAddDomain() {
  const domain = elements.domainInput.value.trim();

  if (!domain) {
    showError('Please enter a domain to block.');
    elements.domainInput.focus();
    return;
  }

  if (!isValidDomain(domain)) {
    showError('Please enter a valid domain (e.g., example.com).');
    elements.domainInput.focus();
    return;
  }

  if (blockedDomains.has(domain.toLowerCase())) {
    showError(`${domain} is already blocked.`);
    elements.domainInput.focus();
    return;
  }

  try {
    setButtonLoading(elements.addDomainBtn, true);

    await sendMessage('addBlockedDomain', { domain: domain.toLowerCase() });

    // Update local state
    blockedDomains.add(domain.toLowerCase());

    // Clear input and re-render
    elements.domainInput.value = '';
    renderUI();

    hideError();
  } catch (error) {
    console.error('Error adding domain:', error);
    showError(`Failed to block ${domain}: ${error.message}`);
  } finally {
    setButtonLoading(elements.addDomainBtn, false);
    elements.domainInput.focus();
  }
}

/**
 * Handle removing a blocked domain
 */
async function handleRemoveDomain(domain) {
  try {
    await sendMessage('removeBlockedDomain', { domain });

    // Update local state
    blockedDomains.delete(domain);

    // Re-render UI
    renderUI();

    hideError();
  } catch (error) {
    console.error('Error removing domain:', error);
    showError(`Failed to unblock ${domain}: ${error.message}`);
  }
}

/**
 * Handle domain input changes for validation
 */
function handleDomainInputChange() {
  const domain = elements.domainInput.value.trim();

  // Enable/disable add button based on input validity
  if (
    domain &&
    isValidDomain(domain) &&
    !blockedDomains.has(domain.toLowerCase())
  ) {
    elements.addDomainBtn.disabled = false;
  } else {
    elements.addDomainBtn.disabled = true;
  }
}

/**
 * Render the entire UI
 */
function renderUI() {
  renderCurrentSiteSection();
  renderDomainsList();
  renderEmptyState();
}

/**
 * Render the current site section
 */
function renderCurrentSiteSection() {
  if (!currentTabInfo) {
    elements.blockCurrentSite.disabled = true;
    elements.blockCurrentSite.textContent = 'Block Current Site';
    elements.currentSiteInfo.textContent = 'Not available for this page';
    elements.currentSiteInfo.className = 'site-info error';
    return;
  }

  const isAlreadyBlocked = blockedDomains.has(currentTabInfo.domain);

  if (isAlreadyBlocked) {
    elements.blockCurrentSite.disabled = true;
    elements.blockCurrentSite.textContent = 'Already Blocked';
    elements.currentSiteInfo.textContent = `${currentTabInfo.domain} is already blocked`;
    elements.currentSiteInfo.className = 'site-info current-domain';
  } else {
    elements.blockCurrentSite.disabled = false;
    elements.blockCurrentSite.textContent = 'Block Current Site';
    elements.currentSiteInfo.textContent = `Will block: ${currentTabInfo.domain}`;
    elements.currentSiteInfo.className = 'site-info';
  }
}

/**
 * Render the blocked domains list
 */
function renderDomainsList() {
  // Clear existing list
  elements.domainsList.innerHTML = '';

  // Sort domains alphabetically
  const sortedDomains = Array.from(blockedDomains).sort();

  // Create list items
  sortedDomains.forEach(domain => {
    const listItem = createDomainListItem(domain);
    elements.domainsList.appendChild(listItem);
  });
}

/**
 * Create a domain list item element
 */
function createDomainListItem(domain) {
  const li = document.createElement('li');
  li.className = 'domain-item';

  const domainSpan = document.createElement('span');
  domainSpan.className = 'domain-name';
  domainSpan.textContent = domain;

  const removeBtn = document.createElement('button');
  removeBtn.className = 'remove-btn';
  removeBtn.innerHTML = '✕';
  removeBtn.title = `Remove ${domain}`;
  removeBtn.setAttribute('aria-label', `Remove ${domain} from blocked list`);

  // Add click handler for remove button
  removeBtn.addEventListener('click', e => {
    e.preventDefault();
    handleRemoveDomain(domain);
  });

  li.appendChild(domainSpan);
  li.appendChild(removeBtn);

  return li;
}

/**
 * Render empty state
 */
function renderEmptyState() {
  if (blockedDomains.size === 0) {
    elements.emptyState.style.display = 'block';
    elements.domainsList.style.display = 'none';
  } else {
    elements.emptyState.style.display = 'none';
    elements.domainsList.style.display = 'block';
  }
}

/**
 * Send message to background script
 */
async function sendMessage(action, data = null) {
  return new Promise((resolve, reject) => {
    const message = { action, data };

    chrome.runtime.sendMessage(message, response => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }

      if (!response) {
        reject(new Error('No response from background script'));
        return;
      }

      if (!response.success) {
        reject(new Error(response.error || 'Unknown error'));
        return;
      }

      resolve(response);
    });
  });
}

/**
 * Show/hide loading indicator
 */
function showLoading(show) {
  elements.loading.style.display = show ? 'flex' : 'none';

  // Disable all interactive elements while loading
  const interactiveElements = [
    elements.blockCurrentSite,
    elements.addDomainBtn,
    elements.domainInput
  ];

  interactiveElements.forEach(el => {
    if (el) {
      el.disabled = show;
    }
  });
}

/**
 * Set button loading state
 */
function setButtonLoading(button, loading) {
  if (loading) {
    button.disabled = true;
    button.dataset.originalText = button.textContent;
    button.textContent = 'Loading...';
  } else {
    button.disabled = false;
    button.textContent = button.dataset.originalText || button.textContent;
  }
}

/**
 * Show error message
 */
function showError(message) {
  elements.errorText.textContent = message;
  elements.errorMessage.style.display = 'flex';

  // Auto-hide after 5 seconds
  setTimeout(() => {
    hideError();
  }, 5000);
}

/**
 * Hide error message
 */
function hideError() {
  elements.errorMessage.style.display = 'none';
}

/**
 * Check and display bypass status for current site
 */
async function checkBypassStatus() {
  if (!currentTabInfo) {
    hideBypassStatus();
    return;
  }

  try {
    const response = await sendMessage('getRemainingBypassTime', {
      domain: currentTabInfo.domain
    });

    if (response.success && response.data > 0) {
      showBypassStatus(response.data);
    } else {
      hideBypassStatus();
    }
  } catch (error) {
    console.error('Error checking bypass status:', error);
    hideBypassStatus();
  }
}

/**
 * Show bypass status with remaining time
 */
function showBypassStatus(remainingTimeMs) {
  const minutes = Math.ceil(remainingTimeMs / (60 * 1000));
  const timeText = minutes === 1 ? '1 minute' : `${minutes} minutes`;

  elements.bypassTimeRemaining.textContent = `${timeText} remaining`;
  elements.bypassStatus.style.display = 'block';

  // Update every minute
  setTimeout(() => {
    checkBypassStatus();
  }, 60000);
}

/**
 * Hide bypass status
 */
function hideBypassStatus() {
  elements.bypassStatus.style.display = 'none';
}

/**
 * Validate domain format
 */
function isValidDomain(domain) {
  // Basic domain validation regex
  const domainRegex =
    /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  // Check basic format
  if (!domainRegex.test(domain)) {
    return false;
  }

  // Additional checks
  if (domain.length > 253) {
    return false;
  }

  if (domain.startsWith('.') || domain.endsWith('.')) {
    return false;
  }

  if (domain.includes('..')) {
    return false;
  }

  return true;
}

/**
 * Handle storage changes to keep UI in sync
 */
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.blockedDomains) {
    blockedDomains = new Set(changes.blockedDomains.newValue || []);
    renderUI();
  }
});

// Initialize popup when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
