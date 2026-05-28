import React from 'react';
import { View, Text, TouchableOpacity, LayoutAnimation } from 'react-native';

const SegmentControl = ({ 
  options = [], 
  selectedOption, 
  onSelect,
  activeBgColor = 'bg-slate-700',
  activeTextColor = 'text-white',
  inactiveBgColor = 'bg-slate-50',
  inactiveTextColor = 'text-slate-600',
  containerClassName = '',
  buttonClassName = ''
}) => {
  const handleSelect = (option) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onSelect(option);
  };

  return (
    <View className={`flex-row p-1 bg-slate-100/80 rounded-2xl ${containerClassName}`}>
      {options.map((option) => {
        const isSelected = option.value === selectedOption;
        return (
          <TouchableOpacity
            key={option.value}
            onPress={() => handleSelect(option.value)}
            className={`flex-1 py-2.5 rounded-xl items-center justify-center ${isSelected ? activeBgColor : inactiveBgColor} ${buttonClassName}`}
            style={{
              shadowColor: isSelected ? '#000' : 'transparent',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: isSelected ? 0.08 : 0,
              shadowRadius: 2,
              elevation: isSelected ? 1 : 0,
            }}
          >
            <Text className={`font-sansBold text-sm ${isSelected ? activeTextColor : inactiveTextColor}`}>
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default SegmentControl;
