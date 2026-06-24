import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert, FlatList, Modal, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import EmptyState from "@/components/EmptyState";
import { SkeletonRow } from "@/components/Skeleton";
import { useColors } from "@/hooks/useColors";
import { apiGet, apiPost, Expense } from "@/services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const EXPENSE_CATEGORIES = ["Rent", "Salaries", "Utilities", "Marketing", "Repairs", "Transport", "Miscellaneous"];

export default function ExpensesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ description: "", amount: "", category: "Miscellaneous" });

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["expenses"],
    queryFn: async () => {
      const res = await apiGet<Expense[]>("/expenses");
      return res.data || [];
    },
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      if (!form.description.trim() || !form.amount || isNaN(Number(form.amount))) {
        throw new Error("Enter description and valid amount.");
      }
      await apiPost("/expenses", {
        description: form.description.trim(),
        amount: Number(form.amount),
        category: form.category,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expenses"] });
      setShowModal(false);
      setForm({ description: "", amount: "", category: "Miscellaneous" });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: (e: Error) => Alert.alert("Error", e.message),
  });

  const expenses = data || [];
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;
  const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 12, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={colors.text2} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.foreground }]}>Expenses</Text>
          <Text style={[styles.totalText, { color: colors.text3 }]}>Total: {fmt(total)}</Text>
        </View>
        <Pressable style={[styles.addBtn, { backgroundColor: colors.primary }]} onPress={() => setShowModal(true)}>
          <Ionicons name="add" size={16} color="#000" />
          <Text style={styles.addBtnText}>Add</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <View style={{ padding: 16 }}>
          {Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)}
        </View>
      ) : expenses.length === 0 ? (
        <EmptyState icon="wallet-outline" title="No expenses" subtitle="Track your shop expenses here" />
      ) : (
        <FlatList
          data={expenses}
          keyExtractor={(e) => e._id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 24 }}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
          renderItem={({ item: exp }) => (
            <View style={[styles.row, { borderBottomColor: colors.border }]}>
              <View style={[styles.catDot, { backgroundColor: colors.bg3 }]}>
                <Ionicons name="wallet-outline" size={16} color={colors.primary} />
              </View>
              <View style={styles.expInfo}>
                <Text style={[styles.expDesc, { color: colors.foreground }]}>{exp.description}</Text>
                <Text style={[styles.expSub, { color: colors.text3 }]}>{exp.category} · {fmtDate(exp.date || exp.createdAt)}</Text>
              </View>
              <Text style={[styles.expAmount, { color: colors.destructive }]}>{fmt(exp.amount)}</Text>
            </View>
          )}
        />
      )}

      <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.bg2, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>Add Expense</Text>
              <Pressable onPress={() => setShowModal(false)} hitSlop={8}>
                <Ionicons name="close" size={22} color={colors.text2} />
              </Pressable>
            </View>
            <TextInput style={[styles.formInput, { color: colors.foreground, backgroundColor: colors.bg3, borderColor: colors.border }]} placeholder="Description" placeholderTextColor={colors.text3} value={form.description} onChangeText={(v) => setForm((p) => ({ ...p, description: v }))} />
            <TextInput style={[styles.formInput, { color: colors.foreground, backgroundColor: colors.bg3, borderColor: colors.border }]} placeholder="Amount" placeholderTextColor={colors.text3} keyboardType="decimal-pad" value={form.amount} onChangeText={(v) => setForm((p) => ({ ...p, amount: v }))} />
            <Text style={[styles.fieldLabel, { color: colors.text3 }]}>Category</Text>
            <View style={styles.catRow}>
              {EXPENSE_CATEGORIES.map((c) => (
                <Pressable key={c} style={[styles.catChip, { backgroundColor: form.category === c ? colors.primary : colors.bg3, borderColor: form.category === c ? colors.primary : colors.border2 }]} onPress={() => setForm((p) => ({ ...p, category: c }))}>
                  <Text style={{ color: form.category === c ? "#000" : colors.text2, fontSize: 11, fontFamily: "Inter_500Medium" }}>{c}</Text>
                </Pressable>
              ))}
            </View>
            <Pressable style={[styles.submitBtn, { backgroundColor: colors.primary, opacity: addMutation.isPending ? 0.7 : 1 }]} onPress={() => addMutation.mutate()} disabled={addMutation.isPending}>
              {addMutation.isPending ? <ActivityIndicator color="#000" size="small" /> : <Text style={styles.submitText}>Save expense</Text>}
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  title: { fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold" },
  totalText: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 1 },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20 },
  addBtnText: { color: "#000", fontWeight: "700", fontFamily: "Inter_700Bold", fontSize: 13 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, borderBottomWidth: 1 },
  catDot: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  expInfo: { flex: 1 },
  expDesc: { fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  expSub: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  expAmount: { fontSize: 14, fontWeight: "700", fontFamily: "Inter_700Bold" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" },
  modalBox: { borderTopLeftRadius: 20, borderTopRightRadius: 20, borderWidth: 1, padding: 20, gap: 14 },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  modalTitle: { fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
  formInput: { borderWidth: 1, borderRadius: 9, paddingHorizontal: 12, paddingVertical: 11, fontSize: 13, fontFamily: "Inter_400Regular" },
  fieldLabel: { fontSize: 11, fontFamily: "Inter_500Medium" },
  catRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  catChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  submitBtn: { borderRadius: 10, paddingVertical: 13, alignItems: "center", marginTop: 4 },
  submitText: { color: "#000", fontWeight: "700", fontFamily: "Inter_700Bold", fontSize: 14 },
});
