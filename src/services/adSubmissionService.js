import tiktokApi from './tiktokApi';
import validationService from './validationService';
import { AD_OBJECTIVES, API_ENDPOINTS } from '../utils/constants';

class AdSubmissionService {
  constructor() {
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 second
  }

  // Main submission method
  async submitAd(formData, advertiserId) {
    try {
      console.log('Starting ad submission process...');
      
      // 1. Validate form data
      const validation = validationService.validateForm(formData);
      if (!validation.valid) {
        throw this.formatValidationError(validation.errors);
      }

      // 2. Format data for API
      const apiData = this.formatForApi(formData, advertiserId);
      
      // 3. Pre-submission validation (optional)
      await this.preValidateAd(apiData);

      // 4. Submit to TikTok API with retry logic
      const result = await this.submitWithRetry(apiData);

      // 5. Post-submission processing
      await this.handleSubmissionSuccess(result, formData);

      return result;

    } catch (error) {
      console.error('Ad submission failed:', error);
      throw this.formatSubmissionError(error);
    }
  }

  // Format form data for TikTok API
  formatForApi(formData, advertiserId) {
    const apiData = {
      advertiser_id: advertiserId,
      campaign_name: formData.campaignName.trim(),
      objective: formData.objective,
      ad_text: formData.adText.trim(),
      call_to_action: formData.cta,
      operation_status: 'ENABLE', // Enable the ad immediately
      creative_type: 'NORMAL',
      // Required fields for TikTok Ads API
      placements: ['PLACEMENT_TIKTOK'],
      identity_type: 'AUTO',
      display_name: formData.campaignName.trim().substring(0, 50),
      profile_image: 'AUTO'
    };

    // Add music information if applicable
    if (formData.musicOption !== 'none') {
      apiData.audio = {
        audio_id: formData.musicId,
        audio_name: formData.musicOption === 'existing' 
          ? 'Existing Music' 
          : formData.customMusicName
      };
    }

    // Add objective-specific settings
    if (formData.objective === AD_OBJECTIVES.TRAFFIC) {
      apiData.deep_link = {
        deep_link_type: 'NONE'
      };
    } else if (formData.objective === AD_OBJECTIVES.CONVERSIONS) {
      apiData.conversion = {
        conversion_id: 'demo_conversion_id', // Would be real conversion pixel ID
        conversion_type: 'PURCHASE'
      };
    }

    // Add tracking and monitoring
    apiData.tracking = {
      impression_tracking_url: this.generateTrackingUrl('impression', advertiserId),
      click_tracking_url: this.generateTrackingUrl('click', advertiserId)
    };

    return apiData;
  }

  // Pre-validate ad before submission
  async preValidateAd(apiData) {
    try {
      console.log('Pre-validating ad creative...');
      
      // Use TikTok's validation endpoint if available
      const validationResult = await tiktokApi.validateAdCreative(apiData);
      
      if (validationResult && validationResult.errors) {
        const validationErrors = validationResult.errors.map(err => 
          `${err.field}: ${err.message}`
        ).join(', ');
        
        throw new Error(`Pre-validation failed: ${validationErrors}`);
      }

      return validationResult;
    } catch (error) {
      console.warn('Pre-validation warning:', error.message);
      // Don't fail submission on pre-validation errors, just log them
      return null;
    }
  }

