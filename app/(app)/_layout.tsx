import { router, Stack } from "expo-router";
import React from "react";
import { useAuthStore } from "~/store/authStore";
// import { useAuth } from "~/lib/hooks/useAuth";

function AppLayout() {
  const { role, authenticated } = useAuthStore();
  // const { authState } = useAuth();
  // const { authState } = useAuth();
  // const [_, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // if (authState) {
    // setIsLoading(false);
    // if (!authState.authenticated) {
    //   router.replace("/");
    // } else if (authState.role === "SUPER_ADMIN") {
    //   router.replace("/admin");
    // } else if (authState.role === "DEFAULT_USER") {
    //   router.replace("/user");
    // }
    // }
  }, [authenticated, role]);

  return (
    // <GestureHandlerRootView style={{ flex: 1 }}>
    // <BottomSheetModalProvider>
    // <AuthProvider>
    <Stack>
      {role === "SUPER_ADMIN" ? (
        <Stack.Screen
          name="admin"
          options={{
            headerShown: false,
          }}
        />
      ) : (
        <Stack.Screen
          name="user"
          options={{
            headerShown: false,
          }}
        />
      )}
      <Stack.Screen
        name="settings"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
    // </AuthProvider>
    // </BottomSheetModalProvider>
    // </GestureHandlerRootView>
  );
}

export default AppLayout;
