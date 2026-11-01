import React, { useState, useEffect, useRef } from 'react';
import type { Photo } from '../../types';

interface PhotoAlbumSectionProps {
  albumTitle: string;
  albumSubtitle: string;
  photos: Photo[];
  onContinue: () => void;
  onBack: () => void;
}

const resolvePhotoSrc = (src: string): string => {
  if (!src) return '';
  if (src.startsWith('data:') || src.startsWith('blob:') || src.startsWith('http://') || src.startsWith('https://')) {
    return src;
  }
  const clean = src.startsWith('/') ? src.slice(1) : src;
  return `${import.meta.env.BASE_URL}${clean}`;
};

// Gentle Web Audio API romantic sparkle chime when opening the book
const playBookOpenChime = () => {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const startTime = ctx.currentTime + i * 0.12;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.06, startTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.65);
    });
  } catch {
    // Ignore audio context errors if blocked by browser
  }
};

// Gentle page turn sound
const playPageTurnSound = () => {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(160, ctx.currentTime + 0.14);
    gain.gain.setValueAtTime(0.03, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch {
    // Ignore
  }
};

export const PhotoAlbumSection: React.FC<PhotoAlbumSectionProps> = ({
  albumTitle,
  albumSubtitle,
  photos,
  onContinue,
  onBack,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isOpening, setIsOpening] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [turningDirection, setTurningDirection] = useState<'next' | 'prev' | null>(null);
  const touchStartX = useRef<number | null>(null);

  const activePhotos = photos.length > 0 ? photos : [];
  const total = activePhotos.length;
  const currentPhoto = activePhotos[currentIndex];
  const isLastPhoto = currentIndex === total - 1;

  const triggerOpenAlbum = () => {
    if (isOpening || isOpen) return;
    setIsOpening(true);
    playBookOpenChime();
    setTimeout(() => {
      setIsOpen(true);
      setIsOpening(false);
    }, 850);
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      playPageTurnSound();
      setTurningDirection('prev');
      setCurrentIndex((prev) => prev - 1);
      setTimeout(() => setTurningDirection(null), 400);
    }
  };

  const handleNext = () => {
    if (currentIndex < total - 1) {
      playPageTurnSound();
      setTurningDirection('next');
      setCurrentIndex((prev) => prev + 1);
      setTimeout(() => setTurningDirection(null), 400);
    }
  };

  // Keyboard navigation (ArrowLeft & ArrowRight)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, total]);

  // Mobile swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diffX = touchStartX.current - e.changedTouches[0].clientX;
    if (diffX > 45) {
      handleNext();
    } else if (diffX < -45) {
      handlePrev();
    }
    touchStartX.current = null;
  };

  return (
    <div className="page-view album-section-page">
      {!isOpen ? (
        /* 3D Interactive Opening Book Experience */
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.4rem' }}>
          <div
            className={`album-3d-stage ${isOpening ? 'stage-opening' : ''}`}
            onClick={triggerOpenAlbum}
            role="button"
            tabIndex={0}
            aria-label="Tap to open photo album"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') triggerOpenAlbum();
            }}
          >
            <div className="book-3d-object">
              {/* Inside Page Revealed As Front Cover Swings Open */}
              <div className="book-inside-underlay">
                <div className="book-underlay-preview-frame">
                  {photos[0]?.data && (
                    <img
                      src={resolvePhotoSrc(photos[0].data)}
                      alt="First Memory"
                      className="book-underlay-preview-img"
                    />
                  )}
                </div>
                <div style={{ fontFamily: 'Dancing Script', fontSize: '1.1rem', color: '#8c2d3d', marginTop: '0.4rem' }}>
                  Our Beautiful Journey ❤️
                </div>
              </div>

              {/* 3D Hinged Front Cover */}
              <div className="book-front-cover">
                <div className="book-spine-left" />
                <div className="book-corner-gold top-left" />
                <div className="book-corner-gold top-right" />
                <div className="book-corner-gold bottom-left" />
                <div className="book-corner-gold bottom-right" />

                <h2 className="book-cover-title">{albumTitle || 'Our Memories'}</h2>
                <p className="book-cover-subtitle">{albumSubtitle || 'A collection of beautiful moments ❤️'}</p>
                <div className="book-cover-heart">📖💕</div>
                <p className="envelope-hint-text">
                  {isOpening ? 'Opening our memories… ✨' : 'Tap to open our album ✨'}
                </p>
              </div>

              {/* Sparkle Burst Animation on Open */}
              {isOpening && (
                <div className="album-open-sparkles">
                  <span className="sparkle-burst-dot" style={{ ['--dx' as string]: '-80px', ['--dy' as string]: '-90px' }}>✨</span>
                  <span className="sparkle-burst-dot" style={{ ['--dx' as string]: '90px', ['--dy' as string]: '-70px' }}>💖</span>
                  <span className="sparkle-burst-dot" style={{ ['--dx' as string]: '-100px', ['--dy' as string]: '40px' }}>⭐</span>
                  <span className="sparkle-burst-dot" style={{ ['--dx' as string]: '110px', ['--dy' as string]: '50px' }}>🌸</span>
                  <span className="sparkle-burst-dot" style={{ ['--dx' as string]: '0px', ['--dy' as string]: '-110px' }}>💕</span>
                  <span className="sparkle-burst-dot" style={{ ['--dx' as string]: '-60px', ['--dy' as string]: '90px' }}>✨</span>
                  <span className="sparkle-burst-dot" style={{ ['--dx' as string]: '60px', ['--dy' as string]: '100px' }}>💛</span>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'center' }}>
            <button className="secondary-btn" onClick={onBack} aria-label="Go back to love letter">
              ← Back to Love Letter
            </button>
            <button
              className="romantic-btn"
              onClick={triggerOpenAlbum}
              disabled={isOpening}
            >
              {isOpening ? 'Opening… ✨' : 'Open Album 📖'}
            </button>
          </div>
        </div>
      ) : (
        /* Open Book Experience: One photo per page with 3D page-turn navigation */
        <div className="open-album-container">
          <div style={{ textAlign: 'center', marginBottom: '0.2rem' }}>
            <h2 className="book-cover-title" style={{ fontSize: '1.9rem', margin: 0 }}>
              {albumTitle || 'Our Memories'}
            </h2>
            <p className="book-cover-subtitle" style={{ fontSize: '1.15rem', margin: '0.2rem 0 0.6rem 0' }}>
              {albumSubtitle || 'Every moment with you is precious ❤️'}
            </p>
          </div>

          <div
            className="album-open-book"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Silk Ribbon Bookmark */}
            <div className="album-ribbon-bookmark" title="Bookmark" />

            {currentPhoto && (
              <div
                key={currentPhoto.id || currentIndex}
                className={`album-single-page ${turningDirection ? `turn-${turningDirection}` : ''}`}
              >
                <div className="polaroid-frame">
                  <img
                    src={resolvePhotoSrc(currentPhoto.data)}
                    alt={currentPhoto.caption || `Memory ${currentIndex + 1}`}
                    className="album-displayed-photo"
                  />
                </div>
                {currentPhoto.caption && (
                  <p className="album-caption-text">{currentPhoto.caption}</p>
                )}
              </div>
            )}
          </div>

          {/* Navigation Controls: Previous, Counter, Next / Continue */}
          <div className="album-navigation-bar">
            <button
              className="secondary-btn"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              aria-label="Previous photo"
            >
              ← Previous
            </button>

            <span className="album-page-counter-pill">
              {currentIndex + 1} / {Math.max(total, 1)}
            </span>

            {!isLastPhoto ? (
              <button
                className="romantic-btn"
                onClick={handleNext}
                aria-label="Next photo"
              >
                Next →
              </button>
            ) : (
              <button
                className="romantic-btn"
                onClick={onContinue}
                style={{ background: 'linear-gradient(135deg, #a8384a, #d44d63)' }}
              >
                See My Birthday Message for You ❤️
              </button>
            )}
          </div>

          {/* Persistent Back & Skip Controls */}
          <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', marginTop: '0.4rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              className="secondary-btn"
              onClick={onBack}
              aria-label="Back to love letter"
              style={{ fontSize: '0.85rem', padding: '0.4rem 1rem' }}
            >
              ← Back to Love Letter
            </button>
            {!isLastPhoto && (
              <button
                className="secondary-btn"
                onClick={onContinue}
                style={{ fontSize: '0.85rem', padding: '0.4rem 1rem', opacity: 0.85 }}
                title="Continue to Birthday Message"
              >
                Skip to Birthday Message →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
