import React, { createContext, useContext, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Role } from "~/lib/types";
import { Alert } from "react-native";

interface AuthContextType {
  authState: {
    authenticated: boolean | null;
    username: string | null;
    role: Role | null;
    token: string | null;
  };
  onLogin: (username: string, password: string) => void;
  onLogout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

const AuthProvider = ({ children }: any) => {
  const [authState, setAuthState] = useState<{
    authenticated: boolean | null;
    username: string | null;
    role: Role | null;
    token: string | null;
  }>({
    authenticated: null,
    username: null,
    role: null,
    token: null,
  });

  // async
  const login = (username: string, password: string) => {
    // try {
    if (username === "admin" && password === "admin") {
      // await AsyncStorage.setItem("userToken", "dummyToken");
      // await AsyncStorage.setItem("username", username);
      // await AsyncStorage.setItem("userRole", Role.ADMIN);
      // setAuthState({
      //   authenticated: true,
      //   username,
      //   role: Role.ADMIN,
      //   token: "dummyToken",
      // });
      setAuthState((prevState) => ({
        ...prevState,
        authenticated: true,
        username,
        role: Role.ADMIN,
        token: "dummyToken",
      }));
    } else if (username === "user" && password === "user") {
      // await AsyncStorage.setItem("userToken", "dummyToken");
      // await AsyncStorage.setItem("username", username);
      // await AsyncStorage.setItem("userRole", Role.USER);
      // setAuthState({
      //   authenticated: true,
      //   username,
      //   role: Role.USER,
      //   token: "dummyToken",
      // });
      setAuthState((prevState) => ({
        ...prevState,
        authenticated: true,
        username,
        role: Role.USER,
        token: "dummyToken",
      }));
    } else {
      Alert.alert("Error", "Invalid credentials");
      // throw new Error("Invalid credentials");
    }
    // } catch (error) {
    //   setAuthState({
    //     authenticated: false,
    //     username: null,
    //     role: null,
    //     token: null,
    //   });
    //   throw error; // Re-throw error untuk handling di component
    // }
  };

  const logout = async () => {
    // await AsyncStorage.removeItem("userToken");
    // await AsyncStorage.removeItem("username");
    // await AsyncStorage.removeItem("userRole");
    setAuthState({
      authenticated: false,
      username: null,
      role: null,
      token: null,
    });
  };

  const value = {
    authState,
    onLogin: login,
    onLogout: logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
