import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";
import { apiGet, apiPatch, apiPost, Product } from "@/services/api";

const CATEGORIES = ["Mobiles", "Audio", "Earphones", "Chargers", "Smart Watches", "Laptops", "Accessories", "Other"];
const GST_RATES = [0, 5, 12, 18, 28];

interface Spec { key: string; value: string }

export default function AddProductScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const isEdit = !!id;
  const isAdmin = user?.role === "admin";
  const canEditPrice = user?.permissions?.canEditPrice || isAdmin;

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    brand: "",
    category: "Mobiles",
    sellingPrice: "",
    mrp: "",
    costPrice: "",
    stock: "",
    lowStockThreshold: "5",
    gstPercent: "18",
    hsnCode: "",
    barcode: "",
    internalCode: "",
    description: "",
  });
  const [specs, setSpecs] = useState<Spec[]>([{ key: "", value: "" }]);

  useEffect(() => {
    if (isEdit) {
      apiGet<Product>(`/products/${id}`).then((res) => {
        const p = res.data;
        setForm({
          name: p.name,
          brand: p.brand,
          category: p.category,
          sellingPrice: String(p.sellingPrice),
          mrp: String(p.mrp || ""),
          costPrice: String(p.costPrice || ""),
          stock: String(p.stock),
          lowStockThreshold: String(p.lowStockThreshold),
          gstPercent: String(p.gstPercent),
          hsnCode: p.hsnCode || "",
          barcode: p.barcode || "",
          internalCode: p.internalCode || "",
          description: p.description || "",
        });
        if (p.specifications) setSpecs(p.specifications.length ? p.specifications : [{ key: "", value: "" }]);
      }).catch(() => {});
    }
  }, [id, isEdit]);

  const set = (k: keyof typeof form, v: string) => setForm((prev) => ({ ...prev, [k]: v }));

  const generateBarcode = () => {
    const code = `GM${Date.now().toString().slice(-8)}`;
    set("barcode", code);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const addSpec = () => setSpecs((prev) => [...prev, { key: "", value: "" }]);
  const setSpec = (i: number, field: "key" | "value", val: string) => {
    setSpecs((prev) => prev.map((s, idx) => idx === i ? { ...s, [field]: val } : s));
  };
  const removeSpec = (i: number) => setSpecs((prev) => prev.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    if (!form.name.trim() || !form.brand.trim()) {
      Alert.alert("Required fields", "Name and brand are required.");
      return;
    }
    if (!form.sellingPrice || isNaN(Number(form.sellingPrice))) {
      Alert.alert("Required fields", "Enter a valid selling price.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        brand: form.brand.trim(),
        category: form.category,
        sellingPrice: Number(form.sellingPrice),
        mrp: form.mrp ? Number(form.mrp) : undefined,
        costPrice: isAdmin && form.costPrice ? Number(form.costPrice) : undefined,
        stock: Number(form.stock || 0),
        lowStockThreshold: Number(form.lowStockThreshold || 5),
        gstPercent: Number(form.gstPercent || 0),
        hsnCode: form.hsnCode || undefined,
        barcode: form.barcode || undefined,
        internalCode: form.internalCode || undefined,
        description: form.description || undefined,
        specifications: specs.filter((s) => s.key && s.value),
      };

      if (isEdit) {
        await apiPatch(`/products/${id}`, payload);
      } else {
        await apiPost("/products", payload);
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (e: unknown) {
      Alert.alert("Error", e instanceof Error ? e.message : "Failed to save product.");
    } finally {
      setSaving(false);
    }
  };

  const Label = ({ text, required }: { text: string; required?: boolean }) => (
    <Text style={[styles.label, { color: colors.text3 }]}>
      {text}{required && " *"}
    </Text>
  );

  const Field = ({ label: lbl, value, onChange, placeholder, keyboardType = "default", required = false, editable = true }: {
    label: string; value: string; onChange: (t: string) => void; placeholder?: string;
    keyboardType?: "default" | "numeric" | "decimal-pad"; required?: boolean; editable?: boolean;
  }) => (
    <View style={styles.fieldGroup}>
      <Label text={lbl} required={required} />
      <TextInput
        style={[styles.input, { color: editable ? colors.foreground : colors.text3, backgroundColor: colors.bg3, borderColor: colors.border }]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder || lbl}
        placeholderTextColor={colors.text3}
        keyboardType={keyboardType}
        editable={editable}
      />
    </View>
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="arrow-back" size={22} color={colors.text2} />
          </Pressable>
          <Text style={[styles.topTitle, { color: colors.foreground }]}>{isEdit ? "Edit Product" : "Add Product"}</Text>
          <Pressable style={[styles.saveBtn, { backgroundColor: colors.primary, opacity: saving ? 0.7 : 1 }]} onPress={handleSave} disabled={saving}>
            {saving ? <ActivityIndicator color="#000" size="small" /> : <Text style={styles.saveBtnText}>Save</Text>}
          </Pressable>
        </View>

        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 40 }}>
          <Text style={[styles.section, { color: colors.primary }]}>Basic Info</Text>
          <Field label="Product name" value={form.name} onChange={(v) => set("name", v)} required />
          <Field label="Brand" value={form.brand} onChange={(v) => set("brand", v)} required />
          <View style={styles.fieldGroup}>
            <Label text="Category" required />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
              {CATEGORIES.map((c) => (
                <Pressable key={c} style={[styles.catChip, { backgroundColor: form.category === c ? colors.primary : colors.bg3, borderColor: form.category === c ? colors.primary : colors.border2 }]} onPress={() => set("category", c)}>
                  <Text style={{ color: form.category === c ? "#000" : colors.text2, fontSize: 12, fontFamily: "Inter_500Medium" }}>{c}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <Text style={[styles.section, { color: colors.primary }]}>Pricing</Text>
          <Field label="Selling price" value={form.sellingPrice} onChange={(v) => set("sellingPrice", v)} keyboardType="decimal-pad" required />
          <Field label="MRP (optional)" value={form.mrp} onChange={(v) => set("mrp", v)} keyboardType="decimal-pad" />
          {isAdmin && <Field label="Cost price (admin only)" value={form.costPrice} onChange={(v) => set("costPrice", v)} keyboardType="decimal-pad" />}

          <View style={styles.fieldGroup}>
            <Label text="GST %" />
            <View style={styles.gstRow}>
              {GST_RATES.map((r) => (
                <Pressable key={r} style={[styles.gstBtn, { backgroundColor: form.gstPercent === String(r) ? colors.primary : colors.bg3, borderColor: form.gstPercent === String(r) ? colors.primary : colors.border2 }]} onPress={() => set("gstPercent", String(r))}>
                  <Text style={{ color: form.gstPercent === String(r) ? "#000" : colors.text2, fontSize: 12, fontFamily: "Inter_700Bold" }}>{r}%</Text>
                </Pressable>
              ))}
            </View>
          </View>
          <Field label="HSN Code" value={form.hsnCode} onChange={(v) => set("hsnCode", v)} />

          <Text style={[styles.section, { color: colors.primary }]}>Inventory</Text>
          <View style={styles.row2}>
            <View style={{ flex: 1 }}>
              <Field label="Stock qty" value={form.stock} onChange={(v) => set("stock", v)} keyboardType="numeric" />
            </View>
            <View style={{ flex: 1 }}>
              <Field label="Low stock alert" value={form.lowStockThreshold} onChange={(v) => set("lowStockThreshold", v)} keyboardType="numeric" />
            </View>
          </View>
          <View style={styles.fieldGroup}>
            <Label text="Barcode" />
            <View style={styles.barcodeRow}>
              <TextInput
                style={[styles.input, { flex: 1, color: colors.foreground, backgroundColor: colors.bg3, borderColor: colors.border }]}
                value={form.barcode}
                onChangeText={(v) => set("barcode", v)}
                placeholder="Scan or enter barcode"
                placeholderTextColor={colors.text3}
              />
              <Pressable style={[styles.autoBtn, { backgroundColor: colors.bg4, borderColor: colors.border2 }]} onPress={generateBarcode}>
                <Text style={{ color: colors.primary, fontSize: 11, fontFamily: "Inter_600SemiBold" }}>Auto</Text>
              </Pressable>
            </View>
          </View>
          <Field label="Internal code / SKU" value={form.internalCode} onChange={(v) => set("internalCode", v)} />

          <Text style={[styles.section, { color: colors.primary }]}>Specifications</Text>
          {specs.map((s, i) => (
            <View key={i} style={styles.specRow}>
              <TextInput style={[styles.specInput, { color: colors.foreground, backgroundColor: colors.bg3, borderColor: colors.border }]} placeholder="Key" placeholderTextColor={colors.text3} value={s.key} onChangeText={(v) => setSpec(i, "key", v)} />
              <TextInput style={[styles.specInput, { flex: 1, color: colors.foreground, backgroundColor: colors.bg3, borderColor: colors.border }]} placeholder="Value" placeholderTextColor={colors.text3} value={s.value} onChangeText={(v) => setSpec(i, "value", v)} />
              <Pressable onPress={() => removeSpec(i)} hitSlop={8}>
                <Ionicons name="close-circle-outline" size={18} color={colors.text3} />
              </Pressable>
            </View>
          ))}
          <Pressable style={[styles.addSpecBtn, { borderColor: colors.border2 }]} onPress={addSpec}>
            <Ionicons name="add" size={14} color={colors.primary} />
            <Text style={{ color: colors.primary, fontSize: 12, fontFamily: "Inter_500Medium" }}>Add spec</Text>
          </Pressable>

          <Text style={[styles.section, { color: colors.primary }]}>Description</Text>
          <TextInput
            style={[styles.textarea, { color: colors.foreground, backgroundColor: colors.bg3, borderColor: colors.border }]}
            value={form.description}
            onChangeText={(v) => set("description", v)}
            placeholder="Product description (optional)"
            placeholderTextColor={colors.text3}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  topTitle: { fontSize: 16, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  saveBtn: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 8, minWidth: 56, alignItems: "center" },
  saveBtnText: { color: "#000", fontWeight: "700", fontFamily: "Inter_700Bold", fontSize: 13 },
  section: { fontSize: 12, fontWeight: "700", fontFamily: "Inter_700Bold", textTransform: "uppercase", letterSpacing: 0.5 },
  fieldGroup: { gap: 6 },
  label: { fontSize: 11, fontFamily: "Inter_500Medium" },
  input: { borderWidth: 1, borderRadius: 9, paddingHorizontal: 12, paddingVertical: 11, fontSize: 13, fontFamily: "Inter_400Regular" },
  textarea: { borderWidth: 1, borderRadius: 9, paddingHorizontal: 12, paddingVertical: 11, fontSize: 13, fontFamily: "Inter_400Regular", minHeight: 80 },
  catRow: { gap: 8 },
  catChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  gstRow: { flexDirection: "row", gap: 8 },
  gstBtn: { flex: 1, borderWidth: 1, borderRadius: 8, paddingVertical: 8, alignItems: "center" },
  row2: { flexDirection: "row", gap: 10 },
  barcodeRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  autoBtn: { paddingHorizontal: 14, paddingVertical: 11, borderRadius: 9, borderWidth: 1 },
  specRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  specInput: { width: 110, borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 9, fontSize: 12, fontFamily: "Inter_400Regular" },
  addSpecBtn: { flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, alignSelf: "flex-start", borderStyle: "dashed" },
});
