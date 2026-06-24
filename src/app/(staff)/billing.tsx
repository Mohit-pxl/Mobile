import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import CustomerPicker from "@/components/CustomerPicker";
import { useCart } from "@/context/CartContext";
import { useColors } from "@/hooks/useColors";
import { apiGet, apiPost, Customer, Product } from "@/services/api";

const PAYMENT_MODES = ["cash", "upi", "card", "credit"] as const;
type PaymentMode = (typeof PAYMENT_MODES)[number];

const MODE_ICONS: Record<string, string> = {
  cash: "💵",
  upi: "📱",
  card: "💳",
  credit: "📒",
};

export default function BillingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ scannedProductId?: string }>();
  const { items, addItem, updateQty, clearCart, subtotal, gstAmount, total } = useCart();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searching, setSearching] = useState(false);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("cash");
  const [placing, setPlacing] = useState(false);
  const [barcodeText, setBarcodeText] = useState("");
  const [customer, setCustomer] = useState<Customer | null>(null);

  const prevScannedId = useRef<string | undefined>(undefined);

  /* ── Handle scanned product returned from camera screen ── */
  useEffect(() => {
    const sid = params.scannedProductId;
    if (!sid || sid === prevScannedId.current) return;
    prevScannedId.current = sid;
    apiGet<Product>(`/products/${sid}`)
      .then((r) => { addItem(r.data); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); })
      .catch(() => Alert.alert("Error", "Could not load scanned product."));
  }, [params.scannedProductId]);

  const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

  /* ── Product name search ── */
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearch = (q: string) => {
    setSearchQuery(q);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!q.trim()) { setSearchResults([]); return; }
    timerRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await apiGet<Product[]>(`/products?search=${encodeURIComponent(q)}&limit=5`);
        setSearchResults(res.data || []);
      } catch { setSearchResults([]); }
      finally { setSearching(false); }
    }, 300);
  };

  /* ── Manual barcode text lookup ── */
  const handleBarcodeSearch = async () => {
    if (!barcodeText.trim()) return;
    try {
      const res = await apiGet<Product>(`/products/barcode/${barcodeText.trim()}`);
      addItem(res.data);
      setBarcodeText("");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      Alert.alert("Not found", "No product matches that barcode.");
    }
  };

  /* ── Place order ── */
  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      Alert.alert("Empty cart", "Add at least one product.");
      return;
    }
    if (paymentMode === "credit" && !customer) {
      Alert.alert("Customer required", "Credit sales must be linked to a customer. Please select or create one.");
      return;
    }
    setPlacing(true);
    try {
      const res = await apiPost<{ _id: string }>("/billing/invoices", {
        items: items.map((i) => ({ productId: i.product._id, qty: i.qty, price: i.product.sellingPrice })),
        paymentMode,
        ...(customer ? { customerId: customer._id } : {}),
      });
      clearCart();
      setCustomer(null);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.push(`/staff/invoice/${res.data._id}`);
    } catch (e: unknown) {
      Alert.alert("Error", e instanceof Error ? e.message : "Failed to place order.");
    } finally {
      setPlacing(false);
    }
  };

  const isCreditMode = paymentMode === "credit";

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: insets.top + 12, borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.title, { color: colors.foreground }]}>New Sale</Text>
          <Text style={[styles.invNum, { color: colors.text3 }]}>
            INV-{Date.now().toString().slice(-4)}
          </Text>
        </View>
        {items.length > 0 && (
          <Pressable onPress={clearCart} hitSlop={8}>
            <Text style={{ color: colors.destructive, fontSize: 12, fontFamily: "Inter_400Regular" }}>
              Clear
            </Text>
          </Pressable>
        )}
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 14, gap: 12, paddingBottom: insets.bottom + 200 }}
      >
        {/* ── Scan + barcode row ── */}
        <View style={styles.scanRow}>
          <Pressable
            style={[styles.cameraBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/staff/barcode-scanner")}
          >
            <Ionicons name="camera" size={20} color="#000" />
            <Text style={styles.cameraBtnText}>Scan</Text>
          </Pressable>
          <View style={[styles.barcodeBox, { flex: 1, backgroundColor: colors.bg2, borderColor: colors.border2 }]}>
            <Ionicons name="barcode-outline" size={18} color={colors.text3} />
            <TextInput
              style={[styles.barcodeInput, { color: colors.foreground }]}
              placeholder="Type barcode"
              placeholderTextColor={colors.text3}
              value={barcodeText}
              onChangeText={setBarcodeText}
              onSubmitEditing={handleBarcodeSearch}
              returnKeyType="search"
            />
            {barcodeText.length > 0 && (
              <Pressable onPress={handleBarcodeSearch} hitSlop={8}>
                <Ionicons name="search" size={16} color={colors.primary} />
              </Pressable>
            )}
          </View>
        </View>

        {/* ── Product search ── */}
        <View style={[styles.searchBox, { backgroundColor: colors.bg3, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={16} color={colors.text3} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search by product name"
            placeholderTextColor={colors.text3}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searching && <ActivityIndicator size="small" color={colors.primary} />}
        </View>

        {searchResults.length > 0 && (
          <View style={[styles.results, { backgroundColor: colors.bg2, borderColor: colors.border }]}>
            {searchResults.map((p) => (
              <Pressable
                key={p._id}
                style={[styles.resultRow, { borderBottomColor: colors.border }]}
                onPress={() => {
                  addItem(p);
                  setSearchQuery("");
                  setSearchResults([]);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <View style={styles.resultInfo}>
                  <Text style={[styles.resultName, { color: colors.foreground }]} numberOfLines={1}>
                    {p.name}
                  </Text>
                  <Text style={[styles.resultSub, { color: colors.text3 }]}>
                    {p.brand} · {fmt(p.sellingPrice)} · {p.stock} in stock
                  </Text>
                </View>
                <Ionicons name="add-circle" size={22} color={colors.primary} />
              </Pressable>
            ))}
          </View>
        )}

        {/* ── Cart ── */}
        <View style={styles.cartHeader}>
          <Text style={[styles.sectionLabel, { color: colors.text3 }]}>Cart · {items.length} items</Text>
        </View>

        {items.length === 0 ? (
          <View style={[styles.emptyCart, { backgroundColor: colors.bg3, borderColor: colors.border }]}>
            <Ionicons name="scan-outline" size={28} color={colors.text3} />
            <Text style={[styles.emptyCartText, { color: colors.text3 }]}>
              Tap{" "}
              <Text style={{ color: colors.primary, fontWeight: "700" }}>Scan</Text>
              {" "}to scan a barcode, or search by product name
            </Text>
          </View>
        ) : (
          <View style={[styles.cartBox, { borderColor: colors.border }]}>
            {items.map((item, idx) => (
              <View
                key={item.product._id}
                style={[
                  styles.cartRow,
                  {
                    borderBottomColor: colors.border,
                    borderBottomWidth: idx < items.length - 1 ? 1 : 0,
                  },
                ]}
              >
                <View style={styles.cartInfo}>
                  <Text style={[styles.cartName, { color: colors.foreground }]} numberOfLines={1}>
                    {item.product.name}
                  </Text>
                  <Text style={[styles.cartSub, { color: colors.text3 }]}>
                    {fmt(item.product.sellingPrice)} each
                  </Text>
                </View>
                <View style={styles.qtyRow}>
                  <Pressable
                    style={[styles.qtyBtn, { borderColor: colors.border2 }]}
                    onPress={() => updateQty(item.product._id, item.qty - 1)}
                  >
                    <Ionicons name="remove" size={14} color={colors.text2} />
                  </Pressable>
                  <Text style={[styles.qtyText, { color: colors.foreground }]}>{item.qty}</Text>
                  <Pressable
                    style={[styles.qtyBtn, { borderColor: colors.border2 }]}
                    onPress={() => updateQty(item.product._id, item.qty + 1)}
                  >
                    <Ionicons name="add" size={14} color={colors.text2} />
                  </Pressable>
                  <Text style={[styles.lineTotal, { color: colors.foreground }]}>
                    {fmt(item.product.sellingPrice * item.qty)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ── Totals ── */}
        {items.length > 0 && (
          <View style={[styles.totalsBox, { backgroundColor: colors.bg3, borderColor: colors.border }]}>
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: colors.text3 }]}>Subtotal</Text>
              <Text style={[styles.totalValue, { color: colors.foreground }]}>{fmt(subtotal)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: colors.text3 }]}>GST</Text>
              <Text style={[styles.totalValue, { color: colors.foreground }]}>{fmt(gstAmount)}</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.totalRow}>
              <Text style={[styles.grandLabel, { color: colors.foreground }]}>Total</Text>
              <Text style={[styles.grandValue, { color: colors.primary }]}>{fmt(total)}</Text>
            </View>
          </View>
        )}

        {/* ── Payment mode ── */}
        <Text style={[styles.sectionLabel, { color: colors.text3 }]}>Payment mode</Text>
        <View style={styles.paymentGrid}>
          {PAYMENT_MODES.map((mode) => {
            const active = paymentMode === mode;
            return (
              <Pressable
                key={mode}
                style={[
                  styles.payBtn,
                  {
                    backgroundColor: active ? colors.primary : colors.bg3,
                    borderColor: active ? colors.primary : colors.border2,
                  },
                ]}
                onPress={() => setPaymentMode(mode)}
              >
                <Text style={styles.payBtnEmoji}>{MODE_ICONS[mode]}</Text>
                <Text style={[styles.payBtnLabel, { color: active ? "#000" : colors.text2 }]}>
                  {mode.toUpperCase()}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* ── Customer picker ── */}
        <View style={styles.customerSection}>
          <View style={styles.customerHeader}>
            <Text style={[styles.sectionLabel, { color: colors.text3 }]}>Customer</Text>
            {isCreditMode && (
              <View style={[styles.requiredBadge, { backgroundColor: colors.redBg }]}>
                <Text style={[styles.requiredText, { color: colors.redText }]}>Required for credit</Text>
              </View>
            )}
          </View>
          <CustomerPicker selected={customer} onSelect={setCustomer} />
        </View>
      </ScrollView>

      {/* ── Sticky bottom bar ── */}
      {items.length > 0 && (
        <View
          style={[
            styles.bottomBar,
            {
              backgroundColor: colors.bg2,
              borderTopColor: colors.border,
              paddingBottom: insets.bottom + 8,
            },
          ]}
        >
          {customer && (
            <View style={[styles.bottomCustomer, { backgroundColor: colors.bg3 }]}>
              <Ionicons name="person" size={12} color={colors.text3} />
              <Text style={[styles.bottomCustomerText, { color: colors.text2 }]} numberOfLines={1}>
                {customer.name}
              </Text>
            </View>
          )}
          <View style={styles.bottomRow}>
            <View style={styles.bottomSummary}>
              <Text style={[styles.bottomTotal, { color: colors.foreground }]}>{fmt(total)}</Text>
              <Text style={[styles.bottomMeta, { color: colors.text3 }]}>
                {items.length} item{items.length !== 1 ? "s" : ""} ·{" "}
                {paymentMode.toUpperCase()}
              </Text>
            </View>
            <Pressable
              style={[
                styles.placeBtn,
                {
                  backgroundColor: isCreditMode && !customer ? colors.bg4 : colors.primary,
                  opacity: placing ? 0.7 : 1,
                },
              ]}
              onPress={handlePlaceOrder}
              disabled={placing}
            >
              {placing ? (
                <ActivityIndicator color="#000" />
              ) : (
                <>
                  <Ionicons
                    name="checkmark"
                    size={16}
                    color={isCreditMode && !customer ? colors.text3 : "#000"}
                  />
                  <Text
                    style={[
                      styles.placeBtnText,
                      { color: isCreditMode && !customer ? colors.text3 : "#000" },
                    ]}
                  >
                    Place Order
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  title: { fontSize: 20, fontWeight: "700", fontFamily: "Inter_700Bold" },
  invNum: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  scanRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  cameraBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 10,
  },
  cameraBtnText: { color: "#000", fontWeight: "700", fontFamily: "Inter_700Bold", fontSize: 13 },
  barcodeBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 13,
  },
  barcodeInput: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular" },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular" },
  results: { borderWidth: 1, borderRadius: 10, overflow: "hidden" },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderBottomWidth: 1,
  },
  resultInfo: { flex: 1 },
  resultName: { fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  resultSub: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  cartHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionLabel: { fontSize: 10, textTransform: "uppercase", letterSpacing: 0.6, fontFamily: "Inter_500Medium" },
  emptyCart: {
    borderWidth: 1,
    borderRadius: 10,
    alignItems: "center",
    gap: 10,
    paddingVertical: 28,
    paddingHorizontal: 20,
    borderStyle: "dashed",
  },
  emptyCartText: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
  cartBox: { borderWidth: 1, borderRadius: 10, overflow: "hidden" },
  cartRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12, paddingVertical: 11 },
  cartInfo: { flex: 1, minWidth: 0 },
  cartName: { fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  cartSub: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  qtyBtn: { width: 22, height: 22, borderRadius: 5, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  qtyText: { fontSize: 13, fontWeight: "700", fontFamily: "Inter_700Bold", minWidth: 16, textAlign: "center" },
  lineTotal: { fontSize: 12, fontWeight: "600", fontFamily: "Inter_600SemiBold", minWidth: 58, textAlign: "right" },
  totalsBox: { borderWidth: 1, borderRadius: 10, padding: 12, gap: 6 },
  totalRow: { flexDirection: "row", justifyContent: "space-between" },
  totalLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  totalValue: { fontSize: 12, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  grandLabel: { fontSize: 14, fontWeight: "700", fontFamily: "Inter_700Bold" },
  grandValue: { fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
  divider: { height: 1, marginVertical: 4 },
  paymentGrid: { flexDirection: "row", gap: 8 },
  payBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 9,
    paddingVertical: 9,
    alignItems: "center",
    gap: 2,
  },
  payBtnEmoji: { fontSize: 16 },
  payBtnLabel: { fontSize: 10, fontWeight: "700", fontFamily: "Inter_700Bold" },
  customerSection: { gap: 8 },
  customerHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  requiredBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  requiredText: { fontSize: 10, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  /* Bottom bar */
  bottomBar: { borderTopWidth: 1, paddingHorizontal: 14, paddingTop: 10, gap: 6 },
  bottomCustomer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  bottomCustomerText: { fontSize: 11, fontFamily: "Inter_500Medium" },
  bottomRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  bottomSummary: { flex: 1 },
  bottomTotal: { fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold" },
  bottomMeta: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  placeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    minWidth: 130,
    justifyContent: "center",
  },
  placeBtnText: { fontWeight: "700", fontFamily: "Inter_700Bold", fontSize: 14 },
});
