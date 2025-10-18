# 🛡️ SPG - Secure Paste Guard

A Chrome extension that automatically detects and replaces passwords and IP addresses with mock data when pasting from clipboard, helping prevent accidental exposure of sensitive information.

## 🎥 Demo

![SPG Demo](video.gif)

*Watch SPG automatically detect and replace sensitive data when pasting!*

---

## ✨ Features

- **🔒 Password Detection**: Automatically detects password patterns in clipboard data
- **🌐 IP Address Detection**: Recognizes IPv4, IPv6, and IP addresses with ports
- **🎭 Smart Replacement**: Replaces sensitive data with realistic mock data
- **⚡ Real-time Protection**: Works instantly on paste events
- **🎨 Beautiful UI**: Modern, user-friendly popup interface
- **📊 Statistics Tracking**: Monitor how many replacements have been made
- **⚙️ Configurable**: Toggle protection for passwords and IPs independently

## 🎯 What Gets Protected

### Passwords
- Strong passwords with mixed case, numbers, and special characters
- Common password formats (8-64 characters)
- Patterns like: `MyP@ssw0rd123`, `Secure#2024!`

### IP Addresses
- **IPv4**: `192.168.1.1`
- **IPv4 with Port**: `192.168.1.1:8080`
- **IPv6**: `2001:0db8:85a3:0000:0000:8a2e:0370:7334`

## 📦 Installation

### Method 1: Load Unpacked Extension (For Development/Testing)

1. **Clone or download this repository**
   ```bash
   git clone https://github.com/mortezapiri/SPG.git
   cd SPG
   ```

2. **Open Chrome Extensions page**
   - Navigate to `chrome://extensions/`
   - Or click the menu (⋮) → More Tools → Extensions

3. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top right corner

4. **Load the extension**
   - Click "Load unpacked"
   - Select the `SPG` folder
   - The extension should now appear in your extensions list

5. **Pin the extension** (optional)
   - Click the puzzle piece icon in Chrome toolbar
   - Find "SPG - Secure Paste Guard"
   - Click the pin icon to keep it visible

### Method 2: Pack and Install as CRX

1. **Pack the extension**
   - Go to `chrome://extensions/`
   - Enable Developer mode
   - Click "Pack extension"
   - Select the extension root directory
   - Click "Pack Extension"

2. **Install the packed extension**
   - Drag and drop the generated `.crx` file onto `chrome://extensions/`
   - Click "Add extension" to confirm

## 🚀 Usage

1. **Automatic Protection**
   - Once installed, the extension works automatically
   - Simply copy a password or IP address
   - Try to paste it anywhere on a webpage
   - If detected, it will be replaced with mock data

2. **View Statistics**
   - Click the extension icon in your toolbar
   - See how many passwords and IPs have been replaced
   - Toggle protection on/off for different data types

3. **Example Test**
   ```
   Try copying and pasting these:
   - Password: MySecure@Pass123
   - IPv4: 192.168.1.100
   - IPv4 with port: 10.0.0.1:3000
   - IPv6: 2001:0db8:85a3:0000:0000:8a2e:0370:7334
   ```

## 🔧 Configuration

### Toggle Protection Types

1. Click the extension icon
2. Use the toggles to enable/disable:
   - **Password Protection**: ON/OFF
   - **IP Address Protection**: ON/OFF
3. Settings are saved automatically

### Customize Mock Data

Edit `content.js` to customize the mock data:

```javascript
// Change mock passwords (line ~34)
function generateMockPassword() {
  const mockPasswords = [
    'YourCustomMock123!',
    'AnotherTest456@',
    // Add more...
  ];
  return mockPasswords[Math.floor(Math.random() * mockPasswords.length)];
}

// Change mock IPs (line ~44)
function generateMockIP(format) {
  if (format === 'ipv4') {
    return `10.0.0.${Math.floor(Math.random() * 255)}`;
  }
  // Customize other formats...
}
```

## 📁 Project Structure

```
chrome-extention/
├── manifest.json          # Extension configuration
├── content.js            # Main logic (paste interception)
├── popup.html            # Extension popup UI
├── popup.js              # Popup functionality
├── generate_icons.html   # Icon generator tool
├── create_icons.js       # Icon placeholder creator
├── create_icons.py       # Alternative Python icon creator
├── icons/
│   ├── icon16.png       # 16x16 icon
│   ├── icon48.png       # 48x48 icon
│   └── icon128.png      # 128x128 icon
└── README.md            # This file
```

## 🛠️ Development

### Modify Detection Patterns

Edit the `patterns` object in `content.js`:

```javascript
const patterns = {
  password: [
    /your-custom-regex-here/,
    // Add more patterns
  ],
  ipv4: /^(\d{1,3}\.){3}\d{1,3}$/,
  // Add custom patterns
};
```

### Debug the Extension

1. Open Chrome DevTools (F12)
2. Check the Console tab for logs:
   - `[Secure Paste Guard] Extension initialized`
   - `[Secure Paste Guard] Password detected - replacing with mock data`
   - `[Secure Paste Guard] IP address detected - replacing with mock data`

### Test Changes

1. Make your changes to the code
2. Go to `chrome://extensions/`
3. Click the reload icon (↻) on the extension card
4. Test the new functionality

## 🔍 Troubleshooting

### Extension not working?

1. **Check if enabled**: Go to `chrome://extensions/` and ensure it's enabled
2. **Reload the extension**: Click the reload icon
3. **Check permissions**: Ensure clipboard and activeTab permissions are granted
4. **Check console**: Open DevTools and look for error messages

### Paste not being intercepted?

1. **Verify detection**: Check if your data matches the patterns
2. **Check toggles**: Ensure protection is enabled in the popup
3. **Try different sites**: Some sites may prevent paste events
4. **Check console logs**: Look for detection messages

### Icons not showing?

1. Open `generate_icons.html` in a browser
2. Click "Generate All Icons"
3. Save the downloaded files to `icons/` folder
4. Reload the extension

## 🔐 Privacy & Security

- **No data collection**: This extension does not collect or send any data
- **Local processing**: All detection and replacement happens locally
- **No external requests**: No network calls are made
- **Open source**: Review the code to verify security

## 📝 Technical Details

### Manifest V3

This extension uses Manifest V3, the latest Chrome extension platform with:
- Enhanced security
- Improved privacy
- Better performance

### Detection Algorithm

1. Intercepts `paste` events using content script
2. Reads clipboard data via `clipboardData` API
3. Applies regex patterns to detect sensitive data
4. Generates appropriate mock data
5. Injects mock data into the target field
6. Shows notification to user

### Supported Input Types

- `<input type="text">`
- `<input type="password">`
- `<input type="email">`
- `<input type="search">`
- `<input type="url">`
- `<textarea>`
- ContentEditable elements

## 🤝 Contributing

Feel free to submit issues, fork the repository, and create pull requests for any improvements.

### Ideas for Enhancement

- Add more pattern types (credit cards, SSNs, etc.)
- Whitelist/blacklist specific websites
- Custom mock data templates
- Export/import settings
- Keyboard shortcut configuration
- Pattern learning based on user feedback

## 📄 License

MIT License - feel free to use and modify as needed.

## 🙏 Acknowledgments

Built with modern web technologies and Chrome Extension APIs.

## 📮 Support

If you encounter any issues or have suggestions:
1. Check the Troubleshooting section
2. Review the console logs
3. Open an issue on GitHub

---

**Version**: 1.0.0  
**Last Updated**: October 2025  
**Compatibility**: Chrome 88+, Edge 88+, and other Chromium-based browsers