  // Submit with retry logic
  async submitWithRetry(apiData, retryCount = 0) {
    try {
      console.log(`Submitting ad (attempt ${retryCount + 1})...`);
      
      // Real TikTok API call
      const result = await tiktokApi.createAd(apiData);
      
      console.log('Ad submission successful:', result);
      return result;

    } catch (error) {
      console.error(`Submission attempt ${retryCount + 1} failed:`, error);

      // Check if we should retry
      if (this.shouldRetry(error) && retryCount < this.maxRetries) {
        const delay = this.retryDelay * Math.pow(2, retryCount); // Exponential backoff
        console.log(`Retrying in ${delay}ms...`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.submitWithRetry(apiData, retryCount + 1);
      }

      throw error;
    }
  }

  // Determine if error is retryable
  shouldRetry(error) {
    const retryableErrors = [
      'ETIMEDOUT',
      'ECONNRESET',
      'ECONNABORTED',
      'ENETUNREACH',
      'EAI_AGAIN',
      'timeout',
      'network',
      'Rate limit',
      'Too many requests',
      'Server error',
      'Gateway timeout'
    ];

    const errorMessage = error.message.toLowerCase();
    
    return retryableErrors.some(retryableError => 
      errorMessage.includes(retryableError.toLowerCase())
    );
  }

  // Handle successful submission
  async handleSubmissionSuccess(result, formData) {
    try {
      // Store submission details
      const submissionDetails = {
        adId: result.ad_id || result.id,
        campaignName: formData.campaignName,
        objective: formData.objective,
        submittedAt: new Date().toISOString(),
        status: 'PENDING_REVIEW'
      };

      localStorage.setItem('last_ad_submission', JSON.stringify(submissionDetails));
      
      // Log to analytics (simulated)
      await this.logAnalytics('ad_created', submissionDetails);

      // Send notification (simulated)
      await this.sendNotification('Ad created successfully', submissionDetails);

      console.log('Post-submission processing complete');

    } catch (error) {
      console.warn('Post-submission processing failed:', error);
      // Don't throw - submission was successful
    }
  }

  // Format validation errors for display
  formatValidationError(errors) {
    const errorMessages = Object.entries(errors)
      .map(([field, message]) => `${this.formatFieldName(field)}: ${message}`)
      .join('\n');

    return new Error(`Please fix the following errors:\n${errorMessages}`);
  }

  // Format field names for display
  formatFieldName(field) {
    const fieldNames = {
      campaignName: 'Campaign Name',
      objective: 'Objective',
      adText: 'Ad Text',
      cta: 'Call to Action',
      musicOption: 'Music Option',
      musicId: 'Music ID',
      customMusicName: 'Music Name'
    };

    return fieldNames[field] || field;
  }

  // Format submission errors for user display
  formatSubmissionError(error) {
    const errorMessage = error.message || 'Unknown error';
    
    // Handle specific TikTok API error codes
    if (error.response?.data?.error) {
      const apiError = error.response.data.error;
      return this.formatApiError(apiError);
    }

    // Handle network errors
    if (errorMessage.includes('network') || errorMessage.includes('Network')) {
      return new Error('Network error. Please check your internet connection and try again.');
    }

    // Handle timeout errors
    if (errorMessage.includes('timeout') || error.code === 'ETIMEDOUT') {
      return new Error('Request timeout. The server took too long to respond. Please try again.');
    }

    // Handle rate limiting
    if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
      return new Error('Too many requests. Please wait a moment before trying again.');
    }

    // Handle authentication errors
    if (errorMessage.includes('token') || errorMessage.includes('auth') || 
        errorMessage.includes('401') || errorMessage.includes('403')) {
      return new Error('Authentication error. Please reconnect your TikTok account.');
    }

    // Handle validation errors from API
    if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
      return new Error('Ad validation failed. Please check your inputs and try again.');
    }

