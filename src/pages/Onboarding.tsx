import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  Building2, 
  User, 
  Globe, 
  Sparkles, 
  ArrowRight, 
  LogOut, 
  ShieldCheck, 
  Volume2, 
  Briefcase, 
  TrendingUp, 
  CheckCircle,
  HelpCircle,
  Lock,
  Calendar,
  AlertOctagon
} from "lucide-react";
import { hashPin } from "../utils/security";

interface OnboardingProps {
  onComplete: () => void;
}

// 1. Language Prefs
const NATIVE_LANGUAGES = [
  { id: "Kannada", nameEn: "Kannada", nameNative: "ಕನ್ನಡ", code: "kn-IN" },
  { id: "Hindi", nameEn: "Hindi", nameNative: "हिंदी", code: "hi-IN" },
  { id: "Telugu", nameEn: "Telugu", nameNative: "తెలుగు", code: "te-IN" },
  { id: "English", nameEn: "English", nameNative: "English", code: "en-US" }
];

// 2. Roles
const STAKEHOLDER_ROLES = [
  { id: "Proprietor", labelEn: "Small Business Proprietor", labelHi: "छोटे व्यवसायी / मालिक", labelKn: "ಸಣ್ಣ ಉದ್ಯಮದ ಮಾಲೀಕರು", labelTe: "చిన్న వ్యాపార యజమాని" },
  { id: "Vendor", labelEn: "Vendor / Supplier", labelHi: "ಆಪೂರ್ತಿಕರ್ತಾ / ವೆಂಡರ್", labelKn: "ಮಾರಾಟಗಾರರು / ಸರಬರಾಜುದಾರರು", labelTe: "విక్రేత / సరఫరాదారు" },
  { id: "Freelancer", labelEn: "Freelancer / Consultant", labelHi: "फ्रीलांसर / सलाहकार", labelKn: "ಸ್ವತಂತ್ರ ವೃತ್ತಿಪರರು", labelTe: "ఫ్రీలాన్సర్ / సలహాదారు" },
  { id: "Corporate", labelEn: "Corporate / Organization", labelHi: "कॉरपोरेट / कंपनी", labelKn: "ಸಂಸ್ಥೆ ಅಥವಾ ಕಾರ್ಪೊರೇಟ್", labelTe: "కార్పొరేట్ / సంస్థ" }
];

// 3. Business categories
const BUSINESS_CATEGORIES = [
  { id: "Retail", labelEn: "Retail Shop / Kirana", labelHi: "किराना / खुदरा दुकान", labelKn: "ಕಿರಾಣಿ ಅಥವಾ ರೀಟೇಲ್ ಅಂಗಡಿ", labelTe: "కిరాణా / రిటైల్ షాప్" },
  { id: "Manufacturing", labelEn: "Manufacturing / Workshop", labelHi: "विनिर्माण / कारखाना", labelKn: "ಸಣ್ಣ ಕಾರ್ಖಾನೆ ಅಥವಾ ಉತ್ಪಾದನಾ ಘಟಕ", labelTe: "తయారీ / చిన్న ఫ్యాక్టరీ" },
  { id: "Services", labelEn: "Services / Consultancy", labelHi: "सेवा प्रदाता", labelKn: "ಸೇವಾ ವಲಯ ಅಥವಾ ಉದ್ಯೋಗ", labelTe: "సేవా రంగం / సలహా సేవలు" },
  { id: "Logistics", labelEn: "Logistics & Transport", labelHi: "परिवहन / लॉजिस्टिक्स", labelKn: "ಸಾರಿಗೆ ಮತ್ತು ಸಾಗಣೆ", labelTe: "రవాణా మరియు లాజిస్టిక్స్" },
  { id: "Agriculture", labelEn: "Agriculture / Allied Industry", labelHi: "कृषि और उद्योग", labelKn: "ಕೃಷಿ ಮತ್ತು ಪೂರಕ ಉದ್ಯಮಗಳು", labelTe: "వ్యవసాయం మరియు అనుబంధ పరిశ్రమలు" }, { id: "Textile", labelEn: "Textiles / Fashion", labelHi: "कपड़ा और हस्तशिल्प", labelKn: "ಜವಳಿ ಮತ್ತು ಬಟ್ಟೆ ವ್ಯಾಪಾರ", labelTe: "టెక్స్‌టైల్స్ / ఫ్యాషన్ వస్త్రాలు" },
  { id: "Other", labelEn: "Other Business", labelHi: "अन्य व्यवसाय", labelKn: "ಇತರ ವ್ಯಾಪಾರಗಳು", labelTe: "ఇతర వ్యాపారాలు" }
];

