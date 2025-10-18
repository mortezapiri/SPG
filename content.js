// Secure Paste Guard - Content Script
// Intercepts paste events and replaces sensitive data with mock data

(function() {
  'use strict';

  // Pattern detection functions
  const patterns = {
    // Password patterns - common characteristics:
    // - Mix of uppercase, lowercase, numbers, special chars
    // - Length typically 8-64 characters
    // - Common password formats
    password: [
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, // Strong password
      /^[A-Za-z\d@$!%*?&_\-#]{8,64}$/, // General password format
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/, // Password with mixed case and numbers
    ],
    
    // IP address patterns
    ipv4: /^(\d{1,3}\.){3}\d{1,3}$/,
    ipv6: /^([0-9a-fA-F]{0,4}:){7}[0-9a-fA-F]{0,4}$/,
    ipv4WithPort: /^(\d{1,3}\.){3}\d{1,3}:\d{1,5}$/,
  };

  // Mock data generators
  function generateMockPassword() {
    const mockPasswords = [
      'MockPass123!',
      'TestData456@',
      'SamplePwd789#',
      'DemoSecret$99',
      'FakeAuth2024!',
      'MockCred#456',
      'TestPass@789',
      'DummyKey!2024'
    ];
    return mockPasswords[Math.floor(Math.random() * mockPasswords.length)];
  }

  function generateMockIP(format) {
    if (format === 'ipv4') {
      return `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
    } else if (format === 'ipv4WithPort') {
      const port = Math.floor(Math.random() * 65535);
      return `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}:${port}`;
    } else if (format === 'ipv6') {
      const segments = Array(8).fill(0).map(() => 
        Math.floor(Math.random() * 65536).toString(16)
      );
      return segments.join(':');
    }
    return '192.168.1.100';
  }

  // Validate IPv4 address
  function isValidIPv4(ip) {
    const parts = ip.split('.');
    if (parts.length !== 4) return false;
    return parts.every(part => {
      const num = parseInt(part, 10);
      return num >= 0 && num <= 255;
    });
  }

  // Validate IPv4 with port
  function isValidIPv4WithPort(ip) {
    const [address, port] = ip.split(':');
    if (!port) return false;
    const portNum = parseInt(port, 10);
    return isValidIPv4(address) && portNum >= 1 && portNum <= 65535;
  }

  // Detect content type (for single-value detection)
  function detectContentType(text) {
    // Trim whitespace for accurate detection
    text = text.trim();
    
    // Check for IP addresses first (more specific)
    if (patterns.ipv4WithPort.test(text) && isValidIPv4WithPort(text)) {
      return { type: 'ip', format: 'ipv4WithPort' };
    }
    
    if (patterns.ipv4.test(text) && isValidIPv4(text)) {
      return { type: 'ip', format: 'ipv4' };
    }
    
    if (patterns.ipv6.test(text)) {
      return { type: 'ip', format: 'ipv6' };
    }
    
    // Check for password patterns
    for (const pattern of patterns.password) {
      if (pattern.test(text)) {
        return { type: 'password' };
      }
    }
    
    return { type: 'unknown' };
  }

  // Find and replace all sensitive data within text
  function replaceSensitiveDataInText(text) {
    console.log('[Secure Paste Guard] Scanning text for sensitive data...');
    console.log('[Secure Paste Guard] Settings - IP Protection:', settingsCache.ipProtection, 'Password Protection:', settingsCache.passwordProtection);
    
    let modifiedText = text;
    let foundCount = 0;
    let types = { passwords: 0, ips: 0 };
    
    // Only replace IPs if protection is enabled
    if (settingsCache.ipProtection) {
      console.log('[Secure Paste Guard] Scanning for IPs...');
      // Replace IPv4 with ports first (more specific pattern)
      const ipv4PortRegex = /\b(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}):(\d{1,5})\b/g;
      modifiedText = modifiedText.replace(ipv4PortRegex, (match) => {
        const [ip, port] = match.split(':');
        if (isValidIPv4(ip) && parseInt(port, 10) >= 1 && parseInt(port, 10) <= 65535) {
          types.ips++;
          foundCount++;
          const mockIP = generateMockIP('ipv4WithPort');
          console.log(`[Secure Paste Guard] Replaced IP with port: ${match} → ${mockIP}`);
          return mockIP;
        }
        return match;
      });
      
      // Replace IPv4 with CIDR notation (e.g., 192.168.1.0/24)
      const ipv4CIDRRegex = /\b(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\/(\d{1,2})\b/g;
      modifiedText = modifiedText.replace(ipv4CIDRRegex, (match, ip, cidr) => {
        if (isValidIPv4(ip) && parseInt(cidr, 10) >= 0 && parseInt(cidr, 10) <= 32) {
          types.ips++;
          foundCount++;
          const mockIP = generateMockIP('ipv4');
          const mockCIDR = `${mockIP}/${cidr}`;
          console.log(`[Secure Paste Guard] Replaced IPv4 CIDR: ${match} → ${mockCIDR}`);
          return mockCIDR;
        }
        return match;
      });
      
      // Replace plain IPv4 addresses (not followed by port or CIDR)
      const ipv4Regex = /\b(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(?![:/])\b/g;
      modifiedText = modifiedText.replace(ipv4Regex, (match) => {
        if (isValidIPv4(match)) {
          types.ips++;
          foundCount++;
          const mockIP = generateMockIP('ipv4');
          console.log(`[Secure Paste Guard] Replaced IPv4: ${match} → ${mockIP}`);
          return mockIP;
        }
        return match;
      });
      
      // Replace IPv6 with CIDR notation (e.g., 2001:db8::/32, fd00:1234:5678::/48)
      // Matches IPv6 with :: compression and CIDR
      const ipv6CIDRRegex = /\b([0-9a-fA-F]{0,4}:){1,7}:?[0-9a-fA-F]{0,4}\/\d{1,3}\b/g;
      modifiedText = modifiedText.replace(ipv6CIDRRegex, (match) => {
        types.ips++;
        foundCount++;
        const mockIP = generateMockIP('ipv6');
        const cidrPart = match.match(/\/\d{1,3}$/)[0];
        const mockCIDR = `${mockIP}${cidrPart}`;
        console.log(`[Secure Paste Guard] Replaced IPv6 CIDR: ${match} → ${mockCIDR}`);
        return mockCIDR;
      });
      
      // Replace plain IPv6 addresses (including :: shorthand)
      const ipv6Regex = /\b([0-9a-fA-F]{0,4}:){2,7}:?[0-9a-fA-F]{0,4}\b/g;
      modifiedText = modifiedText.replace(ipv6Regex, (match) => {
        // Verify it has at least 2 colons (to be a valid IPv6)
        if (match.split(':').length >= 3) {
          types.ips++;
          foundCount++;
          const mockIP = generateMockIP('ipv6');
          console.log(`[Secure Paste Guard] Replaced IPv6: ${match} → ${mockIP}`);
          return mockIP;
        }
        return match;
      });
    }
    
    // Only replace passwords if protection is enabled
    if (settingsCache.passwordProtection) {
      console.log('[Secure Paste Guard] Scanning for passwords...');
      
      // Replace passwords - look for password-like strings
      // This matches: backtick-quoted passwords, standalone strong passwords
      const passwordInBackticks = /`([A-Za-z\d@$!%*?&_\-#]{8,64})`/g;
      modifiedText = modifiedText.replace(passwordInBackticks, (match, password) => {
        // Check if it matches password patterns
        for (const pattern of patterns.password) {
          if (pattern.test(password)) {
            types.passwords++;
            foundCount++;
            const mockPwd = generateMockPassword();
            console.log(`[Secure Paste Guard] Replaced password: ${password} → ${mockPwd}`);
            return `\`${mockPwd}\``;
          }
        }
        return match;
      });
      
      // Also find standalone passwords (word boundaries, strong patterns)
      // This is more aggressive - looks for password-like strings
      const standalonePasswordRegex = /\b([A-Za-z]+[!@#$%^&*()_\-+=\[\]{}|;:,.<>?][A-Za-z\d!@#$%^&*()_\-+=\[\]{}|;:,.<>?]{7,63})\b/g;
      modifiedText = modifiedText.replace(standalonePasswordRegex, (match) => {
        // Verify it matches our password criteria
        for (const pattern of patterns.password) {
          if (pattern.test(match)) {
            types.passwords++;
            foundCount++;
            const mockPwd = generateMockPassword();
            console.log(`[Secure Paste Guard] Replaced password: ${match} → ${mockPwd}`);
            return mockPwd;
          }
        }
        return match;
      });
    }
    
    console.log('[Secure Paste Guard] Scan complete. Found:', foundCount, 'items (', types.passwords, 'passwords,', types.ips, 'IPs)');
    
    return {
      text: modifiedText,
      foundCount: foundCount,
      types: types,
      modified: foundCount > 0
    };
  }


  // Settings cache
  let settingsCache = {
    passwordProtection: true,
    ipProtection: true
  };
  
  // Check if Chrome API is available
  function isChromeApiAvailable() {
    try {
      return typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;
    } catch (e) {
      return false;
    }
  }

  // Load settings from storage with error handling
  function loadSettings() {
    if (!isChromeApiAvailable()) {
      console.log('[Secure Paste Guard] Chrome API not available, using defaults');
      return;
    }
    
    try {
      chrome.storage.local.get(['passwordProtection', 'ipProtection'], function(result) {
        if (chrome.runtime.lastError) {
          console.log('[Secure Paste Guard] Error loading settings:', chrome.runtime.lastError.message);
          return;
        }
        settingsCache.passwordProtection = result.passwordProtection !== false;
        settingsCache.ipProtection = result.ipProtection !== false;
      });
    } catch (e) {
      console.log('[Secure Paste Guard] Exception loading settings:', e.message);
    }
  }
  
  loadSettings();

  // Listen for settings changes with error handling
  if (isChromeApiAvailable()) {
    try {
      chrome.storage.onChanged.addListener(function(changes, namespace) {
        if (namespace === 'local') {
          if (changes.passwordProtection) {
            settingsCache.passwordProtection = changes.passwordProtection.newValue !== false;
          }
          if (changes.ipProtection) {
            settingsCache.ipProtection = changes.ipProtection.newValue !== false;
          }
        }
      });
    } catch (e) {
      console.log('[Secure Paste Guard] Exception setting up storage listener:', e.message);
    }
  }

  // Track if we've already handled this event
  let handledEvents = new WeakSet();

  // Handle paste event
  function handlePaste(event) {
    try {
      // Prevent double-handling
      if (handledEvents.has(event)) {
        return;
      }
      
      // Get clipboard data
      const clipboardData = event.clipboardData || window.clipboardData;
      if (!clipboardData) return;
      
      const pastedText = clipboardData.getData('text/plain');
      if (!pastedText) return;
      
      console.log('[Secure Paste Guard] Paste detected, text length:', pastedText.length);
      
      // First, check if entire text is a single password or IP (simple case)
      const detection = detectContentType(pastedText);
      console.log('[Secure Paste Guard] Simple detection result:', detection.type);
      
      let shouldIntercept = false;
      let replacedText = pastedText;
      let replaceType = null;
      
      // Simple case: entire clipboard is a password or IP
      if (detection.type === 'password' && settingsCache.passwordProtection) {
        shouldIntercept = true;
        replacedText = generateMockPassword();
        replaceType = 'password';
        console.log('[Secure Paste Guard] Password detected - replacing with mock data');
      } else if (detection.type === 'ip' && settingsCache.ipProtection) {
        shouldIntercept = true;
        replacedText = generateMockIP(detection.format);
        replaceType = 'ip';
        console.log(`[Secure Paste Guard] IP address (${detection.format}) detected - replacing with mock data`);
      } 
      // Complex case: scan for sensitive data within larger text
      else {
        console.log('[Secure Paste Guard] Running full text scan...');
        const scanResult = replaceSensitiveDataInText(pastedText);
        console.log('[Secure Paste Guard] Scan result:', scanResult);
        
        if (scanResult.modified) {
          shouldIntercept = true;
          replacedText = scanResult.text;
          
          // Store scan result for statistics
          replaceType = 'multi'; // Special type for multi-replacements
          
          // Store the counts for later statistics update
          event._scanResult = scanResult;
          
          console.log(`[Secure Paste Guard] Found ${scanResult.foundCount} sensitive items: ${scanResult.types.passwords} passwords, ${scanResult.types.ips} IPs`);
        } else {
          console.log('[Secure Paste Guard] No sensitive data found in text');
        }
      }
      
      // If we should intercept, prevent default and insert mock data
      if (shouldIntercept) {
        // Mark as handled
        handledEvents.add(event);
        
        // Prevent the default paste - try multiple methods for compatibility
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        
        // Also try to set return value (old IE compatibility, but sometimes helps)
        if (event.returnValue !== undefined) {
          event.returnValue = false;
        }
        
        // Insert the mock data
        const target = event.target;
        
        if (target.isContentEditable || target.tagName === 'TEXTAREA' || 
            (target.tagName === 'INPUT' && 
             ['text', 'password', 'email', 'search', 'url'].includes(target.type))) {
          
          // Save current state BEFORE any paste happens
          const start = target.selectionStart || 0;
          const end = target.selectionEnd || 0;
          const currentValue = target.value || '';
          
          // For input and textarea elements
          if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
            // Use requestAnimationFrame to insert after the event is fully processed
            requestAnimationFrame(() => {
              // Restore the value to what it was before paste
              // This handles cases where preventDefault didn't fully work
              target.value = currentValue;
              
              // Now insert the mock data at the correct position
              const newValue = currentValue.substring(0, start) + replacedText + currentValue.substring(end);
              target.value = newValue;
              
              // Set cursor position after inserted text
              const newPosition = start + replacedText.length;
              target.setSelectionRange(newPosition, newPosition);
              
              // Trigger input event for frameworks like React/Vue
              target.dispatchEvent(new Event('input', { bubbles: true }));
              target.dispatchEvent(new Event('change', { bubbles: true }));
              
              console.log('[Secure Paste Guard] Inserted mock data:', replacedText);
            });
          } 
          // For contenteditable elements
          else if (target.isContentEditable) {
            requestAnimationFrame(() => {
              document.execCommand('insertText', false, replacedText);
              console.log('[Secure Paste Guard] Inserted mock data:', replacedText);
            });
          }
          
          // Show notification
          showNotification('Sensitive data detected and replaced with mock data');
          
          // Update statistics with error handling
          if (isChromeApiAvailable()) {
            try {
              chrome.storage.local.get(['passwordCount', 'ipCount'], function(stats) {
                if (chrome.runtime.lastError) {
                  console.log('[Secure Paste Guard] Cannot update stats:', chrome.runtime.lastError.message);
                  return;
                }
                
                const updates = {};
                
                if (replaceType === 'password') {
                  updates.passwordCount = (stats.passwordCount || 0) + 1;
                } else if (replaceType === 'ip') {
                  updates.ipCount = (stats.ipCount || 0) + 1;
                } else if (replaceType === 'multi' && event._scanResult) {
                  // Multiple replacements - add counts for both
                  if (event._scanResult.types.passwords > 0) {
                    updates.passwordCount = (stats.passwordCount || 0) + event._scanResult.types.passwords;
                  }
                  if (event._scanResult.types.ips > 0) {
                    updates.ipCount = (stats.ipCount || 0) + event._scanResult.types.ips;
                  }
                }
                
                if (Object.keys(updates).length > 0) {
                  chrome.storage.local.set(updates, function() {
                    if (chrome.runtime.lastError) {
                      console.log('[Secure Paste Guard] Error saving stats:', chrome.runtime.lastError.message);
                    }
                  });
                }
              });
            } catch (e) {
              console.log('[Secure Paste Guard] Exception updating stats:', e.message);
            }
          }
        }
      }
    } catch (error) {
      console.error('[Secure Paste Guard] Error handling paste:', error);
    }
  }

  // Show temporary notification
  function showNotification(message) {
    try {
      if (!document.body) {
        console.log('[Secure Paste Guard] Cannot show notification - body not ready');
        return;
      }
      
      const notification = document.createElement('div');
      notification.textContent = message;
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        font-weight: 500;
        animation: slideInRight 0.3s ease-out;
      `;
      
      // Add animation
      const style = document.createElement('style');
      style.textContent = `
        @keyframes slideInRight {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `;
      
      if (document.head) {
        document.head.appendChild(style);
      }
      
      document.body.appendChild(notification);
      
      // Remove after 3 seconds
      setTimeout(() => {
        if (notification.parentNode) {
          notification.style.animation = 'slideInRight 0.3s ease-out reverse';
          setTimeout(() => {
            if (notification.parentNode) {
              notification.remove();
            }
            if (style.parentNode) {
              style.remove();
            }
          }, 300);
        }
      }, 3000);
    } catch (e) {
      console.log('[Secure Paste Guard] Error showing notification:', e.message);
    }
  }

  // Fallback: Monitor for text insertions (for sites that bypass paste events)
  let lastClipboardData = null;
  let clipboardScanTimeout = null;
  
  // Store clipboard data before paste
  document.addEventListener('copy', function(e) {
    if (e.clipboardData) {
      lastClipboardData = e.clipboardData.getData('text/plain');
    }
  }, true);
  
  // Alternative approach: monitor focused element for changes after paste attempt
  document.addEventListener('paste', function(e) {
    // Store what was about to be pasted
    if (e.clipboardData) {
      lastClipboardData = e.clipboardData.getData('text/plain');
      console.log('[Secure Paste Guard] Captured clipboard data, length:', lastClipboardData.length);
      
      // Set timeout to check the target element after paste completes
      const target = e.target;
      if (target && (target.isContentEditable || target.tagName === 'TEXTAREA' || target.tagName === 'INPUT')) {
        clearTimeout(clipboardScanTimeout);
        clipboardScanTimeout = setTimeout(() => {
          scanAndReplaceInElement(target, lastClipboardData);
        }, 100); // Wait for paste to complete
      }
    }
  }, true);
  
  // Scan element content and replace if it contains the clipboard data
  function scanAndReplaceInElement(element, clipboardText) {
    if (!clipboardText || clipboardText.length < 5) return;
    
    console.log('[Secure Paste Guard] Fallback scan triggered for element:', element.tagName);
    
    // Get current content
    let currentContent = '';
    if (element.isContentEditable) {
      currentContent = element.textContent || element.innerText || '';
    } else {
      currentContent = element.value || '';
    }
    
    // Check if clipboard content was pasted
    if (currentContent.includes(clipboardText) || currentContent.length > clipboardText.length - 100) {
      console.log('[Secure Paste Guard] Detected paste in element, scanning for sensitive data...');
      
      // Scan for sensitive data
      const scanResult = replaceSensitiveDataInText(currentContent);
      
      if (scanResult.modified) {
        console.log('[Secure Paste Guard] Found sensitive data in fallback scan, replacing...');
        
        // Replace the content
        if (element.isContentEditable) {
          element.textContent = scanResult.text;
        } else {
          element.value = scanResult.text;
        }
        
        // Trigger change event
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
        
        // Show notification
        showNotification('Sensitive data detected and replaced with mock data');
        
        // Update statistics with error handling
        if (isChromeApiAvailable()) {
          try {
            chrome.storage.local.get(['passwordCount', 'ipCount'], function(stats) {
              if (chrome.runtime.lastError) {
                console.log('[Secure Paste Guard] Cannot update stats (fallback):', chrome.runtime.lastError.message);
                return;
              }
              
              const updates = {};
              if (scanResult.types.passwords > 0) {
                updates.passwordCount = (stats.passwordCount || 0) + scanResult.types.passwords;
              }
              if (scanResult.types.ips > 0) {
                updates.ipCount = (stats.ipCount || 0) + scanResult.types.ips;
              }
              if (Object.keys(updates).length > 0) {
                chrome.storage.local.set(updates, function() {
                  if (chrome.runtime.lastError) {
                    console.log('[Secure Paste Guard] Error saving stats (fallback):', chrome.runtime.lastError.message);
                  }
                });
              }
            });
          } catch (e) {
            console.log('[Secure Paste Guard] Exception updating stats (fallback):', e.message);
          }
        }
      }
    }
  }
  
  // Initialize extension
  function init() {
    // Add paste event listener to the document (capture phase - runs before target)
    // Use both capture and bubble phases for maximum coverage
    document.addEventListener('paste', handlePaste, true);  // Capture phase
    document.addEventListener('paste', handlePaste, false); // Bubble phase
    
    // Also add to window for even earlier interception
    window.addEventListener('paste', handlePaste, true);
    
    console.log('[Secure Paste Guard] Extension initialized - multiple event listeners attached');
  }

  // Run initialization when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

