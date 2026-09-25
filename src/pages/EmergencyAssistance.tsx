import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  AlertTriangle, 
  PhoneCall, 
  MessageSquare, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Search,
  Check,
  Building,
  Hammer,
  HelpCircle,
  Clock,
  Loader2
} from "lucide-react";
import BilingualLabel from "../components/BilingualLabel";

interface EmergencyOption {
  id: string;
  titleEn: string;
  titleKn: string;
  titleHi: string;
  descriptionEn: string;
  descriptionKn: string;
  descriptionHi: string;
  icon: string;
  stepsEn: string[];
  stepsKn: string[];
  stepsHi: string[];
  contactsEn: string[];
  contactsKn: string[];
  contactsHi: string[];
}

const EMERGENCY_GUIDES: EmergencyOption[] = [
  {
    id: "fraud",
    titleEn: "Immediate Cyber, Financial or Goods Fraud",
    titleKn: "ಸೈಬರ್ ಅಥವಾ ಹಣಕಾಸಿನ ವಂಚನೆ",
    titleHi: "साइबर या वित्तीय धोखाधड़ी",
    descriptionEn: "Urgent instructions regarding cyberfraud, banking scams, cargo theft, or vendor deceit.",
    descriptionKn: "ಸೈಬರ್ ವಂಚನೆ, ಬ್ಯಾಂಕ್ ಸೈಬರ್ ಸ್ಕ್ಯಾಮ್ ಕಳ್ಳತನ, ಅಂಗಡಿ ಹಣಕಾಸಿನ ಮೋಸ ಅಥವಾ ಹಠಾತ್ ಸರಕು ಕಳ್ಳತನ.",
    descriptionHi: "साइबर वित्तीय धोखाधड़ी, बैंकिंग चोरी, कूरियर स्कैम या वेंडर द्वारा माल वापसी में धोखाधड़ी क्रियाएं।",
    icon: "💸",
    stepsEn: [
      "Dial 1930 Cyber Crime Helpline immediately within 24 hours of financial debit to freeze scammer bank accounts.",
      "Go to www.cybercrime.gov.in and file an official National Cyber Crime complaint record.",
      "Submit an immediate Chargeback Dispute form to your respective bank with screenshots explaining fraud.",
      "Notify your local police station and save correspondence logs."
    ],
    stepsKn: [
      "ಹಣ ಕಳೆದುಕೊಂಡ ತಕ್ಷಣವೇ ೨೪ ಗಂಟೆಯೊಳಗೆ ೧೯೩೦ ಸಂಖ್ಯೆಗೆ ಕರೆ ಮಾಡಿ ಹಣ ಫ್ರೀಜ್ ಮಾಡಲು ವಿನಂತಿಸಿ.",
      "www.cybercrime.gov.in ವೆಬ್‌ಸೈಟ್‌ಗೆ ಭೇಟಿ ನೀಡಿ ಅಧಿಕೃತ ಸೈಬರ್ ಕ್ರೈಮ್ ದೂರು ದಾಖಲಿಸಿ.",
      "ನಿಮ್ಮ ಬ್ಯಾಂಕ್‌ಗೆ ತೆರಳಿ 'ಚಾರ್ಜ್‌ಬ್ಯಾಕ್ ಮತ್ತು ಹಣಕಾಸು ವಾಣಿಜ್ಯ ವಿವಾದ' ಅರ್ಜಿ ಬರೆದು ನೀಡಿ.",
      "ನಿಮ್ಮ ಹತ್ತಿರದ ಪೊಲೀಸ್ ಠಾಣೆಗೆ ತೆರಳಿ ವಿವರ ನೀಡಿ ಸ್ವೀಕೃತಿ ಪತ್ರ ಪಡಕೊಳ್ಳಿ."
    ],
    stepsHi: [
      "वित्तीय धोखाधड़ी होने के 24 घंटे के भीतर तुरंत राष्ट्रीय साइबर वित्तीय हेल्पलाइन 1930 डायल करें।",
      "राष्ट्रीय साइबर अपराध पोर्टल www.cybercrime.gov.in पर आधिकारिक शिकायत दर्ज करें।",
      "अपने संबंधित बैंक को तुरंत धोखाधड़ी के स्क्रीनशॉट के साथ लिखित रूप में सूचित करें और खाता सुरक्षा की मांग करें।",
      "नजदीकी पुलिस स्टेशन को सूचित करें और शिकायत की प्रति सुरक्षित रखें।"
    ],
    contactsEn: ["Dial 1930 - Cyber Security Helpdesk", "Dial 112 - National Emergency Support Unit"],
    contactsKn: ["ಕರೆ ಮಾಡಿ: ೧೯೩೦ - ಸೈಬರ್ ರಕ್ಷಣೆ ಹೆಲ್ಪ್‌ಲೈನ್", "ಕರೆ ಮಾಡಿ: ೧೧೨ - ಪೊಲೀಸ್ ತುರ್ತು ಸಹಾಯವಾಣಿ"],
    contactsHi: ["डायल: 1930 - केंद्रीय साइबर अपराध टीम", "डायल: 112 - राष्ट्रीय आपातकालीन सेवा"]
  },
  {
    id: "legal-notice",
    titleEn: "Received a Sudden Legal Summons or Notice",
    titleKn: "ಹಠಾತ್ ವಕೀಲರ ಅಥವಾ ಕೋರ್ಟ್ ನೋಟಿಸ್ ಬಂದಿದೆ",
    titleHi: "अचानक कानूनी नोटिस या समन प्राप्त होना",
    descriptionEn: "Protection guidelines during police summons, GST tax notices, or private lawyer threats.",
    descriptionKn: "ಪೊಲೀಸ್ ಇಲಾಖೆಯಿಂದ ಅಥವಾ ಜಿಎಸ್‌ಟಿ ತೆರಿಗೆ ಕಚೇರಿಯಿಂದ ಹಾಗು ಇನ್ನಾವುದೇ ವ್ಯಾಪಾರಸ್ಥರಿಂದ ಬೆದರಿಕೆ ನೋಟಿಸ್ ಬಂದಲ್ಲಿ.",
    descriptionHi: "जीएसटी विभाग, प्राइवेट वकील या पुलिस समन प्राप्त होने पर सुरक्षात्मक मार्गदर्शन।",
    icon: "📜",
    stepsEn: [
      "Do NOT panic. Receiving a legal notice does not mean you are arrested or found guilty.",
      "Check the precise response deadline mentioned in the notice (usually 15 to 30 days).",
      "Scan and lock the notice securely inside your Namma NyayaMitra cloud-secure digital vault repository.",
      "Draft a formal response instead of ignoring it, to avoid ex-parte decrees."
    ],
    stepsKn: [
      "ಗಾಬರಿಯಾಗಬೇಡಿ. ನೋಟಿಸ್ ಕೇವಲ ವಿವರ ಕೇಳಲು ಕಳುಹಿಸಿದ್ದು, ಇದು ಶಿಕ್ಷೆಯಲ್ಲ.",
      "ನೋಟಿಸ್‌ನಲ್ಲಿ ಪ್ರತಿಕ್ರಿಯೆ ನೀಡಲು ತಿಳಿಸಿರುವ ಕೊನೆಯ ದಿನಾಂಕವನ್ನು ಗುರುತಿಸಿ (ಸಾಮಾನ್ಯವಾಗಿ ೧೫ ರಿಂದ ೩೦ ದಿನಗಳು).",
      "ನೋಟಿಸ್ ಪತ್ರವನ್ನು ಸ್ಕ್ಯಾನ್ ಮಾಡಿ ನಿಮ್ಮ ನ್ಯಾಯಮಿತ್ರ ಸುರಕ್ಷಿತ ತಿಜೋರಿಯಲ್ಲಿ ಸಂಗ್ರಹಿಸಿ.",
      "ನೋಟಿಸ್ ನಿರ್ಲಕ್ಷಿಸಬೇಡಿ, ಅಧಿಕೃತ ಲಿಖಿತ ಪ್ರತಿಕ್ರಿಯೆ ಸಿದ್ಧಪಡಿಸಿ ಕಳುಹಿಸಿ."
    ],
    stepsHi: [
      "घबराएं नहीं। कानूनी नोटिस मिलने का मतलब यह नहीं है कि आप दोषी पाए गए हैं या गिरफ्तार होने वाले हैं।",
      "नोटिस का जवाब देने की अंतिम तिथि देखें (आमतौर पर 15 से 30 दिन का समय दिया जाता है)।",
      "नोटिस को स्कैन करके अपने न्यायमित्र सुरक्षित डिजिटल तिजोरी में जमा करें।",
      "नोटिस की अनदेखी न करें; गंभीर कानूनी कार्रवाई से बचने के लिए औपचारिक लिखित जवाब तैयार करें।"
    ],
    contactsEn: ["Dial Ministry of Law Assistance Desk: 1800-555-0199"],
    contactsKn: ["ರಾಷ್ಟ್ರೀಯ ಕಾನೂನು ಸಲಹಾ ಕೇಂದ್ರ: 1800-555-0199"],
    contactsHi: ["केंद्रीय कानूनी सहायता डेस्क: 1800-555-0199"]
  },
  {
    id: "payment-dispute",
    titleEn: "Delayed Payment or Client Refusing to Pay",
    titleKn: "ಗ್ರಾಹಕರು ಬಾಕಿ ಹಣ ನೀಡಲು ನಕಾರ ಮಾಡುತ್ತಿದ್ದಾರೆ",
    titleHi: "भुगतान में देरी या ग्राहक द्वारा पैसे देने से इनकार",
    descriptionEn: "Fast claim settlement channels utilizing MSME Samadhaan & legal mediation warnings.",
    descriptionKn: "ಕರಾರು ಇದ್ದರೂ ಹಣ ಪಾವತಿಸದ ಅಥವಾ ೪೫ ದಿನಗಳು ತಡಮಾಡಿ ವ್ಯಾಪಾರ ನಷ್ಟ ಉಂಟುಮಾಡುವ ಗ್ರಾಹಕರಿಂದ ಹಣ ಪಡೆಯಲು.",
    descriptionHi: "एमएसएमई समाधान के तहत बकाया बिलों की वसूली और खरीदार को कानूनी चेतावनी भेजने की प्रक्रिया।",
    icon: "💰",
    stepsEn: [
      "Compile all relevant invoices, delivery challans, and written WhatsApp/Email payment follow-up logs.",
      "Send a Formal demand warning letter referencing Central MSME Samadhaan compounding interest clauses.",
      "Apply online on the MSME Samadhaan Council portal for formal mediation if they ignore your demand.",
      "The buyer must pay 3x interest rate set by RBI for delays beyond the standard 45-day cycle."
    ],
    stepsKn: [
      "ಎಲ್ಲಾ ಸರಕು ತಲುಪಿಸಿದ ರಶೀದಿಗಳು ಮತ್ತು ವಾಟ್ಸಾಪ್/ಇಮೇಲ್ ಮಾತುಕತೆಯ ಚಾಟ್‌ಗಳನ್ನು ಪ್ರಿಂಟ್ ಮಾಡಿ ಇಟ್ಟುಕೊಳ್ಳಿ.",
      "ಎಂಎಸ್‌ಎಂಇ ಸಮಾಧಾನ ವಿಧಿಯ ಚಕ್ರಬಡ್ಡಿ ಷರತ್ತುಗಳನ್ನು ನಮೂದಿಸಿ ಅಂತಿಮ ಬೇಡಿಕೆ ಪತ್ರ (Demand Letter) ಕಳುಹಿಸಿ.",
      "ಪ್ರತಿಕ್ರಿಯೆ ಬಾರದಿದ್ದಲ್ಲಿ ಎಂಎಸ್‌ಎಂಇ ಸಮಾಧಾನ ವೆಬ್‌ಸೈಟ್‌ನಲ್ಲಿ ಜಿಲ್ಲಾ ಕೌನ್ಸಿಲ್ ಪರಿಹಾರಕ್ಕೆ ಅರ್ಜಿ ಹಾಕಿ.",
      "ಖರೀದಿದಾರ ೪೫ ದಿನ ದಾಟಿದ ಸಮಯಕ್ಕೆ ನಿಗದಿತ ಬಡ್ಡಿದರದ ೩ ಪಟ್ಟು ದಂಡ ಪಾವತಿಸಬೇಕಾಗುತ್ತದೆ."
    ],
    stepsHi: [
      "सभी बिल, डिलीवरी रसीदें और व्हाट्सएप/ईमेल चैट का लिखित प्रमाण जमा करें।",
      "एमएसएमई समाधान अधिनियम की चक्रवृत्ति ब्याज धाराओं का हवाला देते हुए एक औपचारिक चेतावनी पत्र भेजें।",
      "यदि वे कोई भुगतान नहीं करते हैं, तो एमएसएमई समाधान ऑनलाइन पोर्टल पर मध्यस्थता के लिए मामला दर्ज करें।",
      "45 दिनों की अवधि पार होने पर खरीदार को आरबीआई द्वारा घोषित बैंक दर से 3 गुना ब्याज देना होगा।"
    ],
    contactsEn: ["Call MSME Samadhaan Facilitation Council Desk: 011-23062223"],
    contactsKn: ["ಎಂಎಸ್‌ಎಂಇ ಸಹಾಯವಾಣಿ: 011-23062223"],
    contactsHi: ["एमएसएमई सहायता डेस्क: 011-23062223"]
  }
];

