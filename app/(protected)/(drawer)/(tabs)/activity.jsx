import {
  FlatList,
  RefreshControl,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  Platform,
  StyleSheet,
  LayoutAnimation,
} from "react-native";
import React, { useCallback, useState, useMemo, useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Calendar } from "react-native-calendars";
import { useTransactions } from "@/hooks/useTransactions";
import { useCategories } from "@/hooks/useCategories";
import { useTags } from "@/hooks/useTags";
import TransactionItem from "@/components/TransactionItem";
import NoTransactionFound from "@/components/NoTransactionFound";
import PageLoader from "@/components/PageLoader";
import CloseButton from "@/components/CloseButton";
import Modal from "react-native-modal";
import { useTheme } from "@/context/ThemeContext";
import SearchBar from "@/components/SearchBar";
import TransactionFilter from "@/components/TransactionFilter";
import ActivityFilterChips from "@/components/ActivityFilterChips";
import Graph from "@/components/analytics/Graph";
import BalanceCard from "@/components/BalanceCard";
import WeekPickerModal from "@/components/WeekPickerModal";
import MonthPickerModal from "@/components/MonthPickerModal";


const Activity = () => {
  const router = useRouter();
  const { user } = useUser();
  const { colors, theme, colorScheme, glassOpacity } = useTheme();
  const insets = useSafeAreaInsets();
  const [headerHeight, setHeaderHeight] = useState(140);

  const handleHeaderLayout = useCallback((e) => {
    const { height } = e.nativeEvent.layout;
    setHeaderHeight(height);
  }, []);

  const { transactions: globalTransactions, isLoading, loadData, deleteTransaction: contextDeleteTransaction } = useTransactions();
  const { categories, loadCategories } = useCategories(user);
  const { tags, loadTags } = useTags(user);

  const [localTransactions, setLocalTransactions] = useState([]);

  useEffect(() => {
    loadCategories();
    loadTags();
  }, [loadCategories, loadTags]);

  // Sync with global transactions on initial load (when no filters)
  useEffect(() => {
    setLocalTransactions(globalTransactions);
  }, [globalTransactions]);

  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    categories: [],
    tags: [],
    dateRanges: [{ id: "default", type: "all", start: null, end: null }],
    amountRanges: [{ id: "default", minAmount: "", maxAmount: "" }],
    type: "all",
    matchLogic: "all"
  });

  const [isSyncing, setIsSyncing] = useState(false);

  // --- SERVER SYNC LOGIC ---
  const applyFiltersToServer = useCallback(async () => {
    const now = new Date();
    const todayStr = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');

    const processedDateRanges = filters.dateRanges.map(dr => {
      if (dr.type === "today") return { start: todayStr, end: todayStr };
      if (["week", "month", "custom"].includes(dr.type) && dr.start) return { start: dr.start, end: dr.end };
      return null;
    }).filter(Boolean);

    const processedAmountRanges = filters.amountRanges.filter(ar => ar.minAmount || ar.maxAmount);

    const serverFilters = {
      search: searchQuery,
      type: filters.type,
      categories: filters.categories,
      tags: filters.tags,
      matchLogic: filters.matchLogic || 'all',
      amountRanges: JSON.stringify(processedAmountRanges),
      dateRanges: JSON.stringify(processedDateRanges),
    };

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

      // 2. Amount Filter
      const activeAmountRanges = filters.amountRanges.filter(ar => ar.minAmount || ar.maxAmount);
      if (activeAmountRanges.length > 0) {
        const absAmount = Math.abs(txn.amount);
        const passedAmount = activeAmountRanges.some(ar => {
          let p = true;
          if (ar.minAmount && absAmount < parseFloat(ar.minAmount)) p = false;
          if (ar.maxAmount && absAmount > parseFloat(ar.maxAmount)) p = false;
          return p;
        });
        if (!passedAmount) return false;
      }

      // 3. Date Filter
      const activeDateRanges = filters.dateRanges.filter(dr => dr.type !== "all");
      if (activeDateRanges.length > 0) {
        if (!txn.date) return false;
        const txnDateStr = typeof txn.date === 'string' ? txn.date.split('T')[0] : new Date(txn.date).toISOString().split('T')[0];
        const now = new Date();
        const todayStr = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');

        const passedDate = activeDateRanges.some(dr => {
          if (dr.type === "today") return txnDateStr === todayStr;
          if (["custom", "week", "month"].includes(dr.type) && dr.start) {
            if (txnDateStr < dr.start) return false;
            if (dr.end && txnDateStr > dr.end) return false;
            return true;
          }
          return false;
        });
        if (!passedDate) return false;
      }

      // Taxonomy conditions (Type, Category, Tags)
      const hasType = filters.type !== "all";
      const hasCategories = filters.categories.length > 0;
      const hasTags = filters.tags && filters.tags.length > 0;

      const hasTaxonomyFilters = hasType || hasCategories || hasTags;

      if (hasTaxonomyFilters) {
        if (filters.matchLogic === 'any') {
          let passedAny = false;
          if (hasType && txn.type === filters.type) passedAny = true;
          if (hasCategories && filters.categories.includes(txn.category)) passedAny = true;
          if (hasTags && txn.tags && txn.tags.some(tag => filters.tags.includes(tag.name))) passedAny = true;

          if (!passedAny) return false;
        } else {
          // Default Match ALL (AND)
          if (hasType && txn.type !== filters.type) return false;
          if (hasCategories && !filters.categories.includes(txn.category)) return false;

          if (hasTags) {
            if (!txn.tags || txn.tags.length === 0) return false;
            const hasTag = txn.tags.some(tag => filters.tags.includes(tag.name));
            if (!hasTag) return false;
          }
        }
      }

      return true;
    });
  }, [localTransactions, searchQuery, filters]);

  const { width: screenWidth } = Dimensions.get("window");

  const graphData = useMemo(() => {
    if (!filteredTransactions || filteredTransactions.length === 0) return [];

    // Sort transactions oldest to newest
    const sorted = [...filteredTransactions].sort((a, b) => new Date(a.date) - new Date(b.date));

    // Group by date to prevent duplicate dates on the X-axis line chart and make it cleaner
    const grouped = [];
    sorted.forEach((txn) => {
      const formattedDate = txn.date
        ? new Date(txn.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })
        : "";

      const lastGroup = grouped[grouped.length - 1];
      if (lastGroup && lastGroup.dateStr === formattedDate) {
        lastGroup.amount += Math.abs(txn.amount);
      } else {
        grouped.push({
          dateStr: formattedDate,
          amount: Math.abs(txn.amount),
        });
      }
    });

    let runningTotal = 0;
    return grouped.map((group, index) => {
      runningTotal += group.amount;
      return {
        x: index,
        label: group.dateStr,
        y: runningTotal,
      };
    });
  }, [filteredTransactions]);

  const querySummary = useMemo(() => {
    let income = 0;
    let expenses = 0;
    filteredTransactions.forEach(txn => {
      const amt = parseFloat(txn.amount || 0);
      if (amt > 0) {
        income += amt;
      } else {
        expenses += Math.abs(amt);
      }
    });
    return {
      balance: income - expenses,
      income,
      expenses
    };
  }, [filteredTransactions]);

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
      dateRanges: [{ id: "default", type: "month", start: fmt(startDate), end: fmt(endDate) }]
    });
    // Modal stays open per user request
  };

  const selectWeek = (day) => {
    const startDate = new Date(day.dateString);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);

    const fmt = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFilters({
      ...filters,
      dateRanges: [{ id: "default", type: "week", start: fmt(startDate), end: fmt(endDate) }]
    });
    // Modal stays open per user request
  };

  const markedWeekDates = useMemo(() => {
    const dr = filters.dateRanges[0];
    if (!dr || dr.type !== "week" || !dr.start || !dr.end) return {};

    // Check if the range is exactly 7 days to confirm it's a 'week' selection
    const start = new Date(dr.start);
    const end = new Date(dr.end);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays !== 6) return {}; // Not a week range

    let marked = {};
    let current = new Date(start);
    for (let i = 0; i <= 6; i++) {
      const dateStr = current.getFullYear() + '-' + String(current.getMonth() + 1).padStart(2, '0') + '-' + String(current.getDate()).padStart(2, '0');
      marked[dateStr] = {
        selected: true,
        color: colors.primary,
        textColor: 'white',
        startingDay: i === 0,
        endingDay: i === 6
      };
      current.setDate(current.getDate() + 1);
    }
    return marked;
  }, [filters.dateRanges]);

  const hasActiveFilters = filters.categories.length > 0 || filters.amountRanges.some(ar => ar.minAmount || ar.maxAmount) || filters.type !== "all" || searchQuery !== "" || filters.dateRanges.some(dr => dr.type !== "all");




  const handleQuickFilterPress = (value) => {
    if (value === "today") {
      setFilters({
        ...filters,
        dateRanges: [{ id: "default", type: "today", start: null, end: null }]
      });
    } else if (value === "all") {
      setFilters({
        ...filters,
        dateRanges: [{ id: "default", type: "all", start: null, end: null }]
      });
    } else if (value === "week") {
      setIsWeekPickerVisible(true);
    } else if (value === "month") {
      setIsMonthPickerVisible(true);
    }
  };

  const clearFilters = () => {
    setFilters({
      categories: [],
      tags: [],
      dateRanges: [{ id: "default", type: "all", start: null, end: null }],
      amountRanges: [{ id: "default", minAmount: "", maxAmount: "" }],
      type: "all",
      matchLogic: "all"
    });
    setSearchQuery("");
  };

  return (
    <View className={`flex-1 bg-background theme-${theme} ${colorScheme === 'dark' ? 'dark' : 'light'}`}>
      {((isLoading || isSyncing) && !refreshing && (localTransactions.length === 0 || hasActiveFilters)) ? (
        <PageLoader />
      ) : (
        <FlatList
          data={filteredTransactions}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingTop: Math.max(headerHeight - 14),
            // paddingTop: 5, 
            paddingHorizontal: 24,
            paddingBottom: 110
          }}
          scrollIndicatorInsets={{ top: headerHeight }}
          ListHeaderComponent={
            <View>
              <BalanceCard
                currency="₹"
                summary={querySummary}
                title="Net Balance"
                className="mx-0"
              />
              {graphData.length > 1 ? (
                <View className="mb-3 mt-2">
                  <Graph
                    data={graphData}
                    width={screenWidth - 48}
                    height={220}
                    currency="₹"
                    yLabel="Amount"
                    xLabel="Time"
                    spiky={true}
                  />
                </View>
              ) : null}
            </View>
          }
          renderItem={({ item }) => (
            <TransactionItem
              item={item}
              onDelete={handleDelete}
              currency="₹"
              onPressIcon={(txn) => {
                router.push({ pathname: "/edit", params: { id: txn.transaction_id || txn.id } });
              }}
            />
          )}
          ListEmptyComponent={
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

      {/* Absolute Translucent Glass Header */}
      <View
        onLayout={handleHeaderLayout}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          paddingTop: insets.top,
          zIndex: 10,
        }}
      >
        {Platform.OS === 'ios' ? (
          (() => {
            const { GlassView, isGlassEffectAPIAvailable } = require('expo-glass-effect');
            if (isGlassEffectAPIAvailable()) {
              return (
                <View style={[StyleSheet.absoluteFillObject, { opacity: glassOpacity }]}>
                  <GlassView
                    glassEffectStyle="regular"
                    style={StyleSheet.absoluteFillObject}
                  />
                </View>
              );
            }
            // Fallback for older iOS without glass effect API
            const { BlurView } = require('expo-blur');
            return (
              <BlurView
                intensity={Math.round(glassOpacity * 100)}
                tint={colorScheme === 'dark' ? 'dark' : 'light'}
                style={StyleSheet.absoluteFillObject}
              />
            );
          })()
        ) : (
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.background, opacity: glassOpacity }]} />
        )}
        <View className="px-6 pt-4">
          <View className="flex-row items-center gap-3">
            <SearchBar
              placeholder="Search transactions..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              containerClassName="flex-1"
              variant="opaque"
            />
            <TransactionFilter
              categories={categories}
              tags={tags}
              activeFilters={filters}
              onApply={setFilters}
              onClear={clearFilters}
            />
          </View>
        </View>

        <View>
          <ActivityFilterChips
            activeType={filters.dateRanges[0]?.type ?? 'all'}
            onPress={handleQuickFilterPress}
          />
        </View>
      </View>

      <WeekPickerModal
        isVisible={isWeekPickerVisible}
        onClose={() => setIsWeekPickerVisible(false)}
        onSelectWeek={selectWeek}
        markedWeekDates={markedWeekDates}
        colors={colors}
      />

      <MonthPickerModal
        isVisible={isMonthPickerVisible}
        onClose={() => setIsMonthPickerVisible(false)}
        onSelectMonth={selectMonth}
        activeDateRange={filters.dateRanges[0]}
      />
    </View>
  );
};

export default Activity;