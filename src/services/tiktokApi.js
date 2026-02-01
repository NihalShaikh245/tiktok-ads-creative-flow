import axios from 'axios';
import { API_ENDPOINTS } from '../utils/constants';
import tiktokAuth from './tiktokAuth';

class TikTokApiService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_BASE_URL;
  }

  // ================= CORE HELPERS =================

  getApiInstance(accessToken) {
    return axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
        'Access-Token': accessToken
      }
    });
  }

  async validateAndGetToken() {
    let accessToken = tiktokAuth.getAccessToken();

    if (!tiktokAuth.isTokenValid()) {
      const refreshToken = localStorage.getItem('tiktok_refresh_token');

      if (!refreshToken) {
        tiktokAuth.clearTokens();
        throw new Error('Session expired. Please reconnect your TikTok account.');
      }

      try {
        const newTokens = await tiktokAuth.refreshToken(refreshToken);
        accessToken = newTokens.access_token;
      } catch {
        tiktokAuth.clearTokens();
        throw new Error('Session expired. Please reconnect your TikTok account.');
      }
    }

    return accessToken;
  }

  // ================= ADVERTISER =================

  async getAdvertiserId() {
    try {
      const cachedId = localStorage.getItem('tiktok_advertiser_id');
      if (cachedId) return cachedId;

      // Demo-safe fallback (real API requires ads scope approval)
      const mockAdvertiserId = '123456789012345';
      localStorage.setItem('tiktok_advertiser_id', mockAdvertiserId);

      return mockAdvertiserId;
    } catch (error) {
      console.error('Get advertiser ID error:', error);
      return '123456789012345';
    }
  }

  // ================= MUSIC ERROR FORMATTER =================

  formatMusicError(errorCode, defaultMessage) {
    switch (errorCode) {
      case 40001:
        return 'Invalid music ID format. Please check the ID.';
      case 40002:
        return 'Music ID not found in TikTok library.';
      case 40003:
        return 'This music is not available for advertising in your region.';
      case 40004:
        return 'Music licensing restrictions prevent advertising use.';
      case 40005:
        return 'This music has been removed from the advertising library.';
      case 40006:
        return 'Music validation failed due to content policy violations.';
      case 40007:
        return 'This music is not compatible with your selected objective.';
      case 40008:
        return 'Music usage limit exceeded for your account.';
      case 40009:
        return 'Music is currently under review and not available.';
      case 40010:
        return 'Required music permissions are missing for your account.';
      default:
        return defaultMessage || 'Music validation failed.';
    }
  }

  // ================= ENHANCED MUSIC VALIDATION =================

  async getMusicInfo(musicId) {
    try {
      const accessToken = await this.validateAndGetToken();
      const api = this.getApiInstance(accessToken);
      const advertiserId = await this.getAdvertiserId();

      console.log(`Validating music ID: ${musicId}`);

      const response = await api.get(API_ENDPOINTS.musicInfo, {
        params: {
          music_ids: [musicId],
          advertiser_id: advertiserId
        },
        timeout: 10000
      });

      if (response.data.error) {
        const { code, message } = response.data.error;
        throw new Error(this.formatMusicError(code, message));
      }

      if (!response.data.data?.length) {
        throw new Error('Music not found. Please check the Music ID.');
      }

      const music = response.data.data[0];

      if (music.status !== 2) {
        const statusMessages = {
          1: 'Music is under review and not yet available for advertising.',
          3: 'Music has been removed or is no longer available.',
          4: 'Music is restricted in your region.'
        };
        throw new Error(statusMessages[music.status] || 'Music is not available for advertising.');
      }

      if (music.objective_restrictions?.length) {
        console.warn('Music objective restrictions:', music.objective_restrictions);
      }

      return {
        id: music.music_id,
        title: music.title,
        author: music.author,
        duration: music.duration,
        status: music.status,
        cover_url: music.cover_url,
        play_url: music.play_url,
        objective_restrictions: music.objective_restrictions || []
      };
    } catch (error) {
      console.error('Get music info error:', error);

      if (error.code === 'ECONNABORTED') {
        throw new Error('Music validation timeout. Please try again.');
      }

      if (error.response?.status === 403) {
        throw new Error('Access denied. Your account may not have permission to use this music.');
      }

      if (error.response?.status === 404) {
        throw new Error('Music ID not found. Please verify the ID is correct.');
      }

      if (error.response?.status === 429) {
        throw new Error('Too many requests. Please wait and try again.');
      }

      throw tiktokAuth.formatError(error);
    }
  }

  // ================= MUSIC UPLOAD (SIMULATED) =================

  async uploadCustomMusic(file, musicName) {
    try {
      console.log('Simulating music upload:', file.name);

      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockMusicId = `custom_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

      return {
        music_id: mockMusicId,
        title: musicName || file.name.replace(/\.[^/.]+$/, ''),
        author: 'Custom Upload',
        duration: Math.floor(file.size / 5000),
        status: 2,
        is_custom: true,
        processing_status: 'COMPLETED',
        message: 'Music uploaded successfully and is ready for use.'
      };
    } catch (error) {
      console.error('Music upload error:', error);
      throw new Error(`Music upload failed: ${error.message}`);
    }
  }

  // ================= MUSIC SEARCH (SIMULATED) =================

  async searchMusic(query, limit = 10) {
    try {
      console.log('Simulating music search:', query);

      await new Promise(resolve => setTimeout(resolve, 1500));

      const results = Array.from({ length: limit }, (_, i) => ({
        id: `${100000000 + i}`,
        title: `${query} - Result ${i + 1}`,
        author: `Artist ${i + 1}`,
        duration: 30 + i * 5,
        status: i % 3 === 0 ? 1 : 2,
        popularity: Math.floor(Math.random() * 100),
        genre: ['Pop', 'Hip Hop', 'Electronic', 'Rock'][i % 4]
      }));

      return {
        results,
        total: 100,
        has_more: true
      };
    } catch (error) {
      console.error('Music search error:', error);
      throw new Error(`Music search failed: ${error.message}`);
    }
  }
}

export default new TikTokApiService();
