import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import EmptyState from "@/components/EmptyState";
import ProductCard from "@/components/ProductCard";
import { SkeletonRow } from "@/components/Skeleton";
import { useWishlist } from "@/context/WishlistContext";
import { useColors } from "@/hooks/useColors";
import { apiGet, Product } from "@/services/api";
import { useQuery } from "@tanstack/react-query";

const CATEGORIES = [
  { label: "All", icon: "apps-outline" as const },
  { label: "Mobiles", icon: "phone-portrait-outline" as const },
  { label: "Audio", icon: "headset-outline" as const },
  { label: "Earphones", icon: "headset-outline" as const },
  { label: "Chargers", icon: "battery-charging-outline" as const },
  { label: "Smart Watches", icon: "watch-outline" as const },
  { label: "Laptops", icon: "laptop-outline" as const },
  { label: "Accessories", icon: "grid-outline" as const },
];

export default function BrowseScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { toggle, isWishlisted } = useWishlist();
  const [activeCategory, setActiveCategory] = useState("All");

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["catalog", "products", activeCategory],
    queryFn: async () => {
      const params = activeCategory !== "All" ? `?category=${encodeURIComponent(activeCategory)}` : "";
      const res = await apiGet<Product[]>(`/catalog/products${params}`);
      return res.data;
    },
  });

  const products = data || [];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 12, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Browse</Text>
        <Pressable onPress={() => router.push("/(tabs)/search")}>
          <Ionicons name="search-outline" size={22} color={colors.text2} />
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.catScroll, { borderBottomColor: colors.border }]}
      >
        {CATEGORIES.map((c) => (
          <Pressable
            key={c.label}
            style={[styles.catChip, { borderColor: activeCategory === c.label ? colors.primary : colors.border2 }]}
            onPress={() => setActiveCategory(c.label)}
          >
            <Ionicons
              name={c.icon}
              size={18}
              color={activeCategory === c.label ? colors.primary : colors.text3}
            />
            <Text
              style={[
                styles.catLabel,
                { color: activeCategory === c.label ? colors.primary : colors.text2 },
              ]}
            >
              {c.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {isLoading ? (
        <View style={{ padding: 16 }}>
          {Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}
        </View>
      ) : products.length === 0 ? (
        <EmptyState icon="phone-portrait-outline" title="No products" subtitle="Try another category" />
      ) : (
        <FlatList
          data={products}
          numColumns={2}
          keyExtractor={(p) => p._id}
          contentContainerStyle={{ padding: 10, paddingBottom: insets.bottom + 90, gap: 8 }}
          columnWrapperStyle={{ gap: 8 }}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
          renderItem={({ item }) => (
            <View style={{ flex: 1 }}>
              <ProductCard product={item} isWishlisted={isWishlisted(item._id)} onToggleWishlist={toggle} />
            </View>
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
  catScroll: { paddingHorizontal: 12, gap: 8, paddingVertical: 10, borderBottomWidth: 1 },
  catChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  catLabel: { fontSize: 12, fontFamily: "Inter_500Medium" },
});
