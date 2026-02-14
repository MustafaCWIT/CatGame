import './HowToPlayModal.css';
import sleepCatImg from './assets/sleepCat.png';
import foodBoxesImg from './assets/foodBoxes.png';
import { useLanguage } from './i18n/LanguageContext';

export default function HowToPlayModal({ onClose }) {
  const { t, language } = useLanguage();
  const n = (num) => language === 'ar' ? num.toLocaleString('ar-EG') : num;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-content-wrapper">
          {/* How to play heading */}
          <h2 className="modal-title">{t('howto_title')}</h2>

          {/* How to play section */}
          <div className="modal-section">
            <div className="modal-steps">
              <div className="modal-step">
                <span className="modal-step-number">{n(1)}</span>
                <span className="modal-step-text">{t('howto_step1')}</span>
              </div>
              <div className="modal-step">
                <span className="modal-step-number">{n(2)}</span>
                <span className="modal-step-text">{t('howto_step2')}</span>
              </div>
              <div className="modal-step">
                <span className="modal-step-number">{n(3)}</span>
                <span className="modal-step-text">{t('howto_step3')}</span>
              </div>
              <div className="modal-step">
                <span className="modal-step-number">{n(4)}</span>
                <span className="modal-step-text">{t('howto_step4')}</span>
              </div>
            </div>
          </div>

          {/* Participate and win section */}
          <div className="modal-section modal-participate">
            <h2 className="modal-subtitle">{t('howto_participate')}</h2>

            <div className="modal-prizes">
              {/* Purradise Reset Day */}
              <div className="modal-prize-card modal-prize-card-top">
                <img src={sleepCatImg} alt="" className="modal-prize-img modal-prize-img-cat" />
                <div className="modal-prize-content">
                  <span className="modal-prize-title">{t('howto_prize1_title')}</span>
                  <span className="modal-prize-desc">{t('howto_prize1_desc')}</span>
                </div>
              </div>

              {/* A Year of Whiskas */}
              <div className="modal-prize-card modal-prize-card-bottom">
                <div className="modal-prize-content">
                  <span className="modal-prize-title">{t('howto_prize2_title')}</span>
                </div>
                <img src={foodBoxesImg} alt="" className="modal-prize-img modal-prize-img-food" />
              </div>
            </div>

            {/* Qualification text */}
            <p className="modal-qualification-text">
              {t('howto_qualify')}
            </p>
          </div>
        </div>

        {/* Let's Go button */}
        <button className="modal-btn" onClick={onClose}>
          {t('howto_go')}
        </button>
      </div>
    </div>
  );
}
