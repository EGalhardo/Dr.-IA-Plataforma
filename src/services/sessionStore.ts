import React, { createContext, useContext, useState, useEffect } from "react";
import { SessionUser, ActiveProfile, AppMode } from "../types";
import { MOCK_SESSION_USER, MOCK_SESSION_PROFILES } from "../constants/mocks";

// Canonical Session User: Edlasio Galhardo
export const CANONICAL_USER: SessionUser = MOCK_SESSION_USER;

// Available profiles mapped to user
export const PROFILES_MAP: Record<AppMode, ActiveProfile> = MOCK_SESSION_PROFILES;

interface SessionContextType {
  user: SessionUser;
  activeProfile: ActiveProfile;
  appMode: AppMode;
  isEmergencyActive: boolean;
  setAppMode: (mode: AppMode) => void;
  updateUserFields: (fields: Partial<SessionUser>) => void;
  hasPermission: (permission: string) => boolean;
  toggleEmergency: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const sanitizeSessionUser = (candidate: any): SessionUser => {
    let avatar = candidate?.avatarUrl || CANONICAL_USER.avatarUrl;
    if (avatar && (avatar.includes("sxWsYGX2") || avatar.includes("foto_perfil_edlasio"))) {
      avatar = "https://i.postimg.cc/J73QvnGv/Foto-Edlasio.png";
    }
    return {
      ...CANONICAL_USER,
      ...(candidate || {}),
      id: candidate?.id || CANONICAL_USER.id,
      name: "Edlasio Galhardo",
      firstName: "Edlasio",
      lastName: "Galhardo",
      bi: candidate?.bi || CANONICAL_USER.bi,
      nif: candidate?.nif || CANONICAL_USER.nif,
      passport: candidate?.passport || CANONICAL_USER.passport,
      phone: candidate?.phone || CANONICAL_USER.phone,
      email: candidate?.email || CANONICAL_USER.email,
      birthDate: candidate?.birthDate || CANONICAL_USER.birthDate,
      filiation: candidate?.filiation || CANONICAL_USER.filiation,
      maritalStatus: candidate?.maritalStatus || CANONICAL_USER.maritalStatus,
      avatarUrl: avatar,
      verificationLevel: candidate?.verificationLevel || CANONICAL_USER.verificationLevel,
      confidenceScore: candidate?.confidenceScore || CANONICAL_USER.confidenceScore,
      lastAccess: candidate?.lastAccess || CANONICAL_USER.lastAccess,
      theme: candidate?.theme || "light",
    };
  };

  const [user, setUser] = useState<SessionUser>(() => {
    const saved = localStorage.getItem("dria_session_user");
    if (saved) {
      try {
        return sanitizeSessionUser(JSON.parse(saved));
      } catch (e) {
        // ignore
      }
    }
    return CANONICAL_USER;
  });

  const [appMode, setAppModeState] = useState<AppMode>(() => {
    const stored = localStorage.getItem("gov_app_mode");
    // Validate against known profiles: a stale/invalid value in localStorage
    // would make PROFILES_MAP[appMode] undefined and crash the whole app on load.
    return stored && stored in PROFILES_MAP ? (stored as AppMode) : "user";
  });

  const [isEmergencyActive, setIsEmergencyActive] = useState(() => {
    return localStorage.getItem("gov_emergency_mode") === "true";
  });

  const activeProfile = PROFILES_MAP[appMode];

  // Sync state changes with localStorage and sync with legacy names to keep existing app logic fully compatible
  useEffect(() => {
    localStorage.setItem("dria_session_user", JSON.stringify(user));
    
    // Sync to legacy standard variables so components that read from localStorage don't break
    localStorage.setItem("dria_profile_name", user.name);
    localStorage.setItem("dria_bi", user.bi);
    localStorage.setItem("dria_phone", user.phone);
    localStorage.setItem("dria_nif", user.nif);
    localStorage.setItem("dria_passport", user.passport);
    localStorage.setItem("dria_birth_date", user.birthDate);
    localStorage.setItem("dria_filiation", user.filiation);
    localStorage.setItem("dria_marital_status", user.maritalStatus);
    localStorage.setItem("dria_verification_status", user.verificationLevel);
  }, [user]);

  useEffect(() => {
    localStorage.setItem("gov_app_mode", appMode);
  }, [appMode]);

  useEffect(() => {
    localStorage.setItem("gov_emergency_mode", String(isEmergencyActive));
  }, [isEmergencyActive]);

  const setAppMode = (mode: AppMode) => {
    setAppModeState(mode);
    setUser(prev => sanitizeSessionUser(prev));
  };

  const updateUserFields = (fields: Partial<SessionUser>) => {
    setUser(prev => {
      const updated = sanitizeSessionUser({ ...prev, ...fields });
      // Keep name unifiable split if full name updated
      if (fields.name) {
        const parts = fields.name.trim().split(" ");
        updated.firstName = parts[0] || prev.firstName;
        updated.lastName = parts[parts.length - 1] || prev.lastName;
      }
      return updated;
    });
  };

  const hasPermission = (permission: string): boolean => {
    if (activeProfile.permissions.includes("all_access")) return true;
    return activeProfile.permissions.includes(permission);
  };

  const toggleEmergency = () => {
    setIsEmergencyActive(prev => !prev);
  };

  return React.createElement(
    SessionContext.Provider,
    {
      value: {
        user,
        activeProfile,
        appMode,
        isEmergencyActive,
        setAppMode,
        updateUserFields,
        hasPermission,
        toggleEmergency
      }
    },
    children
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};
