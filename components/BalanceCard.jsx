import { View, Text } from "react-native";

const BalanceCard = ({ currency, summary }) => {
  // Use logical OR (||) to provide a fallback of 0 if data is missing
  const balance = parseFloat(summary?.balance || 0);
  const income = parseFloat(summary?.income || 0);
  const expenses = parseFloat(summary?.expenses || 0);

  return (
    <View className="flex-col m-6 p-6 gap-6 bg-slate-50 rounded-2xl shadow-sm">
      <View>
        <Text className="font-sansBold text-lg color-slate-400 mb-3">Total Balance</Text>
        <Text className="font-sansBold text-4xl">
          {balance >= 0 ? "+" : "-"}{currency}{Math.abs(balance).toFixed(2)}
        </Text>
      </View>
      <View className="flex-row justify-between">
        <View className="flex-col items-center gap-1">
          <Text className="font-sansBold color-slate-400">Income</Text>
          <Text className="font-sansBold text-xl color-green-500">
            {income >= 0 ? "+" : "-"}{currency}{Math.abs(income).toFixed(2)}
          </Text>
        </View>
        <View className="flex-row">
          <View className="border-l border-l-slate-300 mr-4"></View>
          <View className="flex-col items-center gap-1">
            <Text className="font-sansBold color-slate-400">Expenses</Text>
            <Text className="font-sansBold text-lg color-red-500">
              {expenses >= 0 ? "+" : "-"}{currency}{Math.abs(expenses).toFixed(2)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default BalanceCard;