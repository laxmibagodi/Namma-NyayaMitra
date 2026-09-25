import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  BookOpen, 
  ShieldCheck, 
  Coins, 
  Scale, 
  Calculator, 
  AlertTriangle, 
  FileText, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  Building, 
  ShoppingBag, 
  Gavel, 
  ChevronRight, 
  ArrowRight,
  Info
} from "lucide-react";

// Bilingual translations helper for the Rights Hub
const HUBLATIONS = {
  headerTitle: {
    English: "MSME Legal Rights & Awareness Hub",
    Hindi: "एमएसएमई कानूनी अधिकार एवं जागरूकता हब",
    Kannada: "ಎಂಎಸ್ಎಂಇ ಕಾನೂನು ಹಕ್ಕುಗಳು ಮತ್ತು ಜಾಗೃತಿ ಹಬ್",
    Telugu: "MSME చట్టపరమైన హక్కులు & అవగాహన హబ్"
  },
  headerSub: {
    English: "Empower your business with direct statutory knowledge, delayed-payment interest calculators, and immediate grievance templates.",
    Hindi: "अपने व्यवसाय को वैधानिक ज्ञान, विलंबित-भुगतान ब्याज कैलकुलेटर और त्वरित शिकायत निवारण ड्राफ्ट से सुदृढ़ करें।",
    Kannada: "ಸಾಂವಿಧಾನಿಕ ಜ್ಞಾನ, ವಿಳಂಬಿತ-ಪಾವತಿ ಬಡ್ಡಿ ಕ್ಯಾಲ್ಕುಲೇಟರ್ ಮತ್ತು ತ್ವರಿತ ಕಾನೂನು ನೋಟಿಸ್ ಟೆಂಪ್ಲೇಟ್‌ಗಳೊಂದಿಗೆ ನಿಮ್ಮ ಉದ್ಯಮವನ್ನು ಬಲಪಡಿಸಿ.",
    Telugu: "చట్టపరమైన జ్ఞానం, ఆలస్యంగా చెల్లించే రుసుము వడ్డీ కాలిక్యులేటర్లు మరియు త్వరిత గ్రీవెన్స్ టెంప్లేట్‌లతో మీ వ్యాపారాన్ని బలోపేతం చేసుకోండి."
  },
  tabBusiness: {
    English: "Business Rights",
    Hindi: "व्यापारिक अधिकार",
    Kannada: "ವ್ಯಾಪಾರ ಹಕ್ಕುಗಳು",
    Telugu: "వ్యాపార హಕ್ಕುలు"
  },
  tabConsumer: {
    English: "Consumer Rights",
    Hindi: "उपभोक्ता अधिकार",
    Kannada: "ಗ್ರಾಹಕ ಹಕ್ಕುಗಳು",
    Telugu: "వినియోగదారుల హక్కులు"
  },
  tabCalculator: {
    English: "Interest Calculator",
    Hindi: "ब्याज कैलकुलेटर",
    Kannada: "ವಿಳಂಬ ಪಾವತಿ ಬಡ್ಡಿ",
    Telugu: "ఆలస్య పైన వడ్డీ కాలిక్యులేటర్"
  },
  tabDrafting: {
    English: "Demand Notice Generator",
    Hindi: "मांग पत्र जनरेटर",
    Kannada: "ಡಿಮ್ಯಾಂಡ್ ನೋಟಿಸ್ ಸೃಷ್ಟಿ",
    Telugu: "డిమాండ్ నోటీసు జనరేటర్"
  }
};

interface RightItem {
  id: string;
  actName: string;
  title: string;
  titleHi: string;
  titleKn: string;
  titleTe: string;
  section: string;
  desc: string;
  descHi: string;
  descKn: string;
  descTe: string;
  checklist: string[];
  checklistHi: string[];
  checklistKn: string[];
  checklistTe: string[];
  actionLink?: string;
  actionText: string;
}

