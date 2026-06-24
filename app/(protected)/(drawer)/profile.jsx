import React, { useState } from 'react';
import { View, Text, TextInput, Alert, ActivityIndicator, TouchableOpacity, ScrollView, Platform } from 'react-native';
import SafeScreen from '@/components/SafeScreen';
import { useUser, useClerk } from '@clerk/clerk-expo';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import NestedTopBar from '@/components/NestedTopBar';
import AppPressable from '@/components/pressables/AppPressable';
import ClosedEyeIcon from '@/components/ClosedEyeIcon';
import CascadingDropdown from '@/components/CascadingDropdown';

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useClerk();
  const { colors } = useTheme();

  // Profile Form States
  const [username, setUsername] = useState(user?.username || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [showProfileSection, setShowProfileSection] = useState(false);

  // Security Form States
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  if (!user) {
    return (
      <SafeScreen className="justify-center items-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeScreen>
    );
  }

  const handleUpdateProfile = async () => {
    if (!username.trim()) {
      Alert.alert('Error', 'Username cannot be empty');
      return;
    }
    try {
      setIsUpdatingProfile(true);
      await user.update({
        username: username.trim(),
      });
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', err.errors?.[0]?.message || 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword) {
      Alert.alert('Error', 'Please enter your current password');
      return;
    }
    if (!newPassword) {
      Alert.alert('Error', 'Please enter a new password');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }
    try {
      setIsUpdatingPassword(true);
      await user.updatePassword({
        currentPassword,
        newPassword,
      });
      Alert.alert('Success', 'Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordSection(false);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', err.errors?.[0]?.message || 'Failed to update password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/sign-in');
        },
      },
    ]);
  };

  return (
    <SafeScreen>
      <NestedTopBar title="Profile" />

      <KeyboardAwareScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 24, paddingBottom: 40, gap: 24 }}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header Block */}
        <View className="items-center bg-card p-6 rounded-card shadow-sm border border-borderSubtle">
          <View className="relative">
            <Image
              source={user.imageUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
              style={{ width: 100, height: 100, borderRadius: 50 }}
              contentFit="cover"
              className="border-2 border-primary"
            />
            <View className="absolute bottom-0 right-0 bg-primary p-2 rounded-full border border-card">
              <Ionicons name="camera" size={16} color="white" />
            </View>
          </View>
          <Text className="text-2xl font-sansBold text-textMain mt-4">
            {user.fullName || user.username || 'User'}
          </Text>
          <Text className="text-sm font-sansReg text-textMuted mt-1">
            {user.primaryEmailAddress?.emailAddress}
          </Text>
        </View>

        {/* Profile Info Details Form */}
        <View className="bg-card p-5 rounded-card shadow-sm border border-borderSubtle">
          <CascadingDropdown
            title=""
            isOpen={showProfileSection}
            onToggle={() => setShowProfileSection(!showProfileSection)}
            headerContent={
              <View className="flex-row items-center gap-3">
                <View className="p-2 rounded-full bg-surface border border-borderSubtle">
                  <Ionicons name="person-outline" size={20} color={colors.primary} />
                </View>
                <Text className="text-lg font-sansBold text-textMain">
                  Personal Details
                </Text>
              </View>
            }
          >
            <View className="gap-3 mt-2">
              {/* Username */}
              <View className="gap-1.5">
                <Text className="text-sm font-sansBold text-textMuted ml-1">Username</Text>
                <View className="flex-row border border-border rounded-input px-4 py-3 bg-surface items-center">
                  <Ionicons name="at-outline" color={colors.textMuted} size={20} />
                  <TextInput
                    className="flex-1 ml-3 font-sansMed text-lg text-textMain py-1"
                    placeholder="Username"
                    placeholderTextColor={colors.textMuted + '80'}
                    value={username}
                    onChangeText={setUsername}
                    style={{ includeFontPadding: false, textAlignVertical: 'center' }}
                  />
                </View>
              </View>

              {/* Email (Read only) */}
              <View className="gap-1.5 opacity-60">
                <Text className="text-sm font-sansBold text-textMuted ml-1">Email Address</Text>
                <View className="flex-row border border-border rounded-input px-4 py-3 bg-surface/50 items-center">
                  <Ionicons name="mail-outline" color={colors.textMuted} size={20} />
                  <Text className="flex-1 ml-3 font-sansMed text-lg text-textMuted py-1">
                    {user.primaryEmailAddress?.emailAddress}
                  </Text>
                  <Ionicons name="lock-closed-outline" color={colors.textMuted} size={18} />
                </View>
              </View>

              <AppPressable
                className="w-full mt-2"
                activeClassName=""
                onPress={handleUpdateProfile}
                disabled={isUpdatingProfile}
              >
                {({ pressed }) => (
                  <View
                    className={`w-full flex-row justify-center items-center py-3.5 rounded-button gap-2 ${
                      pressed ? 'bg-accent' : 'bg-primary'
                    }`}
                  >
                    {isUpdatingProfile ? (
                      <ActivityIndicator size="small" color={pressed ? '#000000' : '#ffffff'} />
                    ) : (
                      <>
                        <Ionicons name="checkmark-sharp" size={20} color={pressed ? colors.textMain : '#ffffff'} />
                        <Text
                          className={`font-sansBold text-lg ${
                            pressed ? 'text-textMain' : 'text-white'
                          }`}
                        >
                          Save Changes
                        </Text>
                      </>
                    )}
                  </View>
                )}
              </AppPressable>
            </View>
          </CascadingDropdown>
        </View>

        {/* Security / Password section */}
        <View className="bg-card p-5 rounded-card shadow-sm border border-borderSubtle">
          <CascadingDropdown
            title=""
            isOpen={showPasswordSection}
            onToggle={() => setShowPasswordSection(!showPasswordSection)}
            headerContent={
              <View className="flex-row items-center gap-3">
                <View className="p-2 rounded-full bg-surface border border-borderSubtle">
                  <Ionicons name="key-outline" size={20} color={colors.primary} />
                </View>
                <Text className="text-lg font-sansBold text-textMain">
                  Change Password
                </Text>
              </View>
            }
          >
            <View className="gap-3 mt-2">
              {/* Current Password */}
              <View className="gap-1.5 relative justify-center">
                <Text className="text-sm font-sansBold text-textMuted ml-1">Current Password</Text>
                <View className="flex-row border border-border rounded-input px-4 py-3 bg-surface items-center">
                  <Ionicons name="lock-closed-outline" color={colors.textMuted} size={20} />
                  <TextInput
                    className="flex-1 ml-3 font-sansMed text-lg text-textMain py-1 pr-8"
                    placeholder="Enter current password"
                    placeholderTextColor={colors.textMuted + '80'}
                    secureTextEntry={!showCurrentPassword}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    style={{ includeFontPadding: false, textAlignVertical: 'center' }}
                  />
                  <TouchableOpacity
                    onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-4"
                  >
                    {showCurrentPassword ? (
                      <Ionicons name="eye-outline" size={20} color={colors.textMuted} />
                    ) : (
                      <ClosedEyeIcon size={20} color={colors.textMuted} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* New Password */}
              <View className="gap-1.5 relative justify-center">
                <Text className="text-sm font-sansBold text-textMuted ml-1">New Password</Text>
                <View className="flex-row border border-border rounded-input px-4 py-3 bg-surface items-center">
                  <Ionicons name="lock-closed-outline" color={colors.textMuted} size={20} />
                  <TextInput
                    className="flex-1 ml-3 font-sansMed text-lg text-textMain py-1 pr-8"
                    placeholder="Enter new password"
                    placeholderTextColor={colors.textMuted + '80'}
                    secureTextEntry={!showNewPassword}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    style={{ includeFontPadding: false, textAlignVertical: 'center' }}
                  />
                  <TouchableOpacity
                    onPress={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4"
                  >
                    {showNewPassword ? (
                      <Ionicons name="eye-outline" size={20} color={colors.textMuted} />
                    ) : (
                      <ClosedEyeIcon size={20} color={colors.textMuted} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm New Password */}
              <View className="gap-1.5 relative justify-center">
                <Text className="text-sm font-sansBold text-textMuted ml-1">Confirm New Password</Text>
                <View className="flex-row border border-border rounded-input px-4 py-3 bg-surface items-center">
                  <Ionicons name="lock-closed-outline" color={colors.textMuted} size={20} />
                  <TextInput
                    className="flex-1 ml-3 font-sansMed text-lg text-textMain py-1 pr-8"
                    placeholder="Confirm new password"
                    placeholderTextColor={colors.textMuted + '80'}
                    secureTextEntry={!showConfirmPassword}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    style={{ includeFontPadding: false, textAlignVertical: 'center' }}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4"
                  >
                    {showConfirmPassword ? (
                      <Ionicons name="eye-outline" size={20} color={colors.textMuted} />
                    ) : (
                      <ClosedEyeIcon size={20} color={colors.textMuted} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <AppPressable
                className="w-full mt-2"
                activeClassName=""
                onPress={handleChangePassword}
                disabled={isUpdatingPassword}
              >
                {({ pressed }) => (
                  <View
                    className={`w-full flex-row justify-center items-center py-3.5 rounded-button gap-2 ${
                      pressed ? 'bg-accent' : 'bg-primary'
                    }`}
                  >
                    {isUpdatingPassword ? (
                      <ActivityIndicator size="small" color={pressed ? '#000000' : '#ffffff'} />
                    ) : (
                      <>
                        <Ionicons name="key-sharp" size={20} color={pressed ? colors.textMain : '#ffffff'} />
                        <Text
                          className={`font-sansBold text-lg ${
                            pressed ? 'text-textMain' : 'text-white'
                          }`}
                        >
                          Update Password
                        </Text>
                      </>
                    )}
                  </View>
                )}
              </AppPressable>
            </View>
          </CascadingDropdown>
        </View>

        {/* Logout Button */}
        <AppPressable
          className="w-full"
          activeClassName=""
          onPress={handleLogout}
        >
          {({ pressed }) => (
            <View
              className={`w-full flex-row justify-center items-center py-4 rounded-button gap-2 ${
                pressed ? 'opacity-80' : 'bg-danger'
              }`}
            >
              <Ionicons name="log-out-outline" size={22} color="#ffffff" />
              <Text className="font-sansBold text-lg text-white">
                Logout
              </Text>
            </View>
          )}
        </AppPressable>

      </KeyboardAwareScrollView>
    </SafeScreen>
  );
}