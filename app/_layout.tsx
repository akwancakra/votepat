import "~/global.css";
import * as React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Theme, ThemeProvider } from "@react-navigation/native";
import { SplashScreen, Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, Platform, Text, View } from "react-native";
import { NAV_THEME } from "~/lib/constants";
import { useColorScheme } from "~/lib/useColorScheme";
import { PortalHost } from "@rn-primitives/portal";
// import BottomNav from "~/components/BottomNav";
import { setAndroidNavigationBar } from "~/lib/android-navigation-bar";
// import { AuthProvider, useAuth } from "~/context/AuthContext";
// import { ThemeToggle } from "~/components/ThemeToggle";
// import { BottomSheetModalProvider } from "~/components/ui/bottom-sheet";
import Toast from "react-native-toast-message";
// import { useAuth } from "~/lib/hooks/useAuth";
import { useAuthStore } from "~/store/authStore";

const LIGHT_THEME: Theme = {
  dark: false,
  colors: NAV_THEME.light,
};

const DARK_THEME: Theme = {
  dark: true,
  colors: NAV_THEME.dark,
};

function AuthStack() {
  return (
    <Stack>
      <Stack.Screen
        name="(auth)"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}

function AppStack() {
  return (
    <Stack>
      <Stack.Screen
        name="(app)"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}

function StackLayout() {
  // const { authState } = useAuth();

  return (
    <>
      {/* <Slot /> */}
      <Stack>
        <Stack.Screen
          name="(app)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(auth)"
          options={{
            headerShown: false,
          }}
        />
        {/* {authState?.authenticated && <BottomNav />} */}
      </Stack>
      {/* <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_left", // Animasi transisi
        }}
      >
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack> */}
      <PortalHost />
    </>
  );
}

function RootLayout() {
  const { role } = useAuthStore();
  const { colorScheme, setColorScheme, isDarkColorScheme } = useColorScheme();
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  // const { authState } = useAuth();
  const router = useRouter();

  const { initialize, isInitializing, authenticated } = useAuthStore();

  React.useEffect(() => {
    const initializeApp = async () => {
      try {
        await initialize();
        console.log("Authenticated: ", authenticated);

        const theme = await AsyncStorage.getItem("theme");
        if (Platform.OS === "web") {
          document.documentElement.classList.add("bg-background");
        }
        if (!theme) {
          await AsyncStorage.setItem("theme", colorScheme);
        } else {
          const colorTheme = theme === "dark" ? "dark" : "light";
          if (colorTheme !== colorScheme) {
            setColorScheme(colorTheme);
            setAndroidNavigationBar(colorTheme);
          }
        }

        setIsColorSchemeLoaded(true);
      } catch (error) {
        console.error("Error initializing app:", error);
      } finally {
        setIsLoading(false);
        await SplashScreen.hideAsync();
      }
    };

    initializeApp();
  }, []);

  React.useEffect(() => {
    if (!isLoading && authenticated) {
      switch (role) {
        case "SUPER_ADMIN":
          router.replace("/admin");
          break;
        case "DEFAULT_USER":
          router.replace("/user");
          break;
        default:
          router.replace("/");
      }
    }
  }, [isLoading, authenticated, role]);

  //  || isLoading || !isColorSchemeLoaded
  if (isInitializing) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator
          size="large"
          color={isDarkColorScheme ? "#fff" : "#000"}
        />
        <Text
          style={{
            marginTop: 10,
            fontSize: 16,
            color: isDarkColorScheme ? "#fff" : "#000",
          }}
        >
          {isInitializing ? "Initializing..." : "Loading..."}
        </Text>
      </View>
    );
  }

  return (
    // <BottomSheetModalProvider>
    <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
      <StatusBar style={isDarkColorScheme ? "light" : "dark"} />
      {/* <AuthProvider> */}
      {/* <StackLayout /> */}
      {authenticated ? <AppStack /> : <AuthStack />}
      <Toast />
      <PortalHost />
      {/* </AuthProvider> */}
    </ThemeProvider>
    // </BottomSheetModalProvider>
  );
}

export default RootLayout;