const BUSINESS_RIGHTS: RightItem[] = [
  {
    id: "delayed-payment",
    actName: "MSME Development Act, 2006",
    title: "Right to Timely Payment (45-Day Rule)",
    titleHi: "समय पर भुगतान का अधिकार (45-दिवसीय नियम)",
    titleKn: "ಸಮಯಕ್ಕೆ ಸರಿಯಾಗಿ ಪಾವತಿ ಪಡೆಯುವ ಹಕ್ಕು (45 ದಿನಗಳ ನಿಯಮ)",
    titleTe: "సకాలంలో చెల్లింపు పొందే హక్కు (45 రోజుల నియమం)",
    section: "Sections 15 - 24 of MSMED Act",
    desc: "Buyers must pay MSMEs within 45 days if there is a written agreement, or within 15 days if no written contract exists. Any delay triggers penal interest compounded monthly at 3 times the RBI repo rate.",
    descHi: "लिखित समझौते के तहत खरीदारों को 45 दिनों के भीतर और बिना लिखित समझौते के 15 दिनों के भीतर भुगतान करना होगा। देरी होने पर आरबीआई रेपो दर के 3 गुना की दर से मासिक चक्रवृद्धि ब्याज देय होगा।",
    descKn: "ಲಿಖಿತ ಒಪ್ಪಂದವಿದ್ದರೆ 45 ದಿನಗಳಲ್ಲಿ, ಒಪ್ಪಂದವಿಲ್ಲದಿದ್ದರೆ 15 ದಿನಗಳಲ್ಲಿ ಖರೀದಿದಾರರು ಹಣ ಪಾವತಿಸಬೇಕು. ವಿಳಂಬವಾದರೆ ಭಾರತೀಯ ರಿಸರ್ವ್ ಬ್ಯಾಂಕ್ (RBI) ರೆಪೋ ದರದ 3 ಪಟ್ಟು ಮಾಸಿಕ ಸಂಯುಕ್ತ ಬಡ್ಡಿ ನೀಡಬೇಕು.",
    descTe: "లిఖితపూర్వక ఒప్పందం ఉంటే 45 రోజులలోపు, ఒప్పందం లేకపోతే 15 రోజులలోపు కొనుగోలుదారు చెల్లింపు చేయాలి. ఆలస్యమైతే RBI రెపో రేటుకు 3 రెట్లు నెలవారీ చక్రవడ్డీ చెల్లించాల్సి ఉంటుంది.",
    checklist: [
      "No corporate agreement can override the statutory 45-day limit.",
      "Applicable only to registered MSMEs (Udyam registered owners).",
      "Interest paid is penal and is strictly non-deductible for the buyer's income tax purposes.",
      "File directly under MSME Samadhaan in case of non-payment disputes."
    ],
    checklistHi: [
      "कोई भी कॉर्पोरेट समझौता वैधानिक 45-दिवसीय सीमा को रद्द नहीं कर सकता।",
      "केवल पंजीकृत एमएसएमई (उद्यम पंजीकृत स्वामियों) के लिए ही लागू।",
      "भुगतान किया गया ब्याज दंडात्मक है और खरीदार के आयकर उद्देश्यों के लिए कड़ाई से अस्वीकार्य है।",
      "भुगतान न होने के विवादों के मामले में सीधे एमएसएमई समाधान पोर्टल पर दावा दायर करें।"
    ],
    checklistKn: [
      "ಯಾವುದೇ ಕಾರ್ಪೊರೇಟ್ ಲಿಖಿತ ಒಪ್ಪಂದವು ಈ 45 ದಿನಗಳ ಕಾನೂನು ಮಿತಿಯನ್ನು ಉಲ್ಲಂಘಿಸುವಂತಿಲ್ಲ.",
      "ನೊಂದಾಯಿತ ಎಂಎಸ್ಎಂಇ (ಉದ್ಯಮ್ ನೊಂದಣಿ ಹೊಂದಿದವರಿಗೆ) ಮಾತ್ರ ಅನ್ವಯಿಸುತ್ತದೆ.",
      "ವಿಳಂಬಕ್ಕಾಗಿ ಪಾವತಿಸಿದ ಬಡ್ಡಿಯು ದಂಡಾತ್ಮಕವಾಗಿದ್ದು, ಖರೀದಿದಾರನು ಅದನ್ನು ಆದಾಯ ತೆರಿಗೆ ಕಡಿತಕ್ಕಾಗಿ ಬಳಸುವಂತಿಲ್ಲ.",
      "ಪಾವತಿಯಾಗದಿದ್ದಲ್ಲಿ ನೇರವಾಗಿ ಎಂಎಸ್ಎಂಇ ಸಮಾಧಾನ್ (MSME Samadhaan) ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ದೂರು ದಾಖಲಿಸಿ."
    ],
    checklistTe: [
      "ఏ కార్పొరేట్ ఒప్పందం కూడా చట్టబద్ధమైన 45 రోజుల పరిమితిని అధిగమించలేదు.",
      "నమోదిత MSME (ఉద్యమ్ రిజిస్టర్డ్ యజమానులకు) మాత్రమే వర్తిస్తుంది.",
      "చెల్లించిన వడ్డీ దండనాత్మకమైనది మరియు కొనుగోలుదారు ఆదాయ పన్ను మినహాయింపు కోసం దీనిని క్లెయిమ్ చేయలేరు.",
      "చెల్లింపు వివాదాల విషయంలో నేరుगा MSME సమాధాన్ పోర్టల్‌లో గ్రీవెన్స్ దాఖలు చేయండి."
    ],
    actionLink: "https://samadhaan.msme.gov.in/",
    actionText: "File MSME Samadhaan Case / समाधान पोर्टल"
  },
  {
    id: "collateral-free-credit",
    actName: "SIDBI / CGTMSE Reforms",
    title: "Collateral-Free Institutional Funding Guarantee",
    titleHi: "संपार्श्विक-मुक्त संस्थागत ऋण गारंटी",
    titleKn: "ಜಾಮೀನು ರಹಿತ ಉದ್ಯಮ ಸಾಲ ಪಡೆಯುವ ಹಕ್ಕು",
    titleTe: "ధృవీకరణ పత్రాలు లేకుండా రుణం పొందే హಕ್ಕು",
    section: "CGTMSE Trust Directive",
    desc: "Active protection grants MSMEs the absolute right to secure formal credit facility up to ₹5 Crores from retail and public sector banks without pledging residential or commercial collateral.",
    descHi: "सक्रिय कानून एमएसएमई को आवासीय या व्यावसायिक संपत्ति गिरवी रखे बिना वाणिज्यिक और सार्वजनिक क्षेत्र के बैंकों से ₹5 करोड़ तक का औपचारिक ऋण सुरक्षित करने का पूर्ण अधिकार देता है।",
    descKn: "ವಸತಿ ಅಥವಾ ವಾಣಿಜ್ಯ ಆಸ್ತಿಯನ್ನು ಗಿರವಿ ಇಡದೆಯೇ ವಾಣಿಜ್ಯ ಮತ್ತು ಸಾರ್ವಜನಿಕ ವಲಯದ ಬ್ಯಾಂಕುಗಳಿಂದ ₹5 ಕೋಟಿ ವರೆಗೆ ಸಾಲ ಪಡೆಯಲು ಕಾನೂನು ರಕ್ಷಣೆ ಮತ್ತು ಗ್ಯಾರಂಟಿ ಒದಗಿಸುತ್ತದೆ.",
    descTe: "నివాస లేదా వాణిజ్య ఆస్తిని తాకట్టు పెట్టకుండా వాణిజ్య మరియు ప్రభుత్వ రంగ బ్యాంకుల నుండి ₹5 కోట్ల వరకు అధికారిక రుణ సదుపాయాన్ని పొందే పూర్తి హక్కును MSMEలకు చట్టం కల్పిస్తుంది.",
    checklist: [
      "Credit Guarantee Scheme for Micro & Small Enterprises backs the loan defaults.",
      "Ensures lenders evaluate your viable business model instead of physical brick assets.",
      "Covers working capital loans as well as comprehensive term loans.",
      "Can protest arbitrary denial to the local banking ombudsman directly."
    ],
    checklistHi: [
      "सूक्ष्म एवं लघु उद्योगों के लिए क्रेडिट गारंटी योजना ऋण की अदायगी न होने पर सुरक्षा प्रदान करती है।",
      "यह सुनिश्चित करता है कि ऋणदाता भौतिक संपत्ति के बजाय आपके व्यावहारिक व्यावसायिक मॉडल का मूल्यांकन करें।",
      "वर्किंग कैपिटल लोन के साथ-साथ व्यापक टर्म लोन को भी कवर करता है।",
      "मनमाने ढंग से इंकार करने पर सीधे स्थानीय बैंकिंग लोकपाल (Ombudsman) से शिकायत कर सकते हैं।"
    ],
    checklistKn: [
      "ಸಣ್ಣ ಉದ್ಯಮಗಳ ಕ್ರೆಡಿಟ್ ಗ್ಯಾರಂಟಿ ಯೋಜನೆಯು ಸಾಲ ಮರುಪಾವತಿಗೆ ಗ್ಯಾರಂಟಿ ನೀಡುತ್ತದೆ.",
      "ಭೌತಿಕ ಆಸ್ತಿಗಳ ಬದಲಾಗಿ ಬ್ಯಾಂಕುಗಳು ನಿಮ್ಮ ಉದ್ಯಮದ ಮಾದರಿಯನ್ನು ಆಧರಿಸಿ ಸಾಲ ನೀಡುವಂತೆ ಮಾಡುತ್ತದೆ.",
      "ಕಾರ್ಯನಿರತ ಬಂಡವಾಳ ಸಾಲದ ಜೊತೆಗೆ ದೀರ್ಘಾವಧಿ ಸಾಲಗಳನ್ನೂ ಒಳಗೊಳ್ಳುತ್ತದೆ.",
      "ಸಾಲ ನೀಡಲು ಅನಗತ್ಯವಾಗಿ ನಿರಾಕರಿಸಿದರೆ ಬ್ಯಾಂಕಿಂಗ್ ಒಂಬುಡ್ಸ್‌ಮನ್‌ ಭೇಟಿಯಾಗಿ ದೂರು ನೀಡಬಹುದು."
    ],
    checklistTe: [
      "సూక్ష్మ మరియు చిన్న పరిశ్రమల క్రెడిట్ గ్యారಂಟి స్కీమ్ లోన్ డీఫాల్ట్‌లను భరిస్తుంది.",
      "రుణదాతలు మీ భౌతిక ఆస్తులకు బదులుగా వ్యాపార నమూనాను అంచనా వేసేలా నిర్ధారిస్తుంది.",
      "వర్కింగ్ క్యాపిటల్ లోన్లు మరియు దీర్ಘకాలిక టర్మ్ లోన్లు రెండింటినీ కవర్ చేస్తుంది.",
      "అకారణంగా తిరస్కరిస్తే నేరుగా బ్యాంకింగ్ అంబుడ్స్‌మన్‌కు ఫిర్యాదు చేయవచ్చు."
    ],
    actionText: "Check Bank CGTMSE Limits"
  },
  {
    id: "tender-participation",
    actName: "Public Procurement Policy Act, 2012",
    title: "Exemption from Earnest Money Deposit (EMD)",
    titleHi: "बयाना राशि जमा (EMD) से छूट का अधिकार",
    titleKn: "ಸರ್ಕಾರಿ ಟೆಂಡರ್ ಠೇವಣಿ (EMD) ವಿನಾಯಿತಿ ಹಕ್ಕು",
    titleTe: "సర్కారు టెಂಡర్ డిపాజిట్ (EMD) నుండి మినహాయింపు హక్కు",
    section: "Section 11, Procurement Mandates",
    desc: "Central Government Ministries, Departments, and PSUs must mandatorily procure minimum 25% of their total annual purchases from MSMEs, offering relaxed tenders and absolute relief from Earnest Money Deposits.",
    descHi: "केंद्र सरकार के मंत्रालयों, विभागों और सार्वजनिक उपक्रमों को अपनी कुल वार्षिक खरीद का न्यूनतम 25% एमएसएमई से खरीदना अनिवार्य है, जिसमें बयाना राशि (EMD) से पूरी छूट मिलती है।",
    descKn: "ಕೇಂದ್ರ ಸರ್ಕಾರದ ಸಚಿವಾಲಯಗಳು, ಇಲಾಖೆಗಳು ಮತ್ತು ಸಾರ್ವಜನಿಕ ಸ್ವಾಮ್ಯದ ಸಂಸ್ಥೆಗಳು ತಮ್ಮ ವಾರ್ಷಿಕ ಖರೀದಿಯ ಕನಿಷ್ಠ ಶೇ. 25 ರಷ್ಟನ್ನು ಎಂಎಸ್ಎಂಇಗಳಿಂದಲೇ ಖರೀದಿಸಬೇಕು ಮತ್ತು ಯಾವುದೇ ಇಎಂಡಿ (EMD) ಠೇವಣಿ ಕಡ್ಡಾಯವಿಲ್ಲ.",
    descTe: "కేంద్ర ప్రభుత్వ మంత్రిత్వ శాఖలు, విభాగాలు మరియు ప్రభుత్వ రంగ సంస్థలు తమ మొత్తం వార్షिक కొనుగోళ్లలో కనీసం 25% MSMEల నుండి సేకరించడం తప్పనిసరి, EMD డిపాజిట్ల అవసరం లేదు.",
    checklist: [
      "Exemption from paying bid security or earnest money when bidding government projects.",
      "Tender document copies must be issued completely free of cost.",
      "Eligible for 15% price preference over non-MSME large scale bidders in pricing competition.",
      "Grievances can be taken to GeM grievance cells in case of non-compliance."
    ],
    checklistHi: [
      "सरकारी परियोजनाओं की बोली लगाते समय बोली सुरक्षा या बयाना राशि जमा करने से छूट।",
      "निविदा (Tender) दस्तावेज की प्रतियां पूरी तरह से निःशुल्क जारी की जानी चाहिए।",
      "मूल्य प्रतिस्पर्धा में गैर-एमएसएमई बड़े बोलीदाताओं की तुलना में 15% अतिरिक्त मूल्य वरीयता के पात्र।",
      "अनुपालन न होने की स्थिति में सरकारी मार्केटप्लेस (GeM) शिकायत प्रकोष्ठ से संपर्क कर सकते हैं।"
    ],
    checklistKn: [
      "ಸರ್ಕಾರಿ ಯೋಜನೆಗಳಿಗೆ ಬಿಡ್ ಮಾಡುವಾಗ ಯಾವುದೇ ಮುಂಗಡ ಜಾಮೀನು ಠೇವಣಿ ಹಣ ಕಟ್ಟಬೇಕಿಲ್ಲ.",
      "ಟೆಂಡರ್ ದಾಖಲಾತಿ ಪ್ರತಿಗಳನ್ನು ಸಂಪೂರ್ಣ ಉಚಿತವಾಗಿ ನೀಡಬೇಕು.",
      "ದೊಡ್ಡ ಉದ್ಯಮಗಳ ಬಿಡ್ ಪ್ರೈಸ್‌ಗಿಂತ ಶೇ. 15 ರಷ್ಟು ಬೆಲೆ ರಿಯಾಯಿತಿ ಆದ್ಯತೆಯನ್ನು ನಿಯಮಾವಳಿ ಪ್ರಕಾರ ನೀಡಬಹುದು.",
      "ನಿಯಮ ಪಾಲಿಸದ ಉದ್ಯಮಗಳ ವಿರುದ್ಧ GeM ದೂರು ಕೌನ್ಸಿಲ್ ನೆರವು ಪಡೆಯಬಹುದು."
    ],
    checklistTe: [
      "ప్రభుత్వ ప్రాజెక్టుల బిడ్డింగ్‌లో బిడ్ సెక్యూరిటీ లేదా EMD చెల్లించాల్సిన అవసరం లేదు.",
      "టెండర్ పత్రాల కాపీలను పూర్తిగా ఉಚಿತంగా అందించాలి.",
      "పెద్ద వ్యాపారులతో పోటీ పడుతున్నప్పుడు 15% వరకు ధర ప్రాధాನ್ಯత లభిస్తుంది.",
      "అనుసరించని పక్షంలో GeM గ్రీవెన్స్ సెల్ ద్వారా ఫిర్యాదు చేయవచ్చు."
    ],
    actionLink: "https://gem.gov.in/",
    actionText: "Browse Govt e-Marketplace / जीईएम पोर्टल"
  }
];

