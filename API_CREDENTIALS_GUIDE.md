# API Credentials Setup Guide

This guide will walk you through obtaining API credentials for each social media platform.

---

## 📘 Facebook & Instagram API Credentials

Facebook and Instagram share the same app credentials since Instagram is owned by Meta.

### Step-by-Step Instructions:

1. **Go to Meta for Developers**
   - Visit: https://developers.facebook.com/
   - Click "Get Started" or "My Apps" in the top right

2. **Create a New App**
   - Click "Create App"
   - Choose app type: **"Business"** or **"Consumer"**
   - Fill in:
     - App Name: `Social Media Auto-Poster` (or your preferred name)
     - App Contact Email: Your email
     - Business Account: Select or create one
   - Click "Create App"

3. **Add Facebook Login Product**
   - In the left sidebar, click "Add Product"
   - Find "Facebook Login" and click "Set Up"
   - Choose "Web" as the platform
   - Enter your site URL (can be `http://localhost` for testing)

4. **Add Instagram Graph API Product**
   - Click "Add Product" again
   - Find "Instagram Graph API" and click "Set Up"

5. **Configure OAuth Settings**
   - Go to "Facebook Login" → "Settings" in the left sidebar
   - Under "Valid OAuth Redirect URIs", add:
     ```
     shortposter://auth/callback
     ```
   - Click "Save Changes"

6. **Get Your Credentials**
   - Go to "Settings" → "Basic" in the left sidebar
   - You'll see:
     - **App ID** ← This is your `FACEBOOK_APP_ID`
     - **App Secret** (click "Show") ← This is your `FACEBOOK_APP_SECRET`
   - Copy these values

7. **Configure App Permissions**
   - Go to "App Review" → "Permissions and Features"
   - Request these permissions:
     - `pages_show_list`
     - `pages_read_engagement`
     - `pages_manage_posts`
     - `instagram_basic`
     - `instagram_content_publish`

8. **Switch to Live Mode** (when ready for production)
   - Toggle the switch at the top from "Development" to "Live"

### Important Notes:
- You need a **Facebook Page** to post to Facebook
- You need an **Instagram Business Account** connected to your Facebook Page for Instagram posting
- Development mode allows testing with limited accounts

---

## 🎵 TikTok API Credentials

### Step-by-Step Instructions:

1. **Go to TikTok for Developers**
   - Visit: https://developers.tiktok.com/
   - Click "Register" or "Login"
   - Sign in with your TikTok account

2. **Create a New App**
   - Click "Manage Apps" in the top navigation
   - Click "+ Create an App"
   - Fill in the **required fields**:
     - **App Name**: `Social Media Auto-Poster`
     - **Description**: `An app to auto post content to multiple social media platforms including TikTok` (26 characters minimum)
     - **Terms of Service URL**: 
       - If you have a website: `https://yourwebsite.com/terms`
       - For testing: You can use `https://example.com/terms` temporarily
     - **Privacy Policy URL**: 
       - If you have a website: `https://yourwebsite.com/privacy`
       - For testing: You can use `https://example.com/privacy` temporarily
     - **Platforms**: Check **"Desktop"** (this is important for desktop apps)
     - **Web/Desktop URL**: 
       - If you have a website: `https://yourwebsite.com`
       - For testing: You can use `http://localhost:3000` or `https://example.com`
   - Click "Create"

3. **Add Content Posting API**
   - In your app dashboard, go to "Products"
   - Find "Content Posting API" and click "Add"
   - Fill out the application form:
     - Describe how you'll use the API
     - Expected monthly volume
     - Use case details
   - Submit for review (approval may take several days)

4. **Configure OAuth Settings**
   - Go to "Settings" → "Authorization"
   - Under "Redirect URI", add:
     ```
     shortposter://auth/callback
     ```
   - Click "Save"

5. **Get Your Credentials**
   - Go to "Settings" → "Basic Info"
   - You'll see:
     - **Client Key** ← This is your `TIKTOK_CLIENT_KEY`
     - **Client Secret** (click "Show") ← This is your `TIKTOK_CLIENT_SECRET`
   - Copy these values

6. **Request Scopes**
   - In "Settings" → "Scopes", ensure you have:
     - `video.upload`
     - `video.publish`

### Important Notes:
- **TikTok API access requires approval** (can take 3-7 business days)
- **Terms of Service & Privacy Policy URLs are required** - If you don't have these:
  - Option 1: Use placeholder URLs like `https://example.com/terms` and `https://example.com/privacy` for testing
  - Option 2: Create simple pages on a free hosting service (GitHub Pages, Netlify, etc.)
  - Option 3: Use a website builder to create basic legal pages
- **Platform selection**: Make sure to check "Desktop" since this is a desktop application
- **Rate limits**: 6 videos/minute, 15 videos/day
- You must comply with TikTok's API Terms of Service

---

## ▶️ YouTube API Credentials

### Step-by-Step Instructions:

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create a New Project**
   - Click the project dropdown at the top
   - Click "New Project"
   - Enter:
     - Project Name: `Social Media Auto-Poster`
     - Organization: (optional)
   - Click "Create"

