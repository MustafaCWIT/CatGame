import './HowToPlayModal.css';
import sleepCatImg from './assets/sleepCat.png';
import foodBoxesImg from './assets/foodBoxes.png';

export default function HowToPlayModal({ onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal-container">
        {/* Close button */}
        <button className="modal-close" onClick={onClose}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        {/* How to play section */}
        <div className="modal-section">
          <h2 className="modal-title">How to play</h2>
          <div className="modal-steps">
            <div className="modal-step">
              <span className="modal-step-number">1</span>
              <span className="modal-step-text">Place the tablet on the floor and play the game</span>
            </div>
            <div className="modal-step">
              <span className="modal-step-number">2</span>
              <span className="modal-step-text">The cat taps the objects and collect points</span>
            </div>
            <div className="modal-step">
              <span className="modal-step-number">3</span>
              <span className="modal-step-text">Record and upload video of cat playing</span>
            </div>
          </div>
        </div>

        {/* Participate and win section */}
        <div className="modal-section modal-participate">
          <h2 className="modal-subtitle">Participate and win</h2>

          <div className="modal-prizes">
            {/* Purradise Reset Day */}
            <div className="modal-prize-card modal-prize-card-top">
              <img src={sleepCatImg} alt="" className="modal-prize-img modal-prize-img-cat" />
              <div className="modal-prize-content">
                <span className="modal-prize-title">Purradise Reset Day</span>
                <span className="modal-prize-desc">premium grooming experience at a top-rated pet<br />spa, including pickup and drop-off.</span>
              </div>
            </div>

            {/* A Year of Whiskas */}
            <div className="modal-prize-card modal-prize-card-bottom">
              <div className="modal-prize-content">
                <span className="modal-prize-title">A Year of Whiskas</span>
                <span className="modal-prize-title">Wet & Dry Food</span>
              </div>
              <img src={foodBoxesImg} alt="" className="modal-prize-img modal-prize-img-food" />
            </div>
          </div>
        </div>

        {/* Let's Go button */}
        <button className="modal-btn" onClick={onClose}>
          Let's Go
        </button>
      </div>
    </div>
  );
}
