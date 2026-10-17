import React from 'react';
import { motion } from 'framer-motion';

interface CircularGaugeProps {
  score: number; // 0 - 100
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
}

export const CircularGauge: React.FC<CircularGaugeProps> = ({
  score,
  size = 110,
  strokeWidth = 9,
  showLabel = true,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(100, score)) / 100;
  const strokeDashoffset = circumference - progress * circumference;

  // Apple Watch Activity Ring Colors
  let strokeColor = '#30d158'; // Apple Mint Green
  let glowColor = 'rgba(48, 209, 88, 0.2)';
  let labelText = 'Excelente';

  if (score >= 75) {
    strokeColor = '#30d158'; // Apple Fitness Green
    glowColor = 'rgba(48, 209, 88, 0.25)';
    labelText = 'Excelente';
  } else if (score >= 50) {
    strokeColor = '#a4e804'; // Apple Lime
    glowColor = 'rgba(164, 232, 4, 0.25)';
    labelText = 'Bueno';
  } else if (score >= 25) {
    strokeColor = '#ff9f0a'; // Apple Orange
    glowColor = 'rgba(255, 159, 10, 0.25)';
    labelText = 'Moderado';
  } else {
    strokeColor = '#ff453a'; // Apple Red
    glowColor = 'rgba(255, 69, 58, 0.25)';
    labelText = 'Evitar';
  }

  return (
    <div className="relative inline-flex flex-col items-center justify-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
        style={{ filter: `drop-shadow(0 0 8px ${glowColor})` }}
      >
        {/* Track background */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-black/[0.08] dark:text-white/[0.08]"
          strokeWidth={strokeWidth}
        />
        {/* Animated Progress Ring */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>

      {/* Apple Watch Center Metrics */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <motion.span
          className="text-[28px] font-bold tracking-tight text-[#1d1d1f] dark:text-white leading-none font-sans"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          {score}
        </motion.span>
        {showLabel && (
          <span
            className="text-[9px] font-semibold uppercase tracking-wider mt-1 px-1.5 py-0.2 rounded-full"
            style={{ color: strokeColor }}
          >
            {labelText}
          </span>
        )}
      </div>
    </div>
  );
};
