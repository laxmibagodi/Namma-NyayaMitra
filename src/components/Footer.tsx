import React from "react";
import { ShieldCheck, Scale } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-border mt-auto py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Scale logo footer representation */}
        <div className="flex justify-center items-center gap-2 mb-4 text-gold/80">
          <Scale className="h-5 w-5" />
          <span className="font-serif font-bold text-lg text-gold leading-none">NyayaAI</span>
          <span className="text-xs text-muted">|</span>
          <span className="text-xs text-muted italic font-medium">छोटे व्यवसायों का कानूनी ढाल</span>
        </div>

        {/* Disclaimer Board */}
        <div className="max-w-3xl mx-auto bg-navy/40 border border-border/10 p-5 rounded-2xl mb-6">
          <div className="flex items-start gap-3 text-left">
            <div className="p-1.5 bg-warning/15 border border-warning/30 rounded-lg text-warning mt-0.5 shrink-0">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-text leading-relaxed font-medium">
                DISCLAIMER: NyayaAI provides AI-generated legal summaries and template drafting tools based on machine learning.
                This information is created for general educational and reference purposes only, and does not constitute formal legal advice or create a lawyer-client relationship.
                Always consult a registered, qualified advocate or attorney for serious legal reviews, stamps, or litigation matters.
              </p>
              <p className="text-[11px] text-muted leading-relaxed font-normal italic mt-2.5">
                अस्वीकरण: न्यायमित्र मशीन लर्निंग पर आधारित AI-रचित कानूनी समीक्षा और अनुबंध प्रारूप प्रदान करता है।
                यह जानकारी केवल संदर्भ और व्यावसायिक शिक्षा के लिए है, और इसे व्यावसायिक कानूनी सलाह नहीं माना जाना चाहिए।
                गंभीर कानूनी विवादों, कोर्ट मामलों या गंभीर समझौतों के लिए हमेशा किसी योग्य पंजीकृत अधिवक्ता (वकील) से परामर्श अवश्य लें।
              </p>
            </div>
          </div>
        </div>

        {/* Brand Copyright */}
        <p className="text-xs text-muted">
          &copy; {new Date().getFullYear()} NyayaAI AI. Built for MSME Empowerment. Always secure, always private.
        </p>

      </div>
    </footer>
  );
}
