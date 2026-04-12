import {
  FlatList,
  RefreshControl,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import React, { useCallback, useState, useMemo, useEffect } from "react";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { Calendar } from "react-native-calendars";
import { useTransactions } from "@/hooks/useTransactions";
import { useCategories } from "@/hooks/useCategories";
import TransactionItem from "@/components/TransactionItem";
import NoTransactionFound from "@/components/NoTransactionFound";
import PageLoader from "@/components/PageLoader";
import CloseButton from "@/components/CloseButton";
import Modal from "react-native-modal";
import colors from "tailwindcss/colors";
import SearchBar from "@/components/SearchBar";
import TransactionFilter from "@/components/TransactionFilter";

const Activity = () => {
  const { user } = useUser();
  const { transactions, isLoading, loadData, deleteTransaction } = useTransactions();
  const { categories, loadCategories } = useCategories(user);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    categories: [],
    dateRange: "all",
    customRange: { start: null, end: null },
    minAmount: "",
    maxAmount: "",
    type: "all"
  });

  const [isSyncing, setIsSyncing] = useState(false);

  // --- SERVER SYNC LOGIC ---
  const applyFiltersToServer = useCallback(async () => {
    const serverFilters = {
      search: searchQuery,
      type: filters.type,
      categories: filters.categories,
      minAmount: filters.minAmount,
      maxAmount: filters.maxAmount,
    };

    if (filters.dateRange === "today") {
      serverFilters.startDate = new Date().toISOString().split('T')[0];
      serverFilters.endDate = serverFilters.startDate;
    } else if (filters.dateRange === "week") {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      serverFilters.startDate = d.toISOString().split('T')[0];
    } else if (filters.dateRange === "month") {
      const d = new Date();
      d.setMonth(d.getMonth() - 1);
      serverFilters.startDate = d.toISOString().split('T')[0];
    } else if (filters.dateRange === "custom" && filters.customRange.start) {
      serverFilters.startDate = filters.customRange.start;
      serverFilters.endDate = filters.customRange.end;
    }

    await loadData(serverFilters);
    setIsSyncing(false);
  }, [searchQuery, filters, loadData]);

  // Sync with server when filters change (debounced for search)
  useEffect(() => {
    setIsSyncing(true); // Signal that sync is starting
    const timer = setTimeout(() => {
      applyFiltersToServer();
    }, 400); // 400ms debounce
    return () => clearTimeout(timer);
  }, [applyFiltersToServer]);

  // --- LOCAL REFINEMENT ---
  const filteredTransactions = useMemo(() => {
    return transactions.filter(txn => {
      // 1. Text Search
      if (searchQuery && !txn.title.toLowerCase().includes(searchQuery.toLowerCase()) && !txn.category.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // 2. Type Filter
      if (filters.type !== "all" && txn.type !== filters.type) {
        return false;
      }

      // 3. Category Filter
      if (filters.categories.length > 0 && !filters.categories.includes(txn.category)) {
        return false;
      }

      // 4. Amount Filter
      const absAmount = Math.abs(txn.amount);
      if (filters.minAmount && absAmount < parseFloat(filters.minAmount)) return false;
      if (filters.maxAmount && absAmount > parseFloat(filters.maxAmount)) return false;

      // 5. Date Filter
      if (txn.date) {
        const [y, m, d] = txn.date.split('-').map(Number);
        const txnDate = new Date(y, m - 1, d);
        txnDate.setHours(0, 0, 0, 0);

        const now = new Date();
        now.setHours(0, 0, 0, 0);

        if (filters.dateRange === "today") {
          if (txnDate.getTime() !== now.getTime()) return false;
        } else if (filters.dateRange === "week") {
          const lastWeek = new Date();
          lastWeek.setDate(now.getDate() - 7);
          if (txnDate < lastWeek) return false;
        } else if (filters.dateRange === "month") {
          const lastMonth = new Date();
          lastMonth.setMonth(now.getMonth() - 1);
          if (txnDate < lastMonth) return false;
        } else if (filters.dateRange === "custom" && filters.customRange.start) {
          const [sy, sm, sd] = filters.customRange.start.split('-').map(Number);
          const start = new Date(sy, sm - 1, sd);
          if (txnDate < start) return false;
          
          if (filters.customRange.end) {
            const [ey, em, ed] = filters.customRange.end.split('-').map(Number);
            const end = new Date(ey, em - 1, ed);
            if (txnDate > end) return false;
          }
        }
      }

      return true;
    });
  }, [transactions, searchQuery, filters]);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await applyFiltersToServer();
    setRefreshing(false);
  };

  const handleDelete = (id) => {
    Alert.alert("Delete Transaction", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteTransaction(id) },
    ]);
  };

  const clearFilters = () => {
    setFilters({
      categories: [],
      dateRange: "all",
      customRange: { start: null, end: null },
      minAmount: "",
      maxAmount: "",
      type: "all"
    });
    setSearchQuery("");
  };

  const hasActiveFilters = filters.categories.length > 0 || filters.dateRange !== "all" || filters.minAmount || filters.maxAmount || filters.type !== "all" || searchQuery !== "";

  const dateFilters = [
    { label: "All", value: "all" },
    { label: "Today", value: "today" },
    { label: "Week", value: "week" },
    { label: "Month", value: "month" },
  ];

  return (
    <View className="flex-1 bg-background">
      {/* Header & Search */}
      <View className="px-6 pt-4 pb-6">
        <View className="flex-row items-center gap-3">
          <SearchBar
            placeholder="Search transactions..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            containerClassName="flex-1"
          />
          <TransactionFilter
            categories={categories}
            activeFilters={filters}
            onApply={setFilters}
            onClear={clearFilters}
          />
        </View>
      </View>

      {/* Quick Date Filters */}
      <View className="mb-4">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, gap: 10, flexGrow: 1, justifyContent: 'center' }}>
          {dateFilters.map((f) => (
            <TouchableOpacity
              key={f.value}
              onPress={() => setFilters({ ...filters, dateRange: f.value, customRange: { start: null, end: null } })}
              className={`px-5 py-2 rounded-full border ${filters.dateRange === f.value ? 'bg-slate-700 border-slate-700' : 'bg-white border-slate-200'}`}
            >
              <Text className={`font-sansMed ${filters.dateRange === f.value ? 'text-white' : 'text-slate-600'}`}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {((isLoading || isSyncing) && !refreshing && (transactions.length === 0 || hasActiveFilters)) ? (
        <PageLoader />
      ) : (
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
            // Hide empty state while loading or debouncing to prevent "flicking"
            (isLoading || isSyncing) ? null : (
              <View className="mt-10">
                <NoTransactionFound 
                  mode={hasActiveFilters ? "filter" : "initial"} 
                  onClear={clearFilters} 
                />
              </View>
            )
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
      </View>
  );
};

export default Activity;