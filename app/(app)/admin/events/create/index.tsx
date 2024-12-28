import { router, Stack } from "expo-router";
import React from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Trash2 } from "~/lib/icons/Trash2";
import { Plus } from "~/lib/icons/Plus";
import { Save } from "~/lib/icons/Save";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Switch } from "~/components/ui/switch";
import { Label } from "~/components/ui/label";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import clsx from "clsx";
import Toast from "react-native-toast-message";
import axios from "axios";
// import { apiUrl } from "~/lib/constants";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { formatDate } from "~/lib/utils";
import { useAuthStore } from "~/store/authStore";
// import { useAuth } from "~/lib/hooks/useAuth";

// Interface untuk form event
interface EventFormData {
  title: string;
  description: string;
  isActive: boolean;
  startDate: Date;
  endDate: Date;
  candidates: CandidatePair[];
}

// Tipe data untuk pasangan kandidat (ketua dan wakil)
interface CandidatePair {
  chairman: Candidate;
  viceChairman: Candidate;
}

// Interface untuk kandidat
interface Candidate {
  name: string;
  position?: string;
  photo?: string;
  sequence: number;
  visi?: string;
  misi?: string;
  comment?: string;
}

const schema = yup.object().shape({
  title: yup.string().required("Event title is required"),
  description: yup.string().required("Event description is required"),
  isActive: yup.boolean().default(false),
  startDate: yup.date().required("Start date is required"),
  endDate: yup
    .date()
    .required("End date is required")
    .min(yup.ref("startDate"), "End date must be after start date"),
  candidates: yup
    .array()
    .of(
      yup.object().shape({
        chairman: yup.object().shape({
          name: yup.string().required("Chairman name is required"),
          position: yup.string().optional(),
          sequence: yup.number().required("Sequence is required"),
          photo: yup.string().optional(),
          visi: yup.string().required("Vision is required"),
          misi: yup.string().required("Mission is required"),
          comment: yup.string().required("Comment is required"),
        }),
        viceChairman: yup.object().shape({
          name: yup.string().required("Vice chairman name is required"),
          position: yup.string().optional(),
          sequence: yup.number().required("Sequence is required"),
          photo: yup.string().optional(),
          visi: yup.string().optional(),
          misi: yup.string().optional(),
          comment: yup.string().optional(),
        }),
      })
    )
    .required("Candidates are required")
    .min(1, "At least one candidate pair is required"),
});

