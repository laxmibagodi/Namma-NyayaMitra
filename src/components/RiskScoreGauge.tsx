import React, { useEffect, useState } from "react";

interface RiskScoreGaugeProps {
  score: number; // 0 to 100
  size?: number; // pixel width/height
}

export default function RiskScoreGauge({ score, size = 140 }: RiskScoreGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    // Smooth countdown/up on load
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 100);
    return () => clearTimeout(timer);
  }, [score]);

  // Radius, Circumference calculations
  const radius = 50;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  // Determine levels and color codes
  let color = "#2DD4BF"; // Teal for low risk
  let riskLabelEn = "Low Risk";
  let riskLabelHi = "कम जोखिम";

  if (score > 30 && score <= 65) {
    color = "#E3B341"; // Warning gold
    riskLabelEn = "Medium Risk";
    riskLabelHi = "मध्यम जोखिम";
  } else if (score > 65) {
    color = "#F85149"; // Danger red
    riskLabelEn = "High Risk";
    riskLabelHi = "उच्च जोखिम";
  }

  return (
    <div className="flex flex-col items-center justify-center text-center p-3 p-y-4">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Background Circle */}
        <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r={radius}
            className="stroke-surface-2"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated SVG Circle */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: "stroke-dashoffset 800ms cubic-bezier(0.16, 1, 0.3, 1), stroke 400ms ease",
            }}
          />
        </svg>

        {/* Center Text displaying Score */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-text transition-all duration-300">
            {animatedScore}
          </span>
          <span className="text-[10px] text-muted tracking-wider uppercase">/ 100</span>
        </div>
      </div>

      {/* Risk Badge label */}
      <div className="mt-3 flex flex-col items-center gap-0.5">
        <span
          className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm"
          style={{
            backgroundColor: `${color}15`,
            color: color,
            border: `1px solid ${color}30`,
          }}
        >
          {riskLabelEn}
        </span>
        <span className="text-[11px] text-muted italic font-medium mt-0.5">{riskLabelHi}</span>
      </div>
    </div>
  );
}
