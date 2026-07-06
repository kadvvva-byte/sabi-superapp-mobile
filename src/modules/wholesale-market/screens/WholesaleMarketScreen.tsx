import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  ArrowLeft,
  Building2,
  ChevronRight,
  Globe2,
  MapPin,
  MessageCircle,
  Minus,
  PackageCheck,
  Plus,
  Radio,
  Search,
  ShieldCheck,
  ShoppingBasket,
  Store,
  UserRound,
  WalletCards,
} from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import {
  buildWholesaleAccessGate,
  countWholesaleCartItems,
  getExcludedWholesaleMarketCategories,
  getWholesaleMarketCategories,
  getWholesaleMarketCountries,
  getWholesaleMarketProduct,
  getWholesaleMarketProducts,
  getWholesaleMarketWholesaler,
  getWholesaleMarketWholesalers,
  searchWholesaleMarket,
} from "../application/wholesaleMarket.service";
import type {
  WholesaleMarketCartItem,
  WholesaleMarketCountryCode,
  WholesaleMarketProduct,
  WholesaleMarketTab,
} from "../domain/wholesaleMarket.types";
import { useWholesaleMarketText } from "../presentation/wholesaleMarket.i18n";

const GOLD = "#C9952E";
const INK = "#34240F";
const SOFT = "#FFF8E9";
const CARD = "#FFFFFF";

