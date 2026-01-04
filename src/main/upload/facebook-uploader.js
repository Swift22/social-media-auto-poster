const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

class FacebookUploader {
  constructor(credentialStore) {
    this.credentialStore = credentialStore;
  }

  /**
   * Upload video to Facebook (as Reel)
   */
  async upload(filePath, metadata) {
    const credentials = this.credentialStore.getCredentials('facebook');
    
    if (!credentials || !credentials.pages || credentials.pages.length === 0) {
      throw new Error('No Facebook page found. Please reconnect your account.');
    }

    // Use the first page (or implement page selection)
    const page = credentials.pages[0];
    const pageAccessToken = page.access_token;
    const pageId = page.id;

    try {
      // Step 1: Initialize upload session
      const initResponse = await axios.post(
        `https://graph.facebook.com/v18.0/${pageId}/video_reels`,
        {
          upload_phase: 'start',
          access_token: pageAccessToken
        }
      );

      const { video_id, upload_url } = initResponse.data;

      // Step 2: Upload video file
      const videoBuffer = fs.readFileSync(filePath);
      await axios.post(upload_url, videoBuffer, {
        headers: {
          'Authorization': `OAuth ${pageAccessToken}`,
          'file_size': videoBuffer.length
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity
      });

      // Step 3: Finish upload and publish
      const publishResponse = await axios.post(
        `https://graph.facebook.com/v18.0/${pageId}/video_reels`,
        {
          video_id: video_id,
          upload_phase: 'finish',
          video_state: 'PUBLISHED',
          description: metadata.description || metadata.title,
          access_token: pageAccessToken
        }
      );

      return {
        videoId: publishResponse.data.id,
        message: 'Video posted to Facebook as Reel'
      };
    } catch (error) {
      console.error('Facebook upload error:', error.response?.data || error);
      throw new Error(`Facebook upload failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }
}

module.exports = FacebookUploader;
