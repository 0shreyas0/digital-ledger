import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  TextInput,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Modal from "react-native-modal";
import { Calendar } from "react-native-calendars";
import { useTheme } from '@/context/ThemeContext';
import CloseButton from "./CloseButton";
import SearchBar from "./SearchBar";
import SegmentControl from "./SegmentControl";
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';

import AppPressable from './pressables/AppPressable';

/**
 * TransactionFilter Component
 * Encapsulates the filter button and the advanced filter modal.
 */

const DEFAULT_DATE_RANGES = [{ id: 'default', type: 'all', start: null, end: null }];
const DEFAULT_AMOUNT_RANGES = [{ id: 'default', minAmount: '', maxAmount: '' }];

let _uidCounter = 0;
const makeId = () => `uid_${++_uidCounter}_${Date.now()}`;

const formatDateLabel = (dr) => {
  if (!dr || dr.type === 'all') return null;
  if (dr.type === 'today') return 'Today';
  if (dr.start && dr.end) return `${dr.start} → ${dr.end}`;
  if (dr.start) return `${dr.start} → ...`;
  return null;
};

const formatAmountLabel = (ar) => {
  if (!ar || (!ar.minAmount && !ar.maxAmount)) return null;
  const min = ar.minAmount ? `₹${ar.minAmount}` : '0';
  const max = ar.maxAmount ? `₹${ar.maxAmount}` : '∞';
  return `${min} → ${max}`;
};