export default function CreateEventScreen() {
  const { token, apiUrl } = useAuthStore();
  // const { authState } = useAuth();
  // State untuk show/hide date picker
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showStartDate, setShowStartDate] = React.useState(false);
  const [showEndDate, setShowEndDate] = React.useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    getValues,
  } = useForm<EventFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      isActive: false,
      startDate: new Date(),
      endDate: new Date(),
      candidates: [
        {
          chairman: {
            name: "",
            position: "",
            photo: "",
            sequence: 1,
            visi: "",
            misi: "",
            comment: "-",
          },
          viceChairman: {
            name: "",
            position: "",
            photo: "",
            sequence: 1,
            visi: "",
            misi: "",
            comment: "",
          },
        },
      ] as CandidatePair[],
    },
  });

  // Fungsi untuk menambah kandidat baru
  const candidates = watch("candidates");

  const addCandidatePair = () => {
    const newCandidatePair = {
      chairman: {
        name: "",
        position: "",
        photo: "",
        sequence: candidates.length + 1,
        visi: "",
        misi: "",
        comment: "-",
      },
      viceChairman: {
        name: "",
        position: "",
        photo: "",
        sequence: candidates.length + 1,
        visi: "",
        misi: "",
        comment: "",
      },
    };
    setValue("candidates", [...candidates, newCandidatePair]);
  };

  const removeCandidatePair = (index: number) => {
    const updatedCandidatePairs = candidates.filter((_, i) => i !== index);
    setValue("candidates", updatedCandidatePairs);
  };

  // Handler untuk submit form
  const handleSubmitEvent = async (data: EventFormData) => {
    console.log("Request data:", data);
    Keyboard.dismiss();
    setIsSubmitting(true);

    try {
      const requestData = {
        title: data.title,
        description: data.description,
        isActive: data.isActive,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
        candidates: data.candidates.flatMap((pair) => [
          {
            ...pair.chairman,
            position: "chairman",
            photo: "https://avatar.iran.liara.run/public/47",
          },
          {
            ...pair.viceChairman,
            position: "vice",
            visi: pair.chairman.visi,
            misi: pair.chairman.misi,
            comment: pair.chairman.comment,
            photo: "https://avatar.iran.liara.run/public/56",
          },
        ]),
      };

      const response = await axios.post(`${apiUrl}/api/events`, requestData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response?.data?.success) {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Event successfully created!",
          visibilityTime: 3000,
        });

        // RETURN TO EVENT
        router.replace("/admin/events");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to create event. Please try again.";

      Toast.show({
        type: "error",
        text1: "Error",
        text2: errorMessage,
        visibilityTime: 3000,
      });

      console.error("Event creation failed:", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 w-full"
      >
        <ScrollView className="flex-1">
          <View className="p-4">
            <Text className="dark:text-gray-100">
              Lorem ipsum dolor, sit amet consectetur adipisicing elit. Et
              quibusdam in reiciendis ex, fuga voluptates!
            </Text>

            <View className="my-3">
              <Text className="text-xl font-semibold tracking-tight text-gray-700 mb-3 dark:text-gray-100">
                Event Details
              </Text>

              {/* PRINT ALL THE ERRORS */}
              {Object.keys(errors).length > 0 && (
                <View className="mb-4">
                  <Text className="text-red-500 text-sm">
                    Please fill all required fields
                  </Text>
                  {Object.values(errors).map((error, index) => (
                    <Text key={index} className="text-red-500 text-sm">
                      {error.message}
                    </Text>
                  ))}
                </View>
              )}

              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                  Title
                </Text>
                <Controller
                  name="title"
                  control={control}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <>
                      <TextInput
                        placeholder="e.g. Election Time"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        placeholderTextColor="#9CA3AF"
                        className={clsx(
                          "w-full px-3 py-2 text-base border rounded-md dark:text-gray-100",
                          errors.title
                            ? "border-red-500"
                            : "border-gray-300 dark:border-gray-600"
                        )}
                        returnKeyType="next"
                        onSubmitEditing={() => {
                          Keyboard.isVisible;
                        }}
                      />
                      {errors.title && (
                        <Text className="text-red-500 text-sm">
                          {errors.title.message}
                        </Text>
                      )}
                    </>
                  )}
                />
              </View>
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                  Description
                </Text>
                <Controller
                  name="description"
                  control={control}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <>
                      <TextInput
                        placeholder="e.g. Election Time"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        placeholderTextColor="#9CA3AF"
                        className={clsx(
                          "w-full px-3 py-2 text-base border rounded-md dark:text-gray-100",
                          errors.description
                            ? "border-red-500"
                            : "border-gray-300 dark:border-gray-600"
                        )}
                        returnKeyType="next"
                        onSubmitEditing={() => {
                          Keyboard.isVisible;
                        }}
                        multiline={true}
                        numberOfLines={3}
                      />
                      {errors.description && (
                        <Text className="text-red-500 text-sm">
                          {errors.description.message}
                        </Text>
                      )}
                    </>
                  )}
                />
              </View>
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                  Start Date
                </Text>
                <Controller
                  name="startDate"
                  control={control}
                  render={({ field: { onChange, value } }) => {
                    const dateValue = value ? new Date(value) : new Date();

                    return (
                      <>
                        <Button
                          variant="outline"
                          onPress={() => setShowStartDate(true)}
                          className="ps-3 flex flex-row items-center justify-start dark:border-gray-600"
                        >
                          <Text className="text-start dark:text-gray-100">
                            {formatDate(dateValue)}
                          </Text>
                        </Button>
                        {showStartDate && (
                          <DateTimePicker
                            mode="date"
                            value={dateValue}
                            onChange={(_, selectedDate) => {
                              setShowStartDate(false);
                              if (selectedDate) {
                                onChange(selectedDate.toISOString());
                              }
                            }}
                          />
                        )}
                        {errors.startDate && (
                          <Text className="text-red-500 text-sm">
                            {errors.startDate.message}
                          </Text>
                        )}
                      </>
                    );
                  }}
                />
              </View>
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                  End Date
                </Text>
                <Controller
                  name="endDate"
                  control={control}
                  render={({ field: { onChange, value } }) => {
                    const dateValue = value ? new Date(value) : new Date();

                    return (
                      <>
                        <Button
                          variant="outline"
                          onPress={() => setShowEndDate(true)}
                          className="ps-3 flex flex-row items-center justify-start dark:border-gray-600"
                        >
                          <Text className="text-start dark:text-gray-100">
                            {formatDate(dateValue)}
                          </Text>
                        </Button>
                        {showEndDate && (
                          <DateTimePicker
                            mode="date"
                            value={dateValue}
                            onChange={(_, selectedDate) => {
                              setShowEndDate(false);
                              if (selectedDate) {
                                onChange(selectedDate.toISOString());
                              }
                            }}
                          />
                        )}
                        {errors.endDate && (
                          <Text className="text-red-500 text-sm">
                            {errors.endDate.message}
                          </Text>
                        )}
                      </>
                    );
                  }}
                />
              </View>

              <Separator className="my-3" />

              <Text className="text-xl font-semibold tracking-tight text-gray-700 mb-3 dark:text-gray-100">
                Candidates
              </Text>

              {candidates.map((_, index) => (
                <Card key={index} className="mb-4 p-3 border rounded-md">
                  <View className="flex flex-row justify-between items-center">
                    <Text className="text-lg font-semibold text-gray-700 mb-1 dark:text-gray-100">
                      Candidate Pair {index + 1}
                    </Text>
                    <Button
                      variant={"outline"}
                      size={"icon"}
                      onPress={() => removeCandidatePair(index)}
                      disabled={candidates.length === 1}
                    >
                      <Trash2
                        size={18}
                        strokeWidth={1.5}
                        className="text-gray-700 dark:text-gray-100"
                      />
                    </Button>
                  </View>

                  <Separator className="my-3" />

                  {/* Input untuk Ketua */}
                  <View className="mb-2">
                    <Text className="text-sm font-medium text-gray-700 mb-1 dark:text-gray-100">
                      Chairman Name
                    </Text>
                    <Controller
                      control={control}
                      name={`candidates.${index}.chairman.name`}
                      render={({ field: { onChange, value } }) => (
                        <TextInput
                          placeholder="Chairman Name"
                          onChangeText={onChange}
                          value={value}
                          placeholderTextColor="#9CA3AF"
                          className={`w-full px-3 py-2 border rounded-md ${
                            errors.candidates?.[index]?.chairman?.name
                              ? "border-red-500"
                              : "border-gray-300 dark:border-gray-600"
                          }`}
                        />
                      )}
                    />
                    {errors.candidates?.[index]?.chairman?.name && (
                      <Text className="text-red-500 text-sm">
                        {errors.candidates?.[index]?.chairman?.name?.message}
                      </Text>
                    )}
                  </View>

                  <View className="mb-2">
                    {/* Input untuk Wakil (dengan sequence, visi, misi, dll. yang sama) */}
                    <Text className="text-sm font-medium text-gray-700 mt-2 mb-1 dark:text-gray-100">
                      Vice Chairman Name
                    </Text>
                    <Controller
                      control={control}
                      name={`candidates.${index}.viceChairman.name`}
                      render={({ field: { onChange, value } }) => (
                        <TextInput
                          placeholder="Vice Chairman Name"
                          onChangeText={onChange}
                          value={value}
                          placeholderTextColor="#9CA3AF"
                          className={`w-full px-3 py-2 border rounded-md ${
                            errors.candidates?.[index]?.viceChairman?.name
                              ? "border-red-500"
                              : "border-gray-300 dark:border-gray-600"
                          }`}
                        />
                      )}
                    />
                    {errors.candidates?.[index]?.viceChairman?.name && (
                      <Text className="text-red-500 text-sm">
                        {
                          errors.candidates?.[index]?.viceChairman?.name
                            ?.message
                        }
                      </Text>
                    )}
                  </View>

                  {/* Visi dan Misi (untuk ketua dan wakil akan sama) */}
                  <View className="mb-2">
                    <Text className="text-sm font-medium text-gray-700 mb-1 dark:text-gray-100">
                      Vision
                    </Text>
                    <Controller
                      control={control}
                      name={`candidates.${index}.chairman.visi`}
                      render={({ field: { onChange, value } }) => (
                        <TextInput
                          placeholder="Candidate Vision"
                          onChangeText={onChange}
                          value={value}
                          placeholderTextColor="#9CA3AF"
                          multiline
                          numberOfLines={3}
                          className={`w-full px-3 py-2 border rounded-md ${
                            errors.candidates?.[index]?.chairman?.visi
                              ? "border-red-500"
                              : "border-gray-300 dark:border-gray-600"
                          }`}
                        />
                      )}
                    />
                    {errors.candidates?.[index]?.chairman?.visi && (
                      <Text className="text-red-500 text-sm">
                        {errors.candidates?.[index]?.chairman?.visi?.message}
                      </Text>
                    )}
                  </View>

                  <View className="mb-2">
                    <Text className="text-sm font-medium text-gray-700 mb-1 dark:text-gray-100">
                      Mission
                    </Text>
                    <Controller
                      control={control}
                      name={`candidates.${index}.chairman.misi`}
                      render={({ field: { onChange, value } }) => (
                        <TextInput
                          placeholder="Candidate Mission"
                          onChangeText={onChange}
                          value={value}
                          placeholderTextColor="#9CA3AF"
                          multiline
                          numberOfLines={3}
                          className={`w-full px-3 py-2 border rounded-md ${
                            errors.candidates?.[index]?.chairman?.misi
                              ? "border-red-500"
                              : "border-gray-300 dark:border-gray-600"
                          }`}
                        />
                      )}
                    />
                    {errors.candidates?.[index]?.chairman?.misi && (
                      <Text className="text-red-500 text-sm">
                        {errors.candidates?.[index]?.chairman?.misi?.message}
                      </Text>
                    )}
                  </View>

                  <View className="mb-2">
                    <Text className="text-sm font-medium text-gray-700 mb-1 dark:text-gray-100">
                      Comment/Description
                    </Text>
                    <Controller
                      control={control}
                      name={`candidates.${index}.chairman.comment`}
                      render={({ field: { onChange, value } }) => (
                        <TextInput
                          placeholder="Candidate Comment"
                          onChangeText={onChange}
                          value={value}
                          placeholderTextColor="#9CA3AF"
                          multiline
                          numberOfLines={3}
                          className={`w-full px-3 py-2 border rounded-md ${
                            errors.candidates?.[index]?.chairman?.comment
                              ? "border-red-500"
                              : "border-gray-300 dark:border-gray-600"
                          }`}
                        />
                      )}
                    />
                  </View>
                </Card>
              ))}

              <Button
                variant={"outline"}
                className="flex flex-row items-center gap-2 my-3"
                onPress={addCandidatePair}
              >
                <Plus
                  size={18}
                  strokeWidth={1.5}
                  className="text-gray-700 dark:text-gray-100"
                />
                <Text className="dark:text-gray-100">Add Candidate Pair</Text>
              </Button>

              <View className="mb-4 flex flex-row items-center gap-2">
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <>
                      <Switch
                        checked={value}
                        onCheckedChange={onChange}
                        onBlur={onBlur}
                        nativeID="active"
                      />
                      <Label
                        htmlFor="active"
                        className="text-sm font-medium text-gray-700 dark:text-gray-100"
                      >
                        Set as active event
                      </Label>
                      {errors.isActive && (
                        <Text className="text-red-500 text-sm">
                          {errors.isActive.message}
                        </Text>
                      )}
                    </>
                  )}
                />
              </View>

              <View className="flex flex-row justify-end">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button className="flex flex-row items-center gap-2">
                      <Save
                        size={20}
                        strokeWidth={1.5}
                        className="text-gray-100 dark:text-gray-900"
                      />
                      <Text className="text-gray-100 dark:text-gray-900">
                        Save
                      </Text>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete your account and remove your data from our
                        servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>
                        <Text>Cancel</Text>
                      </AlertDialogCancel>
                      <AlertDialogAction
                        className="flex flex-row items-center gap-2"
                        onPress={handleSubmit(handleSubmitEvent)}
                        disabled={isSubmitting || !!errors.candidates?.length}
                      >
                        <Save
                          size={20}
                          strokeWidth={1.5}
                          className="text-gray-100 dark:text-gray-900"
                        />
                        <Text className="text-gray-100 dark:text-gray-900">
                          Save
                        </Text>
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
