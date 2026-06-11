import { View, Text } from 'react-native'
import React from 'react'
import Graph from '@/components/analytics/Graph'

const Profile = () => {
  return (
    <View className='flex-1 p-6 bg-background'>
      <Graph width={340} height={250} xLabel="Time" yLabel="Amount" />
    </View>
  )
}

export default Profile;