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
  createAd: 'https://business-api.tiktok.com/open_api/v1.3/ad/create/'
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