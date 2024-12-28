import { Slot, Stack, useRouter, useSegments } from "expo-router";
import BottomNav from "~/components/BottomNav";
// import { AuthProvider, useAuth } from "~/context/AuthContext";
import React, { useEffect } from "react";
import { ThemeToggle } from "~/components/ThemeToggle";

function AppLayout() {
  return (
    // <AuthProvider>
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Event List",
          headerRight: () => <ThemeToggle />,
        }}
      />
      <Stack.Screen
        name="show"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
    // </AuthProvider>
  );
}

export default AppLayout;
