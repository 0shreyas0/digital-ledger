import { View, Text, Switch } from 'react-native';
import { useColorScheme } from 'nativewind';

export default function HomeScreen() {
  const { colorScheme, toggleColorScheme } = useColorScheme();

  return (
    /* FIX: Added ${colorScheme === 'dark' ? 'dark' : ''} 
       This allows the .dark block in your CSS to take effect.
    */
    <View className={`flex-1 bg-background p-6 justify-center items-center ${colorScheme === 'dark' ? 'dark' : ''}`}>
      <Text className="text-2xl font-bold text-text">
        {colorScheme === 'dark' ? 'Dark Mode' : 'Light Mode'}
      </Text>
      
      <Text className="text-textLight mb-8">
        Manage your finances in comfort
      </Text>

      <View className="flex-row items-center gap-4 p-4 bg-card rounded-2xl border border-border">
        <Text className="text-text">Toggle Theme</Text>
        <Switch 
          value={colorScheme === 'dark'} 
          onValueChange={toggleColorScheme} 
          // Updated colors to match your blue/dark theme
          trackColor={{ false: "#cbd5e1", true: "#42A5F5" }}
        />
      </View>
    </View>
  );
}