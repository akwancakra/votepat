import { Stack } from "expo-router";
import BottomNav from "~/components/BottomNav";
// import { AuthProvider } from "~/context/AuthContext";
import React from "react";
import { ThemeToggle } from "~/components/ThemeToggle";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "~/components/ui/bottom-sheet";

function UserLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        {/* <AuthProvider> */}
        <Stack>
          <Stack.Screen
            name="index"
            options={{
              title: "Current Event",
              headerRight: () => <ThemeToggle />,
            }}
          />
          <Stack.Screen
            name="events"
            options={{
              headerShown: false,
            }}
          />
        </Stack>
        <BottomNav />
        {/* </AuthProvider> */}
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}

export default UserLayout;
