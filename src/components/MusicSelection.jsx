import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SearchIcon from '@mui/icons-material/Search';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import tiktokApi from '../services/tiktokApi';
import validationService from '../services/validationService';
import { 
  AD_OBJECTIVES, 
  FORM_VALIDATION,
  MUSIC_OPTIONS 
} from '../utils/constants';
import { validateMusicId } from '../utils/helpers';

const MusicSelection = ({ formData, errors, onChange, disabled, objective, onError }) => {
  const [validatingMusic, setValidatingMusic] = useState(false);
  const [musicValidationResult, setMusicValidationResult] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchingMusic, setSearchingMusic] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  // Handle music option change
  const handleMusicOptionChange = (e) => {
    const musicOption = e.target.value;
    const updates = { musicOption };
    
    // Clear other fields when switching options
    if (musicOption !== MUSIC_OPTIONS.EXISTING) {
      updates.musicId = '';
      setMusicValidationResult(null);
    }
    if (musicOption !== MUSIC_OPTIONS.UPLOAD) {
      updates.customMusicFile = null;
      updates.customMusicName = '';
    }
    if (musicOption !== MUSIC_OPTIONS.NONE) {
      // Clear any previous errors for musicOption
      if (errors.musicOption) {
        onChange({ musicOption: '' });
      }
    }
    
    onChange(updates);
    setSearchResults([]);
  };

  // Handle existing music ID input
  const handleMusicIdChange = (e) => {
    const musicId = e.target.value;
    onChange({ musicId });
    
    // Clear validation results when ID changes
    if (musicValidationResult) {
      setMusicValidationResult(null);
    }
  };

  // Handle custom music name
  const handleCustomMusicNameChange = (e) => {
    onChange({ customMusicName: e.target.value });
  };

  // Handle file upload with simulation
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      // Validate file
      const validation = validationService.validateMusicFile(file);
      if (!validation.valid) {
        onError(validation.message);
        return;
      }

      setUploading(true);
      setUploadProgress(0);

      // Simulate upload progress
      const simulateUpload = () => {
        return new Promise((resolve) => {
          const interval = setInterval(() => {
            setUploadProgress(prev => {
              if (prev >= 100) {
                clearInterval(interval);
                resolve();
                return 100;
              }
              return prev + 10;
            });
          }, 200);
        });
      };

      await simulateUpload();

      // Generate mock music ID for uploaded file
      const mockMusicId = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      onChange({ 
        customMusicFile: file,
        customMusicName: file.name.replace(/\.[^/.]+$/, ""),
        musicId: mockMusicId // Store generated ID
      });

      // Simulate API validation for custom music
      const validationResult = {
        valid: true,
        musicId: mockMusicId,
        title: file.name.replace(/\.[^/.]+$/, ""),
        author: 'Custom Upload',
        duration: Math.floor(file.size / 10000), // Mock duration
        status: 'Available for ads',
        isCustom: true
      };

      setMusicValidationResult(validationResult);
      
    } catch (error) {
      onError(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Validate music ID with TikTok API
  const validateMusicWithApi = async () => {
    const musicIdError = validateMusicId(formData.musicId);
    if (musicIdError) {
      onError(musicIdError);
      return;
    }

    try {
      setValidatingMusic(true);
      setMusicValidationResult(null);
      
      // Call real TikTok API to validate music
      const musicInfo = await tiktokApi.getMusicInfo(formData.musicId);
      
      setMusicValidationResult({
        valid: musicInfo.status === 2,
        musicId: formData.musicId,
        title: musicInfo.title,
        author: musicInfo.author,
        duration: musicInfo.duration,
        status: musicInfo.status === 2 ? 'Available for ads' : 'Not available for advertising',
        isCustom: false
      });
      
      if (musicInfo.status !== 2) {
        onError('This music is not available for advertising use. Please choose different music.');
      }
      
    } catch (error) {
      setMusicValidationResult({
        valid: false,
        message: error.message,
        isCustom: false
      });
      onError(`Validation failed: ${error.message}`);
    } finally {
      setValidatingMusic(false);
    }
  };

  // Search for music (simulated - real API would require search endpoint)
  const handleSearchMusic = async () => {
    if (!searchQuery.trim()) {
      onError('Please enter a search term');
      return;
    }

    try {
      setSearchingMusic(true);
      
      // Note: TikTok Ads API doesn't have public music search endpoint
      // This is a simulation for demonstration
      const mockResults = [
        {
          id: '123456789',
          title: `${searchQuery} - Popular Track`,
          author: 'Popular Artist',
          duration: 30,
          status: 2
        },
        {
          id: '987654321',
          title: `${searchQuery} - Trending Sound`,
          author: 'Trending Creator',
          duration: 45,
          status: 2
        },
        {
          id: '555555555',
          title: `${searchQuery} - Viral Audio`,
          author: 'Viral Artist',
          duration: 60,
          status: 1 // Not available for ads
        }
      ];
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSearchResults(mockResults);
      
    } catch (error) {
      onError(`Search failed: ${error.message}`);
    } finally {
      setSearchingMusic(false);
    }
  };

  // Select music from search results
  const handleSelectMusic = (music) => {
    onChange({ 
      musicId: music.id,
      musicOption: MUSIC_OPTIONS.EXISTING 
    });
    
    setMusicValidationResult({
      valid: music.status === 2,
      musicId: music.id,
      title: music.title,
      author: music.author,
      duration: music.duration,
      status: music.status === 2 ? 'Available for ads' : 'Not available',
      isCustom: false
    });
    
    setSearchQuery('');
    setSearchResults([]);
  };

  // Clear search results
  const handleClearSearch = () => {
    setSearchResults([]);
    setSearchQuery('');
  };

  // Check if no music is allowed for current objective
  const isNoMusicAllowed = objective === AD_OBJECTIVES.TRAFFIC;

  // Get validation status color
  const getValidationStatusColor = () => {
    if (!musicValidationResult) return 'default';
    return musicValidationResult.valid ? 'success' : 'error';
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        Music Selection
        <Tooltip title="Music selection rules vary by objective">
          <InfoIcon fontSize="small" color="action" />
        </Tooltip>
      </Typography>

      <FormControl component="fieldset" error={!!errors.musicOption} disabled={disabled} fullWidth>
        <FormLabel component="legend" sx={{ mb: 2, fontWeight: 500 }}>
          Choose Music Option *
        </FormLabel>
        
        <RadioGroup
          name="musicOption"
          value={formData.musicOption}
          onChange={handleMusicOptionChange}
          sx={{ gap: 2 }}
        >
          {/* Option A: Existing Music ID */}
          <Box sx={{ 
            border: 2, 
            borderRadius: 2,
            borderColor: formData.musicOption === MUSIC_OPTIONS.EXISTING ? 'primary.main' : 'grey.300',
            p: 2,
            bgcolor: formData.musicOption === MUSIC_OPTIONS.EXISTING ? 'primary.50' : 'transparent',
            transition: 'all 0.2s'
          }}>
            <FormControlLabel
              value={MUSIC_OPTIONS.EXISTING}
              control={<Radio />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MusicNoteIcon />
                  <Typography fontWeight="medium">Use Existing Music ID</Typography>
                </Box>
              }
              sx={{ m: 0 }}
            />
            
            {formData.musicOption === MUSIC_OPTIONS.EXISTING && (
              <Box sx={{ ml: 4, mt: 2 }}>
                {/* Search Section */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom color="text.secondary">
                    Search for Music (Simulated)
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Search for music..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      disabled={disabled || searchingMusic}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearchMusic()}
                    />
                    <Button
                      variant="outlined"
                      onClick={handleSearchMusic}
                      disabled={!searchQuery || disabled || searchingMusic}
                      startIcon={searchingMusic ? <CircularProgress size={20} /> : <SearchIcon />}
                    >
                      Search
                    </Button>
                  </Box>
                  
                  {searchResults.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Search Results
                        </Typography>
                        <Button size="small" onClick={handleClearSearch}>
                          Clear
                        </Button>
                      </Box>
                      
                      <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                        {searchResults.map((music) => (
                          <Box
                            key={music.id}
                            sx={{
                              p: 1.5,
                              mb: 1,
                              border: 1,
                              borderColor: 'grey.200',
                              borderRadius: 1,
                              cursor: 'pointer',
                              '&:hover': {
                                bgcolor: 'action.hover',
                                borderColor: 'primary.main'
                              },
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                            onClick={() => handleSelectMusic(music)}
                          >
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {music.title}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {music.author} • {music.duration}s
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {music.status === 2 ? (
                                <CheckCircleIcon fontSize="small" color="success" />
                              ) : (
                                <CancelIcon fontSize="small" color="error" />
                              )}
                              <Typography variant="caption" color={music.status === 2 ? 'success.main' : 'error.main'}>
                                {music.status === 2 ? 'Available' : 'Unavailable'}
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>

                {/* Manual Music ID Input */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom color="text.secondary">
                    Or Enter Music ID Manually
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                    <TextField
                      fullWidth
                      label="Music ID"
                      value={formData.musicId}
                      onChange={handleMusicIdChange}
                      error={!!errors.musicId}
                      helperText={errors.musicId || "Enter a valid TikTok Music ID (numbers only)"}
                      disabled={disabled || validatingMusic}
                      size="small"
                    />
                    <Button
                      variant="contained"
                      onClick={validateMusicWithApi}
                      disabled={!formData.musicId || disabled || validatingMusic}
                      startIcon={validatingMusic ? <CircularProgress size={20} /> : <MusicNoteIcon />}
                      sx={{ minWidth: 100 }}
                    >
                      {validatingMusic ? 'Validating...' : 'Validate'}
                    </Button>
                  </Box>
                </Box>

                {/* Validation Result */}
                {musicValidationResult && !musicValidationResult.isCustom && (
                  <Alert 
                    severity={musicValidationResult.valid ? "success" : "error"}
                    sx={{ mt: 2 }}
                    icon={false}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      {musicValidationResult.valid ? (
                        <CheckCircleIcon color="success" />
                      ) : (
                        <CancelIcon color="error" />
                      )}
                      <Box>
                        <Typography fontWeight="medium" gutterBottom>
                          {musicValidationResult.valid ? 'Valid Music Found' : 'Music Validation Failed'}
                        </Typography>
                        {musicValidationResult.valid ? (
                          <>
                            <Typography variant="body2">
                              <strong>Title:</strong> {musicValidationResult.title}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Author:</strong> {musicValidationResult.author}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Duration:</strong> {musicValidationResult.duration}s
                            </Typography>
                            <Typography variant="body2">
                              <strong>Status:</strong> {musicValidationResult.status}
                            </Typography>
                          </>
                        ) : (
                          <Typography variant="body2">
                            {musicValidationResult.message}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Alert>
                )}

                <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                  Note: Music must be from TikTok's official library and available for advertising use.
                  Music IDs can be found in TikTok's Sound Library.
                </Typography>
              </Box>
            )}
          </Box>

          {/* Option B: Upload Custom Music */}
          <Box sx={{ 
            border: 2, 
            borderRadius: 2,
            borderColor: formData.musicOption === MUSIC_OPTIONS.UPLOAD ? 'primary.main' : 'grey.300',
            p: 2,
            bgcolor: formData.musicOption === MUSIC_OPTIONS.UPLOAD ? 'primary.50' : 'transparent',
            transition: 'all 0.2s'
          }}>
            <FormControlLabel
              value={MUSIC_OPTIONS.UPLOAD}
              control={<Radio />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CloudUploadIcon />
                  <Typography fontWeight="medium">Upload Custom Music</Typography>
                </Box>
              }
              sx={{ m: 0 }}
            />
            
            {formData.musicOption === MUSIC_OPTIONS.UPLOAD && (
              <Box sx={{ ml: 4, mt: 2 }}>
                {/* File Upload */}
                <Box sx={{ mb: 3 }}>
                  <input
                    type="file"
                    id="music-upload"
                    accept="audio/*"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                    disabled={disabled || uploading}
                  />
                  <label htmlFor="music-upload">
                    <Box
                      sx={{
                        border: 2,
                        borderColor: 'grey.300',
                        borderStyle: 'dashed',
                        borderRadius: 2,
                        p: 4,
                        textAlign: 'center',
                        cursor: 'pointer',
                        '&:hover': {
                          borderColor: 'primary.main',
                          bgcolor: 'action.hover'
                        },
                        transition: 'all 0.2s'
                      }}
                    >
                      <CloudUploadIcon sx={{ fontSize: 48, color: 'grey.500', mb: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        Upload Audio File
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Click to browse or drag and drop
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Max size: 10MB • Supported: MP3, WAV, M4A
                      </Typography>
                    </Box>
                  </label>
                  
                  {/* Upload Progress */}
                  {uploading && (
                    <Box sx={{ mt: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="caption">Uploading...</Typography>
                        <Typography variant="caption">{uploadProgress}%</Typography>
                      </Box>
                      <Box sx={{ width: '100%', bgcolor: 'grey.200', borderRadius: 1, overflow: 'hidden' }}>
                        <Box 
                          sx={{ 
                            width: `${uploadProgress}%`, 
                            height: 8, 
                            bgcolor: 'primary.main',
                            transition: 'width 0.2s'
                          }} 
                        />
                      </Box>
                    </Box>
                  )}
                  
                  {/* File Info */}
                  {formData.customMusicFile && !uploading && (
                    <Alert severity="success" sx={{ mt: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography fontWeight="medium">
                            {formData.customMusicFile.name}
                          </Typography>
                          <Typography variant="caption">
                            {(formData.customMusicFile.size / (1024 * 1024)).toFixed(2)} MB
                          </Typography>
                        </Box>
                        <CheckCircleIcon color="success" />
                      </Box>
                    </Alert>
                  )}
                </Box>

                {/* Custom Music Name */}
                <TextField
                  fullWidth
                  label="Music Title"
                  value={formData.customMusicName}
                  onChange={handleCustomMusicNameChange}
                  helperText="Enter a name for your custom music (required)"
                  disabled={disabled || uploading}
                  margin="normal"
                  required
                  error={!!errors.customMusicName}
                />

                {/* Custom Music Validation Result */}
                {musicValidationResult && musicValidationResult.isCustom && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <CheckCircleIcon color="success" />
                      <Box>
                        <Typography fontWeight="medium" gutterBottom>
                          Custom Music Ready
                        </Typography>
                        <Typography variant="body2">
                          <strong>Title:</strong> {musicValidationResult.title}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Generated ID:</strong> {musicValidationResult.musicId}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Status:</strong> {musicValidationResult.status}
                        </Typography>
                      </Box>
                    </Box>
                  </Alert>
                )}

                <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                  Note: Uploaded music will be processed and assigned a Music ID automatically.
                  Processing may take a few minutes. Music must comply with TikTok's content policies.
                </Typography>
              </Box>
            )}
          </Box>

          {/* Option C: No Music */}
          <Box sx={{ 
            border: 2, 
            borderRadius: 2,
            borderColor: formData.musicOption === MUSIC_OPTIONS.NONE ? 'primary.main' : 'grey.300',
            p: 2,
            bgcolor: formData.musicOption === MUSIC_OPTIONS.NONE ? 'primary.50' : 'transparent',
            transition: 'all 0.2s',
            opacity: isNoMusicAllowed ? 1 : 0.6
          }}>
            <FormControlLabel
              value={MUSIC_OPTIONS.NONE}
              control={<Radio />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MusicNoteIcon sx={{ opacity: 0.5 }} />
                  <Typography fontWeight="medium">No Music</Typography>
                  {!isNoMusicAllowed && (
                    <Typography variant="caption" color="error" sx={{ ml: 1 }}>
                      (Not available for Conversions)
                    </Typography>
                  )}
                </Box>
              }
              sx={{ m: 0 }}
              disabled={!isNoMusicAllowed}
            />
            
            {formData.musicOption === MUSIC_OPTIONS.NONE && (
              <Box sx={{ ml: 4, mt: 2 }}>
                {isNoMusicAllowed ? (
                  <Alert severity="info">
                    No music will be added to this ad. This option is only available for Traffic objective.
                    Ads without music may have different performance characteristics.
                  </Alert>
                ) : (
                  <Alert severity="error">
                    Music is required for Conversions objective. Please select a music option above.
                  </Alert>
                )}
              </Box>
            )}
          </Box>
        </RadioGroup>

        {errors.musicOption && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {errors.musicOption}
          </Alert>
        )}
      </FormControl>

      {/* Objective-based Rules Summary */}
      <Alert 
        severity="info" 
        sx={{ mt: 3 }}
        icon={<InfoIcon />}
      >
        <Typography variant="subtitle2" gutterBottom>
          Objective-Specific Music Rules:
        </Typography>
        <Box component="ul" sx={{ m: 0, pl: 2 }}>
          <Box component="li">
            <Typography variant="body2">
              <strong>Traffic Objective:</strong> Music is optional. You can choose "No Music".
            </Typography>
          </Box>
          <Box component="li">
            <Typography variant="body2">
              <strong>Conversions Objective:</strong> Music is required. You must select either "Existing Music ID" or "Upload Custom Music".
            </Typography>
          </Box>
          <Box component="li">
            <Typography variant="body2">
              <strong>Important:</strong> All music must comply with TikTok's Advertising Policies and Music Licensing agreements.
            </Typography>
          </Box>
        </Box>
      </Alert>

      {/* Current Selection Summary */}
      {(formData.musicOption !== MUSIC_OPTIONS.NONE && 
        (formData.musicId || formData.customMusicName)) && (
        <Alert 
          severity={getValidationStatusColor()} 
          sx={{ mt: 3 }}
        >
          <Typography variant="subtitle2" gutterBottom>
            Current Music Selection:
          </Typography>
          {formData.musicOption === MUSIC_OPTIONS.EXISTING && formData.musicId && (
            <Typography variant="body2">
              <strong>Music ID:</strong> {formData.musicId}
              {musicValidationResult && (
                <>
                  <br />
                  <strong>Status:</strong> {musicValidationResult.valid ? '✓ Validated' : '✗ Requires Validation'}
                </>
              )}
            </Typography>
          )}
          {formData.musicOption === MUSIC_OPTIONS.UPLOAD && formData.customMusicName && (
            <Typography variant="body2">
              <strong>Custom Music:</strong> {formData.customMusicName}
              {musicValidationResult && (
                <>
                  <br />
                  <strong>Status:</strong> ✓ Ready for use
                </>
              )}
            </Typography>
          )}
        </Alert>
      )}
    </Box>
  );
};

export default MusicSelection;