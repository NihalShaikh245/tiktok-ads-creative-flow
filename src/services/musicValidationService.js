import { FORM_VALIDATION, AD_OBJECTIVES, MUSIC_OPTIONS } from '../utils/constants';

class MusicValidationService {
  constructor() {
    this.maxFileSize = FORM_VALIDATION.MUSIC.MAX_FILE_SIZE;
    this.allowedTypes = FORM_VALIDATION.MUSIC.ALLOWED_TYPES;
  }

  // Validate music file
  validateMusicFile(file) {
    if (!file) {
      return { valid: false, message: 'No file selected' };
    }

    // Check file type
    if (!this.allowedTypes.includes(file.type)) {
      const allowedExtensions = this.allowedTypes.map(type => {
        const parts = type.split('/');
        return parts.length > 1 ? parts[1].toUpperCase() : type;
      }).join(', ');
      
      return { 
        valid: false, 
        message: `Unsupported file type. Allowed formats: ${allowedExtensions}` 
      };
    }

    // Check file size
    if (file.size > this.maxFileSize) {
      const maxSizeMB = this.maxFileSize / (1024 * 1024);
      return { 
        valid: false, 
        message: `File size exceeds ${maxSizeMB}MB limit. Please choose a smaller file.` 
      };
    }

    // Check file name length
    if (file.name.length > 100) {
      return { 
        valid: false, 
        message: 'File name is too long. Please rename the file.' 
      };
    }

    // Check for special characters in filename
    const invalidChars = /[<>:"/\\|?*\x00-\x1F]/g;
    if (invalidChars.test(file.name)) {
      return { 
        valid: false, 
        message: 'File name contains invalid characters.' 
      };
    }

    return { valid: true };
  }

  // Validate music ID format
  validateMusicIdFormat(musicId) {
    if (!musicId || musicId.trim().length === 0) {
      return { valid: false, message: 'Music ID is required' };
    }

    // TikTok music IDs are typically numeric
    if (!/^\d+$/.test(musicId)) {
      return { valid: false, message: 'Music ID must contain only numbers' };
    }

    // Check length (typical TikTok music IDs are 9-19 digits)
    if (musicId.length < 9 || musicId.length > 19) {
      return { 
        valid: false, 
        message: 'Music ID appears to be invalid. Please check the format.' 
      };
    }

    return { valid: true };
  }

  // Validate music option based on objective
  validateMusicOption(musicOption, objective) {
    if (!musicOption) {
      return { valid: false, message: 'Please select a music option' };
    }

    // Check if valid option
    const validOptions = Object.values(MUSIC_OPTIONS);
    if (!validOptions.includes(musicOption)) {
      return { valid: false, message: 'Invalid music option selected' };
    }

    // Objective-specific validation
    if (objective === AD_OBJECTIVES.CONVERSIONS && musicOption === MUSIC_OPTIONS.NONE) {
      return { 
        valid: false, 
        message: 'Music is required for Conversions objective. Please select "Existing Music ID" or "Upload Custom Music".' 
      };
    }

    return { valid: true };
  }

  // Validate custom music name
  validateCustomMusicName(name) {
    if (!name || name.trim().length === 0) {
      return { valid: false, message: 'Music name is required for custom music' };
    }

    if (name.trim().length < 2) {
      return { valid: false, message: 'Music name must be at least 2 characters' };
    }

    if (name.length > 100) {
      return { valid: false, message: 'Music name must be 100 characters or less' };
    }

    // Check for invalid characters
    const invalidChars = /[<>:"/\\|?*\x00-\x1F]/g;
    if (invalidChars.test(name)) {
      return { valid: false, message: 'Music name contains invalid characters' };
    }

    return { valid: true };
  }

  // Get music option requirements for display
  getMusicRequirements(objective) {
    const requirements = {
      [MUSIC_OPTIONS.EXISTING]: {
        title: 'Existing Music ID',
        description: 'Use music from TikTok\'s official library',
        requirements: [
          'Must be a valid TikTok Music ID',
          'Music must be available for advertising',
          'ID can be found in TikTok Sound Library'
        ],
        allowedFor: [AD_OBJECTIVES.TRAFFIC, AD_OBJECTIVES.CONVERSIONS]
      },
      [MUSIC_OPTIONS.UPLOAD]: {
        title: 'Upload Custom Music',
        description: 'Upload your own audio file',
        requirements: [
          'File size: Max 10MB',
          'Formats: MP3, WAV, M4A',
          'Must comply with content policies',
          'Will be reviewed before use'
        ],
        allowedFor: [AD_OBJECTIVES.TRAFFIC, AD_OBJECTIVES.CONVERSIONS]
      },
      [MUSIC_OPTIONS.NONE]: {
        title: 'No Music',
        description: 'Create ad without background music',
        requirements: [
          'Only available for Traffic objective',
          'May affect ad performance',
          'Use for specific creative purposes only'
        ],
        allowedFor: [AD_OBJECTIVES.TRAFFIC]
      }
    };

    return requirements;
  }

  // Check if music option is allowed for objective
  isMusicOptionAllowed(musicOption, objective) {
    const requirements = this.getMusicRequirements(objective);
    const option = requirements[musicOption];
    
    if (!option) return false;
    
    return option.allowedFor.includes(objective);
  }

  // Get validation status icon and color
  getValidationStatus(valid, option) {
    if (option === MUSIC_OPTIONS.NONE) {
      return {
        icon: 'info',
        color: 'info',
        message: 'No music selected'
      };
    }

    if (valid === true) {
      return {
        icon: 'check_circle',
        color: 'success',
        message: 'Validated successfully'
      };
    }

    if (valid === false) {
      return {
        icon: 'error',
        color: 'error',
        message: 'Validation required'
      };
    }

    return {
      icon: 'help',
      color: 'warning',
      message: 'Not validated yet'
    };
  }

  // Format file size for display
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Get file type from MIME type
  getFileType(mimeType) {
    const typeMap = {
      'audio/mpeg': 'MP3',
      'audio/wav': 'WAV',
      'audio/mp4': 'M4A',
      'audio/x-m4a': 'M4A',
      'audio/aac': 'AAC'
    };
    
    return typeMap[mimeType] || mimeType.split('/')[1]?.toUpperCase() || 'Unknown';
  }
}

export default new MusicValidationService();