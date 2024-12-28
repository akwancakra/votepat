import React from "react";
import { Button } from "~/components/ui/button";
import { Text, TextInput, View, ActivityIndicator } from "react-native";
import Toast from "react-native-toast-message";
import { Separator } from "~/components/ui/separator";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { useAuthStore } from "~/store/authStore";
import { Save } from "~/lib/icons/Save";
// import { useAuth } from "~/lib/hooks/useAuth";

export const SettingsScreen = () => {
  const { apiUrl, setApiUrl } = useAuthStore();
  // const { authState, setApiUrl } = useAuth();
  const [localApiUrl, setLocalApiUrl] = React.useState(apiUrl);
  const [isLoading, setIsLoading] = React.useState(false);

  // useEffect(() => {
  //   loadApiUrl();
  // }, [loadApiUrl]);

  // useEffect(() => {
  //   setLocalApiUrl(apiUrl);
  // }, [apiUrl]);

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

    setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  return (
    <View className="p-4">
      <Card>
        <CardHeader className="p-3">
          <Text className="font-semibold text-lg dark:text-gray-100">
            API URL
          </Text>
        </CardHeader>
        <Separator className="my-0.5 dark:bg-gray-700" />
        <CardContent className="p-3">
          <View className="mb-2">
            <Text className="text-sm font-medium text-gray-700 mb-1 dark:text-gray-100">
              API
            </Text>
            <TextInput
              value={localApiUrl}
              onChangeText={setLocalApiUrl}
              placeholder="https://XXX.XXX.XXX.XXX:3000"
              placeholderTextColor="#9CA3AF"
              className="w-full mb-3 px-3 py-2 border rounded-md text-gray-900 dark:text-white border-gray-300 dark:border-gray-700"
            />
            <Button onPress={saveApiKey} disabled={isLoading}>
              {isLoading ? (
                <View className="flex-row items-center">
                  <ActivityIndicator
                    size="small"
                    className="text-white dark:text-gray-900"
                  />
                  <Text className="text-white dark:text-gray-900">Saving</Text>
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
          </View>
        </CardContent>
      </Card>
    </View>
  );
};

export default SettingsScreen;
