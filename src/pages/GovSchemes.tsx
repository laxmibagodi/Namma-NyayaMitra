import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  Award, 
  HelpCircle, 
  Search, 
  Sparkles, 
  ChevronRight, 
  Plus, 
  MapPin, 
  DollarSign, 
  ShieldCheck, 
  Building, 
  Briefcase, 
  Send, 
  Loader2, 
  ArrowRight,
  FileCheck,
  Calendar,
  AlertCircle
} from "lucide-react";
import BilingualLabel from "../components/BilingualLabel";

interface Scheme {
  id: string;
  nameEn: string;
  nameKn: string;
  nameHi: string;
  category: "msme" | "grant" | "subsidy" | "loan" | "tax";
  categoryLabel: { en: string; kn: string; hi: string };
  eligibilityEn: string;
  eligibilityKn: string;
  eligibilityHi: string;
  documentsEn: string[];
  documentsKn: string[];
  documentsHi: string[];
  benefitsEn: string;
  benefitsKn: string;
  benefitsHi: string;
  deadlineEn: string;
  deadlineKn: string;
  deadlineHi: string;
  guidanceEn: string;
  guidanceKn: string;
  guidanceHi: string;
  matchingCriteria: {
    msmeCategory?: string[];
    startupStage?: string[];
    locationState?: string[];
    businessCategory?: string[];
  };
}

