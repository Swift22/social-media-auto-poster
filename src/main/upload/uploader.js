const fs = require('fs');
const path = require('path');
const FacebookUploader = require('./facebook-uploader');
const TikTokUploader = require('./tiktok-uploader');
const YouTubeUploader = require('./youtube-uploader');
const InstagramUploader = require('./instagram-uploader');

class Uploader {
  constructor(credentialStore) {
    this.credentialStore = credentialStore;
    this.uploaders = {
      facebook: new FacebookUploader(credentialStore),
      tiktok: new TikTokUploader(credentialStore),
      youtube: new YouTubeUploader(credentialStore),
      instagram: new InstagramUploader(credentialStore)
    };
  }

  /**
   * Upload video to multiple platforms
   */
  async uploadToMultiplePlatforms(filePath, metadata, platforms) {
    const results = {};

    // Validate file exists
    if (!fs.existsSync(filePath)) {
      throw new Error('Video file not found');
    }

    // Validate file size and format
    const stats = fs.statSync(filePath);
    const fileSizeMB = stats.size / (1024 * 1024);
    
    if (fileSizeMB > 100) {
      throw new Error('File size exceeds 100MB limit');
    }

    const ext = path.extname(filePath).toLowerCase();
    if (!['.mp4', '.mov'].includes(ext)) {
      throw new Error('Only MP4 and MOV files are supported');
    }

    // Upload to each selected platform sequentially
    for (const platform of platforms) {
      if (!this.uploaders[platform]) {
        results[platform] = {
          success: false,
          error: `Unknown platform: ${platform}`
        };
        continue;
      }

      try {
        console.log(`Uploading to ${platform}...`);
        const result = await this.uploaders[platform].upload(filePath, metadata);
        results[platform] = {
          success: true,
          ...result
        };
      } catch (error) {
        console.error(`${platform} upload failed:`, error);
        results[platform] = {
          success: false,
          error: error.message
        };
      }

      // Add delay between uploads to respect rate limits
      await this.delay(2000);
    }

    return results;
  }

  /**
   * Delay helper
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = Uploader;
