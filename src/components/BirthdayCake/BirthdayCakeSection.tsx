import React, { useState, useEffect, useRef } from 'react';

interface BirthdayCakeSectionProps {
  onWishComplete: () => void;
  onBack: () => void;
}

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
  const ambientNoiseRef = useRef<number>(0);
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

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      cleanupMicrophone();
    };
  }, []);

  const triggerExtinguishSequence = () => {
    if (isExtinguishingRef.current) return;
    isExtinguishingRef.current = true;
    cleanupMicrophone();

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

    // Complete the celebration after all are out
    setTimeout(() => {
      setAllExtinguished(true);
    }, 900);
  };

  const startMicrophone = async () => {
    try {
      setMicError(false);
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
          },
        });
      } catch {
        // Fallback for browsers that reject advanced audio constraints
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }

      streamRef.current = stream;
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      // Resume context if browser started it in suspended state
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.2;
      analyserRef.current = analyser;

      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      setIsListening(true);
      calibrationCountRef.current = 0;
      ambientNoiseRef.current = 0;
      sustainedFramesRef.current = 0;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const checkVolume = () => {
        if (isExtinguishingRef.current) return;

        analyser.getByteFrequencyData(dataArray);

        // Calculate average amplitude & low-frequency wind turbulence
        let sum = 0;
        let lowFreqSum = 0;
        const lowFreqCount = Math.floor(bufferLength * 0.35);

        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
          if (i < lowFreqCount) {
            lowFreqSum += dataArray[i];
          }
        }

        const currentAvg = sum / bufferLength;
        const lowFreqAvg = lowFreqSum / lowFreqCount;

        // Visual feedback meter
        setVolumeLevel(Math.min(100, (currentAvg / 70) * 100));

        // Ambient noise calibration phase (first 20 frames)
        if (calibrationCountRef.current < 20) {
          ambientNoiseRef.current =
            (ambientNoiseRef.current * calibrationCountRef.current + currentAvg) /
            (calibrationCountRef.current + 1);
          calibrationCountRef.current += 1;
          animFrameRef.current = requestAnimationFrame(checkVolume);
          return;
        }

        // Blow detection criteria:
        // Either volume spike over ambient noise OR low-frequency breath turbulence
        const threshold = Math.max(ambientNoiseRef.current * 1.8, 22);

        if (currentAvg > threshold || lowFreqAvg > 36) {
          sustainedFramesRef.current += 1;
          // When sound is sustained for 5 frames (~80ms), detect blowing
          if (sustainedFramesRef.current >= 5) {
            triggerExtinguishSequence();
            return;
          }
        } else {
          sustainedFramesRef.current = Math.max(0, sustainedFramesRef.current - 1);
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
                title={`Candle ${candleIndex + 1}`}
              />
              <div className="candle-wick" />
              <div className="candle-stick">
                <div className="candle-ribbon-stripe" />
              </div>
              <div className="candle-cream-dollop" />
            </div>
          ))}
        </div>

        {/* Cake Tier 1 (Top Tier - Champagne Velvet & Berries) */}
        <div className="cake-tier-top">
          <div className="tier-dripping-glaze">
            <span className="glaze-drip d1" />
            <span className="glaze-drip d2" />
            <span className="glaze-drip d3" />
            <span className="glaze-drip d4" />
            <span className="glaze-drip d5" />
          </div>
          <div className="tier-toppings">
            <span className="mini-berry">🍓</span>
            <span className="mini-flower">🌸</span>
            <span className="mini-berry">🍓</span>
          </div>
        </div>

        {/* Cake Tier 2 (Middle Tier - Rose Cream & Pearl Garland) */}
        <div className="cake-tier-middle">
          <div className="tier-scallop-trim" />
          <div className="middle-tier-decor">
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
            Make a wish and blow out your candles!
          </p>
          <p className="cake-mic-hint-text">
            Allow microphone access and gently blow towards your screen to make the
            candles go out. ❤️
          </p>

          <div className="cake-action-buttons">
            {!isListening ? (
              <button className="romantic-btn" onClick={startMicrophone}>
                🎤 Enable Microphone
              </button>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: 'Poppins', fontSize: '0.9rem', color: '#a8384a', fontWeight: 600 }}>
                  💨 Listening… Blow gently now!
                </p>
                <div className="mic-meter-bar">
                  <div
                    className="mic-meter-fill"
                    style={{ width: `${volumeLevel}%` }}
                  />
                </div>
              </div>
            )}

            {/* Fallback button: Always visible or on mic error */}
            {micError && (
              <p style={{ color: '#a8384a', fontSize: '0.9rem', margin: '0.4rem 0' }}>
                Having trouble with your microphone? No worries, my love! ❤️
              </p>
            )}

            <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', marginTop: '0.4rem' }}>
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
              >
                Tap to Blow Out Candles ❤️
              </button>
            </div>
          </div>
        </>
      ) : (
        /* Celebration State after candles are extinguished */
        <div className="cake-celebration-banner">
          <h2>Yayyy! You made your wish come true! ❤️</h2>
          <p style={{ fontFamily: 'Dancing Script', fontSize: '1.4rem', color: '#c26d7c' }}>
            May all four candles carry your wishes to the stars ✨
          </p>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1rem' }}>
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
