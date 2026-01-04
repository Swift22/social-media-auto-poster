const axios = require('axios');
const fs = require('fs');

class TikTokUploader {
  constructor(credentialStore) {
    this.credentialStore = credentialStore;
  }

  /**
   * Upload video to TikTok
   */
  async upload(filePath, metadata) {
    const credentials = this.credentialStore.getCredentials('tiktok');
    
    if (!credentials) {
      throw new Error('TikTok not authenticated');
    }

    const accessToken = credentials.accessToken;

    try {
      // Step 1: Initialize upload
      const videoBuffer = fs.readFileSync(filePath);
      const videoSize = videoBuffer.length;

      const initResponse = await axios.post(
        'https://open.tiktokapis.com/v2/post/publish/video/init/',
        {
          post_info: {
            title: metadata.title || '',
            privacy_level: 'SELF_ONLY', // or PUBLIC_TO_EVERYONE
            disable_duet: false,
            disable_comment: false,
            disable_stitch: false,
            video_cover_timestamp_ms: 1000
          },
          source_info: {
            source: 'FILE_UPLOAD',
            video_size: videoSize,
            chunk_size: videoSize,
            total_chunk_count: 1
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json; charset=UTF-8'
          }
        }
      );

      const { publish_id, upload_url } = initResponse.data.data;

      // Step 2: Upload video chunks
      await axios.put(upload_url, videoBuffer, {
        headers: {
          'Content-Type': 'video/mp4',
          'Content-Length': videoSize
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity
      });

      // Step 3: Publish video
      const publishResponse = await axios.post(
        'https://open.tiktokapis.com/v2/post/publish/status/fetch/',
        {
          publish_id: publish_id
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json; charset=UTF-8'
          }
        }
      );

      return {
        publishId: publish_id,
        status: publishResponse.data.data.status,
        message: 'Video uploaded to TikTok'
      };
    } catch (error) {
      console.error('TikTok upload error:', error.response?.data || error);
      throw new Error(`TikTok upload failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }
}

module.exports = TikTokUploader;
