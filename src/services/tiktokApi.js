import axios from 'axios';
import { API_ENDPOINTS } from '../utils/constants';
import tiktokAuth from './tiktokAuth';

class TikTokApiService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_BASE_URL;
  }

  // Create axios instance with auth headers
  getApiInstance(accessToken) {
    return axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
        'Access-Token': accessToken
      }
    });
  }

  // Validate ad creative data
async validateAdCreative(adData) {
  try {
    const accessToken = await this.validateAndGetToken();
    const api = this.getApiInstance(accessToken);

    // This endpoint is simplified - real TikTok API might have specific validation endpoints
    const response = await api.post(`${this.baseURL}/open_api/v1.3/ad/creative/validate/`, {
      ...adData,
      validate_only: true
    });

    if (response.data.error) {
      throw new Error(response.data.error.message);
    }

    return response.data.data;
  } catch (error) {
    console.error('Ad validation error:', error);
    throw this.formatError(error);
  }
}

// Get available objectives for the advertiser
async getAvailableObjectives(advertiserId) {
  try {
    const accessToken = await this.validateAndGetToken();
    const api = this.getApiInstance(accessToken);

    const response = await api.get(`${this.baseURL}/open_api/v1.3/advertiser/objectives/`, {
      params: {
        advertiser_id: advertiserId
      }
    });

    if (response.data.error) {
      throw new Error(response.data.error.message);
    }

    return response.data.data.objectives || [AD_OBJECTIVES.TRAFFIC, AD_OBJECTIVES.CONVERSIONS];
  } catch (error) {
    console.error('Get objectives error:', error);
    // Return default objectives if API fails
    return [AD_OBJECTIVES.TRAFFIC, AD_OBJECTIVES.CONVERSIONS];
  }
}

// Get advertiser information
async getAdvertiserInfo() {
  try {
    const accessToken = await this.validateAndGetToken();
    const api = this.getApiInstance(accessToken);

    // Note: This requires the advertiser_id to be available
    // For demo purposes, we'll return mock data
    const mockAdvertisers = [
      {
        advertiser_id: '123456789',
        advertiser_name: 'Demo Advertiser Account',
        status: 'ACTIVE'
      }
    ];

    return mockAdvertisers[0];
    
    // Real implementation would be:
    // const response = await api.get(API_ENDPOINTS.advertiserInfo);
    // return response.data.data;
  } catch (error) {
    console.error('Get advertiser info error:', error);
    throw this.formatError(error);
  }
}

  // Validate access token and refresh if needed
  async validateAndGetToken() {
    let accessToken = tiktokAuth.getAccessToken();
    
    if (!tiktokAuth.isTokenValid()) {
      const refreshToken = localStorage.getItem('tiktok_refresh_token');
      if (refreshToken) {
        try {
          const newTokens = await tiktokAuth.refreshToken(refreshToken);
          accessToken = newTokens.access_token;
        } catch (error) {
          tiktokAuth.clearTokens();
          throw new Error('Session expired. Please reconnect your TikTok account.');
        }
      } else {
        tiktokAuth.clearTokens();
        throw new Error('Session expired. Please reconnect your TikTok account.');
      }
    }

    return accessToken;
  }

  // Get user information
  async getUserInfo() {
    try {
      const accessToken = await this.validateAndGetToken();
      
      const response = await axios.get(API_ENDPOINTS.userInfo, {
        params: {
          access_token: accessToken,
          fields: 'open_id,display_name,avatar_url'
        }
      });

      if (response.data.error) {
        throw new Error(response.data.error.message);
      }

      return response.data.data;
    } catch (error) {
      console.error('Get user info error:', error);
      throw tiktokAuth.formatError(error);
    }
  }

  // Get music information
  async getMusicInfo(musicId) {
    try {
      const accessToken = await this.validateAndGetToken();
      const api = this.getApiInstance(accessToken);

      const response = await api.get(API_ENDPOINTS.musicInfo, {
        params: {
          music_ids: [musicId]
        }
      });

      if (response.data.error) {
        throw new Error(response.data.error.message);
      }

      if (!response.data.data || response.data.data.length === 0) {
        throw new Error('Music not found. Please check the Music ID.');
      }

      const musicData = response.data.data[0];
      
      // Check if music is available for advertising
      if (musicData.status !== 2) { // Status 2 means available
        throw new Error('This music is not available for advertising use.');
      }

      return musicData;
    } catch (error) {
      console.error('Get music info error:', error);
      throw tiktokAuth.formatError(error);
    }
  }

  // Create ad (simulated - will use real endpoint)
  async createAd(adData) {
    try {
      const accessToken = await this.validateAndGetToken();
      const api = this.getApiInstance(accessToken);

      // For this assignment, we'll use a simplified version
      // Real implementation would require advertiser_id and more fields
      const response = await api.post(API_ENDPOINTS.createAd, {
        ...adData,
        operation_status: 'ENABLE'
      });

      if (response.data.error) {
        throw new Error(response.data.error.message);
      }

      return response.data.data;
    } catch (error) {
      console.error('Create ad error:', error);
      throw tiktokAuth.formatError(error);
    }
  }
}

export default new TikTokApiService();