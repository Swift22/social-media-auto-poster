const crypto = require('crypto');
let Store;

class CredentialStore {
  constructor() {
    // Lazy load electron-store to avoid import issues
    if (!Store) {
      Store = require('electron-store');
    }
    
    // Initialize encrypted store
    this.store = new Store({
      name: 'credentials',
      encryptionKey: this.getEncryptionKey(),
      clearInvalidConfig: true
    });
  }

  /**
   * Generate or retrieve encryption key
   * In production, this should use a more secure method
   */
  getEncryptionKey() {
    const { app } = require('electron');
    const machineId = app.getPath('userData');
    
    // Generate a consistent key based on machine ID
    return crypto.createHash('sha256').update(machineId).digest('hex').substring(0, 32);
  }

  /**
   * Store credentials for a platform
   */
  setCredentials(platform, credentials) {
    this.store.set(`${platform}.credentials`, {
      ...credentials,
      updatedAt: new Date().toISOString()
    });
  }

  /**
   * Get credentials for a platform
   */
  getCredentials(platform) {
    return this.store.get(`${platform}.credentials`);
  }

  /**
   * Check if credentials exist for a platform
   */
  hasCredentials(platform) {
    const credentials = this.getCredentials(platform);
    return credentials && credentials.accessToken;
  }

  /**
   * Remove credentials for a platform
   */
  removeCredentials(platform) {
    this.store.delete(`${platform}.credentials`);
  }

  /**
   * Get access token for a platform
   */
  getAccessToken(platform) {
    const credentials = this.getCredentials(platform);
    return credentials ? credentials.accessToken : null;
  }

  /**
   * Get refresh token for a platform
   */
  getRefreshToken(platform) {
    const credentials = this.getCredentials(platform);
    return credentials ? credentials.refreshToken : null;
  }

  /**
   * Update access token (after refresh)
   */
  updateAccessToken(platform, accessToken, expiresAt = null) {
    const credentials = this.getCredentials(platform);
    if (credentials) {
      this.setCredentials(platform, {
        ...credentials,
        accessToken,
        expiresAt
      });
    }
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(platform) {
    const credentials = this.getCredentials(platform);
    if (!credentials || !credentials.expiresAt) {
      return false; // No expiration info
    }
    
    return new Date(credentials.expiresAt) <= new Date();
  }

  /**
   * Clear all credentials
   */
  clearAll() {
    this.store.clear();
  }
}

module.exports = CredentialStore;
