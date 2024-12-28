import * as React from "react";
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Link, router } from "expo-router";
import { Button } from "~/components/ui/button";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import clsx from "clsx";
import axios from "axios";
import Toast from "react-native-toast-message";
// import { apiUrl } from "~/lib/constants";
import { useAuthStore } from "~/store/authStore";
// import { useAuth } from "~/lib/hooks/useAuth";

type FormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const schema = yup.object().shape({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Password confirmation is required"),
});

export default function Register() {
  // const { authState } = useAuth();
  const { apiUrl } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Refs for each input field
  const nameRef = React.useRef<TextInput>(null);
  const emailRef = React.useRef<TextInput>(null);
  const passwordRef = React.useRef<TextInput>(null);
  const confirmPasswordRef = React.useRef<TextInput>(null);

  const handleRegister = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await axios.post(`${apiUrl}/api/auth/register/user`, data);

      // Success toast and navigation
      Toast.show({
        type: "success",
        text1: "Registration Successful",
        text2: "You can now log in",
        visibilityTime: 2000,
        onHide: () => router.replace("/"),
      });
    } catch (error) {
      // Improved error handling
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Registration failed. Please try again.";

        Toast.show({
          type: "error",
          text1: "Registration Error",
          text2: errorMessage,
          visibilityTime: 3000,
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "An unexpected error occurred",
          visibilityTime: 3000,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1 justify-center items-center">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 w-full"
        >
          <View className="w-full flex-1 justify-center px-6">
            <View className="mb-10 px-4">
              <Text className="font-semibold tracking-tight text-2xl text-center dark:text-gray-100">
                Create New Account
              </Text>
            </View>

            <View className="mb-2">
              <Text className="text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                Name
              </Text>
              <Controller
                name="name"
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <>
                    <TextInput
                      ref={nameRef}
                      placeholder="e.g. John Doe"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      placeholderTextColor="#9CA3AF"
                      className={clsx(
                        "w-full px-3 py-2 text-base border rounded-md dark:text-gray-100",
                        errors.name
                          ? "border-red-500"
                          : "border-gray-300 dark:border-gray-600"
                      )}
                      returnKeyType="next"
                      onSubmitEditing={() => emailRef.current?.focus()}
                    />
                    {errors.name && (
                      <Text className="text-red-500">
                        {errors.name.message}
                      </Text>
                    )}
                  </>
                )}
              />
            </View>

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
                      ref={emailRef}
                      placeholder="e.g. user@example.com"
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
                      onSubmitEditing={() => passwordRef.current?.focus()}
                    />
                    {errors.email && (
                      <Text className="text-red-500">
                        {errors.email.message}
                      </Text>
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
                      onSubmitEditing={() =>
                        confirmPasswordRef.current?.focus()
                      }
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

            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                Confirm Password
              </Text>
              <Controller
                name="confirmPassword"
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <>
                    <TextInput
                      ref={confirmPasswordRef}
                      placeholder="e.g. ********"
                      secureTextEntry
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      placeholderTextColor="#9CA3AF"
                      className={clsx(
                        "w-full px-3 py-2 text-base border rounded-md dark:text-gray-100",
                        errors.confirmPassword
                          ? "border-red-500"
                          : "border-gray-300 dark:border-gray-600"
                      )}
                      returnKeyType="done"
                      onSubmitEditing={handleSubmit(handleRegister)}
                    />
                    {errors.confirmPassword && (
                      <Text className="text-red-500">
                        {errors.confirmPassword.message}
                      </Text>
                    )}
                  </>
                )}
              />
            </View>

            <Button
              className="w-full"
              disabled={isSubmitting}
              onPress={handleSubmit(handleRegister)}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text className="text-white text-center font-semibold dark:text-gray-900">
                  Register
                </Text>
              )}
            </Button>

            <View className="mt-4 flex-row justify-center">
              <Text className="text-sm text-gray-600 dark:text-gray-200">
                Already have an account?{" "}
              </Text>
              <Link href="/" replace>
                <Text className="text-sm font-semibold dark:text-gray-200">
                  Login
                </Text>
              </Link>
            </View>
          </View>
        </KeyboardAvoidingView>

        {/* Toast Component */}
        {/* <Toast /> */}
      </View>
    </TouchableWithoutFeedback>
  );
}
