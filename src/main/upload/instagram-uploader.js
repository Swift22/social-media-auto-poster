const axios = require('axios');
const fs = require('fs');

class InstagramUploader {
  constructor(credentialStore) {
    this.credentialStore = credentialStore;
  }

  /**
   * Upload video to Instagram (as Reel)
   */
  async upload(filePath, metadata) {
    const credentials = this.credentialStore.getCredentials('instagram');
    
    if (!credentials || !credentials.accounts || credentials.accounts.length === 0) {
      throw new Error('No Instagram Business Account found');
    }

    // Use the first Instagram account (or implement account selection)
    const account = credentials.accounts[0];
    const instagramAccountId = account.instagramAccountId;
    const pageAccessToken = account.pageAccessToken;

    try {
      // Step 1: Create media container for Reel
      const videoUrl = await this.uploadToTemporaryStorage(filePath);
      
      const containerResponse = await axios.post(
        `https://graph.facebook.com/v18.0/${instagramAccountId}/media`,
        {
          media_type: 'REELS',
          video_url: videoUrl,
          caption: this.formatCaption(metadata),
          access_token: pageAccessToken
        }
      );

      const creationId = containerResponse.data.id;

      // Step 2: Wait for video processing
      await this.waitForProcessing(instagramAccountId, creationId, pageAccessToken);

      // Step 3: Publish the Reel
      const publishResponse = await axios.post(
        `https://graph.facebook.com/v18.0/${instagramAccountId}/media_publish`,
        {
          creation_id: creationId,
          access_token: pageAccessToken
        }
      );

      return {
        mediaId: publishResponse.data.id,
        message: 'Video posted to Instagram as Reel'
      };
    } catch (error) {
      console.error('Instagram upload error:', error.response?.data || error);
      throw new Error(`Instagram upload failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Format caption with hashtags
   */
  formatCaption(metadata) {
    let caption = metadata.title || '';
    
    if (metadata.description) {
      caption += `\n\n${metadata.description}`;
    }
    
    if (metadata.tags && metadata.tags.length > 0) {
      const hashtags = metadata.tags.map(tag => `#${tag.replace(/\s+/g, '')}`).join(' ');
      caption += `\n\n${hashtags}`;
    }
    
    return caption;
  }

  /**
   * Upload video to temporary storage (placeholder)
   * In production, you'd need to host the video on a publicly accessible URL
   */
  async uploadToTemporaryStorage(filePath) {
    // TODO: Implement actual video hosting
    // For now, this is a placeholder that would need to be replaced with:
    // 1. Upload to your own server
    // 2. Use a cloud storage service (AWS S3, Azure Blob, etc.)
    // 3. Use a temporary file hosting service
    
    throw new Error('Instagram requires videos to be hosted on a public URL. Please implement video hosting.');
  }

  /**
   * Wait for Instagram to process the video
   */
  async waitForProcessing(igAccountId, creationId, accessToken, maxAttempts = 30) {
    for (let i = 0; i < maxAttempts; i++) {
      const statusResponse = await axios.get(
        `https://graph.facebook.com/v18.0/${creationId}`,
        {
          params: {
            fields: 'status_code',
            access_token: accessToken
          }
        }
      );

      const status = statusResponse.data.status_code;
      
      if (status === 'FINISHED') {
        return true;
      } else if (status === 'ERROR') {
        throw new Error('Instagram video processing failed');
      }

      // Wait 2 seconds before checking again
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    throw new Error('Instagram video processing timeout');
  }
}

module.exports = InstagramUploader;
