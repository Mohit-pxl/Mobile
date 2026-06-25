import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { sendOtp, enterGuestMode, devLogin } = useAuth();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [devLoading, setDevLoading] = useState<string | null>(null);

  const handleSend = async () => {
    if (!email.trim() || !email.includes("@")) {
      Alert.alert("Invalid email", "Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      await sendOtp(email.trim().toLowerCase());
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.push({ pathname: "/(auth)/otp", params: { email: email.trim().toLowerCase() } });
    } catch (e: unknown) {
      Alert.alert("Error", e instanceof Error ? e.message : "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = () => {
    enterGuestMode();
    router.replace("/(tabs)");
  };

  const handleDev = async (role: "admin" | "staff" | "customer") => {
    setDevLoading(role);
    try {
      await devLogin(role);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } finally {
      setDevLoading(null);
    }
  };

  const DEV_ROLES: { role: "admin" | "staff" | "customer"; label: string; icon: string; color: string }[] = [
    { role: "admin",    label: "Admin",    icon: "🛡️", color: colors.redText },
    { role: "staff",    label: "Staff",    icon: "🧑‍💼", color: colors.primary },
    { role: "customer", label: "Customer", icon: "🛍️", color: colors.blueText },
  ];

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <View style={styles.center}>
          <LinearGradient colors={["#2a2000", "#1a1a1a"]} style={styles.logoBox}>
            <Ionicons name="flash" size={38} color={colors.primary} />
          </LinearGradient>

          <Text style={[styles.appName, { color: colors.foreground }]}>Goldi Mobiles</Text>
          <Text style={[styles.tagline, { color: colors.text3 }]}>Indore's premium mobile store</Text>

          <View style={styles.form}>
            <Text style={[styles.label, { color: colors.text2 }]}>Email address</Text>
            <View style={[styles.inputRow, { backgroundColor: colors.bg3, borderColor: colors.border2 }]}>
              <Ionicons name="mail-outline" size={18} color={colors.text3} />
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                placeholder="Enter your email"
                placeholderTextColor={colors.text3}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
                onSubmitEditing={handleSend}
                returnKeyType="done"
              />
            </View>

            <Pressable
              style={[styles.btnPrimary, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
              onPress={handleSend}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={[styles.btnText, { color: colors.primaryForeground }]}>Send OTP</Text>
              )}
            </Pressable>

            <Text style={[styles.staffNote, { color: colors.text3 }]}>
              Staff? Your admin will share your login details separately.
            </Text>
          </View>

          {/* ── Dev bypass ── */}
          <View style={[styles.devBox, { backgroundColor: colors.bg3, borderColor: colors.border2 }]}>
            <View style={styles.devHeader}>
              <Ionicons name="code-working-outline" size={13} color={colors.text3} />
              <Text style={[styles.devTitle, { color: colors.text3 }]}>DEV LOGIN — no backend needed</Text>
            </View>
            <View style={styles.devRow}>
              {DEV_ROLES.map(({ role, label, icon, color }) => (
                <Pressable
                  key={role}
                  style={[styles.devBtn, { borderColor: color + "44", backgroundColor: color + "11" }]}
                  onPress={() => handleDev(role)}
                  disabled={devLoading !== null}
                >
                  {devLoading === role ? (
                    <ActivityIndicator size="small" color={color} />
                  ) : (
                    <>
                      <Text style={styles.devBtnIcon}>{icon}</Text>
                      <Text style={[styles.devBtnLabel, { color }]}>{label}</Text>
                    </>
                  )}
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        <Pressable style={styles.guestBtn} onPress={handleGuest}>
          <Text style={[styles.guestText, { color: colors.text2 }]}>Browse catalog without signing in →</Text>
        </Pressable>

        <View style={{ height: insets.bottom + 16 }} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 24 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 8 },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  appName: { fontSize: 26, fontWeight: "800", fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  tagline: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 32 },
  form: { width: "100%", gap: 12 },
  label: { fontSize: 12, fontFamily: "Inter_500Medium" },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  input: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  btnPrimary: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: { fontSize: 14, fontWeight: "700", fontFamily: "Inter_700Bold" },
  staffNote: { fontSize: 11, textAlign: "center", lineHeight: 16, fontFamily: "Inter_400Regular" },
  devBox: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    gap: 10,
    marginTop: 20,
    borderStyle: "dashed",
  },
  devHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  devTitle: { fontSize: 10, fontFamily: "Inter_500Medium", letterSpacing: 0.4 },
  devRow: { flexDirection: "row", gap: 8 },
  devBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 9,
    paddingVertical: 10,
    alignItems: "center",
    gap: 4,
    minHeight: 52,
    justifyContent: "center",
  },
  devBtnIcon: { fontSize: 18 },
  devBtnLabel: { fontSize: 11, fontWeight: "700", fontFamily: "Inter_700Bold" },
  guestBtn: { alignItems: "center", paddingBottom: 8 },
  guestText: { fontSize: 12, fontFamily: "Inter_500Medium" },
});
