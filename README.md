⚖️ Namma NyayaMitra (ನಮ್ಮ ನ್ಯಾಯಮಿತ್ರ / हमारा न्यायमित्र)
The Legal Shield for Indian MSMEs & Micro-Entrepreneurs
<p align="center">
<img src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80" alt="Namma NyayaMitra Banner" width="100%" style="border-radius: 12px; max-height: 420px; object-fit: cover;" />
</p>
<p align="center">
<strong>Democratizing Legal Intelligence for Kirana Stores, Micro-Manufacturers, Contractors, and Small Business Owners across India.</strong>
</p>
<p align="center">
<a href="#-key-features"><img src="https://img.shields.io/badge/Status-Production--Ready-emerald?style=for-the-badge&logo=shield" alt="Status" /></a>
<a href="https://react.dev/"><img src="https://img.shields.io/badge/Frontend-React_19-blue?style=for-the-badge&logo=react" alt="React 19" /></a>
<a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Bundler-Vite_6-646CFF?style=for-the-badge&logo=vite" alt="Vite" /></a>
<a href="https://deepmind.google/technologies/gemini/"><img src="https://img.shields.io/badge/AI_Engine-Gemini_2.5%2F3.5-orange?style=for-the-badge&logo=google" alt="Google Gemini" /></a>
<a href="https://firebase.google.com/"><img src="https://img.shields.io/badge/Auth%20%26%20DB-Firebase%20Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" /></a>
<a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Styling-Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" /></a>
</p>
📌 Table of Contents
Overview
Architecture Flowcharts
1. Comprehensive Architecture Flowchart
2. Full-Stack Data & Processing Flowchart
3. Resilient Multi-Model Failover Pipeline
4. Database & Security Flowchart
Visual Highlights & Modules
Key Features
Project Directory Structure
Supported Indian Legal Frameworks
API Endpoints Reference
VS Code Complete Setup & Running Guide
License & Disclaimer
📖 Overview
In India, over 63 million MSMEs face substantial operational and financial risks due to complex legal contracts, opaque supplier agreements, delayed payments, and unaffordable legal counsel.
Namma NyayaMitra (Our Legal Friend) bridges this justice gap by providing an end-to-end legal intelligence platform specifically engineered for Indian micro-entrepreneurs. Powered by Google Gemini and built with React 19, Express, and Firebase, it translates legal jargon into plain, actionable advice in local languages (Hindi, Kannada, Marathi, Tamil, Telugu, Gujarati, Bengali, etc.), audits contracts for hidden risks, generates enforceable agreements, and provides 24/7 crisis guidance.
🏗️ Architecture Flowcharts
1. Comprehensive Architecture Flowchart
The following flowchart outlines the entire architectural topology, displaying user interactions, client-side extraction, the Express full-stack proxy gateway on Port 3000, Google Gemini LLM processing, and Firebase persistence:
code
Mermaid
flowchart TD
    %% Styling Definitions
    classDef clientStyle fill:#1e293b,stroke:#38bdf8,stroke-width:2px,color:#fff;
    classDef serverStyle fill:#0f172a,stroke:#f59e0b,stroke-width:2px,color:#fff;
    classDef aiStyle fill:#312e81,stroke:#a855f7,stroke-width:2px,color:#fff;
    classDef dbStyle fill:#1c1917,stroke:#10b981,stroke-width:2px,color:#fff;

    subgraph CLIENT_TIER ["📱 CLIENT TIER (React 19 + Vite SPA)"]
        User(["👤 Indian MSME / Kirana Owner"]):::clientStyle
        UI["🖥️ UI Components (Tailwind CSS v4)"]:::clientStyle
        DocParser["📄 In-Browser Parsers (pdfjs-dist & mammoth)"]:::clientStyle
        AuthStore["🔑 React AuthContext (Session Management)"]:::clientStyle
        PDFGen["🖨️ jsPDF Engine (Watermarked Export)"]:::clientStyle
    end

    subgraph SERVER_GATEWAY ["⚙️ FULL-STACK SERVER GATEWAY (Express 4 on Port 3000)"]
        ServerCore["🌐 Express HTTP Server (server.ts)"]:::serverStyle
        ViteMiddleware["⚡ Vite Dev Middleware (SSR/HMR Proxy)"]:::serverStyle
        APIRouter["🔀 API Router (/api/analyze, /api/generate-template, /api/chat)"]:::serverStyle
        ResilientWrapper["🛡️ safeGenerateContent Wrapper (Retries + Fallbacks)"]:::serverStyle
        RateLimiter["📦 25MB Body Parser (Camera Base64 & Docs)"]:::serverStyle
    end

    subgraph AI_TIER ["🧠 AI INTELLIGENCE TIER (Google Gemini SDK)"]
        GeminiFlash["⚡ Gemini 2.5 Flash (Primary Low-Latency & JSON Schema)"]:::aiStyle
        GeminiPro["🔍 Gemini 2.5 Pro (Complex Legal Drafting Fallback)"]:::aiStyle
        GeminiVision["👁️ Multimodal OCR (Scanned Paper / Mobile Photos)"]:::aiStyle
        LegalPromptEngine["⚖️ Indian Legal Domain Guardrails & Multilingual Prompts"]:::aiStyle
    end

    subgraph CLOUD_PERSISTENCE ["☁️ CLOUD PERSISTENCE (Google Firebase)"]
        FBAuth["🔐 Firebase Authentication (Google OAuth + Email)"]:::dbStyle
        FirestoreDB[("🗄️ Cloud Firestore NoSQL Database")]:::dbStyle
        SecurityRules["🛡️ firestore.rules (Per-User Data Isolation)"]:::dbStyle
    end

    %% Flow Connections
    User -->|Accesses Platform| UI
    UI -->|PDF / Word Document| DocParser
    DocParser -->|Extracted Text| APIRouter
    UI -->|Photo of Paper Agreement| APIRouter
    UI <-->|Direct Sign-In / Token| FBAuth
    UI <-->|NyayaLocker Vault Sync| FirestoreDB
    FirestoreDB --- SecurityRules

    UI <-->|HTTP Requests on Port 3000| ServerCore
    ServerCore <--> ViteMiddleware
    ServerCore --> RateLimiter
    RateLimiter --> APIRouter
    APIRouter --> ResilientWrapper
    ResilientWrapper --> LegalPromptEngine
    LegalPromptEngine --> GeminiFlash
    LegalPromptEngine -.->|Failover on 503/429| GeminiPro
    LegalPromptEngine --> GeminiVision

    GeminiFlash -->|Strict JSON Audit / Draft| APIRouter
    APIRouter -->|Structured Legal Verdict| UI
    UI -->|Download Agreement| PDFGen
