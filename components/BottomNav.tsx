import React from "react";
import { View, TouchableOpacity, Text, Alert } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { CalendarDays } from "~/lib/icons/CalendarDays";
import { Home } from "~/lib/icons/Home";
import { LogOut } from "~/lib/icons/LogOut";
// import { useAuth } from "~/context/AuthContext";
import Toast from "react-native-toast-message";
import { Cog } from "~/lib/icons/Cog";
import { useAuthStore } from "~/store/authStore";

const BottomNav = () => {
  const { role, logout } = useAuthStore();
  // const { authState, onLogout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await logout();
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "You have been logged out.",
        visibilityTime: 3000,
      });
      router.replace("/");
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Logout failed. Please try again.",
        visibilityTime: 3000,
      });
    }
  };

  return (
    <View className="flex-row justify-around items-center bg-background border-t border-border h-16">
      {role === "SUPER_ADMIN" ? (
        <>
          <TouchableOpacity
            onPress={() => router.replace("/admin")}
            className={`items-center ${
              pathname === "/admin" ? "opacity-100" : "opacity-50"
            }`}
          >
            <Home className="text-foreground" size={22} strokeWidth={1.25} />
            <Text className="text-sm mt-1 dark:text-white">Home</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.replace("/admin/events")}
            className={`items-center ${
              pathname.startsWith("/admin/events")
                ? "opacity-100"
                : "opacity-50"
            }`}
          >
            <CalendarDays
              className="text-foreground"
              size={22}
              strokeWidth={1.25}
            />
            <Text className="text-sm mt-1 dark:text-white">Events</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TouchableOpacity
            onPress={() => router.replace("/user")}
            className={`items-center ${
              pathname === "/user" ? "opacity-100" : "opacity-50"
            }`}
          >
            <Home className="text-foreground" size={22} strokeWidth={1.25} />
            <Text className="text-sm mt-1 dark:text-white">Home</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.replace("/user/events")}
            className={`items-center ${
              pathname.startsWith("/user/events") ? "opacity-100" : "opacity-50"
            }`}
          >
            <CalendarDays
              className="text-foreground"
              size={22}
              strokeWidth={1.25}
            />
            <Text className="text-sm mt-1 dark:text-white">Events</Text>
          </TouchableOpacity>
        </>
      )}
      <TouchableOpacity
        onPress={() => router.replace("/settings")}
        className={`items-center ${
          pathname.startsWith("/settings") ? "opacity-100" : "opacity-50"
        }`}
      >
        <Cog className="text-foreground" size={22} strokeWidth={1.25} />
        <Text className="text-sm mt-1 dark:text-white">Settings</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={handleLogout}
        className="items-center opacity-50"
      >
        <LogOut className="text-foreground" size={22} strokeWidth={1.25} />
        <Text className="text-sm mt-1 dark:text-white">Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

export default BottomNav;
