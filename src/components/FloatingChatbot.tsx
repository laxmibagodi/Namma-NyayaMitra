import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { getAnalysisHistory, SavedAnalysis } from "../services/firebase";
import {
  MessageSquare,
  X,
  Send,
  Mic,
  MicOff,
  FolderOpen,
  Upload,
  Sparkles,
  Paperclip,
  CheckCircle,
  FileText,
  AlertCircle
} from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
}

export default function FloatingChatbot() {
  const { user, userProfile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Vault and document attachments
  const [vaultDocs, setVaultDocs] = useState<SavedAnalysis[]>([]);
  const [attachedDocText, setAttachedDocText] = useState<string>("");
  const [attachedDocTitle, setAttachedDocTitle] = useState<string>("");
  const [showAttachDialog, setShowAttachDialog] = useState(false);

  // Speech Recognition states
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Track if user is onboarded
  const isOnboarded = user && userProfile?.onboarded;

  useEffect(() => {
    if (!isOnboarded) return;

    // Load initial welcome message based on selected Native Language
    const nativeLang = userProfile?.nativeLanguage || "Hindi";
    let welcomeText = `नमस्ते ${userProfile?.displayName || ""}! मैं आपका Namma NyayaMitra कानूनी चैटबॉट हूँ। मैं आपकी मातृभाषा में सहायता करूँगा। मुझसे अपने अनुबंध के विषय में कोई भी प्रश्न पूछें।`;
    
    if (nativeLang !== "Hindi") {
      welcomeText = `Hello ${userProfile?.displayName || ""}! I am your Namma NyayaMitra legal chat assistant. I am fully trained to reply in ${nativeLang}. Feel free to ask me general business legal questions, or clip/attach documents from your vault or computer to audit them together!`;
    }

    setMessages([
      {
        id: "welcome",
        sender: "bot",
        text: welcomeText,
        timestamp: new Date()
      }
    ]);

    // Load Vault analyses
    const loadVault = async () => {
      try {
        const history = await getAnalysisHistory();
        setVaultDocs(history);
      } catch (err) {
        console.error("Chatbot: Failed fetching vault files:", err);
      }
    };
    loadVault();

    // Check Speech Recognition support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      // Configure Speech Locale based on native Language Choice!
      if (nativeLang === "Hindi") {
        rec.lang = "hi-IN";
      } else if (nativeLang === "Spanish") {
        rec.lang = "es-ES";
      } else if (nativeLang === "French") {
        rec.lang = "fr-FR";
      } else if (nativeLang === "Tamil") {
        rec.lang = "ta-IN";
      } else if (nativeLang === "Telugu") {
        rec.lang = "te-IN";
      } else {
        rec.lang = "en-IN"; // English spoken fallback
      }

      rec.onstart = () => setIsRecording(true);
      rec.onend = () => setIsRecording(false);
      rec.onerror = (e: any) => {
        console.error("Speech Recognition error:", e);
        setIsRecording(false);
      };
      rec.onresult = (e: any) => {
        const resultString = e.results[0][0].transcript;
        if (resultString) {
          setMessageText(prev => (prev ? prev + " " : "") + resultString);
        }
      };
      recognitionRef.current = rec;
    }

  }, [isOnboarded, userProfile]);

  useEffect(() => {
    if (isOpen) {
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  if (!isOnboarded) return null;

  const handleToggleRecord = () => {
    if (!speechSupported || !recognitionRef.current) {
      alert("Voice speech dictation is not supported in this browser version. (आपका ब्राउज़र वॉयस इनपुट का समर्थन नहीं करता)।");
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    const userMsgText = messageText.trim();
    const newUserMsg: Message = {
      id: Math.random().toString(),
      sender: "user",
      text: userMsgText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMsg]);
    setMessageText("");
    setIsLoading(true);

    try {
      const historyPayload = messages.map(m => ({
        sender: m.sender,
        text: m.text
      }));

      // Gather context of attached document
      let contextText = "";
      if (attachedDocText) {
        contextText += `Document Clip Attached: [${attachedDocTitle}]\n\n${attachedDocText}`;
      }

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsgText,
          chatHistory: historyPayload,
          nativeLanguage: userProfile?.nativeLanguage || "Hindi",
          documentContext: contextText,
          chatType: "general"
        })
      });

      if (!res.ok) {
        throw new Error("Chat engine returned bad response status.");
      }

      const data = await res.json();
      const botReplyMsg: Message = {
        id: Math.random().toString(),
        sender: "bot",
        text: data.reply || "Something went wrong. Let's try again.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botReplyMsg]);

    } catch (err) {
      console.error("Chat message delivery error:", err);
      setMessages(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: "bot",
          text: `Error: Unable to connect to Namma NyayaMitra servers. कृपया इंटरनेट की जांच करें और पुनः प्रयास करें। Check if your GEMINI_API_KEY is configured.`,
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Attach a document from the Secure Locker Vault
  const handleAttachFromVault = (doc: SavedAnalysis) => {
    // Reconstruct core text context of the analysis for Gemini guidance
    let context = `This is a ${doc.documentType} agreement. \n`;
    context += `Overall Risk Rating: ${doc.overallRiskScore}/100\n`;
    if (doc.riskFlags) {
      context += `Detected Risk Flags:\n`;
      doc.riskFlags.forEach((rf: any, index: number) => {
        context += `${index + 1}. Clause: "${rf.clauseText}" - Risk Level: ${rf.riskLevel}. Explanation: ${rf.riskExplanation?.english}. Suggested Fix: ${rf.whatToDo?.english}\n`;
      });
    }
    if (doc.keyObligations) {
      context += `Core Service Obligations:\n`;
      doc.keyObligations.forEach((ob: any, index: number) => {
        context += `${index + 1}. "${ob.obligation}" - Deadline: ${ob.deadline || "None"}. high Onerous concern: ${ob.isOnerous ? "Yes" : "No"}\n`;
      });
    }

    setAttachedDocText(context);
    setAttachedDocTitle(doc.fileName || `${doc.documentType}_report.pdf`);
    setShowAttachDialog(false);
  };

  // Directly upload contract file from computer as prompt context
  const handleComputerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const textVal = event.target?.result as string;
      if (textVal) {
        setAttachedDocText(textVal);
        setAttachedDocTitle(file.name);
      }
    };
    reader.readAsText(file);
    setShowAttachDialog(false);
  };

  const clearAttachment = () => {
    setAttachedDocText("");
    setAttachedDocTitle("");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans text-xs flex flex-col items-end">
      
      {/* Floating Chat Container Overlay Window */}
      {isOpen && (
        <div className="w-[325px] sm:w-[380px] h-[480px] sm:h-[530px] bg-surface border-2 border-gold/40 rounded-3xl shadow-2xl flex flex-col mb-4 overflow-hidden animate-scale-up border-b-gold">
          
          {/* Chat Window header */}
          <div className="p-4 bg-navy text-surface flex items-center justify-between border-b border-gold/20 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="bg-gold p-1.5 rounded-full text-navy shadow-lg relative">
                <Sparkles className="h-4.5 w-4.5 animate-pulse" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-navy" />
              </div>
              <div className="text-left">
                <h4 className="font-serif font-black text-xs tracking-tight text-white flex items-center gap-1">
                  Namma NyayaMitra Assistant <span className="font-serif text-[10px] text-gold font-bold">न्यायमित्र</span>
                </h4>
                <p className="text-[9px] text-gold font-semibold leading-none">
                  ⚡ Online in {userProfile?.nativeLanguage || "Hindi"}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 px-1.5 hover:bg-surface/10 rounded-lg text-muted hover:text-white transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Secure Attachment status ticker bar */}
          {attachedDocTitle && (
            <div className="bg-gold/10 px-4 py-2 border-b border-gold/20 flex items-center justify-between font-medium shrink-0 animate-fade-in text-[10px]">
              <div className="flex items-center gap-1.5 text-navy font-bold leading-none">
                <FileText className="h-3.5 w-3.5 text-gold" />
                <span className="truncate max-w-[180px]">Context: {attachedDocTitle}</span>
              </div>
              <button
                onClick={clearAttachment}
                className="text-rose-500 font-extrabold hover:underline leading-none flex items-center cursor-pointer uppercase text-[9px]"
              >
                Clear / हटाएं
              </button>
            </div>
          )}

          {/* Dialog for selecting attachment types */}
          {showAttachDialog && (
            <div className="bg-surface-2 p-4 border-b border-border/10 grid grid-cols-2 gap-2 animate-fade-in shrink-0">
              <div className="col-span-2 text-center text-[10px] pb-1 font-bold text-navy uppercase tracking-wider">
                📎 Link Document Context
              </div>
              
              {/* Box 1: Select previous analyses from Vault */}
              <div className="border border-border rounded-xl p-2 bg-surface hover:border-gold cursor-pointer transition-all flex flex-col justify-between h-20 text-left">
                <span className="text-[9px] uppercase font-bold text-muted block">1. Secure Vault</span>
                <p className="text-[10px] text-navy font-semibold line-clamp-2">Clip from secure vault history</p>
                
                <div className="mt-1 relative">
                  <select
                    onChange={(e) => {
                      const val = e.target.value;
                      const selected = vaultDocs.find(v => v.id === val);
                      if (selected) handleAttachFromVault(selected);
                    }}
                    defaultValue=""
                    className="w-full text-[9px] font-bold bg-surface-2 border rounded p-1 text-navy focus:outline-none"
                  >
                    <option value="" disabled>Select File...</option>
                    {vaultDocs.map(doc => (
                      <option key={doc.id} value={doc.id}>{doc.fileName || doc.documentType}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Box 2: Direct Local Upload */}
              <label className="border border-border rounded-xl p-2 bg-surface hover:border-gold cursor-pointer transition-all flex flex-col items-start justify-between h-20 text-left">
                <span className="text-[9px] uppercase font-bold text-muted block">2. Computer URL</span>
                <p className="text-[10px] text-navy font-semibold">Upload contract text file directly</p>
                <div className="flex items-center gap-1 bg-surface-2 p-1 rounded font-bold text-[9px] text-gold w-full justify-center">
                  <Upload className="h-3 w-3" /> Select File
                </div>
                <input
                  type="file"
                  accept=".txt,.md,.json,.pdf"
                  onChange={handleComputerUpload}
                  className="hidden"
                />
              </label>

              <button
                onClick={() => setShowAttachDialog(false)}
                className="col-span-2 py-1.5 border border-border/20 bg-surface text-center hover:bg-surface-2 font-bold text-[9px] uppercase rounded-lg"
              >
                Cancel / रद्द करें
              </button>
            </div>
          )}

          {/* Chat Messages Log Area */}
          <div className="flex-grow p-4 overflow-y-auto space-y-3.5 bg-light-bg/50 scroll-py-8">
            {messages.map((msg) => {
              const isUser = msg.sender === "user";
              return (
                <div
                  key={msg.id}
                  className={`flex ${isUser ? "justify-end" : "justify-start"} animate-fade-in`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 shadow-sm text-xs leading-relaxed text-left ${
                      isUser
                        ? "bg-gold text-navy font-semibold rounded-tr-none border border-gold/15"
                        : "bg-surface text-navy border border-border/15 rounded-tl-none font-medium text-navy/95"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <span className="text-[8px] opacity-65 block mt-1 text-right">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex justify-start animate-pulse">
                <div className="bg-surface rounded-2xl rounded-tl-none border p-3 flex items-center gap-2 text-muted">
                  <svg className="w-4 h-4 text-gold animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className="font-bold text-[10px]">Namma NyayaMitra is brainstorming...</span>
                </div>
              </div>
            )}
            <div ref={messageEndRef} />
          </div>

          {/* Form & Actions input toolbar */}
          <form onSubmit={handleSendMessage} className="p-3 bg-surface-2 border-t border-border shrink-0 space-y-2">
            
            <div className="flex items-center gap-1.5">
              
              {/* Attachment Clip button */}
              <button
                type="button"
                onClick={() => setShowAttachDialog(prev => !prev)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  attachedDocTitle 
                    ? "bg-gold/15 border-gold text-gold" 
                    : "bg-surface border-border hover:border-gold/35 text-text"
                }`}
                title="Attach text doc"
              >
                <Paperclip className="h-4.5 w-4.5" />
              </button>

              {/* Message text type input bar */}
              <div className="relative flex-grow">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder={
                    isRecording 
                      ? "Listening voice input..." 
                      : `Write query in ${userProfile?.nativeLanguage || "Hindi"}...`
                  }
                  disabled={isRecording}
                  className="w-full bg-surface border border-border rounded-xl text-xs py-3.5 pl-4 pr-10 focus:outline-none focus:border-gold text-navy font-medium shadow-inner focus:ring-1 focus:ring-gold"
                />
                
                {/* Micro Input Submit arrow */}
                {!isRecording && messageText && (
                  <button
                    type="submit"
                    className="absolute right-2 top-2 p-1.5 bg-gold hover:bg-gold-light text-navy rounded-lg shadow cursor-pointer transition-all"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Dictation voice input voice icon */}
              {speechSupported ? (
                <button
                  type="button"
                  onClick={handleToggleRecord}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer relative shadow-md ${
                    isRecording 
                      ? "bg-rose-500 border-rose-600 text-white animate-pulse" 
                      : "bg-surface border-border hover:border-gold text-navy hover:bg-gold/10"
                  }`}
                  title="Voice Input (मातृभाषा वॉयस इनपुट)"
                >
                  {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  {isRecording && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-600 border animate-ping" />
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  className="p-3.5 rounded-xl border bg-surface-2 border-border/5 text-muted opacity-40 cursor-not-allowed"
                  title="Voice not supported in this browser"
                >
                  <MicOff className="h-4 w-4" />
                </button>
              )}

            </div>

            <div className="flex items-center justify-between text-[9px] px-1 text-muted">
              <span>🗣️ Speak/Type in <strong className="text-navy">{userProfile?.nativeLanguage || "Hindi"}</strong></span>
              <span>🔒 Sandbox Active</span>
            </div>

          </form>

        </div>
      )}

      {/* Primary Rounded Toggle Floating Icon Button */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className={`p-4 bg-navy text-white rounded-full shadow-[0_4px_25px_rgba(10,37,64,0.35)] transition-all transform hover:scale-105 hover:rotate-12 cursor-pointer flex items-center justify-center border-2 border-gold/40 relative z-50 ${
          isOpen ? "bg-surface-2 text-navy hover:text-navy border-rose-500/40" : ""
        }`}
        id="floating-chatbot-trigger"
      >
        {isOpen ? (
          <X className="h-6 w-6 text-gold" />
        ) : (
          <>
            <MessageSquare className="h-6 w-6 text-gold animate-bounce" />
            <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 bg-rose-600 text-white font-extrabold text-[8px] rounded-full uppercase border-2 border-navy">
              AI Mitr
            </span>
          </>
        )}
      </button>

    </div>
  );
}
