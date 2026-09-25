import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile as updateAuthProfile
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  getDocFromServer, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  collection, 
  query, 
  where, 
  orderBy 
} from "firebase/firestore";
// @ts-ignore
import firebaseConfig from "../../firebase-applet-config.json";

// Initialize Firebase client
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); /* CRITICAL: The app will break without this line */
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Operational enums for error wrapping
export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write"
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

/**
 * Handle firestore operations failure strictly wrapping responses into raw JSON strings matching requirements.
 */
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email
      })) || []
    },
    operationType,
    path
  };
  console.error("Firestore Error wrapped message: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Validate connection to Firestore on initialization
 */
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
    console.log("Firestore initial diagnostic connection tested successfully.");
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.warn("Firestore client appears offline. Please verify Firebase setup.");
    }
  }
}

// Trigger initial system check
testConnection();

// --- Auth Popup helper triggers ---

export async function loginWithGoogle(): Promise<User> {
  try {
    googleProvider.setCustomParameters({ prompt: "select_account" });
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Popup Authentication failed:", error);
    throw error;
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Signout trigger failed:", error);
    throw error;
  }
}

export async function registerWithEmail(email: string, password: string, name: string): Promise<User> {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    if (name) {
      await updateAuthProfile(result.user, { displayName: name });
    }
    return result.user;
  } catch (error) {
    console.error("Email registration process failed:", error);
    throw error;
  }
}

export async function loginWithEmail(email: string, password: string): Promise<User> {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error("Email login process failed:", error);
    throw error;
  }
}

// --- User Profile service helper triggers ---

export interface UserProfile {
  userId: string;
  email: string;
  displayName: string | null;
  firmName?: string;
  prefLanguage?: "both" | "en" | "hi";
  joinedAt?: string;
  onboarded?: boolean;
  stakeholderType?: string;
  nativeLanguage?: string;
  businessCategory?: string;
  stakeholderIntent?: string;
}

