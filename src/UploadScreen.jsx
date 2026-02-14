import { useRef, useState, useEffect } from 'react';
import './UploadScreen.css';
import backgroundImg from './assets/background.png';
import logoImg from './assets/logo.png';
import { supabase } from './lib/supabase';
import { useLanguage } from './i18n/LanguageContext';

const ASSETS = [backgroundImg, logoImg];

export default function UploadScreen({ onGoHome, onUpload, userId, onGoToThankYou, onProfileClick }) {
  const { t, language } = useLanguage();
  const videoInputRef = useRef(null);
  const receiptInputRef = useRef(null);
  const [selectedVideoFile, setSelectedVideoFile] = useState(null);
  const [selectedReceiptFile, setSelectedReceiptFile] = useState(null);
  const [userName, setUserName] = useState('');
  const [storeName, setStoreName] = useState('');
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

  const handleVideoFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedVideoFile(file);
    }
  };

  const handleReceiptFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedReceiptFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedVideoFile) {
      setUploadError(t('upload_error_no_video'));
      return;
    }

    if (!userId) {
      setUploadError(t('upload_error_no_login'));
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      // Skip uploading files to Supabase Storage as requested
      // We only pass the store name to the parent component

      if (onUpload) {
        // Pass nulls for file URLs since we are no longer uploading them
        await onUpload(null, null, storeName, userName);
      }

      // Redirect to thank you screen
      if (onGoToThankYou) {
        onGoToThankYou();
      }
    } catch (err) {
      console.error('Error processing upload metadata:', err);
      setUploadError(err.message || 'Failed to process upload. Please try again.');
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
        <button className="upload-profile-btn" onClick={onProfileClick}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </button>
      </div>

      <div className="upload-content">
        {/* Upload Card */}
        <div className="upload-card">
          <h2 className="upload-card-title">{t('upload_title')}</h2>

          {uploadError && (
            <div className="upload-error-msg" style={{ color: '#f87171', marginBottom: '12px', fontSize: '14px' }}>
              {uploadError}
            </div>
          )}

          {/* Section 1: Upload Cat video playing game */}
          <div className="upload-section">
            <h3 className="upload-section-title">{t('upload_video_title')}</h3>
            <p className="upload-section-instruction">{t('upload_video_instruction')}</p>
            <button
              className="upload-select-btn"
              onClick={() => videoInputRef.current?.click()}
              disabled={uploading}
            >
              {selectedVideoFile ? selectedVideoFile.name : t('upload_select_file')}
            </button>
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              className="hidden-input"
              onChange={handleVideoFileSelect}
              disabled={uploading}
            />
          </div>

          {/* Section 2: Upload Receipt / Proof of Purchase */}
          <div className="upload-section">
            <h3 className="upload-section-title">{t('upload_receipt_title')}</h3>
            <p className="upload-section-instruction">{t('upload_receipt_instruction')}</p>
            <button
              className="upload-select-btn"
              onClick={() => receiptInputRef.current?.click()}
              disabled={uploading}
            >
              {selectedReceiptFile ? selectedReceiptFile.name : t('upload_select_file')}
            </button>
            <input
              ref={receiptInputRef}
              type="file"
              accept="image/*"
              className="hidden-input"
              onChange={handleReceiptFileSelect}
              disabled={uploading}
            />
          </div>

          {/* Section 3: Your Name */}
          <div className="upload-section">
            <h3 className="upload-section-title">{t('upload_username_title')}</h3>
            <input
              type="text"
              className="upload-text-input"
              placeholder={t('upload_username_placeholder')}
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              disabled={uploading}
              autoComplete="name"
              lang={language}
              dir={language === 'ar' ? 'rtl' : 'ltr'}
            />
          </div>

          {/* Section 4: Name of the Store of Purchase */}
          <div className="upload-section">
            <h3 className="upload-section-title">{t('upload_store_title')}</h3>
            <input
              type="text"
              className="upload-text-input"
              placeholder={t('upload_store_placeholder')}
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              disabled={uploading}
              autoComplete="off"
              lang={language}
              dir={language === 'ar' ? 'rtl' : 'ltr'}
            />
          </div>

          <button
            className="upload-submit-btn"
            onClick={handleUpload}
            disabled={uploading || !selectedVideoFile}
          >
            {uploading ? t('upload_btn_loading') : t('upload_btn')}
          </button>
        </div>
      </div>
    </div>
  );
}
