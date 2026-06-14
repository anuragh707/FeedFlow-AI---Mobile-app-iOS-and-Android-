import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../services/api";

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  user: { name: string; email: string } | null;
  isLoading: boolean;
  error: string | null;
  
  // Instagram Connection state
  instagramConnection: {
    status: "CONNECTED" | "DISCONNECTED" | "CONNECTING";
    username: string | null;
    profilePictureUrl: string | null;
    lastSynchronizedAt: string | null;
  } | null;

  // Preferences State
  preferences: Array<{ id?: number; topic: string; preference_type: "MORE" | "LESS"; weight: number }>;

  // Automation Job state
  automationJob: {
    status: "ACTIVE" | "PAUSED" | "DISABLED";
    runIntervalHours: number;
    lastRunAt: string | null;
    nextRunAt: string | null;
    actionsCompleted: number;
  } | null;

  // Analytics Dashboard state
  dashboardData: {
    automation_status: string;
    actions_completed: number;
    last_sync: string | null;
    personalization_score: number;
    previous_score: number;
    improvement_pct: number;
    feed_relevance_pct: number;
    preference_accuracy_pct: number;
    content_distribution: Record<string, number>;
    history: Array<{ id: number; label: string; match_score: number; relevance: number; category: string; timestamp: string }>;
    insights: Array<{ message: string; improvement_pct: number | null; trend_type: "POSITIVE" | "INFO" | "WARNING" }>;
  } | null;

  activityLogs: Array<{ id: number; activity_type: string; message: string; created_at: string }>;

  // Actions
  loadStoredAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  
  // Connect / Disconnect
  getInstagramStatus: () => Promise<void>;
  connectInstagram: (username: string) => Promise<void>;
  disconnectInstagram: () => Promise<void>;

  // Preferences Actions
  getPreferences: () => Promise<void>;
  updatePreferences: (preferences: Array<{ topic: string; preference_type: "MORE" | "LESS"; weight: number }>) => Promise<void>;

  // Automation Actions
  getAutomationStatus: () => Promise<void>;
  startAutomation: (interval: number) => Promise<void>;
  stopAutomation: () => Promise<void>;
  triggerSync: () => Promise<any>;

  // Dashboard / Logs
  getDashboardData: () => Promise<void>;
  getActivityLogs: () => Promise<void>;
}

export const useStore = create<AuthState>((set, get) => ({
  token: null,
  isAuthenticated: false,
  user: null,
  isLoading: false,
  error: null,
  instagramConnection: null,
  preferences: [],
  automationJob: null,
  dashboardData: null,
  activityLogs: [],

  clearError: () => set({ error: null }),

  loadStoredAuth: async () => {
    set({ isLoading: true, error: null });
    try {
      const token = await AsyncStorage.getItem("user_token");
      if (token) {
        set({ token, isAuthenticated: true });
        try {
          const profile = await api.auth.getProfile();
          set({ user: profile });
        } catch (err: any) {
          // Token is likely expired, clear it
          await AsyncStorage.removeItem("user_token");
          set({ token: null, isAuthenticated: false, user: null });
        }
      }
    } catch (e) {
      console.error("AsyncStorage read error", e);
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.auth.login(email, password);
      const token = data.access_token;
      await AsyncStorage.setItem("user_token", token);
      set({ token, isAuthenticated: true });
      const profile = await api.auth.getProfile();
      set({ user: profile });
    } catch (err: any) {
      set({ error: err.response?.data?.detail || "Authentication login failed" });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      await api.auth.register(name, email, password);
      // Automatically login after registration
      await get().login(email, password);
    } catch (err: any) {
      set({ error: err.response?.data?.detail || "Registration signup failed" });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      if (get().isAuthenticated) {
        await api.auth.logout();
      }
    } catch (err) {
      console.warn("Logout endpoint error", err);
    } finally {
      await AsyncStorage.removeItem("user_token");
      set({
        token: null,
        isAuthenticated: false,
        user: null,
        instagramConnection: null,
        preferences: [],
        automationJob: null,
        dashboardData: null,
        activityLogs: [],
        isLoading: false
      });
    }
  },

  getInstagramStatus: async () => {
    try {
      const status = await api.instagram.getStatus();
      set({ instagramConnection: status });
    } catch (err) {
      console.error("Failed to load Instagram connection status", err);
    }
  },

  connectInstagram: async (username) => {
    set({ isLoading: true, error: null });
    try {
      const status = await api.instagram.connect(username);
      set({ instagramConnection: status });
      await get().getDashboardData(); // Refresh dashboard to show connected
    } catch (err: any) {
      set({ error: err.response?.data?.detail || "Failed to connect simulated Instagram account" });
    } finally {
      set({ isLoading: false });
    }
  },

  disconnectInstagram: async () => {
    set({ isLoading: true, error: null });
    try {
      const status = await api.instagram.disconnect();
      set({ instagramConnection: status });
      await get().getDashboardData();
    } catch (err: any) {
      set({ error: err.response?.data?.detail || "Failed to disconnect Instagram" });
    } finally {
      set({ isLoading: false });
    }
  },

  getPreferences: async () => {
    try {
      const prefs = await api.preferences.get();
      set({ preferences: prefs });
    } catch (err) {
      console.error("Failed to load user preferences", err);
    }
  },

  updatePreferences: async (preferencesList) => {
    set({ isLoading: true, error: null });
    try {
      const prefs = await api.preferences.update(preferencesList);
      set({ preferences: prefs });
      await get().getDashboardData(); // Refresh dashboard on preference adjustments
    } catch (err: any) {
      set({ error: err.response?.data?.detail || "Failed to save preferences" });
    } finally {
      set({ isLoading: false });
    }
  },

  getAutomationStatus: async () => {
    try {
      const job = await api.automation.getStatus();
      set({ automationJob: job });
    } catch (err) {
      console.error("Failed to load automation job status", err);
    }
  },

  startAutomation: async (intervalHours) => {
    set({ isLoading: true });
    try {
      const job = await api.automation.start(intervalHours);
      set({ automationJob: job });
      await get().getDashboardData();
    } catch (err: any) {
      set({ error: err.response?.data?.detail || "Failed to start automation engine" });
    } finally {
      set({ isLoading: false });
    }
  },

  stopAutomation: async () => {
    set({ isLoading: true });
    try {
      const job = await api.automation.stop();
      set({ automationJob: job });
      await get().getDashboardData();
    } catch (err: any) {
      set({ error: err.response?.data?.detail || "Failed to pause automation engine" });
    } finally {
      set({ isLoading: false });
    }
  },

  triggerSync: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.automation.triggerSync();
      // Reload stats and logs immediately
      await Promise.all([
        get().getDashboardData(),
        get().getActivityLogs(),
        get().getInstagramStatus(),
        get().getAutomationStatus()
      ]);
      return response;
    } catch (err: any) {
      const errMsg = err.response?.data?.detail || "Failed to trigger automated sync";
      set({ error: errMsg });
      throw new Error(errMsg);
    } finally {
      set({ isLoading: false });
    }
  },

  getDashboardData: async () => {
    try {
      const data = await api.analytics.getDashboard();
      set({ dashboardData: data });
    } catch (err) {
      console.error("Failed to fetch dashboard numbers", err);
    }
  },

  getActivityLogs: async () => {
    try {
      const logs = await api.analytics.getLogs();
      set({ activityLogs: logs });
    } catch (err) {
      console.error("Failed to fetch activity logs", err);
    }
  }
}));
