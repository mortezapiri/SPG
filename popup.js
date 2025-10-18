// Popup script for Secure Paste Guard

document.addEventListener('DOMContentLoaded', function() {
  // Load saved settings
  chrome.storage.local.get(['passwordProtection', 'ipProtection', 'passwordCount', 'ipCount'], function(result) {
    // Set toggle states
    document.getElementById('toggle-password').checked = result.passwordProtection !== false;
    document.getElementById('toggle-ip').checked = result.ipProtection !== false;
    
    // Update statistics
    updateStats(result.passwordCount || 0, result.ipCount || 0);
  });

  // Toggle event listeners
  document.getElementById('toggle-password').addEventListener('change', function(e) {
    chrome.storage.local.set({ passwordProtection: e.target.checked });
  });

  document.getElementById('toggle-ip').addEventListener('change', function(e) {
    chrome.storage.local.set({ ipProtection: e.target.checked });
  });

  // Listen for statistics updates
  chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (namespace === 'local') {
      if (changes.passwordCount || changes.ipCount) {
        chrome.storage.local.get(['passwordCount', 'ipCount'], function(result) {
          updateStats(result.passwordCount || 0, result.ipCount || 0);
        });
      }
    }
  });
});

function updateStats(passwordCount, ipCount) {
  document.getElementById('password-count').textContent = passwordCount;
  document.getElementById('ip-count').textContent = ipCount;
  document.getElementById('total-count').textContent = passwordCount + ipCount;
}

