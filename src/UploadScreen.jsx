import { useRef, useState, useEffect } from 'react';
import './UploadScreen.css';
import backgroundImg from './assets/background.png';
import logoImg from './assets/logo.png';
import { supabase } from './lib/supabase';

const ASSETS = [backgroundImg, logoImg];

export default function UploadScreen({ onGoHome, onUpload, userId }) {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  useEffect(() => {
    let loaded = 0;
    ASSETS.forEach(src => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        loaded++;
        if (loaded === ASSETS.length) setIsReady(true);
      };
      img.onerror = () => {
        loaded++;
        if (loaded === ASSETS.length) setIsReady(true);
      };
    });
    const timer = setTimeout(() => setIsReady(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (!isReady) return <div className="upload loading" style={{ background: '#9C27B0', height: '100vh', width: '100vw' }} />;

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !userId) {
      setUploadError('Please select a file and make sure you are logged in.');
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      // Verify user is authenticated
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error('You must be logged in to upload videos. Please log in and try again.');
      }

      // Verify the session user ID matches the userId prop
      if (session.user.id !== userId) {
        throw new Error('Session mismatch. Please log in again.');
      }

      // Generate a unique filename
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      const filePath = fileName;

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('Videos')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        // If bucket doesn't exist, try to create it or handle the error
        if (uploadError.message.includes('Bucket not found')) {
          throw new Error('Storage bucket not configured. Please create a "Videos" bucket in Supabase Storage.');
        }
        if (uploadError.message.includes('row-level security policy') || uploadError.statusCode === '403') {
          throw new Error('Permission denied. Please make sure storage policies are set up correctly in Supabase. Check the SQL setup file.');
        }
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('Videos')
        .getPublicUrl(filePath);

      const videoUrl = urlData.publicUrl;

      // Call the onUpload callback with the video URL
      if (onUpload) {
        await onUpload(videoUrl);
      }

      setUploadSuccess(true);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error('Error uploading video:', err);
      setUploadError(err.message || 'Failed to upload video. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-screen">
      <img src={backgroundImg} alt="" className="upload-background" />

      {/* Header */}
      <div className="upload-header">
        <button className="upload-home-btn" onClick={onGoHome}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
        </button>
        <img src={logoImg} alt="Whiskas" className="upload-logo" />
        <div className="upload-profile-btn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>
      </div>

      <div className="upload-content">
        {/* Upload Card */}
        <div className="upload-card">
          <h2 className="upload-card-title">Upload video</h2>

          {uploadError && (
            <div className="upload-error-msg" style={{ color: '#f87171', marginBottom: '12px', fontSize: '14px' }}>
              {uploadError}
            </div>
          )}
          {uploadSuccess ? (
            <div className="upload-success-msg">
              Uploaded successfully
            </div>
          ) : (
            <>
              <button
                className="upload-select-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {selectedFile ? selectedFile.name : 'Select file'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                className="hidden-input"
                onChange={handleFileSelect}
                disabled={uploading}
              />
            </>
          )}

          <button
            className="upload-submit-btn"
            onClick={uploadSuccess ? onGoHome : handleUpload}
            disabled={uploading || !selectedFile}
          >
            {uploading ? 'Uploading...' : uploadSuccess ? 'Back to Home' : 'Upload'}
          </button>
        </div>

        {/* Instructions */}
        <div className="upload-instructions">
          <h3 className="upload-instructions-title">Make sure:</h3>
          <p className="upload-instruction">Your cat is visible playing the game in the video</p>
          <p className="upload-instruction">The score of the game is visible in the video</p>
        </div>
      </div>
    </div>
  );
}
