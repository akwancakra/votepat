import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect } from "react";
import { Role } from "../types";

export const useAuth = () => {
  const [authState, setAuthState] = useState<{
    authenticated: boolean | null;
    username: string | null;
    role: Role | null;
  }>({
    authenticated: null,
    username: null,
    role: null,
  });

  useEffect(() => {
    const loadAuthState = async () => {
      const token = await AsyncStorage.getItem("userToken");
      const username = await AsyncStorage.getItem("username");
      const role = await AsyncStorage.getItem("userRole");

      setAuthState({
        authenticated: !!token,
        username: username,
        role: role as Role | null,
      });
    };
    loadAuthState();
  }, []);

  const login = async (username: string, password: string) => {
    // Di sini Anda bisa menambahkan logika autentikasi yang sebenarnya
    if (username === "admin" && password === "password") {
      await AsyncStorage.setItem("userToken", "some-token");
      await AsyncStorage.setItem("username", username);
      await AsyncStorage.setItem("userRole", Role.ADMIN);
      setAuthState({
        authenticated: true,
        username,
        role: Role.ADMIN,
      });
    } else if (username === "user" && password === "password") {
      await AsyncStorage.setItem("userToken", "some-token");
      await AsyncStorage.setItem("username", username);
      await AsyncStorage.setItem("userRole", Role.USER);
      setAuthState({
        authenticated: true,
        username,
        role: Role.USER,
      });
    } else {
      setAuthState({
        authenticated: false,
        username: null,
        role: null,
      });
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem("userToken");
    await AsyncStorage.removeItem("username");
    await AsyncStorage.removeItem("userRole");
    setAuthState({
      authenticated: false,
      username: null,
      role: null,
    });
  };

  return {
    authState,
    onLogin: login,
    onLogout: logout,
  };
};
