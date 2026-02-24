import './LanguageSelectModal.css';
import { GAME_ASSETS } from './game/assets';

const { logo: logoImg } = GAME_ASSETS;

export default function LanguageSelectModal({ onSelect }) {
  return (
    <div className="lang-modal">
      <div className="lang-modal-card">
        <div className="logo-halo-wrap">
          <img src={logoImg} alt="Whiskas" className="lang-modal-logo" />
        </div>
        <h2 className="lang-modal-title">Choose Language</h2>
        <p className="lang-modal-subtitle">اختر اللغة</p>
        <div className="lang-modal-buttons">
          <button className="lang-modal-btn" onClick={() => onSelect('en')}>
            English
          </button>
          <button className="lang-modal-btn" onClick={() => onSelect('ar')}>
            عربي
          </button>
        </div>
      </div>
    </div>
  );
}
