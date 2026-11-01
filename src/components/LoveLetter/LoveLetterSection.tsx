import React from 'react';

interface LoveLetterSectionProps {
  dateHeading: string;
  greeting: string;
  paragraphs: string[];
  closing: string;
  photoUrl: string | null;
  onNext: () => void;
  onBack: () => void;
}

function formatLetterParagraph(text: string): React.ReactNode {
  // Format **bold** and *italic* cleanly
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} style={{ color: 'var(--deep-rose)', fontWeight: 600 }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

export const LoveLetterSection: React.FC<LoveLetterSectionProps> = ({
  dateHeading,
  greeting,
  paragraphs,
  closing,
  photoUrl,
  onNext,
  onBack,
}) => {
  return (
    <div className="page-view love-letter-page">
      <div className="parchment-letter-card">
        {/* Dedicated internally scrollable area */}
        <div className="letter-scroll-area">
          <div className="letter-title-header">
            <h2 className="letter-date-heading">{dateHeading}</h2>
          </div>

          <div className="letter-greeting-text">{greeting}</div>

          <div className="letter-content-body">
            {paragraphs.map((para, index) => (
              <p key={index}>{formatLetterParagraph(para)}</p>
            ))}

            {photoUrl && (
              <div className="letter-photo-display">
                <img src={photoUrl} alt="Special moment for us" />
              </div>
            )}

            <div className="letter-closing-text">
              {formatLetterParagraph(closing)}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation buttons sit BELOW the scrollable parchment */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button className="secondary-btn" onClick={onBack} aria-label="Go back to envelope">
          ← Back
        </button>
        <button className="romantic-btn" onClick={onNext}>
          See Our Memories 📸
        </button>
      </div>
    </div>
  );
};
