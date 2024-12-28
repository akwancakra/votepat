import { Stack, useRouter } from "expo-router";
import React from "react";
import { useAuthStore } from "~/store/authStore";
// import { useAuth } from "~/lib/hooks/useAuth";
// import { AuthProvider, useAuth } from "~/context/AuthContext";

function AuthLayout() {
  const { role, authenticated } = useAuthStore();
  // const { authState } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    // console.log("Role", role);
    // if (authenticated) {
    //   if (role === "SUPER_ADMIN") {
    //     router.replace("/admin");
    //   } else if (role === "DEFAULT_USER") {
    //     router.replace("/user");
    //   }
    // }
  }, [authenticated, role]);

  return (
    // <AuthProvider>
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
    // </AuthProvider>
  );
}

export default AuthLayout;
