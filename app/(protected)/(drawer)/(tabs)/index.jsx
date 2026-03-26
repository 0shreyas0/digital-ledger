import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import {
  Alert,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SignOutButton } from "@/components/signOutButton";
import { useTransactions } from "@/hooks/useTransactions";
import { useCallback, useState } from "react";
import PageLoader from "@/components/PageLoader";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import BalanceCard from "@/components/BalanceCard";
import TransactionItem from "@/components/TransactionItem";
import NoTransactionFound from "@/components/NoTransactionFound";
// import { useColorScheme } from "nativewind";
import BluePressable from "@/components/pressables/BluePressable";

export default function Page() {
  const { user } = useUser();
  const router = useRouter();
  const [currency, setCurrency] = useState("₹");
  // const { colorScheme, toggleColorScheme } = useColorScheme();
  const { transactions, summary, isLoading, loadData, deleteTransaction } =
    useTransactions(user.id);

  const [refreshing, setRefreshing] = useState(false);

  const handleDelete = (id) => {
    Alert.alert(
      "Delete Transaction",
      "Are you sure you want to delete this transaction?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteTransaction(id),
        },
      ],
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  console.log("userId:", user.id);
  console.log("transactions:", transactions);
  console.log("summary:", summary);

  if (isLoading && !refreshing) return <PageLoader />;

  return (
    <View className="bg-background flex-1">
      <View>
        <View className="flex-row justify-between">
          <View className="flex-row items-center gap-3 px-4 pt-2">
            <Image
              source={require("@/assets/images/logo.png")}
              style={{ height: 50, width: 50 }}
              contentFit="contain"
            />
            <View>
              <Text className="font-sansBold color-slate-400">Welcome,</Text>
              <Text className="font-sansMed">
                {user.username}
                {/* {user?.emailAddresses[0]?.emailAddress.split("@")[0]} */}
              </Text>
            </View>
          </View>
          <View className="flex-row items-center mx-6 gap-2">
            <BluePressable name={"add"} text={"Add"} onPress={() => router.push("/create")}/>
            <SignOutButton />
          </View>
        </View>
        <BalanceCard currency={currency} summary={summary} />

        <View className="p-3 ml-3">
          <Text className="font-sansBold text-xl">Recent Transactions</Text>
        </View>
      </View>
      <FlatList
        style={{ flex: 1, marginHorizontal: 20 }}
        contentContainerStyle={{ paddingBottom: 20 }}
        data={transactions}
        renderItem={({ item }) => (
          <TransactionItem
            item={item}
            onDelete={handleDelete}
            currency={currency}
          />
        )}
        ListEmptyComponent={<NoTransactionFound />}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
      {/* <View className="ml-6 mb-6">
        <TouchableOpacity className="bg-slate-700 h-14 w-14 rounded-full items-center justify-center"
          onPress={toggleColorScheme}
        >          
        <Ionicons size={25} name={colorScheme == "dark" ? "moon": "bulb"} color={colorScheme == "dark" ? colors.blue[800] : colors.slate[50]}></Ionicons>
        </TouchableOpacity>
      </View> */}
    </View>
  );
}
