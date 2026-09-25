import React, { useEffect, useState } from "react";
import { 
  Scale, 
  FileSearch, 
  FileCode, 
  ShieldAlert, 
  ArrowRight, 
  Store, 
  Factory, 
  Truck, 
  UserCheck, 
  Briefcase, 
  Scissors, 
  Lock, 
  Sparkles,
  Volume2,
  X,
  Mail,
  User
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getAnalysisHistory, getContractsDraftHistory } from "../services/firebase";
import { translate } from "../utils/translations";

interface HomeProps {
  setActivePage: (page: string) => void;
  viewMode: "both" | "en" | "hi";
  setDocTypePreSelect?: (type: string) => void;
}

export default function Home({ setActivePage, viewMode, setDocTypePreSelect }: HomeProps) {
  const { user, userProfile, login, loginWithEmail, registerWithEmail, nativeLanguage } = useAuth();
  const [particles, setParticles] = useState<Array<{ id: number; left: number; delay: number; duration: number }>>([]);
  const [analysesCount, setAnalysesCount] = useState<number | null>(null);
  const [contractsCount, setContractsCount] = useState<number | null>(null);
  const [isPlayingWelcome, setIsPlayingWelcome] = useState<string | null>(null);
  const [voiceNotification, setVoiceNotification] = useState<string | null>(null);
  const [speechTranscript, setSpeechTranscript] = useState<string | null>(null);

  // Email/Password auth modal states
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [emailInput, setEmailInput] = useState<string>("");
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [fullNameInput, setFullNameInput] = useState<string>("");
  const [authError, setAuthError] = useState<string>("");
  const [authLoading, setAuthLoading] = useState<boolean>(false);

  useEffect(() => {
    if (user && userProfile?.onboarded) {
      const fetchData = async () => {
        try {
          const listA = await getAnalysisHistory();
          const listC = await getContractsDraftHistory();
          setAnalysesCount(listA.length);
          setContractsCount(listC.length);
        } catch (err) {
          console.error("Home: Failed loading secure stats:", err);
        }
      };
      fetchData();
    } else {
      setAnalysesCount(null);
      setContractsCount(null);
    }
  }, [user, userProfile]);

  useEffect(() => {
    // Generate random positions and animations for gold particle background
    const arr = Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      left: Math.random() * 95, // Percentage
      delay: Math.random() * 8, // Seconds
      duration: 10 + Math.random() * 12, // Seconds
    }));
    setParticles(arr);
  }, []);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    if (!emailInput.trim()) {
      setAuthError("Email is required / ಇಮೇಲ್ ಅಗತ್ಯವಿದೆ / ईमेल आवश्यक है");
      return;
    }
    if (!passwordInput) {
      setAuthError("Password is required / ಪಾಸ್ವರ್ಡ್ ಅಗತ್ಯವಿದೆ / पासवर्ड आवश्यक है");
      return;
    }
    if (authMode === "signup" && !fullNameInput.trim()) {
      setAuthError("Full Name is required / ಪೂರ್ಣ ಹೆಸರು ಅಗತ್ಯವಿದೆ / नाम आवश्यक है");
      return;
    }
    if (passwordInput.length < 6) {
      setAuthError("Password must be at least 6 characters / ಪಾಸ್ವರ್ಡ್ ಕನಿಷ್ಠ 6 ಅಕ್ಷರಗಳು ಇರಬೇಕು / पासवर्ड कम से कम 6 अक्षरों का होना चाहिए");
      return;
    }

    setAuthLoading(true);
    try {
      if (authMode === "signup") {
        await registerWithEmail(emailInput.trim(), passwordInput, fullNameInput.trim());
      } else {
        await loginWithEmail(emailInput.trim(), passwordInput);
      }
      setShowAuthModal(false);
      // Reset state
      setEmailInput("");
      setPasswordInput("");
      setFullNameInput("");
    } catch (err: any) {
      console.error("Auth form submission error:", err);
      let friendlyError = err.message || "Authentication process failed. Please check credentials and try again.";
      if (friendlyError.includes("auth/email-already-in-use")) {
        friendlyError = "This email is already in use. Please sign in instead / ಈ ಇಮೇಲ್ ಈಗಾಗಲೇ ಬಳಕೆದಾರರಲ್ಲಿದೆ";
      } else if (friendlyError.includes("auth/weak-password")) {
        friendlyError = "Weak password. Must be at least 6 characters / ಪಾಸ್ವರ್ಡ್ ಅತಿ ದುರ್ಬಲವಾಗಿದೆ";
      } else if (friendlyError.includes("auth/user-not-found") || friendlyError.includes("auth/wrong-password") || friendlyError.includes("auth/invalid-credential")) {
        friendlyError = "Incorrect email or password / ಇಮೇಲ್ ಅಥವಾ ಪಾಸ್‌ವರ್ಡ್ ತಪ್ಪಾಗಿದೆ / गलत ईमेल या पासवर्ड";
      } else if (friendlyError.includes("auth/invalid-email")) {
        friendlyError = "Please enter a valid email address / ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ ಇಮೇಲ್ ನಮೂದಿಸಿ";
      }
      setAuthError(friendlyError);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setAuthError("");
    setAuthLoading(true);
    try {
      await login();
      setShowAuthModal(false);
    } catch (err: any) {
      console.error("Google login failed under modal wrapper:", err);
      if (err.message && !err.message.includes("auth/popup-closed-by-user")) {
        setAuthError(err.message);
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const speakLanderText = (lang: "en" | "hi" | "kn") => {
    if (!("speechSynthesis" in window)) {
      setVoiceNotification("Your browser does not support voice playback / ಧ್ವನಿ ಸಹಾಯಕ ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಲಭ್ಯವಿಲ್ಲ.");
      return;
    }
    try {
      window.speechSynthesis.cancel();
      
      let text = "";
      let langCode = "";
      if (lang === "en") {
        text = "Welcome to Namma NyayaMitra. This is a free legal aid tool built to protect small shopkeepers, kiranas, and business owners from unfair or complex contract agreements. You can upload any contract draft to scan for hidden risks, view direct explanations in Kannada, Hindi and English, or generate customized ready-to-use agreements immediately.";
        langCode = "en-US";
      } else if (lang === "hi") {
        text = "न्यायमित्र में आपका स्वागत है। यह एक निःशुल्क कानूनी सहायता मंच है जो हमारे देश के छोटे देशवासियों, दुकानदारों, किराना मालिकों और छोटे उद्यमियों को जटिल समझौतों के नुकसान से बचाता है। यहाँ आप किसी भी अनुबंध पत्र की फ़ोटो खींचकर उसमें छिपे हुए धोखे या जोखिम को तुरंत और अपनी भाषा में मुफ़्त जान सकते हैं।";
        langCode = "hi-IN";
      } else if (lang === "kn") {
        text = "ನ್ಯಾಯಮಿತ್ರಕ್ಕೆ ಸುಸ್ವಾಗತ. ಇದು ನಮ್ಮ ದೇಶದ ಸಣ್ಣ ಅಂಗಡಿಕಾರರು, ಕಿರಾಣಿ ಮಾಲೀಕರು ಮತ್ತು ಸಣ್ಣ ಉದ್ಯಮಿಗಳನ್ನು ವಂಚನೆಯ ಅಥವಾ ಜಟಿಲ ಕರಾರು ಒಪ್ಪಂದಗಳಿಂದ ರಕ್ಷಿಸಲು ಇರುವ ಅತ್ಯಂತ ಸುಲಭವಾದ ಕನ್ನಡ ಉಚಿತ ಕಾನೂನು ವೇದಿಕೆ. ಯಾವುದೇ ಒಪ್ಪಂದ ಪತ್ರದ ಫೋಟೋ ಹಾಕಿ ಅದರಲ್ಲಿರಬಹುದಾದ ತೊಂದರೆಗಳನ್ನು ನೀವು ನಿಮ್ಮ ಸ್ವಂತ ಭಾಷೆಯಲ್ಲಿ ಉಚಿತವಾಗಿ ತಿಳಿಯಬಹುದು.";
        langCode = "kn-IN";
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langCode;
      utterance.rate = 0.82;

      // Robust matching of voices including ka-IN, kn-IN for Kannada compatibility
      const voices = window.speechSynthesis.getVoices();
      const maybeVoice = voices.find(v => {
        const name = v.name.toLowerCase();
        const vlang = v.lang.toLowerCase();
        if (lang === "kn") {
          return name.includes("kannada") || name.includes("karnataka") || vlang === "kn-in" || vlang === "ka-in" || vlang.startsWith("kn") || vlang.startsWith("ka");
        } else if (lang === "hi") {
          return name.includes("hindi") || vlang === "hi-in" || vlang.startsWith("hi");
        } else {
          return name.includes("english") || vlang.startsWith("en");
        }
      });

      if (maybeVoice) {
        utterance.voice = maybeVoice;
      }

      utterance.onstart = () => {
        setIsPlayingWelcome(lang);
        setVoiceNotification(null);
        setSpeechTranscript(text);
      };
      utterance.onend = () => {
        setIsPlayingWelcome(null);
        setSpeechTranscript(null);
      };
      utterance.onerror = (e) => {
        console.error("Lander speech synthetic error:", e);
        setIsPlayingWelcome(null);
        setSpeechTranscript(null);

        // Native Auto-Retry Fallback Option
        if (maybeVoice) {
          console.warn("Speech synthesis failed with custom voice. Retrying immediately with browser native TTS engine...");
          const retryUtterance = new SpeechSynthesisUtterance(text);
          retryUtterance.lang = langCode;
          retryUtterance.rate = 0.82;
          retryUtterance.onstart = () => {
            setIsPlayingWelcome(lang);
            setVoiceNotification(null);
            setSpeechTranscript(text);
          };
          retryUtterance.onend = () => {
            setIsPlayingWelcome(null);
            setSpeechTranscript(null);
          };
          window.speechSynthesis.speak(retryUtterance);
        } else if (e.error !== "interrupted") {
          setVoiceNotification(
            lang === "kn" 
              ? "ಕನ್ನಡ ಧ್ವನಿ ಪ್ಯಾಕ್ ನಿಮ್ಮ ಸಾಧನದಲ್ಲಿ ಲಭ್ಯವಿಲ್ಲ. ದಯವಿಟ್ಟು ಸಾಧನದ ಸೆಟ್ಟಿಂಗ್ಸ್‌ನಲ್ಲಿ Kannada voice ಆನ್ ಮಾಡಿ ಅಥವಾ ಕೆಳಗಿನ ಸಂದೇಶವನ್ನೇ ನೇರವಾಗಿ ಓದಿ."
              : "Voice data is temporarily unavailable. Please read the subtitle card below directly."
          );
        }
      };

      // Wrap in a 100ms timeout to avoid Chrome cancel/speak collision race condition bug
      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 100);

    } catch (err) {
      console.error("Lander speech synthetic engine error:", err);
    }
  };

  const features = [
    {
      id: "analyzer",
      icon: <FileSearch className="h-8 w-8 text-gold" />,
      titleEn: "Document Analyzer",
      titleHi: "दस्तावेज़ विश्लेषक",
      descEn: "Upload any PDF or photo of a contract. AI scans for hidden risks, unfair clauses, and important deadlines — explained in plain language.",
      descHi: "कोई भी PDF या अनुबंध की फ़ोटो अपलोड करें। AI छिपे जोखिम, अनुचित क्लॉज़ और महत्वपूर्ण समय-सीमाएं ढूंढेगा — सरल भाषा में।",
      btnTextEn: "Start Analyzing",
      btnTextHi: "विश्लेषण शुरू करें",
      btnColor: "bg-gold hover:bg-gold-light text-navy",
    },
    {
      id: "generator",
      icon: <FileCode className="h-8 w-8 text-teal" />,
      titleEn: "Template Generator",
      titleHi: "टेम्पलेट जनरेटर",
      descEn: "Generate a ready-to-use vendor agreement, NDA, or rental contract in minutes. Just fill out a simple form — no lawyer needed.",
      descHi: "कुछ ही मिनटों में विक्रेता अनुबंध (vendor agreement), NDA, या दुकान किराया अनुबंध (shop lease) बनाएं। बस एक आसान फॉर्म भरें।",
      btnTextEn: "Generate Document",
      btnTextHi: "दस्तावेज़ बनाएं",
      btnColor: "bg-teal hover:bg-opacity-90 text-navy",
    },
  ];

  // If user is validated and onboarded, serve client workspace dashboard
  if (user && userProfile?.onboarded) {
    return (
      <div className="relative overflow-hidden min-h-screen">
        
        {/* Floating Gold Particles background animation */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-navy/5">
          {particles.map((p) => (
            <div
              key={p.id}
              className="gold-particle"
              style={{
                left: `${p.left}%`,
                animation: `goldFloat ${p.duration}s linear infinite`,
                animationDelay: `${p.delay}s`,
                bottom: "-20px",
              }}
            />
          ))}
        </div>

        <section className="relative z-10 max-w-6xl mx-auto px-4 py-12 md:py-16 space-y-10">
          
          {/* Onboarded Welcome Banner */}
          <div className="bg-surface border-2 border-gold/30 rounded-3xl p-6 md:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden text-left">
            <div className="absolute top-0 right-0 p-6 opacity-5 text-gold font-bold text-9xl select-none font-serif">
              ⚖️
            </div>
            <div className="space-y-3 relative z-10 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold/10 text-gold rounded-full text-[10px] font-bold uppercase tracking-widest border border-gold/20">
                <Sparkles className="h-3.5 w-3.5" /> Workspace Active • ಕಾರ್ಯಕ್ಷೇತ್ರ ಸಕ್ರಿಯ
              </div>
              <h2 className="text-3xl md:text-4xl font-serif font-black text-text">
                Welcome back, {userProfile?.displayName || user.displayName || "Owner"}!
              </h2>
              {userProfile?.firmName && (
                <p className="text-md font-semibold text-gold leading-none">
                  Proprietor of <span className="underline decoration-gold-light/40">{userProfile.firmName}</span>
                </p>
              )}
              <p className="text-xs text-muted max-w-xl leading-relaxed italic pt-1">
                Your company profile is active and integrated. All contract drafting forms and risk analysis metrics will sync instantly to your secure profile.
              </p>
            </div>
            
            <button
              onClick={() => setActivePage("locker")}
              className="px-6 py-3.5 bg-navy border border-gold/40 hover:bg-gold hover:text-navy text-gold font-extrabold rounded-xl text-xs uppercase tracking-wider cursor-pointer shadow-md transition-all shrink-0 flex items-center gap-2"
            >
              <Lock className="h-4 w-4" /> Go to Secure Vault / ತಿಜೋರಿ ತೆರೆಯಿರಿ
            </button>
          </div>

          {/* Quick Access Tools */}
          <div className="space-y-4 text-left">
            <div className="border-b border-border/10 pb-2">
              <h3 className="text-lg font-serif font-bold text-text flex items-center gap-2">
                <Scale className="h-5 w-5 text-gold" /> Launch Active Tools / ಸಾಧನ ಕೋಶ
              </h3>
              <p className="text-xs text-muted">Select an action below to begin scanning or drafting</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {features.map((feat) => (
                <div
                  key={feat.id}
                  onClick={() => {
                    if (setDocTypePreSelect) setDocTypePreSelect("");
                    setActivePage(feat.id);
                  }}
                  className="bg-surface border border-border/20 rounded-2xl p-6 hover:border-gold hover:shadow-[0_0_20px_rgba(212,160,23,0.15)] hover:-translate-y-1 transition-all group flex flex-col justify-between cursor-pointer text-left"
                >
                  <div className="space-y-4">
                    <div className="p-3.5 bg-surface-2 border border-border/10 rounded-2xl w-fit group-hover:border-gold/50 transition-all">
                      {feat.icon}
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-bold text-text mb-0.5 group-hover:text-gold transition-all">
                        {feat.titleEn}
                      </h4>
                      <p className="text-[10px] text-gold font-bold italic mb-3">
                        {feat.id === "analyzer" ? "📄 ಕರಾರು ಪತ್ರಗಳ ವಿಶ್ಲೇಷಕ" : "✍🏼 ಹೊಸ ಒಪ್ಪಂದ ಪತ್ರ ತಯಾರಕ"}
                      </p>
                      
                      <p className="text-xs text-text/80 leading-relaxed">{feat.descEn}</p>
                      <p className="text-[11px] text-muted leading-relaxed italic">{feat.descHi}</p>
                    </div>
                  </div>

                  <button className={`w-full mt-6 py-3 px-4 rounded-xl text-center font-bold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${feat.btnColor}`}>
                    {viewMode === "hi" ? feat.btnTextHi : feat.btnTextEn} <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Secure Cloud Vault Summary Status Dashboard */}
          <div className="bg-surface border border-border/10 rounded-2xl p-6 shadow-sm text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/10 pb-4 mb-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-text flex items-center gap-2">
                  <Lock className="h-4 w-4 text-gold" />
                  Your Encrypted Storage Status / ಸುರಕ್ಷಿತ ತಿಜೋರಿ ದಾಖಲೆಗಳು
                </h4>
                <p className="text-[11px] text-muted italic">Secure local and cloud synchronization verified</p>
              </div>
              <button
                onClick={() => setActivePage("locker")}
                className="text-xs font-bold text-gold hover:text-gold-light uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer"
              >
                Manage Storage &rarr;
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-surface-2 border border-border/10 rounded-xl p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[11px] text-muted tracking-wide uppercase font-bold">Encrypted Risk Audits</p>
                  <p className="text-xs text-text italic">ಸಹಜ ರಿಸ್ಕ್ ವಿಶ್ಲೇಷಣೆಗಳು</p>
                </div>
                <div className="text-lg font-black text-gold">
                  {analysesCount !== null ? `${analysesCount} Reports` : "..."}
                </div>
              </div>
              
              <div className="bg-surface-2 border border-border/10 rounded-xl p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[11px] text-muted tracking-wide uppercase font-bold">Saved Agreement Papers</p>
                  <p className="text-xs text-text italic">ಸಿದ್ಧ ಒಪ್ಪಂದ ಒಪ್ಪಂದ ಪತ್ರಗಳು</p>
                </div>
                <div className="text-lg font-black text-teal">
                  {contractsCount !== null ? `${contractsCount} Drafts` : "..."}
                </div>
              </div>
            </div>
          </div>

        </section>
      </div>
    );
  }

  // Else return guest/lander - fully trilingual accessible space
  return (
    <div className="relative overflow-hidden min-h-screen text-xs text-text text-left select-none">
      
      {/* Floating Gold Particles background animation */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {particles.map((p) => (
          <div
            key={p.id}
            className="gold-particle"
            style={{
              left: `${p.left}%`,
              animation: `goldFloat ${p.duration}s linear infinite`,
              animationDelay: `${p.delay}s`,
              bottom: "-20px",
            }}
          />
        ))}
      </div>

      {/* --- HERO SECTION --- */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-[85vh] px-4 pt-10 pb-16 text-center max-w-5xl mx-auto">
        
        {/* Large stylized Scale icon with custom gold halo glow */}
        <div className="mb-5 p-4 bg-surface border-2 border-gold/40 rounded-full shadow-[0_0_30px_rgba(212,160,23,0.25)] animate-pulse">
          <Scale className="h-14 w-14 text-gold" style={{ filter: "drop-shadow(0 0 8px #D4A017)" }} />
        </div>

        {/* Modern Title Header */}
        <div className="space-y-1 mb-4 select-text">
          <h1 className="font-serif font-black text-5xl sm:text-7xl text-gold tracking-tight">
            Namma NyayaMitra
          </h1>
          <h2 className="text-md sm:text-lg text-stone-500 tracking-widest uppercase font-black">
            {translate("welcomeTitle", nativeLanguage)}
          </h2>
        </div>

        {/* Dynamic Taglines in custom single language focus */}
        <div className="space-y-2 mb-6 max-w-xl mx-auto">
          <p className="text-xl sm:text-3xl font-black text-navy leading-tight">
            {nativeLanguage === "Kannada" ? "ಸಣ್ಣ ಅಂಗಡಿ ಮತ್ತು ಸಣ್ಣ ವ್ಯಾಪಾರಗಳಿಗೆ ಉಚಿತ ಕಾನೂನು ರಕ್ಷಣೆ"
             : nativeLanguage === "Hindi" ? "छोटे व्यवसायों और दुकानों के लिए मुफ़्त कानूनी सुरक्षा"
             : nativeLanguage === "Telugu" ? "చిన్న దుకాణాలు మరియు MSME ల కొరకు ఉచిత న్యాయ రక్షణ"
             : "Free Legal Protection for Small Shops & MSMEs"}
          </p>
          <div className="flex flex-col gap-1 text-sm text-gold/90 font-bold italic justify-center items-center">
            <span>{translate("welcomeSub", nativeLanguage)}</span>
          </div>
        </div>

        {/* INTERACTIVE VOICE GUIDE FOR NON-READERS / ILLITERATE USER CONVENIENCE */}
        <div className="w-full max-w-xl bg-gold/10 border-2 border-gold/30 rounded-3xl p-5 mb-8 space-y-3 shadow-md">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="space-y-0.5">
              <span className="font-black text-navy text-[11px] block uppercase flex items-center gap-1.5 justify-center sm:justify-start">
                <Volume2 className="h-4 w-4" /> Read Out Loud / ಧ್ವನಿ ಸಹಾಯಕ
              </span>
              <span className="text-[10px] text-muted font-bold block leading-relaxed italic">
                Hear what this app does in your preferred native spoken language!
              </span>
            </div>
            <div className="flex gap-1.5 justify-center shrink-0">
              <button
                onClick={() => speakLanderText("kn")}
                className={`px-3 py-1.5 rounded-xl font-bold uppercase text-[10px] cursor-pointer transition-all ${
                  isPlayingWelcome === "kn" ? "bg-gold text-navy animate-pulse font-black" : "bg-navy text-white hover:bg-gold hover:text-navy"
                }`}
              >
                {isPlayingWelcome === "kn" ? "🔊 ಪ್ಲೇ ಆಗುತ್ತಿದೆ..." : "🔊 ಕನ್ನಡ"}
              </button>
              <button
                onClick={() => speakLanderText("hi")}
                className={`px-3 py-1.5 rounded-xl font-bold uppercase text-[10px] cursor-pointer transition-all ${
                  isPlayingWelcome === "hi" ? "bg-gold text-navy animate-pulse font-black" : "bg-navy text-white hover:bg-gold hover:text-navy"
                }`}
              >
                {isPlayingWelcome === "hi" ? "🔊 चल रहा है..." : "🔊 हिंदी"}
              </button>
              <button
                onClick={() => speakLanderText("en")}
                className={`px-3 py-1.5 rounded-xl font-bold uppercase text-[10px] cursor-pointer transition-all ${
                  isPlayingWelcome === "en" ? "bg-gold text-navy animate-pulse font-black" : "bg-navy text-white hover:bg-gold hover:text-navy"
                }`}
              >
                {isPlayingWelcome === "en" ? "🔊 Playing..." : "🔊 English"}
              </button>
            </div>
          </div>

          {/* Audio Synthesizer Notifications & Accessible Multilingual Subtitles */}
          {voiceNotification && (
            <div className="mt-2 text-[10px] font-bold text-rose-600 bg-rose-500/10 px-3 py-2 rounded-xl border border-rose-500/20 text-center sm:text-left animate-fade-in">
              ⚠️ {voiceNotification}
            </div>
          )}

          {speechTranscript && (
            <div className="mt-3 p-3 bg-navy text-gold rounded-xl text-[10.5px] leading-relaxed font-semibold italic text-left border border-gold/25 select-text animate-fade-in">
              💬 <span className="text-white font-medium not-italic">{speechTranscript}</span>
            </div>
          )}
        </div>

        {/* Quick core descriptions in simple 3-line format */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center max-w-4xl mx-auto mb-8 font-semibold w-full">
          <div className="p-3 bg-surface border border-border/10 rounded-2xl">
            <p className="text-gold font-bold text-md">
              {nativeLanguage === "Kannada" ? "1. ಒಪ್ಪಂದ ಹಾಕಿ"
               : nativeLanguage === "Hindi" ? "1. अनुबंध अपलोड करें"
               : nativeLanguage === "Telugu" ? "1. డాక్యుమెంట్ అప్‌లోడ్"
               : "1. Upload Contract"}
            </p>
            <p className="text-[11px] text-text/80 mt-0.5">
              {nativeLanguage === "Kannada" ? "ಯಾವುದೇ ಪಿಡಿಎಫ್ ಅಥವಾ ಒಪ್ಪಂದದ ಫೋಟೋ ಹಾಕಿ"
               : nativeLanguage === "Hindi" ? "कोई भी पीडीएफ या अनुबंध की फोटो लें"
               : nativeLanguage === "Telugu" ? "ఏదైనా పత్రం లేదా ఫోటో అప్‌లోడ్ చేయండి"
               : "Drag and drop any PDF file or snap a draft image"}
            </p>
          </div>
          <div className="p-3 bg-surface border border-border/10 rounded-2xl">
            <p className="text-gold font-bold text-md">
              {nativeLanguage === "Kannada" ? "2. ಮೋಸ ಪತ್ತೆ ಮಾಡಿ"
               : nativeLanguage === "Hindi" ? "2. जोखिमों को स्कैन करें"
               : nativeLanguage === "Telugu" ? "2. రిస్క్ మరియు మోస పరీక్ష"
               : "2. Scan Pitfalls"}
            </p>
            <p className="text-[11px] text-text/80 mt-0.5">
              {nativeLanguage === "Kannada" ? "ಹಿಡನ್ ಷರತ್ತುಗಳು ಮತ್ತು ಅಪಾಯಗಳನ್ನು ತಕ್ಷಣ ಪತ್ತೆ ಮಾಡಿ"
               : nativeLanguage === "Hindi" ? "छिपे धोखे और कठिन शर्ते तुरंत जानें"
               : nativeLanguage === "Telugu" ? "వ్యాపార ఒప్పందాలలోని కఠిన నిబంధనలను పరీక్షించండి"
               : "Find hidden traps and complex obligations instantly"}
            </p>
          </div>
          <div className="p-3 bg-surface border border-border/10 rounded-2xl">
            <p className="text-gold font-bold text-md">
              {nativeLanguage === "Kannada" ? "3. ಹೊಸ ಕರಾರು ಸೃಜಿಸಿ"
               : nativeLanguage === "Hindi" ? "3. नया कानूनी दस्तावेज़ बनाएं"
               : nativeLanguage === "Telugu" ? "3. కొత్త సురక్షిత కరారు పత్రం"
               : "3. Safe Agreements"}
            </p>
            <p className="text-[11px] text-text/80 mt-0.5">
              {nativeLanguage === "Kannada" ? "ನಿಮ್ಮ ಮಾತೃಭಾಷೆಯಲ್ಲಿ ಉಚಿತವಾಗಿ ಒಪ್ಪಂದ ಪತ್ರ ಸೃಷ್ಟಿಸಿ"
               : nativeLanguage === "Hindi" ? "अपनी भाषा में खुद कानूनी दस्तवेज बनाएं"
               : nativeLanguage === "Telugu" ? "మీ సొంత మాతృభాషలో సులభంగా పత్రాలు సృష్టించండి"
               : "Generate customized protective drafts in local language"}
            </p>
          </div>
        </div>

        {/* Action Button Triggers */}
        <div className="flex flex-col sm:flex-row gap-3.5 justify-center w-full max-w-md relative z-10">
          <button
            onClick={() => {
              setShowAuthModal(true);
              setAuthMode("signup");
              setAuthError("");
            }}
            className="px-6 py-4 bg-gold hover:bg-gold-light text-navy font-bold rounded-xl shadow-lg shadow-gold/25 hover:shadow-gold-light/40 hover:scale-105 transition-all text-xs uppercase tracking-wide cursor-pointer flex items-center justify-center gap-2 font-black"
          >
            🚀 Open Free Account / ಖಾತೆ ತೆರೆಯಿರಿ <ArrowRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setShowAuthModal(true);
              setAuthMode("login");
              setAuthError("");
            }}
            className="px-6 py-4 bg-surface hover:bg-surface-2 text-text border-2 border-gold/30 hover:border-gold font-bold rounded-xl hover:scale-105 transition-all text-xs uppercase tracking-wide cursor-pointer flex items-center justify-center gap-2"
          >
            🔐 Sign In / ಸೈನ್ ಇನ್ ಮಾಡಿ <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Animated Chevron indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center opacity-70">
          <span className="text-[8.5px] text-stone-500 tracking-widest uppercase">Scroll For Details • ಕೆಳಗೆ ನೋಡಿ</span>
          <svg className="w-4 h-4 text-gold animate-bounce mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>

      </section>

      {/* --- THE PROBLEM SECTION - EXPLAINED WITH SYMBOLS AND TRILINGUAL Subtitles --- */}
      <section className="relative z-10 px-4 py-16 bg-surface/40 border-y border-border/15">
        <div className="max-w-4xl mx-auto">
          
          <div className="text-center mb-10">
            <h3 className="text-2xl font-serif font-black text-navy">
              {nativeLanguage === "Kannada" ? "ಸಣ್ಣ ಉದ್ಯಮದಾರರಿಗೆ ಕಾನೂನು ರಕ್ಷಣೆ ಏಕೆ ಬೇಕು?"
               : nativeLanguage === "Hindi" ? "छोटे व्यवसायों को कानूनी सुरक्षा क्यों चाहिए?"
               : nativeLanguage === "Telugu" ? "చిన్న వ్యాపారాలకు న్యాయ రక్షణ ఎందుకు అవసరం?"
               : "Why Small Businesses Need Legal Shield"}
            </h3>
            <p className="text-xs text-gold mt-1 font-extrabold uppercase tracking-wider font-mono">
              {nativeLanguage === "Kannada" ? "ಖಾಸಗಿ ವಲಯದ ಶೋಷಣೆಯಿಂದ ಪಾರಾಗಿ"
               : nativeLanguage === "Hindi" ? "वंचना पूर्ण क्लॉज़ का समाधान"
               : nativeLanguage === "Telugu" ? "కఠినమైన నియమాల విముక్తి"
               : "Evade unfair private practices"}
            </p>
          </div>

          <div className="space-y-5">
            {[
              {
                icon: "💸",
                en: "Lawyers charge high fees (₹3,000 - ₹15,000) for basic document checks",
                kn: "ಕೇವಲ ಒಪ್ಪಂದ ಪರಿಶೀಲನೆಗೆ ವಕೀಲರು ₹3,000 ರಿಂದ ₹15,000 ರವರೆಗೆ ದುಬಾರಿ ಶುಲ್ಕ ಪಡೆಯುತ್ತಾರೆ.",
                hi: "एक छोटा सा अनुबंध जांचने के लिए वकील भारी फीस (₹3,000 से ₹15,000) वसूलते हैं।",
                te: "సాధారణ డాక్యుమెంట్ల పరిశీలనల కొరకు కూడా లాయర్లు ₹3,000 - ₹15,000 ల వరకు భారీ ఫీజులు వసూలు చేస్తారు."
              },
              {
                icon: "⚠️",
                en: "Big vendors slip in hidden clauses that trap small distributors & store owners",
                kn: "ದೊಡ್ಡ ಕಂಪನಿಗಳು ಸಣ್ಣ ವಿತರಕರನ್ನು ಹಾಗೂ ಅಂಗಡಿಕಾರರನ್ನು ಸಿಲುಕಿಸಲು ಒಪ್ಪಂದಗಳಲ್ಲಿ ಕಠಿಣ ಷರತ್ತುಗಳನ್ನು ಬರೆಯುತ್ತವೆ.",
                hi: "बड़े सप्लायर कठिन शर्तें लिख देते हैं जिससे साधारण दुकानदार बुरी तरह फंस जाते हैं।",
                te: "పెద్ద సప్లయర్లు చిన్న వ్యాపారాల ఒప్పందాలలో వంచనాత్మక క్లాజులను చేర్చి మోసం చేస్తారు."
              },
              {
                icon: "🌐",
                en: "Most legal forms are in complex English terms that normal proprietors cannot read",
                kn: "ಬಹುತೇಕ ಎಲ್ಲಾ ಕಾನೂನು ಪತ್ರಗಳು ಕಠಿಣವಾದ ಇಂಗ್ಲಿಷ್ ಭಾಷೆಯಲ್ಲಿದ್ದು, ಸಾಮಾನ್ಯ ಮಾಲೀಕರಿಗೆ ಅರ್ಥವಾಗುವುದಿಲ್ಲ.",
                hi: "अधिकतर अनुबंध अत्यंत कठिन कानूनी अंग्रेजी और शब्दावली में लिखे होते हैं जिन्हें पढ़ना मुश्किल है।",
                te: "చాలా ఒప్పంద పత్రాలు క్లిష్టమైన ఇంగ్లీష్ భాషా పదాలలో ఉండి సామాన్య యజమానులకు అర్థం కాకుండా ఉంటాయి."
              }
            ].map((prob, i) => (
              <div key={i} className="flex gap-4 p-5 bg-surface border border-stone-200 rounded-2xl shadow-sm text-left">
                <span className="text-2xl pt-0.5 select-none shrink-0">{prob.icon}</span>
                <div className="space-y-1">
                  <p className="text-[13px] font-black text-navy">
                    {nativeLanguage === "Kannada" ? prob.kn
                     : nativeLanguage === "Hindi" ? prob.hi
                     : nativeLanguage === "Telugu" ? prob.te
                     : prob.en}
                  </p>
                  {nativeLanguage !== "English" && (
                    <p className="text-[10px] text-muted italic font-medium leading-none opacity-60">
                      English: {prob.en}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* --- FEATURE CARDS SECTION --- */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h3 className="text-2xl font-serif font-black text-navy">
            Our Automated Protectors • ನಮ್ಮ ಮುಖ್ಯ ಸೇವೆಗಳು
          </h3>
          <p className="text-xs text-gold mt-1 font-extrabold uppercase tracking-wider">
            क्या-क्या सुरक्षा मिलेगी आपको?
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {features.map((feat) => (
            <div
              key={feat.id}
              onClick={() => {
                setShowAuthModal(true);
                setAuthMode("login");
                setAuthError("");
              }}
              className="bg-surface border border-gold/15 rounded-3xl p-6 hover:shadow-[0_0_20px_rgba(212,160,23,0.15)] transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="p-3 bg-surface-2 border border-border/10 rounded-2xl w-fit">
                  {feat.icon}
                </div>
                
                <div>
                  <h4 className="text-base font-black text-navy leading-none">
                    {feat.titleEn}
                  </h4>
                  <div className="flex flex-col gap-0.5 text-[10.5px] text-gold font-bold mt-1 mb-3 italic">
                    <span>{feat.id === "analyzer" ? "📄 ಕರಾರು ಪತ್ರಗಳ ವಿಶ್ಲೇಷಕ" : "✍🏼 ಹೊಸ ಒಪ್ಪಂದ ಪತ್ರ ತಯಾರಕ"}</span>
                    <span>{feat.titleHi}</span>
                  </div>
                  
                  <p className="text-[11px] text-text/80 leading-relaxed mb-1">{feat.descEn}</p>
                  <p className="text-[11.5px] text-stone-500 italic leading-relaxed font-normal">{feat.descHi}</p>
                </div>
              </div>

              <button className="w-full mt-5 py-3.5 bg-gold hover:bg-gold-light text-navy font-bold rounded-xl text-xs uppercase tracking-wide cursor-pointer flex items-center justify-center gap-1.5 font-black shrink-0">
                <span>Unlock Free / ಉಚಿತ ಸೇವೆ ಅನ್ಲಾಕ್ ಮಾಡಿ</span> <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* --- WHO IS THIS FOR SECTION WITH EMOJI CARDS FOR EASY SELECTION --- */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 py-12 pb-20">
        <div className="text-center mb-10">
          <h3 className="text-2xl font-serif font-black text-navy">
            Empowering Every Micro-Entrepreneur
          </h3>
          <p className="text-xs text-gold mt-1 font-extrabold uppercase tracking-wider">
            ವ್ಯಾಪಾರಿಗಳ ಹಿತರಕ್ಷಣೆಗಾಗಿ • सभी छोटे उद्योगों के लिए
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-3xl mx-auto">
          {[
            { icon: "🏪", en: "Kirana & Retailers", kn: "ಕಿರಾಣಿ ಅಂಗಡಿಗಳು", hi: "किराना दुकान" },
            { icon: "🏭", en: "Small Factories", kn: "ಉತ್ಪಾದಕರು", hi: "सिलाई व लघु उद्योग" },
            { icon: "🚛", en: "Transport Contractor", kn: "ಸಾರಿಗೆ ವೆಂಡರ್ಗಳು", hi: "ट्रांसपोर्ट ड्राइवर" },
            { icon: "🛠️", en: "Services & Workers", kn: "ಕುಶಲಕರ್ಮಿಗಳು / ಸೇವೆಗಳು", hi: "कारीगर व दैनिक सेवा" }
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-surface border border-stone-200 p-5 rounded-2xl flex flex-col items-center text-center hover:bg-surface-2 hover:border-gold/30 transition-all cursor-pointer"
              onClick={() => {
                setShowAuthModal(true);
                setAuthMode("login");
                setAuthError("");
              }}
            >
              <span className="text-3xl mb-2.5 select-none">{item.icon}</span>
              <span className="text-xs font-black text-navy leading-tight mb-0.5">{item.en}</span>
              <span className="text-[11px] text-teal font-extrabold leading-none block">{item.kn}</span>
              <span className="text-[10.5px] text-stone-500 leading-tight font-medium italic mt-0.5">{item.hi}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Dynamic Overlay Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-navy/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in text-left">
          <div className="relative max-w-md w-full bg-surface border-2 border-gold/40 rounded-3xl p-6 shadow-2xl space-y-5 my-8">
            
            {/* Close button */}
            <button
              onClick={() => {
                setShowAuthModal(false);
                setEmailInput("");
                setPasswordInput("");
                setFullNameInput("");
                setAuthError("");
              }}
              className="absolute top-4 right-4 p-2 bg-surface-2 hover:bg-gold/15 hover:text-gold rounded-full text-stone-400 transition-colors cursor-pointer border border-border/10"
              title="Close Dialog"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            {/* Modal Header */}
            <div className="text-center space-y-1 mt-2">
              <div className="inline-flex p-3 bg-gold/10 border border-gold/30 rounded-2xl mb-1 text-gold">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-serif font-black text-navy leading-none">
                {authMode === "login" ? "Sign In to Your Shield" : "Create Free Shield Account"}
              </h3>
              <p className="text-[10px] text-stone-500 uppercase font-black tracking-wider">
                {authMode === "login" 
                  ? "ನ್ಯಾಯಮಿತ್ರ ಪ್ರವೇಶಿಸಿ • न्यायमित्र प्रवेश" 
                  : "ಉಚಿತ ಖಾತೆ ಸೃಜಿಸಿ • नया खाता बनाएं"}
              </p>
            </div>

            {/* Error Message banner */}
            {authError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 font-bold rounded-xl text-[10px] leading-relaxed text-center">
                ⚠️ {authError}
              </div>
            )}

            {/* Main credentials form */}
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              
              {/* Full Name input for Signup */}
              {authMode === "signup" && (
                <div className="space-y-1">
                  <label className="font-extrabold text-navy text-[10px] uppercase block">
                    👨🏼‍💼 Owner Name / ಪೂರ್ಣ ಹೆಸರು / नाम
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 h-4 w-4 text-stone-400" />
                    <input
                      type="text"
                      required
                      value={fullNameInput}
                      onChange={(e) => setFullNameInput(e.target.value)}
                      placeholder="e.g. Laxmi Gowda"
                      className="w-full bg-surface-2 border border-border/20 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-gold font-bold text-navy"
                    />
                  </div>
                </div>
              )}

              {/* Email Address */}
              <div className="space-y-1">
                <label className="font-extrabold text-navy text-[10px] uppercase block">
                  ✉️ Email Address / ಇಮೇಲ್ ವಿಳಾಸ / ईमेल
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-stone-400" />
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="e.g. owner@kirana.com"
                    className="w-full bg-surface-2 border border-border/20 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-gold font-bold text-navy"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="font-extrabold text-navy text-[10px] uppercase block">
                  🔑 Password / ಪಾಸ್‌ವರ್ಡ್ / पासवर्ड (Min 6 characters)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-stone-400" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-surface-2 border border-border/20 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-gold font-bold text-navy"
                  />
                </div>
              </div>

              {/* Submit Trigger Action Button */}
              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3 bg-gold hover:bg-gold-light text-navy font-black rounded-xl text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {authLoading ? (
                  <span className="flex items-center gap-1.5 animate-pulse">
                    <span>Processing...</span>
                  </span>
                ) : (
                  <span>
                    {authMode === "login" 
                      ? "⚡ Sign In / ಪ್ರವೇಶಿಸಿ" 
                      : "⚡ Register & Create Account"}
                  </span>
                )}
              </button>
            </form>

            {/* OR separator */}
            <div className="flex items-center my-3 relative select-none">
              <div className="flex-grow border-t border-border/15" />
              <span className="mx-3 text-[9px] text-muted uppercase font-bold tracking-widest bg-surface px-1">
                OR / ಅಥವಾ / या
              </span>
              <div className="flex-grow border-t border-border/15" />
            </div>

            {/* Google Authentication Trigger option inside modal */}
            <button
              onClick={handleGoogleAuth}
              disabled={authLoading}
              className="w-full py-3 bg-surface hover:bg-surface-2 text-text border-2 border-gold/30 hover:border-gold font-black rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm animate-none"
            >
              <svg className="h-4.5 w-4.5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google / ಗೂಗಲ್ ಮೂಲಕ ಪ್ರವೇಶಿಸಿ</span>
            </button>

            {/* Toggle login or signup mode */}
            <div className="text-center pt-2">
              {authMode === "login" ? (
                <p className="text-[10px] text-stone-500 font-bold">
                  New to Namma NyayaMitra?{" "}
                  <button
                    onClick={() => {
                      setAuthMode("signup");
                      setAuthError("");
                    }}
                    className="text-gold font-extrabold hover:underline cursor-pointer ml-1 uppercase"
                  >
                    Create Free Account &rarr;
                  </button>
                </p>
              ) : (
                <p className="text-[10px] text-stone-500 font-bold">
                  Already have an account?{" "}
                  <button
                    onClick={() => {
                      setAuthMode("login");
                      setAuthError("");
                    }}
                    className="text-gold font-extrabold hover:underline cursor-pointer ml-1 uppercase"
                  >
                    Sign In Here &rarr;
                  </button>
                </p>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
