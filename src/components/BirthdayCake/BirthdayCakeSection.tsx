import React, { useState, useEffect, useRef } from 'react';

interface BirthdayCakeSectionProps {
  onWishComplete: () => void;
  onBack: () => void;
}

// Gentle extinguish puff sound
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
  const [isListening, setIsListening] = useState<boolean>(false);
  const [micError, setMicError] = useState<boolean>(false);
  const [volumeLevel, setVolumeLevel] = useState<number>(0);

  // Audio API Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const sustainedFramesRef = useRef<number>(0);
  const ambientNoiseRef = useRef<number>(10);
  const calibrationCountRef = useRef<number>(0);
  const isExtinguishingRef = useRef<boolean>(false);

  // Cleanup all audio resources safely
  const cleanupMicrophone = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setIsListening(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupMicrophone();
    };
  }, []);

  const triggerExtinguishSequence = () => {
    if (isExtinguishingRef.current) return;
    isExtinguishingRef.current = true;
    cleanupMicrophone();
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

    // Complete the celebration after all candles are blown out
    setTimeout(() => {
      setAllExtinguished(true);
    }, 950);
  };

  const startMicrophone = async () => {
    try {
      setMicError(false);

      // Helper with cross-browser and legacy WebKit support
      const getMediaStream = async (): Promise<MediaStream> => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          try {
            return await navigator.mediaDevices.getUserMedia({
              audio: {
                echoCancellation: false,
                noiseSuppression: false,
                autoGainControl: false,
              },
            });
          } catch {
            return await navigator.mediaDevices.getUserMedia({ audio: true });
          }
        }

        // Legacy fallback for older WebKit / mobile browsers
        const legacyNav = navigator as unknown as {
          webkitGetUserMedia?: (constraints: MediaStreamConstraints, success: (stream: MediaStream) => void, error: (err: unknown) => void) => void;
          mozGetUserMedia?: (constraints: MediaStreamConstraints, success: (stream: MediaStream) => void, error: (err: unknown) => void) => void;
        };
        const legacyFn = legacyNav.webkitGetUserMedia || legacyNav.mozGetUserMedia;
        if (legacyFn) {
          return new Promise((resolve, reject) => {
            legacyFn.call(navigator, { audio: true }, resolve, reject);
          });
        }

        throw new Error('Microphone requires a secure connection (HTTPS).');
      };

      const stream = await getMediaStream();
      streamRef.current = stream;
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      // Resume context if browser started in suspended state
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.15;
      analyserRef.current = analyser;

      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      setIsListening(true);
      calibrationCountRef.current = 0;
      ambientNoiseRef.current = 10;
      sustainedFramesRef.current = 0;

      const bufferLength = analyser.frequencyBinCount;
      const freqData = new Uint8Array(bufferLength);
      const timeData = new Uint8Array(bufferLength);

      const checkVolume = () => {
        if (isExtinguishingRef.current) return;

        analyser.getByteFrequencyData(freqData);
        analyser.getByteTimeDomainData(timeData);

        // 1. Time-Domain Analysis: breath/blowing produces strong diaphragm displacement (peaks > 128)
        let maxDeviation = 0;
        let sumSquaredDev = 0;
        for (let i = 0; i < timeData.length; i++) {
          const dev = Math.abs(timeData[i] - 128);
          if (dev > maxDeviation) maxDeviation = dev;
          sumSquaredDev += dev * dev;
        }
        const rms = Math.sqrt(sumSquaredDev / timeData.length);

        // 2. Low-frequency energy (bins 0 to 16, ~20Hz to ~350Hz)
        let lowFreqSum = 0;
        const lowBins = Math.min(16, bufferLength);
        for (let i = 0; i < lowBins; i++) {
          lowFreqSum += freqData[i];
        }
        const lowFreqAvg = lowFreqSum / lowBins;

        // Visual feedback meter
        const currentEnergy = Math.max(maxDeviation * 1.25, lowFreqAvg);
        setVolumeLevel(Math.min(100, Math.round((currentEnergy / 55) * 100)));

        // Calibration phase (first 12 frames to detect ambient baseline)
        if (calibrationCountRef.current < 12) {
          ambientNoiseRef.current =
            (ambientNoiseRef.current * calibrationCountRef.current + currentEnergy) /
            (calibrationCountRef.current + 1);
          calibrationCountRef.current += 1;
          animFrameRef.current = requestAnimationFrame(checkVolume);
          return;
        }

        // Blow criteria:
        // A) High time-domain peak deviation (air hitting microphone directly), OR
        // B) Low frequency energy spike above ambient noise, OR
        // C) High RMS
        const isBlowing =
          maxDeviation > 38 ||
          lowFreqAvg > Math.max(ambientNoiseRef.current + 16, 32) ||
          rms > 18;

        if (isBlowing) {
          sustainedFramesRef.current += 1;
          // When sound/breath is sustained for just 2 frames (~35ms), blow out!
          if (sustainedFramesRef.current >= 2) {
            triggerExtinguishSequence();
            return;
          }
        } else {
          sustainedFramesRef.current = 0;
        }

        animFrameRef.current = requestAnimationFrame(checkVolume);
      };

      animFrameRef.current = requestAnimationFrame(checkVolume);
    } catch (err) {
      console.warn('Microphone permission denied or unavailable:', err);
      setMicError(true);
      setIsListening(false);
    }
  };

  return (
    <div className="page-view cake-experience-page">
      <h2 className="cake-title">Make a Wish! ✨</h2>

      {/* Decorative Artisanal Birthday Cake with EXACTLY FOUR CANDLES */}
      <div className="cake-stage">
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
                style={
                  !extinguished[candleIndex] && isListening && volumeLevel > 12
                    ? {
                        transform: `translateX(-50%) rotate(${
                          (candleIndex % 2 === 0 ? 1 : -1) * Math.min(25, volumeLevel * 0.35)
                        }deg) scale(${1 - Math.min(0.2, volumeLevel * 0.003)})`,
                        filter: `drop-shadow(0 0 ${8 + volumeLevel * 0.15}px rgba(255, 152, 0, 0.85))`,
                      }
                    : undefined
                }
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
          <p className="cake-instructions-text">
            Make a wish and blow out your candles! 🎂
          </p>

          <p className="cake-mic-hint-text">
            {isListening
              ? '💨 Listening to your breath… blow gently towards your screen now! ❤️'
              : 'Tap below to enable your microphone and blow out the candles, or tap to blow! ✨'}
          </p>

          <div className="cake-action-buttons">
            {!isListening ? (
              <button
                className="romantic-btn"
                onClick={startMicrophone}
                style={{ padding: '0.75rem 1.6rem', fontSize: '1rem', boxShadow: '0 8px 24px rgba(168, 56, 74, 0.3)' }}
              >
                🎤 Enable Microphone & Blow Candles
              </button>
            ) : (
              <div style={{ textAlign: 'center', width: '100%', maxWidth: '300px', margin: '0 auto' }}>
                <p style={{ fontFamily: 'Poppins', fontSize: '0.92rem', color: '#a8384a', fontWeight: 600, margin: '0 0 0.4rem 0' }}>
                  💨 Blow now! (Candles will react to your breath)
                </p>
                <div className="mic-meter-bar" style={{ width: '100%', height: '10px', background: 'rgba(212, 160, 160, 0.3)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div
                    className="mic-meter-fill"
                    style={{
                      width: `${volumeLevel}%`,
                      height: '100%',
                      background: volumeLevel > 35 ? 'linear-gradient(90deg, #ff9800, #4caf50)' : 'var(--deep-rose)',
                      transition: 'width 0.08s ease-out',
                    }}
                  />
                </div>
              </div>
            )}

            {/* Error guidance if mic blocked */}
            {micError && (
              <p style={{ color: '#a8384a', fontSize: '0.88rem', margin: '0.4rem 0', maxWidth: '340px', lineHeight: 1.4 }}>
                Microphone requires a secure connection (HTTPS) on mobile. On your live Vercel link, it will prompt for permission! You can also tap below to blow out your candles! ❤️
              </p>
            )}

            <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', marginTop: '0.6rem' }}>
              <button
                className="secondary-btn"
                onClick={onBack}
                aria-label="Go back to birthday message"
              >
                ← Back
              </button>
              <button
                className="secondary-btn"
                onClick={triggerExtinguishSequence}
                style={{ background: 'rgba(255, 245, 245, 0.95)', border: '1px solid #d4a0a0' }}
              >
                ✨ Tap to Blow Out Candles
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
