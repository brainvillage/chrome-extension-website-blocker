// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {
  const urlDisplay = document.getElementById('urlDisplay');
  const closeTabBtn = document.getElementById('closeTabBtn');
  const bypassBtn = document.getElementById('bypassBtn');
  const bypassDuration = document.getElementById('bypassDuration');

  let originalUrl = '';

  // Function to sanitize and extract URL from query parameters
  function getOriginalUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const url = urlParams.get('url');

    if (!url) {
      return 'Unknown URL';
    }

    try {
      // Sanitize the URL by creating a URL object
      const sanitizedUrl = new URL(decodeURIComponent(url));
      return sanitizedUrl.href;
    } catch (error) {
      console.error('Invalid URL provided:', url);
      // Return a sanitized version by escaping HTML characters
      return escapeHtml(decodeURIComponent(url));
    }
  }

  // Function to escape HTML characters for safe display
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Function to extract domain from URL for storage key
  function getDomainFromUrl(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch (error) {
      return url; // fallback to original if parsing fails
    }
  }

  // Initialize the page
  function init() {
    originalUrl = getOriginalUrl();
    urlDisplay.textContent = originalUrl;
    urlDisplay.classList.remove('loading');
  }

  // Handle "Close Tab" button click
  closeTabBtn.addEventListener('click', function () {
    // Try to use Chrome extension API to close tab
    if (chrome && chrome.tabs && chrome.tabs.getCurrent) {
      chrome.tabs.getCurrent(function (tab) {
        if (tab && chrome.tabs.remove) {
          chrome.tabs.remove(tab.id);
        } else {
          // Fallback: try to close window
          window.close();
        }
      });
    } else {
      // Fallback: try to close window or go back
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.close();
      }
    }
  });

  // Handle "Bypass" button click
  bypassBtn.addEventListener('click', function () {
    const minutes = parseInt(bypassDuration.value);
    const domain = getDomainFromUrl(originalUrl);

    if (!domain || domain === 'Unknown URL') {
      alert('Cannot create bypass for invalid URL');
      return;
    }

    // Calculate expiry time
    const expiryTime = Date.now() + minutes * 60 * 1000;

    // Send message to background to store bypass
    if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage(
        {
          action: 'addBypass',
          data: {
            domain: domain,
            duration: minutes
          }
        },
        function (response) {
          if (chrome.runtime.lastError) {
            console.error(
              'Error communicating with background:',
              chrome.runtime.lastError
            );
            alert('Failed to create bypass. Please try again.');
            return;
          }

          if (response && response.success) {
            console.log(
              'Bypass created for',
              domain,
              'for',
              minutes,
              'minutes'
            );
            // Redirect to the original URL
            window.location.href = originalUrl;
          } else {
            console.error(
              'Error creating bypass:',
              response?.error || 'Unknown error'
            );
            alert('Failed to create bypass. Please try again.');
          }
        }
      );
    } else {
      // Fallback: use localStorage for testing
      const bypasses = JSON.parse(
        localStorage.getItem('temporaryBypasses') || '{}'
      );
      const bypassData = {
        domain: domain,
        expiryTime: expiryTime,
        createdAt: Date.now()
      };
      bypasses[domain] = bypassData;
      localStorage.setItem('temporaryBypasses', JSON.stringify(bypasses));

      console.log(
        'Bypass created (localStorage fallback) for',
        domain,
        'for',
        minutes,
        'minutes'
      );
      window.location.href = originalUrl;
    }
  });

  // Add keyboard shortcuts
  document.addEventListener('keydown', function (event) {
    // Escape key to close tab
    if (event.key === 'Escape') {
      closeTabBtn.click();
    }
  });

  // Initialize the page when DOM is ready
  init();

  // Add some visual feedback when buttons are clicked
  const buttons = document.querySelectorAll('.btn');
  buttons.forEach(button => {
    button.addEventListener('click', function () {
      this.style.transform = 'translateY(1px)';
      setTimeout(() => {
        this.style.transform = '';
      }, 150);
    });
  });
});
