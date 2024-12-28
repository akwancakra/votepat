import { Stack, usePathname } from "expo-router";
import BottomNav from "~/components/BottomNav";
// import { AuthProvider } from "~/context/AuthContext";
import React from "react";
import { ThemeToggle } from "~/components/ThemeToggle";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "~/components/ui/bottom-sheet";

function AppLayout() {
  const [showBottomNav, setShowBottomNav] = React.useState(true);
  const pathname = usePathname();

  React.useEffect(() => {
    const hideBottomNavOnRoutes = [
      "/admin/events/create",
      "/admin/events/edit",
    ];
    const currentPath = pathname;
    const shouldHideBottomNav = hideBottomNavOnRoutes.some((route) =>
      currentPath.startsWith(route)
    );
    setShowBottomNav(!shouldHideBottomNav);
  }, [pathname]);

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
        {showBottomNav && <BottomNav />}
        {/* </AuthProvider> */}
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}

export default AppLayout;
