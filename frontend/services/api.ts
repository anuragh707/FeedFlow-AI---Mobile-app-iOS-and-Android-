import axios from "axios";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Dynamic base URL configuration for development
// Pointing to your computer's local IP on the current Wi-Fi network: 192.168.0.105
const DEV_BASE_URL = "http://192.168.0.105:8000";


export const API_BASE_URL = DEV_BASE_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to dynamically inject access tokens
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("user_token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.error("Failed to retrieve authentication token from AsyncStorage", e);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// API endpoint methods
export const api = {
  // Authentication
  auth: {
    async register(name: string, email: string, password: string) {
      const response = await apiClient.post("/auth/register", { name, email, password });
      return response.data;
    },
    
    async login(email: string, password: string) {
      // Form URLencoded data payload for OAuth2 compliance
      const params = new URLSearchParams();
      params.append("username", email); // OAuth2 expects username, which mapped to email in FastAPI
      params.append("password", password);
      
      const response = await apiClient.post("/auth/login", params, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      return response.data; // returns { access_token, token_type }
    },
    
    async logout() {
      const response = await apiClient.post("/auth/logout");
      return response.data;
    },
    
    async getProfile() {
      const response = await apiClient.get("/auth/profile");
      return response.data;
    }
  },

  // Instagram Simulated Connection
  instagram: {
    async getStatus() {
      const response = await apiClient.get("/instagram/status");
      return response.data;
    },
    
    async connect(username: string) {
      const response = await apiClient.post("/instagram/connect", { username });
      return response.data;
    },
    
    async disconnect() {
      const response = await apiClient.post("/instagram/disconnect");
      return response.data;
    }
  },

  // Topic Preferences
  preferences: {
    async get() {
      const response = await apiClient.get("/preferences");
      return response.data;
    },
    
    async update(preferences: Array<{ topic: string; preference_type: "MORE" | "LESS"; weight: number }>) {
      const response = await apiClient.post("/preferences/update", { preferences });
      return response.data;
    }
  },

  // Automation Job Configurations
  automation: {
    async getStatus() {
      const response = await apiClient.get("/automation/status");
      return response.data;
    },
    
    async start(runIntervalHours: number) {
      const response = await apiClient.post("/automation/start", { run_interval_hours: runIntervalHours });
      return response.data;
    },
    
    async stop() {
      const response = await apiClient.post("/automation/stop");
      return response.data;
    },
    
    async triggerSync() {
      const response = await apiClient.post("/automation/trigger");
      return response.data;
    }
  },

  // Analytics Dashboard & Activity Logging
  analytics: {
    async getDashboard() {
      const response = await apiClient.get("/analytics/dashboard");
      return response.data;
    },
    
    async getLogs() {
      const response = await apiClient.get("/analytics/logs");
      return response.data;
    }
  },

  // Custom AI Test Screen Endpoint
  ai: {
    async analyze(contentText: string) {
      const response = await apiClient.post("/ai/analyze", { content_text: contentText });
      return response.data;
    }
  }
};
export default api;
