import { Colors } from '@/src/constants/theme'
import React from 'react'
import { View,Text, StyleProp, ViewStyle, TextInput,Button } from 'react-native'
import { Double } from 'react-native/Libraries/Types/CodegenTypes'
import "@/global.css"
import { useRouter } from 'expo-router'



export default function authentication()  {

  const router = useRouter()

  function onLoginAttemp() {
    router.push("/(tabs)")
  }

  function onSignUpPressed() { 

  }

  return (
    <View className='flex-1 items-center align-middle justify-center pb-40 bg-white' >
     <View className=' h-[300] w-2/3 bg-[#03BF62] rounded-md items-center justify-center'>
      <Text className=' text-white font-bold text-xl'>Sign in to yout account</Text>
       <View className=' justify-start flex-2 w-full '> 
         <Text className=' text-white font-bold'> Email </Text>
         <TextInput className=' h-[30] bg-w bg-opacity-25' placeholder='email'/>
         <Text className=' text-white font-bold'> Password </Text>
         <TextInput className=' h-[30] ' placeholder='password'/>
       </View>
       <View className=' justify-between flex flex-row' >
        <Button title='Login' onPress={onLoginAttemp} />
        <Button title='Signup' onPress={onSignUpPressed} />
       </View>
      </View>
    </View>
  )
}
