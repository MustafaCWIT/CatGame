import { useState, useEffect } from 'react';
import './SplashScreen.css';
import { ALL_ASSETS, preloadImage, GAME_ASSETS } from './game/assets';

// Destructure common images for use in local render
const {
  background: backgroundImg,
  logo: logoImg,
  cat: catImg,
  name: nameImg,
  fish: fishImg,
  bowl: bowlImg,
  gameCloud: cloudsImg,
} = GAME_ASSETS;

export default function SplashScreen({ onLoadingComplete }) {
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // List of all images to preload
  const imagesToLoad = ALL_ASSETS;

  useEffect(() => {
    let isMounted = true;
    let loadedCount = 0;
    const totalImages = imagesToLoad.length;

    // Preload all images
    const loadImages = async () => {
      try {
        // Load images in parallel
        const loadPromises = imagesToLoad.map((src) =>
          preloadImage(src)
            .then(() => {
              if (isMounted) {
                loadedCount++;
                const newProgress = Math.min(
                  Math.floor((loadedCount / totalImages) * 90), // Reserve 10% for final transition
                  90
                );
                setProgress(newProgress);
              }
            })
            .catch((error) => {
              console.warn('Failed to load image:', src, error);
              if (isMounted) {
                loadedCount++;
                const newProgress = Math.min(
                  Math.floor((loadedCount / totalImages) * 90),
                  90
                );
                setProgress(newProgress);
              }
            })
        );

        await Promise.all(loadPromises);

        if (isMounted) {
          // All images loaded, complete progress
          setProgress(100);
          setImagesLoaded(true);
        }
      } catch (error) {
        console.error('Error loading images:', error);
        if (isMounted) {
          setProgress(100);
          setImagesLoaded(true);
        }
      }
    };

    loadImages();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (imagesLoaded && progress === 100) {
      // Wait a bit before transitioning after all images are loaded
      const timeout = setTimeout(() => {
        setIsLoaded(true);
        setTimeout(() => {
          onLoadingComplete();
        }, 500);
      }, 2000); // Increased from 300ms to 2000ms (2 seconds)
      return () => clearTimeout(timeout);
    }
  }, [imagesLoaded, progress, onLoadingComplete]);

  return (
    <div className={`splash-screen ${isLoaded ? 'splash-fade-out' : ''}`}>
      {/* Background - Show only when loaded to avoid flash */}
      {imagesLoaded && (
        <img
          src={backgroundImg}
          alt=""
          className="splash-background splash-image-loaded"
        />
      )}

      {/* Hero elements - Show all at once when loaded */}
      {imagesLoaded && (
        <>
          {/* Clouds */}
          <img src={cloudsImg} alt="" className="splash-clouds splash-clouds-left" />
          <img src={cloudsImg} alt="" className="splash-clouds splash-clouds-right" />

          {/* Logo */}
          <img src={logoImg} alt="Whiskas" className="splash-logo" />

          {/* Fish */}
          <img src={fishImg} alt="" className="splash-fish" />

          {/* Bowl */}
          <img src={bowlImg} alt="" className="splash-bowl" />
        </>
      )}

      {/* Main content - structure always visible, images conditional */}
      <div className="splash-content splash-content-visible">
        <h1 className="splash-title">Tap To Purr</h1>

        {imagesLoaded && (
          <>
            <img src={catImg} alt="Cat" className="splash-cat" />
            <img src={nameImg} alt="Purradise" className="splash-name" />
          </>
        )}

        {/* Loader - keeps user updated */}
        <div className="splash-loader-container">
          <div className="splash-loader">
            <div className="splash-loader-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="splash-loader-text">
            {/* {imagesLoaded ? 'Ready!' : `Loading Purradise... ${progress}%`} */}
          </span>
        </div>
      </div>
    </div>
  );
}
