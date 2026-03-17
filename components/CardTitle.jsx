import { Ionicons } from '@expo/vector-icons'
import { View, Text } from 'react-native'
import colors from 'tailwindcss/colors'

const CardTitle = ({name="default", title}) => {
  return (
    <View className="flex-row items-center">
      <Ionicons name={name} size={25} color={colors.slate[500]}/>
      <Text incl className="font-sansBold text-2xl text-slate-500 mt-[1] ml-2">{title}</Text>
    </View>
  )
}

export default CardTitle