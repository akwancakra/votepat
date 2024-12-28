import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Toast from "react-native-toast-message";
import { Role } from "~/lib/types";
import { IP_API } from "~/lib/constants";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  metamaskAddress: string | null;
  nonce: string | null;
  googleId: string | null;
  googleToken: string | null;
  tokenExpiry: number | null;
  passwordResetCode: string | null;
  createdAt: string;
  updatedAt: string;
  sub: string;
}

interface AuthState {
  authenticated: boolean | null;
  // username: string | null;
  role: Role | null;
  token: string | null;
  userData: UserData | null;
  isLoading: boolean;
  apiUrl: string;

  setAuthState: (authState: Partial<AuthState>) => void;
  loadAuthState: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchUserData: () => Promise<void>;
  setApiUrl: (url: string) => Promise<void>;
  loadApiUrl: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  authenticated: null,
  // username: null,
  role: null,
  token: null,
  userData: null,
  isLoading: true,
  apiUrl: IP_API,

  setAuthState: (authState) => set(authState),

  loadAuthState: async () => {
    set({ isLoading: true });
    try {
      const storedToken = await AsyncStorage.getItem("userToken");

      if (storedToken) {
        // Set token in state
        set({
          authenticated: true,
          token: storedToken,
        });

        // fetch API URL
        await get().loadApiUrl();
        // Fetch user data
        await get().fetchUserData();
      } else {
        set({
          authenticated: false,
          // username: null,
          role: null,
          token: null,
          userData: null,
        });
      }
    } catch (error) {
      console.error("Error loading auth data:", error);
      set({
        authenticated: false,
        // username: null,
        role: null,
        token: null,
        userData: null,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchUserData: async () => {
    set({ isLoading: true });
    try {
      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        throw new Error("No token found");
      }

      const response = await axios.get(`${get().apiUrl}/api/auth/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        const userData = response.data.data;

        // Update state with user data
        set({
          // username: userData.name,
          role: userData.role as Role,
          userData: userData,
        });

        await AsyncStorage.setItem("username", userData.name);
        await AsyncStorage.setItem("userRole", userData.role);
      } else {
        throw new Error("Failed to fetch user data");
      }
    } catch (error: Error | any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Gagal mengambil data pengguna";

      console.error("Fetch user data error:", errorMessage);

      Toast.show({
        type: "error",
        text1: "Error",
        text2: errorMessage,
        visibilityTime: 3000,
      });

      await get().logout();
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await axios.post(
        `${get().apiUrl}/api/auth/login/email`,
        {
          email: email,
          password: password,
        }
      );

      if (response.data.success) {
        const { token } = response.data.data;

        // Save token
        await AsyncStorage.setItem("userToken", token);

        // Update auth state with token
        set({
          authenticated: true,
          token: token,
        });

        // Fetch user data after successful login
        await get().fetchUserData();

        Toast.show({
          type: "success",
          text1: "Login Berhasil",
          text2: "Anda berhasil login",
          visibilityTime: 3000,
        });
      } else {
        throw new Error(response.data.message || "Login gagal");
      }
    } catch (error: Error | any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Login failed. Please try again.";

      console.error("Login error:", errorMessage);

      Toast.show({
        type: "error",
        text1: "Error Login",
        text2: errorMessage || "Terjadi kesalahan saat login",
        visibilityTime: 3000,
      });

      set({
        authenticated: false,
        // username: null,
        role: null,
        token: null,
        userData: null,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      // Get token from AsyncStorage
      const token = await AsyncStorage.getItem("userToken");

      if (token) {
        // Send logout request to API
        await axios.post(
          `${get().apiUrl}/api/auth/logout`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Logout success");
      }

      // Remove all data from AsyncStorage
      await AsyncStorage.multiRemove(["userToken", "username", "userRole"]);

      // Reset auth state
      set({
        authenticated: false,
        // username: null,
        role: null,
        token: null,
        userData: null,
      });

      Toast.show({
        type: "success",
        text1: "Logout Berhasil",
        text2: "Anda telah keluar dari aplikasi",
        visibilityTime: 3000,
      });
    } catch (error: Error | any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Logout failed. Please try again.";

      console.error("Logout error:", errorMessage);

      // Still remove local data even if logout request fails
      await AsyncStorage.multiRemove(["userToken", "username", "userRole"]);

      set({
        authenticated: false,
        // username: null,
        role: null,
        token: null,
        userData: null,
      });

      Toast.show({
        type: "error",
        text1: "Error Logout",
        text2: errorMessage || "Terjadi kesalahan saat logout",
        visibilityTime: 3000,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  setApiUrl: async (url: string) => {
    await AsyncStorage.setItem("apiUrl", url);
    set({ apiUrl: url });
  },

  loadApiUrl: async () => {
    const storedApiUrl = await AsyncStorage.getItem("apiUrl");
    if (storedApiUrl) {
      set({ apiUrl: storedApiUrl });
    }
  },
}));
