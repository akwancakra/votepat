import * as React from "react";
import { Link, router, Stack, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  View,
  RefreshControl,
} from "react-native";
import { Card } from "~/components/ui/card";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "~/components/ui/dropdown-menu";
// import { Button } from "~/components/ui/button";
import { CalendarDays } from "~/lib/icons/CalendarDays";
// import { Ellipsis } from "~/lib/icons/Ellipsis";
// import { Edit } from "~/lib/icons/Edit";
// import { Trash2 } from "~/lib/icons/Trash2";
// import { ClipboardCheck } from "~/lib/icons/ClipboardCheck";
import { Candidate, CandidatePair, Event } from "~/lib/types";
import axios from "axios";
// import { useAuth } from "~/context/AuthContext";
// import { apiUrl } from "~/lib/constants";
import Toast from "react-native-toast-message";
import { formatDate, getCandidatePairs } from "~/lib/utils";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
// import { useAuth } from "~/lib/hooks/useAuth";
import { useAuthStore } from "~/store/authStore";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogTrigger,
// } from "~/components/ui/alert-dialog";

interface EventDetailProps {
  event: Event;
  candidates: CandidatePair[];
  totalVotes: number;
  candidateVotes: CandidateVote[];
}

interface CandidateVote {
  candidateId: string;
  position: string;
  votes: number;
}

interface EventResponse {
  success: boolean;
  data: {
    event: Event;
    totalVotes: number;
    candidateVotes: CandidateVote[];
  };
}