3. **Enable YouTube Data API v3**
   - In the left sidebar, go to "APIs & Services" → "Library"
   - Search for "YouTube Data API v3"
   - Click on it and click "Enable"

4. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "+ CREATE CREDENTIALS" → "OAuth client ID"
   - If prompted, configure the OAuth consent screen first:
     - User Type: Choose "External" (for testing) or "Internal" (if you have a workspace)
     - Click "Create"
     - Fill in:
       - App Name: `Social Media Auto-Poster`
       - User Support Email: Your email
       - Developer Contact Email: Your email
     - Click "Save and Continue"
     - Add scopes: Click "Add or Remove Scopes"
       - Search and add: `https://www.googleapis.com/auth/youtube.upload`
     - Click "Save and Continue"
     - Add test users (your Google account email)
     - Click "Save and Continue"

5. **Create OAuth Client ID**
   - Back in "Credentials", click "+ CREATE CREDENTIALS" → "OAuth client ID"
   - Application type: Choose "Desktop app"
   - Name: `Social Media Auto-Poster Desktop`
   - Click "Create"

6. **Configure Redirect URI**
   - Click on your newly created OAuth client
   - Under "Authorized redirect URIs", click "+ ADD URI"
   - Add:
     ```
     shortposter://auth/callback
     ```
   - Click "Save"

7. **Get Your Credentials**
   - You'll see a popup with:
     - **Client ID** ← This is your `GOOGLE_CLIENT_ID`
     - **Client Secret** ← This is your `GOOGLE_CLIENT_SECRET`
   - Copy these values
   - You can also download the JSON file for backup

### Important Notes:
- Unverified apps have a quota limit (about 6 video uploads per day)
- To increase quota, you need to verify your app (requires Google review)
- Each video upload costs approximately 1600 quota units
- Daily quota for unverified apps: 10,000 units

---

## 📷 Instagram API Credentials

Instagram uses the **same credentials as Facebook** (they're both Meta products).

### Additional Requirements:

1. **Convert to Business Account**
   - Open Instagram app on your phone
   - Go to Settings → Account
   - Tap "Switch to Professional Account"
   - Choose "Business"
   - Complete the setup

2. **Connect to Facebook Page**
   - In Instagram Settings → Account
   - Tap "Linked Accounts"
   - Select "Facebook"
   - Connect to your Facebook Page

3. **Verify Connection**
   - Go to your Facebook Page settings
   - Check "Instagram" section
   - Ensure your Instagram account is connected

### Important Notes:
- Instagram requires a **Business or Creator account**
- Must be connected to a Facebook Page
- Uses the same App ID and App Secret as Facebook
- Rate limit: 30 posts per 24 hours

---

## 🔧 Updating Your .env File

Once you have all credentials, update your `.env` file:

```env
# Facebook/Instagram API Credentials
FACEBOOK_APP_ID=123456789012345
FACEBOOK_APP_SECRET=abc123def456ghi789jkl012mno345pq

# TikTok API Credentials
TIKTOK_CLIENT_KEY=aw1234567890abcdef
TIKTOK_CLIENT_SECRET=xyz9876543210fedcba

# YouTube/Google API Credentials
GOOGLE_CLIENT_ID=123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-AbCdEfGhIjKlMnOpQrStUvWxYz

# Application Settings (keep as is)
APP_NAME=Social Media Auto-Poster
CUSTOM_URL_PROTOCOL=shortposter
NODE_ENV=development
```

---

## ⚠️ Security Best Practices

1. **Never share your credentials**
   - Don't commit `.env` to version control
   - Don't share screenshots with credentials visible
   - Don't post credentials in forums or chat

2. **Keep credentials secure**
   - Store in a password manager
   - Rotate credentials periodically
   - Revoke access if compromised

3. **Use development mode first**
   - Test with development/sandbox credentials
   - Switch to production only when ready

4. **Monitor usage**
   - Check API usage dashboards regularly
   - Set up alerts for unusual activity
   - Review connected apps periodically

---

## 🆘 Troubleshooting

### "Redirect URI mismatch" error
- Ensure `shortposter://auth/callback` is added exactly in the platform settings
- Check for typos or extra spaces
- Make sure the protocol is registered (app handles this automatically)

### "Invalid client" error
- Double-check your Client ID/App ID
- Ensure you copied the entire credential (no truncation)
- Verify the credential is for the correct app

### "Insufficient permissions" error
- Request the required scopes/permissions in the platform dashboard
- Some permissions require app review/approval
- Wait for approval before testing

### TikTok API not approved
- TikTok reviews can take 3-7 business days
- Provide detailed use case in application
- Ensure compliance with TikTok policies

---

## 📞 Support Links

- **Facebook/Instagram**: https://developers.facebook.com/support/
- **TikTok**: https://developers.tiktok.com/support
- **YouTube**: https://support.google.com/youtube/

---

**Ready to start?** Follow the guides above for each platform you want to use, then update your `.env` file and restart the application!
