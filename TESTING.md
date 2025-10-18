# Testing Instructions

## 🔄 After Code Changes - Always Do This:

1. **Reload the Extension:**
   - Go to `chrome://extensions/`
   - Find "Secure Paste Guard"
   - Click the reload button (↻)

2. **Refresh Test Page:**
   - Go back to the test page
   - Press F5 to refresh

3. **Open Console:**
   - Press F12 to open DevTools
   - Go to Console tab

## ✅ Test Steps:

### Test 1: Password Detection
1. On test page, click `MySecure@Pass123` to copy it
2. Paste into "Text Input" field
3. **Expected:** Should show only mock password like `TestPass@789`
4. **Check console:** Should see `[Secure Paste Guard] Password detected`

### Test 2: IP Address Detection
1. Click `192.168.1.1` to copy it
2. Paste into "Text Input" field  
3. **Expected:** Should show only mock IP like `192.168.55.123`
4. **Check console:** Should see `[Secure Paste Guard] IP address detected`

### Test 3: IP with Port
1. Click `192.168.1.1:8080` to copy it
2. Paste into "Text Input" field
3. **Expected:** Should show only mock IP with port like `192.168.99.88:45123`

## 🐛 If Still Not Working:

### Check Console Logs:
You should see these messages in order:
```
[Secure Paste Guard] Extension initialized
[Secure Paste Guard] Password detected - replacing with mock data
[Secure Paste Guard] Inserted mock data: TestPass@789
```

### If you see the original text + mock data together:
- The preventDefault() might not be working
- Try pasting in a different website (like google.com search box)
- Some sites have their own paste handlers that might interfere

### If nothing happens at all:
- Extension might not be loaded - check chrome://extensions/
- Page might need refresh
- Check if toggles are enabled in extension popup

### If console shows errors:
- Copy the error message and check what's failing
- Make sure manifest permissions are correct

## 🎯 Quick Test Sites:

Try pasting on these sites to verify:
- Google.com (search box)
- Gmail.com (compose email)
- Any text area on GitHub
- The included test.html page

