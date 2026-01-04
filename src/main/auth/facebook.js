const { shell } = require('electron');
const axios = require('axios');
const pkceChallenge = require('pkce-challenge').default;

class FacebookAuth {
  constructor(credentialStore) {
    this.credentialStore = credentialStore;
    this.clientId = process.env.FACEBOOK_APP_ID;
    this.clientSecret = process.env.FACEBOOK_APP_SECRET;
    this.redirectUri = `${process.env.CUSTOM_URL_PROTOCOL || 'shortposter'}://auth/callback`;
    this.pkce = null;
  }

  /**
   * Initiate Facebook OAuth login flow
   */
  async login() {
    try {
      // Generate PKCE challenge
      this.pkce = pkceChallenge();
      
      // Build authorization URL
      const authUrl = new URL('https://www.facebook.com/v18.0/dialog/oauth');
      authUrl.searchParams.append('client_id', this.clientId);
      authUrl.searchParams.append('redirect_uri', this.redirectUri);
      authUrl.searchParams.append('scope', 'pages_show_list,pages_read_engagement,pages_manage_posts');
      authUrl.searchParams.append('state', `facebook_${Date.now()}`);
      authUrl.searchParams.append('code_challenge', this.pkce.code_challenge);
      authUrl.searchParams.append('code_challenge_method', 'S256');
      authUrl.searchParams.append('response_type', 'code');

      // Open browser for user authentication
      await shell.openExternal(authUrl.toString());

      return { success: true, message: 'Opening Facebook login...' };
    } catch (error) {
      console.error('Facebook login error:', error);
      throw error;
    }
  }

  /**
   * Handle OAuth callback and exchange code for token
   */
  async handleCallback(code, state) {
    try {
      // Exchange authorization code for access token
      const tokenUrl = 'https://graph.facebook.com/v18.0/oauth/access_token';
      const response = await axios.get(tokenUrl, {
        params: {
          client_id: this.clientId,
          client_secret: this.clientSecret,
          redirect_uri: this.redirectUri,
          code: code,
          code_verifier: this.pkce.code_verifier
        }
      });

      const { access_token, expires_in } = response.data;

      // Exchange short-lived token for long-lived token
      const longLivedResponse = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: this.clientId,
          client_secret: this.clientSecret,
          fb_exchange_token: access_token
        }
      });

      const longLivedToken = longLivedResponse.data.access_token;
      const expiresAt = new Date(Date.now() + (longLivedResponse.data.expires_in * 1000));

      // Get user's pages
      const pagesResponse = await axios.get('https://graph.facebook.com/v18.0/me/accounts', {
        params: {
          access_token: longLivedToken
        }
      });

      // Store credentials
      this.credentialStore.setCredentials('facebook', {
        accessToken: longLivedToken,
        expiresAt: expiresAt.toISOString(),
        pages: pagesResponse.data.data
      });

      return { success: true, message: 'Facebook authentication successful!' };
    } catch (error) {
      console.error('Facebook callback error:', error);
      throw error;
    }
  }

  /**
   * Refresh access token if needed
   */
  async refreshToken() {
    // Facebook long-lived tokens last ~60 days
    // Implement refresh logic if needed
    const credentials = this.credentialStore.getCredentials('facebook');
    
    if (!credentials) {
      throw new Error('No Facebook credentials found');
    }

    // Check if token is expired
    if (this.credentialStore.isTokenExpired('facebook')) {
      // Re-authenticate required for Facebook
      throw new Error('Facebook token expired. Please re-authenticate.');
    }

    return credentials.accessToken;
  }
}

module.exports = FacebookAuth;
