import React, { useState, useEffect, useRef } from 'react';
import type { Photo } from '../../types';
import mjbCrestImg from '../../assets/mjb-heart-crest.png';
import myMjHeartDecor from '../../assets/album-decor-my-mj-heart.png';
import { preloadBatch } from '../../utils/preloader';

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
    // Ignore audio context errors
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
    osc.frequency.exponentialRampToValueAtTime(160, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.035, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.16);
  } catch {
    // Ignore
  }
};

// High-performance Instant Polaroid Photo Component
// No blocking skeleton overlay: cached images render at frame 0 with 0ms delay
const MemoryPhoto: React.FC<{
  src: string;
  alt: string;
}> = ({ src, alt }) => {
  const [hasError, setHasError] = useState<boolean>(false);

  return (
    <div className="polaroid-frame">
      {hasError ? (
        <div className="polaroid-error-state">
          <span style={{ fontSize: '2rem' }}>💕</span>
          <p style={{ margin: '0.4rem 0', fontSize: '0.92rem', color: '#8c2d3d' }}>
            Taking a moment to load…
          </p>
          <button
            type="button"
            className="secondary-btn"
            style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem' }}
            onClick={() => setHasError(false)}
          >
            ↻ Tap to reload
          </button>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          className="album-displayed-photo"
          loading="eager"
          fetchPriority="high"
          decoding="sync"
          onError={() => setHasError(true)}
        />
      )}
    </div>
  );
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
  const [isTurning, setIsTurning] = useState<'next' | 'prev' | null>(null);
  const touchStartX = useRef<number | null>(null);

  const activePhotos = photos.length > 0 ? photos : [];
  const total = activePhotos.length;
  const currentPhoto = activePhotos[currentIndex];
  const isLastPhoto = currentIndex === total - 1;

  // Next and previous photo targets for seamless two-layer turning
  const nextPhoto = currentIndex < total - 1 ? activePhotos[currentIndex + 1] : null;
  const prevPhoto = currentIndex > 0 ? activePhotos[currentIndex - 1] : null;

  // Background preload and GPU decoding
  useEffect(() => {
    if (!photos || photos.length === 0) return;
    const allUrls = [
      mjbCrestImg,
      myMjHeartDecor,
      ...photos.map((p) => resolvePhotoSrc(p.data)).filter(Boolean),
    ];
    preloadBatch(allUrls);
  }, [photos]);

  const triggerOpenAlbum = () => {
    if (isOpening || isOpen) return;
    setIsOpening(true);
    playBookOpenChime();
    setTimeout(() => {
      setIsOpen(true);
      setIsOpening(false);
    }, 850);
  };

  const handleNext = () => {
    if (currentIndex < total - 1 && !isTurning) {
      setIsTurning('next');
      playPageTurnSound();

      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
        setIsTurning(null);
      }, 320);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0 && !isTurning) {
      setIsTurning('prev');
      playPageTurnSound();

      setTimeout(() => {
        setCurrentIndex((prev) => prev - 1);
        setIsTurning(null);
      }, 320);
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
  }, [isOpen, currentIndex, total, isTurning]);

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
      {/* Hidden Permanent In-DOM Preloader Stack: Forces browser to keep ALL 34 photos GPU-decoded in memory */}
      <div
        style={{
          position: 'fixed',
          top: -9999,
          left: -9999,
          width: 1,
          height: 1,
          overflow: 'hidden',
          opacity: 0,
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      >
        <img src={mjbCrestImg} alt="" loading="eager" fetchPriority="high" decoding="sync" />
        <img src={myMjHeartDecor} alt="" loading="eager" fetchPriority="high" decoding="sync" />
        {activePhotos.map((p) => (
          <img
            key={`album-permanent-cache-${p.id}`}
            src={resolvePhotoSrc(p.data)}
            alt=""
            loading="eager"
            fetchPriority="high"
            decoding="sync"
          />
        ))}
      </div>

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
                      loading="eager"
                      fetchPriority="high"
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

                <div className="book-cover-crest-wrap">
                  <img
                    src={mjbCrestImg}
                    alt="MJB Floral Crest"
                    className="book-cover-crest-img"
                    loading="eager"
                    fetchPriority="high"
                    decoding="sync"
                  />
                </div>
                <h2 className="book-cover-title">{albumTitle || 'Our Memories'}</h2>
                <p className="book-cover-subtitle">{albumSubtitle || 'A collection of beautiful moments'}</p>
                <div className="book-cover-heart-group">
                  <div className="cover-heart-mini">💖</div>
                  <div className="cover-book-duo">
                    <span>📖</span>
                    <span className="cover-heart-float">💕</span>
                  </div>
                </div>
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
        /* Open Book Experience: Instant Zero-Delay Symmetric Page Turns */
        <div className="open-album-container">
          <div style={{ textAlign: 'center', marginBottom: '0.2rem' }}>
            <h2 className="album-page-main-title">
              {albumTitle || 'Our Memories'}
            </h2>
            <p className="album-page-sub-title">
              {albumSubtitle || 'A collection of beautiful moments 💖'}
            </p>
          </div>

          <div
            className="album-open-book"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Ornate Gold Inset Border Line */}
            <div className="book-page-gold-border" aria-hidden="true" />

            {/* Silk Ribbon Bookmark */}
            <div className="album-ribbon-bookmark" title="Bookmark" />

            {/* Top-Right 'My Mj' Romantic Heart Emblem with Rose */}
            <img
              src={myMjHeartDecor}
              alt="My Mj"
              className="decor-my-mj-heart"
              loading="eager"
              fetchPriority="high"
              decoding="sync"
            />

            <div className="album-pages-stage">
              {/* NEXT TURN: Underneath is nextPhoto (resting), Top is currentPhoto (peeling away to left) */}
              {isTurning === 'next' && nextPhoto && (
                <div
                  key={`underneath-next-${nextPhoto.id}`}
                  className="album-single-page page-underneath"
                >
                  <MemoryPhoto
                    src={resolvePhotoSrc(nextPhoto.data)}
                    alt={nextPhoto.caption || 'Next Memory'}
                  />
                  {nextPhoto.caption && (
                    <div className="album-caption-wrapper">
                      <p className="album-caption-text">{nextPhoto.caption}</p>
                      <div className="album-caption-divider">
                        <span className="divider-line" />
                        <span className="divider-icon">💕</span>
                        <span className="divider-line" />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* PREV TURN: Underneath is prevPhoto (resting), Top is currentPhoto (peeling away to right) */}
              {isTurning === 'prev' && prevPhoto && (
                <div
                  key={`underneath-prev-${prevPhoto.id}`}
                  className="album-single-page page-underneath"
                >
                  <MemoryPhoto
                    src={resolvePhotoSrc(prevPhoto.data)}
                    alt={prevPhoto.caption || 'Previous Memory'}
                  />
                  {prevPhoto.caption && (
                    <div className="album-caption-wrapper">
                      <p className="album-caption-text">{prevPhoto.caption}</p>
                      <div className="album-caption-divider">
                        <span className="divider-line" />
                        <span className="divider-icon">💕</span>
                        <span className="divider-line" />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ACTIVE / TURNING TOP LAYER */}
              {isTurning === 'next' && currentPhoto && (
                <div
                  key={`turning-next-${currentPhoto.id}`}
                  className="album-single-page page-turning-next"
                >
                  <MemoryPhoto
                    src={resolvePhotoSrc(currentPhoto.data)}
                    alt={currentPhoto.caption || `Memory ${currentIndex + 1}`}
                  />
                  {currentPhoto.caption && (
                    <div className="album-caption-wrapper">
                      <p className="album-caption-text">{currentPhoto.caption}</p>
                      <div className="album-caption-divider">
                        <span className="divider-line" />
                        <span className="divider-icon">💕</span>
                        <span className="divider-line" />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {isTurning === 'prev' && currentPhoto && (
                <div
                  key={`turning-prev-${currentPhoto.id}`}
                  className="album-single-page page-turning-prev"
                >
                  <MemoryPhoto
                    src={resolvePhotoSrc(currentPhoto.data)}
                    alt={currentPhoto.caption || `Memory ${currentIndex + 1}`}
                  />
                  {currentPhoto.caption && (
                    <div className="album-caption-wrapper">
                      <p className="album-caption-text">{currentPhoto.caption}</p>
                      <div className="album-caption-divider">
                        <span className="divider-line" />
                        <span className="divider-icon">💕</span>
                        <span className="divider-line" />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* RESTING STATE (Not turning): Single stable page with zero duplicate nodes */}
              {!isTurning && currentPhoto && (
                <div
                  key={`resting-${currentPhoto.id}`}
                  className="album-single-page page-resting"
                >
                  <MemoryPhoto
                    src={resolvePhotoSrc(currentPhoto.data)}
                    alt={currentPhoto.caption || `Memory ${currentIndex + 1}`}
                  />
                  {currentPhoto.caption && (
                    <div className="album-caption-wrapper">
                      <p className="album-caption-text">{currentPhoto.caption}</p>
                      <div className="album-caption-divider">
                        <span className="divider-line" />
                        <span className="divider-icon">💕</span>
                        <span className="divider-line" />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Navigation Controls: Previous, Counter, Next / Continue */}
          <div className="album-navigation-bar">
            <button
              className="secondary-btn"
              onClick={handlePrev}
              disabled={currentIndex === 0 || !!isTurning}
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
                disabled={!!isTurning}
                aria-label="Next photo"
              >
                Next →
              </button>
            ) : (
              <button
                className="romantic-btn"
                onClick={() => {
                  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                  onContinue();
                }}
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
                onClick={() => {
                  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                  onContinue();
                }}
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
