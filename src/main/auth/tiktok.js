const { shell } = require('electron');
const axios = require('axios');
const pkceChallenge = require('pkce-challenge').default;

class TikTokAuth {
  constructor(credentialStore) {
    this.credentialStore = credentialStore;
    this.clientKey = process.env.TIKTOK_CLIENT_KEY;
    this.clientSecret = process.env.TIKTOK_CLIENT_SECRET;
    this.redirectUri = `${process.env.CUSTOM_URL_PROTOCOL || 'shortposter'}://auth/callback`;
    this.pkce = null;
  }

  /**
   * Initiate TikTok OAuth login flow
   */
  async login() {
    try {
      // Generate PKCE challenge
      this.pkce = pkceChallenge();
      
      // Build authorization URL
      const authUrl = new URL('https://www.tiktok.com/v2/auth/authorize');
      authUrl.searchParams.append('client_key', this.clientKey);
      authUrl.searchParams.append('redirect_uri', this.redirectUri);
      authUrl.searchParams.append('scope', 'video.publish,video.upload');
      authUrl.searchParams.append('state', `tiktok_${Date.now()}`);
      authUrl.searchParams.append('code_challenge', this.pkce.code_challenge);
      authUrl.searchParams.append('code_challenge_method', 'S256');
      authUrl.searchParams.append('response_type', 'code');

      // Open browser for user authentication
      await shell.openExternal(authUrl.toString());

      return { success: true, message: 'Opening TikTok login...' };
    } catch (error) {
      console.error('TikTok login error:', error);
      throw error;
    }
  }

  /**
   * Handle OAuth callback and exchange code for token
   */
  async handleCallback(code, state) {
    try {
      // Exchange authorization code for access token
      const tokenUrl = 'https://open.tiktokapis.com/v2/oauth/token/';
      const response = await axios.post(tokenUrl, {
        client_key: this.clientKey,
        client_secret: this.clientSecret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: this.redirectUri,
        code_verifier: this.pkce.code_verifier
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      const { access_token, refresh_token, expires_in, open_id } = response.data;
      const expiresAt = new Date(Date.now() + (expires_in * 1000));

      // Store credentials
      this.credentialStore.setCredentials('tiktok', {
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt: expiresAt.toISOString(),
        openId: open_id
      });

      return { success: true, message: 'TikTok authentication successful!' };
    } catch (error) {
      console.error('TikTok callback error:', error);
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken() {
    const credentials = this.credentialStore.getCredentials('tiktok');
    
    if (!credentials || !credentials.refreshToken) {
      throw new Error('No TikTok credentials found');
    }

    try {
      const tokenUrl = 'https://open.tiktokapis.com/v2/oauth/token/';
      const response = await axios.post(tokenUrl, {
        client_key: this.clientKey,
        client_secret: this.clientSecret,
        grant_type: 'refresh_token',
        refresh_token: credentials.refreshToken
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      const { access_token, refresh_token, expires_in } = response.data;
      const expiresAt = new Date(Date.now() + (expires_in * 1000));

      // Update stored credentials
      this.credentialStore.setCredentials('tiktok', {
        ...credentials,
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt: expiresAt.toISOString()
      });

      return access_token;
    } catch (error) {
      console.error('TikTok token refresh error:', error);
      throw error;
    }
  }
}

module.exports = TikTokAuth;
