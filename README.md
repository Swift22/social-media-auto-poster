# Social Media Auto-Poster

A Windows desktop application for posting short videos to Facebook, TikTok, YouTube, and Instagram with unified tagging and secure OAuth authentication.

## Features

- 🔐 Secure OAuth 2.0 authentication for all platforms
- 📹 Support for Facebook, TikTok, YouTube, and Instagram
- 🏷️ Unified title and tag management
- 🔒 Encrypted credential storage
- 📊 Upload progress tracking
- ♻️ Automatic token refresh

## Prerequisites

Before using this application, you need to register developer applications with each platform:

- **Facebook/Instagram**: [Meta for Developers](https://developers.facebook.com/)
- **TikTok**: [TikTok for Developers](https://developers.tiktok.com/)
- **YouTube**: [Google Cloud Console](https://console.cloud.google.com/)

## Setup

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and fill in your API credentials
4. Run the application:
   ```bash
   npm start
   ```

## Building

To build the application for Windows:

```bash
npm run build
```

## Platform Requirements

### Video Specifications
- **Format**: MP4 or MOV
- **Resolution**: 1080x1920 (9:16 aspect ratio recommended)
- **Duration**: Max 90 seconds (varies by platform)
- **File Size**: Max 100MB
- **Codec**: H.264/HEVC video, AAC audio

### Platform-Specific Limits
- **TikTok**: 6 videos/minute, max 15 videos/day
- **YouTube**: Quota-based (1 video ≈ 16% daily quota)
- **Instagram**: Requires Business/Creator account, max 30 posts/24 hours
- **Facebook**: Videos posted as Reels

## Security

- All OAuth tokens are encrypted and stored locally
- Client secrets are never exposed in client-side code
- PKCE implementation for enhanced OAuth security
- Automatic token refresh to maintain access

## License

ISC
