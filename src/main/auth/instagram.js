const { shell } = require('electron');
const axios = require('axios');
const pkceChallenge = require('pkce-challenge').default;

class InstagramAuth {
  constructor(credentialStore) {
    this.credentialStore = credentialStore;
    this.clientId = process.env.FACEBOOK_APP_ID; // Instagram uses Facebook App ID
    this.clientSecret = process.env.FACEBOOK_APP_SECRET;
    this.redirectUri = `${process.env.CUSTOM_URL_PROTOCOL || 'shortposter'}://auth/callback`;
    this.pkce = null;
  }

  /**
   * Initiate Instagram OAuth login flow
   */
  async login() {
    try {
      // Generate PKCE challenge
      this.pkce = pkceChallenge();
      
      // Build authorization URL (using Facebook OAuth for Instagram)
      const authUrl = new URL('https://www.facebook.com/v18.0/dialog/oauth');
      authUrl.searchParams.append('client_id', this.clientId);
      authUrl.searchParams.append('redirect_uri', this.redirectUri);
      authUrl.searchParams.append('scope', 'instagram_basic,instagram_content_publish,pages_show_list');
      authUrl.searchParams.append('state', `instagram_${Date.now()}`);
      authUrl.searchParams.append('code_challenge', this.pkce.code_challenge);
      authUrl.searchParams.append('code_challenge_method', 'S256');
      authUrl.searchParams.append('response_type', 'code');

      // Open browser for user authentication
      await shell.openExternal(authUrl.toString());

      return { success: true, message: 'Opening Instagram login...' };
    } catch (error) {
      console.error('Instagram login error:', error);
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

      // Get Facebook pages (needed to get Instagram Business Account)
      const pagesResponse = await axios.get('https://graph.facebook.com/v18.0/me/accounts', {
        params: {
          access_token: longLivedToken,
          fields: 'instagram_business_account,access_token,name'
        }
      });

      // Find pages with Instagram Business Accounts
      const instagramAccounts = pagesResponse.data.data
        .filter(page => page.instagram_business_account)
        .map(page => ({
          pageId: page.id,
          pageName: page.name,
          pageAccessToken: page.access_token,
          instagramAccountId: page.instagram_business_account.id
        }));

      if (instagramAccounts.length === 0) {
        throw new Error('No Instagram Business Account found. Please connect an Instagram Business Account to your Facebook Page.');
      }

      // Store credentials
      this.credentialStore.setCredentials('instagram', {
        accessToken: longLivedToken,
        expiresAt: expiresAt.toISOString(),
        accounts: instagramAccounts
      });

      return { success: true, message: 'Instagram authentication successful!' };
    } catch (error) {
      console.error('Instagram callback error:', error);
      throw error;
    }
  }

  /**
   * Refresh access token if needed
   */
  async refreshToken() {
    // Instagram uses Facebook's long-lived tokens (~60 days)
    const credentials = this.credentialStore.getCredentials('instagram');
    
    if (!credentials) {
      throw new Error('No Instagram credentials found');
    }

    // Check if token is expired
    if (this.credentialStore.isTokenExpired('instagram')) {
      // Re-authentication required
      throw new Error('Instagram token expired. Please re-authenticate.');
    }

    return credentials.accessToken;
  }
}

module.exports = InstagramAuth;
