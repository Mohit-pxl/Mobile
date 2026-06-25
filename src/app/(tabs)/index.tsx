import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import EmptyState from "@/components/EmptyState";
import ProductCard from "@/components/ProductCard";
import { SkeletonRow } from "@/components/Skeleton";
import { useWishlist } from "@/context/WishlistContext";
import { useColors } from "@/hooks/useColors";
import { apiGet, Product } from "@/services/api";
import { useQuery } from "@tanstack/react-query";

const CATEGORIES = ["All", "Mobiles", "Audio", "Earphones", "Chargers", "Smart Watches", "Laptops"];

export default function CustomerHomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { toggle, isWishlisted } = useWishlist();
  const [activeCategory, setActiveCategory] = useState("All");

  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;
  const numColumns = isLargeScreen ? 3 : 2;
  const paddingHorizontal = 10;
  const gap = 8;
  const availableWidth = width - (paddingHorizontal * 2) - (gap * (numColumns - 1));
  const itemWidth = availableWidth / numColumns;

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["catalog", "products", activeCategory],
    queryFn: async () => {
      const params = activeCategory !== "All" ? `?category=${activeCategory}` : "";
      const res = await apiGet<Product[]>(`/catalog/products${params}`);
      return res.data;
    },
  });

  const products = data || [];
  const featured = products.slice(0, 6);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 12, backgroundColor: colors.bg2, borderBottomColor: colors.border }]}>
        <View style={styles.headerLeft}>
          <Ionicons name="flash" size={22} color={colors.primary} />
          <Text style={[styles.logoText, { color: colors.foreground }]}>ElectroShop</Text>
        </View>
        <Pressable onPress={() => router.push("/(tabs)/search")} hitSlop={8}>
          <Ionicons name="search-outline" size={22} color={colors.text2} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
        contentContainerStyle={{ paddingBottom: insets.bottom + 90 }}
      >
        <LinearGradient colors={["#2a1a00", "#1a1a1a"]} style={styles.banner}>
          <View>
            <Text style={[styles.bannerSub, { color: colors.primary }]}>Goldy Mobiles</Text>
            <Text style={[styles.bannerTitle, { color: colors.foreground }]}>{"Premium\nElectronics"}</Text>
            <Pressable
              style={[styles.bannerBtn, { backgroundColor: colors.primary }]}
              onPress={() => router.push("/(tabs)/browse")}
            >
              <Text style={{ fontFamily: "Inter_700Bold", fontSize: 12, color: "#000" }}>Shop Now</Text>
            </Pressable>
          </View>
          <Ionicons name="phone-portrait" size={72} color={colors.primary} style={{ opacity: 0.3 }} />
        </LinearGradient>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {CATEGORIES.map((cat) => (
            <Pressable
              key={cat}
              style={[
                styles.chip,
                {
                  backgroundColor: activeCategory === cat ? colors.primary : colors.bg3,
                  borderColor: activeCategory === cat ? colors.primary : colors.border2,
                },
              ]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: activeCategory === cat ? "#000" : colors.text2 },
                ]}
              >
                {cat}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Featured Products</Text>
          <Pressable onPress={() => router.push("/(tabs)/browse")}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
          </Pressable>
        </View>

        {isLoading ? (
          <View style={{ paddingHorizontal: 16, gap: 8 }}>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </View>
        ) : featured.length === 0 ? (
          <EmptyState icon="phone-portrait-outline" title="No products found" />
        ) : (
          <View style={styles.grid}>
            {featured.map((p) => (
              <View key={p._id} style={{ width: itemWidth }}>
                <ProductCard
                  product={p}
                  isWishlisted={isWishlisted(p._id)}
                  onToggleWishlist={toggle}
                />
              </View>
            ))}
          </View>
        )}
      </ScrollView>
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
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  logoText: { fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold" },
  banner: {
    margin: 16,
    borderRadius: 14,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    overflow: "hidden",
  },
  bannerSub: { fontSize: 11, fontFamily: "Inter_500Medium", letterSpacing: 0.5, marginBottom: 4 },
  bannerTitle: { fontSize: 22, fontWeight: "800", fontFamily: "Inter_700Bold", lineHeight: 28 },
  bannerBtn: {
    marginTop: 14,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  chips: { paddingHorizontal: 16, gap: 8, paddingBottom: 4 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
  seeAll: { fontSize: 12, fontFamily: "Inter_500Medium" },
  grid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 10, gap: 8 },
});
