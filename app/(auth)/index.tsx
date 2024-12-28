import { Link, router } from "expo-router";
import * as React from "react";
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import { Button } from "~/components/ui/button";
// import { useAuth } from "~/context/AuthContext";
import * as yup from "yup";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import clsx from "clsx";
import { useAuthStore } from "~/store/authStore";
import Toast from "react-native-toast-message";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Save } from "~/lib/icons/Save";

type FormData = {
  email: string;
  password: string;
};

const schema = yup.object().shape({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
});

export default function Component() {
  // const { authState, isLoading, login } = useAuth();
  const { login, isLoading, apiUrl, setApiUrl } = useAuthStore();
  // const { authState, onLogin } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const passwordRef = React.useRef<TextInput>(null);
  // const [isLoading, setIsLoading] = React.useState(true);
  const [localApiUrl, setLocalApiUrl] = React.useState(apiUrl);
  const [isLoadingApi, setisLoadingApi] = React.useState(false);
  // React.useEffect(() => {
  // setIsLoading(false);
  // if (authenticated) {
  // if (authState.authenticated) {
  // if (role === "SUPER_ADMIN") {
  //   router.replace("/admin");
  // } else if (role === "DEFAULT_USER") {
  //   router.replace("/user");
  // }
  // }
  // }
  // }, [role]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleLogin = async (data: FormData) => {
    Keyboard.dismiss();
    setIsSubmitting(true);
    try {
      const userData = await login(data.email, data.password);

      // Navigasi berdasarkan role
      switch (userData.role) {
        case "SUPER_ADMIN":
          router.replace("/admin");
          break;
        case "DEFAULT_USER":
          router.replace("/user");
          break;
      }

      // const response = await axios.post(`${apiUrl}/api/auth/login/email`, {
      //   email: data.email,
      //   password: data.password,
      // });

      // const { token } = response.data.data;
      // await AsyncStorage.setItem("userToken", token);

      // await fetchUserData();

      // setIsSubmitting(false);

      // Toast.show({
      //   type: "success",
      //   text1: "Login Success",
      //   text2: "You have successfully logged in.",
      //   visibilityTime: 3000,
      // });
    } catch (error: Error | any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Login failed. Please try again.";

      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: errorMessage,
        visibilityTime: 3000,
      });

      console.error("Login failed:", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveApiKey = async () => {
    if (!localApiUrl.trim()) {
      Toast.show({
        type: "error",
        text1: "Error saving API key",
        text2: "Please enter an API key.",
        visibilityTime: 3000,
      });
      return;
    }

    setisLoadingApi(true);
    try {
      await setApiUrl(localApiUrl);
      Toast.show({
        type: "success",
        text1: "API key saved",
        visibilityTime: 3000,
      });
    } catch (error) {
      console.error("Error saving API key:", error);
      Toast.show({
        type: "error",
        text1: "Error saving API key",
        text2: "An error occurred while saving the API key. Please try again.",
        visibilityTime: 3000,
      });
    } finally {
      setisLoadingApi(false);
    }
  };

  return (
    <View className="flex-1 justify-center items-center">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 w-full"
      >
        <View className="w-full flex-1 justify-center px-6">
          <View className="mb-10 px-4">
            <Text className="font-semibold tracking-tight text-2xl text-center dark:text-gray-100">
              Voting App
            </Text>
            <Text className="text-sm text-neutral-400 text-center">
              Lorem ipsum, dolor sit amet consectetur adipisicing elit. Aliquam
              quaerat placeat sapiente at reprehenderit eveniet.
            </Text>
          </View>

          {/* <Text>{role || "No role"}</Text>
          <Text>{apiUrl || "No API URL"}</Text> */}

          <View className="mb-2">
            <Text className="text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
              Email
            </Text>
            <Controller
              name="email"
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <>
                  <TextInput
                    placeholder="e.g. user@example.com"
                    placeholderClassName="dark:teg-gray-100"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholderTextColor="#9CA3AF"
                    className={clsx(
                      "w-full px-3 py-2 text-base border rounded-md dark:text-gray-100",
                      errors.email
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    )}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    returnKeyType="next"
                    onSubmitEditing={() => {
                      passwordRef.current?.focus();
                      Keyboard.isVisible;
                    }}
                  />
                  {errors.email && (
                    <Text className="text-red-500">{errors.email.message}</Text>
                  )}
                </>
              )}
            />
          </View>

          <View className="mb-2">
            <Text className="text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
              Password
            </Text>
            <Controller
              name="password"
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <>
                  <TextInput
                    ref={passwordRef}
                    placeholder="e.g. ********"
                    secureTextEntry
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholderTextColor="#9CA3AF"
                    className={clsx(
                      "w-full px-3 py-2 text-base border rounded-md dark:text-gray-100",
                      errors.password
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    )}
                    returnKeyType="next"
                    onSubmitEditing={() => {
                      handleSubmit(handleLogin);
                      Keyboard.dismiss();
                    }}
                  />
                  {errors.password && (
                    <Text className="text-red-500">
                      {errors.password.message}
                    </Text>
                  )}
                </>
              )}
            />
          </View>

          <Button
            className="w-full"
            onPress={handleSubmit(handleLogin)}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text className="text-white text-center font-semibold dark:text-gray-900">
                Sign In
              </Text>
            )}
          </Button>

          <View className="mt-4 flex-row justify-center">
            <Text className="text-sm text-gray-600 dark:text-gray-200">
              Haven't any account?{" "}
            </Text>
            <Link href="/(auth)/register" replace>
              <Text className="text-sm font-semibold dark:text-gray-200">
                Register
              </Text>
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>

      <Dialog className="w-full">
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size={"icon"}
            className="absolute bottom-2 right-4 p-8 rounded-full"
            disabled={isLoadingApi || isLoading}
          >
            <Save className="text-gray-900" size={24} />
          </Button>
        </DialogTrigger>
        <DialogContent className="p-4 sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>API Url</DialogTitle>
            <DialogDescription>
              Change the API URL to connect to the server API.
              {/* <View className="w-full">
                <TextInput
                  value={localApiUrl}
                  onChangeText={setLocalApiUrl}
                  placeholder="https://XXX.XXX.XXX.XXX:3000"
                  className="w-full mb-3 px-3 py-2 border rounded-md border-gray-300 dark:border-gray-700"
                />
              </View> */}
            </DialogDescription>
          </DialogHeader>
          <View className="w-full">
            <TextInput
              value={localApiUrl}
              onChangeText={setLocalApiUrl}
              placeholder="https://XXX.XXX.XXX.XXX:3000"
              placeholderTextColor="#9CA3AF"
              className="w-full mb-3 px-3 py-2 border rounded-md text-gray-900 dark:text-white border-gray-300 dark:border-gray-700"
            />
          </View>
          <DialogFooter>
            <DialogClose asChild>
              <Button onPress={saveApiKey}>
                {isLoadingApi || isLoading ? (
                  <View className="flex-row items-center">
                    <ActivityIndicator
                      size="small"
                      className="text-white dark:text-gray-900"
                    />
                    <Text className="text-white dark:text-gray-900">
                      Saving
                    </Text>
                  </View>
                ) : (
                  <View className="flex-row items-center">
                    <Save
                      className="mr-2 text-white dark:text-gray-900"
                      size={20}
                    />
                    <Text className="text-white dark:text-gray-900">
                      Save API URL
                    </Text>
                  </View>
                )}
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </View>
  );
}
