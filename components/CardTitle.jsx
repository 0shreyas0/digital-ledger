import { Ionicons, FontAwesome, FontAwesome5 } from '@expo/vector-icons'
import * as LucideIcons from 'lucide-react-native'
import { View, Text } from 'react-native'
import colors from 'tailwindcss/colors'

const CardTitle = ({name, title, library="Ionicons"}) => {
  const renderIcon = () => {
    if (!name) return null;
    if (library === "Lucide") {
      const IconComponent = LucideIcons[name];
      if (IconComponent) {
        return <IconComponent size={25} color={colors.slate[500]} />;
      }
    }
    if (library === "FontAwesome") {
      return <FontAwesome name={name} size={25} color={colors.slate[500]} />;
    }
    if (library === "FontAwesome5") {
      return <FontAwesome5 name={name} size={25} color={colors.slate[500]} />;
    }
    return <Ionicons name={name} size={25} color={colors.slate[500]} />;
  };

  return (
    <View className="flex-row items-center">
      {renderIcon()}
      <Text className={`font-sansBold text-2xl text-slate-500 mt-[1] ${name ? "ml-2" : ""}`}>{title}</Text>
    </View>
  )
}

export default CardTitle