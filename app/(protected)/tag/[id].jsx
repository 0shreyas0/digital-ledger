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

export default TagTransactions;
