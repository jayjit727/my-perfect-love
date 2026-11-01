import React from 'react';

interface FinalMessageSectionProps {
  heading: string;
  paragraphs: string[];
  loveSignature: string;
  onContinueToCake: () => void;
  onBack: () => void;
}

export const FinalMessageSection: React.FC<FinalMessageSectionProps> = ({
  heading,
  paragraphs,
  loveSignature,
  onContinueToCake,
  onBack,
}) => {
  return (
    <div className="page-view final-message-page">
      <h1 className="final-page-heading">{heading}</h1>

      <div className="final-paragraphs-box">
        {paragraphs.map((para, idx) => (
          <p key={idx}>{para}</p>
        ))}

        <div className="final-love-signature">{loveSignature}</div>
      </div>

      {/* Romantic Flowers Banner: Sunflowers, Roses, White Lilies */}
      <div className="romantic-flowers-banner" title="Sunflowers, Roses and White Lilies">
        🌻 🌹 🤍 🌻 🌹 🤍
      </div>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', marginTop: '0.8rem' }}>
        <button className="secondary-btn" onClick={onBack} aria-label="Go back to love letter">
          ← Back
        </button>
        <button
          className="romantic-btn"
          onClick={onContinueToCake}
        >
          Make a Wish & Blow Your Candles 🎂
        </button>
      </div>
    </div>
  );
};