// Step information voices / text blocks to satisfy illiterate assistance voice synthesis
const VOICE_GUIDANCE: Record<number, { en: string; hi: string; kn: string; te: string }> = {
  1: {
    en: "Welcome to Namma NyayaMitra. In Step 1, select your native language so the app can talk to you and translate documents in the local dialect.",
    hi: "न्यायमित्र में आपका स्वागत है। चरण 1 में, अपनी भाषा चुनें ताकि यह ऐप आपसे आपकी मातृभाषा में सीधे बात कर सके।",
    kn: "ನ್ಯಾಯಮಿತ್ರಕ್ಕೆ ಸುಸ್ವಾಗತ. ಹಂತ 1 ರಲ್ಲಿ, ಅಪ್ಲಿಕೇಶನ್ ನಿಮ್ಮೊಂದಿಗೆ ಮಾತನಾಡಲು ಮತ್ತು ಸುಲಭವಾಗಿ ಭಾಷಾಂತರಿಸಲು ನಿಮ್ಮ ಮಾತೃಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
    te: "9ನ್ಯಾಯಮಿತ್ರಕು స్వాగతం. మొదటి దశలో మీ మాతృభాషను ఎంచుకోండి, తద్వారా ఈ యాప్ మీతో నేరుగా మాట్లాడగలదు."
  },
  2: {
    en: "Step 2. Please type your full name, and your shop or business name, using the boxes provided.",
    hi: "चरण 2. कृपया इन डिब्बों में अपना खुद का नाम और अपने दुकान या व्यवसाय का सही नाम लिख लें।",
    kn: "ಹಂತ 2. ದಯವಿಟ್ಟು ಒದಗಿಸಲಾದ ಬಾಕ್ಸ್‌ಗಳಲ್ಲಿ ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರು ಮತ್ತು ನಿಮ್ಮ ಅಂಗಡಿಯ ಹೆಸರನ್ನು ಬರೆಯಿರಿ.",
    te: "రెండవ దశ. దయచేసి ఇక్కడ ఇచ్చిన బాక్సులలో మీ పూర్తి పేరును మరియు మీ వ్యాపారం లేదా షాప్ పేరును టైప్ చేయండి."
  },
  3: {
    en: "Step 3. What kind of work do you do? Select your industry type by looking at the shop icons below.",
    hi: "चरण 3. आप किस प्रकार का व्यवसाय या काम करते हैं? नीचे दिए गए चित्रों को देखकर अपना क्षेत्र चुनें।",
    kn: "ಹಂತ 3. ನಿಮ್ಮ ಉದ್ಯಮದ ಪ್ರಕಾರ ಯಾವುದು? ಕೆಳಗಿನ ಚಿಹ್ನೆಗಳ ಸಹಾಯದಿಂದ ನಿಮ್ಮ ವ್ಯವಹಾರದ ವಲಯವನ್ನು ಆರಿಸಿ.",
    te: "మూడవ దశ. మీ వ్యాపారం ఏ రకానికి చెందినది? కింద ఉన్న షాప్ ఐకాన్లను చూసి దయచేసి ఎంచుకోండి."
  },
  4: {
    en: "Step 4. Select what role you have and what your main goal is, like checking a contract or writing a new deal page.",
    hi: "चरण 4. अपनी भूमिका चुनें और चुनें कि क्या आप नया अनुबंध पत्र बनाना चाहते हैं या पुराना चेक करना चाहते हैं।",
    kn: "ಹಂತ 4. ಸಣ್ಣ ಒಪ್ಪಂದಗಳನ್ನು ಪರಿಶೀಲಿಸಲು ಅಥವಾ ಸ್ವಂತ ಹೊಸ ಕರಾರುಗಳನ್ನು ತಯಾರಿಸಲು ಇಲ್ಲಿ ನಿಮ್ಮ ಇಚ್ಛೆಯನ್ನು ತಿಳಿಸಿ.",
    te: "నాల్గవ దశ. మీ పాత్ర మరియు మీ ప్రధాన ఉద్దేశ్యం ఏమిటో ఎంచుకోండి."
  }
};

