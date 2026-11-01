import React, { useState } from 'react';

interface EnvelopeSectionProps {
  preHeading?: string;
  mainHeading: string;
  subHeading: string;
  onOpenLetter: () => void;
  onStartMusic: () => void;
}

export const EnvelopeSection: React.FC<EnvelopeSectionProps> = ({
  subHeading,
  onOpenLetter,
  onStartMusic,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleOpenEnvelope = () => {
    if (isOpen) return;
    setIsOpen(true);

    // Start background music smoothly on interaction
    onStartMusic();
  };

  const handleProceedToLetter = () => {
    onOpenLetter();
  };

  return (
    <div className="page-view envelope-page">
      {/* Title Block — positioned with generous, elegant breathing room */}
      <div className="envelope-title-container">
        <h1 className="main-love-heading">My Love</h1>
        <p className="sub-love-heading">
          {subHeading || 'behind the scenes of my happiness'}
        </p>
      </div>

      {/* 3D Left-Right Opening Envelope */}
      <div
        className={`envelope-outer-wrap ${isOpen ? 'is-opened' : ''}`}
        onClick={!isOpen ? handleOpenEnvelope : undefined}
        role="button"
        tabIndex={0}
        aria-label="Click heart to open letter"
        onKeyDown={(e) => {
          if (!isOpen && (e.key === 'Enter' || e.key === ' ')) {
            handleOpenEnvelope();
          }
        }}
      >
        <div className="envelope-3d-box">
          {/* Inside Back Liner */}
          <div className="envelope-base-interior" />

          {/* FRONT-FACING INSIDE LETTER CARD */}
          <div
            className="front-facing-letter"
            onClick={isOpen ? handleProceedToLetter : undefined}
          >
            <div className="letter-card-border">
              <span className="card-top-icon">💌</span>
              <h3 className="card-greeting-line">My Love,</h3>
              <p className="card-special-msg">
                I have a special message for you ❤️
              </p>
              <button
                className="card-read-action-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleProceedToLetter();
                }}
              >
                Read My Letter ✨
              </button>
            </div>
          </div>

          {/* LEFT FLAP (Opens outwards to the left) */}
          <div className="envelope-flap-left" />

          {/* RIGHT FLAP (Opens outwards to the right) */}
          <div className="envelope-flap-right" />

          {/* TOP FLAP (Folds back smoothly) */}
          <div className="envelope-flap-top-tri" />

          {/* BOTTOM POCKET FOLD */}
          <div className="envelope-flap-bottom" />

          {/* HEART SEAL (Center wax seal) */}
          <div
            className="envelope-center-seal"
            title="Tap the heart seal to open"
            onClick={handleOpenEnvelope}
          >
            <span className="seal-heart-icon">❤️</span>
          </div>
        </div>
      </div>

      {/* Hint text below */}
      <div className="envelope-status-hint">
        {!isOpen && (
          <p className="envelope-hint-text">Tap the heart seal to open ❤️</p>
        )}
      </div>
    </div>
  );
};
