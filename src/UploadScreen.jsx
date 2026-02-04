import { useRef, useState } from 'react';
import './UploadScreen.css';
import backgroundImg from './assets/background.png';
import logoImg from './assets/logo.png';

export default function UploadScreen({ onGoHome, onUpload }) {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      onUpload?.(selectedFile);
      setUploadSuccess(true);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
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

          {uploadSuccess ? (
            <div className="upload-success-msg">
              Uploaded successfully
            </div>
          ) : (
            <>
              <button
                className="upload-select-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                {selectedFile ? selectedFile.name : 'Select file'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                className="hidden-input"
                onChange={handleFileSelect}
              />
            </>
          )}

          <button
            className="upload-submit-btn"
            onClick={uploadSuccess ? onGoHome : handleUpload}
          >
            {uploadSuccess ? 'Back to Home' : 'Upload'}
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
