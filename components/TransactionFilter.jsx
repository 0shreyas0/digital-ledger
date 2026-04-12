import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  TextInput 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Modal from "react-native-modal";
import { Calendar } from "react-native-calendars";
import colors from "tailwindcss/colors";
import CloseButton from "./CloseButton";

/**
 * TransactionFilter Component
 * Encapsulates the filter button and the advanced filter modal.
 */
const TransactionFilter = ({ 
  categories = [], 
  activeFilters = {}, 
  onApply,
  onClear
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [isCategorySearchVisible, setIsCategorySearchVisible] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");

  // Staged state (changes made inside modal before hitting Apply)
  const [stagedFilters, setStagedFilters] = useState(activeFilters);

  const hasActiveFilters = useMemo(() => {
    return (
      (activeFilters.categories && activeFilters.categories.length > 0) || 
      (activeFilters.dateRange && activeFilters.dateRange !== "all") || 
      activeFilters.minAmount || 
      activeFilters.maxAmount || 
      (activeFilters.type && activeFilters.type !== "all")
    );
  }, [activeFilters]);

  const updateStaged = (key, value) => {
    setStagedFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onApply(stagedFilters);
    setIsModalVisible(false);
  };

  const handleClear = () => {
    onClear();
    setStagedFilters({
      categories: [],
      dateRange: "all",
      customRange: { start: null, end: null },
      minAmount: "",
      maxAmount: "",
      type: "all"
    });
  };

  const toggleCategory = (categoryName) => {
    const current = stagedFilters.categories || [];
    const updated = current.includes(categoryName)
      ? current.filter(c => c !== categoryName)
      : [...current, categoryName];
    updateStaged('categories', updated);
  };

  const onDayPress = (day) => {
    const range = stagedFilters.customRange || { start: null, end: null };
    if (!range.start || (range.start && range.end)) {
      updateStaged('customRange', { start: day.dateString, end: null });
    } else {
      if (day.dateString < range.start) {
        updateStaged('customRange', { start: day.dateString, end: null });
      } else {
        updateStaged('customRange', { ...range, end: day.dateString });
      }
    }
    updateStaged('dateRange', 'custom');
  };

  const markedDates = useMemo(() => {
    const range = stagedFilters.customRange;
    if (!range?.start) return {};
    let marked = {
      [range.start]: { selected: true, startingDay: true, color: colors.blue[600], textColor: 'white' }
    };
    if (range.end) {
      marked[range.end] = { selected: true, endingDay: true, color: colors.blue[600], textColor: 'white' };
      
      let start = new Date(range.start);
      let end = new Date(range.end);
      let current = new Date(start);
      current.setDate(current.getDate() + 1);
      
      while (current < end) {
        let dateStr = current.toISOString().split('T')[0];
        marked[dateStr] = { selected: true, color: colors.blue[100], textColor: colors.blue[600] };
        current.setDate(current.getDate() + 1);
      }
    }
    return marked;
  }, [stagedFilters.customRange]);

  return (
    <>
      <TouchableOpacity 
        onPress={() => {
            setStagedFilters(activeFilters); // Sync with active when opening
            setIsModalVisible(true);
        }}
        className={`w-14 h-14 items-center justify-center rounded-2xl border ${hasActiveFilters ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-200'}`}
      >
        <Ionicons name="filter" size={20} color={hasActiveFilters ? 'white' : colors.slate[600]} />
      </TouchableOpacity>

      <Modal
        isVisible={isModalVisible}
        onBackdropPress={() => setIsModalVisible(false)}
        style={{ justifyContent: "flex-end", margin: 0 }}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        avoidKeyboard={true}
      >
        <View className="bg-white rounded-t-3xl px-6 pb-6 pt-6 gap-6" style={{ height: '90%' }}>
          <View className="flex-row justify-between items-center">
            <Text className="font-sansBold text-2xl text-slate-800">Filters</Text>
            <CloseButton onPress={() => setIsModalVisible(false)} />
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
                  const isActive = (stagedFilters.type || "all") === type;
                  return (
                    <TouchableOpacity
                      key={type}
                      onPress={() => updateStaged('type', type)}
                      className={`px-5 py-2 rounded-xl border ${isActive ? `bg-blue-50 border-blue-600` : 'bg-slate-50 border-slate-200'}`}
                    >
                      <Text className={`font-sansMed capitalize ${isActive ? `text-blue-600` : 'text-slate-600'}`}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Custom Date Range */}
            <View>
              <TouchableOpacity 
                onPress={() => setIsCalendarVisible(!isCalendarVisible)}
                className="flex-row justify-between items-center mb-3"
              >
                <Text className="font-sansBold text-slate-500">Custom Date Range</Text>
                <View className="flex-row items-center gap-2">
                  {stagedFilters.customRange?.start && (
                    <Text className="font-sansMed text-blue-600 text-sm">
                      {stagedFilters.customRange.start} {stagedFilters.customRange.end ? `→ ${stagedFilters.customRange.end}` : '...'}
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
                    onDayPress={onDayPress}
                    theme={{
                      calendarBackground: 'transparent',
                      selectedDayBackgroundColor: colors.blue[600],
                      todayTextColor: colors.blue[600],
                      dayTextColor: colors.slate[700],
                      textDayFontFamily: 'GoogleSans-Regular',
                      textMonthFontFamily: 'GoogleSans-Bold',
                      textDayHeaderFontFamily: 'GoogleSans-Medium',
                    }}
                  />
                </View>
              )}
            </View>

            {/* Categories */}
            <View>
              <View className="flex-row justify-between items-center mb-3">
                <Text className="font-sansBold text-slate-500">Categories</Text>
                <TouchableOpacity onPress={() => setIsCategorySearchVisible(!isCategorySearchVisible)}>
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
                  />
                </View>
              )}

              <View style={{ height: 250 }} className="border border-slate-100 rounded-2xl bg-slate-50/50 p-2">
                <ScrollView nestedScrollEnabled={true} showsVerticalScrollIndicator={false}>
                  {categories
                    .filter(c => c.category.toLowerCase().includes(categorySearch.toLowerCase()))
                    .map((cat) => (
                      <TouchableOpacity
                        key={cat.category_id}
                        onPress={() => toggleCategory(cat.category)}
                        className={`flex-row items-center gap-3 px-4 py-3 mb-2 rounded-2xl border ${stagedFilters.categories?.includes(cat.category) ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-100'}`}
                      >
                        <Ionicons 
                          name={cat.icon} 
                          size={20} 
                          color={stagedFilters.categories?.includes(cat.category) ? 'white' : colors.blue[500]} 
                        />
                        <Text className={`font-sansMed text-lg ${stagedFilters.categories?.includes(cat.category) ? 'text-white' : 'text-slate-700'}`}>
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
                  value={stagedFilters.minAmount}
                  onChangeText={(v) => updateStaged('minAmount', v)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-sansReg"
                />
                <Text className="text-slate-400">—</Text>
                <TextInput
                  placeholder="Max"
                  keyboardType="numeric"
                  value={stagedFilters.maxAmount}
                  onChangeText={(v) => updateStaged('maxAmount', v)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-sansReg"
                />
              </View>
            </View>
          </ScrollView>

          <TouchableOpacity onPress={handleClear} className="items-center">
            <Text className="text-red-500 font-sansBold">Reset all filters</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleApply}
            className="bg-slate-800 py-4 rounded-2xl items-center"
          >
            <Text className="text-white font-sansBold text-lg">Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
};

export default TransactionFilter;
