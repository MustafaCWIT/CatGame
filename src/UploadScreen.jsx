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
  const [userEmail, setUserEmail] = useState('');
  const [userCountry, setUserCountry] = useState('');
  const [isReady, setIsReady] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

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
        await onUpload(null, null, storeName, userEmail, userCountry);
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
        <div className="logo-halo-wrap upload-logo-wrap">
          <img src={logoImg} alt="Whiskas" className="upload-logo" />
        </div>
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

          {/* Section 4: Email */}
          <div className="upload-section">
            <h3 className="upload-section-title">{t('upload_email_title')}</h3>
            <input
              type="email"
              className="upload-text-input"
              placeholder={t('upload_email_placeholder')}
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              disabled={uploading}
              autoComplete="email"
              dir={language === 'ar' ? 'rtl' : 'ltr'}
            />
          </div>

          {/* Section 5: Country */}
          <div className="upload-section">
            <h3 className="upload-section-title">{t('upload_country_title')}</h3>
            <input
              type="text"
              className="upload-text-input"
              placeholder={t('upload_country_placeholder')}
              value={userCountry}
              onChange={(e) => setUserCountry(e.target.value)}
              disabled={uploading}
              autoComplete="country-name"
              dir={language === 'ar' ? 'rtl' : 'ltr'}
            />
          </div>

          {/* Terms & Conditions Checkbox */}
          <label className="upload-terms-label">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              disabled={uploading}
              className="upload-terms-checkbox"
            />
            <span className="upload-terms-text">
              {language === 'ar' ? 'أوافق على ' : 'I agree to the '}
              <button
                type="button"
                className="upload-terms-link"
                onClick={(e) => {
                  e.preventDefault();
                  setShowTermsModal(true);
                }}
              >
                {language === 'ar' ? 'الشّروط والأحكام' : 'Terms & Conditions'}
              </button>
            </span>
          </label>

          <button
            className="upload-submit-btn"
            onClick={handleUpload}
            disabled={uploading || !selectedVideoFile || !agreedToTerms}
          >
            {uploading ? t('upload_btn_loading') : t('upload_btn')}
          </button>
        </div>
      </div>

      {/* Terms & Conditions Modal */}
      {showTermsModal && (
        <div className="terms-modal-overlay" onClick={() => setShowTermsModal(false)}>
          <div className="terms-modal" onClick={(e) => e.stopPropagation()}>
            <div className="terms-modal-header">
              <h2 className="terms-modal-title">Terms & Conditions</h2>
              <button className="terms-modal-close" onClick={() => setShowTermsModal(false)}>
                &times;
              </button>
            </div>
            <div className="terms-modal-body">
              <p><strong>1. Eligibility</strong><br />This promotion is open to residents of participating countries. You must be 18 years or older to participate.</p>
              <p><strong>2. How to Enter</strong><br />Purchase any Whiskas product, upload a video of your cat playing the game, and submit proof of purchase along with the required details.</p>
              <p><strong>3. Video Requirements</strong><br />The uploaded video must clearly show a cat interacting with the game. Videos that do not meet this requirement may be disqualified.</p>
              <p><strong>4. Personal Data</strong><br />By submitting your information, you consent to the collection and use of your personal data (including email, phone number, and country) for the purposes of this promotion.</p>
              <p><strong>5. Intellectual Property</strong><br />By uploading a video, you grant Whiskas a non-exclusive, royalty-free license to use, display, and share the video for promotional purposes.</p>
              <p><strong>6. Disqualification</strong><br />Any fraudulent entries, including fake receipts or videos, will result in immediate disqualification.</p>
              <p><strong>7. Liability</strong><br />Whiskas is not responsible for any technical issues during the upload process. Entries that fail to upload due to technical errors must be resubmitted.</p>
              <p><strong>8. Changes to Terms</strong><br />Whiskas reserves the right to modify these terms and conditions at any time without prior notice.</p>
            </div>
            <button className="terms-modal-accept" onClick={() => {
              setAgreedToTerms(true);
              setShowTermsModal(false);
            }}>
              Accept
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
