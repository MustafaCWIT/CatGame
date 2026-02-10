import './HowToPlayModal.css';
import sleepCatImg from './assets/sleepCat.png';
import foodBoxesImg from './assets/foodBoxes.png';

export default function HowToPlayModal({ onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-content-wrapper">
          {/* How to play heading */}
          <h2 className="modal-title">How to play</h2>
          
          {/* How to play section */}
          <div className="modal-section">
            <div className="modal-steps">
              <div className="modal-step">
                <span className="modal-step-number">1</span>
                <span className="modal-step-text">Place the tablet on the floor and let the cat interact and play the game</span>
              </div>
              <div className="modal-step">
                <span className="modal-step-number">2</span>
                <span className="modal-step-text">The cat taps the objects and collect points</span>
              </div>
              <div className="modal-step">
                <span className="modal-step-number">3</span>
                <span className="modal-step-text">Cat owner records the cat playing and upload the video along with proof of Whiskas product purchase.</span>
              </div>
              <div className="modal-step">
                <span className="modal-step-number">4</span>
                <span className="modal-step-text">Lucky winners will be announced at the end of the campaign</span>
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
                  <span className="modal-prize-title">A Year of Whiskas Wet & Dry Food</span>
                </div>
                <img src={foodBoxesImg} alt="" className="modal-prize-img modal-prize-img-food" />
              </div>
            </div>

            {/* Qualification text */}
            <p className="modal-qualification-text">
              To qualify for the participation and chance to win the prizes, it is required to upload the video along with proof of Whiskas product purchase.
            </p>
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
