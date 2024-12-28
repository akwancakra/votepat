import { Stack } from "expo-router";
// import { AuthProvider } from "~/context/AuthContext";
import React from "react";
import { ThemeToggle } from "~/components/ThemeToggle";

function AppLayout() {
  return (
    // <AuthProvider>
    <Stack>
      <Stack.Screen
        name="[id]"
        options={{
          title: "Starter Base",
          headerRight: () => <ThemeToggle />,
        }}
      />
    </Stack>
    // </AuthProvider>
  );
}

export default AppLayout;
