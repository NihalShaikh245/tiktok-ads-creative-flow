import { AD_OBJECTIVES } from '../utils/constants';

class ValidationService {
  // Campaign name validation
  validateCampaignName(name) {
    if (!name || name.trim().length === 0) {
      return { valid: false, message: 'Campaign name is required' };
    }
    
    if (name.trim().length < 3) {
      return { valid: false, message: 'Campaign name must be at least 3 characters' };
    }
    
    if (name.length > 255) {
      return { valid: false, message: 'Campaign name must be less than 255 characters' };
    }
    
    return { valid: true };
  }

  // Ad text validation
  validateAdText(text) {
    if (!text || text.trim().length === 0) {
      return { valid: false, message: 'Ad text is required' };
    }
    
    if (text.length > 100) {
      return { valid: false, message: 'Ad text must be 100 characters or less' };
    }
    
    return { valid: true };
  }

  // Objective validation
  validateObjective(objective) {
    if (!objective) {
      return { valid: false, message: 'Please select an objective' };
    }
    
    const validObjectives = Object.values(AD_OBJECTIVES);
    if (!validObjectives.includes(objective)) {
      return { valid: false, message: 'Invalid objective selected' };
    }
    
    return { valid: true };
  }

  // CTA validation
  validateCTA(cta) {
    if (!cta) {
      return { valid: false, message: 'Please select a call to action' };
    }
    
    return { valid: true };
  }

  // Music validation based on objective and option
  validateMusic(musicOption, musicId, objective, customMusicName) {
    // If objective is CONVERSIONS, music is required
    if (objective === AD_OBJECTIVES.CONVERSIONS && musicOption === 'none') {
      return { valid: false, message: 'Music is required for Conversions objective' };
    }
    
    // Validate based on selected option
    switch (musicOption) {
      case 'existing':
        if (!musicId) {
          return { valid: false, message: 'Music ID is required' };
        }
        if (!/^\d+$/.test(musicId)) {
          return { valid: false, message: 'Music ID must contain only numbers' };
        }
        break;
        
      case 'upload':
        if (!customMusicName) {
          return { valid: false, message: 'Please provide a name for custom music' };
        }
        break;
        
      case 'none':
        // No validation needed for "none" option
        break;
        
      default:
        return { valid: false, message: 'Please select a valid music option' };
    }
    
    return { valid: true };
  }

  // Validate entire form
  validateForm(formData) {
    const errors = {};
    
    // Campaign name
    const campaignNameValidation = this.validateCampaignName(formData.campaignName);
    if (!campaignNameValidation.valid) {
      errors.campaignName = campaignNameValidation.message;
    }
    
    // Ad text
    const adTextValidation = this.validateAdText(formData.adText);
    if (!adTextValidation.valid) {
      errors.adText = adTextValidation.message;
    }
    
    // Objective
    const objectiveValidation = this.validateObjective(formData.objective);
    if (!objectiveValidation.valid) {
      errors.objective = objectiveValidation.message;
    }
    
    // CTA
    const ctaValidation = this.validateCTA(formData.cta);
    if (!ctaValidation.valid) {
      errors.cta = ctaValidation.message;
    }
    
    // Music
    const musicValidation = this.validateMusic(
      formData.musicOption,
      formData.musicId,
      formData.objective,
      formData.customMusicName
    );
    if (!musicValidation.valid) {
      errors.musicOption = musicValidation.message;
      if (formData.musicOption === 'existing') {
        errors.musicId = musicValidation.message;
      }
    }
    
    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Format form data for API submission
  formatFormDataForApi(formData, advertiserId) {
    const formattedData = {
      advertiser_id: advertiserId,
      campaign_name: formData.campaignName.trim(),
      objective: formData.objective,
      ad_text: formData.adText.trim(),
      call_to_action: formData.cta
    };

    // Add music info if applicable
    if (formData.musicOption !== 'none') {
      formattedData.music_info = {
        music_id: formData.musicOption === 'existing' ? formData.musicId : `custom_${Date.now()}`,
        music_title: formData.musicOption === 'existing' ? 'Existing Music' : formData.customMusicName,
        music_author: formData.musicOption === 'existing' ? 'TikTok Library' : 'Custom Upload'
      };
    }

    return formattedData;
  }
}

export default new ValidationService();