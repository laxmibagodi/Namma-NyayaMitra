import React, { useState, useEffect } from "react";
import { Scale } from "lucide-react";

interface MessagePair {
  en: string;
  hi: string;
}

interface LoadingOverlayProps {
  isVisible: boolean;
  type?: "analyze" | "generate" | "sync";
}

const ANALYZE_MESSAGES: MessagePair[] = [
  { en: "📖 Reading your document...", hi: "आपका दस्तावेज़ पढ़ा जा रहा है..." },
  { en: "🔍 Identifying risks...", hi: "जोखिम पहचाने जा रहे हैं..." },
  { en: "🌐 Translating to simple language...", hi: "सरल भाषा में अनुवाद हो रहा है..." },
  { en: "📋 Preparing your report...", hi: "रिपोर्ट तैयार की जा रही है..." },
];

const GENERATE_MESSAGES: MessagePair[] = [
  { en: "✍️ Drafting your document as per Indian Laws...", hi: "आपका दस्तावेज़ भारतीय कानूनों के अनुसार तैयार किया जा रहा है..." },
  { en: "⚖️ Injecting standard protective clauses...", hi: "सुरक्षात्मक कानूनी क्लॉज़ जोड़े जा रहे हैं..." },
  { en: "✅ Almost ready for download...", hi: "लगभग तैयार, डाउनलोड के लिए तैयार हो रहा है..." },
  { en: "🖨️ Generating final print format...", hi: "अंतिम प्रिंट प्रारूप तैयार किया जा रहा है..." },
];

const SYNC_MESSAGES: MessagePair[] = [
  { en: "🔒 Syncing with secure legal vault...", hi: "सुरक्षित कानूनी तिजोरी के साथ सहेजा जा रहा है..." },
  { en: "💾 Storing files in encrypted cloud vault...", hi: "आपके दस्तावेज सुरक्षित क्लाउड डेटाबेस में संग्रहीत हो रहे हैं..." },
  { en: "⚡ Finalizing database updates...", hi: "डेटाबेस अपडेट प्रक्रिया पूरी हो रही है..." },
];

export default function LoadingOverlay({ isVisible, type = "analyze" }: LoadingOverlayProps) {
  const [msgIndex, setMsgIndex] = useState(0);
  const messages = type === "analyze" ? ANALYZE_MESSAGES : type === "generate" ? GENERATE_MESSAGES : SYNC_MESSAGES;

  useEffect(() => {
    if (!isVisible) {
      setMsgIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % messages.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [isVisible, messages.length]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-navy/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
      <div className="max-w-md bg-surface p-8 rounded-2xl border border-gold/40 shadow-2xl relative overflow-hidden flex flex-col items-center">
        {/* Glow Element */}
        <div className="absolute -top-12 -left-12 w-24 h-24 bg-gold/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-teal/5 rounded-full blur-2xl" />

        {/* Animated Scales of Justice */}
        <div className="w-24 h-24 relative mb-6 text-gold flex items-center justify-center">
          <svg
            className="w-20 h-20 animate-scales text-gold"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Center Pillar */}
            <path d="M12 3v17" />
            <path d="M19 20H5" />
            {/* Tipping crossbeam */}
            <path d="M5 7h14" />
            {/* Left Cup */}
            <path d="M5 7c0 4 3 6 3 6s3-2 3-6" />
            <circle cx="8" cy="13" r="1.5" fill="currentColor" />
            {/* Right Cup */}
            <path d="M13 7c0 4 3 6 3 6s3-2 3-6" />
            <circle cx="16" cy="13" r="1.5" fill="currentColor" />
          </svg>
        </div>

        {/* Dynamic bilingual progress feedback */}
        <h3 className="text-xl font-semibold text-text mb-2 min-h-[28px] transition-all duration-300">
          {messages[msgIndex].en}
        </h3>
        <p className="text-muted text-[13px] leading-relaxed italic min-h-[20px] transition-all duration-300">
          {messages[msgIndex].hi}
        </p>

        {/* Custom Progress Bar */}
        <div className="w-full bg-surface-2 h-1.5 rounded-full overflow-hidden mt-6 border border-border/10">
          <div className="h-full bg-gradient-to-r from-gold to-teal rounded-full animate-[progress_1.8s_ease-in-out_infinite]" style={{ width: "40%" }} />
        </div>
      </div>

      <style>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(250%); }
        }
      `}</style>
    </div>
  );
}
