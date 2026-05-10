"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  login as apiLogin,
  signup as apiSignup,
  signupProject as apiSignupProject,
  verifyEmail as apiVerifyEmail,
  logout as apiLogout,
  getMe,
  type UserInfo,
} from "@/lib/api";
import { useRouter, usePathname } from "next/navigation";

interface AuthContextType {
  user: UserInfo | null;
  loading: boolean;
  login: (
    email: string,
    password: string,
    loginRole?: "user" | "project_owner",
  ) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  signupProject: (
    email: string,
    password: string,
    project_name: string,
    reason: string,
  ) => Promise<void>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const PUBLIC_PATHS = [
  "/login",
  "/signup",
  "/signup/project",
  "/verify",
  "/reset-password",
  "/auth/callback",
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    getMe()
      .then(setUser)
      .catch(() => {
        if (!PUBLIC_PATHS.includes(pathname)) {
          router.replace("/login");
        }
      })
      .finally(() => setLoading(false));
  }, [pathname, router]);

  const login = useCallback(
    async (
      email: string,
      password: string,
      loginRole: "user" | "project_owner" = "user",
    ) => {
      await apiLogin(email, password, loginRole);
      const me = await getMe();
      setUser(me);
      router.push("/instances");
    },
    [router],
  );

  const signup = useCallback(
    async (email: string, password: string) => {
      await apiSignup(email, password);
      router.push(`/verify?email=${encodeURIComponent(email)}`);
    },
    [router],
  );

  const signupProject = useCallback(
    async (
      email: string,
      password: string,
      project_name: string,
      reason: string,
    ) => {
      await apiSignupProject(email, password, project_name, reason);
      router.push(`/verify?email=${encodeURIComponent(email)}`);
    },
    [router],
  );

  const verifyEmail = useCallback(
    async (email: string, code: string) => {
      const result = await apiVerifyEmail(email, code);

      if (result.status === "pending_approval") {
        router.push("/login?pending=true");
        return;
      }

      const me = await getMe();
      setUser(me);
      router.push("/instances");
    },
    [router],
  );

  const refreshUser = useCallback(async () => {
    try {
      const me = await getMe();
      setUser(me);
    } catch {
      // ignore
    }
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        signupProject,
        verifyEmail,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
