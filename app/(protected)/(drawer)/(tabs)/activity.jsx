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

const Activity = () => {
  const { user } = useUser();
  const { transactions, isLoading, loadData, deleteTransaction } = useTransactions();
  const { categories, loadCategories } = useCategories(user);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  
  // Filter States
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [dateRange, setDateRange] = useState("all"); 
  const [customRange, setCustomRange] = useState({ start: null, end: null });
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [transactionType, setTransactionType] = useState("all"); // all, Income, Expense
  const [isCategorySearchVisible, setIsCategorySearchVisible] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");

  // --- SERVER SYNC LOGIC ---
  const applyFiltersToServer = useCallback(async () => {
    const filters = {
      search: searchQuery,
      type: transactionType,
      categories: selectedCategories,
      minAmount,
      maxAmount,
    };

    if (dateRange === "today") {
      filters.startDate = new Date().toISOString().split('T')[0];
      filters.endDate = filters.startDate;
    } else if (dateRange === "week") {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      filters.startDate = d.toISOString().split('T')[0];
    } else if (dateRange === "month") {
      const d = new Date();
      d.setMonth(d.getMonth() - 1);
      filters.startDate = d.toISOString().split('T')[0];
    } else if (dateRange === "custom" && customRange.start) {
      filters.startDate = customRange.start;
      filters.endDate = customRange.end;
    }

    await loadData(filters);
  }, [searchQuery, transactionType, selectedCategories, minAmount, maxAmount, dateRange, customRange, loadData]);

  // Sync with server when filters change (debounced for search)
  useEffect(() => {
    const timer = setTimeout(() => {
      applyFiltersToServer();
    }, 400); // 400ms debounce
    return () => clearTimeout(timer);
  }, [applyFiltersToServer]);

  // --- LOCAL REFINEMENT (Optional, but good for instant UI feedback) ---
  const filteredTransactions = useMemo(() => {
    return transactions.filter(txn => {
      // 1. Text Search
      if (searchQuery && !txn.title.toLowerCase().includes(searchQuery.toLowerCase()) && !txn.category.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // 2. Type Filter
      if (transactionType !== "all" && txn.type !== transactionType) {
        return false;
      }

      // 3. Category Filter
      if (selectedCategories.length > 0 && !selectedCategories.includes(txn.category)) {
        return false;
      }

      // 4. Amount Filter
      const absAmount = Math.abs(txn.amount);
      if (minAmount && absAmount < parseFloat(minAmount)) return false;
      if (maxAmount && absAmount > parseFloat(maxAmount)) return false;

      // 5. Date Filter (Fixed for timezone issues)
      if (txn.date) {
        const [y, m, d] = txn.date.split('-').map(Number);
        const txnDate = new Date(y, m - 1, d);
        txnDate.setHours(0, 0, 0, 0);

        const now = new Date();
        now.setHours(0, 0, 0, 0);

        if (dateRange === "today") {
          if (txnDate.getTime() !== now.getTime()) return false;
        } else if (dateRange === "week") {
          const lastWeek = new Date();
          lastWeek.setDate(now.getDate() - 7);
          if (txnDate < lastWeek) return false;
        } else if (dateRange === "month") {
          const lastMonth = new Date();
          lastMonth.setMonth(now.getMonth() - 1);
          if (txnDate < lastMonth) return false;
        } else if (dateRange === "custom" && customRange.start) {
          const [sy, sm, sd] = customRange.start.split('-').map(Number);
          const start = new Date(sy, sm - 1, sd);
          if (txnDate < start) return false;
          
          if (customRange.end) {
            const [ey, em, ed] = customRange.end.split('-').map(Number);
            const end = new Date(ey, em - 1, ed);
            if (txnDate > end) return false;
          }
        }
      }

      return true;
    });
  }, [transactions, searchQuery, transactionType, selectedCategories, minAmount, maxAmount, dateRange, customRange]);

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

  const toggleCategory = (categoryName) => {
    setSelectedCategories(prev => 
      prev.includes(categoryName) 
        ? prev.filter(c => c !== categoryName) 
        : [...prev, categoryName]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setDateRange("all");
    setMinAmount("");
    setMaxAmount("");
    setTransactionType("all");
    setSearchQuery("");
    setCategorySearch("");
    setIsCategorySearchVisible(false);
    setCustomRange({ start: null, end: null });
  };

  const hasActiveFilters = selectedCategories.length > 0 || dateRange !== "all" || minAmount || maxAmount || transactionType !== "all" || searchQuery !== "";

  const onDayPress = (day) => {
    if (!customRange.start || (customRange.start && customRange.end)) {
      setCustomRange({ start: day.dateString, end: null });
    } else {
      if (day.dateString < customRange.start) {
        setCustomRange({ start: day.dateString, end: null });
      } else {
        setCustomRange({ ...customRange, end: day.dateString });
      }
    }
  };

  const markedDates = useMemo(() => {
    if (!customRange.start) return {};
    let marked = {
      [customRange.start]: { selected: true, startingDay: true, color: colors.blue[600], textColor: 'white' }
    };
    if (customRange.end) {
      marked[customRange.end] = { selected: true, endingDay: true, color: colors.blue[600], textColor: 'white' };
      
      let start = new Date(customRange.start);
      let end = new Date(customRange.end);
      let current = new Date(start);
      current.setDate(current.getDate() + 1);
      
      while (current < end) {
        let dateStr = current.toISOString().split('T')[0];
        marked[dateStr] = { selected: true, color: colors.blue[100], textColor: colors.blue[600] };
        current.setDate(current.getDate() + 1);
      }
    }
    return marked;
  }, [customRange]);

  const dateFilters = [
    { label: "All", value: "all" },
    { label: "Today", value: "today" },
    { label: "Week", value: "week" },
    { label: "Month", value: "month" },
  ];

  return (
    <View className="flex-1 bg-background">
      {/* Header & Search */}
      <View className="px-6 pt-4 pb-2">
        <Text className="font-sansBold text-3xl text-slate-800 mb-4">Activity</Text>
        
        <View className="flex-row items-center gap-3">
          <View className="flex-1 flex-row items-center bg-slate-100 rounded-2xl px-4 py-2 border border-slate-200">
            <Ionicons name="search" size={20} color={colors.slate[400]} />
            <TextInput
              placeholder="Search transactions..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 ml-2 font-sansReg text-slate-700"
              placeholderTextColor={colors.slate[400]}
            />
          </View> 
          <TouchableOpacity 
            onPress={() => setIsFilterModalVisible(true)}
            className={`p-3 rounded-2xl border ${hasActiveFilters ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-200'}`}
          >
            <Ionicons name="filter" size={20} color={hasActiveFilters ? 'white' : colors.slate[600]} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Date Filters */}
      <View className="mb-4">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, gap: 10, flexGrow: 1, justifyContent: 'center' }}>
          {dateFilters.map((filter) => (
            <TouchableOpacity
              key={filter.value}
              onPress={() => {
                setDateRange(filter.value);
                setCustomRange({ start: null, end: null }); // Reset custom if using preset
              }}
              className={`px-5 py-2 rounded-full border ${dateRange === filter.value ? 'bg-slate-800 border-slate-800' : 'bg-white border-slate-200'}`}
            >
              <Text className={`font-sansMed ${dateRange === filter.value ? 'text-white' : 'text-slate-600'}`}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {isLoading && !refreshing && transactions.length === 0 ? (
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
            <View className="mt-10">
              <NoTransactionFound />
              {hasActiveFilters && (
                <TouchableOpacity onPress={clearFilters} className="mt-4">
                  <Text className="text-blue-600 font-sansBold">Clear all filters</Text>
                </TouchableOpacity>
              )}
            </View>
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      {/* Filter Modal */}
      <Modal
        isVisible={isFilterModalVisible}
        onBackdropPress={() => setIsFilterModalVisible(false)}
        style={{ justifyContent: "flex-end", margin: 0 }}
        animationIn="slideInUp"
        animationOut="slideOutDown"
      >
        <View className="bg-white rounded-t-3xl px-6 pb-6 pt-6 gap-6" style={{ height: '90%' }}>
          <View className="flex-row justify-between items-center">
            <Text className="font-sansBold text-2xl text-slate-800">Filters</Text>
            <CloseButton onPress={() => setIsFilterModalVisible(false)} />
          </View>

          <ScrollView 
            showsVerticalScrollIndicator={false} 
            contentContainerStyle={{ paddingBottom: 40, gap: 24 }}
          >
            {/* Transaction Type */}
            <View>
              <Text className="font-sansBold text-slate-500 mb-3">Type</Text>
              <View className="flex-row gap-3">
                {["all", "Income", "Expense"].map((type) => {
                  const isActive = transactionType === type;
                  let activeBg = "bg-blue-50";
                  let activeBorder = "border-blue-600";
                  let activeText = "text-blue-600";
                  
                  if (type === 'Income') {
                    activeBg = "bg-green-50";
                    activeBorder = "border-green-500";
                    activeText = "text-green-600";
                  } else if (type === 'Expense') {
                    activeBg = "bg-red-50";
                    activeBorder = "border-red-500";
                    activeText = "text-red-600";
                  }
                  
                  return (
                    <TouchableOpacity
                      key={type}
                      onPress={() => setTransactionType(type)}
                      className={`px-5 py-2 rounded-xl border ${isActive ? `${activeBg} ${activeBorder}` : 'bg-slate-50 border-slate-200'}`}
                    >
                      <Text className={`font-sansMed capitalize ${isActive ? activeText : 'text-slate-600'}`}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Date Range Selection (Collapsible) */}
            <View>
              <TouchableOpacity 
                onPress={() => setIsCalendarVisible(!isCalendarVisible)}
                className="flex-row justify-between items-center mb-3"
              >
                <Text className="font-sansBold text-slate-500">Custom Date Range</Text>
                <View className="flex-row items-center gap-2">
                  {customRange.start && (
                    <Text className="font-sansMed text-blue-600 text-sm">
                      {customRange.start} {customRange.end ? `→ ${customRange.end}` : '...'}
                    </Text>
                  )}
                  <Ionicons name={isCalendarVisible ? "chevron-up" : "chevron-down" } size={18} color={colors.slate[400]} />
                </View>
              </TouchableOpacity>
              
              {isCalendarVisible && (
                <View className="border border-slate-100 rounded-3xl overflow-hidden bg-white mb-4">
                  <Calendar
                    markingType={'period'}
                    markedDates={markedDates}
                    onDayPress={(day) => {
                      setDateRange("custom");
                      onDayPress(day);
                    }}
                    theme={{
                      calendarBackground: 'transparent',
                      textSectionTitleColor: colors.slate[400],
                      selectedDayBackgroundColor: colors.blue[600],
                      selectedDayTextColor: 'white',
                      todayTextColor: colors.blue[600],
                      dayTextColor: colors.slate[700],
                      textDisabledColor: colors.slate[200],
                      dotColor: colors.blue[600],
                      selectedDotColor: 'white',
                      arrowColor: colors.blue[600],
                      monthTextColor: colors.slate[800],
                      textDayFontFamily: 'GoogleSans-Regular',
                      textMonthFontFamily: 'GoogleSans-Bold',
                      textDayHeaderFontFamily: 'GoogleSans-Medium',
                      textDayFontSize: 13,
                      textMonthFontSize: 15,
                      textDayHeaderFontSize: 12,
                    }}
                  />
                </View>
              )}
            </View>

            {/* Categories */}
            <View>
              <View className="flex-row justify-between items-center mb-3">
                <Text className="font-sansBold text-slate-500">Categories</Text>
                <TouchableOpacity 
                   onPress={() => {
                     setIsCategorySearchVisible(!isCategorySearchVisible);
                     if (isCategorySearchVisible) setCategorySearch("");
                   }}
                   className="p-1"
                >
                  <Ionicons name={isCategorySearchVisible ? "close-circle" : "search"} size={20} color={colors.slate[400]} />
                </TouchableOpacity>
              </View>

              {isCategorySearchVisible && (
                <View className="mb-4 flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                  <Ionicons name="search" size={16} color={colors.slate[400]} />
                  <TextInput
                    placeholder="Search categories..."
                    value={categorySearch}
                    onChangeText={setCategorySearch}
                    className="flex-1 ml-2 font-sansReg text-slate-700"
                    autoFocus
                  />
                </View>
              )}

              <View style={{ height: 250 }} className="border border-slate-100 rounded-2xl bg-slate-50/50 p-2">
                <ScrollView nestedScrollEnabled={true} showsVerticalScrollIndicator={false} className="gap-2">
                  {categories.filter(c => c.category.toLowerCase().includes(categorySearch.toLowerCase())).map((cat) => (
                    <TouchableOpacity
                      key={cat.category_id}
                      onPress={() => toggleCategory(cat.category)}
                      className={`flex-row items-center gap-3 px-4 py-3 mb-2 rounded-2xl border ${selectedCategories.includes(cat.category) ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-100'}`}
                    >
                      <Ionicons 
                        name={cat.icon} 
                        size={20} 
                        color={selectedCategories.includes(cat.category) ? 'white' : colors.blue[500]} 
                      />
                      <Text className={`font-sansMed text-lg ${selectedCategories.includes(cat.category) ? 'text-white' : 'text-slate-700'}`}>
                        {cat.category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            {/* Amount Range */}
            <View>
              <Text className="font-sansBold text-slate-500 mb-3">Amount Range</Text>
              <View className="flex-row items-center gap-3">
                <TextInput
                  placeholder="Min"
                  keyboardType="numeric"
                  value={minAmount}
                  onChangeText={setMinAmount}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-sansReg"
                />
                <Text className="text-slate-400">—</Text>
                <TextInput
                  placeholder="Max"
                  keyboardType="numeric"
                  value={maxAmount}
                  onChangeText={setMaxAmount}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-sansReg"
                />
              </View>
            </View>
          </ScrollView>

          <TouchableOpacity
            onPress={clearFilters}
            className="items-center"
          >
            <Text className="text-red-500 font-sansBold">Reset all filters</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setIsFilterModalVisible(false)}
            className="bg-slate-800 py-4 rounded-2xl items-center"
          >
            <Text className="text-white font-sansBold text-lg">Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </Modal>

    </View>
  );
};

export default Activity;