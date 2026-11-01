import React, { useState } from 'react';

interface MysterySectionProps {
  initials: string;
  message: string;
  photoUrl: string | null;
  onOpenAlbum: () => void;
}

export const MysterySection: React.FC<MysterySectionProps> = ({
  initials,
  message,
  photoUrl,
  onOpenAlbum,
}) => {
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [isPulsing, setIsPulsing] = useState<boolean>(false);

  const handleReveal = () => {
    setIsPulsing(true);
    setTimeout(() => {
      setIsRevealed(true);
      setIsPulsing(false);
    }, 500);
  };

  return (
    <div className="page-view mystery-page">
      {/* Central Heart with MJB */}
      <div
        className="mystery-heart-container"
        onClick={handleReveal}
        role="button"
        tabIndex={0}
        aria-label="Reveal surprise"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') handleReveal();
        }}
      >
        <div
          className="mystery-heart-shape"
          style={{
            transform: isPulsing ? 'rotate(45deg) scale(1.18)' : undefined,
          }}
        />
        <span className="mystery-initials">{initials}</span>
      </div>

      {!isRevealed ? (
        <button className="romantic-btn" onClick={handleReveal}>
          ✨ Tap to Reveal Your Surprise ✨
        </button>
      ) : (
        <div className="mystery-revealed-card">
          {photoUrl && (
            <img
              src={photoUrl}
              alt="Mystery Surprise"
              className="mystery-special-photo"
            />
          )}

          <p className="mystery-message-body">{message}</p>

          <button className="romantic-btn" onClick={onOpenAlbum}>
            Open Our Photo Album 📖
          </button>
        </div>
      )}
    </div>
  );
};
