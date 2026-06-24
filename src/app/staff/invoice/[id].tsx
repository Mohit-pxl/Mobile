import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, Linking, Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { apiGet, Invoice } from "@/services/api";
import { useQuery } from "@tanstack/react-query";

export default function InvoiceScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ["invoice", id],
    queryFn: async () => {
      const res = await apiGet<Invoice>(`/billing/invoices/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  const inv = data;
  const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;
  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) +
    " " +
    new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  const handleShare = () => {
    if (!inv) return;
    const lines = [
      `*Invoice ${inv.invoiceNumber}*`,
      `Date: ${fmtDate(inv.createdAt)}`,
      `Customer: ${inv.customer?.name || "Walk-in"}`,
      ``,
      ...inv.items.map((i) => `• ${i.product.name} × ${i.qty} = ${fmt(i.subtotal)}`),
      ``,
      `Subtotal: ${fmt(inv.subtotal)}`,
      `GST: ${fmt(inv.gstAmount)}`,
      `*Total: ${fmt(inv.total)}*`,
      `Payment: ${inv.paymentMode.toUpperCase()}`,
      ``,
      `Goldy Mobiles, Indore`,
    ].join("\n");
    Share.share({ message: lines });
  };

  const handleWhatsApp = () => {
    if (!inv) return;
    const customer = inv.customer;
    if (!customer?.phone) {
      handleShare();
      return;
    }
    const msg = encodeURIComponent(
      `Hi ${customer.name}, your invoice *${inv.invoiceNumber}* for ${fmt(inv.total)} via ${inv.paymentMode.toUpperCase()} has been generated. Thank you for shopping at Goldy Mobiles!`
    );
    Linking.openURL(`https://wa.me/${customer.phone.replace(/\D/g, "")}?text=${msg}`);
  };

  if (isLoading || !inv) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { paddingTop: insets.top + 4, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text2} />
        </Pressable>
        <Text style={[styles.topTitle, { color: colors.foreground }]}>Invoice</Text>
        <Pressable onPress={handleShare} style={styles.iconBtn}>
          <Ionicons name="share-outline" size={22} color={colors.text2} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: insets.bottom + 100 }}>
        <View style={[styles.card, { backgroundColor: colors.bg2, borderColor: colors.border }]}>
          <View style={styles.invHeader}>
            <View>
              <Text style={[styles.invNumber, { color: colors.primary }]}>{inv.invoiceNumber}</Text>
              <Text style={[styles.invDate, { color: colors.text3 }]}>{fmtDate(inv.createdAt)}</Text>
            </View>
            <View style={[styles.payBadge, { backgroundColor: colors.bg3 }]}>
              <Text style={[styles.payBadgeText, { color: colors.foreground }]}>{inv.paymentMode.toUpperCase()}</Text>
            </View>
          </View>
          {inv.customer && (
            <View style={[styles.customerRow, { borderTopColor: colors.border }]}>
              <Ionicons name="person-outline" size={14} color={colors.text3} />
              <Text style={[styles.customerText, { color: colors.text2 }]}>
                {inv.customer.name} · {inv.customer.phone}
              </Text>
            </View>
          )}
          {inv.staff && (
            <View style={styles.staffRow}>
              <Text style={[styles.staffText, { color: colors.text3 }]}>Staff: {inv.staff.name}</Text>
            </View>
          )}
        </View>

        <Text style={[styles.sectionLabel, { color: colors.text3 }]}>Items</Text>
        <View style={[styles.itemsBox, { backgroundColor: colors.bg2, borderColor: colors.border }]}>
          {inv.items.map((item, i) => (
            <View key={i} style={[styles.itemRow, { borderBottomColor: colors.border }]}>
              <View style={styles.itemInfo}>
                <Text style={[styles.itemName, { color: colors.foreground }]} numberOfLines={1}>{item.product.name}</Text>
                <Text style={[styles.itemSub, { color: colors.text3 }]}>
                  {fmt(item.price)} × {item.qty} {item.gstPercent > 0 ? `(+${item.gstPercent}% GST)` : ""}
                </Text>
              </View>
              <Text style={[styles.itemTotal, { color: colors.foreground }]}>{fmt(item.subtotal)}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.totalsCard, { backgroundColor: colors.bg3, borderColor: colors.border }]}>
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: colors.text3 }]}>Subtotal</Text>
            <Text style={[styles.totalVal, { color: colors.foreground }]}>{fmt(inv.subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: colors.text3 }]}>GST</Text>
            <Text style={[styles.totalVal, { color: colors.foreground }]}>{fmt(inv.gstAmount)}</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.totalRow}>
            <Text style={[styles.grandLabel, { color: colors.foreground }]}>Total</Text>
            <Text style={[styles.grandVal, { color: colors.primary }]}>{fmt(inv.total)}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { backgroundColor: colors.bg2, borderTopColor: colors.border, paddingBottom: insets.bottom + 8 }]}>
        <Pressable style={[styles.waBtn, { backgroundColor: colors.whatsapp }]} onPress={handleWhatsApp}>
          <Ionicons name="logo-whatsapp" size={18} color="#fff" />
          <Text style={styles.waBtnText}>Send to customer</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  topBar: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingBottom: 10, borderBottomWidth: 1, gap: 10 },
  topTitle: { flex: 1, fontSize: 16, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  iconBtn: { padding: 4 },
  card: { borderWidth: 1, borderRadius: 12, padding: 14, gap: 8 },
  invHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  invNumber: { fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold" },
  invDate: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 3 },
  payBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  payBadgeText: { fontSize: 11, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  customerRow: { flexDirection: "row", alignItems: "center", gap: 6, paddingTop: 10, borderTopWidth: 1 },
  customerText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  staffRow: {},
  staffText: { fontSize: 11, fontFamily: "Inter_400Regular" },
  sectionLabel: { fontSize: 10, textTransform: "uppercase", letterSpacing: 0.6, fontFamily: "Inter_500Medium" },
  itemsBox: { borderWidth: 1, borderRadius: 12, overflow: "hidden" },
  itemRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1 },
  itemInfo: { flex: 1, minWidth: 0 },
  itemName: { fontSize: 12, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  itemSub: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  itemTotal: { fontSize: 13, fontWeight: "700", fontFamily: "Inter_700Bold" },
  totalsCard: { borderWidth: 1, borderRadius: 12, padding: 12, gap: 8 },
  totalRow: { flexDirection: "row", justifyContent: "space-between" },
  totalLabel: { fontSize: 13, fontFamily: "Inter_400Regular" },
  totalVal: { fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  grandLabel: { fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold" },
  grandVal: { fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold" },
  divider: { height: 1, marginVertical: 4 },
  bottomBar: { padding: 14, borderTopWidth: 1 },
  waBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 10, paddingVertical: 13 },
  waBtnText: { color: "#fff", fontWeight: "700", fontFamily: "Inter_700Bold", fontSize: 13 },
});
