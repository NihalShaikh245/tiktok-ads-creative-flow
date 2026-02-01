import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

import SubmissionError from './SubmissionError';
import SubmissionSuccess from './SubmissionSuccess';
import MusicSelection from './MusicSelection';

import adSubmissionService from '../services/adSubmissionService';
import tiktokApi from '../services/tiktokApi';

import {
  validateCampaignName,
  validateAdText
} from '../utils/helpers';

import {
  AD_OBJECTIVES,
  CTA_OPTIONS,
  MUSIC_OPTIONS
} from '../utils/constants';

// MUI form components
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

const AdCreationForm = ({ accessToken, onError, onSuccess }) => {

  // ================= STATE =================

  const [formData, setFormData] = useState({
    campaignName: '',
    objective: AD_OBJECTIVES.TRAFFIC,
    adText: '',
    cta: CTA_OPTIONS[0].value,
    musicOption: MUSIC_OPTIONS.EXISTING,
    musicId: '',
    customMusicFile: null,
    customMusicName: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [advertiserInfo, setAdvertiserInfo] = useState(null);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [submissionError, setSubmissionError] = useState(null);
  const [fieldTouched, setFieldTouched] = useState({});

  // ================= FETCH ADVERTISER =================

  useEffect(() => {
    if (!accessToken) return;

    const fetchAdvertiserInfo = async () => {
      try {
        setLoading(true);
        const info = await tiktokApi.getAdvertiserInfo();
        setAdvertiserInfo(info);
      } catch (error) {
        console.error(error);
        onError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAdvertiserInfo();
  }, [accessToken, onError]);

  // ================= VALIDATION =================

  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'campaignName':
        error = validateCampaignName(value);
        break;

      case 'adText':
        error = validateAdText(value);
        break;

      case 'objective':
      case 'cta':
        if (!value) error = 'This field is required';
        break;

      case 'musicId':
        if (formData.musicOption === MUSIC_OPTIONS.EXISTING && !value) {
          error = 'Music ID is required';
        }
        break;

      case 'customMusicName':
        if (formData.musicOption === MUSIC_OPTIONS.UPLOAD && !value) {
          error = 'Music name is required';
        }
        break;

      default:
        break;
    }

    setErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  };

  const validateForm = () => {
    let isValid = true;

    Object.keys(formData).forEach(field => {
      if (field !== 'customMusicFile') {
        if (!validateField(field, formData[field])) {
          isValid = false;
        }
      }
    });

    if (
      formData.objective === AD_OBJECTIVES.CONVERSIONS &&
      formData.musicOption === MUSIC_OPTIONS.NONE
    ) {
      setErrors(prev => ({
        ...prev,
        musicOption: 'Music is required for Conversions objective'
      }));
      isValid = false;
    }

    return isValid;
  };

  // ================= HANDLERS =================

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({ ...prev, [name]: value }));
    setFieldTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const handleMusicSelectionChange = (musicData) => {
    setFormData(prev => ({ ...prev, ...musicData }));
    setErrors(prev => ({
      ...prev,
      musicOption: '',
      musicId: '',
      customMusicName: ''
    }));
  };

  const submitAd = async () => {
    if (!validateForm()) {
      onError('Please fix the errors before submitting.');
      return;
    }

    try {
      setSubmitting(true);
      setSubmissionError(null);

      const result = await adSubmissionService.submitAd(
        formData,
        advertiserInfo?.advertiser_id
      );

      const submissionData = {
        adId: result.ad_id || `AD_${Date.now()}`,
        campaignName: formData.campaignName,
        objective: formData.objective,
        submittedAt: new Date().toISOString(),
        estimatedReviewTime: '1–24 hours'
      };

      setSubmissionResult(submissionData);
      onSuccess?.(submissionData.campaignName, submissionData.adId);

    } catch (error) {
      console.error(error);
      setSubmissionError(error);
      onError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const touched = {};
    Object.keys(formData).forEach(f => (touched[f] = true));
    setFieldTouched(touched);

    submitAd();
  };

  const handleRetry = () => {
    setSubmissionError(null);
    submitAd();
  };

  // ================= UI STATES =================

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (submissionResult) {
    return (
      <SubmissionSuccess
        submissionData={submissionResult}
        onCreateAnother={() => setSubmissionResult(null)}
      />
    );
  }

  // ================= FORM =================

  return (
    <Paper elevation={3} sx={{ p: 4, borderRadius: 2, position: 'relative' }}>
      {submissionError && (
        <SubmissionError
          error={submissionError}
          onRetry={handleRetry}
          onClose={() => setSubmissionError(null)}
          formData={formData}
        />
      )}

      <Typography variant="h5" gutterBottom>
        Create New Ad Creative
      </Typography>

      {advertiserInfo && (
        <Typography variant="body2" color="text.secondary">
          Advertiser: <strong>{advertiserInfo.advertiser_name}</strong>
        </Typography>
      )}

      <form onSubmit={handleSubmit}>
        {/* Campaign Name */}
        <TextField
          fullWidth
          label="Campaign Name"
          name="campaignName"
          value={formData.campaignName}
          onChange={handleInputChange}
          error={!!errors.campaignName}
          helperText={errors.campaignName || 'Minimum 3 characters'}
          margin="normal"
          required
        />

        {/* Objective */}
        <FormControl fullWidth margin="normal">
          <InputLabel>Objective *</InputLabel>
          <Select
            name="objective"
            value={formData.objective}
            onChange={handleInputChange}
            label="Objective *"
          >
            <MenuItem value={AD_OBJECTIVES.TRAFFIC}>Traffic</MenuItem>
            <MenuItem value={AD_OBJECTIVES.CONVERSIONS}>Conversions</MenuItem>
          </Select>
        </FormControl>

        {/* Ad Text */}
        <TextField
          fullWidth
          label="Ad Text"
          name="adText"
          value={formData.adText}
          onChange={handleInputChange}
          multiline
          rows={3}
          helperText={`${formData.adText.length}/100 characters`}
          margin="normal"
          required
        />

        {/* CTA */}
        <FormControl fullWidth margin="normal">
          <InputLabel>Call to Action *</InputLabel>
          <Select
            name="cta"
            value={formData.cta}
            onChange={handleInputChange}
            label="Call to Action *"
          >
            {CTA_OPTIONS.map(opt => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Music */}
        <MusicSelection
          formData={formData}
          errors={errors}
          onChange={handleMusicSelectionChange}
          objective={formData.objective}
          onError={onError}
          disabled={submitting}
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{ mt: 3 }}
          disabled={submitting}
        >
          {submitting ? 'Submitting…' : 'Create Ad'}
        </Button>
      </form>
    </Paper>
  );
};

export default AdCreationForm;
