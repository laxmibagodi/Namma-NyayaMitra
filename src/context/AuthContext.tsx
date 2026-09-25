import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { 
  auth, 
  loginWithGoogle, 
  logoutUser, 
  getUserProfile, 
  saveUserProfile, 
  UserProfile,
  registerWithEmail as firebaseRegisterWithEmail,
  loginWithEmail as firebaseLoginWithEmail
} from "../services/firebase";

export type LanguageType = "English" | "Hindi" | "Kannada" | "Telugu";

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  nativeLanguage: LanguageType;
  setNativeLanguage: (lang: LanguageType) => Promise<void>;
  login: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [nativeLanguage, setNativeLanguageState] = useState<LanguageType>(() => {
    const cached = localStorage.getItem("nyayaai_language");
    if (cached === "English" || cached === "Hindi" || cached === "Kannada" || cached === "Telugu") {
      return cached;
    }
    return "English";
  });

  const setNativeLanguage = async (lang: LanguageType) => {
    setNativeLanguageState(lang);
    localStorage.setItem("nyayaai_language", lang);
    if (user && userProfile) {
      try {
        await handleUpdateProfile({ nativeLanguage: lang });
      } catch (err) {
        console.error("Failed to sync language selection to Firestore profile:", err);
      }
    }
  };

  useEffect(() => {
    // Listen to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        try {
          // Fetch or bootstrap profile structure from Firestore
          let profile = await getUserProfile(currentUser.uid);
          if (!profile) {
            // Also inherit language from guest preference stored locally
            const cachedLang = localStorage.getItem("nyayaai_language") || "English";
            profile = {
              userId: currentUser.uid,
              email: currentUser.email || "",
              displayName: currentUser.displayName || "",
              firmName: "",
              prefLanguage: cachedLang === "English" ? "en" : "both",
              nativeLanguage: cachedLang,
              joinedAt: new Date().toISOString()
            };
            await saveUserProfile(profile);
          }
          setUserProfile(profile);
          if (profile.nativeLanguage) {
            const profileLang = profile.nativeLanguage as LanguageType;
            if (["English", "Hindi", "Kannada", "Telugu"].includes(profileLang)) {
              setNativeLanguageState(profileLang);
              localStorage.setItem("nyayaai_language", profileLang);
            }
          }
        } catch (err) {
          console.error("Failed to load user profile document on login authorization:", err);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      console.error("Google Auth process failed:", err);
      setLoading(false);
      throw err;
    }
  };

  const handleLoginWithEmail = async (email: string, password: string) => {
    setLoading(true);
    try {
      await firebaseLoginWithEmail(email, password);
    } catch (err) {
      console.error("Email login failed inside provider:", err);
      setLoading(false);
      throw err;
    }
  };

  const handleRegisterWithEmail = async (email: string, password: string, name: string) => {
    setLoading(true);
    try {
      await firebaseRegisterWithEmail(email, password, name);
    } catch (err) {
      console.error("Email registration failed inside provider:", err);
      setLoading(false);
      throw err;
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logoutUser();
    } catch (err) {
      console.error("Google Sign out trigger failed:", err);
      setLoading(false);
      throw err;
    }
  };

  const handleUpdateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    try {
      await saveUserProfile({
        userId: user.uid,
        email: user.email || "",
        ...updates
      });
      setUserProfile((prev) => (prev ? { ...prev, ...updates } : null));
    } catch (err) {
      console.error("Profile updates save failure:", err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        nativeLanguage,
        setNativeLanguage,
        login: handleLogin,
        loginWithEmail: handleLoginWithEmail,
        registerWithEmail: handleRegisterWithEmail,
        logout: handleLogout,
        updateProfile: handleUpdateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be defined inside an AuthProvider wrapper.");
  }
  return context;
}