const STATIC_SCHEMES: Scheme[] = [
  {
    id: "mudra",
    nameEn: "Pradhan Mantri MUDRA Yojana (PMMY)",
    nameKn: "ಪ್ರಧಾನ ಮಂತ್ರಿ ಮುದ್ರಾ ಯೋಜನೆ (PMMY)",
    nameHi: "प्रधानमंत्री मुद्रा योजना (PMMY)",
    category: "loan",
    categoryLabel: { en: "Business Loan / ಸಾಲ", kn: "ಹಣಕಾಸು ಸಾಲ", hi: "व्यापार ऋण" },
    eligibilityEn: "Proprietors, Kirana stores, artisans, and small manufacturing firms under Micro category.",
    eligibilityKn: "ಸಣ್ಣ ಮತ್ತು ಸೂಕ್ಷ್ಮ ಕೈಗಾರಿಕೆಗಳು, ಕಿರಾಣಿ ಅಂಗಡಿಗಳು ಹಾಗೂ ಕರಕುಶಲ ಉದ್ಯಮಗಳು (ಸೂಕ್ಷ್ಮ ವರ್ಗ).",
    eligibilityHi: "सूक्ष्म श्रेणी के तहत छोटे दुकानदार, किराना स्टोर, कारीगर और लघु विनिर्माण इकाइयां।",
    documentsEn: ["Aadhaar Card", "PAN Card", "Business Address Proof", "UDYAM Registration certificate", "Bank statements (6 months)"],
    documentsKn: ["ಆಧಾರ್ ಕಾರ್ಡ್", "ಪ್ಯಾನ್ ಕಾರ್ಡ್", "ವ್ಯವಹಾರದ ವಿಳಾಸ ಪುರಾವೆ", "ಉದ್ಯಮ ನೋಂದಣಿ ಪತ್ರ", "ಬ್ಯಾಂಕ್ ವರದಿ (೬ ತಿಂಗಳು)"],
    documentsHi: ["आधार कार्ड", "पैन कार्ड", "व्यवसाय का पता प्रमाण", "उद्यम पंजीकरण प्रमाण पत्र", "बैंक विवरण (6 महीने)"],
    benefitsEn: "Collateral-free loans up to ₹10 Lakhs (Shishu up to ₹50k, Kishor up to ₹5L, Tarun up to ₹10L). Minimal interest rates.",
    benefitsKn: "ಯಾವುದೇ ಭದ್ರತೆ ರಹಿತ ಸಾಲಗಳು ₹೧೦ ಲಕ್ಷದವರೆಗೆ (ಶಿಶು ₹೫೦ಸಾವಿರ, ಕಿಶೋರ್ ₹೫ಲಕ್ಷ, ತರುಣ್ ₹೧೦ಲಕ್ಷ). ಅತಿ ಕಡಿಮೆ ಬಡ್ಡಿ ದರ.",
    benefitsHi: "बिना किसी गारंटी के ₹10 लाख तक का ऋण (शिशु ₹50,000 तक, किशोर ₹5 लाख तक, तरुण ₹10 लाख तक)। न्यूनतम ब्याज दरें।",
    deadlineEn: "Ongoing / Apply any time",
    deadlineKn: "ಯಾವಾಗಲಾದರೂ ಅರ್ಜಿ ಸಲ್ಲಿಸಬಹುದು",
    deadlineHi: "सतत / किसी भी समय आवेदन करें",
    guidanceEn: "Submit your request directly through UdyamiMitra portal or contact your nearest public sector bank branch.",
    guidanceKn: "ಉದ್ಯಮಿಮಿತ್ರ ಪೋರ್ಟಲ್ ಮೂಲಕ ನೇರವಾಗಿ ಅಥವಾ ಹತ್ತಿರದ ಸರ್ಕಾರಿ ಬ್ಯಾಂಕ್ ಶಾಖೆಯನ್ನು ಸಂಪರ್ಕಿಸಿ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ.",
    guidanceHi: "उद्यमीमित्र पोर्टल के माध्यम से सीधे आवेदन करें या अपने नजदीकी सार्वजनिक क्षेत्र के बैंक से संपर्क करें।",
    matchingCriteria: {
      msmeCategory: ["Micro", "Small"],
      locationState: ["Karnataka", "Maharashtra", "Delhi", "Telangana", "Tamil Nadu", "Andhra Pradesh", "West Bengal", "Gujarat"]
    }
  },
  {
    id: "cgtmse",
    nameEn: "Credit Guarantee Fund Trust for Micro & Small Enterprises (CGTMSE)",
    nameKn: "ಸೂಕ್ಷ್ಮ ಮತ್ತು ಸಣ್ಣ ಉದ್ಯಮಗಳ ಕ್ರೆಡಿಟ್ ಗ್ಯಾರಂಟಿ ಟ್ರಸ್ಟ್ (CGTMSE)",
    nameHi: "सूक्ष्म और लघु उद्यमों के लिए क्रेडिट गारंटी फंड ट्रस्ट (CGTMSE)",
    category: "loan",
    categoryLabel: { en: "Credit Guarantee / ಶೂನ್ಯ ಭದ್ರತೆ", kn: "ಬ್ಯಾಂಕ್ ಕ್ರೆಡಿಟ್ ಗ್ಯಾರಂಟಿ", hi: "क्रेडिट गारंटी साख" },
    eligibilityEn: "New and existing Micro and Small Enterprises engaged in manufacturing or service activity.",
    eligibilityKn: "ಉತ್ಪಾದನೆ ಮತ್ತು ಸೇವಾ ಚಟುವಟಿಕೆಗಳಲ್ಲಿ ತೊಡಗಿರುವ ಹೊಸ ಮತ್ತು ಕಾರ್ಯನಿರತ ಸೂಕ್ಷ್ಮ ಹಾಗೂ ಸಣ್ಣ ಉದ್ಯಮಗಳು.",
    eligibilityHi: "विनिर्माण या सेवा गतिविधि में लगे नए और मौजूदा सूक्ष्म और लघु उद्यम।",
    documentsEn: ["Project Business Report / DPR", "Financial statements (3 years for existing)", "UDYAM registration number", "Tax fillings (GST & Income Tax)"],
    documentsKn: ["ಯೋಜನೆಯ ವ್ಯವಹಾರ ವರದಿ / DPR", "ಆರ್ಥಿಕ ಬ್ಯಾಲೆನ್ಸ್ ಶೀಟ್ (೩ ವರ್ಷ)", "ಉದ್ಯಮ ನೋಂದಣಿ ಸಂಖ್ಯೆ", "ಜಿಎಸ್‌ಟಿ ತೆರಿಗೆ ವರದಿಗಳು"],
    documentsHi: ["परियोजना व्यवसाय रिपोर्ट", "वित्तीय विवरण (3 वर्ष)", "उद्यम पंजीकरण संख्या", "जीएसटी और आयकर रिटर्न"],
    benefitsEn: "Provides collateral-free loans up to ₹5 Crore from registered banks with 75% to 85% credit guarantee backed by Central Govt.",
    benefitsKn: "ಕೇಂದ್ರ ಸರ್ಕಾರದ ಶೇಕಡಾ ೭೫ ರಿಂದ ೮೫ ರಷ್ಟು ಕ್ರೆಡಿಟ್ ಗ್ಯಾರಂಟಿಯೊಂದಿಗೆ ಬ್ಯಾಂಕ್‌ಗಳಿಂದ ಯಾವುದೇ ಭದ್ರತೆ ಇಲ್ಲದೆ ₹೫ ಕೋಟಿವರೆಗೆ ಸಾಲ ಸೌಲಭ್ಯ.",
    benefitsHi: "बिना किसी गारंटी के पंजीकृत बैंकों से ₹5 करोड़ तक का ऋण, जिसमें केंद्र सरकार द्वारा 75% से 85% तक क्रेडिट गारंटी दी जाती है।",
    deadlineEn: "Financial Year renewal / Ongoing",
    deadlineKn: "ನಿರಂತರ ಯೋಜನೆ",
    deadlineHi: "सतत / प्रत्येक वित्तीय वर्ष लागू",
    guidanceEn: "Obtain project sanction from eligible schedule commercial banks. The bank will apply to CGTMSE on your behalf.",
    guidanceKn: "ಸಹಕಾರಿ ಬ್ಯಾಂಕ್‌ಗಳಿಂದ ಯೋಜನೆಯ ಅನುಮೋದನೆ ಪಡೆದುಕೊಳ್ಳಿ. ಬ್ಯಾಂಕ್ ನಿಮ್ಮ ಪರವಾಗಿ ಯೋಜನೆಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸುತ್ತದೆ.",
    guidanceHi: "पात्र राष्ट्रीयकृत बैंकों से ऋण स्वीकृत कराएं। बैंक आपकी ओर से CGTMSE को गारंटी आवेदन भेजेगा।",
    matchingCriteria: {
      msmeCategory: ["Micro", "Small", "Medium"],
      startupStage: ["MVP", "Seed", "Scale"]
    }
  },
  {
    id: "startup_karnataka",
    nameEn: "Karnataka Idea2PoC / Elevate Startup Grant",
    nameKn: "ಕರ್ನಾಟಕ Idea2PoC / ಎಲಿವೇಟ್ ಸ್ಟಾರ್ಟ್ ಅಪ್ ಗ್ರಾಂಟ್",
    nameHi: "कर्नाटक Idea2PoC / एलिवेट स्टार्टअप अनुदान",
    category: "grant",
    categoryLabel: { en: "Govt Grant / ಧನಸಹಾಯ", kn: "ಸರ್ಕಾರದ ಉಚಿತ ಧನಸಹಾಯ", hi: "सरकारी अनुदान" },
    eligibilityEn: "Tech startups registered in Karnataka with a minimum of 51% stake owned by founders from Karnataka.",
    eligibilityKn: "ಕರ್ನಾಟಕದಲ್ಲಿ ನೋಂದಾಯಿತವಾಗಿರುವ ಹಾಗೂ ರಾಜ್ಯದ ಸಂಸ್ಥಾಪಕರಿಂದ ಶೇ ೫೧ ರಷ್ಟು ಪಾಲು ಹೊಂದಿರುವ ತಾಂತ್ರಿಕ ನವೋದ್ಯಮಗಳು.",
    eligibilityHi: "कर्नाटक में पंजीकृत टेक स्टार्टअप, जिनमें कर्नाटक के शेयरधारकों की कम से कम 51% हिस्सेदारी हो।",
    documentsEn: ["Karnataka Startup Registration Proof", "DIPP certificate", "Pitch deck with MVP demo link", "Proprietor caste certificate (if scheduled tribe/caste)"],
    documentsKn: ["ಕರ್ನಾಟಕ ಸ್ಟಾರ್ಟ್‌ಅಪ್ ನೋಂದಣಿ ಪತ್ರ", "DIPP ಪ್ರಶಂಸನಾ ಪತ್ರ", "ಸವಿವರವಾದ ಪ್ರಬಂಧ (Pitch Deck)", "ಸ್ಥಳೀಯ ನಿವಾಸಿ ಅಥವಾ ಜಾತಿ ಪತ್ರ (ಅನ್ವಯಿಸಿದಲ್ಲಿ)"],
    documentsHi: ["कर्नाटक स्टार्टअप पंजीकरण प्रमाण", "DIPP प्रमाण पत्र", "एमवीपी डेमो के साथ तकनीकी पिच डेक", "जाति प्रमाण पत्र (यदि लागू हो)"],
    benefitsEn: "Grant-in-aid of up to ₹50 Lakhs for product development, design testing, and market entry without equity dilution.",
    benefitsKn: "ಉತ್ಪನ್ನ ಅಭಿವೃದ್ಧಿ, ವಿನ್ಯಾಸ ಪರೀಕ್ಷೆ ಮತ್ತು ಮಾರುಕಟ್ಟೆ ಪ್ರವೇಶಕ್ಕಾಗಿ ಹೂಡಿಕೆ ಮರುಪಾವತಿ ಇಲ್ಲದೆ ₹೫೦ ಲಕ್ಷದವರೆಗೆ ಉಚಿತ ಧನಸಹಾಯ.",
    benefitsHi: "बिना शेयर हिस्सेदारी दिए उत्पाद विकास, डिजाइन परीक्षण और बाजार प्रवेश के लिए ₹50 लाख तक का अनुदान।",
    deadlineEn: "Dates announced quarterly by Startup Karnataka",
    deadlineKn: "ಪ್ರತಿ ಮೂರು ತಿಂಗಳಿಗೊಮ್ಮೆ ದಿನಾಂಕ ಪ್ರಕಟಿಸಲಾಗುತ್ತದೆ",
    deadlineHi: "स्टार्टअप कर्नाटक द्वारा हर तिमाही में तारीखों की घोषणा की जाती है",
    guidanceEn: "Register on Startup Karnataka portal, submit pitch deck answering problem statements and face the jury selection rounds.",
    guidanceKn: "ಸ್ಟಾರ್ಟ್ ಅಪ್ ಕರ್ನಾಟಕ ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ನೋಂದಾಯಿಸಿ, ನಿಮ್ಮ ಪಿಚ್ ಡೆಕ್ ಸಲ್ಲಿಸಿ ಜ್ಯೂರಿ ಎದುರು ಪ್ರಮೋಟ್ ಮಾಡಿ ಪ್ರಶಸ್ತಿ ಗೆಲ್ಲಿ.",
    guidanceHi: "स्टार्टअप कर्नाटक पोर्टल पर पंजीकरण करें, पिच डेक जमा करें और जूरी प्रस्तुति के दौर में भाग लें।",
    matchingCriteria: {
      locationState: ["Karnataka"],
      startupStage: ["Idea", "MVP", "Seed"],
      businessCategory: ["Services", "Other"]
    }
  },
  {
    id: "msme_samadhaan",
    nameEn: "MSME Samadhaan Payment Dispute Settlement Control",
    nameKn: "ಎಂಎಸ್‌ಎಂಇ ಸಮಾಧಾನ ವಿಳಂಬ ಪಾವತಿ ಪರಿಹಾರ",
    nameHi: "एमएसएमई समाधान विलंबित भुगतान निपटान",
    category: "subsidy",
    categoryLabel: { en: "Protection / ವಿವಾದ ಪರಿಹಾರ", kn: "ಪಾವತಿ ವಿವಾದ ಪರಿಹಾರ", hi: "सुरक्षा एवं निपटान" },
    eligibilityEn: "Any registered Micro or Small Enterprise facing delayed payments from buyers beyond 45 days.",
    eligibilityKn: "ಖರೀದಿದಾರರಿಂದ ೪೫ ದಿನಗಳ ಮೀರಿ ಬರಬೇಕಾದ ಬಾಕಿ ಹಣ ಪಡೆಯಲು ತೊಂದರೆ ಅನುಭವಿಸುತ್ತಿರುವ ಯಾವುದೇ ನೋಂದಾಯಿತ ಸೂಕ್ಷ್ಮ ಅಥವಾ ಸಣ್ಣ ಕೈಗಾರಿಕೆ.",
    eligibilityHi: "कोई भी पंजीकृत सूक्ष्म या लघु उद्यम जो खरीदारों से 45 दिनों से अधिक समय से भुगतान में देरी का सामना कर रहा है।",
    documentsEn: ["UDYAM Registration Card", "Invoices demonstrating terms", "Purchase Order copy from buyer", "Proof of delivery/service fulfillment"],
    documentsKn: ["ಉದ್ಯಮ ನೋಂದಣಿ ಪತ್ರ", "ಷರತ್ತುಗಳನ್ನು ತಿಳಿಸುವ ರಶೀದಿಗಳು (Invoices)", "ಖರೀದಿದಾರನಿಂದ ಪರ್ಚೇಸ್ ಆರ್ಡರ್ ಪತ್ರ", "ಸರಕು ವಿತರಣೆಯ ರಶೀದಿ"],
    documentsHi: ["उद्यम पंजीकरण कार्ड", "शर्तों को दर्शाने वाला बिल", "खरीदार से खरीद आदेश प्रति", "सेवा/वितरण का प्रमाण"],
    benefitsEn: "Buyers must pay compound interest with monthly rests to the supplier at 3 times of bank rate as notified by RBI for delayed periods.",
    benefitsKn: "ಆರ್‌ಬಿಐ ನಿರ್ದೇಶನದಂತೆ ನಿಗದಿತ ಬ್ಯಾಂಕ್ ದರದ ೩ ಪಟ್ಟು ಚಕ್ರಬಡ್ಡಿಯನ್ನು ವಿಳಂಬ ಸಮಯಕ್ಕೆ ಪಾವತಿಸಲು ಖರೀದಿದಾರನಿಗೆ ಸೂಚನೆ ನೀಡಲಾಗುತ್ತದೆ.",
    benefitsHi: "खरीदार को भारतीय रिजर्व बैंक द्वारा अधिसूचित बैंक दर से 3 गुना मासिक चक्रवृत्ति ब्याज के साथ बकाया राशि का भुगतान करना होगा।",
    deadlineEn: "Ongoing / Submit anytime",
    deadlineKn: "ಯಾವಾಗ ಬೇಕಾದರೂ ಹಣ ವಸೂಲಾತಿ ಅರ್ಜಿ ಸಲ್ಲಿಸಬಹುದು",
    deadlineHi: "सतत / किसी भी समय शिकायत दर्ज करें",
    guidanceEn: "File a reference petition directly on MSME Samadhaan online platform against the defaulting buyer.",
    guidanceKn: "ಎಂಎಸ್‌ಎಂಇ ಸಮಾಧಾನ ಆನ್‌ಲೈನ್ ಸೈಟ್‌ನಲ್ಲಿ ನೇರವಾಗಿ ಬಾಕಿ ಪಾವತಿಸದ ಗ್ರಾಹಕನ ವಿರುದ್ಧ ಆಕ್ಷೇಪಣೆ ಸಲ್ಲಿಸಿ.",
    guidanceHi: "एमएसएमई समाधान ऑनलाइन पोर्टल पर डिफ़ॉल्ट करने वाले खरीदार के खिलाफ सीधे ऑनलाइन शिकायत दर्ज करें।",
    matchingCriteria: {
      msmeCategory: ["Micro", "Small"],
      businessCategory: ["Manufacturing", "Services", "Retail", "Textile", "Agriculture"]
    }
  },
  {
    id: "tax_80iac",
    nameEn: "Income Tax Exemption 80-IAC for Startups",
    nameKn: "ನವೋದ್ಯಮಗಳಿಗೆ ಆದಾಯ ತೆರಿಗೆ ವಿನಾಯಿತಿ 80-IAC",
    nameHi: "स्टार्टअप्स के लिए आयकर छूट धारा 80-IAC",
    category: "tax",
    categoryLabel: { en: "Tax Benefit / ತೆರಿಗೆ ವಿನಾಯಿತಿ", kn: "ಆದಾಯ ತೆರಿಗೆ ವಿನಾಯಿತಿ", hi: "आयकर बचत" },
    eligibilityEn: "DPIIT Recognized startups incorporated after April 1, 2016, with annual turnover less than ₹100 Crore.",
    eligibilityKn: "ಏಪ್ರಿಲ್ ೧, ೨೦೧೬ ರ ನಂತರ ಸ್ಥಾಪನೆಯಾದ ಮತ್ತು ವಾರ್ಷಿಕ ವಹಿವಾಟು ₹೧೦೦ ಕೋಟಿಗಿಂತ ಕಡಿಮೆ ಇರುವ DPIIT ನೋಂದಾಯಿತ ಉದ್ಯಮಗಳು.",
    eligibilityHi: "1 अप्रैल, 2016 के बाद स्थापित और ₹100 करोड़ से कम वार्षिक टर्नओवर वाले डीपीआईआईटी मान्यता प्राप्त स्टार्टअप।",
    documentsEn: ["DPIIT recognition certificate", "Certified profit/loss and balance sheet", "Memorandum of Association / MoA", "Technology validation proof"],
    documentsKn: ["DPIIT ದೃಢೀಕರಣ ಪತ್ರ", "ಆರ್ಥಿಕ ಆಡಿಟಿಂಗ್ ರಿಪೋರ್ಟ್", "ಸಂಸ್ಥೆಯ ನಿಯಮಾವಳಿ ಪತ್ರ (MoA)", "ತಾಂತ್ರಿಕ ನಾವೀನ್ಯತೆ ಪುರಾವೆ"],
    documentsHi: ["डीपीआईआईटी मान्यता प्रमाण पत्र", "प्रमाणित लाभ/हानि और बैलेंस शीट", "एसोसिएशन ज्ञापन (MoA)", "नवीनता सत्यापन प्रमाण"],
    benefitsEn: "100% tax exemption on profits for 3 consecutive financial years out of active block of first 10 years.",
    benefitsKn: "ಉದ್ಯಮ ಆರಂಭವಾದ ಮೊದಲ ೧೦ ವರ್ಷಗಳಲ್ಲಿ ಸತತ ೩ ಆರ್ಥಿಕ ವರ್ಷಗಳ ಪೂರ್ಣ ೧೦೦% ಆದಾಯ ತೆರಿಗೆ ಮುಕ್ತಿ.",
    benefitsHi: "पहले 10 वर्षों के ब्लॉक में से लगातार 3 वित्तीय वर्षों के लिए मुनाफे पर 100% आयकर छूट।",
    deadlineEn: "Annual tax filing cycles apply",
    deadlineKn: "ಪ್ರತಿ ವರ್ಷದ ಆದಾಯ ತೆರಿಗೆ ಸಲ್ಲಿಸುವ ಸಮಯ",
    deadlineHi: "वार्षिक आयकर रिटर्न चक्र लागू",
    guidanceEn: "First apply for DPIIT startup recognition on Startup India portal, and then submit Form 80-IAC via standard tax portal.",
    guidanceKn: "ಮೊದಲಿಗೆ ಉದ್ಯಮ ಮನ್ನಣೆ ಪಡೆಯಿರಿ, ತದನಂತರ ತೆರಿಗೆ ಇಲಾಖೆಯ ವೆಬ್‌ಸೈಟ್‌ನಲ್ಲಿ ಫಾರ್ಮ್ 80-IAC ಭರ್ತಿ ಮಾಡಿ ಉಚಿತ ವಿನಾಯಿತಿ ಪಡೆಯಿರಿ.",
    guidanceHi: "सबसे पहले स्टार्टअप इंडिया पोर्टल पर मान्यता के लिए आवेदन करें, फिर टैक्स ई-फाइलिंग पोर्टल पर फॉर्म 80-IAC जमा करें।",
    matchingCriteria: {
      msmeCategory: ["Micro", "Small"],
      startupStage: ["MVP", "Seed", "Scale"]
    }
  }
];

