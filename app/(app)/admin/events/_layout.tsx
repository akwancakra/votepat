import { Stack } from "expo-router";
// import { AuthProvider, useAuth } from "~/context/AuthContext";
import React from "react";
import { ThemeToggle } from "~/components/ThemeToggle";

function AppLayout() {
  // const { authState } = useAuth();
  // const router = useRouter();
  // console.log("authState", authState);

  // useEffect(() => {
  //   if (authState?.authenticated === null) {
  //     router.replace("/login");
  //   }
  // }, [authState]);

  return (
    // <AuthProvider>
    // {/* <Slot /> */}
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "List Events",
          headerRight: () => <ThemeToggle />,
        }}
      />
      <Stack.Screen
        name="create"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="edit"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="show"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
    // {/* {authState?.authenticated && <BottomNav />} */}
    // {/* <BottomNav /> */}
    // </AuthProvider>
  );
}

export default AppLayout;
