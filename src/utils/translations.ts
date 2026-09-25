export type LanguageType = "English" | "Hindi" | "Kannada" | "Telugu";

export const TRANSLATIONS: Record<string, Record<LanguageType, string>> = {
  // Navigation
  navHome: {
    English: "Home",
    Hindi: "मुख्य पृष्ठ",
    Kannada: "ಮುಖಪುಟ",
    Telugu: "హోమ్"
  },
  navAnalyzer: {
    English: "Clause Review & Risk Audit",
    Hindi: "खंड समीक्षा और जोखिम ऑडिट",
    Kannada: "ಷರತ್ತು ಪರಿಶೀಲನೆ ಹಾಗು ರಿಸ್ಕ್ ಆಡಿಟ್",
    Telugu: "క్లాజ్ సమీక్ష & రిస్క్ ఆడిట్"
  },
  navGenerator: {
    English: "Template Generator",
    Hindi: "टेम्पलेट जनरेटर",
    Kannada: "ಒಪ್ಪಂದ ಪತ್ರ ಸೃಷ್ಟಿ",
    Telugu: "టెంప్లేట్ జనరేటర్"
  },
  navSchemes: {
    English: "Gov Schemes",
    Hindi: "सरकारी योजनाएं",
    Kannada: "ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು",
    Telugu: "ప్రభుత్వ పథకాలు"
  },
  navEmergency: {
    English: "🚨 Emergency Help",
    Hindi: "🚨 आपातकालीन सहायता",
    Kannada: "🚨 ತುರ್ತು ಸಹಾಯ",
    Telugu: "🚨 అత్యవసర సహాయం"
  },
  navLocker: {
    English: "Secure Vault",
    Hindi: "सुरक्षित तिजोरी",
    Kannada: "ಸುರಕ್ಷಿತ ತಿಜೋರಿ",
    Telugu: "సురక్షిత తిజోరి"
  },
  navConsult: {
    English: "Lawyer Consult",
    Hindi: "वकील परामर्श",
    Kannada: "ವಕೀಲರ ಸಮಾಲೋಚನೆ",
    Telugu: "న్యాయవాది సంప్రదింపు"
  },
  navRiskAudit: {
    English: "Risk Audit",
    Hindi: "जोखिम विश्लेषण",
    Kannada: "ರಿಸ್ಕ್ ವಿಶ್ಲೇಷಣೆ",
    Telugu: "రిస్క్ విశ్లేషణ"
  },
  navProfile: {
    English: "Company Profile",
    Hindi: "कंपनी प्रोफ़ाइल",
    Kannada: "ಕಂಪನಿ ಪ್ರೊಫೈಲ್",
    Telugu: "కంపెనీ ప్రొఫైల్"
  },
  navAbout: {
    English: "About Us",
    Hindi: "हमारे बारे में",
    Kannada: "ನಮ್ಮ ಬಗ್ಗೆ",
    Telugu: "మా గురించి"
  },
  navAwareness: {
    English: "Legal Rights Hub",
    Hindi: "अधिकार जागरूकता",
    Kannada: "ಹಕ್ಕುಗಳ ಜಾಗೃತಿ",
    Telugu: "హక్కుల అవగాహన"
  },
  navSignIn: {
    English: "Sign In",
    Hindi: "लॉग इन करें",
    Kannada: "ಲಾಗಿನ್ ಮಾಡಿ",
    Telugu: "లాగిన్ అవ్వండి"
  },
  navSignOut: {
    English: "Sign Out",
    Hindi: "लॉग आउट करें",
    Kannada: "ಲಾಗ್ ಔಟ್",
    Telugu: "లాగ్ అవుట్"
  },

  // Home Page Static Texts
  welcomeTitle: {
    English: "NyayaAI • Multi-lingual Legal Shield",
    Hindi: "न्यायमित्र • बहुभाषी कानूनी सुरक्षा कवच",
    Kannada: "ನ್ಯಾಯಮಿತ್ರ • ಬಹುಭಾಷಾ ಕಾನೂನು ರಕ್ಷಾ ಕವಚ",
    Telugu: "న్యాయమిత్ర • బహుభాషా న్యాయ రక్షణ కవచం"
  },
  welcomeSub: {
    English: "Empowering MSMEs, Kiranas & Freelancers with direct risk scanners and regional contract drafts.",
    Hindi: "छोटे व्यापारियों, किराना संघों एवं व्यवसायियों को धोखाधड़ी से बचाने वाला कानूनी मंच।",
    Kannada: "ಸಣ್ಣ ಉದ್ಯಮದಾರರು, ಕಿರಾಣಿ ಅಂಗಡಿಯವರು ಮತ್ತು ಸ್ವಯಂ ಉದ್ಯೋಗಿಗಳನ್ನು ವಂಚನೆಯಿಂದ ರಕ್ಷಿಸುವ ಉಚಿತ ವೇದಿಕೆ.",
    Telugu: "చిన్న వ్యాపారులు, కిరాణా షాపులు మరియు ఫ్రీలాన్సర్‌ల కోసం ప్రత్యేక రిస్క్ స్కాన్ మరియు కరారు పత్రాల వేదిక."
  },
  voiceGuidanceBtn: {
    English: "Voice Assistant Guide",
    Hindi: "ध्‍ವनि सहायक गाइड",
    Kannada: "ಧ್ವನಿ ಮಾರ್ಗದರ್ಶನ ಸಹಾಯ",
    Telugu: "వాయిస్ అసిస్టెంట్ గైడ్"
  },
  voiceGuidanceStart: {
    English: "Listening or reading options inside NyayaAI",
    Hindi: "सुनने या पढ़ने वाले विकल्प न्यायमित्र के अंदर चालू हैं",
    Kannada: "ನಿಮ್ಮ ಮಾತೃಭಾಷೆಯಲ್ಲಿ ಸಂಪೂರ್ಣ ಆಡಿಯೋ ಕೇಳಿ",
    Telugu: "మీ మాతృభాషలో పూర్తి ఆడియో వినండి"
  },
  welcomeDesc: {
    English: "NyayaAI is free legal aid platform protecting micro MSMEs and startups from complex contracts. Standard, transparent agreements are created with real-time translation and direct risk assessments in Karnataka and nearby sectors.",
    Hindi: "न्यायमित्र सूक्ष्म व्यवसायिक MSMEs और छोटे व्यापारियों को जटिल कानूनी शब्दों के नुकसान से बचाने का प्रयास है। सरल रूप से अनुवाद और पूर्ण सुरक्षा रिपोर्ट तुरंत पाएं।",
    Kannada: "ನ್ಯಾಯಮಿತ್ರವು ಸಣ್ಣ ವ್ಯವಹಾರಗಳು ಹಾಗೂ ಉದ್ಯಮಿಗಳನ್ನು ವಂಚನೆಯ ಜಟಿಲ ಕರಾರುಗಳಿಂದ ರಕ್ಷಿಸುವ ಉಚಿತ ತಾಣವಾಗಿದೆ. ಕನ್ನಡ ಹಾಗೂ ಪ್ರಾದೇಶಿಕ ಭಾಷೆಗಳಲ್ಲಿ ಸುಲಭ ವಿಶ್ಲೇಷಣೆ ಪಡೆಯಿರಿ.",
    Telugu: "న్యాయమిత్ర సూక్ష్మ MSME వర్గాలను మరియు స్టార్టప్‌లను కఠినమైన ఒప్పందాల నుండి రక్షించే ఉచిత వేదిక. మీ మాతృభాషలో సులభమైన నివేదిక పొందండి."
  },

  // Landing Page Metrics
  metricAnalyses: {
    English: "Documents Scanned",
    Hindi: "दस्तावेज़ों की जांच",
    Kannada: "ಒಟ್ಟು ಕರಾರು ತಪಾಸಣೆ",
    Telugu: "డాక్యుమెంట్ పరీక్షలు"
  },
  metricContracts: {
    English: "Contracts Created",
    Hindi: "तैयार अनुबंध ड्राफ्ट",
    Kannada: "ಒಟ್ಟು ಸೃಷ್ಟಿಸಿದ ಕರಾರುಗಳು",
    Telugu: "సృష్టించిన కరారు పత్రాలు"
  },
  metricAudited: {
    English: "Businesses Audited",
    Hindi: "सुरक्षित किए व्यापार",
    Kannada: "ರಕ್ಷಿಸಲ್ಪಟ್ಟ ಉದ್ಯಮಗಳು",
    Telugu: "రక్షించబడిన వ్యాపారాలు"
  },

  // Document Analyzer
  analyzerHeadline: {
    English: "Bilingual Contract Scanner & Risk Matrix",
    Hindi: "द्विभाषी अनुबंध स्कैनर और जोखिम विश्लेषण",
    Kannada: "ಒಪ್ಪಂದ ಪತ್ರ ತಪಾಸಣೆ ಮತ್ತು ರಿಸ್ಕ್ ವಿಶ್ಲೇಷಣೆ",
    Telugu: "ద్విభాషా కాంట్రాక్ట్ స్కానర్ & రిస్క్ విశ్లేషణ"
  },
  analyzerSubheadline: {
    English: "Upload a PDF or draft. NyayaAI highlights unfair terms and explains obligations in your chosen native language.",
    Hindi: "PDF या अनुबंध अपलोड करें। न्यायमित्र अनुचित शर्तों को चिन्हित कर सरल देशीय भाषा में समझाएगा।",
    Kannada: "ನಿಮ್ಮ ಯಾವುದೇ ಪಿಡಿಎಫ್ ಒಪ್ಪಂದವನ್ನು ಹಾಕಿ. ಮೋಸದ ಷರತ್ತುಗಳನ್ನು ಗುರುತಿಸಿ ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ಸರಳವಾಗಿ ವಿವರಿಸುತ್ತದೆ.",
    Telugu: "ఒప్పందం పత్రం లేదా PDF అప్‌లోడ్ చేయండి. న్యాయమిత్ర కఠినమైన నిబంధనలను సులభంగా వివరిస్తుంది."
  },
  uploadTitle: {
    English: "Drag & Drop your Legal Contract here",
    Hindi: "अपना कानूनी अनुबंध यहाँ ड्रैग और ड्रॉप करें",
    Kannada: "ನಿಮ್ಮ ಕಾನೂನು ಒಪ್ಪಂದದ ಫೈಲ್ ಇಲ್ಲಿ ಎಳೆದು ಹಾಕಿ",
    Telugu: "మీ లీగల్ ఒప్పందం ఫైల్‌ను ఇక్కడ అప్‌లోడ్ చేయండి"
  },
  uploadSub: {
    English: "Supports PDF, JPEG, or PNG up to 10MB",
    Hindi: "PDF, JPEG, या PNG फाइलों का समर्थन (अधिकतम 10MB)",
    Kannada: "ಪಿಡಿಎಫ್, ಜೆಪಿಜಿ ಫೈಲ್ ಬೆಂಬಲಿಸುತ್ತದೆ (ಗರಿಷ್ಠ 10MB ಭಾಷಾಂತರ)",
    Telugu: "PDF, JPEG, లేదా PNG సపోర్ట్ చేస్తుంది (గరిష్టంగా 10MB)"
  },
  chooseOrManual: {
    English: "or click to select file manually from device",
    Hindi: "या अपने डिवाइस से फ़ाइल सीधे चुनने के लिए दबाएं",
    Kannada: "ಅಥವಾ ನಿಮ್ಮ ಮೊಬೈಲ್‌ನಿಂದ ನೇರವಾಗಿ ಫೈಲ್ ಸೆಲೆಕ್ಟ್ ಮಾಡಿ",
    Telugu: "లేదా మీ డివైస్ నుండి నేరుగా ఫైల్‌ను ఎంచుకోండి"
  },
  manualTextInputLabel: {
    English: "Or Paste Draft Text Directly Below:",
    Hindi: "या नीचे समझौते का टेक्स्ट सीधे पेस्ट करें:",
    Kannada: "ಅಥವಾ ಒಪ್ಪಂದದ ಬರಹವನ್ನು ನೇರವಾಗಿ ಇಲ್ಲಿ ಪೇಸ್ಟ್ ಮಾಡಿ:",
    Telugu: "లేదా కాంట్రాక్ట్ టెక్స్ట్ నేరుగా ఇక్కడ పేస్ట్ చేయండి:"
  },
  analyzeBtnText: {
    English: "Scan Contract For Hidden Risks",
    Hindi: "छिपे हुए जोखिमों के लिए स्कैन करें",
    Kannada: "ಒಪ್ಪಂದದ ರಿಸ್ಕ್ ತಪಾಸಣೆ ಪ್ರಾರಂಭಿಸಿ",
    Telugu: "రిస్క్ నివేదిక కోసం స్కాన్ చేయండి"
  },
  analyzingInProgress: {
    English: "AI Legal Brain Analyzing... This takes 10-15 seconds",
    Hindi: "AI कानूनी मष्तिस्क जांच कर रहा है... इसमें 10-15 सेकंड लगेंगे",
    Kannada: "ಉಚಿತ ಎಐ ಕಾನೂನು ಮಸ್ತಿಷ್ಕ ವಿಶ್ಲೇಷಿಸುತ್ತಿದೆ... ದಯವಿಟ್ಟು 10 ಸೆಕೆಂಡ್ ಕಾಯಿರಿ",
    Telugu: "AI లీగల్ స్కానింగ్ ప్రారంభమైంది... దీనికి 10-15 సెకన్లు పడుతుంది"
  },

  // Document Generator
  generatorHeadline: {
    English: "Instant Regulatory & Vendor Draft Generator",
    Hindi: "तत्काल कानूनी और विक्रेता अनुबंध जनरेटर",
    Kannada: "ತ್ವರಿತ ಕರಾರು ಪತ್ರ ಹಾಗೂ ವೆಂಡರ್ ಒಪ್ಪಂದ ಸೃಷ್ಟಿ",
    Telugu: "వెండర్ మరియు రెగ్యులేటరీ కాంట్రాక్ట్ల సృష్టి"
  },
  generatorSubheadline: {
    English: "Create balanced agreements using legally safe frameworks validated for local laws.",
    Hindi: "स्थानीय कानूनों के अनुसार प्रमाणित पूर्णतया सुरक्षित व्यापारिक प्रारूप कुछ ही सेकंड में बनाएं।",
    Kannada: "ಪ್ರಾದೇಶಿಕ ನಿಯಮಗಳಿಗೆ ಹೊಂದುವ ಕಾನೂನುಬದ್ಧ ಕರಾರುಗಳನ್ನು ಕೆಲವೇ ನಿಮಿಷಗಳಲ್ಲಿ ಸೃಜಿಸಿ.",
    Telugu: "స్థానిక చట్టాల నిబంధనలతో సురక్షితమైన లీగల్ ఒప్పందాలను వెంటనే సృష్టించుకోండి."
  },

  // Govt Schemes Area
  schemesHeadline: {
    English: "MSME Government Benefits & Handholding Hub",
    Hindi: "सरकारी एमएसएमई योजनाएं और मार्गदर्शन हब",
    Kannada: "ಸಣ್ಣ ಕೈಗಾರಿಕಾ ಉಚಿತ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳ ಮಾಹಿತಿ ಕೇಂದ್ರ",
    Telugu: "MSME ప్రభుత్వ పథకాలు & సలహాల కేంద్రం"
  },
  schemesSubheadline: {
    English: "Explore active financial boosts, subsidies, and legal aids provided by central and state schemes.",
    Hindi: "भारत सरकार द्वारा प्रदत्त सभी वित्तीय सहायता, सब्सिडी एवं कानूनी लाभों की सरल सूची।",
    Kannada: "ಸಣ್ಣ ಉದ್ಯಮಗಳ ಆರ್ಥಿಕ ಉತ್ತೇಜನ ಹಾಗೂ ಉಚಿತ ಸಬ್ಸಿಡಿ ಯೋಜನೆಗಳ ವಿವರ ಇಲ್ಲಿದೆ.",
    Telugu: "కేంద్ర, రాష్ట్ర ప్రభుత్వాలు అందించే ఉచిత సబ్సిడీ మరియు ఆర్థిక పథకాల సమాచారం."
  },

  // Emergency Assistance Area
  emergencyHeadline: {
    English: "🚨 SOS Emergency Legal Triage center",
    Hindi: "🚨 संकटकालीन आपातकालीन कानूनी सहायता केंद्र",
    Kannada: "🚨 ತುರ್ತು ಕಾನೂನು ನೆರವು ಮತ್ತು ರಕ್ಷಣಾ ಸೂತ್ರಗಳು",
    Telugu: "🚨 అత్యవసర SOS లీగల్ రక్షణ కేంద్రం"
  },
  emergencySubheadline: {
    English: "Faced with sudden shop lockouts, local disputes, or payment blocks? Get legal advice and regional help instantly.",
    Hindi: "दुकान तालाबंदी, भुगतान रुकना या स्थानीय विवाद? तत्काल सुरक्षात्मक सलाह और फोन नंबर प्राप्त करें।",
    Kannada: "ದಂಡದ ಭಯವಿದೆಯೇ ಬಿಲ್ ಪಾವತಿ ನಿಂತಿದೆಯೇ? ಭಯಪಡಬೇಡಿ, ನಿಮ್ಮ ಉಚಿತ ಸುರಕ್ಷಾ ಸೂತ್ರಗಳನ್ನು ತಕ್ಷಣ ಪಡೆಯಿರಿ.",
    Telugu: "వ్యాపార చెల్లింపులు ఆగిపోయాయా లేక వివాదాలు ఉన్నాయా? వెంటనే అవసరమైన సలహాలు మరియు ఫోన్ నంబర్లు పొందండి."
  },

  // Secure Locker / Dashboard
  lockerHeadline: {
    English: "Your Secure Cryptographic Vault",
    Hindi: "आपकी सुरक्षित एन्क्रिप्टेड कानूनी तिजोरी",
    Kannada: "ನಿಮ್ಮ ಡಿಜಿಟಲ್ ಸಂರಕ್ಷಿತ ತಿಜೋರಿ ಹಾಗೂ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    Telugu: "మీ డిజిటల్ లీగల్ సెక్యూర్ తిజోరి"
  },
  lockerSubheadline: {
    English: "View your saved analyses and active contracts safely protected in your digital vault.",
    Hindi: "पासकोड के अंतर्गत सुरक्षित अपने समझौतों और जाँच रिपोर्टों की सूची यहाँ देखें।",
    Kannada: "ನಿಮ್ಮ ಡಿಜಿಟಲ್ ತಿಜೋರಿ ಅಡಿಯಲ್ಲಿ ಕಾಪಾಡಲಾದ ಒಪ್ಪಂದಗಳು ಹಾಗೂ ವಿಶ್ಲೇಷಣೆಗಳ ವರದಿ ಇಲ್ಲಿದೆ.",
    Telugu: "మీరు రికార్డ్ చేసిన డాక్యుమెంట్లు మరియు రిస్క్ నివేదికల సురక్షిత జాబితా ఇక్కడ ఉంది."
  },

  // About Page Translations
  aboutHeadline: {
    English: "About NyayaAI",
    Hindi: "न्यायमित्र के बारे में",
    Kannada: "ನ್ಯಾಯಮಿತ್ರದ ಬಗ್ಗೆ ಮಾಹಿತಿ",
    Telugu: "న్యాయమిత్ర గురించి సమాచారం"
  },
  aboutMission: {
    English: "Legal clarity should be accessible to all, not just privileged corporations. NyayaAI represents a humble tool to democratize business protection.",
    Hindi: "कानूनी स्पष्टता हर भारतीय नागरिक का अधिकार होनी चाहिए, न कि केवल अमीर कंपनियों का। न्यायमित्र इसी दिशा में समर्पित है।",
    Kannada: "ಕಾನೂನಿನ ತಿಳುವಳಿಕೆ ಕೇವಲ ಶ್ರೀಮಂತರ ಸೊತ್ತಾಗಬಾರದು. ಭಾರತದ ಪ್ರತಿಯೊಬ್ಬ ಸಣ್ಣ ಉದ್ಯಮಿಗೂ ಇದು ತಲುಪಲಿ ಎಂಬುದು ನ್ಯಾಯಮಿತ್ರದ ಆಶಯ.",
    Telugu: "న్యాయ పరిజ్ఞానం అనేది కేవలం పెద్ద స్టార్టప్‌లకు మాత్రమే కాదు, సామాన్య వ్యాపారుల అందరి హక్కు కావాలనేదే న్యాయమిత్ర ఆశయం."
  },

  // Interactive buttons and universal labels
  selectLanguageLabel: {
    English: "Select Language",
    Hindi: "भाषा चुनें",
    Kannada: "ಭಾಷೆ ಆಯ್ಕೆ ಮಾಡಿ",
    Telugu: "భాషను ఎంచుకోండి"
  },
  bookAppointmentBtn: {
    English: "Book Consultation",
    Hindi: "अपॉइंटमेंट बुक करें",
    Kannada: "ಸಮಾಲೋಚನೆ ನಿಗದಿಪಡಿಸಿ",
    Telugu: "సంప్రదింపును బుక్ చేయండి"
  },
  chatNowBtn: {
    English: "Chat Online",
    Hindi: "चैट शुरू करें",
    Kannada: "ಉಚಿತ ಚಾಟಿಂಗ್ ಮಾಡಿ",
    Telugu: "చాట్ ప్రారంభించండి"
  },
  deleteLabel: {
    English: "Delete",
    Hindi: "मिटाएं",
    Kannada: "ಅಳಿಸಿ ಹಾಕಿ",
    Telugu: "తొలగించు"
  },
  noSavedItems: {
    English: "No items recorded in your vault folder yet.",
    Hindi: "आपकी तिजोरी में अभी कोई फाइल सुरक्षित नहीं है।",
    Kannada: "ಲಾಕರ್‌ನಲ್ಲಿ ಯಾವುದೇ ಹೊಸ ವರದಿಗಳು ಸದ್ಯಕ್ಕೆ ಲಭ್ಯವಿಲ್ಲ.",
    Telugu: "మీ డిజిటల్ లాకర్‌లో ఎటువంటి ఫైళ్లు రికార్డు కాలేదు."
  },
  riskScoreLabel: {
    English: "Overall Risk Score",
    Hindi: "कुल जोखिम इंडेक्स",
    Kannada: "ಒಟ್ಟು ರಿಸ್ಕ್ ಅಂಕಗಳು",
    Telugu: "మొత్తం రిస్క్ స్కోరు"
  },
  verdictLabel: {
    English: "Lander Verdict",
    Hindi: "न्यायमित्र सुझाव",
    Kannada: "ಅಂತಿಮ ರಕ್ಷಣೆ ನಿರ್ಧಾರ",
    Telugu: "న్యాయ సలహా తీర్పు"
  }
};

export function translate(key: string, lang: LanguageType | string): string {
  const normLang = (lang === "kn" || lang === "Kannada") ? "Kannada" 
                 : (lang === "hi" || lang === "Hindi") ? "Hindi" 
                 : (lang === "te" || lang === "Telugu") ? "Telugu" 
                 : "English";
  
  const translationsForKey = TRANSLATIONS[key];
  if (!translationsForKey) return key;
  return translationsForKey[normLang] || translationsForKey["English"] || key;
}
