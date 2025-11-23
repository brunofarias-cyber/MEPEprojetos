import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: string;
  email: string;
  role: "teacher" | "student" | "coordinator";
  name: string;
  avatar?: string | null;
  roleData?: any;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: "teacher" | "student" | "coordinator";
  subject?: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);

  // Try to restore user from localStorage first
  useEffect(() => {
    const storedUser = localStorage.getItem('bprojetos_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        console.log("[AuthContext] User restored from localStorage:", parsedUser);
      } catch (e) {
        console.error("[AuthContext] Failed to parse stored user:", e);
        localStorage.removeItem('bprojetos_user');
      }
    }
    setIsRestoring(false);
  }, []);

  // Fetch current user on mount
  const { data: currentUser, error } = useQuery<User>({
    queryKey: ['/api/auth/me'],
    retry: false,
    refetchOnWindowFocus: false,
    enabled: false, // Disable auto-fetch since we're using localStorage
  });

  useEffect(() => {
    if (currentUser) {
      setUser(currentUser);
    } else if (error) {
      setUser(null);
    }
  }, [currentUser, error]);

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      console.log("[loginMutation] Starting login request with:", credentials);
      const result = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
        headers: { 'Content-Type': 'application/json' },
      });
      console.log("[loginMutation] Login request successful:", result);
      return result;
    },
    onSuccess: async (data) => {
      console.log("[loginMutation] onSuccess called with:", data);
      // Store token in localStorage (more secure than just userId)
      if (data.token) {
        localStorage.setItem('bprojetos_token', data.token);
      }
      // Also store user for display purposes
      localStorage.setItem('bprojetos_user', JSON.stringify(data));
      setUser(data);
      await queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    },
    onError: (error) => {
      console.error("[loginMutation] onError called with:", error);
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      return await apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: async (data) => {
      // After registration, automatically log in
      await loginMutation.mutateAsync({
        email: data.email,
        password: (registerMutation.variables as RegisterData).password,
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('/api/auth/logout', {
        method: 'POST',
      });
    },
    onSuccess: () => {
      localStorage.removeItem('bprojetos_user');
      localStorage.removeItem('bprojetos_token');
      setUser(null);
      queryClient.clear();
      window.location.href = '/login';
    },
  });

  const login = async (email: string, password: string) => {
    console.log("[AuthContext] Login attempt:", { email, password });
    try {
      const result = await loginMutation.mutateAsync({ email, password });
      console.log("[AuthContext] Login successful:", result);
      return result;
    } catch (error) {
      console.error("[AuthContext] Login failed:", error);
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    await registerMutation.mutateAsync(data);
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  return (
    <AuthContext.Provider value={{ user, isLoading: isRestoring, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