const CONSUMER_RIGHTS: RightItem[] = [
  {
    id: "msme-as-consumer",
    actName: "Consumer Protection Act, 2019",
    title: "MSME Owner's Right as a Consumer",
    titleHi: "उपभोक्ता के रूप में एमएसएमई स्वामी के अधिकार",
    titleKn: "ಎಂಎಸ್ಎಂಇ ಮಾಲೀಕರ ಗ್ರಾಹಕ ರಕ್ಷಣೆ ಹಕ್ಕುಗಳು",
    titleTe: "వినియోగదారునిగా MSME యజమాని కలిగి ఉండే హక్కులు",
    section: "Section 2(7) Livelihood Exemption",
    desc: "If an MSME owner buys machinery, computer terminals, or utility delivery trucks to earn their livelihood via self-employment, they are protected class of consumers under national consumer forums, allowing direct prosecution of commercial machinery sellers.",
    descHi: "यदि कोई एमएसएमई मालिक स्वरोजगार के माध्यम से अपनी आजीविका कमाने के लिए मशीनरी, कंप्यूटर या डिलीवरी ट्रक जैसी वस्तुएं खरीदता है, तो वे उपभोक्ता मंच के तहत न्याय पाने के हकदार हैं।",
    descKn: "ಸ್ವಯಂ ಉದ್ಯೋಗದ ಉದ್ದೇಶಕ್ಕಾಗಿ ಯಂತ್ರೋಪಕರಣಗಳು, ಕಂಪ್ಯೂಟರ್ ಅಥವಾ ಸರಕು ಸಾಗಣೆ ವಾಹನಗಳನ್ನು ಖರೀದಿಸುವ ಎಂಎಸ್ಎಂಇ ಮಾಲೀಕರು ಗ್ರಾಹಕ ಹಕ್ಕು ವ್ಯಾಪ್ತಿಗೆ ಬರುತ್ತಾರೆ ಮತ್ತು ದೋಷಪೂರಿತ ಯಂತ್ರಗಳ ವಿರುದ್ಧ ಮೊಕದ್ದಮೆ ಹೂಡಬಹುದು.",
    descTe: "స్వయం ఉపాధి ద్వారా జీవనోపాధి పొందడానికి ఒక MSME యజమాని యంత్రాలు, కంప్యూటర్లు లేదా మోటార్ వాహనాలను కొనుగోలు చేస్తే, వారు వినియోగదారుల కోర్టు ద్వారా ఫిర్యాదు దాఖలు చేయవచ్చు.",
    checklist: [
      "Covers commercial machinery purchased for livelihood, not high volume manufacturing reseller.",
      "Right to sue manufacturing vendors for defective components or warranty defaults.",
      "Includes services like software licenses, commercial transport, and cloud services.",
      "Can file digital complaint on E-Daakhil without physical court visits."
    ],
    checklistHi: [
      "आजीविका के लिए खरीदी गई व्यावसायिक मशीनरी को कवर करता है, न कि भारी मात्रा में विनिर्माण पुनर्विक्रेता को।",
      "दोषपूर्ण पुर्जों या वारंटी चूक के लिए विनिर्माण विक्रेताओं पर मुकदमा करने का कानूनी अधिकार।",
      "सॉफ्टवेयर लाइसेंस, वाणिज्यिक परिवहन और क्लाउड सेवाओं जैसी बुनियादी सेवाएं भी शामिल हैं।",
      "बिना कोर्ट चक्कर काटे सीधे 'ई-दाखिल' (E-Daakhil) पोर्टल पर डिजिटल शिकायत दर्ज कर सकते हैं।"
    ],
    checklistKn: [
      "ಜೀವನೋಪಾಯದ ಉದ್ದೇಶಕ್ಕಾಗಿ ಬಳಸುವ ಉಪಕರಣಗಳಿಗೆ ಮಾತ್ರ ಅನ್ವಯಿಸುತ್ತದೆ (ಮರುಮಾರಾಟ ಮಾಡುವವರಿಗಲ್ಲ).",
      "ದೋಷಪೂರಿತ ಯಂತ್ರಗಳು ಅಥವಾ ವಾರಂಟಿ ಉಲ್ಲಂಘನೆಗಾಗಿ ಮಾರಾಟಗಾರರ ವಿರುದ್ಧ ಗ್ರಾಹಕ ನ್ಯಾಯಾಲಯದ ಮೊಕದ್ದಮೆ.",
      "ಸಾಫ್ಟ್‌ವೇರ್ ಲೈಸೆನ್ಸ್, ವಾಣಿಜ್ಯ ಸಾರಿಗೆ ಮತ್ತು ಕ್ಲೌಡ್ ಸೇವೆಗಳಿಗೆ ಇದು ಸಮಾನವಾಗಿ ಅನ್ವಯಿಸುತ್ತದೆ.",
      "ಭೌತಿಕವಾಗಿ ಕೋರ್ಟ್‌ಗೆ ಹೋಗದೆಯೇ 'ಇ-ದಾಖಿಲ್' ಮೂಲಕ ಆನ್‌ಲೈನ್‌ನಲ್ಲಿ ದೂರು ಸಲ್ಲಿಸಬಹುದು."
    ],
    checklistTe: [
      "జీవనోపాధి కోసం కొనుగోలు చేసిన వాణిజ్య యంత్రాలను కవర్ చేస్తుంది, పునఃవిక్రేతలకు కాదు.",
      "దోషపూరిత భాగాలు లేదా వారంటీ డిఫాల్ట్‌ల కోసం విక్రేతలపై దావా వేసే హక్కు ఉంటుంది.",
      "సాఫ్ట్‌వేర్ లైసెన్సులు, రవాణా మరియు క్ಲೌడ్ సేవలు కూడా చట్ట పరిధిలోకి వస్తాయి.",
      "కోర్టులకు వెళ్లకుండానే 'ఇ-దాఖిల్' పోర్టల్ ద్వారా ఆన్‌లైన్‌లో ఫిర్యాదు దాಖలు చేయవచ్చు."
    ],
    actionLink: "https://edaakhil.nic.in/",
    actionText: "File Consumer Complaint / ई-दाखिल पोर्टल"
  },
  {
    id: "msme-liability",
    actName: "Product Liability & Standards Rules",
    title: "MSME Obligations and Liability Protection",
    titleHi: "एमएसएमई दायित्व और गुणवत्ता सुरक्षा नियम",
    titleKn: "ಎಂಎಸ್ಎಂಇ ಗ್ರಾಹಕ ಹೊಣೆಗಾರಿಕೆ ಮತ್ತು ಗುಣಮಟ್ಟ ನಿಯಮಗಳು",
    titleTe: "MSME బాధ్యతలు మరియు నాణ్యత రక్షణ నియమాలు",
    section: "Chapter VI, CPA 2019",
    desc: "When selling goods directly to end users, MSMEs are protected against unfair bulk manufacturer indemnity. Liability is allocated directly based on who modified or failed the instruction specifications.",
    descHi: "अंतिम उपभोक्ताओं को सामान बेचते समय, छोटे व्यापारियों को थोक निर्माता की गलतियों के लिए अंधाधुंध जिम्मेदार नहीं ठहराया जा सकता। नुकसान की जिम्मेदारी उसके आधार पर तय होती है जिसने त्रुटि की हो।",
    descKn: "ಗ್ರಾಹಕರಿಗೆ ಸರಕುಗಳನ್ನು ಮಾರಾಟ ಮಾಡುವಾಗ, ಕಂಪನಿಗಳ ತಪ್ಪುಗಳಿಗೆ ಸಣ್ಣ ಉದ್ಯಮಿಗಳನ್ನು ನೇರವಾಗಿ ದಂಡಿಸಲು ಬರುವುದಿಲ್ಲ. ತಪ್ಪು ಎಲ್ಲಿ ನಡೆದಿದೆ ಎನ್ನುವುದರ ಆಧಾರದ ಮೇಲೆ ಹೊಣೆಗಾರಿಕೆಯನ್ನು ನಿರ್ಧರಿಸಲಾಗುತ್ತದೆ.",
    descTe: "నిజమైన వినియోగదారులకు వస్తువులను విక్రయించినప్పుడు, తయారీదారుల తప్పులకు చిన్న వ్యాపారులను బాధ్యులను చేయలేరు. ఎవరి లోపం ఉంటే వారినే బాಧ್ಯులుగా చేస్తారు.",
    checklist: [
      "Protects small retailers if defects occurred during bulk assembly by third-party manufacturers.",
      "Requires explicit disclaimers on packaging for safe operation guidance.",
      "Right to seek contribution damages from suppliers if input components were defective.",
      "Reduces financial pressure on local Kiranas by mandating insurance for extreme liability issues."
    ],
    checklistHi: [
      "यदि तीसरे पक्ष के निर्माताओं द्वारा असेंबली के दौरान दोष हुआ हो, तो छोटे खुदरा विक्रेताओं की रक्षा करता है।",
      "सुरक्षित संचालन मार्गदर्शन के लिए पैकेजिंग पर स्पष्ट अस्वीकरण (Disclaimers) आवश्यक हैं।",
      "इनपुट घटकों के दोषपूर्ण होने पर आपूर्तिकर्ताओं से योगदान क्षतिपूर्ति प्राप्त करने का कानूनी अधिकार।",
      "अत्यधिक क्षति के मामलों में बीमा की व्यवस्था कर किराना स्टोर के वित्तीय जोखिमों को काफी कम करता है।"
    ],
    checklistKn: [
      "ಮೂರನೇ ವ್ಯಕ್ತಿಗಳ ಫ್ಯಾಕ್ಟರಿ ನಿರ್ಮಾಣದ ತಪ್ಪುಗಳಿಗೆ ಸಣ್ಣ ಕಿರಾಣಿ ವರ್ತಕರನ್ನು ರಕ್ಷಿಸುತ್ತದೆ.",
      "ಸುರಕ್ಷಿತ ಬಳಕೆಗೆ ಸಂಬಂಧಿಸಿದಂತೆ ಪ್ಯಾಕೆಟ್ ಮೇಲೆ ಸ್ಪಷ್ಟ ಮಾಹಿತಿ ನಮೂದಿಸಿರಬೇಕು.",
      "ನಿಮ್ಮ ಸರಬರಾಜುದಾರರು ನೀಡಿದ ಕಚ್ಚಾ ವಸ್ತುಗಳು ಕೆಟ್ಟುಹೋಗಿದ್ದರೆ ಅವರಿಂದ ಬದಲಿ ಪರಿಹಾರ ಪಡೆಯುವ ಹಕ್ಕು.",
      "ಕಿರಾಣಿ ಅಂಗಡಿಗಳ ಆರ್ಥಿಕ ಹೊರೆಯನ್ನು ಕಡಿಮೆ ಮಾಡಲು ಸರಳ ಆಶ್ರಯ ವಿಮೆಯನ್ನು ನೀಡುತ್ತದೆ."
    ],
    checklistTe: [
      "మూడో పక్ష తయారీదారులు అసెంబ్లింగ్ లోపాలు చేస్తే చిన్న రిటైలర్లకు రక్షణ ఉంటుంది.",
      "సురಕ್ಷిత వినియోగం కోసం ప్యాకేజింగ్ ముద్రణలపై స్పష్టమైన డిస్‌క్లైమర్లు ఉండాలి.",
      "సరఫరాదారులు ఇచ్చిన భాగాలు లోపభూయిష్టంగా ఉంటే వారి వద్ద నష్టపరిహారం కోరవచ్చు.",
      "కిరాణా దుకాణాల ఆర్థిక నష్టాలను తగ్గించడానికి బీమా సౌకర్యాలు కల్పిస్తుంది."
    ],
    actionText: "Review Consumer Compliance Standards"
  }
];