const TransactionFilter = ({ 
  categories = [], 
  tags = [],
  activeFilters = {}, 
  onApply,
  onClear
}) => {
  const { colors: themeColors } = useTheme();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [activeFilterTab, setActiveFilterTab] = useState('categories');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [activeDatePillId, setActiveDatePillId] = useState('default');
  const [activeAmountPillId, setActiveAmountPillId] = useState('default');
  const [isDateSectionOpen, setIsDateSectionOpen] = useState(false);
  const [isAmountSectionOpen, setIsAmountSectionOpen] = useState(false);
  const [isMatchLogicSectionOpen, setIsMatchLogicSectionOpen] = useState(false);
  const [isTypeSectionOpen, setIsTypeSectionOpen] = useState(false);

  const [stagedFilters, setStagedFilters] = useState(activeFilters);

  const hasActiveFilters = useMemo(() => {
    return (
      (activeFilters.categories && activeFilters.categories.length > 0) || 
      (activeFilters.tags && activeFilters.tags.length > 0) ||
      (activeFilters.dateRanges && activeFilters.dateRanges.some(dr => dr.type !== 'all')) || 
      (activeFilters.amountRanges && activeFilters.amountRanges.some(ar => ar.minAmount || ar.maxAmount)) || 
      (activeFilters.type && activeFilters.type !== 'all')
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
    setSearchQuery('');
    setIsSearchVisible(false);
    setActiveDatePillId('default');
    setActiveAmountPillId('default');
    setStagedFilters({
      categories: [],
      tags: [],
      dateRanges: [...DEFAULT_DATE_RANGES],
      amountRanges: [...DEFAULT_AMOUNT_RANGES],
      type: 'all',
      matchLogic: 'all',
    });
  };

  // ── Matching Logic ──────────────────────────────────────────
  const handleMatchLogicChange = (newVal) => {
    if (newVal === 'all') {
      const hasMultipleDates = (stagedFilters.dateRanges || []).length > 1;
      const hasMultipleAmounts = (stagedFilters.amountRanges || []).length > 1;
      if (hasMultipleDates || hasMultipleAmounts) {
        Alert.alert(
          'Cannot Switch to Match All',
          'You have multiple date or amount groups active. Please delete the extra groups first before switching to Match All.',
          [{ text: 'OK' }]
        );
        return;
      }
    }
    updateStaged('matchLogic', newVal);
  };

  // ── Date Range Helpers ──────────────────────────────────────
  const activeDateRange = useMemo(() =>
    (stagedFilters.dateRanges || DEFAULT_DATE_RANGES).find(dr => dr.id === activeDatePillId) || null,
    [stagedFilters.dateRanges, activeDatePillId]
  );

  const updateActiveDateRange = (patch) => {
    const updated = (stagedFilters.dateRanges || DEFAULT_DATE_RANGES).map(dr =>
      dr.id === activeDatePillId ? { ...dr, ...patch } : dr
    );
    updateStaged('dateRanges', updated);
  };

  const addDateGroup = () => {
    const newId = makeId();
    const newGroup = { id: newId, type: 'all', start: null, end: null };
    updateStaged('dateRanges', [...(stagedFilters.dateRanges || DEFAULT_DATE_RANGES), newGroup]);
    setActiveDatePillId(newId);
    setIsDateSectionOpen(true);
  };

  const deleteActiveDateGroup = () => {
    const label = formatDateLabel(activeDateRange) || 'this date group';
    Alert.alert(
      'Delete Date Group',
      `Delete "${label}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: () => {
            const remaining = (stagedFilters.dateRanges || DEFAULT_DATE_RANGES).filter(dr => dr.id !== activeDatePillId);
            const fallback = remaining.length > 0 ? remaining : [...DEFAULT_DATE_RANGES];
            updateStaged('dateRanges', fallback);
            setActiveDatePillId(fallback[0].id);
          }
        }
      ]
    );
  };

  const onDayPress = (day) => {
    const range = activeDateRange || { start: null, end: null };
    if (!range.start || (range.start && range.end)) {
      updateActiveDateRange({ start: day.dateString, end: null, type: 'custom' });
    } else {
      if (day.dateString < range.start) {
        updateActiveDateRange({ start: day.dateString, end: null, type: 'custom' });
      } else {
        updateActiveDateRange({ end: day.dateString, type: 'custom' });
      }
    }
  };

  const markedDates = useMemo(() => {
    const range = activeDateRange;
    if (!range || !range.start) return {};
    let marked = {
      [range.start]: { selected: true, startingDay: true, color: themeColors.primary, textColor: 'white' }
    };
    if (range.end) {
      marked[range.end] = { selected: true, endingDay: true, color: themeColors.primary, textColor: 'white' };
      let current = new Date(range.start);
      const end = new Date(range.end);
      current.setDate(current.getDate() + 1);
      while (current < end) {
        marked[current.toISOString().split('T')[0]] = { selected: true, color: themeColors.background, textColor: themeColors.primary };
        current.setDate(current.getDate() + 1);
      }
    }
    return marked;
  }, [activeDateRange, themeColors]);

  // ── Amount Range Helpers ────────────────────────────────────
  const activeAmountRange = useMemo(() =>
    (stagedFilters.amountRanges || DEFAULT_AMOUNT_RANGES).find(ar => ar.id === activeAmountPillId) || null,
    [stagedFilters.amountRanges, activeAmountPillId]
  );

  const updateActiveAmountRange = (patch) => {
    const updated = (stagedFilters.amountRanges || DEFAULT_AMOUNT_RANGES).map(ar =>
      ar.id === activeAmountPillId ? { ...ar, ...patch } : ar
    );
    updateStaged('amountRanges', updated);
  };

  const addAmountGroup = () => {
    const newId = makeId();
    const newGroup = { id: newId, minAmount: '', maxAmount: '' };
    updateStaged('amountRanges', [...(stagedFilters.amountRanges || DEFAULT_AMOUNT_RANGES), newGroup]);
    setActiveAmountPillId(newId);
    setIsAmountSectionOpen(true);
  };

  const deleteActiveAmountGroup = () => {
    const label = formatAmountLabel(activeAmountRange) || 'this amount group';
    Alert.alert(
      'Delete Amount Group',
      `Delete "${label}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: () => {
            const remaining = (stagedFilters.amountRanges || DEFAULT_AMOUNT_RANGES).filter(ar => ar.id !== activeAmountPillId);
            const fallback = remaining.length > 0 ? remaining : [...DEFAULT_AMOUNT_RANGES];
            updateStaged('amountRanges', fallback);
            setActiveAmountPillId(fallback[0].id);
          }
        }
      ]
    );
  };

  // ── Category / Tag Helpers ──────────────────────────────────
  const toggleCategory = (categoryName) => {
    const current = stagedFilters.categories || [];
    const updated = current.includes(categoryName)
      ? current.filter(c => c !== categoryName)
      : [...current, categoryName];
    updateStaged('categories', updated);
  };

  const toggleTag = (tagName) => {
    const current = stagedFilters.tags || [];
    const updated = current.includes(tagName)
      ? current.filter(t => t !== tagName)
      : [...current, tagName];
    updateStaged('tags', updated);
  };

  const filteredCategories = useMemo(() =>
    categories.filter(c => c.category.toLowerCase().includes(searchQuery.toLowerCase())),
    [categories, searchQuery]
  );

  const filteredTags = useMemo(() =>
    tags.filter(t => t.tag_name.toLowerCase().includes(searchQuery.toLowerCase())),
    [tags, searchQuery]
  );

  const dateRanges = stagedFilters.dateRanges || DEFAULT_DATE_RANGES;
  const amountRanges = stagedFilters.amountRanges || DEFAULT_AMOUNT_RANGES;
  const isMatchAny = stagedFilters.matchLogic === 'any';
  const canDeleteDatePill = dateRanges.length > 1 || (activeDateRange && activeDateRange.type !== 'all');
  const canDeleteAmountPill = amountRanges.length > 1 || (activeAmountRange && (activeAmountRange.minAmount || activeAmountRange.maxAmount));

  return (
    <>
      <AppPressable 
        onPress={() => {
          setStagedFilters(activeFilters);
          const dr = (activeFilters.dateRanges || DEFAULT_DATE_RANGES)[0];
          const ar = (activeFilters.amountRanges || DEFAULT_AMOUNT_RANGES)[0];
          setActiveDatePillId(dr?.id || 'default');
          setActiveAmountPillId(ar?.id || 'default');
          setIsModalVisible(true);
        }}
        className={`w-14 h-14 items-center justify-center rounded-2xl ${hasActiveFilters ? 'bg-primary' : 'bg-surface border border-border'}`}
      >
        <Ionicons name="filter" size={20} color={hasActiveFilters ? 'white' : themeColors.textMuted} />
      </AppPressable>

      <Modal
        isVisible={isModalVisible}
        onBackdropPress={() => setIsModalVisible(false)}
        style={{ justifyContent: 'flex-end', margin: 0 }}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        avoidKeyboard={true}
      >
        <View className="bg-card rounded-t-3xl px-6 pb-6 pt-6 gap-6" style={{ height: '90%' }}>
          <View className="flex-row justify-between items-center">
            <Text className="font-sansBold text-2xl text-textMain">Filters</Text>
            <CloseButton onPress={() => setIsModalVisible(false)} />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40, gap: 24 }}
          >
            {/* ─── Matching Logic ─── */}
            <Animated.View layout={LinearTransition.duration(250)}>
              <TouchableOpacity
                onPress={() => setIsMatchLogicSectionOpen(!isMatchLogicSectionOpen)}
                className="flex-row justify-between items-center mb-3"
              >
                <Text className="font-sansBold text-textMuted">Matching Logic</Text>
                <View className="flex-row items-center gap-2">
                  <Text className="font-sansMed text-primary text-sm">
                    {stagedFilters.matchLogic === 'any' ? 'Match Any' : 'Match All'}
                  </Text>
                  <Ionicons name={isMatchLogicSectionOpen ? 'chevron-up' : 'chevron-down'} size={18} color={themeColors.textMuted} />
                </View>
              </TouchableOpacity>
              
              {isMatchLogicSectionOpen && (
                <Animated.View entering={FadeIn.duration(250)} exiting={FadeOut.duration(200)}>
                  <SegmentControl
                    options={[
                      { label: 'Match All', value: 'all' },
                      { label: 'Match Any', value: 'any' }
                    ]}
                    selectedOption={stagedFilters.matchLogic || 'all'}
                    onSelect={handleMatchLogicChange}
                  />
                  <Text className="text-textMuted text-xs mt-2 mx-1 font-sansReg mb-4">
                    {isMatchAny
                      ? 'Shows transactions matching ANY selected category, tag, type, date, or amount group.'
                      : 'Shows transactions matching ALL of your selected categories, tags, and type.'}
                  </Text>
                </Animated.View>
              )}
            </Animated.View>

            {/* ─── Transaction Type ─── */}
            <Animated.View layout={LinearTransition.duration(250)}>
              <TouchableOpacity
                onPress={() => setIsTypeSectionOpen(!isTypeSectionOpen)}
                className="flex-row justify-between items-center mb-3"
              >
                <Text className="font-sansBold text-textMuted">Type</Text>
                <View className="flex-row items-center gap-2">
                  <Text className="font-sansMed text-primary text-sm capitalize">
                    {stagedFilters.type || 'all'}
                  </Text>
                  <Ionicons name={isTypeSectionOpen ? 'chevron-up' : 'chevron-down'} size={18} color={themeColors.textMuted} />
                </View>
              </TouchableOpacity>

              {isTypeSectionOpen && (
                <Animated.View entering={FadeIn.duration(250)} exiting={FadeOut.duration(200)} className="mb-4">
                  <View className="flex-row gap-3">
                    {['all', 'Income', 'Expense'].map((type) => {
                      const isActive = (stagedFilters.type || 'all') === type;
                      return (
                        <TouchableOpacity
                           key={type}
                           onPress={() => updateStaged('type', type)}
                           className={`px-5 py-2 rounded-xl border ${isActive ? 'bg-primary border-primary' : 'bg-surface border border-borderSubtle'}`}
                        >
                          <Text className={`font-sansMed capitalize ${isActive ? 'text-white' : 'text-textMuted'}`}>
                            {type}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </Animated.View>
              )}
            </Animated.View>

            {/* ─── Date Range ─── */}
            <Animated.View layout={LinearTransition.duration(250)}>
              <TouchableOpacity
                onPress={() => setIsDateSectionOpen(!isDateSectionOpen)}
                className="flex-row justify-between items-center mb-3"
              >
                <Text className="font-sansBold text-textMuted">Date Range</Text>
                <View className="flex-row items-center gap-2">
                  {canDeleteDatePill && isDateSectionOpen && (
                    <Animated.View entering={FadeIn.duration(250)} exiting={FadeOut.duration(200)}>
                      <TouchableOpacity
                        onPress={deleteActiveDateGroup}
                        className="p-1"
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons name="trash-outline" size={15} color={themeColors.red} />
                      </TouchableOpacity>
                    </Animated.View>
                  )}
                  <Ionicons name={isDateSectionOpen ? 'chevron-up' : 'chevron-down'} size={18} color={themeColors.textMuted} />
                </View>
              </TouchableOpacity>

              {/* Date pills — only shown in Match Any mode */}
              {isMatchAny && (
                <Animated.View layout={LinearTransition.duration(250)} entering={FadeIn.duration(250)} exiting={FadeOut.duration(200)}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
                    <View className="flex-row gap-2 pr-2">
                      {dateRanges.map((dr, idx) => {
                        const label = formatDateLabel(dr) || `Date ${idx + 1}`;
                        const isActive = dr.id === activeDatePillId;
                        return (
                          <Animated.View key={dr.id} entering={FadeIn.duration(250)} exiting={FadeOut.duration(200)} layout={LinearTransition.duration(250)}>
                            <TouchableOpacity
                              onPress={() => { setActiveDatePillId(dr.id); setIsDateSectionOpen(true); }}
                              className={`px-4 py-2 rounded-xl border ${isActive ? 'bg-primary border-primary' : 'bg-surface border border-borderSubtle'}`}
                            >
                              <Text className={`font-sansMed text-sm ${isActive ? 'text-white' : 'text-textMuted'}`}>
                                {label}
                              </Text>
                            </TouchableOpacity>
                          </Animated.View>
                        );
                      })}
                      <Animated.View entering={FadeIn.duration(250)} exiting={FadeOut.duration(200)}>
                        <TouchableOpacity
                          onPress={addDateGroup}
                          className="flex-row items-center gap-1 px-4 py-2 rounded-xl border border-dashed border-primary bg-primary/10"
                        >
                          <Ionicons name="add" size={14} color={themeColors.primary} />
                          <Text className="font-sansMed text-sm text-primary">Add Date</Text>
                        </TouchableOpacity>
                      </Animated.View>
                    </View>
                  </ScrollView>
                </Animated.View>
              )}

              {/* Calendar always shown when section is open */}
              {isDateSectionOpen && (
                <Animated.View
                  entering={FadeIn.duration(250)}
                  exiting={FadeOut.duration(200)}
                  className="border border-borderSubtle rounded-3xl overflow-hidden bg-card"
                >
                  <Calendar
                    markingType="period"
                    markedDates={markedDates}
                    onDayPress={onDayPress}
                    theme={{
                      calendarBackground: 'transparent',
                      selectedDayBackgroundColor: themeColors.primary,
                      todayTextColor: themeColors.primary,
                      dayTextColor: themeColors.textMain,
                      textDayFontFamily: 'GoogleSans-Regular',
                      textMonthFontFamily: 'GoogleSans-Bold',
                      textDayHeaderFontFamily: 'GoogleSans-Medium',
                    }}
                  />
                </Animated.View>
              )}
            </Animated.View>

            {/* ─── Amount Range ─── */}
            <Animated.View layout={LinearTransition.duration(250)}>
              <TouchableOpacity
                onPress={() => setIsAmountSectionOpen(!isAmountSectionOpen)}
                className="flex-row justify-between items-center mb-3"
              >
                <Text className="font-sansBold text-textMuted">Amount Range</Text>
                <View className="flex-row items-center gap-2">
                  {canDeleteAmountPill && isAmountSectionOpen && (
                    <Animated.View entering={FadeIn.duration(250)} exiting={FadeOut.duration(200)}>
                      <TouchableOpacity
                        onPress={deleteActiveAmountGroup}
                        className="p-1"
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons name="trash-outline" size={15} color={themeColors.red} />
                      </TouchableOpacity>
                    </Animated.View>
                  )}
                  <Ionicons name={isAmountSectionOpen ? 'chevron-up' : 'chevron-down'} size={18} color={themeColors.textMuted} />
                </View>
              </TouchableOpacity>

              {/* Amount pills — only shown in Match Any mode */}
              {isMatchAny && (
                <Animated.View layout={LinearTransition.duration(250)} entering={FadeIn.duration(250)} exiting={FadeOut.duration(200)}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
                    <View className="flex-row gap-2 pr-2">
                      {amountRanges.map((ar, idx) => {
                        const label = formatAmountLabel(ar) || `Range ${idx + 1}`;
                        const isActive = ar.id === activeAmountPillId;
                        return (
                          <Animated.View key={ar.id} entering={FadeIn.duration(250)} exiting={FadeOut.duration(200)} layout={LinearTransition.duration(250)}>
                            <TouchableOpacity
                              onPress={() => { setActiveAmountPillId(ar.id); setIsAmountSectionOpen(true); }}
                              className={`px-4 py-2 rounded-xl border ${isActive ? 'bg-primary border-primary' : 'bg-surface border border-borderSubtle'}`}
                            >
                              <Text className={`font-sansMed text-sm ${isActive ? 'text-white' : 'text-textMuted'}`}>
                                {label}
                              </Text>
                            </TouchableOpacity>
                          </Animated.View>
                        );
                      })}
                      <Animated.View entering={FadeIn.duration(250)} exiting={FadeOut.duration(200)}>
                        <TouchableOpacity
                          onPress={addAmountGroup}
                          className="flex-row items-center gap-1 px-4 py-2 rounded-xl border border-dashed border-primary bg-primary/10"
                        >
                          <Ionicons name="add" size={14} color={themeColors.primary} />
                          <Text className="font-sansMed text-sm text-primary">Add Range</Text>
                        </TouchableOpacity>
                      </Animated.View>
                    </View>
                  </ScrollView>
                </Animated.View>
              )}

              {/* Amount inline editor */}
              {isAmountSectionOpen && (
                <Animated.View
                  entering={FadeIn.duration(250)}
                  exiting={FadeOut.duration(200)}
                  className="flex-row items-center gap-3"
                >
                  <TextInput
                    placeholder="Min"
                    keyboardType="numeric"
                    placeholderTextColor={themeColors.textMuted}
                    value={activeAmountRange?.minAmount || ''}
                    onChangeText={(v) => updateActiveAmountRange({ minAmount: v })}
                    className="flex-1 bg-surface border border-borderSubtle rounded-xl px-4 py-3 font-sansReg text-textMain"
                  />
                  <Text className="text-textMuted">—</Text>
                  <TextInput
                    placeholder="Max"
                    keyboardType="numeric"
                    placeholderTextColor={themeColors.textMuted}
                    value={activeAmountRange?.maxAmount || ''}
                    onChangeText={(v) => updateActiveAmountRange({ maxAmount: v })}
                    className="flex-1 bg-surface border border-borderSubtle rounded-xl px-4 py-3 font-sansReg text-textMain"
                  />
                </Animated.View>
              )}
            </Animated.View>

            {/* ─── Categories & Tags ─── */}
            <Animated.View layout={LinearTransition.duration(250)}>
              <View className="flex-row justify-between items-center mb-3">
                <View className="flex-1 mr-4">
                  <SegmentControl
                    options={[
                      { label: 'Categories', value: 'categories' },
                      { label: 'Tags', value: 'tags' }
                    ]}
                    selectedOption={activeFilterTab}
                    onSelect={(val) => { setSearchQuery(''); setActiveFilterTab(val); }}
                  />
                </View>
                <TouchableOpacity onPress={() => setIsSearchVisible(!isSearchVisible)}>
                  <Ionicons name={isSearchVisible ? 'close-circle' : 'search'} size={20} color={themeColors.textMuted} />
                </TouchableOpacity>
              </View>

              {isSearchVisible && (
                <Animated.View entering={FadeIn.duration(250)} exiting={FadeOut.duration(200)}>
                  <SearchBar
                    placeholder={activeFilterTab === 'categories' ? 'Search categories...' : 'Search tags...'}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    containerClassName="mb-4"
                  />
                </Animated.View>
              )}

              <Animated.View
                layout={LinearTransition.duration(250)}
                style={{ minHeight: 74, maxHeight: 258 }}
                className="border border-borderSubtle rounded-2xl bg-surface/50 p-2"
              >
                <ScrollView nestedScrollEnabled={true} showsVerticalScrollIndicator={false}>
                  {activeFilterTab === 'categories' ? (
                    filteredCategories.map((item) => (
                      <Animated.View
                        key={item.category_id}
                        entering={FadeIn.duration(250)}
                        exiting={FadeOut.duration(200)}
                        layout={LinearTransition.duration(250)}
                      >
                        <TouchableOpacity
                          onPress={() => toggleCategory(item.category)}
                          className={`flex-row items-center gap-3 px-4 py-3 mb-2 rounded-2xl border ${stagedFilters.categories?.includes(item.category) ? 'bg-primary border-primary' : 'bg-card border-borderSubtle'}`}
                        >
                          <Ionicons
                            name={item.icon}
                            size={20}
                            color={stagedFilters.categories?.includes(item.category) ? 'white' : themeColors.primary}
                          />
                          <Text className={`font-sansMed text-lg ${stagedFilters.categories?.includes(item.category) ? 'text-white' : 'text-textMain'}`}>
                            {item.category}
                          </Text>
                        </TouchableOpacity>
                      </Animated.View>
                    ))
                  ) : (
                    filteredTags.map((item) => {
                      const isSelected = stagedFilters.tags?.includes(item.tag_name);
                      return (
                        <Animated.View
                          key={item.tag_id}
                          entering={FadeIn.duration(250)}
                          exiting={FadeOut.duration(200)}
                          layout={LinearTransition.duration(250)}
                        >
                          <TouchableOpacity
                            onPress={() => toggleTag(item.tag_name)}
                            style={isSelected ? { backgroundColor: item.color, borderColor: item.color } : {}}
                            className={`flex-row items-center px-4 py-3 mb-2 rounded-2xl border ${isSelected ? '' : 'bg-card border-borderSubtle'}`}
                          >
                            <Text className={`font-sansMed text-lg ${isSelected ? 'text-textMain' : 'text-textMain'}`}>
                              {item.tag_name}
                            </Text>
                          </TouchableOpacity>
                        </Animated.View>
                      );
                    })
                  )}
                </ScrollView>
              </Animated.View>
            </Animated.View>

          </ScrollView>

          <TouchableOpacity onPress={handleClear} className="items-center">
            <Text className="text-red-500 font-sansBold">Reset all filters</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleApply}
            className="bg-primary py-4 rounded-2xl items-center"
          >
            <Text className="text-white font-sansBold text-lg">Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
};

export default TransactionFilter;
