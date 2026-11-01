import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';

export interface MusicPlayerHandle {
  playMusic: () => void;
  pauseMusic: () => void;
  toggleMusic: () => void;
}

interface MusicPlayerProps {
  customMusicUrl: string | null;
  volume: number;
}

export const MusicPlayer = forwardRef<MusicPlayerHandle, MusicPlayerProps>(
  ({ customMusicUrl, volume }, ref) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [isMuted, setIsMuted] = useState<boolean>(false);
    const [showPopover, setShowPopover] = useState<boolean>(false);
    const userInteractedRef = useRef<boolean>(false);

    const defaultMusicSrc = `${import.meta.env.BASE_URL.replace(/\/$/, '')}/music/background.mp3`;
    const activeSrc = customMusicUrl || defaultMusicSrc;

    // Expose control methods
    useImperativeHandle(ref, () => ({
      playMusic: () => {
        if (audioRef.current && !isPlaying) {
          audioRef.current.play().then(() => {
            setIsPlaying(true);
          }).catch(err => console.log('Autoplay deferred:', err));
        }
      },
      pauseMusic: () => {
        if (audioRef.current && isPlaying) {
          audioRef.current.pause();
          setIsPlaying(false);
        }
      },
      toggleMusic: () => {
        togglePlay();
      }
    }));

    // Update volume
    useEffect(() => {
      if (audioRef.current) {
        audioRef.current.volume = volume;
      }
    }, [volume]);

    // Handle global first touch/click anywhere to start music (browser autoplay policy)
    useEffect(() => {
      const handleFirstTouch = () => {
        if (!userInteractedRef.current && audioRef.current && !isPlaying) {
          userInteractedRef.current = true;
          audioRef.current.play().then(() => {
            setIsPlaying(true);
          }).catch(err => {
            console.log('Audio autoplay prevented:', err);
          });
        }
      };

      window.addEventListener('click', handleFirstTouch, { once: true });
      window.addEventListener('touchstart', handleFirstTouch, { once: true });
      window.addEventListener('keydown', handleFirstTouch, { once: true });

      return () => {
        window.removeEventListener('click', handleFirstTouch);
        window.removeEventListener('touchstart', handleFirstTouch);
        window.removeEventListener('keydown', handleFirstTouch);
      };
    }, [isPlaying]);

    const togglePlay = () => {
      if (!audioRef.current) return;
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(err => console.log('Audio play failed:', err));
      }
    };

    const toggleMute = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!audioRef.current) return;
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    };

    return (
      <div className="music-control-wrapper">
        <audio
          ref={audioRef}
          src={activeSrc}
          loop
          preload="auto"
          onEnded={() => setIsPlaying(false)}
        />
        
        <button
          className={`music-btn ${isPlaying ? 'playing' : ''}`}
          onClick={togglePlay}
          onContextMenu={(e) => {
            e.preventDefault();
            setShowPopover(!showPopover);
          }}
          title={isPlaying ? 'Click to pause romantic music' : 'Click to play romantic music'}
          aria-label="Toggle background music"
        >
          {isPlaying ? (isMuted ? '🔇' : '🎵') : '🔈'}
        </button>

        {showPopover && (
          <div
            style={{
              position: 'absolute',
              top: '52px',
              right: 0,
              background: '#ffffff',
              padding: '0.8rem 1rem',
              borderRadius: '12px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              border: '1px solid #f3d0d6',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              zIndex: 1000,
              minWidth: '150px',
              fontSize: '0.85rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{isPlaying ? 'Playing' : 'Paused'}</span>
              <button
                onClick={toggleMute}
                style={{
                  background: 'none',
                  border: '1px solid #d4a0a0',
                  borderRadius: '4px',
                  padding: '2px 6px',
                  cursor: 'pointer'
                }}
              >
                {isMuted ? 'Unmute' : 'Mute'}
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>🔊</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => {
                  if (audioRef.current) {
                    audioRef.current.volume = parseFloat(e.target.value);
                  }
                }}
                style={{ width: '100%' }}
              />
            </div>
          </div>
        )}
      </div>
    );
  }
);