export default function WholesaleMarketScreen() {
  const { t } = useWholesaleMarketText();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [tab, setTab] = useState<WholesaleMarketTab>("home");
  const [countryCode, setCountryCode] = useState<WholesaleMarketCountryCode>("uz");
  const [categoryId, setCategoryId] = useState("food");
  const [query, setQuery] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [cart, setCart] = useState<WholesaleMarketCartItem[]>([]);

  const countries = getWholesaleMarketCountries();
  const categories = getWholesaleMarketCategories();
  const excluded = getExcludedWholesaleMarketCategories();
  const selectedCountry = countries.find((country) => country.code === countryCode) ?? countries[0];
  const selectedCategory = categories.find((category) => category.id === categoryId) ?? categories[0];
  const products = query.trim()
    ? searchWholesaleMarket(query, countryCode)
    : getWholesaleMarketProducts(countryCode, tab === "category" ? categoryId : undefined);
  const wholesalers = getWholesaleMarketWholesalers(countryCode);
  const selectedProduct = selectedProductId ? getWholesaleMarketProduct(selectedProductId) : null;
  const selectedWholesaler = selectedProduct ? getWholesaleMarketWholesaler(selectedProduct.wholesalerId) : null;
  const cartCount = countWholesaleCartItems(cart);
  const categoryCardWidth = Math.max(104, Math.floor((width - 48) / 3));

  const gate = useMemo(() => {
    return buildWholesaleAccessGate({
      buyerKycPassed: false,
      buyerAmlPassed: false,
      sellerApproved: selectedWholesaler?.verificationStatus === "verified",
      merchantReady: selectedWholesaler?.merchantStatus === "coin_ready_later",
    });
  }, [selectedWholesaler?.merchantStatus, selectedWholesaler?.verificationStatus]);

  const addProduct = (product: WholesaleMarketProduct) => {
    setCart((items) => {
      const current = items.find((item) => item.productId === product.id);
      if (current) {
        return items.map((item) => item.productId === product.id ? { ...item, quantity: item.quantity + product.quantityStep } : item);
      }
      return [...items, { productId: product.id, quantity: product.minQuantity }];
    });
  };

  const updateCartQty = (productId: string, delta: number) => {
    setCart((items) => items
      .map((item) => {
        if (item.productId !== productId) return item;
        const product = getWholesaleMarketProduct(productId);
        const min = product?.minQuantity ?? 1;
        const step = product?.quantityStep ?? 1;
        return { ...item, quantity: Math.max(min, item.quantity + delta * step) };
      })
      .filter((item) => item.quantity > 0));
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient colors={["#FFF1C9", "#FFF8E9", "#FFFDF7"]} style={styles.root}>
        <View style={styles.topBar}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={20} color={INK} />
          </Pressable>
          <View style={styles.titleBlock}>
            <Text style={styles.brand}>{t("brand.title")}</Text>
            <Text style={styles.subtitle}>{t("brand.subtitle")}</Text>
          </View>
          <View style={styles.cartBubble}>
            <ShoppingBasket size={18} color={INK} />
            <Text style={styles.cartBubbleText}>{cartCount}</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 96 }]} showsVerticalScrollIndicator={false}>
          {tab === "home" && (
            <>
              <Hero t={t} countryTitle={t(selectedCountry.titleKey)} countryImage={selectedCountry.imageUrl} query={query} setQuery={setQuery} />
              <CountryRail t={t} countries={countries} selectedCode={countryCode} onSelect={setCountryCode} />
              <SectionHeader title={t("section.wholesalers")} />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
                {wholesalers.map((seller) => <WholesalerCard key={seller.id} t={t} seller={seller} />)}
              </ScrollView>
              <SectionHeader title={t("section.products")} />
              {products.map((product) => <ProductCard key={product.id} t={t} product={product} onOpen={() => setSelectedProductId(product.id)} onAdd={() => addProduct(product)} />)}
              <SafeNotice t={t} />
            </>
          )}

          {tab === "countries" && (
            <>
              <SectionHeader title={t("section.countries")} />
              {countries.map((country) => (
                <Pressable key={country.code} style={[styles.countryRow, country.code === countryCode && styles.selectedBorder]} onPress={() => { setCountryCode(country.code); setTab("home"); }}>
                  <Image source={{ uri: country.imageUrl }} style={styles.countryRowImage} />
                  <View style={styles.flex}>
                    <Text style={styles.countryTitle}>{t(country.titleKey)}</Text>
                    <Text style={styles.countrySubtitle}>{t(country.subtitleKey)}</Text>
                    <Text style={styles.muted}>{country.cityCount} {t("label.cities")} · {country.wholesalerCount} {t("label.wholesalers")}</Text>
                  </View>
                  <ChevronRight size={20} color={GOLD} />
                </Pressable>
              ))}
            </>
          )}

          {tab === "category" && (
            <>
              <SectionHeader title={t("section.categories")} />
              <View style={styles.categoryGrid}>
                {categories.map((category) => (
                  <Pressable key={category.id} style={[styles.categoryTile, { width: categoryCardWidth }, category.id === categoryId && styles.selectedBorder]} onPress={() => setCategoryId(category.id)}>
                    <Image source={{ uri: category.imageUrl }} style={styles.categoryImage} />
                    <Text numberOfLines={2} style={styles.categoryTitle}>{t(category.titleKey)}</Text>
                  </Pressable>
                ))}
              </View>
              <View style={styles.selectedCategoryPanel}>
                <Text style={styles.panelTitle}>{t(selectedCategory.titleKey)}</Text>
                <Text style={styles.panelText}>{t(selectedCategory.subtitleKey)}</Text>
                <View style={styles.chipWrap}>
                  {selectedCategory.sections.map((section) => <Text key={section} style={styles.smallChip}>{t(section)}</Text>)}
                </View>
              </View>
              {getWholesaleMarketProducts(countryCode, categoryId).map((product) => <ProductCard key={product.id} t={t} product={product} onOpen={() => setSelectedProductId(product.id)} onAdd={() => addProduct(product)} />)}
              <ExcludedBlock excluded={excluded} />
            </>
          )}

          {tab === "cart" && (
            <CartView t={t} cart={cart} updateCartQty={updateCartQty} />
          )}

          {tab === "profile" && (
            <ProfileView t={t} />
          )}
        </ScrollView>

        <BottomNav active={tab} setTab={setTab} cartCount={cartCount} t={t} />

        <ProductModal t={t} product={selectedProduct} seller={selectedWholesaler} gate={gate} onClose={() => setSelectedProductId(null)} onAdd={selectedProduct ? () => addProduct(selectedProduct) : undefined} />
      </LinearGradient>
    </SafeAreaView>
  );
}

