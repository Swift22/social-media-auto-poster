const { google } = require('googleapis');
const fs = require('fs');
const YouTubeAuth = require('../auth/youtube');

class YouTubeUploader {
  constructor(credentialStore) {
    this.credentialStore = credentialStore;
    this.youtubeAuth = new YouTubeAuth(credentialStore);
  }

  /**
   * Upload video to YouTube
   */
  async upload(filePath, metadata) {
    const credentials = this.credentialStore.getCredentials('youtube');
    
    if (!credentials) {
      throw new Error('YouTube not authenticated');
    }

    try {
      // Get authenticated OAuth2 client
      const auth = this.youtubeAuth.getAuthenticatedClient();
      const youtube = google.youtube({ version: 'v3', auth });

      // Prepare video metadata
      const videoMetadata = {
        snippet: {
          title: metadata.title || 'Untitled Video',
          description: metadata.description || '',
          tags: metadata.tags || [],
          categoryId: '22' // People & Blogs
        },
        status: {
          privacyStatus: 'public', // or 'private', 'unlisted'
          selfDeclaredMadeForKids: false
        }
      };

      // Upload video
      const response = await youtube.videos.insert({
        part: 'snippet,status',
        requestBody: videoMetadata,
        media: {
          body: fs.createReadStream(filePath)
        }
      });

      return {
        videoId: response.data.id,
        url: `https://www.youtube.com/watch?v=${response.data.id}`,
        message: 'Video uploaded to YouTube'
      };
    } catch (error) {
      console.error('YouTube upload error:', error);
      
      // Check if token needs refresh
      if (error.code === 401) {
        try {
          await this.youtubeAuth.refreshToken();
          // Retry upload after token refresh
          return await this.upload(filePath, metadata);
        } catch (refreshError) {
          throw new Error('YouTube authentication expired. Please re-authenticate.');
        }
      }
      
      throw new Error(`YouTube upload failed: ${error.message}`);
    }
  }
}

module.exports = YouTubeUploader;
