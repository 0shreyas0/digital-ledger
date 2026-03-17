import { SignedIn, SignedOut, useUser } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SignOutButton } from "@/components/signOutButton";
import { useTransactions } from "@/hooks/useTransactions";
import { useEffect, useState } from "react";
import PageLoader from "@/components/PageLoader";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import BalanceCard from "@/components/BalanceCard";
import TransactionItem from "@/components/TransactionItem";
import NoTransactionFound from "@/components/NoTransactionFound";
import colors from "tailwindcss/colors";
import { useColorScheme } from "nativewind";
import BluePressable from "@/components/pressables/BluePressable";

export default function Page() {
  const { user } = useUser();
  const router = useRouter();
  const [currency, setCurrency] = useState("₹");
  const { colorScheme, toggleColorScheme } = useColorScheme();
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

  useEffect(() => {
    loadData();
  }, [loadData]);

  console.log("userId:", user.id);
  console.log("transactions:", transactions);
  console.log("summary:", summary);

  if (isLoading && !refreshing) return <PageLoader />;

  return (
    <View className="bg-background flex-1">
      <View>
        <View className="flex-row justify-between">
          <View className="flex-row items-center">
            <Image
              source={require("@/assets/images/logo.png")}
              style={{ height: 75, width: 75 }}
              contentFit="contain"
            />
            <View className="">
              <Text className="font-sansBold color-slate-400">Welcome,</Text>
              <Text className="font-sansMed">
                {user?.emailAddresses[0]?.emailAddress.split("@")[0]}
              </Text>
            </View>
          </View>
          <View className="flex-row items-center mx-6 gap-2">
            {/* <TouchableOpacity
              className="group flex-row bg-blue-600 active:bg-accent p-3 rounded-full gap-2"
              onPress={() => router.push("/create")}
            >
              <Ionicons
                name="add"
                size={25}
                color="#E3F2FD"
              />
              <Text className="font-sansBold text-lg color-slate-50 group-active:text-slate-900 mr-1">
                Add
              </Text>
            </TouchableOpacity> */}
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
      <View className="ml-6 mb-6">
        <TouchableOpacity className="bg-slate-700 h-14 w-14 rounded-full items-center justify-center"
          onPress={toggleColorScheme}
        >          
        <Ionicons size={25} name={colorScheme == "dark" ? "moon": "bulb"} color={colorScheme == "dark" ? colors.blue[800] : colors.slate[50]}></Ionicons>
        </TouchableOpacity>
      </View>
    </View>
  );
}
