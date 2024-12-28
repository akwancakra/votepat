import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Role } from "~/lib/types";
import Toast from "react-native-toast-message";
import axios from "axios";
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

interface AuthContextType {
  authState: {
    authenticated: boolean | null;
    username: string | null;
    role: Role | null;
    token: string | null;
    userData: UserData | null;
  };
  isLoading: boolean;
  onLogin: (username: string, password: string) => Promise<void>;
  onLogout: () => Promise<void>;
  fetchUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [authState, setAuthState] = useState<{
    authenticated: boolean | null;
    username: string | null;
    role: Role | null;
    token: string | null;
    userData: UserData | null;
  }>({
    authenticated: null,
    username: null,
    role: null,
    token: null,
    userData: null,
  });

  // Modifikasi useEffect untuk load stored auth
  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("userToken");

        if (storedToken) {
          // Set token di state
          setAuthState((prevState) => ({
            ...prevState,
            authenticated: true,
            token: storedToken,
          }));

          // Langsung fetch user data
          await fetchUserData();
        } else {
          setAuthState({
            authenticated: false,
            username: null,
            role: null,
            token: null,
            userData: null,
          });
        }
      } catch (error) {
        console.error("Error loading auth data:", error);
        setAuthState({
          authenticated: false,
          username: null,
          role: null,
          token: null,
          userData: null,
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredAuth();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        throw new Error("No token found");
      }

      const response = await axios.get(`${IP_API}/api/auth/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        const userData = response.data.data;

        // Update authState dengan user data
        setAuthState((prevState) => ({
          ...prevState,
          username: userData.name,
          role: userData.role as Role,
          userData: userData,
        }));

        await AsyncStorage.setItem("username", userData.name);
        await AsyncStorage.setItem("userRole", userData.role);
      } else {
        throw new Error("Failed to fetch user data");
      }
    } catch (error: Error | any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Login failed. Please try again.";

      console.error("Logout error:", errorMessage);

      Toast.show({
        type: "error",
        text1: "Error",
        text2: errorMessage || "Gagal mengambil data pengguna",
        visibilityTime: 3000,
      });

      await logout();
    }
  };

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${IP_API}/api/auth/login/email`, {
        email: username,
        password: password,
      });

      if (response.data.success) {
        const { token } = response.data.data;

        // Simpan token
        await AsyncStorage.setItem("userToken", token);

        // Update auth state dengan token
        setAuthState((prevState) => ({
          ...prevState,
          authenticated: true,
          token: token,
        }));

        // Fetch user data setelah login berhasil
        await fetchUserData();

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

      setAuthState({
        authenticated: false,
        username: null,
        role: null,
        token: null,
        userData: null,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      // Ambil token dari AsyncStorage
      const token = await AsyncStorage.getItem("userToken");

      if (token) {
        // Kirim request logout ke API
        await axios.post(
          `${IP_API}/api/auth/logout`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Logout success");
      }

      // Hapus semua data dari AsyncStorage
      await AsyncStorage.multiRemove(["userToken", "username", "userRole"]);

      // Reset auth state
      setAuthState({
        authenticated: false,
        username: null,
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
        "Login failed. Please try again.";

      console.error("Logout error:", errorMessage);

      // Tetap hapus data lokal meskipun request logout gagal
      await AsyncStorage.multiRemove(["userToken", "username", "userRole"]);
      setAuthState({
        authenticated: false,
        username: null,
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
      setIsLoading(false);
    }
  };

  const value = {
    authState,
    isLoading,
    onLogin: login,
    onLogout: logout,
    fetchUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
