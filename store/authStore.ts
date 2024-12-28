import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Role } from "~/lib/types";
import { IP_API } from "~/lib/constants";
import { persist, createJSONStorage } from "zustand/middleware";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
}

interface AuthState {
  authenticated: boolean;
  role: Role | null;
  token: string | null;
  userData: UserData | null;
  apiUrl: string;
  isLoading: boolean;
  isInitializing: boolean;

  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<UserData>;
  logout: () => Promise<void>;
  fetchUserData: () => Promise<void>;
  setApiUrl: (url: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      authenticated: false,
      token: null,
      role: null,
      userData: null,
      apiUrl: IP_API,
      isLoading: false,
      isInitializing: false,

      initialize: async () => {
        set({ isInitializing: true });

        try {
          // Load API URL and token from storage
          const storedApiUrl = (await AsyncStorage.getItem("apiUrl")) || IP_API;
          const storedToken = await AsyncStorage.getItem("userToken");

          if (storedApiUrl) set({ apiUrl: storedApiUrl });
          if (storedToken) {
            set({ token: storedToken, authenticated: true });
            await get().fetchUserData();
          }
        } catch (error) {
          console.error("Initialization error:", error);
          set({ authenticated: false, token: null, userData: null });
        } finally {
          set({ isInitializing: false });
        }
      },

      login: async (email, password) => {
        set({ isLoading: true });

        try {
          const apiUrl = get().apiUrl;
          const response = await axios.post(`${apiUrl}/api/auth/login/email`, {
            email,
            password,
          });

          const { token } = response.data.data;
          await AsyncStorage.setItem("userToken", token);

          // Fetch user data
          const userResponse = await axios.get(`${apiUrl}/api/auth/user`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          const userData = userResponse.data.data;

          set({
            authenticated: true,
            token,
            userData,
            role: userData.role,
          });

          return userData;
        } catch (error) {
          console.error("Login error:", error);
          set({
            authenticated: false,
            token: null,
            userData: null,
          });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        set({ isLoading: true });

        try {
          const response = await axios.post(`${get().apiUrl}/api/auth/logout`);

          if (response.status !== 200) {
            throw new Error("Failed to logout");
          }

          await AsyncStorage.removeItem("userToken");
          set({
            authenticated: false,
            token: null,
            userData: null,
            role: null,
          });
        } catch (error) {
          console.error("Logout error:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      fetchUserData: async () => {
        const { token, apiUrl } = get();
        if (!token || !apiUrl) return;

        try {
          const response = await axios.get(`${apiUrl}/api/auth/user`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          set({ userData: response.data.data, role: response.data.data.role });
        } catch (error) {
          console.error("Fetch user data error:", error);
        }
      },

      setApiUrl: (url) => {
        AsyncStorage.setItem("apiUrl", url);
        set({ apiUrl: url });
      },
    }),
    {
      name: "data-state-storage",
      storage: {
        getItem: async (name) => {
          const value = await AsyncStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: async (name, value) => {
          await AsyncStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: async (name) => {
          await AsyncStorage.removeItem(name);
        },
      },
      // Specify which parts of the state you want to persist
      partialize: (state) => {
        const { token, authenticated, userData, role, apiUrl } = state;
        return {
          token: token || null,
          authenticated: authenticated || false,
          userData: userData || null,
          role: role || null,
          apiUrl: apiUrl || IP_API,
          isLoading: false,
          isInitializing: false,
          initialize: state.initialize,
          login: state.login,
          logout: state.logout,
          fetchUserData: state.fetchUserData,
          setApiUrl: state.setApiUrl,
        };
      },
    }
  )
);
