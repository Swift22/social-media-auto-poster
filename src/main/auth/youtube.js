const { shell } = require('electron');
const { google } = require('googleapis');
const pkceChallenge = require('pkce-challenge').default;

class YouTubeAuth {
  constructor(credentialStore) {
    this.credentialStore = credentialStore;
    this.clientId = process.env.GOOGLE_CLIENT_ID;
    this.clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    this.redirectUri = `${process.env.CUSTOM_URL_PROTOCOL || 'shortposter'}://auth/callback`;
    this.pkce = null;
    
    // Initialize OAuth2 client
    this.oauth2Client = new google.auth.OAuth2(
      this.clientId,
      this.clientSecret,
      this.redirectUri
    );
  }

  /**
   * Initiate YouTube OAuth login flow
   */
  async login() {
    try {
      // Generate PKCE challenge
      this.pkce = pkceChallenge();
      
      // Generate authorization URL
      const authUrl = this.oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/youtube.upload'],
        state: `youtube_${Date.now()}`,
        code_challenge: this.pkce.code_challenge,
        code_challenge_method: 'S256',
        prompt: 'consent' // Force consent to get refresh token
      });

      // Open browser for user authentication
      await shell.openExternal(authUrl);

      return { success: true, message: 'Opening YouTube login...' };
    } catch (error) {
      console.error('YouTube login error:', error);
      throw error;
    }
  }

  /**
   * Handle OAuth callback and exchange code for token
   */
  async handleCallback(code, state) {
    try {
      // Set code verifier for PKCE
      this.oauth2Client.codeVerifier = this.pkce.code_verifier;
      
      // Exchange authorization code for tokens
      const { tokens } = await this.oauth2Client.getToken(code);
      
      const expiresAt = new Date(Date.now() + (tokens.expiry_date || 3600000));

      // Store credentials
      this.credentialStore.setCredentials('youtube', {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: expiresAt.toISOString(),
        tokenType: tokens.token_type
      });

      return { success: true, message: 'YouTube authentication successful!' };
    } catch (error) {
      console.error('YouTube callback error:', error);
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken() {
    const credentials = this.credentialStore.getCredentials('youtube');
    
    if (!credentials || !credentials.refreshToken) {
      throw new Error('No YouTube credentials found');
    }

    try {
      // Set credentials for refresh
      this.oauth2Client.setCredentials({
        refresh_token: credentials.refreshToken
      });

      // Refresh the token
      const { credentials: newCredentials } = await this.oauth2Client.refreshAccessToken();
      
      const expiresAt = new Date(Date.now() + (newCredentials.expiry_date || 3600000));

      // Update stored credentials
      this.credentialStore.updateAccessToken('youtube', newCredentials.access_token, expiresAt.toISOString());

      return newCredentials.access_token;
    } catch (error) {
      console.error('YouTube token refresh error:', error);
      throw error;
    }
  }

  /**
   * Get authenticated OAuth2 client
   */
  getAuthenticatedClient() {
    const credentials = this.credentialStore.getCredentials('youtube');
    
    if (!credentials) {
      throw new Error('No YouTube credentials found');
    }

    this.oauth2Client.setCredentials({
      access_token: credentials.accessToken,
      refresh_token: credentials.refreshToken
    });

    return this.oauth2Client;
  }
}

module.exports = YouTubeAuth;
