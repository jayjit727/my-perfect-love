import React, { useMemo } from 'react';

const ICONS = ['❤️', '💕', '💗', '🤍', '💖', '🌻', '🌹', '✨', '🌸'];

export const FloatingHearts: React.FC = () => {
  const items = useMemo(() => {
    return Array.from({ length: 22 }).map((_, i) => ({
      id: i,
      icon: ICONS[i % ICONS.length],
      left: `${(i * 4.5 + Math.random() * 4) % 96}%`,
      duration: `${10 + Math.random() * 12}s`,
      delay: `${Math.random() * 8}s`,
      size: `${0.9 + Math.random() * 1.1}rem`,
    }));
  }, []);

  return (
    <div className="floating-elements-container" aria-hidden="true">
      {items.map((item) => (
        <span
          key={item.id}
          className="floating-item"
          style={{
            left: item.left,
            animationDuration: item.duration,
            animationDelay: item.delay,
            fontSize: item.size,
          }}
        >
          {item.icon}
        </span>
      ))}
    </div>
  );
};
