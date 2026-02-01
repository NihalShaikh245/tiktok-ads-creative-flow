import { AD_OBJECTIVES, MUSIC_OPTIONS } from './constants';

// Generate mock music ID for custom uploads
export const generateMockMusicId = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `custom_${timestamp}_${random}`;
};

// Parse music ID from various formats
export const parseMusicId = (input) => {
  if (!input) return null;
  
  // Remove any non-numeric characters for existing music IDs
  const numericId = input.replace(/\D/g, '');
  
  if (numericId.length >= 9) {
    return numericId;
  }
  
  // Check if it's a custom ID format
  if (input.startsWith('custom_')) {
    return input;
  }
  
  return null;
};

// Validate music compatibility with objective
export const validateMusicCompatibility = (musicData, objective) => {
  const issues = [];
  
  if (!musicData) {
    issues.push('No music data provided');
    return issues;
  }
  
  // Check if music is available
  if (musicData.status !== 2) {
    issues.push('Music is not available for advertising');
  }
  
  // Check objective restrictions
  if (musicData.objective_restrictions) {
    const restrictions = musicData.objective_restrictions;
    
    if (restrictions.includes('ALL')) {
      issues.push('Music has restrictions for all objectives');
    } else if (restrictions.includes(objective)) {
      issues.push(`Music has restrictions for ${objective} objective`);
    }
  }
  
  // Check duration for different objectives
  if (musicData.duration) {
    const maxDuration = objective === AD_OBJECTIVES.CONVERSIONS ? 60 : 30;
    if (musicData.duration > maxDuration) {
      issues.push(`Music duration (${musicData.duration}s) exceeds recommended maximum of ${maxDuration}s for ${objective}`);
    }
  }
  
  return issues;
};

// Format music duration for display
export const formatDuration = (seconds) => {
  if (!seconds) return '0:00';
  
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Get music option display name
export const getMusicOptionDisplayName = (option) => {
  const displayNames = {
    [MUSIC_OPTIONS.EXISTING]: 'Existing Music ID',
    [MUSIC_OPTIONS.UPLOAD]: 'Upload Custom Music',
    [MUSIC_OPTIONS.NONE]: 'No Music'
  };
  
  return displayNames[option] || option;
};

// Check if music is required for objective
export const isMusicRequiredForObjective = (objective) => {
  return objective === AD_OBJECTIVES.CONVERSIONS;
};

// Get music validation steps based on option
export const getMusicValidationSteps = (musicOption) => {
  const steps = {
    [MUSIC_OPTIONS.EXISTING]: [
      'Enter Music ID',
      'Validate with TikTok API',
      'Check availability for advertising',
      'Confirm compatibility with objective'
    ],
    [MUSIC_OPTIONS.UPLOAD]: [
      'Upload audio file',
      'File validation (size, format)',
      'Content review simulation',
      'Generate unique Music ID',
      'Ready for use'
    ],
    [MUSIC_OPTIONS.NONE]: [
      'Confirm objective compatibility',
      'Acknowledge performance considerations',
      'Proceed without music'
    ]
  };
  
  return steps[musicOption] || [];
};

// Calculate upload progress simulation
export const simulateUploadProgress = (currentProgress, speed = 'normal') => {
  const speeds = {
    slow: 5,
    normal: 10,
    fast: 20
  };
  
  const increment = speeds[speed] || speeds.normal;
  const newProgress = currentProgress + increment;
  
  return Math.min(newProgress, 100);
};

// Get music error suggestions
export const getMusicErrorSuggestions = (errorCode) => {
  const suggestions = {
    'INVALID_ID': [
      'Check the Music ID format (should be numbers only)',
      'Verify the ID from TikTok Sound Library',
      'Try searching for the music by name if available'
    ],
    'NOT_AVAILABLE': [
      'The music may not be licensed for advertising',
      'Try a different music ID',
      'Consider uploading custom music instead',
      'Check if the music is available in your region'
    ],
    'UPLOAD_FAILED': [
      'Check file size (max 10MB)',
      'Ensure file format is supported (MP3, WAV, M4A)',
      'Try compressing the audio file',
      'Check your internet connection'
    ],
    'VALIDATION_FAILED': [
      'Wait a moment and try validating again',
      'Check your network connection',
      'Ensure you have proper permissions',
      'Contact support if issue persists'
    ]
  };
  
  return suggestions[errorCode] || [
    'Try again in a moment',
    'Check your internet connection',
    'Verify your TikTok account permissions',
    'Contact support if the problem continues'
  ];
};