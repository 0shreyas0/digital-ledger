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

const CategoryTransactions = () => {
  const router = useRouter();
  const { id, name } = useLocalSearchParams();
  const { transactions, isLoading, deleteTransaction } = useTransactions();

  // Filter transactions for this category
  // Using 'name' since transactions in useTransactions might have 'category' string instead of 'category_id'
  // Or we might need to filter by name. Let's filter by the category name.
  const filteredTransactions = useMemo(() => {
    return transactions.filter(txn => txn.category === decodeURIComponent(name));
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

export default CategoryTransactions;
