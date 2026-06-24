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
import NestedTopBar from "@/components/NestedTopBar";
import SafeScreen from "@/components/SafeScreen";

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
    <SafeScreen>
      <NestedTopBar title={decodeURIComponent(name)} />

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
    </SafeScreen>
  );
};

export default CategoryTransactions;
