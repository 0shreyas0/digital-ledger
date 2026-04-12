import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import {
  Alert,
  FlatList,
  RefreshControl,
  Text,
  View
} from "react-native";
import { SignOutButton } from "@/components/signOutButton";
import { useTransactions } from "@/hooks/useTransactions";
import { useCallback, useState } from "react";
import PageLoader from "@/components/PageLoader";
import { Image } from "expo-image";
import BalanceCard from "@/components/BalanceCard";
import TransactionItem from "@/components/TransactionItem";
import NoTransactionFound from "@/components/NoTransactionFound";
import BluePressable from "@/components/pressables/BluePressable";

export default function Page() {
  const { user } = useUser();
  const router = useRouter();
  const [currency] = useState("₹");
  
  // Now uses the global context via the updated hook
  const { transactions, summary, isLoading, loadData, deleteTransaction } = useTransactions();

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
    await loadData(); // This now forces a refresh in the context
    setRefreshing(false);
  };

  // We keep this to ensure data is fresh when returning to home, 
  // but it's much cheaper now if data isn't stale.
  useFocusEffect(
    useCallback(() => {
      // Not calling loadData() here because the Provider handles initial load 
      // and we want to avoid the "constant fetching" feeling.
      // If the user wants a refresh, they can pull to refresh.
    }, []),
  );

  if (isLoading && !refreshing && transactions.length === 0) return <PageLoader />;

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
        data={transactions.slice(0, 5)} // Only show recent ones on home
        keyExtractor={(item) => item.id}
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
    </View>
  );
}
