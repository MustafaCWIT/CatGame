import { useState, useEffect } from 'react';
import './SplashScreen.css';
import logoImg from './assets/logo.png';
import catImg from './assets/cat.png';
import nameImg from './assets/name.png';
import fishImg from './assets/fish.png';
import bowlImg from './assets/bowl.png';
import cloudsImg from './assets/clouds.png';
import backgroundImg from './assets/background.png';

// Helper function to preload an image
function preloadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export default function SplashScreen({ onLoadingComplete }) {
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // List of all images to preload
  const imagesToLoad = [
    backgroundImg,
    logoImg,
    catImg,
    nameImg,
    fishImg,
    bowlImg,
    cloudsImg,
  ];

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
      <img 
        src={backgroundImg} 
        alt="" 
        className={`splash-background ${imagesLoaded ? 'splash-image-loaded' : 'splash-image-loading'}`}
      />

      {/* Clouds */}
      <img 
        src={cloudsImg} 
        alt="" 
        className={`splash-clouds splash-clouds-left ${imagesLoaded ? 'splash-image-loaded' : 'splash-image-loading'}`}
      />
      <img 
        src={cloudsImg} 
        alt="" 
        className={`splash-clouds splash-clouds-right ${imagesLoaded ? 'splash-image-loaded' : 'splash-image-loading'}`}
      />

      {/* Logo */}
      <img 
        src={logoImg} 
        alt="Whiskas" 
        className={`splash-logo ${imagesLoaded ? 'splash-image-loaded' : 'splash-image-loading'}`}
      />

      {/* Fish */}
      <img 
        src={fishImg} 
        alt="" 
        className={`splash-fish ${imagesLoaded ? 'splash-image-loaded' : 'splash-image-loading'}`}
      />

      {/* Main content */}
      <div className="splash-content">
        {/* Title */}
        <h1 className={`splash-title ${imagesLoaded ? 'splash-content-visible' : 'splash-content-hidden'}`}>
          Tap To Purr
        </h1>

        {/* Cat */}
        <img 
          src={catImg} 
          alt="Cat" 
          className={`splash-cat ${imagesLoaded ? 'splash-image-loaded splash-content-visible' : 'splash-image-loading splash-content-hidden'}`}
        />

        {/* Name/Purradise */}
        <img 
          src={nameImg} 
          alt="Purradise" 
          className={`splash-name ${imagesLoaded ? 'splash-image-loaded splash-content-visible' : 'splash-image-loading splash-content-hidden'}`}
        />

        {/* Loader - always visible */}
        <div className="splash-loader-container">
          <div className="splash-loader">
            <div className="splash-loader-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="splash-loader-text">{progress}%</span>
        </div>
      </div>

      {/* Bowl */}
      <img 
        src={bowlImg} 
        alt="" 
        className={`splash-bowl ${imagesLoaded ? 'splash-image-loaded' : 'splash-image-loading'}`}
      />
    </div>
  );
}
