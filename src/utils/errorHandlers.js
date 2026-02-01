import { AD_OBJECTIVES, MUSIC_OPTIONS } from './constants';

// Centralized error handler
export class ErrorHandler {
  constructor() {
    this.errorCallbacks = [];
  }

  // Register error callback
  onError(callback) {
    this.errorCallbacks.push(callback);
  }

  // Handle error
  handleError(error, context = {}) {
    console.error('Error occurred:', error, 'Context:', context);
    
    // Format error for user display
    const userError = this.formatErrorForUser(error, context);
    
    // Notify all registered callbacks
    this.errorCallbacks.forEach(callback => {
      callback(userError, context);
    });

    // Log to analytics (simulated)
    this.logError(error, context);

    return userError;
  }

  // Format error for user display
  formatErrorForUser(error, context) {
    const errorObj = {
      message: error.message || 'An unexpected error occurred',
      type: this.getErrorType(error),
      context,
      timestamp: new Date().toISOString(),
      originalError: error
    };

    // Add user-friendly message
    errorObj.userMessage = this.getUserFriendlyMessage(errorObj);

    // Add recovery suggestions
    errorObj.suggestions = this.getRecoverySuggestions(errorObj);

    return errorObj;
  }

  // Determine error type
  getErrorType(error) {
    const message = error.message?.toLowerCase() || '';
    const code = error.code || error.status;

    if (code === 401 || message.includes('token') || message.includes('auth')) {
      return 'authentication';
    }
    if (code === 403 || message.includes('permission') || message.includes('forbidden')) {
      return 'authorization';
    }
    if (code === 429 || message.includes('rate limit')) {
      return 'rate_limit';
    }
    if (code === 400 || message.includes('validation') || message.includes('invalid')) {
      return 'validation';
    }
    if (code >= 500 || message.includes('server') || message.includes('internal')) {
      return 'server';
    }
    if (message.includes('network') || message.includes('timeout') || message.includes('offline')) {
      return 'network';
    }
    if (message.includes('music') || message.includes('audio')) {
      return 'music';
    }
    return 'unknown';
  }

  // Get user-friendly error message
  getUserFriendlyMessage(errorObj) {
    const { type, originalError, context } = errorObj;

    const messages = {
      authentication: 'Authentication failed. Please reconnect your TikTok account.',
      authorization: 'You don\'t have permission to perform this action.',
      rate_limit: 'Too many requests. Please wait a moment before trying again.',
      validation: 'Please check your inputs and try again.',
      server: 'Server error. Please try again in a few minutes.',
      network: 'Network connection issue. Please check your internet connection.',
      music: 'There was an issue with your music selection.',
      unknown: 'An unexpected error occurred. Please try again.'
    };

    let message = messages[type] || messages.unknown;

    // Add context-specific information
    if (context.field) {
      message = `${this.formatFieldName(context.field)}: ${message}`;
    }

    // Add specific error details if available
    if (originalError.details) {
      message += ` (${originalError.details})`;
    }

    return message;
  }

  // Get recovery suggestions
  getRecoverySuggestions(errorObj) {
    const { type, context } = errorObj;

    const suggestions = {
      authentication: [
        'Click "Disconnect Account" in the header',
        'Reconnect with required permissions',
        'Check if your TikTok account has Ads access'
      ],
      authorization: [
        'Check your account permissions',
        'Ensure your TikTok Ads account is active',
        'Contact your account administrator'
      ],
      rate_limit: [
        'Wait 1-2 minutes before retrying',
        'Reduce the frequency of requests',
        'Check for scheduled maintenance'
      ],
      validation: [
        'Review all form fields for errors',
        'Check character limits',
        'Verify required fields are filled'
      ],
      server: [
        'Try again in a few minutes',
        'Check TikTok Ads status page',
        'Contact support if issue persists'
      ],
      network: [
        'Check your internet connection',
        'Try reloading the page',
        'Disable VPN or proxy if used'
      ],
      music: [
        'Verify music ID is correct',
        'Check if music is available for advertising',
        'Try a different music selection'
      ],
      unknown: [
        'Refresh the page',
        'Clear browser cache',
        'Try a different browser',
        'Contact support'
      ]
    };

    // Add context-specific suggestions
    if (context.objective === AD_OBJECTIVES.CONVERSIONS && type === 'music') {
      suggestions.music.push('Music is required for Conversions objective');
    }

    return suggestions[type] || suggestions.unknown;
  }

  // Format field names for display
  formatFieldName(field) {
    const fieldMap = {
      campaignName: 'Campaign Name',
      objective: 'Objective',
      adText: 'Ad Text',
      cta: 'Call to Action',
      musicOption: 'Music Option',
      musicId: 'Music ID',
      customMusicName: 'Custom Music Name'
    };

    return fieldMap[field] || field;
  }

  // Log error to analytics
  logError(error, context) {
    try {
      const errorLog = {
        error: {
          message: error.message,
          stack: error.stack,
          code: error.code,
          status: error.status
        },
        context,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
      };

      // Store in localStorage for debugging
      const errorLogs = JSON.parse(localStorage.getItem('error_logs') || '[]');
      errorLogs.unshift(errorLog);
      localStorage.setItem('error_logs', JSON.stringify(errorLogs.slice(0, 100))); // Keep last 100 errors

      // In production, this would send to error tracking service
      console.log('Error logged:', errorLog);

    } catch (loggingError) {
      console.warn('Failed to log error:', loggingError);
    }
  }

  // Clear old error logs
  clearOldErrorLogs(daysOld = 7) {
    try {
      const cutoff = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
      const errorLogs = JSON.parse(localStorage.getItem('error_logs') || '[]');
      const filteredLogs = errorLogs.filter(log => 
        new Date(log.timestamp).getTime() > cutoff
      );
      localStorage.setItem('error_logs', JSON.stringify(filteredLogs));
    } catch (error) {
      console.warn('Failed to clear old error logs:', error);
    }
  }
}

// Create singleton instance
export const errorHandler = new ErrorHandler();

// Helper function for common error patterns
export const handleApiError = (error, operation) => {
  const context = { operation };
  
  if (error.response) {
    // API responded with error status
    context.status = error.response.status;
    context.data = error.response.data;
    
    if (error.response.status === 401) {
      return errorHandler.handleError(new Error('Session expired. Please reconnect.'), context);
    }
    
    if (error.response.status === 403) {
      return errorHandler.handleError(new Error('Insufficient permissions.'), context);
    }
    
    if (error.response.status === 429) {
      return errorHandler.handleError(new Error('Rate limit exceeded.'), context);
    }
  }
  
  if (error.request) {
    // Request made but no response
    return errorHandler.handleError(new Error('Network error. No response from server.'), context);
  }
  
  // Something else happened
  return errorHandler.handleError(error, context);
};

// Form validation error handler
export const handleValidationError = (field, message, value) => {
  const error = new Error(message);
  error.field = field;
  error.value = value;
  error.type = 'validation';
  
  return errorHandler.handleError(error, { field, value });
};

// Music validation error handler
export const handleMusicError = (error, musicOption, musicId) => {
  const context = { 
    musicOption, 
    musicId,
    operation: 'music_validation'
  };
  
  return errorHandler.handleError(error, context);
};