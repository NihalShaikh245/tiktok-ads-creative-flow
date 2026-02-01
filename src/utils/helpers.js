export const generateRandomString = (length) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

export const validateCampaignName = (name) => {
  if (!name || name.trim().length < 3) {
    return 'Campaign name must be at least 3 characters';
  }
  return '';
};

export const validateAdText = (text) => {
  if (!text || text.trim().length === 0) {
    return 'Ad text is required';
  }
  if (text.length > 100) {
    return 'Ad text must be 100 characters or less';
  }
  return '';
};

export const validateMusicId = (musicId) => {
  if (!musicId || musicId.trim().length === 0) {
    return 'Music ID is required';
  }
  if (!/^\d+$/.test(musicId)) {
    return 'Music ID must contain only numbers';
  }
  return '';
};

export const parseOAuthError = (errorCode, errorMessage) => {
  switch (errorCode) {
    case 10004:
      return 'Invalid client credentials. Please check your TikTok App configuration.';
    case 10007:
      return 'Authorization code is invalid or has expired.';
    case 10008:
      return 'Access token has expired. Please reconnect your account.';
    case 20003:
      return 'Insufficient permissions. Please ensure your TikTok App has the required scopes.';
    case 20004:
      return 'TikTok Ads API is not available in your region.';
    default:
      return errorMessage || 'Authentication failed. Please try again.';
  }
};

export const getQueryParam = (param) => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
};

// Add form validation helpers
export const validateFile = (file, maxSize, allowedTypes) => {
  if (!file) {
    return { valid: false, message: 'No file selected' };
  }

  if (file.size > maxSize) {
    return { valid: false, message: `File size must be less than ${maxSize / (1024 * 1024)}MB` };
  }

  if (!allowedTypes.includes(file.type)) {
    return { 
      valid: false, 
      message: `Invalid file type. Allowed types: ${allowedTypes.map(t => t.split('/')[1]).join(', ')}` 
    };
  }

  return { valid: true };
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
};