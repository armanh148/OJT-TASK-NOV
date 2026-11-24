import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  User,
  Mail,
  Server,
  Moon,
  LogOut,
  Smartphone,
  Globe,
  RotateCcw,
  Check,
  ScanFace,
  ShieldCheck,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScreenWrapper } from '../../src/components/ScreenWrapper';
import { Header } from '../../src/components/Header';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import {
  getApiBaseUrl,
  setApiBaseUrl,
  resetApiBaseUrl,
} from '../../src/services/api';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();

  const [apiUrl, setApiUrl] = useState('');
  const [isUrlSaved, setIsUrlSaved] = useState(false);
  const [faceLockEnabled, setFaceLockEnabled] = useState(false);

  useEffect(() => {
    (async () => {
      const current = await getApiBaseUrl();
      setApiUrl(current);
      const faceLock = await AsyncStorage.getItem('finova_face_lock');
      if (faceLock === 'true') {
        setFaceLockEnabled(true);
      }
    })();
  }, []);

  const handleToggleFaceLock = async (value: boolean) => {
    setFaceLockEnabled(value);
    await AsyncStorage.setItem('finova_face_lock', value ? 'true' : 'false');
    Alert.alert(
      value ? 'Face Lock Activated' : 'Face Lock Deactivated',
      value
        ? 'Biometric Face ID / Fingerprint lock is now active for this device.'
        : 'Biometric Face Lock has been turned off.'
    );
  };

  const handleSaveApiUrl = async () => {
    if (!apiUrl.trim()) {
      Alert.alert('Error', 'API URL cannot be empty');
      return;
    }
    await setApiBaseUrl(apiUrl.trim());
    setIsUrlSaved(true);
    setTimeout(() => setIsUrlSaved(false), 3000);
    Alert.alert('Saved', `Backend API URL updated to:\n${apiUrl.trim()}`);
  };

  const handleResetApiUrl = async () => {
    const defaultUrl = await resetApiBaseUrl();
    setApiUrl(defaultUrl);
    Alert.alert('Reset', `API URL reset to default:\n${defaultUrl}`);
  };

  const handleQuickUrl = (url: string) => {
    setApiUrl(url);
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out of Monthly Budget Tracker?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <ScreenWrapper>
      <Header title="Settings & Profile" subtitle="Preferences and API connectivity" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Profile Card */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.profileRow}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.userName, { color: colors.text }]}>{user?.name || 'User'}</Text>
              <Text style={[styles.userEmail, { color: colors.textMuted }]}>
                {user?.email || 'user@example.com'}
              </Text>
            </View>
          </View>
        </View>

        {/* Appearance Section */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Moon size={18} color={colors.primary} />
              <View>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Dark Mode</Text>
                <Text style={[styles.settingSub, { color: colors.textMuted }]}>
                  {isDark ? 'Dark theme enabled' : 'Light theme enabled'}
                </Text>
              </View>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Security & Biometrics Section */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Security & Privacy</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <ScanFace size={20} color={faceLockEnabled ? '#0F2942' : colors.textMuted} />
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Biometric Face Lock</Text>
                <Text style={[styles.settingSub, { color: colors.textMuted }]}>
                  {faceLockEnabled ? 'Protected with Face ID / Biometrics' : 'Require Face ID to unlock app'}
                </Text>
              </View>
            </View>
            <Switch
              value={faceLockEnabled}
              onValueChange={handleToggleFaceLock}
              trackColor={{ false: colors.border, true: '#0F2942' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Backend API Configuration */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.cardHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Server size={18} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Backend Server URL</Text>
            </View>
            <TouchableOpacity onPress={handleResetApiUrl} style={styles.resetBtn}>
              <RotateCcw size={14} color={colors.textMuted} />
              <Text style={[styles.resetText, { color: colors.textMuted }]}>Reset</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.apiHelpText, { color: colors.textMuted }]}>
            Change this if testing on a real phone (Android / iPhone) or using a deployed cloud backend.
          </Text>

          <View style={[styles.inputBox, { borderColor: colors.border, backgroundColor: colors.surfaceVariant }]}>
            <TextInput
              style={[styles.apiInput, { color: colors.text }]}
              value={apiUrl}
              onChangeText={setApiUrl}
              placeholder="http://10.0.2.2:5000/api"
              placeholderTextColor={colors.textDim}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Quick Preset Buttons */}
          <Text style={[styles.presetLabel, { color: colors.textMuted }]}>Quick Presets:</Text>
          <View style={styles.presetRow}>
            <TouchableOpacity
              style={[styles.presetPill, { backgroundColor: colors.surfaceVariant }]}
              onPress={() => handleQuickUrl('http://192.168.0.100:5000/api')}
            >
              <Smartphone size={12} color={colors.primary} />
              <Text style={[styles.presetText, { color: colors.text }]}>Wi-Fi Phone (Android/iPhone)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.presetPill, { backgroundColor: colors.surfaceVariant }]}
              onPress={() => handleQuickUrl('http://10.0.2.2:5000/api')}
            >
              <Smartphone size={12} color={colors.primary} />
              <Text style={[styles.presetText, { color: colors.text }]}>Android Emulator</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.presetPill, { backgroundColor: colors.surfaceVariant }]}
              onPress={() => handleQuickUrl('http://localhost:5000/api')}
            >
              <Globe size={12} color={colors.primary} />
              <Text style={[styles.presetText, { color: colors.text }]}>iOS Simulator</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.saveUrlBtn, { backgroundColor: colors.primary }]}
            onPress={handleSaveApiUrl}
            activeOpacity={0.8}
          >
            <Text style={styles.saveUrlBtnText}>Save Backend URL</Text>
          </TouchableOpacity>
        </View>

        {/* Sign Out Button (F10) */}
        <TouchableOpacity
          style={[styles.logoutBtn, { backgroundColor: colors.expenseBg, borderColor: colors.expenseBorder }]}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <LogOut size={18} color={colors.expense} />
          <Text style={[styles.logoutBtnText, { color: colors.expense }]}>Log Out (F10)</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
    gap: 14,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
  },
  userEmail: {
    fontSize: 12,
    marginTop: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 4,
  },
  resetText: {
    fontSize: 11,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  settingLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  settingSub: {
    fontSize: 11,
  },
  apiHelpText: {
    fontSize: 11,
    lineHeight: 15,
  },
  inputBox: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    justifyContent: 'center',
  },
  apiInput: {
    fontSize: 13,
  },
  presetLabel: {
    fontSize: 11,
  },
  presetRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  presetPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  presetText: {
    fontSize: 11,
    fontWeight: '600',
  },
  saveUrlBtn: {
    height: 42,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  saveUrlBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
    marginTop: 8,
  },
  logoutBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
