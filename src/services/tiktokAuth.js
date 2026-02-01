import axios from 'axios';
import { TIKTOK_AUTH_CONFIG } from '../utils/constants';
import { generateRandomString } from '../utils/helpers';

class TikTokAuthService {
  constructor() {
    this.clientKey = TIKTOK_AUTH_CONFIG.clientKey;
    this.clientSecret = TIKTOK_AUTH_CONFIG.clientSecret;
    this.redirectUri = TIKTOK_AUTH_CONFIG.redirectUri;
    this.scope = TIKTOK_AUTH_CONFIG.scope;
  }

  // Generate OAuth authorization URL
  getAuthorizationUrl() {
    const state = generateRandomString(16);
    localStorage.setItem('tiktok_oauth_state', state);

    const params = new URLSearchParams({
      client_key: this.clientKey,
      scope: this.scope,
      response_type: 'code',
      redirect_uri: this.redirectUri,
      state: state
    });

    return `${TIKTOK_AUTH_CONFIG.authUrl}?${params.toString()}`;
  }

  // Handle OAuth callback and exchange code for access token
  async handleCallback(code, state) {
    try {
      // Verify state to prevent CSRF attacks
      const savedState = localStorage.getItem('tiktok_oauth_state');
      if (state !== savedState) {
        throw new Error('Invalid state parameter. Possible CSRF attack.');
      }

      // Clear the state from localStorage
      localStorage.removeItem('tiktok_oauth_state');

      // Exchange code for access token
      const tokenData = await this.exchangeCodeForToken(code);
      
      // Store token in localStorage (for demo purposes)
      localStorage.setItem('tiktok_access_token', tokenData.access_token);
      localStorage.setItem('tiktok_refresh_token', tokenData.refresh_token);
      localStorage.setItem('tiktok_token_expires', 
        Date.now() + (tokenData.expires_in * 1000)
      );

      return tokenData;
    } catch (error) {
      console.error('OAuth callback error:', error);
      throw this.formatError(error);
    }
  }

  // Exchange authorization code for access token
  async exchangeCodeForToken(code) {
    try {
      const response = await axios.post(TIKTOK_AUTH_CONFIG.tokenUrl, null, {
        params: {
          client_key: this.clientKey,
          client_secret: this.clientSecret,
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: this.redirectUri
        }
      });

      if (response.data.error) {
        throw new Error(response.data.error_description || response.data.error);
      }

      return response.data.data;
    } catch (error) {
      console.error('Token exchange error:', error.response?.data || error.message);
      throw this.formatError(error);
    }
  }

  // Refresh access token
  async refreshToken(refreshToken) {
    try {
      const response = await axios.post(TIKTOK_AUTH_CONFIG.tokenUrl, null, {
        params: {
          client_key: this.clientKey,
          client_secret: this.clientSecret,
          refresh_token: refreshToken,
          grant_type: 'refresh_token'
        }
      });

      if (response.data.error) {
        throw new Error(response.data.error_description || response.data.error);
      }

      // Update stored tokens
      localStorage.setItem('tiktok_access_token', response.data.data.access_token);
      localStorage.setItem('tiktok_refresh_token', response.data.data.refresh_token);
      localStorage.setItem('tiktok_token_expires', 
        Date.now() + (response.data.data.expires_in * 1000)
      );

      return response.data.data;
    } catch (error) {
      console.error('Token refresh error:', error.response?.data || error.message);
      throw this.formatError(error);
    }
  }

  // Check if token is valid
  isTokenValid() {
    const token = localStorage.getItem('tiktok_access_token');
    const expiresAt = localStorage.getItem('tiktok_token_expires');
    
    if (!token || !expiresAt) {
      return false;
    }

    return Date.now() < parseInt(expiresAt);
  }

  // Get current access token
  getAccessToken() {
    return localStorage.getItem('tiktok_access_token');
  }

  // Clear all tokens (logout)
  clearTokens() {
    localStorage.removeItem('tiktok_access_token');
    localStorage.removeItem('tiktok_refresh_token');
    localStorage.removeItem('tiktok_token_expires');
    localStorage.removeItem('tiktok_oauth_state');
  }

  // Format error messages for user display
  formatError(error) {
    const response = error.response?.data;
    
    if (response?.error?.code === 10004) {
      return new Error('Invalid client credentials. Please check your TikTok App configuration.');
    }
    
    if (response?.error?.code === 10007) {
      return new Error('Authorization code is invalid or has expired.');
    }
    
    if (response?.error?.code === 10008) {
      return new Error('Access token has expired. Please reconnect your account.');
    }
    
    if (response?.error?.code === 20003) {
      return new Error('Insufficient permissions. Please ensure your TikTok App has the required scopes.');
    }
    
    if (response?.error?.code === 20004) {
      return new Error('TikTok Ads API is not available in your region.');
    }
    
    if (error.message.includes('network')) {
      return new Error('Network error. Please check your internet connection.');
    }
    
    return new Error(response?.error?.message || error.message || 'Authentication failed. Please try again.');
  }
}

export default new TikTokAuthService();