    // Generic error with original message
    return new Error(`Failed to create ad: ${errorMessage}`);
  }

  // Format TikTok API errors
  formatApiError(apiError) {
    const errorCode = apiError.code;
    const errorMessage = apiError.message || 'Unknown API error';

    // TikTok Ads API specific error codes
    const errorMappings = {
      // Authentication errors
      40100: 'Authentication failed. Please reconnect your TikTok account.',
      40101: 'Access token expired. Please reconnect.',
      40102: 'Invalid access token. Please reconnect.',
      40103: 'Insufficient permissions. Check your account settings.',

      // Rate limiting
      42900: 'Too many requests. Please wait before trying again.',
      42901: 'Rate limit exceeded for this operation.',

      // Validation errors
      40000: 'Invalid request parameters. Please check your inputs.',
      40001: 'Invalid campaign name format.',
      40002: 'Invalid objective selected.',
      40003: 'Ad text validation failed.',
      40004: 'Invalid call to action.',
      40005: 'Invalid music configuration.',
      40006: 'Music not available for advertising.',
      40007: 'Objective and music combination not allowed.',

      // Business logic errors
      40300: 'Operation not allowed for your account.',
      40301: 'Advertiser account is not active.',
      40302: 'Insufficient balance or budget.',
      40303: 'Region restriction for this operation.',
      40304: 'Music not available in your region.',

      // Server errors
      50000: 'Internal server error. Please try again later.',
      50001: 'Service temporarily unavailable.',
      50002: 'Database error occurred.',

      // Ad review errors
      60000: 'Ad violates content policies.',
      60001: 'Ad contains restricted content.',
      60002: 'Music licensing issue detected.',
      60003: 'Ad requires manual review.'
    };

    const userMessage = errorMappings[errorCode] || 
      `API Error (${errorCode}): ${errorMessage}`;

    return new Error(userMessage);
  }

  // Generate tracking URLs
  generateTrackingUrl(type, advertiserId) {
    // These would be real tracking URLs in production
    const baseUrl = 'https://ads.tiktok.com/tracking';
    return `${baseUrl}/${type}?aid=${advertiserId}&ts=${Date.now()}`;
  }

  // Simulated analytics logging
  async logAnalytics(event, data) {
    try {
      // In production, this would send to analytics service
      console.log(`Analytics: ${event}`, data);
      
      const analyticsData = {
        event,
        data,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      };

      localStorage.setItem(`analytics_${event}_${Date.now()}`, JSON.stringify(analyticsData));
      
    } catch (error) {
      console.warn('Analytics logging failed:', error);
    }
  }

  // Simulated notification sending
  async sendNotification(message, data) {
    try {
      // In production, this could send email, push notification, etc.
      console.log(`Notification: ${message}`, data);
      
      const notification = {
        id: `notif_${Date.now()}`,
        message,
        data,
        timestamp: new Date().toISOString(),
        read: false
      };

      // Store for UI display
      const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
      notifications.unshift(notification);
      localStorage.setItem('notifications', JSON.stringify(notifications.slice(0, 50))); // Keep last 50
      
    } catch (error) {
      console.warn('Notification sending failed:', error);
    }
  }

  // Get submission status
  async getSubmissionStatus(adId) {
    try {
      // Real implementation would call TikTok API
      // This is a simulation
      const statuses = [
        'PENDING_REVIEW',
        'UNDER_REVIEW',
        'APPROVED',
        'REJECTED',
        'PAUSED'
      ];
      
      // Simulate status progression
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      
      return {
        ad_id: adId,
        status: randomStatus,
        last_updated: new Date().toISOString(),
        review_comments: randomStatus === 'REJECTED' ? 
          'Ad violates content policies. Please review guidelines.' : null
      };
      
    } catch (error) {
      console.error('Failed to get submission status:', error);
      throw this.formatSubmissionError(error);
    }
  }

  // Cancel/delete ad submission
  async cancelAd(adId, advertiserId) {
    try {
      console.log(`Cancelling ad ${adId}...`);
      
      // Real implementation would call TikTok API delete endpoint
      // This is a simulation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const result = {
        success: true,
        ad_id: adId,
        cancelled_at: new Date().toISOString(),
        message: 'Ad cancelled successfully'
      };

      await this.logAnalytics('ad_cancelled', { adId, advertiserId });
      
      return result;
      
    } catch (error) {
      console.error('Failed to cancel ad:', error);
      throw this.formatSubmissionError(error);
    }
  }
}

export default new AdSubmissionService();