export default function GovSchemes() {
  const { userProfile, nativeLanguage } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expandedSchemeId, setExpandedSchemeId] = useState<string | null>(null);

  // AI chat states for the Scheme Expert helper bots
  const [aiMessage, setAiMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{ sender: "user" | "bot"; text: string }>>([
    {
      sender: "bot",
      text: nativeLanguage === "Kannada" 
        ? "ನಮಸ್ಕಾರ! ನಾನು ಎಂಎಸ್‌ಎಂ‌ಇ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳ ತಜ್ಞ. ನಿಮ್ಮ ಉದ್ಯಮದ ವಿವರ ಆಧರಿಸಿ ಯೋಜನೆಗಳು ಯಾವುವು, ಬೇಕಾಗುವ ದಾಖಲೆಗಳು ಯಾವವು ಎಂದು ನನ್ನನ್ನು ಕೇಳಿ."
        : nativeLanguage === "Hindi"
        ? "नमस्ते! मैं एमएसएमई सरकारी योजनाओं का विशेषज्ञ हूँ। अपने व्यवसाय के अनुसार किसी भी सब्सिडी, लोन या ग्रांट के बारे में मुझसे सवाल पूछें।"
        : nativeLanguage === "Telugu"
        ? "నమస్కారం! నేను ప్రభుత్వ పథకాల నిపుణుడిని. మీ వ్యాపారానికి తగిన సబ్సిడీలు, లోన్లు లేదా గ్రాంట్ల గురించి నన్ను అడగండి."
        : "Welcome! I am your central Government Scheme Scheme Consultant. Ask me details, eligibility, required documents or deadlines about any Central or State scheme based on your onboarded profile."
    }
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Auto-calculated profile values
  const userLocAndStage = {
    locationState: userProfile?.locationState || "Karnataka",
    msmeCategory: userProfile?.msmeCategory || "Micro",
    startupStage: userProfile?.startupStage || "Idea",
    businessCategory: userProfile?.businessCategory || "Retail"
  };

  // Logic: Filters schemes based on search, category selection, and profiles recommendations
  const categoryFiltered = STATIC_SCHEMES.filter(sc => {
    if (selectedCategory === "all") return true;
    if (selectedCategory === "recommended") {
      // Recommends based on state location matching OR MSME categorization match
      const isStateMat = sc.matchingCriteria.locationState ? sc.matchingCriteria.locationState.includes(userLocAndStage.locationState) : false;
      const isMsmeMat = sc.matchingCriteria.msmeCategory ? sc.matchingCriteria.msmeCategory.includes(userLocAndStage.msmeCategory) : false;
      const isStageMat = sc.matchingCriteria.startupStage ? sc.matchingCriteria.startupStage.includes(userLocAndStage.startupStage) : false;
      const isIndMat = sc.matchingCriteria.businessCategory ? sc.matchingCriteria.businessCategory.includes(userLocAndStage.businessCategory) : false;
      return isStateMat || isMsmeMat || isStageMat || isIndMat;
    }
    return sc.category === selectedCategory;
  });

  const finalFilteredSchemes = categoryFiltered.filter(sc => {
    const textQuery = searchTerm.toLowerCase();
    return (
      sc.nameEn.toLowerCase().includes(textQuery) ||
      sc.nameKn.toLowerCase().includes(textQuery) ||
      sc.nameHi.toLowerCase().includes(textQuery) ||
      sc.eligibilityEn.toLowerCase().includes(textQuery)
    );
  });

  const triggerAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiMessage.trim()) return;

    const query = aiMessage.trim();
    const newUserTurn = { sender: "user" as const, text: query };
    setChatHistory(prev => [...prev, newUserTurn]);
    setAiMessage("");
    setIsAiLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Topic: Government Scheme eligibility / application query.\nMy Business Onboarding Profile Details:\n* Category/Industry: ${userLocAndStage.businessCategory}\n* MSME Category size: ${userLocAndStage.msmeCategory}\n* Current Stage: ${userLocAndStage.startupStage}\n* Location State: ${userLocAndStage.locationState}\n\nQuestion asked: "${query}"\n\nExplain eligibility, required papers, immediate benefits and how/where to click/go to apply clearly.`,
          chatHistory: chatHistory.map(h => ({ sender: h.sender === "user" ? "user" : "bot", text: h.text })),
          nativeLanguage: userProfile?.nativeLanguage || "English",
          chatType: "schemes"
        })
      });

      if (!response.ok) throw new Error("Could not fetch advice.");
      const data = await response.json();
      
      setChatHistory(prev => [...prev, { sender: "bot" as const, text: data.reply || "Advice issued." }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { sender: "bot" as const, text: "Error syncing request with legal engine server. Please try again." }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const getCategoryBadgeColor = (cat: string) => {
    switch (cat) {
      case "grant": return "bg-purple-100 text-purple-700 border-purple-200";
      case "subsidy": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "loan": return "bg-amber-100 text-amber-700 border-amber-200";
      case "tax": return "bg-blue-100 text-blue-700 border-blue-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in space-y-8 text-xs text-left">
      
      {/* 1. Header Hero Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-border/15 pb-6 gap-4">
        <div>
          <h2 className="text-3xl font-serif font-black text-navy flex items-center gap-3">
            <Award className="h-8 w-8 text-gold" />
            {nativeLanguage === "Kannada" ? "ಎಂಎಸ್‌ಎಂಇ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು"
             : nativeLanguage === "Hindi" ? "सरकारी एमएसएमई योजनाएं"
             : nativeLanguage === "Telugu" ? "ప్రభుత్వ పథకాల కేంద్రం"
             : "Government Scheme Recommendation Engine"}
          </h2>
          <p className="text-xs text-gold mt-1 font-extrabold uppercase tracking-wider font-mono">
            {nativeLanguage === "Kannada" ? "ನಿಮ್ಮ ಪ್ರೊಫೈಲ್ ಆಧಾರಿತ ಸಬ್ಸಿಡಿ ಮತ್ತು ಸಾಲ ಸೌಲಭ್ಯಗಳು"
             : nativeLanguage === "Hindi" ? "आपके प्रोफाइल के अनुसार अनुशंसित सबसिडी, लोन और वित्तीय सहायता"
             : nativeLanguage === "Telugu" ? "మీ ప్రొఫైల్ ఆధారిత సబ్సిడీలు మరియు ప్రభుత్వ రుణాలు"
             : "Your personalized MSME subsidies, grants and financial tools"}
          </p>
        </div>

        {/* User profile capsule */}
        <div className="flex flex-wrap gap-2 items-center bg-surface border border-border/10 p-3 rounded-2xl shadow-sm">
          <div className="text-left leading-none pr-3 py-0.5 border-r border-border/10">
            <span className="text-[10px] font-bold text-navy block">
              📍 {userLocAndStage.locationState} {nativeLanguage === "Kannada" ? "ರಾಜ್ಯ" : nativeLanguage === "Hindi" ? "राज्य" : nativeLanguage === "Telugu" ? "రాష్ట్రం" : "State"}
            </span>
            <span className="text-[9px] text-muted italic font-medium">
              {userLocAndStage.msmeCategory} {nativeLanguage === "Kannada" ? "ಸರಹದ್ದು" : nativeLanguage === "Hindi" ? "फर्म" : nativeLanguage === "Telugu" ? "సంస్థ" : "Firm"}
            </span>
          </div>
          <div className="text-left leading-none pl-1">
            <span className="text-[10px] font-bold text-navy block">
              🚀 {userLocAndStage.startupStage} {nativeLanguage === "Kannada" ? "ಹಂತ" : nativeLanguage === "Hindi" ? "चरण" : nativeLanguage === "Telugu" ? "దశ" : "Stage"}
            </span>
            <span className="text-[9px] text-muted italic font-medium">
              {userLocAndStage.businessCategory} {nativeLanguage === "Kannada" ? "ಉದ್ಯಮ" : nativeLanguage === "Hindi" ? "उद्योग" : nativeLanguage === "Telugu" ? "పరిశ్రమ" : "Industry"}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Personalized AI Match Banner */}
      <div className="bg-navy border border-gold/30 rounded-3xl p-5 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="bg-gold/15 p-3 rounded-full border border-gold/25 text-gold shrink-0">
            <Sparkles className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <h4 className="text-gold font-serif font-black text-sm">
              Smart Matching Engines Active
            </h4>
            <p className="text-slate-300 text-[10px] items-center gap-2 mt-0.5 max-w-2xl leading-normal font-semibold">
              Currently compiling central subsidies under the <b>Ministry of Micro, Small and Medium Enterprises</b> and <b>Startup India</b> specifically configured for <b>{userLocAndStage.msmeCategory}</b> firms registered in <b>{userLocAndStage.locationState}</b>.
            </p>
          </div>
        </div>
        <button
          onClick={() => setSelectedCategory("recommended")}
          className="px-5 py-2.5 bg-gold hover:bg-gold-light text-navy text-[10px] font-black uppercase rounded-xl transition-all shadow-md cursor-pointer tracking-wider shrink-0 flex items-center gap-1.5"
        >
          <span>Show My Matches Only</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="grid lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Schemes List & Search (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          
          {/* Controls Bar */}
          <div className="bg-surface p-4 border border-border/10 rounded-2xl shadow-sm space-y-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted" />
              <input
                type="text"
                placeholder="Search scheme name, eligibility, key advantages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-surface-2 border border-border/15 rounded-xl pl-10 pr-4 py-3 text-xs focus:outline-none focus:border-gold font-bold text-navy"
              />
            </div>

            {/* Quick Filter tabs */}
            <div className="flex flex-wrap gap-1.5 pt-1 border-t border-dashed border-border/10">
              {[
                { id: "all", en: "All Schemes", kn: "ಎಲ್ಲಾ ಯೋಜನೆಗಳು", hi: "सभी योजनाएं", te: "అన్ని పథకాలు" },
                { id: "recommended", en: "★ Recommended For Me", kn: "★ ನನ್ನ ಅರ್ಹತೆಗಳು", hi: "★ मेरे लिए अनुशंसित", te: "★ నా ప్రొఫైల్ సిఫార్సులు" },
                { id: "loan", en: "Loans / Saala", kn: "ಸಾಲ ಸೌಲಭ್ಯ", hi: "व्यापार ऋण", te: "రుణాలు" },
                { id: "grant", en: "Grants / Funds", kn: "ಧನ ಸಹಾಯ", hi: "अनुदान / ग्रांट", te: "గ్రాంట్లు" },
                { id: "subsidy", en: "Subsidies", kn: "ಸಬ್ಸಿಡಿ", hi: "एमएसएमई छूट", te: "సబ్సిడీలు" },
                { id: "tax", en: "Tax Saving", kn: "ತೆರಿಗೆ ಸೌಲಭ್ಯ", hi: "कर बचत लाभ", te: "పన్ను మినహాయింపు" },
              ].map((tab) => {
                const active = selectedCategory === tab.id;
                const tabLabel = nativeLanguage === "Kannada" ? tab.kn
                               : nativeLanguage === "Hindi" ? tab.hi
                               : nativeLanguage === "Telugu" ? tab.te
                               : tab.en;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedCategory(tab.id)}
                    className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase border transition-all cursor-pointer ${
                      active
                        ? "bg-navy text-gold border-gold font-bold shadow-md"
                        : "bg-surface hover:bg-surface-2 text-muted border-border/15"
                    }`}
                  >
                    <span>{tabLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Scheme cards container */}
          <div className="space-y-4">
            {finalFilteredSchemes.length === 0 ? (
              <div className="text-center py-12 bg-white border border-dashed border-border/15 rounded-3xl text-muted text-xs">
                <AlertCircle className="h-8 w-8 text-gold mx-auto mb-2" />
                No government schemes matched this specific search filter query. Try selecting 'All Schemes' category above.
              </div>
            ) : (
              finalFilteredSchemes.map((sc) => {
                const isExpanded = expandedSchemeId === sc.id;
                return (
                  <div
                    key={sc.id}
                    className={`bg-surface border rounded-3xl overflow-hidden transition-all shadow-md ${
                      isExpanded ? "border-gold shadow-lg" : "border-border/10 hover:border-gold/30"
                    }`}
                  >
                    {/* Collapsed Header click zone */}
                    <div
                      onClick={() => setExpandedSchemeId(isExpanded ? null : sc.id)}
                      className="p-5 flex items-start justify-between gap-4 cursor-pointer hover:bg-surface-2/30"
                    >
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full border font-black uppercase text-[8px] tracking-wide ${getCategoryBadgeColor(sc.category)}`}>
                            <span>
                              {nativeLanguage === "Kannada" ? sc.categoryLabel.kn
                               : nativeLanguage === "Hindi" ? sc.categoryLabel.hi
                               : nativeLanguage === "Telugu" ? ((sc.categoryLabel as any).te || sc.categoryLabel.kn)
                               : sc.categoryLabel.en}
                            </span>
                          </span>
                          
                          {/* Recommended Tag */}
                          {(sc.matchingCriteria.locationState?.includes(userLocAndStage.locationState) || 
                            sc.matchingCriteria.msmeCategory?.includes(userLocAndStage.msmeCategory)) && (
                            <span className="bg-gold/15 text-gold border border-gold/30 px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest flex items-center gap-0.5">
                              ★ Profile Match
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm font-serif font-black text-navy leading-snug">
                          <span>
                            {nativeLanguage === "Kannada" ? sc.nameKn
                             : nativeLanguage === "Hindi" ? sc.nameHi
                             : nativeLanguage === "Telugu" ? ((sc as any).nameTe || sc.nameKn)
                             : sc.nameEn}
                          </span>
                        </h3>
                        
                        <p className="text-[10px] text-text/80 line-clamp-2 leading-relaxed">
                          <b>{nativeLanguage === "Kannada" ? "ಅರ್ಹತೆ: " : nativeLanguage === "Hindi" ? "योग्यता: " : nativeLanguage === "Telugu" ? "అర్హత: " : "Eligibility: "}</b> <span>
                            {nativeLanguage === "Kannada" ? sc.eligibilityKn
                             : nativeLanguage === "Hindi" ? sc.eligibilityHi
                             : nativeLanguage === "Telugu" ? ((sc as any).eligibilityTe || sc.eligibilityKn)
                             : sc.eligibilityEn}
                          </span>
                        </p>
                      </div>

                      <div className="pt-2 shrink-0">
                        <div className={`p-1.5 rounded-xl border border-border/10 bg-white transition-all ${isExpanded ? "transform rotate-90 bg-navy text-gold" : "text-muted"}`}>
                          <ChevronRight className="h-4.5 w-4.5" />
                        </div>
                      </div>
                    </div>

                    {/* Expanded details container */}
                    {isExpanded && (
                      <div className="border-t border-border/10 bg-white p-5 space-y-5 animate-fade-in text-left">
                        {/* Benefits Area */}
                        <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-2xl space-y-1">
                          <span className="font-extrabold text-emerald-800 text-[10px] uppercase block tracking-wider flex items-center gap-1">
                            <Plus className="h-3.5 w-3.5 text-emerald-500" />
                            {nativeLanguage === "Kannada" ? "ಮುಖ್ಯ ಸೌಲಭ್ಯಗಳು ಮತ್ತು ಪ್ರಯೋಜನಗಳು"
                             : nativeLanguage === "Hindi" ? "मुख्य लाभ और सुविधाएँ"
                             : nativeLanguage === "Telugu" ? "కీలక ప్రయోజనాలు మరియు లాభాలు"
                             : "Key Benefits & Advantages"}
                          </span>
                          <p className="text-[11px] text-emerald-950 font-bold leading-relaxed">
                            <span>
                              {nativeLanguage === "Kannada" ? sc.benefitsKn
                               : nativeLanguage === "Hindi" ? sc.benefitsHi
                               : nativeLanguage === "Telugu" ? ((sc as any).benefitsTe || sc.benefitsKn)
                               : sc.benefitsEn}
                            </span>
                          </p>
                        </div>

                        {/* Two columns: documents vs guidance */}
                        <div className="grid md:grid-cols-2 gap-4">
                          {/* Documents */}
                          <div className="bg-surface-2 p-4 rounded-2xl border border-border/5 space-y-2">
                            <span className="font-extrabold text-navy text-[10.5px] uppercase block tracking-wider flex items-center gap-1">
                              <FileCheck className="h-4 w-4 text-gold" />
                              {nativeLanguage === "Kannada" ? "ಅಗತ್ಯವಿರುವ ದಾಖಲೆಗಳು"
                               : nativeLanguage === "Hindi" ? "आवश्यक दस्तावेज"
                               : nativeLanguage === "Telugu" ? "కావలసిన పత్రాలు / డాక్యుమెంట్లు"
                               : "Required Papers & Documents"}
                            </span>
                            <ul className="space-y-1.5">
                              {(nativeLanguage === "Kannada" ? sc.documentsKn
                                : nativeLanguage === "Hindi" ? sc.documentsHi
                                : nativeLanguage === "Telugu" ? ((sc as any).documentsTe || sc.documentsKn)
                                : sc.documentsEn).map((doc, i) => (
                                <li key={i} className="flex items-center gap-2 text-[10.5px] text-text font-semibold">
                                  <span className="w-1.5 h-1.5 bg-gold rounded-full shrink-0" />
                                  <span>{doc}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Target Deadlines & Action Guidance */}
                          <div className="bg-surface-2 p-4 rounded-2xl border border-border/5 space-y-3">
                            <div className="space-y-1">
                              <span className="font-extrabold text-navy text-[10.5px] uppercase block tracking-wider flex items-center gap-1 leading-none">
                                <Calendar className="h-4 w-4 text-teal" />
                                {nativeLanguage === "Kannada" ? "ಅರ್ಜಿ ಸಲ್ಲಿಸುವ ಕೊನೆಯ ದಿನಾಂಕ"
                                 : nativeLanguage === "Hindi" ? "आवेदन की समय सीमा"
                                 : nativeLanguage === "Telugu" ? "దరఖాస్తు గడువు"
                                 : "Submission Deadline Cycle"}
                              </span>
                              <p className="text-[11px] text-text/80 font-bold leading-normal">
                                <span>
                                  {nativeLanguage === "Kannada" ? sc.deadlineKn
                                   : nativeLanguage === "Hindi" ? sc.deadlineHi
                                   : nativeLanguage === "Telugu" ? ((sc as any).deadlineTe || sc.deadlineKn)
                                   : sc.deadlineEn}
                                </span>
                              </p>
                            </div>

                            <div className="space-y-1 pt-1.5 border-t border-dashed border-border/10">
                              <span className="font-extrabold text-navy text-[10.5px] uppercase block tracking-wider flex items-center gap-1 leading-none">
                                <Building className="h-4 w-4 text-amber-600" />
                                {nativeLanguage === "Kannada" ? "ಅರ್ಜಿ ಸಲ್ಲಿಸುವುದು ಹೇಗೆ?"
                                 : nativeLanguage === "Hindi" ? "आवेदन करने की विधि"
                                 : nativeLanguage === "Telugu" ? "దరఖాస్తు చేసుకునే విధానం"
                                 : "Apply Step Guide"}
                              </span>
                              <p className="text-[11.5px] text-text font-bold leading-relaxed">
                                <span>
                                  {nativeLanguage === "Kannada" ? sc.guidanceKn
                                   : nativeLanguage === "Hindi" ? sc.guidanceHi
                                   : nativeLanguage === "Telugu" ? ((sc as any).guidanceTe || sc.guidanceKn)
                                   : sc.guidanceEn}
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Bottom Share Link triggers */}
                        <div className="pt-3 border-t border-dashed border-border/10 flex flex-wrap justify-between items-center gap-3">
                          <span className="text-[9.5px] text-muted italic">
                            {nativeLanguage === "Kannada" ? "ಮೊದಲಿಗೆ ನಿಮ್ಮ ಒಪ್ಪಂದ ಪತ್ರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ."
                             : nativeLanguage === "Hindi" ? "पहले दस्तावेज़ विश्लेषक टूल में अनुबंध जांच लें।"
                             : nativeLanguage === "Telugu" ? "మొదటగా మా 'డాక్యుమెంట్ విశ్లేషకం' ద్వారా పేపర్‌లను తనిఖీ చేసుకోండి."
                             : "Verify legal compliance of paperwork on our 'Document Analyzer' workspace first."}
                          </span>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setChatHistory(prev => [
                                  ...prev,
                                  { sender: "user", text: `Tell me exactly how I can apply for "${sc.nameEn}" with a Micro business registered in ${userLocAndStage.locationState}.` }
                                ]);
                                setAiMessage(`Can you write draft application instructions and eligibility checklists for "${sc.nameEn}"?`);
                              }}
                              className="px-4 py-2 bg-navy hover:bg-gold text-white hover:text-navy text-[9.5px] font-black uppercase rounded-xl transition-all shadow-sm cursor-pointer"
                            >
                              💬 Draft Scheme Application Letter
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: AI Expert Chat Assist Console (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-surface border-2 border-gold/30 rounded-3xl p-5 shadow-xl space-y-4 relative overflow-hidden">
            {/* Background design glow */}
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-gold/5 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center gap-2.5 pb-3 border-b border-border/10">
              <div className="bg-navy p-2 rounded-full text-gold">
                <Sparkles className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xs font-serif font-black text-navy leading-none">
                  AI MSME Scheme Consultant
                </h3>
                <p className="text-[9px] text-muted font-bold block pt-1.5 uppercase tracking-wide">
                  {userProfile?.nativeLanguage === "Kannada" ? "ಉಚಿತ ಎಂಎಸ್‌ಎಂಇ ಸಹಾಯವಾಣಿ" : "एमएसएमई योजना विशेषज्ञ"}
                </p>
              </div>
            </div>

            {/* Chat conversation messages window */}
            <div className="h-[280px] overflow-y-auto space-y-3.5 pr-1 text-[11px] leading-relaxed select-text">
              {chatHistory.map((ch, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl border ${
                    ch.sender === "user"
                      ? "bg-navy text-white ml-6 border-navy text-right"
                      : "bg-white text-navy mr-6 border-border/10 shadow-sm text-left"
                  }`}
                >
                  <p className="font-bold underline text-[8.5px] mb-1 opacity-70">
                    {ch.sender === "user" ? "YOU" : "Namma NyayaMitra EXPERT"}
                  </p>
                  <p className="font-semibold">{ch.text}</p>
                </div>
              ))}

              {isAiLoading && (
                <div className="flex items-center gap-2 bg-white p-3 rounded-2xl border border-border/5 text-muted">
                  <Loader2 className="h-4 w-4 animate-spin text-gold" />
                  <span className="font-bold">Consulting centralized MSME database...</span>
                </div>
              )}
            </div>

            {/* In-chat inputs submit */}
            <form onSubmit={triggerAskAI} className="pt-2">
              <div className="relative">
                <input
                  type="text"
                  value={aiMessage}
                  onChange={(e) => setAiMessage(e.target.value)}
                  placeholder="Ask eligibility limits, tax benefits, doc guides..."
                  className="w-full bg-surface-2 border border-border/20 rounded-xl pl-3 pr-10 py-3 text-xs focus:outline-none focus:border-gold font-bold text-navy"
                />
                <button
                  type="submit"
                  disabled={isAiLoading}
                  className="absolute right-1 top-1 p-2 bg-navy hover:bg-gold hover:text-navy text-gold rounded-lg transition-colors cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </form>

            <span className="text-[9.2px] text-muted block italic leading-snug text-center pt-1">
              Your inquiries are securely matched against central guidelines issued by SIDBI, NABARD, and central MSME ministries.
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