export default function Awareness() {
  const { nativeLanguage } = useAuth();
  
  const [activeTab, setActiveTab] = useState<"business" | "consumer" | "calculator" | "notice">("business");
  const [speakState, setSpeakState] = useState<boolean>(false);
  const [speechInstance, setSpeechInstance] = useState<SpeechSynthesisUtterance | null>(null);

  // Notice letter state variables
  const [buyerName, setBuyerName] = useState<string>("");
  const [buyerAddress, setBuyerAddress] = useState<string>("");
  const [invoiceNo, setInvoiceNo] = useState<string>("");
  const [invoiceAmount, setInvoiceAmount] = useState<string>("");
  const [invoiceDate, setInvoiceDate] = useState<string>("");
  const [noticeGenerated, setNoticeGenerated] = useState<boolean>(false);
  const [copiedState, setCopiedState] = useState<boolean>(false);

  // Calculator State Variables
  const [principal, setPrincipal] = useState<string>("100000");
  const [inputInvoiceDate, setInputInvoiceDate] = useState<string>("");
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [gracePeriod, setGracePeriod] = useState<"15" | "45">("45");
  const [repoRate, setRepoRate] = useState<string>("6.50");
  const [calcResult, setCalcResult] = useState<{
    dueDays: number;
    delayDays: number;
    penalRate: number;
    interest: number;
    totalAmount: number;
    interestFormula: string;
    isEligibleSamadhaan: boolean;
  } | null>(null);

  const getTranslation = (key: keyof typeof HUBLATIONS) => {
    return HUBLATIONS[key][nativeLanguage] || HUBLATIONS[key]["English"];
  };

  // Speaks aloud the legal rights using HTML5 SpeechSynthesis
  const speakRights = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel(); // Cancel any ongoing speech
      
      if (speakState) {
        setSpeakState(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Attempt language matching
      if (nativeLanguage === "Hindi") {
        utterance.lang = "hi-IN";
      } else if (nativeLanguage === "Kannada") {
        utterance.lang = "kn-IN";
      } else if (nativeLanguage === "Telugu") {
        utterance.lang = "te-IN";
      } else {
        utterance.lang = "en-IN";
      }

      utterance.onend = () => {
        setSpeakState(false);
      };

      utterance.onerror = () => {
        setSpeakState(false);
      };

      setSpeechInstance(utterance);
      setSpeakState(true);
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Text-to-Speech is not supported in this browser version.");
    }
  };

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setSpeakState(false);
    }
  };

  // Delayed Interest Calculator Logic conforming strictly to Section 16 of the MSME Development Act
  const calculateMSMEInterest = () => {
    const principalAmount = parseFloat(principal);
    const repo = parseFloat(repoRate);
    
    if (isNaN(principalAmount) || principalAmount <= 0) {
      alert("Please enter a valid positive principal amount.");
      return;
    }
    if (!inputInvoiceDate) {
      alert("Please select the Invoice Date.");
      return;
    }

    const start = new Date(inputInvoiceDate);
    const end = new Date(paymentDate);

    if (end < start) {
      alert("Payment Date / Today's Date cannot be preceding the Invoice Date.");
      return;
    }

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Under MSME Act:
    // Interest liability starts after the grace period of either 15 days or agreed maximum of 45 days.
    const allowableGraceDays = parseInt(gracePeriod);
    const delayDays = Math.max(0, totalDays - allowableGraceDays);

    // Penal Interest under Law is 3 times the RBI Bank Repo Rate
    const penalRatePerAnnum = repo * 3; // e.g. 6.5 * 3 = 19.5%
    const penalRatePerMonth = penalRatePerAnnum / 12 / 100;

    // Compounded Monthly Interest Calculation:
    // Interest is compounded monthly. Number of compounded cycles = delayDays / 30
    let interestAmt = 0;
    if (delayDays > 0) {
      const monthsDecimal = delayDays / 30;
      // Compound formula: A = P(1 + r)^n - P
      interestAmt = principalAmount * Math.pow(1 + penalRatePerMonth, monthsDecimal) - principalAmount;
    }

    const roundedInterest = Math.round(interestAmt * 100) / 100;
    const totalClaim = Math.round((principalAmount + roundedInterest) * 100) / 100;

    setCalcResult({
      dueDays: allowableGraceDays,
      delayDays: delayDays,
      penalRate: penalRatePerAnnum,
      interest: roundedInterest,
      totalAmount: totalClaim,
      interestFormula: `Unpaid Principal of ₹${principalAmount.toLocaleString()} delayed for ${delayDays} days, carrying compounded monthly statutory interest of ${penalRatePerAnnum}% p.a.`,
      isEligibleSamadhaan: delayDays > 0
    });
  };

  // Notice Drafting Template Generation with Bilingual features!
  const generateNotice = () => {
    if (!buyerName || !buyerAddress || !invoiceNo || !invoiceAmount || !invoiceDate) {
      alert("Please fill in all requested fields to generate the formal demand notice.");
      return;
    }
    setNoticeGenerated(true);
  };

  const copyNoticeToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedState(true);
    setTimeout(() => setCopiedState(false), 2000);
  };

  const demandNoticeTemplateText = `
REGD A.D. LEGAL DEMAND NOTICE / वैधानिक मांग सूचना पत्र
Date: ${new Date().toLocaleDateString("en-IN")}

TO (Buyer details):
Name of Debtor: ${buyerName}
Office Address: ${buyerAddress}

FROM (Seller / MSME details):
Advocate / Owner Representing MSME Business
Udyam Registration Verified Enterprise

Dear Sir/Madam,

SUBJECT: FORMAL STATUTORY DEMAND FOR IMMEDIATE DISCHARGE OF UNPAID INVOICES EXCEEDING 45 DAYS UNDER SECTION 15 OF THE MSME DEVELOPMENT (MSMED) ACT, 2006.

Under instructions and on behalf of our client, we hereby demand principal and penal interest in respect of the unpaid services/goods:

1. PRINCIPAL INVOICE AMOUNT: ₹${parseFloat(invoiceAmount).toLocaleString()}
2. INVOICE REF NO: ${invoiceNo}
3. INVOICE DATE: ${new Date(invoiceDate).toLocaleDateString("en-IN")}
4. DURATION OF EXCEEDED DELAY: Over allowable limits under Section 15 of MSMED Act.

LAW MANDATES:
"As per Section 16 of the MSMED Act 2006, the buyer is legally obligated to pay compound interest with monthly rests to the supplier on that amount from the appointed day at three times of the bank rate notified by the Reserve Bank."

Kindly take notice that you are required to discharge the full amount of ₹${parseFloat(invoiceAmount).toLocaleString()} along with compound statutory interest within 15 days of receiving this notice. Failing which, our client shall initiate urgent legal action before the MSME Facilitation Council (MSEFC) / MSME Samadhaan to recover dues, which will involve heavy litigation costs and business blacklisting.

Sincerely,
Udyam Verified Merchant / MSME Representative
[Drafted via NyayaAI Rights Shield Portal]
  `;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in text-left">
      
      {/* HEADER SECTION WITH HERO CARD AND VOICE GUIDE */}
      <div className="bg-surface border border-gold/25 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 relative overflow-hidden">
        {/* Subtle branding background grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#d4a017_0.8px,transparent_0.8px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
        
        <div className="space-y-2 relative z-15 text-left max-w-2xl">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gold/15 border border-gold/45 rounded-xl">
              <BookOpen className="h-5 w-5 text-gold animate-pulse" />
            </div>
            <span className="text-[10px] uppercase tracking-widest font-black text-emerald-600 block flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
              Statutory Empowerment Portal
            </span>
          </div>
          <h1 className="font-serif font-black text-2xl text-navy tracking-tight">
            {getTranslation("headerTitle")}
          </h1>
          <p className="text-[11.5px] text-stone-500 leading-relaxed font-semibold">
            {getTranslation("headerSub")}
          </p>
        </div>

        {/* VOICE PLAYBACK BUTTON FOR VISUALLY COMPROMISED OR MOBILE USERS */}
        <div className="shrink-0 relative z-15 flex flex-col gap-2 w-full md:w-auto">
          {!speakState ? (
            <button
              onClick={() => speakRights(
                nativeLanguage === "Hindi" 
                  ? "नमस्ते, एमएसएमई कानून के तहत आपको समय पर भुगतान और बिना गारंटी लोन का पूरा कानूनी अधिकार है। नीचे दिए गए हब में अपने अधिकारों की जांच करें और ब्याज कैलकुलेटर का उपयोग करें।"
                  : nativeLanguage === "Kannada"
                    ? "ನಮಸ್ಕಾರ, ಕಾನೂನಿನ ಪ್ರಕಾರ ಸಮಯಕ್ಕೆ ಸರಿಯಾಗಿ ಹಣ ಪಡೆಯುವುದು ಮತ್ತು ಬ್ಯಾಂಕಿನಿಂದ ಜಾಮೀನು ರಹಿತ ಸಾಲ ಪಡೆಯುವುದು ನಿಮ್ಮ ಹಕ್ಕಾಗಿದೆ. ಈ ಕೆಳಗಿನ ಹಬ್ ನಲ್ಲಿ ಜಾಗೃತಿ ಮಾಹಿತಿಗಳನ್ನು ಪಡೆದುಕೊಳ್ಳಿ."
                    : nativeLanguage === "Telugu"
                      ? "నమస్కారం, సకాలంలో కరారు పత్రాల ప్రకారం పేమెంట్స్ పొందడం మరియు సెక్యూరిటీ లేకుండా లోన్ తీసుకోవడం మీ ప్రాథಮಿಕ హక్కులు. ఆరా తీసుకోండి."
                      : "Welcome. Under Indian MSME law, you have absolute statutory rights for receiving payments within 45 days and claiming triple interest penal rate. Choose a tab to explore."
              )}
              className="px-5 py-3 bg-[#111827] text-white hover:bg-[#1f2937] border border-gold/30 hover:border-gold rounded-2xl text-[10.5px] font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all shadow shadow-gold/10 group active:scale-95"
            >
              <Volume2 className="h-4 w-4 text-gold group-hover:scale-110" />
              <span>Hear Voice Guide / आवाज सुनें 🔊</span>
            </button>
          ) : (
            <button
              onClick={stopSpeaking}
              className="px-5 py-3 bg-red-600 hover:bg-red-500 text-white border border-red-500 rounded-2xl text-[10.5px] font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all shadow shadow-red-500/25 active:scale-95"
            >
              <VolumeX className="h-4 w-4 animate-bounce" />
              <span>Stop Audio Guide / आडियो रोकें 🛑</span>
            </button>
          )}
          <span className="text-[9px] text-muted italic text-center leading-none">
            {nativeLanguage === "Hindi" ? "रीयल-टाइम आवाज मार्गदर्शन उपलब्ध" 
             : nativeLanguage === "Kannada" ? "ಧ್ವನಿ ಮೂಲಕ ನಿಯಮಗಳನ್ನು ಕೇಳಿ"
             : "Real-time speech synthesis active"}
          </span>
        </div>
      </div>

      {/* TABS SELECTOR COMPONENT */}
      <div className="flex border-b border-border mb-8 overflow-x-auto gap-1 scrollbar-thin py-0.5">
        <button
          onClick={() => setActiveTab("business")}
          className={`px-5 py-3 rounded-t-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === "business" 
              ? "bg-surface border-t-2 border-l border-r border-gold text-gold font-black shadow-sm" 
              : "text-stone-500 hover:text-gold hover:bg-stone-50/50"
          }`}
        >
          <Building className="h-4 w-4" />
          <span>{getTranslation("tabBusiness")}</span>
        </button>
        <button
          onClick={() => setActiveTab("consumer")}
          className={`px-5 py-3 rounded-t-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === "consumer" 
              ? "bg-surface border-t-2 border-l border-r border-gold text-gold font-black shadow-sm" 
              : "text-stone-500 hover:text-gold hover:bg-stone-50/50"
          }`}
        >
          <ShoppingBag className="h-4 w-4" />
          <span>{getTranslation("tabConsumer")}</span>
        </button>
        <button
          onClick={() => setActiveTab("calculator")}
          className={`px-5 py-3 rounded-t-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === "calculator" 
              ? "bg-surface border-t-2 border-l border-r border-gold text-gold font-black shadow-sm" 
              : "text-stone-500 hover:text-gold hover:bg-stone-50/50"
          }`}
        >
          <Calculator className="h-4 w-4" />
          <span>{getTranslation("tabCalculator")}</span>
        </button>
        <button
          onClick={() => setActiveTab("notice")}
          className={`px-5 py-3 rounded-t-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === "notice" 
              ? "bg-surface border-t-2 border-l border-r border-gold text-gold font-black shadow-sm" 
              : "text-stone-500 hover:text-gold hover:bg-stone-50/50"
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>{getTranslation("tabDrafting")}</span>
        </button>
      </div>

      {/* TAB CONTENT: BUSINESS RIGHTS */}
      {activeTab === "business" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {BUSINESS_RIGHTS.map((right) => (
              <div 
                key={right.id}
                className="bg-surface border border-border/10 rounded-2xl p-6 shadow-sm transition-all hover:border-gold/30 hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start gap-4 mb-3 pb-3 border-b border-stone-100">
                    <div>
                      <span className="px-2 py-0.5 rounded-full bg-gold/15 text-gold text-[9px] font-black uppercase tracking-wider block w-max">
                        {right.actName}
                      </span>
                      <h2 className="font-serif font-black text-base text-navy mt-1 tracking-tight">
                        {nativeLanguage === "Hindi" ? right.titleHi 
                         : nativeLanguage === "Kannada" ? right.titleKn 
                         : nativeLanguage === "Telugu" ? right.titleTe 
                         : right.title}
                      </h2>
                    </div>
                    <span className="text-[10px] font-mono text-stone-500 font-extrabold shrink-0 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                      ⚖️ {right.section}
                    </span>
                  </div>

                  <p className="text-[11.5px] text-stone-600 leading-relaxed font-semibold mb-4">
                    {nativeLanguage === "Hindi" ? right.descHi 
                     : nativeLanguage === "Kannada" ? right.descKn 
                     : nativeLanguage === "Telugu" ? right.descTe 
                     : right.desc}
                  </p>

                  <div className="space-y-2 mb-6">
                    <span className="text-[9.5px] font-black uppercase tracking-wider text-muted block mb-1">Key Provisions & Protection:</span>
                    {(nativeLanguage === "Hindi" ? right.checklistHi 
                      : nativeLanguage === "Kannada" ? right.checklistKn 
                      : nativeLanguage === "Telugu" ? right.checklistTe 
                      : right.checklist).map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2 bg-slate-50/55 p-2 rounded-xl text-[10.5px] font-semibold text-slate-700 leading-snug border border-slate-100/30">
                        <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-stone-100 pt-4 flex justify-between items-center bg-transparent mt-2">
                  <span className="text-[9px] italic text-slate-400 font-medium leading-none">
                    Status: Verified Central Act Legislation
                  </span>
                  {right.actionLink ? (
                    <a
                      href={right.actionLink}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[9.5px] font-black uppercase transition-all tracking-wider flex items-center gap-1 cursor-pointer"
                    >
                      <span>{right.actionText}</span>
                      <ArrowRight className="h-3 w-3" />
                    </a>
                  ) : (
                    <button
                      onClick={() => setActiveTab("calculator")}
                      className="px-4 py-2 bg-[#111827] hover:bg-[#1f2937] text-white border border-gold/20 rounded-xl text-[9.5px] font-black uppercase transition-all tracking-wider flex items-center gap-1 cursor-pointer"
                    >
                      <span>Calculate Delayed Interest / गणना करें</span>
                      <ChevronRight className="h-3 w-3 text-gold" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT SIDEBAR GIVING QUICK GRIEVE SUMMARY */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-navy to-[#1e293b] text-white border border-gold/20 rounded-3xl p-6 shadow-md relative overflow-hidden">
              <div className="absolute inset-0 bg-grid-pattern opacity-5" style={{ backgroundImage: "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
              <div className="relative z-15 text-left">
                <Gavel className="h-8 w-8 text-gold mb-3.5 animate-bounce" />
                <h3 className="font-serif font-black text-[15px] text-gold tracking-tight mb-2">
                  Delayed Payments Redressal (MSEFC)
                </h3>
                <p className="text-[10.5px] text-slate-300 leading-relaxed font-semibold mb-4">
                  Did you know that MSME Facilitation Councils operate as commercial civil courts with arbitration power? Large corporations who deny due payments are legally forced to defend themselves in speed arbitration courts.
                </p>

                <div className="space-y-3 pb-4 border-b border-slate-700 mb-4 text-[10px] leading-relaxed">
                  <div className="flex gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-gold text-navy font-black text-[9px] leading-4 text-center shrink-0">1</span>
                    <span>Send a bilingual demand notice under Section 15 & 16 (Use generator tab).</span>
                  </div>
                  <div className="flex gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-gold text-navy font-black text-[9px] leading-4 text-center shrink-0">2</span>
                    <span>If unpaid for 45 days, file on online Samadhaan Portal with your PDF invoice.</span>
                  </div>
                  <div className="flex gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-gold text-navy font-black text-[9px] leading-4 text-center shrink-0">3</span>
                    <span>MSEFC mandates 90-day fast resolution of arbitration proceedings.</span>
                  </div>
                </div>

                <div className="bg-gold/15 border border-gold/30 rounded-2xl p-3 text-[9px] italic text-gold font-bold leading-relaxed mb-4">
                  "No buyer can file an appeal against MSEFC decision without depositing 75% of the claimed amount in escrow account beforehand." (Sec 19)
                </div>

                <a
                  href="https://samadhaan.msme.gov.in/"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full text-center block py-2.5 bg-gold hover:bg-gold-light text-navy font-black rounded-xl text-[9.5px] uppercase tracking-wider transition-all"
                >
                  Visit e-Samadhaan Council Portal
                </a>
              </div>
            </div>

            {/* QUICK RIGHTS HELPFUL INFO */}
            <div className="bg-surface border border-gold/20 rounded-2xl p-5 text-left text-xs text-stone-500 font-semibold space-y-4 shadow-inner">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted block border-b pb-1.5 font-mono">My Rights Audit Check</span>
              <div className="space-y-2 text-[10.5px] leading-relaxed">
                <p className="text-navy font-black">Is my firm fully protected?</p>
                <div className="space-y-1.5 text-[9.5px]">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Udyam registered: Yes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Separate written contract for every sale: Highly Recommended</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    <span>Accepting delays above 45 days: Statutory Violation</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: CONSUMER RIGHTS */}
      {activeTab === "consumer" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {CONSUMER_RIGHTS.map((right) => (
              <div 
                key={right.id}
                className="bg-surface border border-border/10 rounded-2xl p-6 shadow-sm transition-all hover:border-gold/30 hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start gap-4 mb-3 pb-3 border-b border-stone-100">
                    <div>
                      <span className="px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-[9px] font-black uppercase tracking-wider block w-max">
                        {right.actName}
                      </span>
                      <h2 className="font-serif font-black text-base text-navy mt-1 tracking-tight">
                        {nativeLanguage === "Hindi" ? right.titleHi 
                         : nativeLanguage === "Kannada" ? right.titleKn 
                         : nativeLanguage === "Telugu" ? right.titleTe 
                         : right.title}
                      </h2>
                    </div>
                    <span className="text-[10px] font-mono text-stone-500 font-extrabold shrink-0 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                      ⚖️ {right.section}
                    </span>
                  </div>

                  <p className="text-[11.5px] text-stone-600 leading-relaxed font-semibold mb-4">
                    {nativeLanguage === "Hindi" ? right.descHi 
                     : nativeLanguage === "Kannada" ? right.descKn 
                     : nativeLanguage === "Telugu" ? right.descTe 
                     : right.desc}
                  </p>

                  <div className="space-y-2 mb-6">
                    <span className="text-[9.5px] font-black uppercase tracking-wider text-muted block mb-1">Protection Elements:</span>
                    {(nativeLanguage === "Hindi" ? right.checklistHi 
                      : nativeLanguage === "Kannada" ? right.checklistKn 
                      : nativeLanguage === "Telugu" ? right.checklistTe 
                      : right.checklist).map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2 bg-slate-50/55 p-2 rounded-xl text-[10.5px] font-semibold text-slate-700 leading-snug border border-slate-100/30">
                        <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-stone-100 pt-4 flex justify-between items-center bg-transparent mt-2">
                  <span className="text-[9px] italic text-slate-400 font-medium leading-none">
                    Status: Consumer Protection Act 2019 Amendments
                  </span>
                  {right.actionLink ? (
                    <a
                      href={right.actionLink}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 bg-[#1cb8a4] hover:bg-[#159a88] text-white rounded-xl text-[9.5px] font-black uppercase transition-all tracking-wider flex items-center gap-1 cursor-pointer"
                    >
                      <span>{right.actionText}</span>
                      <ArrowRight className="h-3 w-3" />
                    </a>
                  ) : (
                    <span className="px-3 py-1 bg-[#1e293b] text-gold font-bold text-[8.5px] uppercase tracking-wider rounded-lg border border-gold/20">
                      Quality Standards Compliance Check
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            <div className="bg-surface border border-gold/15 rounded-3xl p-5 shadow-sm text-left">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <h3 className="font-serif font-black text-sm text-navy tracking-tight">Consumer Grievance Checklist</h3>
              </div>
              <p className="text-[10.5px] text-stone-500 leading-relaxed font-semibold mb-4">
                If your business buys raw commodities or office automation setups that turn out to be completely defective:
              </p>
              
              <ul className="space-y-2 text-[10px] leading-relaxed font-medium text-slate-600">
                <li className="flex gap-2">
                  <span className="text-emerald-500 font-black">✔</span>
                  <span>Gather proof of purchase, invoices, and delivery dates.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-500 font-black">✔</span>
                  <span>Issue a direct notice of commercial warranty claim specifying 15 days rectification period.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-500 font-black">✔</span>
                  <span>If suppliers ignore requests, register claims via digital E-Daakhil.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-500 font-black">✔</span>
                  <span>For commercial litigation values up to ₹5 Lakhs, filing charges are very minimal.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: DELAYED PAYMENT CALCULATOR */}
      {activeTab === "calculator" && (
        <div className="bg-surface border border-gold/25 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="max-w-3xl mx-auto space-y-6">
            
            <div className="text-center space-y-1.5 pb-4 border-b border-stone-100">
              <Calculator className="h-10 w-10 text-gold mx-auto" />
              <h2 className="font-serif font-black text-lg text-navy tracking-tight">
                Statutory Delayed Payment Interest Calculator
              </h2>
              <p className="text-[10.5px] text-stone-400 font-bold uppercase tracking-wider">
                COMPLYING WITH SECTION 16 OF THE INDIAN MSME DEVELOPMENT (MSMED) ACT
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="space-y-4">
                <div>
                  <label htmlFor="principal-input" className="block text-[10px] font-black uppercase tracking-wider text-muted mb-1.5">
                    Principal Invoice Amount (₹) / बिल मूल्य
                  </label>
                  <input
                    id="principal-input"
                    type="number"
                    value={principal}
                    onChange={(e) => setPrincipal(e.target.value)}
                    className="w-full bg-light-bg border border-border/15 rounded-xl px-3.5 py-3 text-xs font-bold text-navy focus:outline-none focus:ring-1 focus:ring-gold"
                    placeholder="e.g. 500000"
                  />
                </div>

                <div>
                  <label htmlFor="invoice-date-input" className="block text-[10px] font-black uppercase tracking-wider text-muted mb-1.5">
                    Invoice Date / बिल जारी की तिथि
                  </label>
                  <input
                    id="invoice-date-input"
                    type="date"
                    value={inputInvoiceDate}
                    onChange={(e) => setInputInvoiceDate(e.target.value)}
                    className="w-full bg-light-bg border border-border/15 rounded-xl px-3.5 py-3 text-xs font-bold text-navy focus:outline-none focus:ring-1 focus:ring-gold"
                  />
                </div>

                <div>
                  <label htmlFor="payment-date-input" className="block text-[10px] font-black uppercase tracking-wider text-muted mb-1.5">
                    Expected / Actual Date of Payment / भुगतान तिथि
                  </label>
                  <input
                    id="payment-date-input"
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full bg-light-bg border border-border/15 rounded-xl px-3.5 py-3 text-xs font-bold text-navy focus:outline-none focus:ring-1 focus:ring-gold"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="grace-select" className="block text-[10px] font-black uppercase tracking-wider text-muted mb-1.5">
                    Written Agreement Grace Period / लिखित समझौता अवधि
                  </label>
                  <select
                    id="grace-select"
                    value={gracePeriod}
                    onChange={(e) => setGracePeriod(e.target.value as any)}
                    className="w-full bg-light-bg border border-border/15 rounded-xl px-3.5 py-3 text-xs font-bold text-navy focus:outline-none focus:ring-1 focus:ring-gold"
                  >
                    <option value="45">With Written Agreement (Max 45 Days Rule)</option>
                    <option value="15">No Written Agreement (Strict 15 Days Rule)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="repo-input" className="block text-[10px] font-black uppercase tracking-wider text-muted mb-1.5">
                    RBI Repo Rate (%) / आरबीआई रेपो दर (Defaults to 6.50)
                  </label>
                  <input
                    id="repo-input"
                    type="number"
                    step="0.05"
                    value={repoRate}
                    onChange={(e) => setRepoRate(e.target.value)}
                    className="w-full bg-light-bg border border-border/15 rounded-xl px-3.5 py-3 text-xs font-bold text-navy focus:outline-none focus:ring-1 focus:ring-gold"
                  />
                </div>

                <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl text-[9.5px] text-slate-500 leading-relaxed font-semibold">
                  <div className="flex gap-1 items-start text-navy">
                    <Info className="h-3.5 w-3.5 text-gold shrink-0 mt-0.5" />
                    <span>Calculations conform to monthly rest compound formulas. RBI Repo rate is auto multiplied by 3 as required by federal law.</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-100">
              <button
                type="button"
                onClick={calculateMSMEInterest}
                className="w-full py-4 bg-gold hover:bg-gold-light text-navy font-black rounded-2xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-gold/20 flex items-center justify-center gap-2 active:scale-95"
              >
                <Calculator className="h-4 w-4" />
                <span>Calculate Statutory Interest / ब्याज गणना करें</span>
              </button>
            </div>

            {/* INTEREST CALCULATION RESULTS PANEL */}
            {calcResult && (
              <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 animate-fade-in text-left border border-gold/25 relative overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-500 via-amber-400 to-emerald-500" />
                
                <div className="flex justify-between items-start gap-4 mb-4 pb-4 border-b border-slate-800">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">LIABILITY REPORT</span>
                    <h3 className="font-serif font-black text-base text-gold mt-1">Interests Accrued for Delay</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] uppercase font-mono bg-slate-800 border border-slate-700 px-2 py-1 rounded text-slate-300">
                      Penal Rate PER ANNUM: {calcResult.penalRate}%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                    <span className="text-[8.5px] uppercase font-bold text-slate-400">Total Delay Duration</span>
                    <p className="font-serif font-black text-xl text-white mt-1">{calcResult.delayDays} Days</p>
                    <span className="text-[8.5px] text-slate-500 mt-1 block">Excluding appointed grace days</span>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                    <span className="text-[8.5px] uppercase font-bold text-slate-400">Compound Penal Interest</span>
                    <p className="font-serif font-black text-xl text-amber-400 mt-1">₹{calcResult.interest.toLocaleString("en-IN")}</p>
                    <span className="text-[8.5px] text-slate-500 mt-1 block">Compounded monthly rests</span>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                    <span className="text-[8.5px] uppercase font-bold text-slate-400">Total Claim Claimable</span>
                    <p className="font-serif font-black text-xl text-emerald-400 mt-1">₹{calcResult.totalAmount.toLocaleString("en-IN")}</p>
                    <span className="text-[8.5px] text-slate-500 mt-1 block">Invoice principal + statutory interest</span>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 mb-6 text-[10.5px] font-mono leading-relaxed text-slate-300">
                  <span className="text-[8.5px] uppercase font-bold text-slate-400 block mb-1">Calculation Methodology:</span>
                  {calcResult.interestFormula}
                </div>

                {calcResult.isEligibleSamadhaan ? (
                  <div className="bg-emerald-950/40 border border-emerald-800 text-emerald-300 p-4 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="text-left font-serif leading-none">
                      <p className="font-black text-[12px]">Eligible for MSME Samadhaan Filing!</p>
                      <p className="text-[9.5px] text-emerald-400/80 mt-1 font-sans">Delay exceeds permissible guidelines. File an executive grievance immediately.</p>
                    </div>
                    <button
                      onClick={() => setActiveTab("notice")}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-[9px] uppercase tracking-wider cursor-pointer"
                    >
                      Draft Legal Demand Letter &larr;
                    </button>
                  </div>
                ) : (
                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl text-[10px] text-center text-slate-400 italic">
                    Note: Your payment is still within the statutory appointed grace day limits. Interest is not yet accrued.
                  </div>
                )}

              </div>
            )}

          </div>
        </div>
      )}

      {/* TAB CONTENT: NOTICE DRAFTING SHIELD */}
      {activeTab === "notice" && (
        <div className="bg-surface border border-gold/25 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* INPUT CONTROLS PANEL */}
            <div className="lg:col-span-5 space-y-4 text-left">
              <div>
                <span className="text-[9px] uppercase tracking-widest font-black text-rose-500 block mb-1">
                  STRICT FORMAL ADVISORY
                </span>
                <h2 className="font-serif font-black text-base text-navy tracking-tight">
                  Delayed Payment Demand Notice
                </h2>
                <p className="text-[10.5px] text-stone-500 leading-normal">
                  Custom-generate an official statutory letter reference referencing federal penal statutes to initiate recovery of receivables.
                </p>
              </div>

              <div className="space-y-3.5 pt-3">
                <div>
                  <label htmlFor="buyer-name-input" className="block text-[9px] font-black uppercase text-muted mb-1">
                    Buyer / Debtor Corporation Name
                  </label>
                  <input
                    id="buyer-name-input"
                    type="text"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="w-full bg-light-bg border border-border/15 rounded-xl px-3 py-2 text-xs font-semibold text-navy focus:outline-none"
                    placeholder="e.g. BigBuyer Pvt Ltd"
                  />
                </div>

                <div>
                  <label htmlFor="buyer-address-input" className="block text-[9px] font-black uppercase text-muted mb-1">
                    Corporate Registered Office Address
                  </label>
                  <textarea
                    id="buyer-address-input"
                    value={buyerAddress}
                    onChange={(e) => setBuyerAddress(e.target.value)}
                    rows={2}
                    className="w-full bg-light-bg border border-border/15 rounded-xl px-3 py-2 text-xs font-semibold text-navy focus:outline-none placeholder:text-stone-300"
                    placeholder="e.g. Phase 2, Industrial Sector, Mumbai"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="notice-invoice-input" className="block text-[9px] font-black uppercase text-muted mb-1">
                      Invoice Ref No
                    </label>
                    <input
                      id="notice-invoice-input"
                      type="text"
                      value={invoiceNo}
                      onChange={(e) => setInvoiceNo(e.target.value)}
                      className="w-full bg-light-bg border border-border/15 rounded-xl px-3 py-2 text-xs font-semibold text-navy focus:outline-none"
                      placeholder="INV-2026-99"
                    />
                  </div>
                  <div>
                    <label htmlFor="notice-amount-input" className="block text-[9px] font-black uppercase text-muted mb-1">
                      Invoice Total (₹)
                    </label>
                    <input
                      id="notice-amount-input"
                      type="number"
                      value={invoiceAmount}
                      onChange={(e) => setInvoiceAmount(e.target.value)}
                      className="w-full bg-light-bg border border-border/15 rounded-xl px-3 py-2 text-xs font-semibold text-navy focus:outline-none"
                      placeholder="150000"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="notice-date-input" className="block text-[9px] font-black uppercase text-muted mb-1">
                    Invoice Issue Date
                  </label>
                  <input
                    id="notice-date-input"
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    className="w-full bg-light-bg border border-border/15 rounded-xl px-3 py-2 text-xs font-semibold text-navy focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="button"
                  onClick={generateNotice}
                  className="w-full py-3 bg-[#111827] hover:bg-[#1f2937] text-white border border-gold/30 hover:border-gold rounded-xl text-[10.5px] font-black uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <FileText className="h-4 w-4" />
                  <span>Generate Demand Letter ✉</span>
                </button>
              </div>
            </div>

            {/* INTERACTIVE DEMAND LETTER DRAFT RESULT SCREEN */}
            <div className="lg:col-span-7 flex flex-col justify-between">
              {noticeGenerated ? (
                <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 shadow-inner flex flex-col justify-between h-full min-h-[380px] animate-fade-in relative">
                  
                  {/* Notice Copy Banner overlay */}
                  <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-200">
                    <span className="text-[9px] uppercase font-bold text-slate-400 flex items-center gap-1.5 leading-none">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      Legal Executive Draft (Arbitration Compliant)
                    </span>
                    <button
                      type="button"
                      onClick={() => copyNoticeToClipboard(demandNoticeTemplateText)}
                      className="px-2.5 py-1 text-[9.5px] font-bold uppercase rounded-lg border border-slate-300 hover:border-gold flex items-center gap-1 cursor-pointer transition-all hover:bg-white"
                    >
                      {copiedState ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-600" />
                          <span>Copied! / कॉपी हुआ</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3 text-gold" />
                          <span>Copy Letter / कॉपी करें</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Document container */}
                  <div className="bg-white border rounded-2xl p-4 text-[9.5px] leading-relaxed font-mono whitespace-pre-wrap text-slate-700 h-[280px] overflow-y-auto shadow-inner text-left select-text scrollbar-thin">
                    {demandNoticeTemplateText.trim()}
                  </div>

                  <p className="text-[8.5px] italic text-slate-400 mt-3 text-center">
                    Guidelines: Paste this into your corporate letterhead, sign & stamp, and send via Registered Post AD or email with acknowledgement requested.
                  </p>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-100 rounded-3xl p-8 flex flex-col items-center justify-center text-center h-full min-h-[380px] text-stone-400">
                  <FileText className="h-10 w-10 text-stone-300 mb-3 animate-pulse" />
                  <p className="text-xs font-bold text-navy">Document Draft is ready for you</p>
                  <p className="text-[10px] max-w-xs mt-1 leading-normal font-semibold">
                    Fill in the left details form and click generate. An automated legal letter complying strictly to Ministry norms will be structured.
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
