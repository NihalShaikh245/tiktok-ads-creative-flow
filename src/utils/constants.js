export const TIKTOK_AUTH_CONFIG = {
  authUrl: 'https://www.tiktok.com/v2/auth/authorize/',
  tokenUrl: 'https://open-api.tiktok.com/oauth/access_token/',
  clientKey: process.env.REACT_APP_TIKTOK_CLIENT_KEY,
  clientSecret: process.env.REACT_APP_TIKTOK_CLIENT_SECRET,
  redirectUri: process.env.REACT_APP_TIKTOK_REDIRECT_URI,
  scope: 'user.info.basic,advertising.music',
  state: 'tiktok_ads_creative_flow_state'
};

export const API_ENDPOINTS = {
  userInfo: 'https://open-api.tiktok.com/user/info/',
  musicInfo: 'https://business-api.tiktok.com/open_api/v1.3/music/info/',
  createAd: 'https://business-api.tiktok.com/open_api/v1.3/ad/create/',
  validateAd: 'https://business-api.tiktok.com/open_api/v1.3/ad/creative/validate/',
  advertiserObjectives: 'https://business-api.tiktok.com/open_api/v1.3/advertiser/objectives/',
  advertiserInfo: 'https://business-api.tiktok.com/open_api/v1.3/advertiser/info/'
};

export const AD_OBJECTIVES = {
  TRAFFIC: 'TRAFFIC',
  CONVERSIONS: 'CONVERSIONS'
};

export const CTA_OPTIONS = [
  { value: 'DOWNLOAD', label: 'Download' },
  { value: 'LEARN_MORE', label: 'Learn More' },
  { value: 'SIGN_UP', label: 'Sign Up' },
  { value: 'SHOP_NOW', label: 'Shop Now' }
];

export const OAUTH_ERRORS = {
  INVALID_CLIENT: 'Invalid client credentials. Please check your TikTok App configuration.',
  INVALID_CODE: 'Authorization code is invalid or has expired.',
  EXPIRED_TOKEN: 'Access token has expired. Please reconnect your account.',
  INSUFFICIENT_SCOPE: 'Insufficient permissions. Please ensure your TikTok App has the required scopes.',
  GEO_RESTRICTED: 'TikTok Ads API is not available in your region.',
  NETWORK_ERROR: 'Network error. Please check your internet connection.'
};

// Add these constants
export const FORM_VALIDATION = {
  CAMPAIGN_NAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 255
  },
  AD_TEXT: {
    MAX_LENGTH: 100
  },
  MUSIC: {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/x-m4a']
  }
};

export const MUSIC_OPTIONS = {
  EXISTING: 'existing',
  UPLOAD: 'upload',
  NONE: 'none'
};