2. Full-Stack Data & Processing Flowchart
This flowchart illustrates the step-by-step data journey when an MSME owner submits an agreement for review:
code
Mermaid
flowchart TD
    Start([User Uploads Contract]) --> CheckType{File Type?}
    
    CheckType -->|Digital PDF / DOCX| ClientExtract[Client-side Text Extraction via pdfjs/mammoth]
    CheckType -->|Paper Stamp Document / Photo| ImgConvert[Client encodes to Base64 Image Payload]
    
    ClientExtract --> BuildPayload[Construct JSON Payload with Preferred Native Language]
    ImgConvert --> BuildPayload
    
    BuildPayload --> SendRequest[POST http://localhost:3000/api/analyze]
    
    SendRequest --> ExpressVerify{Express Server Check}
    ExpressVerify -->|Missing GEMINI_API_KEY| ErrKey[Return 500: API Key Missing Alert]
    ExpressVerify -->|Key Present| BuildPrompt[Inject Indian Contract Act 1872 & MSME Guardrails]
    
    BuildPrompt --> CallGemini[Invoke Google GenAI SDK with ResponseSchema]
    
    CallGemini --> EvalResponse{Gemini Success?}
    EvalResponse -->|Quota / 503 Spike| RetryBackoff[Exponential Backoff + Fallback Model]
    RetryBackoff --> CallGemini
    EvalResponse -->|Success| ParseJSON[Validate & Sanitize JSON Output]
    
    ParseJSON --> ReturnClient[Send Clean Structured Response to Frontend]
    
    ReturnClient --> RenderUI[Render Risk Meter, Clause Warnings, Plain English & Native Translations]
    
    RenderUI --> SaveVault{User clicks 'Save to Locker'?}
    SaveVault -->|Yes| SaveFirestore[Write to Cloud Firestore: users/{uid}/savedAnalyses]
    SaveVault -->|No| Done([Audit Complete])
    SaveFirestore --> Done
3. Resilient Multi-Model Failover Pipeline
code
Code
┌─────────────────────────────────────────────────────────────┐
│                 Incoming API Call to Server                 │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
        ┌──────────────────────────────────────────────┐
        │  Attempt 1: gemini-2.5-flash                 │ ───► [SUCCESS: Return JSON]
        └──────────────────────┬───────────────────────┘
                               │ (Fails on 503 / 429 / Quota)
                               ▼ Wait 800ms Backoff
        ┌──────────────────────────────────────────────┐
        │  Attempt 2: gemini-2.5-flash (Retry)         │ ───► [SUCCESS: Return JSON]
        └──────────────────────┬───────────────────────┘
                               │ (Fails again)
                               ▼ Wait 1200ms Backoff
        ┌──────────────────────────────────────────────┐
        │  Attempt 3: gemini-2.5-pro (Model Switch)    │ ───► [SUCCESS: Return JSON]
        └──────────────────────┬───────────────────────┘
                               │ (Fails)
                               ▼
        ┌──────────────────────────────────────────────┐
        │  Attempt 4: gemini-1.5-flash (Final Fallback)│ ───► [SUCCESS: Return JSON]
        └──────────────────────┬───────────────────────┘
                               │ (All exhausted)
                               ▼
        ┌──────────────────────────────────────────────┐
        │  Catch Block & Graceful Error Output         │
        └──────────────────────────────────────────────┘
4. Database & Security Flowchart
code
Code
Cloud Firestore (Native Mode)
 ├── users/ {uid}
 │    ├── profileData: { businessType, turnover, state, nativeLanguage }
 │    │
 │    ├── savedAnalyses/ {analysisId}
 │    │    ├── documentTitle: string
 │    │    ├── overallRiskScore: number (0-100)
 │    │    ├── overallVerdict: { english, hindi, native }
 │    │    ├── riskFlags: [ { clauseText, riskLevel, whatToDo } ]
 │    │    ├── clauseByClause: [ { clauseTitle, plainEnglish, verdict } ]
 │    │    └── createdAt: timestamp
 │    │
 │    └── savedContracts/ {contractId}
 │         ├── documentType: string
 │         ├── documentTitle: string
 │         ├── formalDraft: string
 │         ├── plainEnglishSummary: string
 │         ├── nativeSummary: string
 │         └── createdAt: timestamp
Security Invariant: Enforced via firestore.rules where request.auth.uid == userId. No user can view, edit, or delete another business owner's contracts.
📸 Visual Highlights & Modules
📑 Multilingual Document Analyzer	✍️ Bilingual Contract Generator
<img src="https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80" alt="Document Analyzer" width="100%" style="border-radius: 8px;" /><br/>Scan PDFs, DOCX, & photos of contracts for hidden traps & risk scores	<img src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80" alt="Contract Generator" width="100%" style="border-radius: 8px;" /><br/>Draft legally enforceable agreements under the Indian Contract Act 1872
🛡️ Legal Rights & Schemes Portal	🚨 Emergency Legal Crisis Assistance
<img src="https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=600&q=80" alt="Government Schemes" width="100%" style="border-radius: 8px;" /><br/>Access MSME Samadhaan, Udyam, CGTMSE, & Mudra loan roadmaps	<img src="https://images.unsplash.com/photo-1589391886645-d51941baf7fb?auto=format&fit=crop&w=600&q=80" alt="Emergency Assistance" width="100%" style="border-radius: 8px;" /><br/>Immediate protocol for police extortion, illegal shop sealing, & bounced cheques
✨ Key Features
AI Contract & Document Analyzer:
Detects unilateral termination clauses, unfair indemnities, hidden financial penalties, and unequal arbitration locations.
Calculates a numerical Risk Score (0 - 100) with clear safety verdicts.
Supports camera snaps of physical stamp papers with base64 OCR.
Bilingual Contract Generator:
Commercial Shop Lease Agreements (दुकान किराया / ಬಾಡಿಗೆ ಒಪ್ಪಂದ)
Wholesale Goods Supply Agreements (माल आपूर्ति अनुबंध)
Service & Freelance Contracts (सेवा अनुबंध)
Court-ready legal English draft with parallel simplified regional translations.
Built-in watermark styling and direct PDF download.
Domain-Locked 24/7 AI Legal Chatbot:
Communicates in Hindi, Kannada, Marathi, Tamil, Telugu, Gujarati, and Bengali.
Strict guardrails: strictly answers MSME legal queries, rights, and contract disputes.
MSME Schemes & Rights Directory:
Guidance on MSME Samadhaan (mandatory 45-day delayed payment recovery with 3x compound interest).
Zero-cost official Udyam registration guide.
Section 138 Negotiable Instruments Act notice generation for bounced cheques.
NyayaLocker Vault:
Secure personal legal dashboard with Firebase persistence.
📂 Project Directory Structure
code
Code
namma-nyayamitra/
├── .env.example               # Template environment configuration
├── firestore.rules            # Granular Firestore security rules
├── index.html                 # App entry point
├── metadata.json              # Applet identity & permissions configuration
├── package.json               # NPM packages & build scripts
├── server.ts                  # Express full-stack API server & Gemini wrapper
├── tsconfig.json              # TypeScript compilation rules
├── vite.config.ts             # Vite configuration with Tailwind CSS v4 plugin
└── src/
    ├── App.tsx                # Main container, routing, and navigation layout
    ├── index.css              # Global design system & theme focus styling
    ├── main.tsx               # DOM mount point & AuthContext provider
    ├── components/
    │   ├── FloatingChatbot.tsx # 24/7 Multilingual legal AI chat assistant
    │   ├── Footer.tsx         # Legal disclaimer & statutory notice footer
    │   ├── Navbar.tsx         # Top navigation & language switcher (EN/HI/Both)
    │   └── Sidebar.tsx        # Responsive navigation drawer
    ├── context/
    │   └── AuthContext.tsx    # Firebase Auth provider & profile state
    ├── pages/
    │   ├── About.tsx          # Platform mission & legal methodology
    │   ├── Awareness.tsx      # MSME legal literacy & rights directory
    │   ├── Dashboard.tsx      # NyayaLocker personal vault & profile manager
    │   ├── DocumentAnalyzer.tsx # Core AI risk audit & clause breakdown tool
    │   ├── EmergencyAssistance.tsx # Crisis response (sealing, extortion, police)
    │   ├── GovSchemes.tsx     # Government schemes, subsidies & Samadhaan portal
    │   ├── Home.tsx           # Landing page with interactive feature cards
    │   ├── Onboarding.tsx     # MSME business type & language onboarding
    │   └── TemplateGenerator.tsx # Bilingual contract creation & PDF exporter
    ├── services/
    │   └── firebase.ts        # Firebase client initialization & Firestore helpers
    └── utils/
        └── pdfGenerator.ts    # jsPDF client-side contract styling & export
⚖️ Supported Indian Legal Frameworks
The Indian Contract Act, 1872:
Essential elements of a valid contract (Offer, Acceptance, Consideration)
Section 23 (Lawful objects and consideration)
Section 73 & 74 (Compensation for breach of contract and liquidated damages)
Micro, Small and Medium Enterprises Development (MSMED) Act, 2006:
Section 15 & 16: Mandatory payment timeline within 45 days and compound interest penalty.
Section 18: Reference to Micro and Small Enterprises Facilitation Council (MSEFC).
Negotiable Instruments Act, 1881:
Section 138: Statutory notice periods and remedies for dishonor of cheques.
The Transfer of Property Act, 1882:
Leases of immovable property, lock-in periods, security deposit return norms.
📡 API Endpoints Reference
Method	Endpoint	Description	Payload Body
GET	/api/health	Health & uptime check	None
POST	/api/analyze	AI Contract analysis, OCR & risk audit	{ documentType, text, image, nativeLanguage }
POST	/api/generate-template	Draft customized Indian business agreement	{ documentType, formValues }
POST	/api/chat	Domain-locked legal crisis and Q&A chat	{ message, chatHistory, nativeLanguage, documentContext, chatType }
💻 VS Code Complete Setup & Running Guide
Follow these step-by-step instructions to run Namma NyayaMitra locally inside Visual Studio Code.
Step 1: Open the Project in VS Code
Launch Visual Studio Code.
Click File > Open Folder... (or press Ctrl+K Ctrl+O on Windows/Linux or Cmd+O on macOS).
Select the extracted namma-nyayamitra root directory.
Step 2: Open Integrated Terminal
Open the built-in terminal in VS Code:
Press Ctrl + ` (Backtick) on Windows/Linux or Cmd + ` on macOS.
Alternatively, select Terminal > New Terminal from the top menu bar.
Step 3: Install Required Node Packages
In the terminal, run:
code
Bash
npm install
(Ensure you have Node.js version 18 or higher installed on your computer. Check with node -v.)
Step 4: Configure the .env File
Create a new file named .env in the root folder (alongside package.json):
code
Env
# 1. Google Gemini API Key (Required for AI contract analysis and chat)
# Get a free key at: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your_actual_gemini_api_key_here

# 2. Firebase Configuration (Required for user authentication & NyayaLocker vault)
# Found under Firebase Console > Project Settings > General > Your Apps > Web app
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
Step 5: Start the Full-Stack Application
To start the application, run:
code
Bash
npm run dev
You will see the console output:
code
Code
NyayaAI Fullstack Server listening on http://0.0.0.0:3000
Now, open your web browser (Chrome, Edge, Brave, Firefox) and navigate to:
code
Code
http://localhost:3000
🚨 Critical Troubleshooting FAQ in VS Code
Q1: Why do I get "Failed to execute 'json' on 'Response': Unexpected end of JSON input"?
Root Cause: You ran npm run client or raw vite, which launched the frontend on port 5173. When you click "Analyze Document", the frontend tries to call /api/analyze, but there is no backend server running on port 5173 to handle the request!
Fix: Stop all processes (Ctrl + C) and run npm run dev. This executes tsx server.ts on port 3000, which powers both the Express API backend and Vite frontend together. Always access the app at http://localhost:3000.
Q2: Why does http://localhost:3000 show "Site can't be reached"?
Root Cause: The Node Express server is not actively running in your terminal.
Fix: In your VS Code terminal, make sure npm run dev is running without errors. If port 3000 is occupied by another process, kill it or restart VS Code.
Q3: How do I test the backend health?
Open your browser and visit:
code
Code
http://localhost:3000/api/health
If configured properly, you will receive {"status": "ok", "time": "..."}.
Recommended VS Code Extensions for this Project:
Tailwind CSS IntelliSense (by Tailwind Labs) — Autocompletes styling classes
ESLint & Prettier — Code consistency and syntax highlight
Markdown Preview Mermaid Support — Previews all the Mermaid architecture diagrams above directly inside VS Code
📜 License & Disclaimer
Legal Disclaimer: Namma NyayaMitra is an AI-driven legal literacy, review, and drafting assistance tool designed to inform and assist small business owners. It does not constitute formal legal counsel and does not create an attorney-client relationship. For high-stakes litigation or court filings, users should consult a certified Indian advocate.
Distributed under the MIT License.
<p align="center">
Built with ❤️ for Indian MSMEs & Kirana Store Owners 🇮🇳
</p>