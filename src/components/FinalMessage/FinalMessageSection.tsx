import React, { useState, useEffect, useRef } from 'react';
import calendarImg from '../../assets/november-2007-calendar.jpg';

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
  const [calendarLoaded, setCalendarLoaded] = useState<boolean>(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    // Check if calendar is already cached/completed by browser
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setCalendarLoaded(true);
    }
  }, []);

  return (
    <div className="page-view final-message-page">
      <h1 className="final-page-heading">{heading}</h1>

      <div className="final-paragraphs-box">
        {/* Keepsake Calendar Frame: November 2007 with 4th November Heart */}
        <div className="birthday-calendar-wrapper">
          <div className="birthday-calendar-frame">
            {!calendarLoaded && (
              <div className="calendar-skeleton-loader" aria-hidden="true">
                <div className="skeleton-shimmer-wave" />
                <div className="skeleton-center-badge">
                  <span className="skeleton-badge-icon">📅💕</span>
                  <span className="skeleton-badge-text">Loading calendar… ✨</span>
                </div>
              </div>
            )}
            <img
              ref={imgRef}
              src={calendarImg}
              alt="November 2007 Calendar - 4th November Birthday"
              className={`birthday-calendar-img ${calendarLoaded ? 'is-loaded' : 'is-loading'}`}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              onLoad={() => setCalendarLoaded(true)}
            />
          </div>
          <span className="calendar-subtext">The day the world was blessed with you ✨</span>
        </div>

        {paragraphs.map((para, idx) => (
          <p key={idx}>{para}</p>
        ))}

        <div className="final-love-signature">{loveSignature}</div>

        {/* Romantic Bengali Vow */}
        <div className="bengali-love-vow">
          বউ বলে যখন ডেকেছি তখন বউ বানিয়েই ছাড়বো তুমি শুধু আমার হাতটা ধরে রেখো...!! 🫶🏻🥰
        </div>
      </div>

      {/* Romantic Flowers Banner: Sunflowers, Roses, White Lilies */}
      <div className="romantic-flowers-banner" title="Sunflowers, Roses and White Lilies">
        🌻 🌹 🤍 🌻 🌹 🤍
      </div>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', marginTop: '0.8rem' }}>
        <button className="secondary-btn" onClick={onBack} aria-label="Go back to our memories">
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
