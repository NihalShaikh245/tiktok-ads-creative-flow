// ================= TIKTOK AUTH =================

export const TIKTOK_AUTH_CONFIG = {
  authUrl: 'https://www.tiktok.com/v2/auth/authorize/',
  tokenUrl: 'https://open-api.tiktok.com/oauth/access_token/',
  clientKey: process.env.REACT_APP_TIKTOK_CLIENT_KEY,
  clientSecret: process.env.REACT_APP_TIKTOK_CLIENT_SECRET,
  redirectUri: process.env.REACT_APP_TIKTOK_REDIRECT_URI,
  scope: 'user.info.basic,advertising.music',
  state: 'tiktok_ads_creative_flow_state'
};

// ================= API ENDPOINTS =================

export const API_ENDPOINTS = {
  userInfo: 'https://open-api.tiktok.com/user/info/',
  createAd: 'https://business-api.tiktok.com/open_api/v1.3/ad/create/',
  validateAd: 'https://business-api.tiktok.com/open_api/v1.3/ad/creative/validate/',
  advertiserObjectives: 'https://business-api.tiktok.com/open_api/v1.3/advertiser/objectives/',
  advertiserInfo: 'https://business-api.tiktok.com/open_api/v1.3/advertiser/info/',

  // Music APIs
  musicInfo: 'https://business-api.tiktok.com/open_api/v1.3/music/info/',
  musicSearch: 'https://business-api.tiktok.com/open_api/v1.3/music/search/',
  musicUpload: 'https://business-api.tiktok.com/open_api/v1.3/music/upload/',
  musicLibrary: 'https://business-api.tiktok.com/open_api/v1.3/music/library/'
};

// ================= AD OBJECTIVES =================

export const AD_OBJECTIVES = {
  TRAFFIC: 'TRAFFIC',
  CONVERSIONS: 'CONVERSIONS'
};

// ================= CTA OPTIONS =================

export const CTA_OPTIONS = [
  { value: 'DOWNLOAD', label: 'Download' },
  { value: 'LEARN_MORE', label: 'Learn More' },
  { value: 'SIGN_UP', label: 'Sign Up' },
  { value: 'SHOP_NOW', label: 'Shop Now' }
];

// ================= OAUTH ERRORS =================

export const OAUTH_ERRORS = {
  INVALID_CLIENT: 'Invalid client credentials. Please check your TikTok App configuration.',
  INVALID_CODE: 'Authorization code is invalid or has expired.',
  EXPIRED_TOKEN: 'Access token has expired. Please reconnect your account.',
  INSUFFICIENT_SCOPE: 'Insufficient permissions. Please ensure your TikTok App has the required scopes.',
  GEO_RESTRICTED: 'TikTok Ads API is not available in your region.',
  NETWORK_ERROR: 'Network error. Please check your internet connection.'
};

// ================= MUSIC OPTIONS =================

export const MUSIC_OPTIONS = {
  EXISTING: 'existing',
  UPLOAD: 'upload',
  NONE: 'none'
};

// ================= MUSIC STATUS =================

export const MUSIC_STATUS = {
  PENDING: 0,
  UNDER_REVIEW: 1,
  AVAILABLE: 2,
  REJECTED: 3,
  RESTRICTED: 4,
  EXPIRED: 5
};

// ================= MUSIC ERROR CODES =================

export const MUSIC_ERROR_CODES = {
  INVALID_ID: 40001,
  NOT_FOUND: 40002,
  REGION_RESTRICTED: 40003,
  LICENSE_RESTRICTED: 40004,
  REMOVED: 40005,
  POLICY_VIOLATION: 40006,
  OBJECTIVE_INCOMPATIBLE: 40007,
  USAGE_LIMIT_EXCEEDED: 40008,
  UNDER_REVIEW: 40009,
  PERMISSION_DENIED: 40010
};

// ================= MUSIC ERROR MESSAGES =================

export const MUSIC_ERROR_MESSAGES = {
  [MUSIC_ERROR_CODES.INVALID_ID]: 'Invalid music ID format. Please check the ID.',
  [MUSIC_ERROR_CODES.NOT_FOUND]: 'Music not found in TikTok library.',
  [MUSIC_ERROR_CODES.REGION_RESTRICTED]: 'This music is not available in your region.',
  [MUSIC_ERROR_CODES.LICENSE_RESTRICTED]: 'Music licensing prevents advertising use.',
  [MUSIC_ERROR_CODES.REMOVED]: 'This music has been removed from the advertising library.',
  [MUSIC_ERROR_CODES.POLICY_VIOLATION]: 'Music violates content policies.',
  [MUSIC_ERROR_CODES.OBJECTIVE_INCOMPATIBLE]: 'Music not compatible with your objective.',
  [MUSIC_ERROR_CODES.USAGE_LIMIT_EXCEEDED]: 'Music usage limit exceeded.',
  [MUSIC_ERROR_CODES.UNDER_REVIEW]: 'Music is under review.',
  [MUSIC_ERROR_CODES.PERMISSION_DENIED]: 'Missing permissions for this music.'
};

// ================= MUSIC FILE TYPES =================

export const MUSIC_FILE_TYPES = {
  MP3: 'audio/mpeg',
  WAV: 'audio/wav',
  M4A: 'audio/mp4',
  AAC: 'audio/aac'
};

// ================= MUSIC VALIDATION RULES =================

export const MUSIC_VALIDATION = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_DURATION_TRAFFIC: 30, // seconds
  MAX_DURATION_CONVERSIONS: 60, // seconds
  MIN_DURATION: 5, // seconds
  ALLOWED_GENRES: [
    'Pop',
    'Hip Hop',
    'Electronic',
    'Rock',
    'R&B',
    'Country',
    'Jazz',
    'Classical'
  ]
};

// ================= FORM VALIDATION =================

export const FORM_VALIDATION = {
  CAMPAIGN_NAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 255
  },
  AD_TEXT: {
    MAX_LENGTH: 100
  },
  MUSIC: {
    MAX_FILE_SIZE: MUSIC_VALIDATION.MAX_FILE_SIZE,
    ALLOWED_TYPES: Object.values(MUSIC_FILE_TYPES),
    MAX_DURATION_TRAFFIC: MUSIC_VALIDATION.MAX_DURATION_TRAFFIC,
    MAX_DURATION_CONVERSIONS: MUSIC_VALIDATION.MAX_DURATION_CONVERSIONS
  }
};