export async function saveUserProfile(profile: Partial<UserProfile> & { userId: string }): Promise<void> {
  const path = `users/${profile.userId}`;
  try {
    const userDocRef = doc(db, "users", profile.userId);
    
    // Prepare clean update payload, discarding undefined fields to prevent Firestore SDK validation errors
    const cleanedData: Record<string, any> = {};
    Object.entries(profile).forEach(([key, val]) => {
      if (val !== undefined) {
        cleanedData[key] = val;
      }
    });

    // Fallback: Default email on creation if not already present
    if (!cleanedData.email && auth.currentUser?.email) {
      cleanedData.email = auth.currentUser.email;
    }

    // Cache locally first
    const cachedProfileStr = localStorage.getItem(`nyayaai_profile_${profile.userId}`);
    const mergedCache = cachedProfileStr ? { ...JSON.parse(cachedProfileStr), ...cleanedData } : cleanedData;
    localStorage.setItem(`nyayaai_profile_${profile.userId}`, JSON.stringify(mergedCache));

    await setDoc(userDocRef, cleanedData, { merge: true });
  } catch (err) {
    if (err instanceof Error && (err.message.includes("offline") || err.message.includes("Could not reach") || err.message.includes("failed to get") || err.message.includes("Internet connection"))) {
      console.warn("Firestore saveUserProfile offline fallback active: saved to local cache only.");
      return;
    }
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const path = `users/${userId}`;
  const cachedProfileStr = localStorage.getItem(`nyayaai_profile_${userId}`);
  let cachedProfile: UserProfile | null = null;
  if (cachedProfileStr) {
    try {
      cachedProfile = JSON.parse(cachedProfileStr) as UserProfile;
    } catch (e) {
      console.error("Failed to parse cached profile:", e);
    }
  }

  try {
    const userDocRef = doc(db, "users", userId);
    const snap = await getDoc(userDocRef);
    if (!snap.exists()) {
      return cachedProfile;
    }
    const profileData = snap.data() as UserProfile;
    localStorage.setItem(`nyayaai_profile_${userId}`, JSON.stringify(profileData));
    return profileData;
  } catch (err) {
    if (err instanceof Error && (err.message.includes("offline") || err.message.includes("Could not reach") || err.message.includes("failed to get") || err.message.includes("Internet connection"))) {
      console.warn("Firestore getUserProfile offline fallback active: loading cached or default profile.");
      if (cachedProfile) {
        return cachedProfile;
      }
      const fallback: UserProfile = {
        userId,
        email: auth.currentUser?.email || "",
        displayName: auth.currentUser?.displayName || "NyayaAI Member",
        firmName: "",
        prefLanguage: "both",
        joinedAt: new Date().toISOString(),
        onboarded: true,
        stakeholderType: "MSME Owner",
        nativeLanguage: "English"
      };
      return fallback;
    }
    console.warn("Firestore connection issue during getUserProfile, returning fallback", err);
    return cachedProfile || {
      userId,
      email: auth.currentUser?.email || "",
      displayName: auth.currentUser?.displayName || "NyayaAI Member",
      firmName: "",
      prefLanguage: "both",
      joinedAt: new Date().toISOString(),
      onboarded: true,
      stakeholderType: "MSME Owner",
      nativeLanguage: "English"
    };
  }
}

// --- Document Analysis History Operations ---

export interface SavedAnalysis {
  id: string;
  userId: string;
  fileName: string;
  documentType: string;
  overallRiskScore: number;
  overallVerdict: { english: string; hindi: string };
  partiesInvolved: string[];
  riskFlags: any[];
  keyObligations: any[];
  importantDeadlines: any[];
  negotiationTips: any[];
  analyzedAt: string;
  clauseByClause?: any[];
}

export async function saveAnalysisResult(analysis: Omit<SavedAnalysis, "userId">): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Unauthenticated request. Cannot save analysis.");

  const path = `analyses/${analysis.id}`;
  const completeAnalysis: SavedAnalysis = {
    ...analysis,
    userId: uid
  };

  // Cache locally
  const cachedAnalysesStr = localStorage.getItem(`nyayaai_analyses_${uid}`) || "[]";
  try {
    const cachedAnalyses = JSON.parse(cachedAnalysesStr);
    const updated = [completeAnalysis, ...cachedAnalyses.filter((a: any) => a.id !== analysis.id)];
    localStorage.setItem(`nyayaai_analyses_${uid}`, JSON.stringify(updated));
  } catch {}

  try {
    const docRef = doc(db, "analyses", analysis.id);
    await setDoc(docRef, completeAnalysis);
  } catch (err) {
    if (err instanceof Error && (err.message.includes("offline") || err.message.includes("Could not reach") || err.message.includes("failed to get") || err.message.includes("Internet connection"))) {
      console.warn("Firestore saveAnalysisResult offline fallback active: saved to local cache only.");
      return;
    }
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function getAnalysisHistory(): Promise<SavedAnalysis[]> {
  const uid = auth.currentUser?.uid;
  if (!uid) return [];

  const path = "analyses";
  const cachedAnalysesStr = localStorage.getItem(`nyayaai_analyses_${uid}`);
  let cachedAnalyses: SavedAnalysis[] = [];
  if (cachedAnalysesStr) {
    try {
      cachedAnalyses = JSON.parse(cachedAnalysesStr);
    } catch {}
  }

  try {
    const collRef = collection(db, "analyses");
    const q = query(collRef, where("userId", "==", uid), orderBy("analyzedAt", "desc"));
    const snap = await getDocs(q);
    const results: SavedAnalysis[] = [];
    snap.forEach((d) => {
      results.push(d.data() as SavedAnalysis);
    });
    localStorage.setItem(`nyayaai_analyses_${uid}`, JSON.stringify(results));
    return results;
  } catch (err) {
    console.warn("Failed to get analyses history from Firestore, using cached or fallback:", err);
    return cachedAnalyses;
  }
}

export async function deleteAnalysisResult(id: string): Promise<void> {
  const uid = auth.currentUser?.uid;
  const path = `analyses/${id}`;
  
  if (uid) {
    const cachedAnalysesStr = localStorage.getItem(`nyayaai_analyses_${uid}`) || "[]";
    try {
      const cachedAnalyses = JSON.parse(cachedAnalysesStr);
      const updated = cachedAnalyses.filter((a: any) => a.id !== id);
      localStorage.setItem(`nyayaai_analyses_${uid}`, JSON.stringify(updated));
    } catch {}
  }

  try {
    await deleteDoc(doc(db, "analyses", id));
  } catch (err) {
    if (err instanceof Error && (err.message.includes("offline") || err.message.includes("Could not reach") || err.message.includes("failed to get") || err.message.includes("Internet connection"))) {
      console.warn("Firestore deleteAnalysisResult offline fallback active: deleted from local cache.");
      return;
    }
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// --- Generated Contracts Drafts History Operations ---

export interface SavedContract {
  id: string;
  userId: string;
  documentTitle: string;
  documentBody: string;
  plainEnglishSummary: string;
  hindiSummary: string;
  keyProtections: string[];
  importantReminder: string;
  importantReminderHindi: string;
  formValues: Record<string, string>;
  createdAt: string;
}

export async function saveDraftContract(contract: Omit<SavedContract, "userId">): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Unauthenticated request. Cannot save draft.");

  const path = `contracts/${contract.id}`;
  const completeContract: SavedContract = {
    ...contract,
    userId: uid
  };

  // Cache locally
  const cachedContractsStr = localStorage.getItem(`nyayaai_contracts_${uid}`) || "[]";
  try {
    const cachedContracts = JSON.parse(cachedContractsStr);
    const updated = [completeContract, ...cachedContracts.filter((c: any) => c.id !== contract.id)];
    localStorage.setItem(`nyayaai_contracts_${uid}`, JSON.stringify(updated));
  } catch {}

  try {
    const docRef = doc(db, "contracts", contract.id);
    await setDoc(docRef, completeContract);
  } catch (err) {
    if (err instanceof Error && (err.message.includes("offline") || err.message.includes("Could not reach") || err.message.includes("failed to get") || err.message.includes("Internet connection"))) {
      console.warn("Firestore saveDraftContract offline fallback active: saved to local cache only.");
      return;
    }
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function getContractsDraftHistory(): Promise<SavedContract[]> {
  const uid = auth.currentUser?.uid;
  if (!uid) return [];

  const path = "contracts";
  const cachedContractsStr = localStorage.getItem(`nyayaai_contracts_${uid}`);
  let cachedContracts: SavedContract[] = [];
  if (cachedContractsStr) {
    try {
      cachedContracts = JSON.parse(cachedContractsStr);
    } catch {}
  }

  try {
    const collRef = collection(db, "contracts");
    const q = query(collRef, where("userId", "==", uid), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    const results: SavedContract[] = [];
    snap.forEach((d) => {
      results.push(d.data() as SavedContract);
    });
    localStorage.setItem(`nyayaai_contracts_${uid}`, JSON.stringify(results));
    return results;
  } catch (err) {
    console.warn("Failed to get contract draft history from Firestore, using cached or fallback:", err);
    return cachedContracts;
  }
}

export async function deleteContractDraft(id: string): Promise<void> {
  const uid = auth.currentUser?.uid;
  const path = `contracts/${id}`;

  if (uid) {
    const cachedContractsStr = localStorage.getItem(`nyayaai_contracts_${uid}`) || "[]";
    try {
      const cachedContracts = JSON.parse(cachedContractsStr);
      const updated = cachedContracts.filter((c: any) => c.id !== id);
      localStorage.setItem(`nyayaai_contracts_${uid}`, JSON.stringify(updated));
    } catch {}
  }

  try {
    await deleteDoc(doc(db, "contracts", id));
  } catch (err) {
    if (err instanceof Error && (err.message.includes("offline") || err.message.includes("Could not reach") || err.message.includes("failed to get") || err.message.includes("Internet connection"))) {
      console.warn("Firestore deleteContractDraft offline fallback active: deleted from local cache.");
      return;
    }
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// --- Lawyer Appointment Bookings Operations ---

export interface SavedAppointment {
  id: string;
  userId: string;
  lawyerId: string;
  lawyerName: string;
  specialization: string;
  date: string;
  timeSlot: string;
  status: "upcoming" | "completed" | "cancelled";
  analysisIdShared: string | null;
  analysisFileNameShared: string | null;
  aiSummaryShared: string;
  notes: string;
  videoLink: string;
  createdAt: string;
  feedbackRating?: number;
  feedbackComment?: string;
  feedbackSubmittedAt?: string;
}

export async function updateAppointmentFeedback(apptId: string, rating: number, comment: string): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Unauthenticated. Cannot submit feedback.");

  const path = `appointments/${apptId}`;
  
  // Cache update locally
  const cachedApptsStr = localStorage.getItem(`nyayaai_appts_${uid}`) || "[]";
  try {
    const cachedAppts = JSON.parse(cachedApptsStr) as SavedAppointment[];
    const updated = cachedAppts.map((appt) => {
      if (appt.id === apptId) {
        return {
          ...appt,
          feedbackRating: rating,
          feedbackComment: comment,
          feedbackSubmittedAt: new Date().toISOString()
        };
      }
      return appt;
    });
    localStorage.setItem(`nyayaai_appts_${uid}`, JSON.stringify(updated));
  } catch {}

  try {
    const docRef = doc(db, "appointments", apptId);
    await setDoc(docRef, {
      feedbackRating: rating,
      feedbackComment: comment,
      feedbackSubmittedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    if (err instanceof Error && (err.message.includes("offline") || err.message.includes("Could not reach") || err.message.includes("failed to get") || err.message.includes("Internet connection"))) {
      console.warn("Firestore updateAppointmentFeedback offline fallback active: saved to local cache.");
      return;
    }
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function saveAppointment(app: Omit<SavedAppointment, "userId">): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Unauthenticated request. Cannot book appointment.");

  const path = `appointments/${app.id}`;
  const completeAppt: SavedAppointment = {
    ...app,
    userId: uid
  };

  // Cache locally
  const cachedApptsStr = localStorage.getItem(`nyayaai_appts_${uid}`) || "[]";
  try {
    const cachedAppts = JSON.parse(cachedApptsStr);
    const updated = [completeAppt, ...cachedAppts.filter((a: any) => a.id !== app.id)];
    localStorage.setItem(`nyayaai_appts_${uid}`, JSON.stringify(updated));
  } catch {}

  try {
    const docRef = doc(db, "appointments", app.id);
    await setDoc(docRef, completeAppt);
  } catch (err) {
    if (err instanceof Error && (err.message.includes("offline") || err.message.includes("Could not reach") || err.message.includes("failed to get") || err.message.includes("Internet connection"))) {
      console.warn("Firestore saveAppointment offline fallback active: saved to local cache only.");
      return;
    }
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function getAppointments(): Promise<SavedAppointment[]> {
  const uid = auth.currentUser?.uid;
  if (!uid) return [];

  const path = "appointments";
  const cachedApptsStr = localStorage.getItem(`nyayaai_appts_${uid}`);
  let cachedAppts: SavedAppointment[] = [];
  if (cachedApptsStr) {
    try {
      cachedAppts = JSON.parse(cachedApptsStr);
    } catch {}
  }

  try {
    const collRef = collection(db, "appointments");
    const q = query(collRef, where("userId", "==", uid), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    const results: SavedAppointment[] = [];
    snap.forEach((d) => {
      results.push(d.data() as SavedAppointment);
    });
    localStorage.setItem(`nyayaai_appts_${uid}`, JSON.stringify(results));
    return results;
  } catch (err) {
    console.warn("Appointments index is syncing or client is offline, continuing with fallback/cache.");
    try {
      const simpleQ = query(collection(db, "appointments"), where("userId", "==", uid));
      const simpleSnap = await getDocs(simpleQ);
      const results: SavedAppointment[] = [];
      simpleSnap.forEach((d) => {
        results.push(d.data() as SavedAppointment);
      });
      const sorted = results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      localStorage.setItem(`nyayaai_appts_${uid}`, JSON.stringify(sorted));
      return sorted;
    } catch {
      return cachedAppts;
    }
  }
}

// --- Direct Lawyer Chat Operations ---

export interface SavedChatMessage {
  id: string;
  userId: string;
  lawyerId: string;
  messageText: string;
  sender: "user" | "lawyer";
  timestamp: string;
}

export async function saveChatMessage(chat: Omit<SavedChatMessage, "userId">): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Unauthenticated context. Cannot send message.");

  const path = `chats/${chat.id}`;
  const completeChat: SavedChatMessage = {
    ...chat,
    userId: uid
  };

  // Cache locally
  const cachedChatsStr = localStorage.getItem(`nyayaai_chats_${uid}_${chat.lawyerId}`) || "[]";
  try {
    const cachedChats = JSON.parse(cachedChatsStr);
    const updated = [...cachedChats, completeChat];
    localStorage.setItem(`nyayaai_chats_${uid}_${chat.lawyerId}`, JSON.stringify(updated));
  } catch {}

  try {
    const docRef = doc(db, "chats", chat.id);
    await setDoc(docRef, completeChat);
  } catch (err) {
    if (err instanceof Error && (err.message.includes("offline") || err.message.includes("Could not reach") || err.message.includes("failed to get") || err.message.includes("Internet connection"))) {
      console.warn("Firestore saveChatMessage offline fallback active.");
      return;
    }
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function getChatMessages(lawyerId: string): Promise<SavedChatMessage[]> {
  const uid = auth.currentUser?.uid;
  if (!uid) return [];

  const path = "chats";
  const cachedChatsStr = localStorage.getItem(`nyayaai_chats_${uid}_${lawyerId}`);
  let cachedChats: SavedChatMessage[] = [];
  if (cachedChatsStr) {
    try {
      cachedChats = JSON.parse(cachedChatsStr);
    } catch {}
  }

  try {
    const collRef = collection(db, "chats");
    const q = query(collRef, where("userId", "==", uid), where("lawyerId", "==", lawyerId));
    const snap = await getDocs(q);
    const results: SavedChatMessage[] = [];
    snap.forEach((d) => {
      results.push(d.data() as SavedChatMessage);
    });
    const sorted = results.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    localStorage.setItem(`nyayaai_chats_${uid}_${lawyerId}`, JSON.stringify(sorted));
    return sorted;
  } catch (err) {
    console.warn("Failed to get chat messages, using cached fallback:", err);
    return cachedChats;
  }
}
