import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import EmptyState from "@/components/EmptyState";
import ProductListRow from "@/components/ProductListRow";
import { SkeletonRow } from "@/components/Skeleton";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";
import { apiGet, Product } from "@/services/api";
import { useQuery } from "@tanstack/react-query";

const FILTERS = ["All", "Mobiles", "Audio", "Accessories", "⚠ Low stock"];

export default function StaffProductsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const showCostPrice = user?.permissions?.canViewCostPrice || user?.role === "admin";

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["staff-products", activeFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (activeFilter === "⚠ Low stock") params.set("lowStock", "true");
      else if (activeFilter !== "All") params.set("category", activeFilter);
      const res = await apiGet<Product[]>(`/products?${params}`);
      return res.data || [];
    },
  });

  const products = (data || []).filter(
    (p) => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 12, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Products</Text>
        <Pressable
          style={[styles.fab, { backgroundColor: colors.primary }]}
          onPress={() => router.push("/staff/add-product")}
        >
          <Ionicons name="add" size={16} color="#000" />
          <Text style={styles.fabText}>Add</Text>
        </Pressable>
      </View>

      <View style={[styles.searchRow, { borderBottomColor: colors.border }]}>
        <View style={[styles.searchBox, { backgroundColor: colors.bg3, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={16} color={colors.text3} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search by name, SKU, barcode"
            placeholderTextColor={colors.text3}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")} hitSlop={8}>
              <Ionicons name="close-circle" size={16} color={colors.text3} />
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 14, gap: 8, paddingVertical: 10 }}
        style={[styles.filterScroll, { borderBottomColor: colors.border }]}
      >
        {FILTERS.map((f) => (
          <Pressable
            key={f}
            style={[
              styles.chip,
              {
                backgroundColor: activeFilter === f ? colors.primary : colors.bg3,
                borderColor: activeFilter === f ? colors.primary : colors.border2,
              },
            ]}
            onPress={() => setActiveFilter(f)}
          >
            <Text style={[styles.chipText, { color: activeFilter === f ? "#000" : colors.text2 }]}>{f}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {isLoading ? (
        <View style={{ padding: 16 }}>
          {Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}
        </View>
      ) : products.length === 0 ? (
        <EmptyState icon="cube-outline" title="No products" subtitle="Tap + Add to add your first product" />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(p) => p._id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 90 }}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
          renderItem={({ item }) => (
            <ProductListRow
              product={item}
              showCostPrice={showCostPrice}
              onPress={() => router.push(`/staff/stock/${item._id}`)}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  title: { fontSize: 20, fontWeight: "700", fontFamily: "Inter_700Bold" },
  fab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  fabText: { color: "#000", fontWeight: "700", fontFamily: "Inter_700Bold", fontSize: 13 },
  searchRow: { padding: 12, borderBottomWidth: 1 },
  searchBox: { flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  searchInput: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular" },
  filterScroll: { borderBottomWidth: 1, maxHeight: 56 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 12, fontFamily: "Inter_500Medium" },
});
