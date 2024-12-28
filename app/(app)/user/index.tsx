import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetHandle,
} from "~/components/ui/bottom-sheet";
import { useSharedValue } from "react-native-reanimated";
import { CandidatePair, Event, PaginatorInfo, Vote } from "~/lib/types";
import { FlatList, RefreshControl } from "react-native-gesture-handler";
import { formatDate, getCandidatePairs } from "~/lib/utils";
import { Vote as VoteIcon } from "~/lib/icons/Vote";
import { Skeleton } from "~/components/ui/skeleton";
import axios from "axios";
// import { useAuth } from "~/context/AuthContext";
// import { apiUrl } from "~/lib/constants";
import Toast from "react-native-toast-message";
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
import { useAuthStore } from "~/store/authStore";
import { useColorScheme } from "~/lib/useColorScheme";
// import { useAuth } from "~/lib/hooks/useAuth";

interface CandidateVote {
  candidateId: string;
  position: string;
  votes: number;
}

interface EventDetailProps {
  event: Event;
  candidates: CandidatePair[];
  paginatorInfo: PaginatorInfo;
  candidateVotes: CandidateVote[];
}

interface EventResponse {
  success: boolean;
  data: {
    event: Event;
    votes: Vote[];
    paginatorInfo: PaginatorInfo;
    candidateVotes: CandidateVote[];
  };
}

