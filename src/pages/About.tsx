import React from "react";
import { ShieldCheck, Zap, Heart, Cpu } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { translate } from "../utils/translations";

export default function About() {
  const { nativeLanguage } = useAuth();

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 animate-fade-in space-y-12 text-left">
      
      {/* Title Header */}
      <div className="text-center">
        <h2 className="text-4xl font-serif font-black text-text mb-1">
          {translate("aboutHeadline", nativeLanguage)}
        </h2>
        <p className="text-gold font-medium italic">
          {nativeLanguage === "Kannada" ? "ನ್ಯಾಯಮಿತ್ರದ ಹಿನ್ನೆಲೆ ಮತ್ತು ಉದ್ಧೇಶ"
           : nativeLanguage === "Hindi" ? "न्यायमित्र की पृष्ठभूमि और उद्देश्य"
           : nativeLanguage === "Telugu" ? "న్యాయమిత్ర ప్రస్థానం మరియు లక్ష్యం"
           : "Background and mission of NyayaAI"}
        </p>
      </div>

      {/* Mission Statement Callout */}
      <div className="bg-surface border border-gold/30 p-8 rounded-2xl relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 p-4 opacity-5 text-gold font-bold text-7xl select-none font-serif">
          ⚖️
        </div>
        <div className="relative z-10 space-y-4">
          <p className="text-lg text-text leading-relaxed font-semibold">
            {nativeLanguage === "Kannada" ? "ಸಾಮಾನ್ಯ ಕಾನೂನು ಒಪ್ಪಂದಗಳ ವಿಶ್ಲೇಷಣೆ ಪಡೆಯಲು ಸಣ್ಣ ವ್ಯಾಪಾರಿಗಳು ವಕೀಲರಿಗೆ ದುಬಾರಿ ಶುಲ್ಕ ತೆರಬೇಕಾಗಿಲ್ಲ. ಆರ್ಥಿಕ ಅಸಮಾನತೆ ತೊಡೆದುಹಾಕಲು ಉಚಿತ ಕಾನೂನು ನೆರವು ನೀಡುವುದು ನಮ್ಮ ಆಶಯ."
             : nativeLanguage === "Hindi" ? "छोटे और मध्यम व्यवसायियों (MSMEs) को वह कानूनी सुरक्षा मिल सके जिसके वे हकदार हैं। हमारा मानना है कि सही कानूनी जानकारी और अनुबंधों की समझ सिर्फ बड़े कॉर्पोरेट्स या अमीरों का विशेषाधिकार नहीं होना चाहिए।"
             : nativeLanguage === "Telugu" ? "చిన్న మరియు మధ్యతరగతి వ్యాపారులకు (MSMEs) వారికి కావలసిన న్యాయ రక్షణను ఉచితంగా అందించడమే మా లక్ష్యం. న్యాయ పరిజ్ఞానం అనేది కేవలం ధనవంతులకు మాత్రమే పరిమితం కాకూడదు."
             : "NyayaAI was built to give every Indian small business owner the legal protection they deserve — without needing to pay a lawyer for basic documents and contract reviews. We believe legal clarity should not be a privilege of the wealthy."}
          </p>
          {nativeLanguage !== "English" && (
            <p className="text-xs text-muted italic leading-relaxed font-normal opacity-70">
              English: NyayaAI was built to give every Indian small business owner the legal protection they deserve — without needing to pay a lawyer for basic documents and contract reviews.
            </p>
          )}
        </div>
      </div>

      {/* Value Pillars Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        
        <div className="bg-surface border border-border/15 p-6 rounded-2xl flex flex-col items-center text-center">
          <div className="p-3.5 bg-teal/15 border border-teal/30 text-teal rounded-2xl mb-4 shadow-sm">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h4 className="text-base font-bold text-text mb-1">
            {nativeLanguage === "Kannada" ? "೧೦೦% ಸುರಕ್ಷಿತ"
             : nativeLanguage === "Hindi" ? "100% सुरक्षित"
             : nativeLanguage === "Telugu" ? "100% సురక్షితం"
             : "100% Secure & Private"}
          </h4>
          <p className="text-xs text-text/80 leading-relaxed">
            {nativeLanguage === "Kannada" ? "ನಿಮ್ಮ ಒಪ್ಪಂದಗಳು ಕ್ಲೈಂಟ್ ಸಾಧನದಲ್ಲೇ ನೇರವಾಗಿ ಗೂಗಲ್ ಜೆಮಿನಿ ಎಐ ಮೂಲಕ ಸಂಸ್ಕರಿಸಲ್ಪಡುತ್ತವೆ ಮತ್ತು ಎಲ್ಲಿಯೂ ಶೇಖರಿಸಲಾಗುವುದಿಲ್ಲ."
             : nativeLanguage === "Hindi" ? "आपके अनुबंध सीधे आपके डिवाइस पर जेमिनी एआई द्वारा सुरक्षित रूप से जांचे जाते हैं और कभी भी सर्वर पर सेव नहीं होते हैं।"
             : nativeLanguage === "Telugu" ? "మీ ఒప్పందాలు నేరుగా గూగుల్ జెమినీ తో పరిశీలించబడతాయి, ఇవి ఎక్కడా స్టోర్ కావు."
             : "Your contracts are processed in-memory directly via Gemini AI and are never stored on any persistent backend."}
          </p>
        </div>

        <div className="bg-surface border border-border/15 p-6 rounded-2xl flex flex-col items-center text-center">
          <div className="p-3.5 bg-gold/15 border border-gold/30 text-gold rounded-2xl mb-4 shadow-sm">
            <Zap className="h-6 w-6" />
          </div>
          <h4 className="text-base font-bold text-text mb-1">
            {nativeLanguage === "Kannada" ? "ತ್ವರಿತ ವಿಶ್ಲೇಷಣೆ"
             : nativeLanguage === "Hindi" ? "तत्काल विश्लेषण"
             : nativeLanguage === "Telugu" ? "వెంటనే రక్షణ విశ్లేషణ"
             : "Instant Legal Analysis"}
          </h4>
          <p className="text-xs text-text/80 leading-relaxed">
            {nativeLanguage === "Kannada" ? "ಕೇವಲ ಕರದ ಮೇಲೆ ನಿಮ್ಮ ಮಾತೃಭಾಷೆಯಲ್ಲಿ ಸಂಪೂರ್ಣ ವಿಶ್ಲೇಷಣೆ ವರದಿ ೧೨ ಸೆಕೆಂಡ್‌ಗಳಲ್ಲಿ ಲಭ್ಯ."
             : nativeLanguage === "Hindi" ? "अनुबंधों पर सरल स्वदेशी भाषा में विश्लेषण रिपोर्ट मात्र 12 सेकंड में आपके सामने आ जाती है।"
             : nativeLanguage === "Telugu" ? "ఒడంబడిక పత్రాలపై వెంటనే మీ సొంత సామాన్య భాషలో నివేదిక కేవలం 12 సెకన్లలో లభిస్తుంది."
             : "Get simplified bilingual clause extractions, risk indices, and actionable, direct advice in under 15 seconds."}
          </p>
        </div>

        <div className="bg-surface border border-border/15 p-6 rounded-2xl flex flex-col items-center text-center">
          <div className="p-3.5 bg-danger/15 border border-danger/30 text-danger rounded-2xl mb-4 shadow-sm">
            <Heart className="h-6 w-6" />
          </div>
          <h4 className="text-base font-bold text-text mb-1">
            {nativeLanguage === "Kannada" ? "ಯಾವಾಗಲೂ ಉಚಿತ ನೆರವು"
             : nativeLanguage === "Hindi" ? "सदा निःशुल्क"
             : nativeLanguage === "Telugu" ? "ఎల్లప్పుడూ ఉచితం"
             : "Always Free for MSMEs"}
          </h4>
          <p className="text-xs text-text/80 leading-relaxed">
            {nativeLanguage === "Kannada" ? "ಸಣ್ಣ ಕಿರಾಣಿ ಅಂಗಡಿಯವರು ಮತ್ತು ಕರಕುಶಲ ಮಾಲೀಕರಿಗೆ ಯಾವುದೇ ಗುಪ್ತ ಶುಲ್ಕವಿಲ್ಲದೇ ಸದಾ ಉಚಿತ."
             : nativeLanguage === "Hindi" ? "छोटे किराना दुकानदारों और छोटे उद्यमियों के लिए बिना किसी छिपे शुल्क के आजीवन मुफ़्त कानूनी सेवा।"
             : nativeLanguage === "Telugu" ? "చిన్న కిరాణా దుకాణాలు మరియు కుటీర పరిశ్రమల వారికి ఎలాంటి హిడెన్ చార్జీలు లేకుండా ఉచితం."
             : "No registration hurdles, no hidden premium paywalls. Empowering Kirana shop owners and micro-entrepreneurs."}
          </p>
        </div>

      </div>

      {/* Tech Stack details */}
      <div className="bg-surface-2 border border-border/10 p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-4">
          <Cpu className="h-5 w-5 text-gold shrink-0" />
          <h4 className="text-base font-bold text-text">
            {nativeLanguage === "Kannada" ? "ಕಾನೂನು ಸುರಕ್ಷಾ ತಂತ್ರಜ್ಞಾನ ವ್ಯವಸ್ಥೆ"
             : nativeLanguage === "Hindi" ? "कवच डिजिटल वास्तुकला"
             : nativeLanguage === "Telugu" ? "సాంకేతిక నిర్మాణ వ్యవస్థ"
             : "Technical Architecture & Legal Stack"}
          </h4>
        </div>
        <div className="space-y-4 text-xs text-muted leading-relaxed">
          <p>
            {nativeLanguage === "Kannada" ? "ನ್ಯಾಯಮಿತ್ರವನ್ನು ಅತ್ಯುನ್ನತ ಸರ್ವರ್ ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಕೋಬಲ್ಟ್ ಕರಾರುಗಳ ಸುರಕ್ಷತಾ ತತ್ವದ ಮೇಲೆ ರಚಿಸಲಾಗಿದೆ."
             : nativeLanguage === "Hindi" ? "न्यायमित्र पूर्णतः सुरक्षित रिएक्ट और नोड एक्सप्रेस सर्वर प्रणालियों पर काम करता है।"
             : nativeLanguage === "Telugu" ? "న్యాయమిత్ర రియాక్ట్ మరియు నోడ్ జెఎస్ ఎక్స్‌ప్రెస్ సర్వర్ సమన్వయంతో పనిచేస్తుంది."
             : "NyayaAI is developed as a production-level fullstack React application backed by custom Express services to maintain credentials securely."}
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2 font-mono text-[11px]">
            <li><strong className="text-text">Client-Side Runtime:</strong> React 19 + TypeScript bundler via Vite 6</li>
            <li><strong className="text-text">Backend Operations:</strong> Node.js Express Server proxy routing</li>
            <li><strong className="text-text">AI Cognition:</strong> Google Gemini 3.5 Flash Model using structured response schemas</li>
            <li><strong className="text-text">OCR & PDF Parsing:</strong> Client-side text matrix compilers via `pdfjs-dist`</li>
            <li><strong className="text-text">Document Compilers:</strong> `jsPDF` custom multiline formatting</li>
          </ul>
        </div>
      </div>

    </div>
  );
}
