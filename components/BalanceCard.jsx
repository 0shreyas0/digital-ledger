import { View, Text } from "react-native";

const fmt = (value, currency) => {
  const abs = Math.abs(parseFloat(value || 0)).toFixed(2);
  const sign = parseFloat(value || 0) >= 0 ? "+" : "-";
  return `${sign}${currency}${abs}`;
};

const BalanceCard = ({ currency = "$", summary, title = "Total Balance", className = "mx-6" }) => {
  const balance = parseFloat(summary?.balance || 0);
  const income = parseFloat(summary?.income || 0);
  const expenses = parseFloat(summary?.expenses || 0);

  return (
    <View className={`${className} my-4 rounded-card bg-card shadow-sm`}>
      {/* Balance hero */}
      <View className="px-6 pt-6 pb-2">
        <Text className="font-sansBold text-lg text-textMuted mb-2">
          {title}
        </Text>
        <Text className="font-sansBold text-4xl text-textMain">
          {fmt(balance, currency)}
        </Text>
      </View>

      {/* Income / Expenses row */}
      <View className="flex-row px-6 py-5">
        <View className="flex-1 gap-1">
          <Text className="font-sansBold text-lg text-textMuted">
            Income
          </Text>
          <Text className="font-sansBold text-xl text-green-500">
            {fmt(income, currency)}
          </Text>
        </View>

        {/* Vertical divider */}
        <View className="w-px bg-borderSubtle mx-4 self-stretch" />

        <View className="flex-1 gap-1">
          <Text className="font-sansBold text-lg text-textMuted">
            Expenses
          </Text>
          <Text className="font-sansBold text-xl text-danger">
            {fmt(expenses, currency)}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default BalanceCard;