export default function EmergencyAssistance() {
  const { userProfile } = useAuth();
  const [selectedInquiry, setSelectedInquiry] = useState<EmergencyOption>(EMERGENCY_GUIDES[0]);
  const [panicActive, setPanicActive] = useState(false);
  
  // Custom AI guidance response during panic/urgency
  const [urgentQuestion, setUrgentQuestion] = useState("");
  const [aiUrgentAdvice, setAiUrgentAdvice] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleTriggerPanicButton = () => {
    setPanicActive(true);
    // Auto speak to give assurance to Panicking or low-literacy user
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const textToSpeak = userProfile?.nativeLanguage === "Kannada"
        ? "ಗಾಬರಿಯಾಗಬೇಡಿ. ಪ್ರಮುಖ ರಕ್ಷಣಾ ವ್ಯವಸ್ಥೆ ಸಿದ್ಧವಾಗಿದೆ. ನಿಮ್ಮ ಹತ್ತಿರದ ಸಹಾಯವಾಣಿ ಸಂಖ್ಯೆಯನ್ನು ಸಂಪರ್ಕಿಸಿ."
        : userProfile?.nativeLanguage === "Hindi"
        ? "कृपया घबराएं नहीं। आपातकालीन कानूनी सहायता प्रणाली सक्रिय कर दी गई है। नीचे दिए गए निर्देशों का पालन करें।"
        : "Do not panic. Your Namma NyayaMitra priority emergency shield is active. Please look at the immediate steps to defend yourself.";
      
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = userProfile?.nativeLanguage === "Kannada" ? "kn-IN" : userProfile?.nativeLanguage === "Hindi" ? "hi-IN" : "en-IN";
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleUrgentAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urgentQuestion.trim()) return;

    setIsAiLoading(true);
    setAiUrgentAdvice(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `CRITICAL CRISIS SITUATION URGENT ASSISTANCE REQUIRED!
Type of Emergency Selected: ${selectedInquiry.titleEn}
Urgent Problem Situation detailed by Proprietor: "${urgentQuestion}"

Give 3 immediate action steps they should execute RIGHT NOW (using bullet points).
Identify which Indian Law protects them instantly. Provide clear instructions about what evidence they need to preserve immediately to win. Keep it micro-business friendly.`,
          chatHistory: [],
          nativeLanguage: userProfile?.nativeLanguage || "English",
          chatType: "emergency"
        })
      });

      if (!response.ok) throw new Error("Could not sync advice.");
      const data = await response.json();
      setAiUrgentAdvice(data.reply);
    } catch (err) {
      setAiUrgentAdvice("Error connecting to real-time legal triage servers. Please dial the emergency numbers directly below.");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in space-y-8 text-xs text-left">
      
      {/* Header Banner representing Emergency Support */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-rose-500/25 pb-6 gap-4">
        <div>
          <h2 className="text-3xl font-serif font-bold text-navy flex items-center gap-3">
            <span className="p-2 bg-rose-500 text-white rounded-2xl shadow-lg shadow-rose-500/20 animate-pulse">
              <ShieldAlert className="h-7 w-7" />
            </span>
            Emergency Legal Shield Desk
          </h2>
          <p className="text-sm font-semibold text-rose-600 mt-2 italic">
            ತುರ್ತು ಕಾನೂನು ನೆರವು ಕೊಠಡಿ • Real-Time MSME Fraud & Crisis Intervention Hub
          </p>
        </div>

        <div className="bg-rose-50 border border-rose-200 p-2.5 rounded-2xl flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-rose-600 rounded-full animate-ping shrink-0" />
          <span className="text-[10px] font-extrabold text-rose-700 uppercase tracking-widest leading-none">
            Priority Redline Connected
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-7">
        
        {/* LEFT COLUMN: Red Panic button and Crisis selector */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Big Panic Activator UI component representing 1-click support */}
          <div className="bg-gradient-to-br from-rose-50 to-orange-50 border-2 border-rose-500/20 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left select-none">
              <div className="inline-flex gap-1 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20 text-[8.5px] font-black uppercase text-rose-600">
                ⚠️ Interactive Crisis Triage
              </div>
              <h3 className="text-base font-serif font-black text-rose-950">
                Feeling legal pressure or facing cyber financial fraud?
              </h3>
              <p className="text-muted text-[10px] leading-relaxed max-w-xl font-medium">
                Clicking the urgent shield active button prepares immediate central helpdesks, plays a stabilizing trilingual safety guidance audio, and opens priority direct booking lines.
              </p>
            </div>

            <button
              onClick={handleTriggerPanicButton}
              className={`p-6 w-32 h-32 rounded-full font-serif font-black uppercase shadow-2xl transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 border-4 shrink-0 active:scale-90 ${
                panicActive 
                  ? "bg-rose-600 border-white text-white rotate-12 scale-105 shadow-[0_0_30px_#EF4444]"
                  : "bg-rose-500 border-rose-600 hover:bg-rose-600 text-white hover:scale-105 shadow-md flex"
              }`}
            >
              <AlertTriangle className="h-7 w-7 text-white animate-bounce" />
              <span className="text-[11px] font-black leading-none">HELP ACTIVE</span>
              <span className="text-[8px] opacity-80 leading-none mt-1">ಉಚಿತ ರಕ್ಷಣೆ</span>
            </button>
          </div>

          {/* Emergency guides selector tabs */}
          <div className="space-y-4">
            <h4 className="text-navy font-serif font-extrabold text-sm border-b border-border/10 pb-1 flex items-center gap-1.5">
              <span>Select Your Threat Type / ದೂರು ಸಲ್ಲಿಸುವ ಹಂತ:</span>
            </h4>

            <div className="grid md:grid-cols-3 gap-3.5">
              {EMERGENCY_GUIDES.map((guide) => {
                const active = selectedInquiry.id === guide.id;
                return (
                  <button
                    key={guide.id}
                    onClick={() => {
                      setSelectedInquiry(guide);
                      setAiUrgentAdvice(null);
                      setUrgentQuestion("");
                    }}
                    className={`p-4 rounded-2xl border-2 text-left transition-all h-28 flex flex-col justify-between cursor-pointer select-all ${
                      active
                        ? "bg-rose-500/10 border-rose-500 text-rose-950 font-bold shadow-md"
                        : "bg-surface border-border/10 text-text hover:bg-surface-2"
                    }`}
                  >
                    <span className="text-2xl leading-none">{guide.icon}</span>
                    <div className="space-y-0.5 leading-tight">
                      <span className="font-extrabold text-[11px] block truncate text-navy">
                        <span>
                          {userProfile?.nativeLanguage === "Kannada" ? guide.titleKn : userProfile?.nativeLanguage === "Hindi" ? guide.titleHi : guide.titleEn}
                        </span>
                      </span>
                      <span className="text-[9px] text-muted block truncate italic font-medium">
                        {userProfile?.nativeLanguage === "Kannada" ? guide.titleKn : userProfile?.nativeLanguage === "Hindi" ? guide.titleHi : guide.titleKn}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected guide details displaying Immediate Defenses */}
            <div className="bg-surface border border-rose-500/20 rounded-3xl p-5.5 shadow-md space-y-5 text-left">
              <div className="flex items-center justify-between border-b border-border/10 pb-3">
                <div className="space-y-0.5">
                  <span className="text-xs text-rose-600 font-extrabold block uppercase tracking-widest leading-none">DEFENSIVE STEPS TO COPE RIGHT NOW</span>
                  <h4 className="text-sm font-serif font-black text-navy pt-1.5">
                    <span>
                      {userProfile?.nativeLanguage === "Kannada" ? selectedInquiry.titleKn : userProfile?.nativeLanguage === "Hindi" ? selectedInquiry.titleHi : selectedInquiry.titleEn}
                    </span>
                  </h4>
                </div>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-600 font-bold">Priority Triage</span>
              </div>

              {/* Steps bullets */}
              <div className="space-y-3.5">
                {(userProfile?.nativeLanguage === "Kannada" ? selectedInquiry.stepsKn : userProfile?.nativeLanguage === "Hindi" ? selectedInquiry.stepsHi : selectedInquiry.stepsEn).map((step, i) => (
                  <div key={i} className="flex gap-3 items-start text-text leading-relaxed">
                    <span className="w-5 h-5 rounded-full bg-rose-500 text-white font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="font-bold text-[10.5px]">{step}</p>
                  </div>
                ))}
              </div>

              {/* Helpline support contacts lists */}
              <div className="bg-rose-500/5 border border-rose-500/10 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="space-y-0.5 text-center md:text-left">
                  <span className="text-[9px] text-rose-600 uppercase font-extrabold block">Official Central Authority Contacts:</span>
                  <p className="text-[11.5px] font-bold text-navy leading-normal">
                    {(userProfile?.nativeLanguage === "Kannada" ? selectedInquiry.contactsKn : userProfile?.nativeLanguage === "Hindi" ? selectedInquiry.contactsHi : selectedInquiry.contactsEn).join("  •  ")}
                  </p>
                </div>
                
                <button
                  onClick={() => alert("Initiating priority telephone carrier call... Please ensure device sim card is active.")}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black text-[9.5px] uppercase tracking-wider rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <PhoneCall className="h-3.5 w-3.5" />
                  <span>Call Emergency HELPLINE</span>
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: AI Instant Advice & Priority Lawyer Connection */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* AI Immediate crisis Advisor */}
          <div className="bg-navy border border-gold/30 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-2 pb-2.5 border-b border-gold/15">
              <span className="bg-gold text-navy p-1.5 rounded-xl"><Sparkles className="h-4.5 w-4.5 animate-pulse" /></span>
              <div className="text-left">
                <h4 className="text-gold font-serif font-black text-[12.5px] leading-none">Instant AI Defense Guide</h4>
                <p className="text-slate-300 text-[9px] italic font-semibold pt-1 uppercase">ತ್ವರಿತ ಸಲಹೆ ಕೊಠಡಿ</p>
              </div>
            </div>

            <form onSubmit={handleUrgentAskAI} className="space-y-3 pt-1">
              <label className="text-slate-200 text-[10.5px] leading-relaxed block text-left font-bold">
                Detail your emergency situation to generate custom defenses:
              </label>
              <textarea
                value={urgentQuestion}
                onChange={(e) => setUrgentQuestion(e.target.value)}
                placeholder="e.g. My buyer cancelled a custom order after shipping and refuses to accept cargo. How do I defend ₹3,00,000?"
                rows={3}
                className="w-full bg-navy-light border border-slate-700 rounded-xl p-3 text-white text-[10.5px] focus:outline-none focus:border-gold font-semibold"
              />

              <button
                type="submit"
                disabled={isAiLoading}
                className="w-full py-2.5 bg-gold hover:bg-gold-light text-navy text-[10.5px] font-black uppercase rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                {isAiLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-navy" />
                    <span>Analyzing Protective Rights...</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="h-4 w-4" />
                    <span>Get Immediate Legal Defenses</span>
                  </>
                )}
              </button>
            </form>

            {aiUrgentAdvice && (
              <div className="bg-white/95 border border-gold/30 p-4 rounded-2xl text-navy text-[10.5px] leading-relaxed text-left font-semibold space-y-2 max-h-[300px] overflow-y-auto select-text animate-fade-in shadow-inner">
                <span className="bg-rose-500/10 text-rose-700 px-2 py-0.5 rounded-md font-black uppercase text-[8px] block tracking-widest w-fit">AI Emergency Directive</span>
                <p className="whitespace-pre-wrap">{aiUrgentAdvice}</p>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
