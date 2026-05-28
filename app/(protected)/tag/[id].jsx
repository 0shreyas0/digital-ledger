import {
  FlatList,
  Text,
  View,
  Alert,
} from "react-native";
import React, { useMemo } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTransactions } from "@/hooks/useTransactions";
import TransactionItem from "@/components/TransactionItem";
import NoTransactionFound from "@/components/NoTransactionFound";
import PageLoader from "@/components/PageLoader";
import CirclePressable from "@/components/pressables/CirclePressable";

const TagTransactions = () => {
  const router = useRouter();
  const { id, name } = useLocalSearchParams();
  const { transactions, isLoading, deleteTransaction } = useTransactions();

  // Filter transactions for this tag
  const filteredTransactions = useMemo(() => {
    const tagName = decodeURIComponent(name);
    return transactions.filter(txn => {
      if (!txn.tags) return false;
      return txn.tags.some(t => t.name === tagName);
    });
  }, [transactions, name]);

  const handleDelete = (txnId) => {
    Alert.alert("Delete Transaction", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteTransaction(txnId) },
    ]);
  };

  if (isLoading) return <PageLoader />;

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center gap-4 mx-6 my-3 pb-3 border-b-2 border-slate-300">
        <CirclePressable
          name={"arrow-back"}
          onPress={() => {
            router.back();
          }}
        />
        <Text className="font-sansBold text-slate-500 text-2xl flex-1" numberOfLines={1}>
          {decodeURIComponent(name)}
        </Text>
      </View>

      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 20 }}
        renderItem={({ item }) => (
          <TransactionItem
            item={item}
            onDelete={handleDelete}
            currency="₹"
          />
        )}
        ListEmptyComponent={
          <View className="mt-10">
            <NoTransactionFound />
          </View>
        }
      />
    </View>
  );
};

export default TagTransactions;