export default function EditEvent() {
  const { token, apiUrl } = useAuthStore();
  // const { authState } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const { id } = useLocalSearchParams();
  const [eventDetail, setEventDetail] = React.useState<EventDetailProps>(
    {} as EventDetailProps
  );
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  // function used for fetching event data
  const fetchEvent = async (setStatus: (loading: boolean) => void) => {
    setStatus(true);
    try {
      const response = await axios.get(`${apiUrl}/api/events/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        const eventData: EventResponse = response.data;
        const candidatePairs: CandidatePair[] = getCandidatePairs(
          eventData.data.event?.candidates || []
        );

        setEventDetail({
          event: eventData.data.event,
          candidates: candidatePairs,
          totalVotes: eventData.data.totalVotes,
          candidateVotes: eventData.data.candidateVotes,
        });
      }
    } catch (error) {
      console.error("Error fetching event:", error);
      Toast.show({
        type: "error",
        text1: "Error fetching event",
        text2: "Please try again later",
        visibilityTime: 3000,
      });
    } finally {
      setStatus(false);
    }
  };

  React.useEffect(() => {
    if (token && id) {
      fetchEvent(setLoading);
    }
  }, [token, id]);

  const handleRefresh = async () => {
    // setPage(1);
    // setHasMore(true);
    await fetchEvent(setIsRefreshing);
  };

  if (loading || isRefreshing) {
    return (
      <SafeAreaView className="flex-1">
        <View className="p-4">
          <Skeleton className={"w-1/2 h-6 mb-2"} />
          <Skeleton className={"w-full h-28 mb-4"} />

          <Skeleton className={"w-36 h-6 mb-2"} />
          <Skeleton className={"w-full h-1/2 mb-4"} />
        </View>
      </SafeAreaView>
    );
  }

  const renderCandidatePair = ({ pair }: { pair: CandidatePair }) => {
    const totalVotes =
      (eventDetail.candidateVotes.find(
        (vote) => vote.candidateId === pair.chairman.id
      )?.votes || 0) +
      (eventDetail.candidateVotes.find(
        (vote) => vote.candidateId === pair.viceChairman.id
      )?.votes || 0);

    return (
      <Card className="p-4 mb-4 rounded-lg shadow dark:border-gray-600">
        <View>
          <Text className="font-semibold text-xl dark:text-gray-100">
            Candidate {eventDetail.candidates?.indexOf(pair) + 1} Pair
          </Text>
        </View>

        <Separator className="my-4 dark:bg-gray-600" />

        {/* Chairman */}
        <View className="flex-row items-center justify-between">
          <View className="flex-1 flex-col items-center justify-center">
            <Image
              source={{ uri: pair.chairman.photo }}
              className="w-16 h-16 rounded-full"
            />
            <Text className="font-bold text-lg dark:text-gray-100">
              {pair.chairman.name}
            </Text>
            <Text className="text-gray-600 dark:text-gray-400">Chairman</Text>
          </View>

          {/* Divider */}
          <View className="w-0.5 h-16 bg-gray-300 mx-4 dark:bg-gray-600" />

          {/* Vice Chairman */}
          <View className="flex-1 flex-col items-center justify-center">
            <Image
              source={{ uri: pair.viceChairman.photo }}
              className="w-16 h-16 rounded-full"
            />
            <Text className="font-bold text-lg dark:text-gray-100">
              {pair.viceChairman.name}
            </Text>
            <Text className="text-gray-600 dark:text-gray-400">
              Vice Chairman
            </Text>
          </View>
        </View>

        <View className="flex flex-col gap-4">
          <View>
            <Text className="text-gray-600 font-semibold dark:text-gray-400">
              Visi
            </Text>
            <Text className="text-gray-600 dark:text-gray-100">
              {pair.chairman.visi}
            </Text>
          </View>
          <View>
            <Text className="text-gray-600 font-semibold dark:text-gray-400">
              Misi
            </Text>
            <Text className="text-gray-600 dark:text-gray-100">
              {pair.chairman.misi}
            </Text>
          </View>
          <View>
            <Text className="text-gray-600 font-semibold dark:text-gray-400">
              Comment
            </Text>
            <Text className="text-gray-600 dark:text-gray-100">
              {pair.chairman.comment}
            </Text>
          </View>
        </View>

        <Separator className="my-4" />

        <View className="flex-row justify-between">
          <View>
            <Text className="font-bold text-lg dark:text-gray-400">Votes</Text>
            <Text className="text-gray-600 dark:text-gray-100">
              {totalVotes}
            </Text>
          </View>
          <View className="items-end">
            {/* item.votes / event.totalVotes */}
            <Text className="font-bold text-lg dark:text-gray-100">
              {((totalVotes / eventDetail.totalVotes) * 100).toFixed(1)}%
            </Text>
            <View className="w-36 h-2 bg-gray-200 rounded-full mt-1">
              <View
                className="h-2 bg-blue-500 rounded-full"
                style={{
                  width: `${(totalVotes / eventDetail.totalVotes) * 100}%`,
                }}
              />
            </View>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView className="flex-1">
      <Stack.Screen
        options={{
          title: eventDetail.event?.title || "Detail Event",
        }}
      />

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        <View className="p-4">
          <View>
            <Text className="text-2xl font-bold dark:text-gray-100">
              {eventDetail.event?.title}
            </Text>
            <View className="flex-row items-center mb-4 gap-2">
              <CalendarDays
                className="text-gray-800 dark:text-white"
                size={20}
                strokeWidth={1.5}
              />
              <Text className="text-gray-600 dark:text-gray-400">
                {formatDate(new Date(eventDetail.event?.startDate))} -{" "}
                {formatDate(new Date(eventDetail.event?.endDate))}
              </Text>
            </View>
          </View>

          <Card className="p-4 rounded-lg shadow mb-4 dark:border-gray-600">
            <Text className="text-lg font-semibold mb-2 dark:text-gray-100">
              Statistics
            </Text>
            <View className="flex-row justify-between">
              <View>
                <Text className="text-gray-600 dark:text-gray-400">
                  Total Votes
                </Text>
                <Text className="text-2xl font-bold dark:text-gray-100">
                  {eventDetail.totalVotes || "-"}
                </Text>
              </View>
              <View>
                <Text className="text-gray-600 dark:text-gray-400">
                  Candidates
                </Text>
                <Text className="text-2xl font-bold dark:text-gray-100">
                  {eventDetail.candidates?.length || "-"}
                </Text>
              </View>
            </View>
          </Card>

          <Text className="text-xl font-bold mb-2 dark:text-gray-100">
            Candidate Pairs
          </Text>
          {eventDetail.candidates?.map((pair, index) => (
            <React.Fragment key={index}>
              {renderCandidatePair({ pair })}
            </React.Fragment>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
