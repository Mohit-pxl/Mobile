import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import MetricCard from "@/components/MetricCard";
import { useColors } from "@/hooks/useColors";
import { apiGet, Product, SalesReport } from "@/services/api";
import { useQuery } from "@tanstack/react-query";

const PERIODS = ["Today", "Week", "Month", "Year"] as const;
type Period = (typeof PERIODS)[number];

export default function ReportsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [period, setPeriod] = useState<Period>("Month");

  const salesQuery = useQuery({
    queryKey: ["reports-sales", period],
    queryFn: async () => {
      const res = await apiGet<SalesReport>(`/reports/sales?period=${period.toLowerCase()}`);
      return res.data;
    },
  });

  const topProductsQuery = useQuery({
    queryKey: ["reports-top-products", period],
    queryFn: async () => {
      const res = await apiGet<(Product & { unitsSold: number; revenue: number })[]>(`/reports/top-products?period=${period.toLowerCase()}&limit=5`);
      return res.data || [];
    },
  });

  const lowStockQuery = useQuery({
    queryKey: ["low-stock"],
    queryFn: async () => {
      const res = await apiGet<Product[]>("/products?lowStock=true");
      return res.data || [];
    },
  });

  const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;
  const data = salesQuery.data;
  const topProducts = topProductsQuery.data || [];
  const lowStock = lowStockQuery.data || [];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 12, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={colors.text2} />
        </Pressable>
        <Text style={[styles.title, { color: colors.foreground }]}>Reports</Text>
      </View>

      <View style={[styles.periodRow, { borderBottomColor: colors.border }]}>
        {PERIODS.map((p) => (
          <Pressable
            key={p}
            style={[styles.periodBtn, { backgroundColor: period === p ? colors.primary : colors.bg3, borderColor: period === p ? colors.primary : colors.border2 }]}
            onPress={() => setPeriod(p)}
          >
            <Text style={[styles.periodText, { color: period === p ? "#000" : colors.text2 }]}>{p}</Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: insets.bottom + 24 }}>
        {salesQuery.isLoading ? (
          <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} />
        ) : (
          <View style={styles.metricsGrid}>
            <MetricCard value={fmt(data?.totalSales || 0)} label="Revenue" valueColor="accent" />
            <MetricCard value={String(data?.totalOrders || 0)} label="Orders" />
            <MetricCard value={fmt(data?.avgOrderValue || 0)} label="Avg order" />
            <MetricCard value={(data?.topPaymentMode || "–").toUpperCase()} label="Top payment" />
          </View>
        )}

        <Text style={[styles.sectionLabel, { color: colors.text3 }]}>Top Products · {period}</Text>
        <View style={[styles.card, { backgroundColor: colors.bg2, borderColor: colors.border }]}>
          {topProductsQuery.isLoading ? (
            <ActivityIndicator color={colors.primary} style={{ padding: 20 }} />
          ) : topProducts.length === 0 ? (
            <Text style={[styles.empty, { color: colors.text3 }]}>No data for this period</Text>
          ) : (
            topProducts.map((p, i) => (
              <View key={p._id} style={[styles.topRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.rank, { color: colors.primary }]}>#{i + 1}</Text>
                <View style={styles.topInfo}>
                  <Text style={[styles.topName, { color: colors.foreground }]} numberOfLines={1}>{p.name}</Text>
                  <Text style={[styles.topSub, { color: colors.text3 }]}>{p.unitsSold || 0} units · {fmt(p.revenue || 0)}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        <Text style={[styles.sectionLabel, { color: colors.text3 }]}>Low Stock Alert</Text>
        <View style={[styles.card, { backgroundColor: colors.bg2, borderColor: colors.border }]}>
          {lowStockQuery.isLoading ? (
            <ActivityIndicator color={colors.primary} style={{ padding: 20 }} />
          ) : lowStock.length === 0 ? (
            <Text style={[styles.empty, { color: colors.greenText }]}>All products well-stocked</Text>
          ) : (
            lowStock.map((p) => (
              <View key={p._id} style={[styles.lowRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.lowName, { color: colors.foreground }]} numberOfLines={1}>{p.name}</Text>
                <View style={[styles.lowBadge, { backgroundColor: p.stock === 0 ? colors.redBg : colors.amberBg }]}>
                  <Text style={[styles.lowBadgeText, { color: p.stock === 0 ? colors.redText : colors.amberText }]}>
                    {p.stock} left
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  title: { flex: 1, fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold" },
  periodRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1 },
  periodBtn: { flex: 1, borderWidth: 1, borderRadius: 8, paddingVertical: 7, alignItems: "center" },
  periodText: { fontSize: 12, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  metricsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  sectionLabel: { fontSize: 10, textTransform: "uppercase", letterSpacing: 0.6, fontFamily: "Inter_500Medium" },
  card: { borderWidth: 1, borderRadius: 12, overflow: "hidden" },
  topRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1 },
  rank: { fontSize: 14, fontWeight: "700", fontFamily: "Inter_700Bold", minWidth: 24 },
  topInfo: { flex: 1 },
  topName: { fontSize: 12, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  topSub: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  lowRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1 },
  lowName: { fontSize: 12, fontWeight: "600", fontFamily: "Inter_600SemiBold", flex: 1, marginRight: 10 },
  lowBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  lowBadgeText: { fontSize: 11, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  empty: { textAlign: "center", padding: 20, fontFamily: "Inter_400Regular" },
});
