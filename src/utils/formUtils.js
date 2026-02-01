import { FORM_VALIDATION, AD_OBJECTIVES, MUSIC_OPTIONS } from './constants';

export const getInitialFormData = () => ({
  campaignName: '',
  objective: AD_OBJECTIVES.TRAFFIC,
  adText: '',
  cta: '',
  musicOption: MUSIC_OPTIONS.EXISTING,
  musicId: '',
  customMusicFile: null,
  customMusicName: ''
});

export const getInitialErrors = () => ({
  campaignName: '',
  objective: '',
  adText: '',
  cta: '',
  musicOption: '',
  musicId: '',
  customMusicName: ''
});

export const validateField = (name, value, formData) => {
  switch (name) {
    case 'campaignName':
      if (!value || value.trim().length === 0) {
        return 'Campaign name is required';
      }
      if (value.trim().length < FORM_VALIDATION.CAMPAIGN_NAME.MIN_LENGTH) {
        return `Campaign name must be at least ${FORM_VALIDATION.CAMPAIGN_NAME.MIN_LENGTH} characters`;
      }
      if (value.length > FORM_VALIDATION.CAMPAIGN_NAME.MAX_LENGTH) {
        return `Campaign name must be less than ${FORM_VALIDATION.CAMPAIGN_NAME.MAX_LENGTH} characters`;
      }
      return '';

    case 'adText':
      if (!value || value.trim().length === 0) {
        return 'Ad text is required';
      }
      if (value.length > FORM_VALIDATION.AD_TEXT.MAX_LENGTH) {
        return `Ad text must be ${FORM_VALIDATION.AD_TEXT.MAX_LENGTH} characters or less`;
      }
      return '';

    case 'objective':
      if (!value) {
        return 'Please select an objective';
      }
      return '';

    case 'cta':
      if (!value) {
        return 'Please select a call to action';
      }
      return '';

    case 'musicId':
      if (formData.musicOption === MUSIC_OPTIONS.EXISTING && !value) {
        return 'Music ID is required';
      }
      if (value && !/^\d+$/.test(value)) {
        return 'Music ID must contain only numbers';
      }
      return '';

    case 'customMusicName':
      if (formData.musicOption === MUSIC_OPTIONS.UPLOAD && !value) {
        return 'Please provide a name for custom music';
      }
      return '';

    case 'musicOption':
      if (formData.objective === AD_OBJECTIVES.CONVERSIONS && value === MUSIC_OPTIONS.NONE) {
        return 'Music is required for Conversions objective';
      }
      return '';

    default:
      return '';
  }
};

export const validateForm = (formData) => {
  const errors = {};
  let isValid = true;

  Object.keys(formData).forEach(field => {
    if (field !== 'customMusicFile') { // Skip file validation for now
      const error = validateField(field, formData[field], formData);
      if (error) {
        errors[field] = error;
        isValid = false;
      }
    }
  });

  return { isValid, errors };
};

export const formatFormForApi = (formData, advertiserId) => {
  const apiData = {
    advertiser_id: advertiserId,
    campaign_name: formData.campaignName.trim(),
    objective: formData.objective,
    ad_text: formData.adText.trim(),
    call_to_action: formData.cta
  };

  // Add music info if applicable
  if (formData.musicOption !== MUSIC_OPTIONS.NONE) {
    apiData.music_info = {
      music_id: formData.musicOption === MUSIC_OPTIONS.EXISTING 
        ? formData.musicId 
        : `custom_${Date.now()}`,
      music_title: formData.musicOption === MUSIC_OPTIONS.EXISTING 
        ? 'Existing Music' 
        : formData.customMusicName,
      music_author: formData.musicOption === MUSIC_OPTIONS.EXISTING 
        ? 'TikTok Library' 
        : 'Custom Upload'
    };
  }

  return apiData;
};

export const getAdTextCharacterCount = (text) => {
  const maxLength = FORM_VALIDATION.AD_TEXT.MAX_LENGTH;
  const currentLength = text.length;
  const remaining = maxLength - currentLength;
  
  return {
    current: currentLength,
    max: maxLength,
    remaining,
    isWarning: remaining <= 20 && remaining > 0,
    isError: remaining < 0
  };
};