import React from 'react';

export const SparkleStarsBackground: React.FC = React.memo(() => {
  const stars = [
    { top: '8%', left: '4%', size: 'w-3.5 h-3.5', delay: '0s', dur: '2.5s', color: 'text-[#F50B8C]' },
    { top: '15%', left: '22%', size: 'w-4 h-4', delay: '1.2s', dur: '3.2s', color: 'text-[#ff85c8]' },
    { top: '25%', left: '10%', size: 'w-5 h-5', delay: '0.4s', dur: '3.6s', color: 'text-[#B894B3]' },
    { top: '42%', left: '3%', size: 'w-4 h-4', delay: '1.6s', dur: '2.8s', color: 'text-[#F9F1F9]' },
    { top: '60%', left: '14%', size: 'w-5 h-5', delay: '0.8s', dur: '3.4s', color: 'text-[#F50B8C]' },
    { top: '78%', left: '6%', size: 'w-3.5 h-3.5', delay: '1.9s', dur: '3.8s', color: 'text-[#ff6ebb]' },
    { top: '90%', left: '20%', size: 'w-4 h-4', delay: '0.5s', dur: '2.9s', color: 'text-[#B894B3]' },

    { top: '12%', left: '38%', size: 'w-4.5 h-4.5', delay: '0.9s', dur: '3.1s', color: 'text-[#F9F1F9]' },
    { top: '32%', left: '48%', size: 'w-3 h-3', delay: '2.1s', dur: '2.4s', color: 'text-[#F50B8C]' },
    { top: '68%', left: '35%', size: 'w-4 h-4', delay: '1.3s', dur: '3.5s', color: 'text-[#ff85c8]' },
    { top: '84%', left: '45%', size: 'w-5 h-5', delay: '0.3s', dur: '2.7s', color: 'text-[#F9F1F9]' },

    { top: '6%', right: '28%', size: 'w-4 h-4', delay: '1.4s', dur: '3.0s', color: 'text-[#e879f9]' },
    { top: '22%', right: '16%', size: 'w-5 h-5', delay: '0.7s', dur: '3.3s', color: 'text-[#ff6ebb]' },
    { top: '38%', right: '32%', size: 'w-3.5 h-3.5', delay: '1.7s', dur: '2.6s', color: 'text-[#F50B8C]' },
    { top: '52%', right: '12%', size: 'w-5.5 h-5.5', delay: '0.2s', dur: '3.5s', color: 'text-[#F9F1F9]' },
    { top: '70%', right: '24%', size: 'w-4 h-4', delay: '1.1s', dur: '2.9s', color: 'text-[#F50B8C]' },
    { top: '86%', right: '15%', size: 'w-4.5 h-4.5', delay: '1.5s', dur: '3.6s', color: 'text-[#ff85c8]' },

    { top: '10%', right: '5%', size: 'w-4 h-4', delay: '0.6s', dur: '2.8s', color: 'text-[#F50B8C]' },
    { top: '30%', right: '4%', size: 'w-3.5 h-3.5', delay: '2.0s', dur: '3.2s', color: 'text-[#B894B3]' },
    { top: '64%', right: '5%', size: 'w-4 h-4', delay: '0.8s', dur: '2.7s', color: 'text-[#F9F1F9]' },
    { top: '92%', right: '3%', size: 'w-3 h-3', delay: '1.8s', dur: '3.4s', color: 'text-[#ff6ebb]' },
  ];

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none"
      style={{ contain: 'strict', willChange: 'transform' }}
    >
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#F50B8C]/12 rounded-full blur-3xl animate-pulse duration-1000" />
      <div className="absolute bottom-1/3 right-1/4 w-[450px] h-[450px] bg-[#610F4E]/25 rounded-full blur-3xl animate-pulse duration-700" />
      <div className="absolute top-1/2 right-1/3 w-80 h-80 bg-[#290A30]/50 rounded-full blur-3xl animate-pulse duration-500" />

      {/* Scattered Dynamic Sparkle Stars */}
      {stars.map((star, i) => (
        <div
          key={i}
          className={`absolute ${star.color} drop-shadow-[0_0_8px_currentColor] animate-pulse`}
          style={{
            top: star.top,
            left: star.left,
            right: star.right,
            animationDuration: star.dur,
            animationDelay: star.delay,
            willChange: 'opacity, transform',
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className={`${star.size} transform transition-transform duration-1000`}
          >
            <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
          </svg>
        </div>
      ))}
    </div>
  );
});
