import { Stack } from "expo-router";
import BottomNav from "~/components/BottomNav";
import React from "react";
import { ThemeToggle } from "~/components/ThemeToggle";

function SettingsLayout() {
  return (
    <>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            title: "Settings",
            headerRight: () => <ThemeToggle />,
          }}
        />
      </Stack>
      <BottomNav />
    </>
  );
}

export default SettingsLayout;