export default function Onboarding({ onComplete }: OnboardingProps) {
  const { user, updateProfile, logout } = useAuth();
  
  // Trilingual states
  const [step, setStep] = useState(1);
  const [nativeLanguage, setNativeLanguage] = useState("Kannada"); // Default to Kannada/Hindi
  
  // Core user info
  const [proprietorName, setProprietorName] = useState(user?.displayName || "");
  const [companyName, setCompanyName] = useState("");
  const [businessCategory, setBusinessCategory] = useState("Retail");
  const [stakeholderType, setStakeholderType] = useState("Proprietor");
  const [stakeholderIntent, setStakeholderIntent] = useState("all");
  
  // Smart Onboarding Personalized indicators
  const [locationState, setLocationState] = useState("Karnataka");
  const [msmeCategory, setMsmeCategory] = useState("Micro");
  const [startupStage, setStartupStage] = useState("Idea");
  const [contractPreference, setContractPreference] = useState("Simple");
  
  // Security PIN state for step 5
  const [lockerPin, setLockerPin] = useState("");
  const [confirmLockerPin, setConfirmLockerPin] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [onboardingError, setOnboardingError] = useState("");
  const [voiceNotification, setVoiceNotification] = useState<string | null>(null);
  const [speechTranscript, setSpeechTranscript] = useState<string | null>(null);

  const handleSpeechGuidance = (stepNum: number, langId: string) => {
    if (!("speechSynthesis" in window)) {
      setVoiceNotification("Your browser does not support voice playback / ಧ್ವನಿ ಸಹಾಯಕ ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಲಭ್ಯವಿಲ್ಲ.");
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const textMap = VOICE_GUIDANCE[stepNum];
      if (!textMap) return;

      let langCode = "kn-IN";
      let text = textMap.kn;

      if (langId === "Hindi") {
        langCode = "hi-IN";
        text = textMap.hi;
      } else if (langId === "Telugu") {
        langCode = "te-IN";
        text = textMap.te;
      } else if (langId === "English") {
        langCode = "en-US";
        text = textMap.en;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langCode;
      utterance.rate = 0.9; // readable slower pace

      // Try selecting matching native voices
      if (typeof window !== "undefined" && window.speechSynthesis) {
        const voices = window.speechSynthesis.getVoices();
        const maybeVoice = voices.find(v => 
          v.lang.toLowerCase() === langCode.toLowerCase() || 
          v.lang.toLowerCase().startsWith(langCode.split("-")[0].toLowerCase()) ||
          v.name.toLowerCase().includes(langId.toLowerCase() === "kannada" ? "kannada" : langId.toLowerCase() === "hindi" ? "hindi" : "english")
        );
        if (maybeVoice) {
          utterance.voice = maybeVoice;
        }
      }
      
      utterance.onstart = () => {
        setAudioPlaying(true);
        setVoiceNotification(null);
        setSpeechTranscript(text);
      };
      utterance.onend = () => {
        setAudioPlaying(false);
        setSpeechTranscript(null);
      };
      utterance.onerror = (e) => {
        console.error("Speech Synthesis error:", e);
        setAudioPlaying(false);
        setSpeechTranscript(null);
        if (e.error === "language-unavailable" || e.error === "voice-unavailable") {
          setVoiceNotification(
            langId === "Kannada" 
              ? "ಕನ್ನಡ ಧ್ವನಿ ಪ್ಯಾಕ್ ನಿಮ್ಮ ಸಾಧನದಲ್ಲಿ ಲಭ್ಯವಿಲ್ಲ. ದಯವಿಟ್ಟು ಸಾಧನದ ಸೆಟ್ಟಿಂಗ್ಸ್‌ನಲ್ಲಿ Kannada voice ಆನ್ ಮಾಡಿ ಅಥವಾ ಕೆಳಗಿನ ವಿಶ್ವಾಸಾರ್ಹ ಸಂದೇಶವನ್ನೇ ನೇರವಾಗಿ ಓದಿ."
              : "Voice data is temporarily unavailable for this language. Please read the instructions below."
          );
        } else if (e.error !== "interrupted") {
          setVoiceNotification("Speech playback paused or cancelled by system.");
        }
      };

      // Wrap in a tiny delay to bypass Chrome speech synthesis engine cancellation race conditions
      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 100);
    } catch (err) {
      console.error("Speech Synthesis error:", err);
    }
  };

  const handleNextStep = () => {
    setOnboardingError("");
    if (step === 2) {
      if (!proprietorName.trim()) {
        setOnboardingError("Please enter your name/ಮಾಲೀಕರ ಹೆಸರನ್ನು ನಮೂದಿಸಿ/नाम दर्ज करें");
        return;
      }
      if (!companyName.trim()) {
        setOnboardingError("Please enter business name/ಉದ್ಯಮದ ಹೆಸರನ್ನು ನಮೂದಿಸಿ/व्यवसाय का नाम दर्ज करें");
        return;
      }
    }

    setStep(prev => Math.min(prev + 1, 4));
  };

  const handlePrevStep = () => {
    setOnboardingError("");
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOnboardingError("");

    setIsSubmitting(true);
    try {
      // 1. Submit integrated data profile to Firebase Firestore (PIN security setup is removed)
      await updateProfile({
        displayName: proprietorName,
        firmName: companyName,
        stakeholderType,
        businessCategory,
        nativeLanguage,
        stakeholderIntent,
        prefLanguage: nativeLanguage === "Kannada" ? "both" : nativeLanguage === "Hindi" ? "both" : "en",
        locationState,
        msmeCategory,
        startupStage,
        contractPreference,
        onboarded: true
      });

      // 3. Close & proceed
      onComplete();
    } catch (err) {
      console.error("Onboarding activation failed:", err);
      setOnboardingError("Failed to store encrypted security variables. Please retry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-light-bg flex flex-col justify-between py-8 px-4 relative overflow-hidden text-left text-xs text-text">
      
      {/* Decorative background visual cues */}
      <div className="absolute top-10 left-10 w-48 h-48 bg-gold/5 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-56 h-56 bg-teal/5 rounded-full blur-3xl" />

      {/* HEADER SECTION - High Contrast Logo displaying English, Kannada & Hindi */}
      <header className="max-w-md mx-auto w-full text-center mb-6 relative z-10">
        <div className="inline-flex p-3 bg-surface border-2 border-gold/40 rounded-full shadow-[0_0_15px_rgba(212,160,23,0.12)] mb-2.5">
          <ShieldCheck className="h-9 w-9 text-gold" />
        </div>
        <h1 className="font-serif font-black text-2xl text-navy leading-none tracking-tight">
          Namma NyayaMitra • न्यायमित्र • ನ್ಯಾಯಮಿತ್ರ
        </h1>
        <p className="text-[10px] text-gold uppercase tracking-widest font-bold mt-1.5 flex items-center justify-center gap-1.5">
          <span>Your Multi-lingual Legal Shield</span>
          <span className="text-muted">•</span>
          <span>ನಿಮ್ಮ ಉಚಿತ ರಕ್ಷಾ ಕವಚ</span>
        </p>
      </header>

      {/* MAIN CARDS CONTAINER */}
      <main className="max-w-xl mx-auto w-full bg-surface border-2 border-gold/20 rounded-3xl shadow-xl p-6 relative z-10">
        
        {/* Step-by-Step interactive progress timeline */}
        <div className="flex items-center justify-between mb-6 border-b border-border/10 pb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-gold animate-bounce" />
            <div>
              <p className="font-bold text-navy text-xs uppercase tracking-wider">
                Shield Activation • ಸೃಷ್ಟಿ ಹಂತ
              </p>
              <p className="text-[9px] text-muted italic font-medium leading-none">
                Step {step} of 4 • ಹಂತ {step} (ನಾಲ್ಕರಲ್ಲಿ)
              </p>
            </div>
          </div>

          <div className="flex gap-1">
            {[1, 2, 3, 4].map((s) => {
              const active = step >= s;
              const matches = step === s;
              return (
                <div 
                  key={s} 
                  className={`w-4 h-1.5 rounded-full transition-all ${
                    matches ? "w-8 bg-gold" : active ? "bg-navy" : "bg-border/20"
                  }`} 
                />
              );
            })}
          </div>
        </div>

        {/* VOICE ASSISTANT CUE FOR LOW-LITERACY / ILLITERATE USER SUPPORT */}
        <div className="bg-gold/10 border-2 border-gold/30 rounded-2xl p-3.5 mb-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-full ${audioPlaying ? "bg-gold text-navy animate-ping" : "bg-navy text-gold"}`}>
                <Volume2 className="h-4.5 w-4.5" />
              </div>
              <div className="space-y-0.5">
                <span className="font-black text-navy block text-[10.5px]">🎤 Read Steps Out Loud / ಧ್ವನಿ ಸಹಾಯಕ</span>
                <span className="text-[9px] text-muted leading-tight font-semibold block italic">
                  ಕ್ಲಿಕ್ ಮಾಡಿ, ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ಉಚಿತ ಧ್ವನಿ ಮಾರ್ಗದರ್ಶನ ಕೇಳಿ!
                </span>
              </div>
            </div>

            <div className="flex gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => handleSpeechGuidance(step, "Kannada")}
                className="px-2 py-1 bg-navy hover:bg-gold hover:text-navy text-white font-extrabold rounded-lg text-[9px] uppercase cursor-pointer"
              >
                ಕನ್ನಡ
              </button>
              <button
                type="button"
                onClick={() => handleSpeechGuidance(step, "Hindi")}
                className="px-2 py-1 bg-navy hover:bg-gold hover:text-navy text-white font-extrabold rounded-lg text-[9px] uppercase cursor-pointer"
              >
                हिंदी
              </button>
              <button
                type="button"
                onClick={() => handleSpeechGuidance(step, "English")}
                className="px-2 py-1 bg-navy hover:bg-gold hover:text-navy text-white font-extrabold rounded-lg text-[9px] uppercase cursor-pointer"
              >
                Eng
              </button>
            </div>
          </div>

          {voiceNotification && (
            <div className="text-[9.5px] font-bold text-rose-600 bg-rose-500/10 px-3 py-1.5 rounded-xl border border-rose-500/20 text-center animate-fade-in">
              ⚠️ {voiceNotification}
            </div>
          )}

          {speechTranscript && (
            <div className="p-3 bg-navy text-gold rounded-xl text-[10px] leading-relaxed font-semibold italic border border-gold/25 select-text animate-fade-in">
              💬 <span className="text-white font-medium not-italic">{speechTranscript}</span>
            </div>
          )}
        </div>

        {/* Onboarding Wizard step elements */}
        <div className="space-y-4">
          
          {/* STEP 1: Spoken language configurations */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="text-center sm:text-left">
                <h3 className="text-sm font-black text-navy uppercase tracking-wider flex items-center gap-1">
                  <span>Step 1: Spoken Language</span>
                  <span className="text-gold">•</span>
                  <span>ಭಾಷೆಯ ಆಯ್ಕೆ</span>
                </h3>
                <p className="text-[10px] text-muted font-bold block pt-0.5">
                  Select your language so all translations match. / ನಿಮಗೆ ತಿಳಿಯುವ ಉಚಿತ ಸರಳ ಭಾಷೆ ಆಯ್ಕೆ ಮಾಡಿ:
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 pt-2">
                {NATIVE_LANGUAGES.map((lang) => {
                  const active = nativeLanguage === lang.id;
                  return (
                    <button
                      key={lang.id}
                      type="button"
                      onClick={() => setNativeLanguage(lang.id)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between text-left ${
                        active 
                          ? "bg-gold/10 border-gold shadow-md text-navy font-bold" 
                          : "bg-surface-2 border-border/10 text-text hover:border-gold/30 hover:bg-surface"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">🗣️</span>
                        <div>
                          <p className="font-extrabold text-[12px] uppercase leading-none">{lang.nameNative}</p>
                          <p className="text-[10px] text-muted italic mt-0.5 font-normal leading-none">{lang.nameEn}</p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${active ? "border-gold bg-gold text-navy font-black" : "border-muted"}`}>
                        {active && "✓"}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Name and Shop registration details details */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h3 className="text-sm font-black text-navy uppercase tracking-wider">
                  🛒 Step 2: Proprietor Details / ನಿಮ್ಮ ವಿವರಗಳು
                </h3>
                <p className="text-[9.5px] text-muted font-bold font-medium block">
                  Write down your name and firm title. / ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರು ಮತ್ತು ಅಂಗಡಿಯ ಹೆಸರನ್ನು ಬರೆಯಿರಿ:
                </p>
              </div>

              <div className="space-y-3.5 pt-2 text-left">
                <div className="space-y-1.5">
                  <label className="font-extrabold text-navy text-[11px] block uppercase">
                    👨🏼‍💼 Owner Name / ನಿಮ್ಮ ಹೆಸರು / मालिक का नाम
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 h-4 w-4 text-muted" />
                    <input
                      type="text"
                      value={proprietorName}
                      onChange={(e) => setProprietorName(e.target.value)}
                      placeholder="e.g. Laxmi Gowda • लक्ष्मी गौड़ा"
                      className="w-full bg-surface-2 border border-border/30 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-gold font-bold text-navy focus:ring-1 focus:ring-gold"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-extrabold text-navy text-[11px] block uppercase">
                    🏪 Shop / Firm Title / ಅಂಗಡಿಯ ಹೆಸರು / व्यवसाय नाम
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-3.5 h-4 w-4 text-muted" />
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Laxmi Kirana & General Store"
                      className="w-full bg-surface-2 border border-border/30 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-gold font-bold text-navy focus:ring-1 focus:ring-gold"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Industry selection */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h3 className="text-sm font-black text-navy uppercase tracking-wider">
                  🌾 Step 3: Business Sector / ವ್ಯವಹಾರದ ಪ್ರಕಾರ
                </h3>
                <p className="text-[9.5px] text-muted font-bold block">
                  Select your trade domain. / ನಿಮ್ಮ ವ್ಯಾಪಾರ ಅಥವಾ ಅಂಗಡಿಯ ಪ್ರಕಾರವನ್ನು ಆರಿಸಿ:
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-2 gap-3 pt-2">
                {BUSINESS_CATEGORIES.map((cat) => {
                  const active = businessCategory === cat.id;
                  let visualIcon = "🛒";
                  if (cat.id === "Manufacturing") visualIcon = "🏭";
                  if (cat.id === "Services") visualIcon = "🛠️";
                  if (cat.id === "Logistics") visualIcon = "🚛";
                  if (cat.id === "Agriculture") visualIcon = "🌾";
                  if (cat.id === "Textile") visualIcon = "✂️";
                  if (cat.id === "Other") visualIcon = "📁";

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setBusinessCategory(cat.id)}
                      className={`p-3 rounded-2xl border-2 cursor-pointer transition-all text-left flex flex-col justify-between h-24 ${
                        active 
                          ? "bg-gold/10 border-gold text-navy font-bold shadow-md" 
                          : "bg-surface-2 border-border/10 text-text hover:border-gold/30 hover:bg-surface"
                      }`}
                    >
                      <span className="text-xl leading-none">{visualIcon}</span>
                      <div className="space-y-0.5 leading-tight">
                        <span className="font-extrabold text-[10px] block truncate">{cat.labelEn}</span>
                        <span className="text-[9px] text-muted block truncate italic font-medium">
                          {nativeLanguage === "Kannada" ? cat.labelKn : nativeLanguage === "Hindi" ? cat.labelHi : cat.labelKn}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: Stakeholder role & purpose intentions */}
          {step === 4 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h3 className="text-sm font-black text-navy uppercase tracking-wider">
                  🤝 Step 4: Your Role & Setup / ಪಾತ್ರ ಮತ್ತು ಉದ್ದೇಶ
                </h3>
                <p className="text-[9.5px] text-muted font-bold block">
                  What is your role on daily activities? / ನಿಮ್ಮ ಪ್ರತಿನಿತ್ಯದ ಪಾತ್ರ ಮತ್ತು ಉದ್ದೇಶ ತಿಳಿಸಿ:
                </p>
              </div>

              {/* Roles radio controls */}
              <div className="space-y-2.5">
                <span className="font-extrabold uppercase text-[10px] text-muted block">Select Your Role:</span>
                <div className="grid grid-cols-1 gap-2">
                  {STAKEHOLDER_ROLES.map((role) => {
                    const active = stakeholderType === role.id;
                    return (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => setStakeholderType(role.id)}
                        className={`p-3.5 rounded-xl border-2 text-left cursor-pointer transition-all flex items-center justify-between ${
                          active 
                            ? "bg-navy text-gold border-gold font-bold" 
                            : "bg-surface border-border/10 text-text hover:bg-surface-2"
                        }`}
                      >
                        <div className="space-y-0.5 leading-none">
                          <p className="text-xs font-bold">{role.labelEn}</p>
                          <p className={`text-[9.5px] italic font-normal ${active ? "text-gold/80" : "text-muted"}`}>
                            {nativeLanguage === "Kannada" ? role.labelKn : nativeLanguage === "Hindi" ? role.labelHi : role.labelKn}
                          </p>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 ${active ? "border-gold bg-gold text-navy" : "border-muted"}`} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Intended goal choices */}
              <div className="space-y-2.5 pt-1.5">
                <span className="font-extrabold uppercase text-[10px] text-muted block">Your Main Goal / ಇಚ್ಛೆ:</span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "risks", en: "Audit Risks", kn: "ರಿಸ್ಕ್ ತಪಾಸಣೆ", hi: "रिस्क की जांच" },
                    { id: "drafting", en: "New Drafts", kn: "ಕರಾರು ಸೃಜನೆ", hi: "अनुबंध निर्माण" },
                    { id: "all", en: "Full Guide", kn: "ಸಂಪೂರ್ಣ ರಕ್ಷಣೆ", hi: "संपूर्ण सुरक्षा" }
                  ].map((gl) => {
                    const active = stakeholderIntent === gl.id;
                    return (
                      <button
                        key={gl.id}
                        type="button"
                        onClick={() => setStakeholderIntent(gl.id)}
                        className={`p-3 rounded-xl border cursor-pointer text-center text-[10px] uppercase font-bold transition-all ${
                          active 
                            ? "bg-navy text-gold border-gold" 
                            : "bg-surface-2 border-border/10 text-muted"
                        }`}
                      >
                        <p className="leading-none">{gl.en}</p>
                        <p className="text-[8px] font-normal leading-none italic mt-1 text-muted">
                          {nativeLanguage === "Kannada" ? gl.kn : nativeLanguage === "Hindi" ? gl.hi : gl.kn}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Smart Personalized MSME Inputs Grid Area */}
              <div className="border-t border-border/10 pt-4 mt-4 grid grid-cols-2 gap-3.5">
                {/* 1. Location selection */}
                <div className="space-y-1">
                  <label className="font-extrabold text-navy text-[10px] uppercase block text-left">
                    📍 Business Location / ಸ್ಥಳ
                  </label>
                  <select
                    value={locationState}
                    onChange={(e) => setLocationState(e.target.value)}
                    className="w-full bg-surface-2 border border-border/30 rounded-xl p-2.5 text-xs text-navy font-bold focus:outline-none focus:border-gold cursor-pointer"
                  >
                    <option value="Karnataka">Karnataka / ಕರ್ನಾಟಕ</option>
                    <option value="Maharashtra">Maharashtra / महाराष्ट्र</option>
                    <option value="Delhi">Delhi / दिल्ली</option>
                    <option value="Telangana">Telangana / తెలంగాణ</option>
                    <option value="Tamil Nadu">Tamil Nadu / தமிழ்நாடு</option>
                    <option value="Andhra Pradesh">Andhra Pradesh / ఆంధ్రప్రదేశ్</option>
                    <option value="West Bengal">West Bengal / পশ্চিমবঙ্গ</option>
                    <option value="Gujarat">Gujarat / ગુજરાત</option>
                  </select>
                </div>

                {/* 2. MSME Class selection */}
                <div className="space-y-1">
                  <label className="font-extrabold text-navy text-[10px] uppercase block text-left">
                    🏭 MSME Category / ನಿಯಮ
                  </label>
                  <select
                    value={msmeCategory}
                    onChange={(e) => setMsmeCategory(e.target.value)}
                    className="w-full bg-surface-2 border border-border/30 rounded-xl p-2.5 text-xs text-navy font-bold focus:outline-none focus:border-gold cursor-pointer"
                  >
                    <option value="Micro">Micro (&lt; ₹5Cr Invest)</option>
                    <option value="Small">Small (&lt; ₹10Cr Invest)</option>
                    <option value="Medium">Medium (&lt; ₹50Cr Invest)</option>
                  </select>
                </div>

                {/* 3. Startup Stage selection */}
                <div className="space-y-1">
                  <label className="font-extrabold text-navy text-[10px] uppercase block text-left">
                    🚀 Startup Stage / ಹಂತ
                  </label>
                  <select
                    value={startupStage}
                    onChange={(e) => setStartupStage(e.target.value)}
                    className="w-full bg-surface-2 border border-border/30 rounded-xl p-2.5 text-xs text-navy font-bold focus:outline-none focus:border-gold cursor-pointer"
                  >
                    <option value="Idea">Idea Phase / ಯೋಜನೆ</option>
                    <option value="MVP">MVP/Prototype / ಸಿದ್ಧತೆ</option>
                    <option value="Seed">Seed Funded / ಹಣಕಾಸು</option>
                    <option value="Scale">Scaling Up / ಅಭಿವೃದ್ಧಿ</option>
                  </select>
                </div>

                {/* 4. Contract preference selection */}
                <div className="space-y-1">
                  <label className="font-extrabold text-navy text-[10px] uppercase block text-left">
                    🛡️ Terms Preference / ಆದ್ಯತೆ
                  </label>
                  <select
                    value={contractPreference}
                    onChange={(e) => setContractPreference(e.target.value)}
                    className="w-full bg-surface-2 border border-border/30 rounded-xl p-2.5 text-xs text-navy font-bold focus:outline-none focus:border-gold cursor-pointer"
                  >
                    <option value="Simple">Simple / Friendly (ಸರಳಗೊಳಿಸು)</option>
                    <option value="Strict">Strict / Protective (ಸಂಪೂರ್ಣ ರಕ್ಷಣೆ)</option>
                  </select>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* ERROR BOX */}
        {onboardingError && (
          <div className="p-3.5 mt-5 bg-rose-500/15 border-2 border-rose-500/25 text-rose-600 font-bold rounded-2xl text-[10px] flex items-start gap-2 max-w-md animate-pulse">
            <AlertOctagon className="h-4.5 w-4.5 shrink-0 mt-0.5" />
            <div className="text-left font-black">
              {onboardingError}
            </div>
          </div>
        )}

        {/* WIZARD ACTIONS BAR - Large visual high contrast buttons */}
        <div className="flex gap-4 pt-6 mt-6 border-t border-dashed border-border/10 justify-between items-center">
          
          {step > 1 ? (
            <button
              type="button"
              onClick={handlePrevStep}
              className="px-5 py-3.5 bg-surface text-text border-2 border-border hover:border-gold/50 rounded-2xl font-bold uppercase text-[10.5px] tracking-wide cursor-pointer transition-colors"
            >
              Back / ಬ್ಯಾಕ್
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="px-8 py-3.5 bg-gold hover:bg-gold-light text-navy font-black rounded-2xl text-[11px] uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95"
            >
              <span>Next Step / ಮುಂದೆ ಹೋಗಿ</span>
              <ArrowRight className="h-4.5 w-4.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinalSubmit}
              disabled={isSubmitting}
              className="px-8 py-3.5 bg-gold hover:bg-gold-light text-navy font-black rounded-2xl text-[11px] uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95 disabled:bg-surface-2 disabled:text-muted"
            >
              {isSubmitting ? "Activating Security Shield..." : "⚡ Activate Shield / ಸಕ್ರಿಯಗೊಳಿಸಿ"}
            </button>
          )}

        </div>

      </main>

      {/* FOOTER DISCLAIMERS */}
      <footer className="max-w-md mx-auto w-full text-center mt-6 relative z-10 space-y-4">
        <button
          onClick={logout}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl text-[9px] uppercase font-bold transition-all cursor-pointer"
        >
          <LogOut className="h-3 w-3" /> Logout / ಬೇರೆ ಖಾತೆ
        </button>
        <p className="text-[9px] text-muted italic font-medium leading-normal block">
          Designed specifically for micro-shops, kiranas, and cottage business owners. Safe & Secure.
        </p>
      </footer>

    </div>
  );
}
