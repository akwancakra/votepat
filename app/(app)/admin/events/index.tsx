import React, { useState } from "react";
import {
  View,
  Text,
  Alert,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { Link, router, Stack } from "expo-router";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Plus } from "~/lib/icons/Plus";
import { Ellipsis } from "~/lib/icons/Ellipsis";
import { Edit } from "~/lib/icons/Edit";
import { Trash2 } from "~/lib/icons/Trash2";
import { NotebookText } from "~/lib/icons/NotebookText";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Event } from "~/lib/types";
// import { apiUrl } from "~/lib/constants";
import axios from "axios";
// import { useAuth } from "~/context/AuthContext";
import { Separator } from "@rn-primitives/dropdown-menu";
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
import Toast from "react-native-toast-message";
import { Skeleton } from "~/components/ui/skeleton";
import { RefreshControl } from "react-native-gesture-handler";
// import { useAuth } from "~/lib/hooks/useAuth";
import { useAuthStore } from "~/store/authStore";

// Definisikan tipe untuk response API
interface EventsResponse {
  success: boolean;
  data: {
    results: Event[];
    paginatorInfo: {
      currentPage: number;
      hasNextPage: boolean;
      totalRecords: number;
    };
  };
}

export default function EventListScreen() {
  const { token, apiUrl } = useAuthStore();
  // const { authState } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const fetchEvents = async (
    currentPage: number,
    setStatus: (loading: boolean) => void
  ) => {
    if (loading || !hasMore) return;
    setStatus(true);

    try {
      const response = await axios.get(
        `${apiUrl}/api/events?pageParam=${currentPage}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data: EventsResponse = response.data;

      if (data.success) {
        setEvents((prevEvents) =>
          currentPage === 1
            ? data.data.results
            : [...prevEvents, ...data.data.results]
        );

        // Update pagination status
        setHasMore(data.data.paginatorInfo.hasNextPage);
      }
    } catch (error) {
      console.error("Error fetching events:", error);

      Toast.show({
        type: "error",
        text1: "Error fetching events",
        text2: "An error occurred while fetching events. Please try again.",
        visibilityTime: 3000,
      });
    } finally {
      setStatus(false);
    }
  };

  const handleDeleteEvent = async (id: number | string) => {
    setIsSubmitting(true);

    try {
      await axios.delete(`${apiUrl}/api/events/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      Toast.show({
        type: "success",
        text1: "Event deleted",
        text2: "The event has been deleted successfully.",
      });

      setEvents((prevEvents) => prevEvents.filter((event) => event.id !== id));
    } catch (error) {
      console.error("Error deleting event:", error);

      Toast.show({
        type: "error",
        text1: "Error deleting event",
        text2: "An error occurred while deleting the event. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hook untuk memuat events pertama kali
  React.useEffect(() => {
    if (token) {
      fetchEvents(1, setLoading);
    }
  }, [token]);

  /**
   * Handle load more events when user reaches the end of the list.
   * Will fetch the next page of events if there are more events to load.
   */
  const handleLoadMore = () => {
    if (hasMore && !loading) {
      setPage((prevPage) => prevPage + 1);
      fetchEvents(page + 1, setRefresh);
    }
  };

  const handleRefresh = async () => {
    setPage(1);
    setHasMore(true);
    await fetchEvents(1, setIsRefreshing);
  };

  // RENDER LOADING SKELETON
  if (loading || isRefreshing || !events) {
    return (
      <View className="p-4">
        <Skeleton className="w-9/12 h-10 mb-4" />
        <Skeleton className="w-full h-36 mb-3" />
        <Skeleton className="w-full h-36 mb-3" />
        <Skeleton className="w-full h-36 mb-3" />
      </View>
    );
  }

  const renderEventItem = ({ item }: { item: Event }) => (
    <Card className="p-4 mb-2 rounded-lg shadow flex-row justify-between items-center dark:border-gray-700">
      <View className="flex-1">
        <Text className="font-bold text-lg dark:text-gray-100">
          {item.title}
        </Text>
        <View className="flex flex-row gap-3 items-center">
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-1 dark:text-gray-400">
              Start Date
            </Text>
            <Text className="text-gray-600 dark:text-gray-300">
              {new Intl.DateTimeFormat("en-US", {
                day: "numeric",
                month: "short",
                year: "numeric",
              }).format(new Date(item.startDate))}
            </Text>
          </View>
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-1 dark:text-gray-400">
              End Date
            </Text>
            <Text className="text-gray-600 dark:text-gray-300">
              {new Intl.DateTimeFormat("en-US", {
                day: "numeric",
                month: "short",
                year: "numeric",
              }).format(new Date(item.endDate))}
            </Text>
          </View>
        </View>
        <Separator className="my-2" />
        <View>
          {item.isActive ? (
            <View className="flex flex-row items-center gap-1">
              <View className="w-3 h-3 rounded-full bg-green-500"></View>
              <Text className="text-sm text-green-500 dark:text-green-300">
                Active
              </Text>
            </View>
          ) : (
            <View className="flex flex-row items-center gap-1">
              <View className="w-3 h-3 rounded-full bg-red-500"></View>
              <Text className="text-sm text-red-500 dark:text-red-300">
                Inactive
              </Text>
            </View>
          )}
        </View>
      </View>
      <View className="flex-row gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size={"icon"}
              className="dark:border-gray-700"
            >
              <Ellipsis
                className="text-gray-800 dark:text-white"
                size={20}
                strokeWidth={1.5}
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-52 mt-2" align="end">
            <DropdownMenuLabel>Action</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Link href={`/admin/events/show/${item.id}`} asChild>
              <DropdownMenuItem>
                <NotebookText
                  className="text-gray-900 dark:text-white"
                  size={20}
                  strokeWidth={1.5}
                />
                <Text className="dark:text-white">Detail</Text>
              </DropdownMenuItem>
            </Link>
            <Link href={`/admin/events/edit/${item.id}`} asChild>
              <DropdownMenuItem>
                <Edit
                  className="text-gray-900 dark:text-white"
                  size={20}
                  strokeWidth={1.5}
                />
                <Text className="dark:text-white">Edit</Text>
              </DropdownMenuItem>
            </Link>
            <DropdownMenuItem className="bg-red-100 dark:bg-red-800">
              <AlertDialog>
                <AlertDialogTrigger
                  className="flex flex-row items-center gap-2"
                  disabled={isSubmitting}
                >
                  <Trash2
                    className="text-red-500 dark:text-red-100"
                    size={20}
                    strokeWidth={1.5}
                  />
                  <Text className="text-red-500 dark:text-red-100">Remove</Text>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      your account and remove your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>
                      <Text>Cancel</Text>
                    </AlertDialogCancel>
                    <AlertDialogAction
                      className="flex flex-row items-center gap-2 "
                      onPress={() => handleDeleteEvent(item.id)}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <ActivityIndicator
                          size="small"
                          className="text-gray-100 dark:text-gray-900"
                        />
                      ) : (
                        <>
                          <Trash2
                            size={20}
                            strokeWidth={1.5}
                            className="text-gray-100 dark:text-gray-900"
                          />
                          <Text className="text-gray-100 dark:text-gray-900">
                            Remove
                          </Text>
                        </>
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </View>
    </Card>
  );

  // Footer loading indicator
  const renderFooter = () => {
    if (!refresh) return null;
    return (
      <View className="p-4 mx-auto">
        <ActivityIndicator
          size="large"
          className="text-gray-900 dark:text-gray-100"
        />
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 p-4">
      <FlatList
        className="mb-14"
        data={events}
        renderItem={renderEventItem}
        keyExtractor={(item) => item.id.toString()}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        ListHeaderComponent={
          <View>
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-2xl font-bold dark:text-white">Events</Text>
              <Link href={"/admin/events/create"} asChild>
                <Button
                  size={"icon"}
                  variant={"default"}
                  disabled={isSubmitting}
                >
                  <Plus
                    className="text-white dark:text-gray-900"
                    size={22}
                    strokeWidth={1.25}
                  />
                </Button>
              </Link>
            </View>
          </View>
        }
        ListEmptyComponent={
          !loading ? (
            <View className="flex justify-center items-center">
              <Text className="text-center text-lg dark:text-gray-100">
                No events available. Please add a new event.
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