function Hero({ t, countryTitle, countryImage, query, setQuery }: { t: (key: string) => string; countryTitle: string; countryImage: string; query: string; setQuery: (value: string) => void }) {
  return (
    <View style={styles.hero}>
      <Image source={{ uri: countryImage }} style={styles.heroImage} />
      <LinearGradient colors={["rgba(37,24,7,0.72)", "rgba(37,24,7,0.18)"]} style={styles.heroOverlay}>
        <View style={styles.heroBadge}><Globe2 size={15} color="#FFF7DF" /><Text style={styles.heroBadgeText}>{countryTitle}</Text></View>
        <Text style={styles.heroTitle}>{t("hero.title")}</Text>
        <Text style={styles.heroText}>{t("hero.description")}</Text>
      </LinearGradient>
      <View style={styles.searchBox}>
        <Search size={18} color="#8B6A32" />
        <TextInput value={query} onChangeText={setQuery} placeholder={t("search.placeholder")} placeholderTextColor="#9B875E" style={styles.searchInput} />
      </View>
    </View>
  );
}

function CountryRail({ t, countries, selectedCode, onSelect }: { t: (key: string) => string; countries: ReturnType<typeof getWholesaleMarketCountries>; selectedCode: WholesaleMarketCountryCode; onSelect: (code: WholesaleMarketCountryCode) => void }) {
  return (
    <View style={styles.railWrap}>
      <SectionHeader title={t("section.countries")} compact />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.countryRail}>
        {countries.map((country) => (
          <Pressable key={country.code} style={[styles.countryChip, country.code === selectedCode && styles.countryChipActive]} onPress={() => onSelect(country.code)}>
            <Text style={[styles.countryChipText, country.code === selectedCode && styles.countryChipTextActive]}>{t(country.titleKey)}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

function SectionHeader({ title, compact = false }: { title: string; compact?: boolean }) {
  return <Text style={[styles.sectionTitle, compact && styles.sectionTitleCompact]}>{title}</Text>;
}

function WholesalerCard({ t, seller }: { t: (key: string) => string; seller: ReturnType<typeof getWholesaleMarketWholesalers>[number] }) {
  return (
    <View style={styles.sellerCard}>
      <Image source={{ uri: seller.imageUrl }} style={styles.sellerImage} />
      <Text style={styles.sellerTitle}>{t(seller.titleKey)}</Text>
      <Text style={styles.sellerMeta}>{t(seller.cityKey)} · {t(seller.typeKey)}</Text>
      <View style={styles.chipWrap}>{seller.badges.map((badge) => <Text key={badge} style={styles.smallChip}>{t(badge)}</Text>)}</View>
      <Text style={styles.muted}>{t("label.minOrder")}: {t(seller.minOrderKey)}</Text>
    </View>
  );
}

function ProductCard({ t, product, onOpen, onAdd }: { t: (key: string) => string; product: WholesaleMarketProduct; onOpen: () => void; onAdd: () => void }) {
  const seller = getWholesaleMarketWholesaler(product.wholesalerId);
  return (
    <Pressable style={styles.productCard} onPress={onOpen}>
      <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
      <View style={styles.productBody}>
        <Text style={styles.productTitle}>{t(product.titleKey)}</Text>
        <Text style={styles.productSubtitle}>{t(product.subtitleKey)}</Text>
        <Text style={styles.priceText}>{t(product.termsKey)}</Text>
        <Text style={styles.muted}>{seller ? t(seller.titleKey) : ""}</Text>
        <View style={styles.productActions}>
          <Pressable style={styles.secondaryButton} onPress={onOpen}><Text style={styles.secondaryButtonText}>{t("button.details")}</Text></Pressable>
          <Pressable style={styles.goldButton} onPress={onAdd}><Text style={styles.goldButtonText}>{t("button.add")}</Text></Pressable>
        </View>
      </View>
    </Pressable>
  );
}

function CartView({ t, cart, updateCartQty }: { t: (key: string) => string; cart: WholesaleMarketCartItem[]; updateCartQty: (productId: string, delta: number) => void }) {
  return (
    <View>
      <SectionHeader title={t("section.cart")} />
      {cart.length === 0 ? <Text style={styles.emptyText}>{t("notice.noFakeOrder")}</Text> : null}
      {cart.map((item) => {
        const product = getWholesaleMarketProduct(item.productId);
        if (!product) return null;
        return (
          <View key={item.productId} style={styles.cartRow}>
            <Image source={{ uri: product.imageUrl }} style={styles.cartImage} />
            <View style={styles.flex}>
              <Text style={styles.productTitle}>{t(product.titleKey)}</Text>
              <Text style={styles.priceText}>{t(product.termsKey)}</Text>
              <View style={styles.qtyRow}>
                <Pressable style={styles.qtyButton} onPress={() => updateCartQty(item.productId, -1)}><Minus size={16} color={INK} /></Pressable>
                <Text style={styles.qtyText}>{item.quantity} {t(product.unitKey)}</Text>
                <Pressable style={styles.qtyButton} onPress={() => updateCartQty(item.productId, 1)}><Plus size={16} color={INK} /></Pressable>
              </View>
            </View>
          </View>
        );
      })}
      <View style={styles.gateBox}>
        <ShieldCheck size={20} color={GOLD} />
        <Text style={styles.gateText}>{t("gate.buyerVerification")}</Text>
        <Text style={styles.gateText}>{t("gate.merchantPending")}</Text>
      </View>
    </View>
  );
}

function ProfileView({ t }: { t: (key: string) => string }) {
  const items = ["ecosystem.payment", "ecosystem.business", "ecosystem.chat", "ecosystem.stream", "ecosystem.map", "ecosystem.admin"];
  return (
    <View>
      <SectionHeader title={t("section.ecosystem")} />
      {items.map((item) => (
        <View key={item} style={styles.ecosystemRow}>
          <PackageCheck size={18} color={GOLD} />
          <Text style={styles.ecosystemText}>{t(item)}</Text>
        </View>
      ))}
      <Pressable style={styles.profileButton} onPress={() => router.push("/profile")}> 
        <UserRound size={18} color={INK} />
        <Text style={styles.profileButtonText}>{t("button.profile")}</Text>
      </Pressable>
    </View>
  );
}

function SafeNotice({ t }: { t: (key: string) => string }) {
  return (
    <View style={styles.noticeBox}>
      <ShieldCheck size={20} color={GOLD} />
      <View style={styles.flex}>
        <Text style={styles.noticeTitle}>{t("notice.safeMarket")}</Text>
        <Text style={styles.noticeText}>{t("notice.noFakeOrder")}</Text>
      </View>
    </View>
  );
}

function ExcludedBlock({ excluded }: { excluded: readonly string[] }) {
  return (
    <View style={styles.excludedBox}>
      <Text style={styles.excludedTitle}>Excluded</Text>
      <Text style={styles.excludedText}>{excluded.join(" · ")}</Text>
    </View>
  );
}

function ProductModal({ t, product, seller, gate, onClose, onAdd }: { t: (key: string) => string; product: WholesaleMarketProduct | null; seller: ReturnType<typeof getWholesaleMarketWholesaler>; gate: ReturnType<typeof buildWholesaleAccessGate>; onClose: () => void; onAdd?: () => void }) {
  if (!product) return null;
  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <Image source={{ uri: product.imageUrl }} style={styles.modalImage} />
          <Text style={styles.modalTitle}>{t(product.titleKey)}</Text>
          <Text style={styles.productSubtitle}>{t(product.subtitleKey)}</Text>
          <Text style={styles.priceText}>{t(product.termsKey)}</Text>
          <Text style={styles.muted}>{t("label.qty")}: {product.minQuantity} {t(product.unitKey)}</Text>
          {seller ? <Text style={styles.muted}>{t(seller.titleKey)} · {t(seller.cityKey)}</Text> : null}
          <View style={styles.gateBox}>
            <ShieldCheck size={20} color={GOLD} />
            <Text style={styles.gateText}>{t(gate.checkoutBlockedReasonKey)}</Text>
          </View>
          <View style={styles.modalActionGrid}>
            <Pressable style={styles.integrationButton}><MessageCircle size={17} color={INK} /><Text style={styles.integrationText}>{t("button.messenger")}</Text></Pressable>
            <Pressable style={styles.integrationButton}><Radio size={17} color={INK} /><Text style={styles.integrationText}>{t("button.stream")}</Text></Pressable>
            <Pressable style={styles.integrationButton}><WalletCards size={17} color={INK} /><Text style={styles.integrationText}>{t("label.noCurrency")}</Text></Pressable>
            <Pressable style={styles.integrationButton}><Building2 size={17} color={INK} /><Text style={styles.integrationText}>Business</Text></Pressable>
          </View>
          <View style={styles.productActions}>
            <Pressable style={styles.secondaryButton} onPress={onClose}><Text style={styles.secondaryButtonText}>{t("button.close")}</Text></Pressable>
            <Pressable style={styles.goldButton} onPress={onAdd}><Text style={styles.goldButtonText}>{t("button.add")}</Text></Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function BottomNav({ active, setTab, cartCount, t }: { active: WholesaleMarketTab; setTab: (tab: WholesaleMarketTab) => void; cartCount: number; t: (key: string) => string }) {
  const tabs: { key: WholesaleMarketTab; label: string; icon: React.ReactNode }[] = [
    { key: "home", label: t("nav.home"), icon: <Store size={20} color={active === "home" ? GOLD : "#7E725C"} /> },
    { key: "countries", label: t("nav.countries"), icon: <Globe2 size={20} color={active === "countries" ? GOLD : "#7E725C"} /> },
    { key: "category", label: t("nav.category"), icon: <Search size={20} color={active === "category" ? GOLD : "#7E725C"} /> },
    { key: "cart", label: `${t("nav.cart")}${cartCount ? ` ${cartCount}` : ""}`, icon: <ShoppingBasket size={20} color={active === "cart" ? GOLD : "#7E725C"} /> },
    { key: "profile", label: t("nav.profile"), icon: <UserRound size={20} color={active === "profile" ? GOLD : "#7E725C"} /> },
  ];

  return (
    <View style={styles.bottomNav}>
      {tabs.map((item) => (
        <Pressable key={item.key} style={styles.bottomNavItem} onPress={() => setTab(item.key)}>
          {item.icon}
          <Text numberOfLines={1} style={[styles.bottomNavText, active === item.key && styles.bottomNavTextActive]}>{item.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: SOFT },
  root: { flex: 1 },
  topBar: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingTop: 6, paddingBottom: 10, gap: 10 },
  backButton: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.82)", borderWidth: 1, borderColor: "rgba(201,149,46,0.24)" },
  titleBlock: { flex: 1 },
  brand: { fontSize: 24, fontWeight: "900", color: INK, letterSpacing: -0.4 },
  subtitle: { color: "#7D6841", fontSize: 12, marginTop: 1 },
  cartBubble: { minWidth: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.84)", borderWidth: 1, borderColor: "rgba(201,149,46,0.28)" },
  cartBubbleText: { fontSize: 11, color: INK, fontWeight: "800" },
  content: { paddingHorizontal: 16, gap: 14 },
  flex: { flex: 1 },
  hero: { minHeight: 260, borderRadius: 28, overflow: "hidden", backgroundColor: CARD, shadowColor: "#3F2700", shadowOpacity: 0.12, shadowRadius: 24, elevation: 8 },
  heroImage: { ...StyleSheet.absoluteFillObject, width: "100%", height: "100%" },
  heroOverlay: { flex: 1, padding: 18, justifyContent: "space-between" },
  heroBadge: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: "rgba(255,247,223,0.16)", borderWidth: 1, borderColor: "rgba(255,247,223,0.24)" },
  heroBadgeText: { color: "#FFF7DF", fontWeight: "900" },
  heroTitle: { color: "#FFF7DF", fontSize: 28, lineHeight: 32, fontWeight: "900", letterSpacing: -0.7 },
  heroText: { color: "rgba(255,247,223,0.9)", fontSize: 13, lineHeight: 18, marginTop: 8, maxWidth: "92%" },
  searchBox: { position: "absolute", left: 16, right: 16, bottom: 16, height: 48, borderRadius: 24, backgroundColor: "rgba(255,255,255,0.94)", flexDirection: "row", alignItems: "center", paddingHorizontal: 14, gap: 9 },
  searchInput: { flex: 1, color: INK, fontWeight: "700" },
  railWrap: { marginTop: 2 },
  sectionTitle: { fontSize: 20, color: INK, fontWeight: "900", letterSpacing: -0.3, marginTop: 6, marginBottom: 10 },
  sectionTitleCompact: { marginTop: 0, marginBottom: 8, fontSize: 16 },
  countryRail: { gap: 8, paddingRight: 8 },
  countryChip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.72)", borderWidth: 1, borderColor: "rgba(201,149,46,0.18)" },
  countryChipActive: { backgroundColor: "#3A260E", borderColor: "#3A260E" },
  countryChipText: { color: "#6E5C3A", fontWeight: "800" },
  countryChipTextActive: { color: "#FFE9A8" },
  horizontalList: { gap: 12, paddingRight: 16 },
  sellerCard: { width: 238, borderRadius: 24, padding: 12, backgroundColor: CARD, borderWidth: 1, borderColor: "rgba(201,149,46,0.18)", shadowColor: "#5F3900", shadowOpacity: 0.08, shadowRadius: 15, elevation: 4 },
  sellerImage: { width: "100%", height: 118, borderRadius: 18, backgroundColor: "#EFE2C2" },
  sellerTitle: { marginTop: 10, color: INK, fontSize: 16, fontWeight: "900" },
  sellerMeta: { color: "#7C6A48", marginTop: 3, fontWeight: "700" },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 9 },
  smallChip: { overflow: "hidden", borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5, backgroundColor: "#FFF2C8", color: "#725013", fontSize: 11, fontWeight: "800" },
  muted: { color: "#8B7A59", fontSize: 12, marginTop: 6, fontWeight: "700" },
  productCard: { flexDirection: "row", borderRadius: 24, padding: 10, backgroundColor: CARD, borderWidth: 1, borderColor: "rgba(201,149,46,0.17)", shadowColor: "#5F3900", shadowOpacity: 0.08, shadowRadius: 14, elevation: 3 },
  productImage: { width: 112, height: 132, borderRadius: 18, backgroundColor: "#EFE2C2" },
  productBody: { flex: 1, paddingLeft: 12, justifyContent: "space-between" },
  productTitle: { color: INK, fontSize: 16, fontWeight: "900" },
  productSubtitle: { color: "#6F5F42", fontSize: 12, lineHeight: 16, marginTop: 3 },
  priceText: { color: GOLD, fontWeight: "900", marginTop: 6 },
  productActions: { flexDirection: "row", gap: 8, marginTop: 10 },
  secondaryButton: { flex: 1, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", backgroundColor: "#FFF6DF", borderWidth: 1, borderColor: "rgba(201,149,46,0.24)" },
  secondaryButtonText: { color: INK, fontWeight: "900", fontSize: 12 },
  goldButton: { flex: 1, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", backgroundColor: GOLD },
  goldButtonText: { color: "#FFFDF7", fontWeight: "900", fontSize: 12 },
  noticeBox: { flexDirection: "row", gap: 10, borderRadius: 22, padding: 14, backgroundColor: "#FFF8E9", borderWidth: 1, borderColor: "rgba(201,149,46,0.22)" },
  noticeTitle: { color: INK, fontWeight: "900" },
  noticeText: { color: "#7A6743", marginTop: 4, fontSize: 12, lineHeight: 17 },
  countryRow: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 22, padding: 10, backgroundColor: CARD, borderWidth: 1, borderColor: "rgba(201,149,46,0.14)", marginBottom: 10 },
  selectedBorder: { borderColor: GOLD, borderWidth: 1.6 },
  countryRowImage: { width: 82, height: 82, borderRadius: 18, backgroundColor: "#EFE2C2" },
  countryTitle: { color: INK, fontSize: 17, fontWeight: "900" },
  countrySubtitle: { color: "#6F5F42", fontSize: 12, marginTop: 3 },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  categoryTile: { minHeight: 136, borderRadius: 22, backgroundColor: CARD, padding: 8, borderWidth: 1, borderColor: "rgba(201,149,46,0.14)" },
  categoryImage: { width: "100%", height: 82, borderRadius: 16, backgroundColor: "#EFE2C2" },
  categoryTitle: { color: INK, fontWeight: "900", textAlign: "center", marginTop: 8, fontSize: 12 },
  selectedCategoryPanel: { marginTop: 12, padding: 14, borderRadius: 24, backgroundColor: "#FFF8E9", borderWidth: 1, borderColor: "rgba(201,149,46,0.2)" },
  panelTitle: { color: INK, fontSize: 18, fontWeight: "900" },
  panelText: { color: "#735F3B", marginTop: 4, fontSize: 12 },
  excludedBox: { padding: 14, borderRadius: 22, backgroundColor: "#FBF4E4", borderWidth: 1, borderColor: "rgba(120,80,20,0.14)" },
  excludedTitle: { color: INK, fontWeight: "900" },
  excludedText: { color: "#7C6A48", marginTop: 4, fontSize: 12 },
  emptyText: { color: "#7C6A48", lineHeight: 20, padding: 16, borderRadius: 18, backgroundColor: CARD },
  cartRow: { flexDirection: "row", gap: 12, padding: 10, borderRadius: 22, backgroundColor: CARD, marginBottom: 10 },
  cartImage: { width: 92, height: 92, borderRadius: 18 },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10 },
  qtyButton: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: "#FFF2C8" },
  qtyText: { color: INK, fontWeight: "900" },
  gateBox: { marginTop: 14, padding: 14, borderRadius: 20, backgroundColor: "#FFF6DF", borderWidth: 1, borderColor: "rgba(201,149,46,0.24)", gap: 8 },
  gateText: { color: INK, fontWeight: "800", lineHeight: 18 },
  ecosystemRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderRadius: 20, backgroundColor: CARD, marginBottom: 9 },
  ecosystemText: { color: INK, fontWeight: "800", flex: 1 },
  profileButton: { marginTop: 6, height: 48, borderRadius: 24, backgroundColor: "#FFF2C8", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  profileButtonText: { color: INK, fontWeight: "900" },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(21,13,4,0.45)", justifyContent: "flex-end" },
  modalCard: { backgroundColor: "#FFFDF7", borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 16, maxHeight: "88%" },
  modalImage: { width: "100%", height: 210, borderRadius: 24, backgroundColor: "#EFE2C2" },
  modalTitle: { color: INK, fontSize: 22, fontWeight: "900", marginTop: 14 },
  modalActionGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  integrationButton: { width: "48%", minHeight: 46, borderRadius: 18, backgroundColor: "#FFF8E9", flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: 10, borderWidth: 1, borderColor: "rgba(201,149,46,0.18)" },
  integrationText: { flex: 1, color: INK, fontSize: 11, fontWeight: "800" },
  bottomNav: { position: "absolute", left: 12, right: 12, bottom: 12, minHeight: 68, borderRadius: 28, backgroundColor: "rgba(255,255,255,0.94)", flexDirection: "row", alignItems: "center", justifyContent: "space-around", paddingHorizontal: 6, borderWidth: 1, borderColor: "rgba(201,149,46,0.2)", shadowColor: "#3F2700", shadowOpacity: 0.13, shadowRadius: 18, elevation: 8 },
  bottomNavItem: { flex: 1, alignItems: "center", justifyContent: "center", gap: 3 },
  bottomNavText: { color: "#7E725C", fontSize: 10, fontWeight: "800" },
  bottomNavTextActive: { color: GOLD },
});