export default function indexEvent() {
  const { isDarkColorScheme } = useColorScheme();
  const { token, apiUrl, userData } = useAuthStore();
  // const { authState } = useAuth();
  // const { authState } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [eventDetail, setEventDetail] = React.useState<EventDetailProps>(
    {} as EventDetailProps
  );
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  const [refresh, setRefresh] = React.useState(false);
  const [votes, setVotes] = React.useState<Vote[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isValidLoading, setIsValidLoading] = React.useState(false);
  const [userVote, setUserVote] = React.useState<Vote>({} as Vote);
  const [isVoteValid, setIsVoteValid] = React.useState<{
    checked: boolean;
    valid: boolean;
  }>({
    checked: false,
    valid: false,
  });
  // const bottomSheetRef = React.useRef<BottomSheet>(null);

  // BOTTOM SHEET
  const bottomSheetModalRef = React.useRef<BottomSheetModal>(null);

  // variables
  const snapPoints = React.useMemo(() => [600, "20%", "50%", "70%", "95%"], []);

  // Tambahkan ini di bawah deklarasi snapPoints
  const animatedIndex = useSharedValue(1);
  const animatedPosition = useSharedValue(0);

  // callbacks
  const handlePresentModalPress = React.useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const handleVoteCandidate = async (candidateId: string) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post(
        `${apiUrl}/api/events/${eventDetail.event.id}/vote`,
        {
          candidateId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        Toast.show({
          type: "success",
          text1: "Vote success",
          visibilityTime: 3000,
        });
        fetchEvent(1, setLoading);
      }

      handleRefresh();
    } catch (error) {
      console.log(error);
      Toast.show({
        type: "error",
        text1: "Failed to vote",
        visibilityTime: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckVoteIsValid = async () => {
    setIsValidLoading(true);
    try {
      const response = await axios.get(`${apiUrl}/api/events/check-vote`, {
        params: {
          userId: userVote.userId,
          eventId: userVote.eventId,
          candidateId: userVote.candidateId,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const isValidData = response.data?.data;
      if (isValidData?.valid) {
        Toast.show({
          type: "success",
          text1: "Your vote is saved on blockchain",
          visibilityTime: 3000,
        });

        setIsVoteValid({
          checked: true,
          valid: true,
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Your vote is not saved on blockchain",
          visibilityTime: 3000,
        });

        setIsVoteValid({
          checked: true,
          valid: false,
        });
      }
    } catch (error) {
      console.log(error);
      Toast.show({
        type: "error",
        text1: "Failed to check if vote is saved on blockchain",
        visibilityTime: 3000,
      });
    } finally {
      setIsValidLoading(false);
    }
  };

  const fetchEvent = async (
    currentPage: number,
    setStatus: (loading: boolean) => void
  ) => {
    if (loading) return;
    setStatus(true);

    try {
      const response = await axios.get(
        `${apiUrl}/api/events/active?pageParam=${currentPage}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const eventData: EventResponse = response.data;

      if (response.status === 200) {
        // Proses kandidat menjadi pasangan kandidat (chairman-vice)
        const candidatePairs: CandidatePair[] = getCandidatePairs(
          eventData.data.event?.candidates || []
        );

        // check if user has voted
        const userVote = eventData.data.votes.find(
          (vote) => vote.userId === userData?.id
        );
        if (userVote) {
          setUserVote({
            ...userVote,
          });
        }

        // Update detail event
        setEventDetail((_) => ({
          event: eventData.data.event,
          candidates: candidatePairs,
          paginatorInfo: eventData.data.paginatorInfo,
          candidateVotes: eventData.data.candidateVotes,
        }));

        // Update votes berdasarkan currentPage
        setVotes((prevVotes) => {
          if (currentPage === 1) {
            return eventData.data.votes;
          } else {
            const uniqueVotes = [...prevVotes, ...eventData.data.votes].filter(
              (vote, index, self) =>
                self.findIndex((v) => v.id === vote.id) === index
            );
            return uniqueVotes;
          }
        });

        // Set apakah masih ada data di halaman berikutnya
        setHasMore(eventData.data.paginatorInfo.hasNextPage);
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
      setStatus(false); // Set status loading menjadi false
    }
  };

  React.useEffect(() => {
    if (token) {
      fetchEvent(1, setLoading);
    }
  }, [token]);

  const handleRefresh = () => {
    setPage(1);
    setHasMore(true);
    fetchEvent(1, setIsRefreshing);
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      setPage((prevPage) => prevPage + 1);
      fetchEvent(page + 1, setRefresh);
    }
  };

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

  // RENDER LOADING SKELETON
  if (loading || isRefreshing) {
    return (
      <View className="p-4">
        <Text className="text-xl font-semibold tracking-tight mb-4 dark:text-gray-100">
          Candidate
        </Text>

        <Skeleton className={"w-full h-20 mb-3"} />
        <Skeleton className={"w-full h-20 mb-3"} />
        <Skeleton className={"w-full h-20 mb-3"} />

        <Text className="text-xl font-semibold tracking-tight mb-4 dark:text-gray-100">
          Recent Votes
        </Text>
        <Skeleton className={"w-full h-20 mb-3"} />
        <Skeleton className={"w-full h-20 mb-3"} />
        <Skeleton className={"w-full h-20 mb-3"} />
        <Skeleton className={"w-full h-20 mb-3"} />
        <Skeleton className={"w-full h-20 mb-3"} />
        <Skeleton className={"w-full h-20 mb-3"} />
      </View>
    );
  }

  // RENDER IF EVENT DETAIL IS EMPTY
  if (!eventDetail) {
    return (
      <View className="p-4">
        <Text className="text-xl font-semibold tracking-tight mb-4 dark:text-gray-100">
          Candidate
        </Text>
        <View>
          <Text className="text-center text-gray-500 dark:text-gray-400">
            There's no active event yet
          </Text>
        </View>
      </View>
    );
  }

  // if (isSubmitting) {
  //   return (
  //     <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
  //       <ActivityIndicator
  //         size="large"
  //         color={isDarkColorScheme ? "#fff" : "#000"}
  //       />
  //       <Text
  //         style={{
  //           marginTop: 10,
  //           fontSize: 16,
  //           color: isDarkColorScheme ? "#fff" : "#000",
  //         }}
  //       >
  //         {isSubmitting ? "Voting..." : "Loading..."}
  //       </Text>
  //     </View>
  //   );
  // }

  const getVoteStatusMessage = (voteStatus: {
    checked: boolean;
    valid: boolean;
  }) => {
    if (!voteStatus.checked) {
      return "Vote not checked on blockchain";
    }
    return voteStatus.valid
      ? "Your vote is saved on blockchain"
      : "Your vote is not saved on blockchain";
  };

  // RENDER CANDIDATE ITEM
  const renderCandidateItem = ({
    item,
    index,
  }: {
    item: CandidatePair;
    index: number;
  }) => {
    return (
      <>
        <TouchableOpacity onPress={handlePresentModalPress}>
          <Card className="p-4 mb-2 rounded-lg shadow dark:border-gray-700">
            <View className="flex-row items-center">
              <Text className="text-2xl font-bold mr-4 dark:text-gray-100">
                {index + 1}
              </Text>
              <View>
                <View className="flex-row items-center mb-4">
                  <Image
                    source={{ uri: item.chairman.photo }}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <View>
                    <Text className="font-semibold dark:text-gray-100">
                      {item.chairman.name}
                    </Text>
                  </View>
                </View>
                <View className="flex-row items-center">
                  <Image
                    source={{ uri: item.viceChairman.photo }}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <View>
                    <Text className="font-semibold dark:text-gray-100">
                      {item.viceChairman.name}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            {userVote && userVote.candidateId ? (
              userVote.candidateId === item.chairman.id ? (
                <>
                  <View>
                    <Separator className="my-4 dark:bg-gray-600" />
                    <Text className="dark:text-gray-100">
                      You voted for {item.chairman.name.split(" ")[0]} &{" "}
                      {item.viceChairman.name.split(" ")[0]}
                    </Text>

                    <View className="mt-2">
                      <Text className="font-semibold dark:text-gray-400">
                        Your transaction Hash
                      </Text>
                      <Text className="dark:text-gray-100">
                        {userVote.transactionHash || "No transaction hash"}
                      </Text>
                    </View>

                    <Separator className="my-4 dark:bg-gray-600" />
                    <View className="mt-2 flex flex-row items-center justify-between">
                      <View>
                        <Text className="font-semibold text-sm dark:text-gray-400">
                          Status
                        </Text>
                        <Text className="text-gray-900 dark:text-white">
                          {isValidLoading
                            ? "Checking..."
                            : getVoteStatusMessage(isVoteValid)}
                        </Text>
                      </View>
                      <Button onPress={handleCheckVoteIsValid}>
                        <Text className="text-white dark:text-gray-900">
                          {isValidLoading ? "Checking..." : "Check"}
                        </Text>
                      </Button>
                    </View>
                  </View>
                </>
              ) : (
                <View>
                  <Separator className="my-4 dark:bg-gray-600" />
                  <Text className="text-gray-900 dark:text-white">
                    You already voted
                  </Text>
                </View>
              )
            ) : (
              <>
                <Separator className="my-4" />
                <View className="flex-row justify-between items-center">
                  <View>
                    <Text className="dark:text-gray-100">
                      Click to see more
                    </Text>
                  </View>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button className="flex flex-row items-center gap-2">
                        <VoteIcon
                          size={20}
                          strokeWidth={1.5}
                          className="text-gray-100 dark:text-gray-900"
                        />
                        <Text className="text-gray-100 dark:text-gray-900">
                          Vote
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
                          <Text className="dark:text-gray-100">Cancel</Text>
                        </AlertDialogCancel>
                        <AlertDialogAction
                          className="flex flex-row items-center gap-2"
                          onPress={() => {
                            handleVoteCandidate(item.chairman.id);
                          }}
                          disabled={isSubmitting || loading || isRefreshing}
                        >
                          <VoteIcon
                            size={20}
                            strokeWidth={1.5}
                            className="text-gray-100 dark:text-gray-900"
                          />
                          <Text className="text-gray-100 dark:text-gray-900">
                            Vote Now
                          </Text>
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </View>
                <AlertDialog open={isSubmitting}>
                  <AlertDialogContent className="w-full">
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Your vote is submitting
                      </AlertDialogTitle>
                      <View>
                        <Text className="dark:text-white">
                          Please wait a moment
                        </Text>
                        <ActivityIndicator
                          className="mt-3"
                          size="large"
                          color={isDarkColorScheme ? "#fff" : "#000"}
                        />
                      </View>
                    </AlertDialogHeader>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </Card>
        </TouchableOpacity>
        <BottomSheetModal
          ref={bottomSheetModalRef}
          index={1}
          snapPoints={snapPoints}
          handleComponent={() => (
            <BottomSheetHandle
              className="mt-2"
              animatedIndex={animatedIndex}
              animatedPosition={animatedPosition}
            />
          )}
        >
          <BottomSheetView className="flex-1 items-center dark:bg-gray-900">
            <View className="w-full grid grid-cols-2 gap-2 mb-2 px-4 py-2">
              <View>
                <Text className="text-center font-semibold tracking-tight uppercase text-gray-500 text-lg dark:text-gray-200">
                  {item.chairman.name.split(" ")[0]} &{" "}
                  {item.viceChairman.name.split(" ")[0]}
                </Text>
              </View>
              <Separator className="my-2 dark:border-gray-600" />
              <View>
                <Text className="font-semibold tracking-tight uppercase text-gray-500 dark:text-gray-400">
                  Visi
                </Text>
                <Text className="dark:text-gray-100">
                  {item.viceChairman.visi}
                </Text>
              </View>
              <View>
                <Text className="font-semibold tracking-tight uppercase text-gray-500 dark:text-gray-400">
                  Misi
                </Text>
                <Text className="dark:text-gray-100">
                  {item.viceChairman.misi}
                </Text>
              </View>
              <View>
                <Text className="font-semibold tracking-tight uppercase text-gray-500 dark:text-gray-400">
                  Deskripsi
                </Text>
                <Text className="dark:text-gray-100">
                  {item.viceChairman.comment}
                </Text>
              </View>
            </View>
          </BottomSheetView>
        </BottomSheetModal>
      </>
    );
  };

  // RENDER VOTER ITEM
  const renderVoterItem = ({ item }: { item: Vote }) => {
    const name = item.user?.name || "Anonymous";
    const hiddenName = name
      .split("")
      .map((char: string, index: number) =>
        index === 0 || index === name.length - 1 ? char : "*"
      )
      .join("");
    return (
      <Card className="flex-row items-center justify-between p-4 mb-2 rounded-lg dark:border-gray-700">
        <View>
          <Text className="font-semibold dark:text-gray-100">{hiddenName}</Text>
          <Text className="text-gray-600 dark:text-gray-400">
            Voted for{" "}
            {
              eventDetail.candidates?.find(
                (c: CandidatePair) =>
                  c.chairman.id === item.candidateId ||
                  c.viceChairman.id === item.candidateId
              )?.chairman.name
            }
          </Text>
        </View>
        <Text className="text-sm text-gray-500">
          {formatDate(new Date(item.createdAt))}
        </Text>
      </Card>
    );
  };

  return (
    <SafeAreaView className="flex-1">
      <FlatList
        data={[{ key: "candidates" }, { key: "votes" }]}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        renderItem={({ item }) => {
          if (item.key === "candidates") {
            return (
              <View className="p-4">
                <Text className="text-xl font-semibold tracking-tight mb-4 dark:text-gray-100">
                  Candidate
                </Text>
                {eventDetail.candidates?.map((item, index) => (
                  <React.Fragment key={index}>
                    {renderCandidateItem({ item, index })}
                  </React.Fragment>
                ))}
              </View>
            );
          } else if (item.key === "votes") {
            return (
              <View className="p-4">
                <Text className="text-xl font-semibold tracking-tight mb-4 mt-6 dark:text-gray-100">
                  Recent Votes
                </Text>
                {votes?.length === 0 ? (
                  <View>
                    <Text className="text-center text-gray-500 dark:text-gray-400">
                      No votes yet
                    </Text>
                  </View>
                ) : (
                  <FlatList
                    data={votes}
                    renderItem={renderVoterItem}
                    keyExtractor={(item) => item.id.toString()}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.1}
                    ListFooterComponent={renderFooter}
                  />
                )}
              </View>
            );
          }
          return null;
        }}
        keyExtractor={(item) => item.key}
      />
    </SafeAreaView>
  );
}
