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
  const { transactions: globalTransactions, isLoading, loadData, deleteTransaction: contextDeleteTransaction } = useTransactions();
  const { categories, loadCategories } = useCategories(user);

  const [localTransactions, setLocalTransactions] = useState([]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Sync with global transactions on initial load (when no filters)
  useEffect(() => {
    setLocalTransactions(globalTransactions);
  }, [globalTransactions]);

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

    const now = new Date();
    const todayStr = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');

    if (filters.dateRange === "today") {
      serverFilters.startDate = todayStr;
      serverFilters.endDate = todayStr;
    } else if (filters.dateRange === "week" && filters.customRange.start) {
       serverFilters.startDate = filters.customRange.start;
       serverFilters.endDate = filters.customRange.end;
    } else if (filters.dateRange === "month" && filters.customRange.start) {
       serverFilters.startDate = filters.customRange.start;
       serverFilters.endDate = filters.customRange.end;
    } else if (filters.dateRange === "custom" && filters.customRange.start) {
      serverFilters.startDate = filters.customRange.start;
      serverFilters.endDate = filters.customRange.end;
    }

    const { transactions: resultTransactions } = await loadData(serverFilters);
    if (resultTransactions) {
      setLocalTransactions(resultTransactions);
    }
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
    return localTransactions.filter(txn => {
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

      // 5. Date Filter (String based for reliability)
      if (txn.date) {
        const txnDateStr = typeof txn.date === 'string' ? txn.date.split('T')[0] : new Date(txn.date).toISOString().split('T')[0];
        
        const now = new Date();
        const todayStr = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');

        if (filters.dateRange === "today") {
          if (txnDateStr !== todayStr) return false;
        } else if (["custom", "week", "month"].includes(filters.dateRange) && filters.customRange.start) {
          if (txnDateStr < filters.customRange.start) return false;
          if (filters.customRange.end && txnDateStr > filters.customRange.end) return false;
        }
      }

      return true;
    });
  }, [localTransactions, searchQuery, filters]);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await applyFiltersToServer();
    setRefreshing(false);
  };

  const deleteTransaction = async (id) => {
    await contextDeleteTransaction(id);
    applyFiltersToServer(); // Refresh local list after deletion
  };

  const handleDelete = (id) => {
    Alert.alert("Delete Transaction", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteTransaction(id) },
    ]);
  };

  const [isMonthPickerVisible, setIsMonthPickerVisible] = useState(false);
  const [isWeekPickerVisible, setIsWeekPickerVisible] = useState(false);

  const selectMonth = (monthIndex, year) => {
    const startDate = new Date(year, monthIndex, 1);
    const endDate = new Date(year, monthIndex + 1, 0); // Last day of month
    
    const fmt = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    
    setFilters({
      ...filters,
      dateRange: "month",
      customRange: { start: fmt(startDate), end: fmt(endDate) }
    });
    // Modal stays open per user request
  };

  const selectWeek = (day) => {
    const startDate = new Date(day.dateString);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);

    const fmt = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');

    setFilters({
      ...filters,
      dateRange: "week",
      customRange: { start: fmt(startDate), end: fmt(endDate) }
    });
    // Modal stays open per user request
  };

  const markedWeekDates = useMemo(() => {
    if (filters.dateRange !== "week" || !filters.customRange.start || !filters.customRange.end) return {};
    
    // Check if the range is exactly 7 days to confirm it's a 'week' selection
    const start = new Date(filters.customRange.start);
    const end = new Date(filters.customRange.end);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays !== 6) return {}; // Not a week range

    let marked = {};
    let current = new Date(start);
    for (let i = 0; i <= 6; i++) {
        const dateStr = current.getFullYear() + '-' + String(current.getMonth() + 1).padStart(2, '0') + '-' + String(current.getDate()).padStart(2, '0');
        marked[dateStr] = {
            selected: true,
            color: colors.blue[600],
            textColor: 'white',
            startingDay: i === 0,
            endingDay: i === 6
        };
        current.setDate(current.getDate() + 1);
    }
    return marked;
  }, [filters.customRange, filters.dateRange]);

  const hasActiveFilters = filters.categories.length > 0 || filters.minAmount || filters.maxAmount || filters.type !== "all" || searchQuery !== "" || (filters.dateRange === "custom" && (filters.customRange.start || filters.customRange.end));

  const dateFilters = [
    { label: "All", value: "all" },
    { label: "Today", value: "today" },
    { label: "Week", value: "week" },
    { label: "Month", value: "month" },
  ];

  const handleQuickFilterPress = (value) => {
    if (value === "today") {
      setFilters({ ...filters, dateRange: "today", customRange: { start: null, end: null } });
    } else if (value === "all") {
      setFilters({ ...filters, dateRange: "all", customRange: { start: null, end: null } });
    } else if (value === "week") {
      setIsWeekPickerVisible(true);
    } else if (value === "month") {
      setIsMonthPickerVisible(true);
    }
  };

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dialYears = Array.from({ length: 11 }, (_, i) => 2020 + i); 
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const yearScrollRef = React.useRef(null);

  useEffect(() => {
    if (isMonthPickerVisible && yearScrollRef.current) {
        const index = dialYears.indexOf(selectedYear);
        if (index !== -1) {
            setTimeout(() => {
                yearScrollRef.current?.scrollTo({ y: index * 40, animated: true });
            }, 100);
        }
    }
  }, [isMonthPickerVisible]);

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
              onPress={() => handleQuickFilterPress(f.value)}
              className={`px-5 py-2 rounded-full border ${filters.dateRange === f.value ? 'bg-slate-700 border-slate-700' : 'bg-white border-slate-200'}`}
            >
               <View className="flex-row items-center gap-1">
                <Text className={`font-sansMed ${filters.dateRange === f.value ? 'text-white' : 'text-slate-600'}`}>
                  {f.label}
                </Text>
                {(f.value === "week" || f.value === "month") && (
                   <Ionicons name="chevron-down" size={12} color={filters.dateRange === f.value ? 'white' : colors.slate[400]} />
                )}
               </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Week Picker Modal */}
      <Modal
        isVisible={isWeekPickerVisible}
        onBackdropPress={() => setIsWeekPickerVisible(false)}
        style={{ justifyContent: "flex-end", margin: 0 }}
      >
         <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row justify-between items-center mb-4">
                <Text className="font-sansBold text-xl">Select Start of Week</Text>
                <CloseButton onPress={() => setIsWeekPickerVisible(false)} />
            </View>
            <Calendar
                onDayPress={selectWeek}
                markingType={'period'}
                markedDates={markedWeekDates}
                theme={{
                    todayTextColor: colors.blue[600],
                    selectedDayBackgroundColor: colors.blue[600],
                    textDayFontFamily: 'GoogleSans-Regular',
                    textMonthFontFamily: 'GoogleSans-Bold',
                    textDayHeaderFontFamily: 'GoogleSans-Medium',
                }}
            />
         </View>
      </Modal>

      {/* Month Picker Modal */}
      <Modal
        isVisible={isMonthPickerVisible}
        onBackdropPress={() => setIsMonthPickerVisible(false)}
        style={{ justifyContent: "flex-end", margin: 0 }}
      >
         <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row justify-between items-center mb-6">
                <Text className="font-sansBold text-xl">Select Month & Year</Text>
                <CloseButton onPress={() => setIsMonthPickerVisible(false)} />
            </View>
            
            <View className="items-center mb-6">
                <View className="h-24 w-full border-y border-slate-100 items-center justify-center">
                    <ScrollView 
                        ref={yearScrollRef}
                        showsVerticalScrollIndicator={false}
                        snapToInterval={40}
                        decelerationRate="fast"
                        onMomentumScrollEnd={(e) => {
                            const index = Math.round(e.nativeEvent.contentOffset.y / 40);
                            const year = dialYears[index];
                            if (year) setSelectedYear(year);
                        }}
                        contentContainerStyle={{ paddingVertical: 28 }}
                    >
                        {dialYears.map(y => (
                            <View key={y} style={{ height: 40 }} className="items-center justify-center w-40">
                                <Text className={`font-sansBold text-2xl ${selectedYear === y ? 'text-slate-800' : 'text-slate-300'}`}>
                                    {y}
                                </Text>
                            </View>
                        ))}
                    </ScrollView>
                    <View className="absolute pointer-events-none h-1 w-12 bg-blue-600 bottom-0 rounded-full" />
                </View>
            </View>

            <View className="flex-row flex-wrap gap-2">
                {months.map((m, i) => (
                    <TouchableOpacity 
                        key={m} 
                        onPress={() => selectMonth(i, selectedYear)}
                        className={`w-[31%] p-4 rounded-2xl items-center border ${filters.dateRange === "month" && filters.customRange.start?.split('-')[1] == String(i+1).padStart(2, '0') && filters.customRange.start?.split('-')[0] == selectedYear ? 'bg-slate-700 border-slate-700' : 'bg-slate-50 border-slate-100'}`}
                    >
                        <Text className={`font-sansMed ${filters.dateRange === "month" && filters.customRange.start?.split('-')[1] == String(i+1).padStart(2, '0') && filters.customRange.start?.split('-')[0] == selectedYear ? 'text-white' : 'text-slate-700'}`}>{m.slice(0, 3)}</Text>
                    </TouchableOpacity>
                ))}
            </View>
         </View>
      </Modal>

      {((isLoading || isSyncing) && !refreshing && (localTransactions.length === 0 || hasActiveFilters)) ? (
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