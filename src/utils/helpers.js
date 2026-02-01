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