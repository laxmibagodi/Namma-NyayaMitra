import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
// Support payload sizes up to 25MB for parsing base64 compressed photos
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb", extended: true }));

const PORT = 3000;

// Initialize GoogleGenAI client lazy / fallback
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("WARNING: GEMINI_API_KEY environment variable is not set!");
}

const ai = new GoogleGenAI({
  apiKey: apiKey || "MOCK_KEY",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Endpoint 1: Analyze Document
app.post("/api/analyze", async (req, res) => {
  try {
    const { documentType, text, image, nativeLanguage = "Hindi" } = req.body;

    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is not configured. Please add your credentials in AI Studio secrets.",
        errorHindi: "GEMINI_API_KEY कॉन्फ़िगर नहीं है। कृपया AI स्टूडियो सीक्रेट्स में अपनी क्रेडेंशियल जोड़ें।"
      });
    }

    if (!documentType) {
      return res.status(400).json({ error: "documentType is required" });
    }

    if (!text && !image) {
      return res.status(400).json({ error: "Either text or image material is required" });
    }

    let contents: any[] = [];
    if (image && image.data && image.mimeType) {
      // Vision base64 mode
      contents.push({
        inlineData: {
          mimeType: image.mimeType,
          data: image.data,
        }
      });
      contents.push(`The user has uploaded an image of a "${documentType}" content. Extract the text, perform OCR, and thoroughly examine all details for clauses, deadlines, liability, risks, and unbalanced or unfair conditions.`);
    } else {
      // General text mode
      contents.push(`Analyze this legal text of type "${documentType}":\n\n${text}`);
    }

    const systemInstruction = `You are Namma NyayaMitra, an AI legal assistant for small Indian business owners and MSME operators. Your users are Kirana shop owners, small manufacturers, and micro-entrepreneurs with no legal background. Use extremely simple language — like explaining to someone who has never read a contract before.
Always be practical and specific. Never use legal jargon without explaining it.
Always respond in the EXACT JSON format requested, complying fully with the specified responseSchema. Do not insert extra notes outside the JSON structure.

The user's preferred spoken Native Language is: **${nativeLanguage}**.
IMPORTANT REQUIREMENT: For ALL fields under the JSON schema that are labeled with "Hindi" or end with "Hindi" or "hindiSummary" (such as "hindi" in summaries, "obligationHindi", "descriptionHindi", "tipHindi", etc.), you MUST generate the content in high-quality **${nativeLanguage}** instead of Hindi!
Translate everything accurately into **${nativeLanguage}** using native terms and friendly, micro-business friendly phrasing. Keep "english" fields in clear, plain English.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            documentType: { type: Type.STRING, description: "Plain type of contract detected" },
            partiesInvolved: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "All legal parties involved"
            },
            documentSummary: {
              type: Type.OBJECT,
              properties: {
                english: { type: Type.STRING, description: "A simple English summary of the document" },
                hindi: { type: Type.STRING, description: "same summary translated in easy Hindi" }
              },
              required: ["english", "hindi"]
            },
            overallRiskScore: { type: Type.INTEGER, description: "Risk value from 0 (very safe) to 100 (highly risky/unfair)" },
            overallVerdict: {
              type: Type.OBJECT,
              properties: {
                english: { type: Type.STRING, description: "Bilingual general safety verdict" },
                hindi: { type: Type.STRING }
              },
              required: ["english", "hindi"]
            },
            riskFlags: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  clauseText: { type: Type.STRING, description: "Verbatim quote or short summary of the risky layout in the document" },
                  riskLevel: { type: Type.STRING, description: "HIGH or MEDIUM or LOW" },
                  riskExplanation: {
                    type: Type.OBJECT,
                    properties: {
                      english: { type: Type.STRING },
                      hindi: { type: Type.STRING }
                    },
                    required: ["english", "hindi"]
                  },
                  whatToDo: {
                    type: Type.OBJECT,
                    properties: {
                      english: { type: Type.STRING, description: "Specific human advice to protect themselves or request changes" },
                      hindi: { type: Type.STRING }
                    },
                    required: ["english", "hindi"]
                  }
                },
                required: ["clauseText", "riskLevel", "riskExplanation", "whatToDo"]
              }
            },
            keyObligations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  obligation: { type: Type.STRING },
                  obligationHindi: { type: Type.STRING },
                  deadline: { type: Type.STRING },
                  isOnerous: { type: Type.BOOLEAN, description: "true if this obligation is overly demanding, risky, or carries heavy penalty" }
                },
                required: ["obligation", "obligationHindi", "deadline", "isOnerous"]
              }
            },
            importantDeadlines: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  description: { type: Type.STRING },
                  descriptionHindi: { type: Type.STRING },
                  dateOrTimeframe: { type: Type.STRING }
                },
                required: ["description", "descriptionHindi", "dateOrTimeframe"]
              }
            },
            negotiationTips: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  tip: { type: Type.STRING },
                  tipHindi: { type: Type.STRING }
                },
                required: ["tip", "tipHindi"]
              }
            },
            clauseByClause: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  clauseTitle: { type: Type.STRING, description: "Clause heading or paragraph description" },
                  originalText: { type: Type.STRING, description: "Verbatim quote or short segment of the clause from the document" },
                  plainEnglish: { type: Type.STRING, description: "Literal, extremely simple Plain English translation/explanation. Clear and easy to understand." },
                  nativeLanguageExplanation: { type: Type.STRING, description: "The explanation of the clause in the native language preferred by the user (which is ${nativeLanguage})." },
                  riskEnglish: { type: Type.STRING, description: "Explain any potential risks, liabilities, or concerns hidden in this clause in simple English. If safe, write 'No significant risk identified'" },
                  riskNative: { type: Type.STRING, description: "Explain potential risks/concerns in the preferred native language (${nativeLanguage})." },
                  suggestionEnglish: { type: Type.STRING, description: "Practical suggestion/negotiation recommendation in simple English on what the user should do about this risk." },
                  suggestionNative: { type: Type.STRING, description: "Practical recommendation/fix in preferred native language (${nativeLanguage})." },
                  verdict: { type: Type.STRING, description: "SAFE, NEUTRAL, CONCERN, or DANGEROUS" }
                },
                required: ["clauseTitle", "originalText", "plainEnglish", "nativeLanguageExplanation", "riskEnglish", "riskNative", "suggestionEnglish", "suggestionNative", "verdict"]
              },
              description: "Clause by clause breakdown of the general document"
            }
          },
          required: [
            "documentType",
            "partiesInvolved",
            "documentSummary",
            "overallRiskScore",
            "overallVerdict",
            "riskFlags",
            "keyObligations",
            "importantDeadlines",
            "negotiationTips",
            "clauseByClause"
          ]
        }
      }
    });

    const textOutput = response.text || "";
    try {
      const parsed = JSON.parse(textOutput);
      res.json(parsed);
    } catch (err) {
      console.error("JSON parse error, text was:", textOutput);
      const cleanedText = textOutput.replace(/```json/g, "").replace(/```/g, "").trim();
      const match = cleanedText.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          const secondTry = JSON.parse(match[0]);
          return res.json(secondTry);
        } catch (e) {}
      }
      throw new Error("AI output was not in standard JSON format");
    }

  } catch (err: any) {
    console.error("Analysis route logic error:", err);
    res.status(500).json({ error: err.message || "Something went wrong during analysis." });
  }
});

// Endpoint 2: Generate Template
app.post("/api/generate-template", async (req, res) => {
  try {
    const { documentType, formValues } = req.body;

    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is not configured in secrets.",
        errorHindi: "GEMINI_API_KEY कॉन्फ़िगर नहीं है।"
      });
    }

    if (!documentType || !formValues) {
      return res.status(400).json({ error: "documentType and formValues are required" });
    }

    const fieldLines = Object.entries(formValues)
      .map(([key, value]) => `* ${key}: ${value}`)
      .join("\n");

    const systemInstruction = `You are a legal document drafting assistant for Indian MSMEs. Generate professional, legally sound Indian contract agreements.
Use high-quality formal legal English for the contract template itself (documentBody). It must comply with Indian contract law (including Indian Contract Act 1872).
Provide proper serial number clauses, witness statements, signature sections, and jurisdiction headings.
Alongside the custom formal English contract, provide human-friendly explanations and simple bilingual summaries in both English and Hindi.
Always respond in the EXACT JSON format requested matching the specified responseSchema.`;

    const promptMessage = `Draft of Document Type: ${documentType}

Parameters submitted by User:
${fieldLines}

Generate a complete documentBody with formal legal wording. Break clauses with \\n. Return details matching the responseSchema precisely.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptMessage,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            documentTitle: { type: Type.STRING },
            documentBody: { type: Type.STRING, description: "Full legal draft with proper clause styling and line breaks " },
            plainEnglishSummary: { type: Type.STRING, description: "Simple human translation what this means, 3-4 sentences" },
            hindiSummary: { type: Type.STRING, description: "Simplified Hindi translation of the outline" },
            keyProtections: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Major guardrails or features that secure the user"
            },
            importantReminder: { type: Type.STRING, description: "Warning reminder or signing precaution in English" },
            importantReminderHindi: { type: Type.STRING, description: "Warning reminder in Hindi" }
          },
          required: [
            "documentTitle",
            "documentBody",
            "plainEnglishSummary",
            "hindiSummary",
            "keyProtections",
            "importantReminder",
            "importantReminderHindi"
          ]
        }
      }
    });

    const textOutput = response.text || "";
    try {
      const parsed = JSON.parse(textOutput);
      res.json(parsed);
    } catch (err) {
      console.error("JSON parse error inside Template Generator route, text was:", textOutput);
      const cleanedText = textOutput.replace(/```json/g, "").replace(/```/g, "").trim();
      const match = cleanedText.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          const secondTry = JSON.parse(match[0]);
          return res.json(secondTry);
        } catch (e) {}
      }
      throw new Error("AI output was not in correct JSON schema");
    }

  } catch (err: any) {
    console.error("Template drafting custom route error:", err);
    res.status(500).json({ error: err.message || "Failed to draft contract." });
  }
});

