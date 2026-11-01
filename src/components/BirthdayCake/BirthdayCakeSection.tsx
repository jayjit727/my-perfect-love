import React, { useState, useRef } from 'react';

interface BirthdayCakeSectionProps {
  onWishComplete: () => void;
  onBack: () => void;
}

// Gentle extinguish puff sound using Web Audio API
const playPuffSound = () => {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.32);
    gain.gain.setValueAtTime(0.07, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.32);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.33);
  } catch {
    // Ignore audio context error
  }
};

export const BirthdayCakeSection: React.FC<BirthdayCakeSectionProps> = ({
  onWishComplete,
  onBack,
}) => {
  const [extinguished, setExtinguished] = useState<boolean[]>([false, false, false, false]);
  const [allExtinguished, setAllExtinguished] = useState<boolean>(false);
  const isExtinguishingRef = useRef<boolean>(false);

  const triggerExtinguishSequence = () => {
    if (isExtinguishingRef.current || allExtinguished) return;
    isExtinguishingRef.current = true;
    playPuffSound();

    // Stagger extinguish the four candles smoothly
    const delays = [80, 260, 420, 580];
    delays.forEach((delay, idx) => {
      setTimeout(() => {
        setExtinguished((prev) => {
          const updated = [...prev];
          updated[idx] = true;
          return updated;
        });
      }, delay);
    });

    // Complete celebration state after all candles are extinguished
    setTimeout(() => {
      setAllExtinguished(true);
    }, 950);
  };

  return (
    <div className="page-view cake-experience-page">
      <h2 className="cake-title">Make a Wish! ✨</h2>

      {/* Decorative Artisanal Birthday Cake with EXACTLY FOUR CANDLES */}
      <div
        className="cake-stage"
        onClick={!allExtinguished ? triggerExtinguishSequence : undefined}
        style={{ cursor: !allExtinguished ? 'pointer' : 'default' }}
        title={!allExtinguished ? "Tap to blow out your candles! 🎂" : undefined}
      >
        {/* Floating Sparkles & Heart Accents */}
        <div className="cake-ambient-sparkles" aria-hidden="true">
          <span className="sparkle-item sp1">✨</span>
          <span className="sparkle-item sp2">🌸</span>
          <span className="sparkle-item sp3">✨</span>
          <span className="sparkle-item sp4">💖</span>
        </div>

        {/* Four Candles Row with Cream Dollops */}
        <div className="four-candles-container">
          {[0, 1, 2, 3].map((candleIndex) => (
            <div key={candleIndex} className="candle-unit">
              <div
                className={`candle-flame ${
                  extinguished[candleIndex] ? 'is-extinguished' : ''
                }`}
                title={`Candle ${candleIndex + 1}`}
              />
              <div className="candle-wick" />
              <div className="candle-stick stripe-pattern" />
              <div className="candle-cream-dollop" />
            </div>
          ))}
        </div>

        {/* Cake Tier 1 (Top Tier - Vanilla White with Piped Edge) */}
        <div className="cake-tier-top">
          <div className="dripping-strawberry-glaze" />
          <div className="tier-decorations-row">
            <span className="sugar-strawberry">🍓</span>
            <span className="sugar-blossom">🌸</span>
            <span className="sugar-strawberry">🍓</span>
          </div>
        </div>

        {/* Cake Tier 2 (Middle Tier - Soft Pink with Rosettes) */}
        <div className="cake-tier-middle">
          <div className="middle-tier-garland">
            <span className="sugar-rosette">🌸</span>
            <span className="sugar-heart">💕</span>
            <span className="sugar-rosette">🌸</span>
          </div>
          <div className="tier-piped-beads">
            {Array.from({ length: 7 }).map((_, i) => (
              <span key={i} className="piped-dot" />
            ))}
          </div>
        </div>

        {/* Cake Tier 3 (Bottom Tier - Strawberry Blush with Quilted Pearls) */}
        <div className="cake-tier-bottom">
          <div className="bottom-tier-lace" />
          <div className="quilted-pearls-row">
            {Array.from({ length: 9 }).map((_, i) => (
              <span key={i} className="gold-sugar-pearl" />
            ))}
          </div>
          <div className="base-cream-ruffle" />
        </div>

        {/* Elegant Pedestal Stand */}
        <div className="cake-pedestal-stand">
          <div className="pedestal-plate" />
          <div className="pedestal-stem" />
          <div className="pedestal-foot" />
        </div>
      </div>

      {!allExtinguished ? (
        <>
          <p className="cake-instructions-text" style={{ margin: '0.8rem 0 0.3rem' }}>
            Make a silent wish in your heart… 🕯️
          </p>

          <p className="cake-mic-hint-text" style={{ fontSize: '0.96rem', color: '#8c505b', marginBottom: '1.2rem' }}>
            Tap the button or the cake to blow out your candles! ✨
          </p>

          <div className="cake-action-buttons">
            <button
              className="romantic-btn"
              onClick={triggerExtinguishSequence}
              style={{
                padding: '0.85rem 2rem',
                fontSize: '1.05rem',
                fontWeight: 600,
                boxShadow: '0 8px 25px rgba(168, 56, 74, 0.35)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span>💨</span> Make a Wish & Blow Out Candles ✨
            </button>

            <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', marginTop: '0.8rem' }}>
              <button
                className="secondary-btn"
                onClick={onBack}
                aria-label="Go back to birthday message"
              >
                ← Back
              </button>
            </div>
          </div>
        </>
      ) : (
        /* Celebration State after candles are extinguished */
        <div className="cake-celebration-banner">
          <h2>Yayyy! You made your wish come true! ❤️</h2>
          <p style={{ fontFamily: 'Dancing Script', fontSize: '1.45rem', color: '#c26d7c', margin: '0.5rem 0 1rem' }}>
            May all four candles carry your wishes to the stars ✨
          </p>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', marginTop: '0.8rem' }}>
            <button
              className="secondary-btn"
              onClick={onBack}
              aria-label="Go back to birthday message"
            >
              ← Back to Message
            </button>
            <button
              className="romantic-btn"
              onClick={onWishComplete}
            >
              Revisit Our Little World 💌
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