// Endpoint 3: Floating Legal Chatbot (supports chosen native language conversations with strict domain specific context)
app.post("/api/chat", async (req, res) => {
  try {
    const { message, chatHistory = [], nativeLanguage = "Hindi", documentContext = "", chatType = "general" } = req.body;

    if (!apiKey) {
      return res.status(500).json({ error: "Gemini API key is not configured inside server credentials." });
    }

    if (!message) {
      return res.status(400).json({ error: "message parameter is required" });
    }

    let systemInstruction = "";

    if (chatType === "schemes") {
      systemInstruction = `You are Namma NyayaMitra's Specialized Government Scheme and MSME benefits consultant.
Your sole purpose is to provide friendly, clear guidance exclusively on Indian Government Schemes, MSME benefits, subsidies, grants, loans, eligibility, registry processes (such as Udyam), or small business registry/scheme assistance.

CRITICAL SECURITY AND RELEVANCY RULE:
- If the user asks ANY question or inputs ANY request that is outside of MSME / Government Schemes (for example, "generate python concept", "write python code", "teach me cooking", "java instructions", "who is the prime minister of spain", "translate this random non-business text", or any other off-topic general/technical domain), you MUST politely and firmly decline.
- In case of an out-of-context query, you MUST reply: "Sorry, I cannot help with that query. I am here solely to provide MSME and government scheme assistance." (rendered elegantly in the user's preferred native language: ${nativeLanguage}). Do NOT answer the query, do NOT write any code, and do NOT explain unrelated topics.

Your current user speaks the native language: **${nativeLanguage}**. 
CRITICAL: You MUST answer and communicate and converse exclusively in high-quality, polite, conversational **${nativeLanguage}**!
If the user's input/query is in a mixture of English/Hindi/other, still ensure that your complete response is written in highly fluent **${nativeLanguage}**.`;
    } else if (chatType === "emergency") {
      systemInstruction = `You are Namma NyayaMitra's Urgent Legal Crisis and Emergency Assistance system.
Your sole purpose is to provide immediate legal-emergency triage advice and protective steps for Indian proprietary firms, small manufacturing, and shopkeepers in crises (such as police harassment, lockouts, illegal business sealing, direct extortion, vendor fraud, sudden contract breach).

CRITICAL SECURITY AND RELEVANCY RULE:
- If the user asks ANY question or inputs ANY request that is outside of legal emergencies and commercial crises (for example, "generate python concept", "write python code", "solve math", "make a program in java", "recipes for burger", "write a poem", or any other off-topic general/technical domain), you MUST politely and firmly decline.
- In case of an out-of-context query, you MUST reply: "Sorry, I cannot help with that query. I am here solely to assist with urgent legal emergencies and immediate crises." (rendered elegantly in the user's preferred native language: ${nativeLanguage}). Do NOT answer the query, do NOT write any code, and do NOT explain unrelated topics.

Your current user speaks the native language: **${nativeLanguage}**. 
CRITICAL: You MUST answer and communicate and converse exclusively in high-quality, polite, conversational **${nativeLanguage}**!`;
    } else {
      systemInstruction = `You are Namma NyayaMitra, a friendly, highly protective, and experienced legal expert chatbot specializing in protecting Indian MSMEs, shopkeepers, contractors, and freelancers under Indian Contract law and business regulations.
Your purpose is to provide assistance and advice exclusively on legal guidance, business contracts, clause reviews, liability, risk advisory, or business-related legal disputes.

CRITICAL SECURITY AND RELEVANCY RULE:
- If the user asks ANY question or inputs ANY request that is outside of business contracts, MSME legal guidance, clause reviews, and risk advisory (for example, "generate python concept", "write python code", "cooking recipe", "what is photosynthesis", "solve equations", or any other off-topic general/technical domain), you MUST politely and firmly decline.
- In case of an out-of-context query, you MUST reply: "Sorry, I cannot help with that query. I am here solely to assist you with business contracts, clause reviews, risk audits, and MSME legal advisory." (rendered elegantly in the user's preferred native language: ${nativeLanguage}). Do NOT answer the query, do NOT write any code, and do NOT explain unrelated topics.

Your current user speaks the native language: **${nativeLanguage}**. 
CRITICAL: You MUST answer and communicate and converse exclusively in high-quality, polite, conversational **${nativeLanguage}**!
If the user's input/query is in a mixture of English/Hindi/other, still ensure that your complete response is written in highly fluent **${nativeLanguage}**.
If a secure uploaded document is being discussed, keep the details below as your core context (focus on identifying risk clauses, obligations, and explaining them to them in a friendly protective way).
Document Context (if any):
"""
${documentContext}
"""`;
    }

    let contents: any[] = [];
    
    // Inject chatHistory (convert schema to Gemini format)
    chatHistory.slice(-8).forEach((turn: any) => {
      // turn.sender can be "user" or "bot" or "model"
      const role = turn.sender === "user" ? "user" : "model";
      contents.push({
        role: role,
        parts: [{ text: turn.text }]
      });
    });

    // Final prompt with query message
    let promptText = "";
    if (documentContext) {
      promptText += `We are discussing the uploaded contract file. Keep this in mind when explaining.\n`;
    }
    promptText += `User query: "${message}"\nRemember: Respond 100% in polished, protective, business-friendly, spoken ${nativeLanguage}:`;

    contents.push({
      role: "user",
      parts: [{ text: promptText }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    const reply = response.text || "Processed correctly.";
    res.json({ reply });

  } catch (err: any) {
    console.error("Legal Chatbot execution error:", err);
    res.status(500).json({ error: err.message || "Failed to process chat conversation." });
  }
});

// Vite server linkage
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Namma NyayaMitra Fullstack Server listening on http://0.0.0.0:${PORT}`);
  });
}

start();
