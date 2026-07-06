import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  ArrowLeft,
  Bike,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock3,
  MapPin,
  MessageCircle,
  Minus,
  Plus,
  QrCode,
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
  type ImageSourcePropType,
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
  buildFoodDeliveryOrderGate,
  cartPreviewLines,
  countCartItems,
  findFoodDeliveryRestaurant,
  getFoodDeliveryCategories,
  getFoodDeliveryMenuItems,
  getFoodDeliveryRestaurants,
  itemsForRestaurant,
  searchFoodDeliveryItems,
  searchFoodDeliveryRestaurants,
} from "../application/foodDelivery.service";
import type { FoodDeliveryCartLine, FoodDeliveryCategoryId, FoodDeliveryMenuItem, FoodDeliveryPhotoKey, FoodDeliveryRestaurant, FoodDeliveryTab } from "../domain/foodDelivery.types";
import { foodDeliveryApprovalLabel, foodDeliveryKitchenLabel, foodDeliveryPaymentLabel, resolveFoodDeliveryLocale, tFoodDelivery } from "../presentation/foodDelivery.i18n";
import { useI18n } from "../../../shared/i18n";

const BG = "#FFF7EA";
const CARD = "rgba(255,253,247,0.96)";
const INK = "#24160B";
const MUTED = "#80654A";
const ORANGE = "#E68B2C";
const DEEP = "#9E5617";
const GREEN = "#2F7B48";
const BORDER = "rgba(151,91,28,0.18)";

const FOOD_IMAGES: Record<FoodDeliveryPhotoKey, ImageSourcePropType> = {
  hero_food: { uri: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=88" },
  restaurant_lounge: { uri: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=88" },
  national_food: { uri: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1000&q=88" },
  fast_food: { uri: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1000&q=88" },
  pizza: { uri: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1000&q=88" },
  asian_food: { uri: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=1000&q=88" },
  grill: { uri: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1000&q=88" },
  desserts: { uri: "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=1000&q=88" },
  drinks: { uri: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1000&q=88" },
  healthy: { uri: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1000&q=88" },
  breakfast: { uri: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=1000&q=88" },
  courier: { uri: "https://images.unsplash.com/photo-1627384113972-f4c0392fe5aa?auto=format&fit=crop&w=1000&q=88" },
};

const NAV_TABS: Array<{ id: FoodDeliveryTab; icon: typeof Store; labelKey: string }> = [
  { id: "home", icon: Store, labelKey: "nav.home" },
  { id: "restaurants", icon: Search, labelKey: "nav.restaurants" },
  { id: "cart", icon: ShoppingBasket, labelKey: "nav.cart" },
  { id: "profile", icon: UserRound, labelKey: "nav.profile" },
];

export default function FoodDeliveryScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { language } = useI18n();
  const locale = resolveFoodDeliveryLocale(language);
  const t = (key: string) => tFoodDelivery(key, locale);

  const categories = useMemo(() => getFoodDeliveryCategories(), []);
  const restaurants = useMemo(() => getFoodDeliveryRestaurants(), []);
  const allItems = useMemo(() => getFoodDeliveryMenuItems(), []);
  const cardWidth = Math.min(330, Math.max(260, width * 0.74));

  const [activeTab, setActiveTab] = useState<FoodDeliveryTab>("home");
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<FoodDeliveryCategoryId | "all">("all");
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(restaurants[0]?.id ?? "");
  const [selectedItem, setSelectedItem] = useState<FoodDeliveryMenuItem | null>(null);
  const [cart, setCart] = useState<FoodDeliveryCartLine[]>([]);
  const [notice, setNotice] = useState(t("hero.notice"));

  const selectedRestaurant = findFoodDeliveryRestaurant(selectedRestaurantId) ?? restaurants[0] ?? null;
  const selectedRestaurantItems = itemsForRestaurant(selectedRestaurant);
  const filteredRestaurants = searchFoodDeliveryRestaurants({ text: searchText, categoryId: selectedCategory });
  const filteredItems = searchFoodDeliveryItems({ text: searchText, categoryId: selectedCategory });
  const selectedGate = buildFoodDeliveryOrderGate(selectedRestaurant);
  const cartLines = cartPreviewLines(cart);
  const cartCount = countCartItems(cart);

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.push("/" as never);
  };

  const openRoute = (route: string) => {
    try {
      router.push(route as never);
    } catch {
      router.push("/" as never);
    }
  };

  const addToCart = (item: FoodDeliveryMenuItem) => {
    setCart((lines) => {
      const existing = lines.find((line) => line.itemId === item.id);
      if (existing) return lines.map((line) => (line.itemId === item.id ? { ...line, quantity: Math.min(12, line.quantity + 1) } : line));
      return [...lines, { itemId: item.id, quantity: 1 }];
    });
    setSelectedRestaurantId(item.restaurantId);
    setNotice(t("notice.prepared"));
  };

  const decrement = (itemId: string) => {
    setCart((lines) => lines.flatMap((line) => {
      if (line.itemId !== itemId) return [line];
      if (line.quantity <= 1) return [];
      return [{ ...line, quantity: line.quantity - 1 }];
    }));
  };

  const renderHeader = () => (
    <LinearGradient colors={["#F6C46F", "#FFF7EA"]} style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}> 
      <View style={styles.headerGlowLeft} />
      <View style={styles.headerGlowRight} />
      <Pressable onPress={goBack} style={styles.headerButton}>
        <ArrowLeft size={24} color={INK} />
      </Pressable>
      <View style={styles.headerTextWrap}>
        <Text style={styles.headerTitle}>{t("brand.title")}</Text>
        <Text style={styles.headerSubtitle}>{t("brand.subtitle")}</Text>
      </View>
      <Pressable onPress={() => openRoute("/qr")} style={styles.headerButtonAccent}>
        <QrCode size={20} color="#FFFFFF" />
      </Pressable>
    </LinearGradient>
  );

  const renderSearch = () => (
    <View style={styles.searchCard}>
      <Search size={18} color={DEEP} />
      <TextInput
        value={searchText}
        onChangeText={setSearchText}
        placeholder={t("hero.search")}
        placeholderTextColor="rgba(91,66,39,0.55)"
        autoCorrect={false}
        autoCapitalize="none"
        style={styles.searchInput}
      />
    </View>
  );

  const renderHero = () => (
    <View style={styles.heroCard}>
      <Image source={FOOD_IMAGES.hero_food} style={styles.heroImage} resizeMode="cover" />
      <LinearGradient colors={["rgba(36,22,11,0.04)", "rgba(36,22,11,0.56)"]} style={styles.heroOverlay} />
      <View style={styles.heroContent}>
        <View style={styles.addressPill}>
          <MapPin size={14} color="#FFF8EA" />
          <Text style={styles.addressText}>{t("hero.addressValue")}</Text>
        </View>
        <Text style={styles.heroTitle}>{t("hero.title")}</Text>
        <Text style={styles.heroSubtitle}>{t("hero.subtitle")}</Text>
      </View>
    </View>
  );

  const renderCategoryRail = () => (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t("section.categories")}</Text>
        <Text style={styles.sectionHint}>{t("button.categoryAll")}</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRail}>
        <Pressable onPress={() => setSelectedCategory("all")} style={[styles.categoryTile, selectedCategory === "all" && styles.categoryTileActive]}>
          <Image source={FOOD_IMAGES.restaurant_lounge} style={styles.categoryImage} resizeMode="cover" />
          <LinearGradient colors={["rgba(22,12,5,0.02)", "rgba(22,12,5,0.5)"]} style={styles.categoryOverlay} />
          <Text style={styles.categoryTitle}>{t("button.categoryAll")}</Text>
        </Pressable>
        {categories.map((category) => {
          const active = selectedCategory === category.id;
          return (
            <Pressable key={category.id} onPress={() => setSelectedCategory(category.id)} style={[styles.categoryTile, active && styles.categoryTileActive]}>
              <Image source={FOOD_IMAGES[category.photoKey]} style={styles.categoryImage} resizeMode="cover" />
              <LinearGradient colors={["rgba(22,12,5,0.02)", "rgba(22,12,5,0.55)"]} style={styles.categoryOverlay} />
              <Text style={styles.categoryTitle}>{t(category.titleKey)}</Text>
              <Text style={styles.categorySubtitle} numberOfLines={1}>{t(category.subtitleKey)}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );

  const renderRestaurantCard = (restaurant: FoodDeliveryRestaurant, compact = false) => (
    <Pressable
      key={restaurant.id}
      onPress={() => {
        setSelectedRestaurantId(restaurant.id);
        setActiveTab("restaurants");
      }}
      style={[styles.restaurantCard, compact && styles.restaurantCardCompact, { width: compact ? "100%" : cardWidth }]}
    >
      <Image source={FOOD_IMAGES[restaurant.heroPhotoKey]} style={styles.restaurantImage} resizeMode="cover" />
      <LinearGradient colors={["rgba(16,9,4,0.02)", "rgba(16,9,4,0.48)"]} style={styles.restaurantOverlay} />
      <View style={styles.restaurantStatusPill}>
        <ShieldCheck size={12} color={restaurant.approvalStatus === "admin_approved" ? GREEN : DEEP} />
        <Text style={styles.restaurantStatusText}>{foodDeliveryApprovalLabel(restaurant.approvalStatus, locale)}</Text>
      </View>
      <View style={styles.restaurantBody}>
        <Text style={styles.restaurantTitle} numberOfLines={1}>{t(restaurant.titleKey)}</Text>
        <Text style={styles.restaurantDesc} numberOfLines={2}>{t(restaurant.descriptionKey)}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>{t("label.rating")} {restaurant.ratingLabel}</Text>
          <Text style={styles.metaDot}>•</Text>
          <Text style={styles.metaText}>{t(restaurant.deliveryTimeKey)}</Text>
          <Text style={styles.metaDot}>•</Text>
          <Text style={styles.metaText}>{t(restaurant.distanceKey)}</Text>
        </View>
      </View>
    </Pressable>
  );

  const renderItemCard = (item: FoodDeliveryMenuItem, compact = false) => {
    const restaurant = findFoodDeliveryRestaurant(item.restaurantId);
    return (
      <Pressable key={item.id} onPress={() => setSelectedItem(item)} style={[styles.itemCard, compact && styles.itemCardCompact]}>
        <Image source={FOOD_IMAGES[item.photoKey]} style={styles.itemImage} resizeMode="cover" />
        <View style={styles.itemBody}>
          <Text style={styles.itemTitle} numberOfLines={1}>{t(item.titleKey)}</Text>
          <Text style={styles.itemDesc} numberOfLines={2}>{t(item.descriptionKey)}</Text>
          <Text style={styles.itemRestaurant} numberOfLines={1}>{restaurant ? t(restaurant.titleKey) : t("label.restaurant")}</Text>
          <View style={styles.itemFooter}>
            <Text style={styles.priceText}>{t(item.priceLabelKey)}</Text>
            <Pressable onPress={() => addToCart(item)} style={styles.addButton}>
              <Plus size={15} color="#FFFFFF" />
              <Text style={styles.addButtonText}>{t("button.add")}</Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
    );
  };

  const renderHome = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      {renderSearch()}
      {renderHero()}
      {renderCategoryRail()}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t("section.recommended")}</Text>
        <Text style={styles.sectionHint}>{t("label.noFake")}</Text>
      </View>
      <View style={styles.itemsGrid}>{filteredItems.slice(0, 6).map((item) => renderItemCard(item))}</View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t("section.nearby")}</Text>
        <Text style={styles.sectionHint}>{t("hero.address")}</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalCards}>
        {filteredRestaurants.map((restaurant) => renderRestaurantCard(restaurant))}
      </ScrollView>
      {renderEcosystemBlock()}
    </ScrollView>
  );

  const renderRestaurants = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      {renderSearch()}
      <View style={styles.mapPreview}>
        <Image source={FOOD_IMAGES.courier} style={styles.mapImage} resizeMode="cover" />
        <LinearGradient colors={["rgba(36,22,11,0.08)", "rgba(36,22,11,0.56)"]} style={styles.mapOverlay} />
        <View style={styles.mapContent}>
          <Bike size={22} color="#FFFFFF" />
          <Text style={styles.mapTitle}>Sabi Map</Text>
          <Text style={styles.mapSubtitle}>{t("ecosystem.map")}</Text>
        </View>
      </View>
      <View style={styles.restaurantList}>{filteredRestaurants.map((restaurant) => renderRestaurantCard(restaurant, true))}</View>
      {selectedRestaurant ? (
        <View style={styles.detailCard}>
          <Text style={styles.sectionTitle}>{t(selectedRestaurant.titleKey)}</Text>
          <Text style={styles.detailText}>{t(selectedRestaurant.descriptionKey)}</Text>
          <View style={styles.statusGrid}>
            <View style={styles.statusCard}><Text style={styles.statusLabel}>{t("label.gate")}</Text><Text style={styles.statusValue}>{foodDeliveryApprovalLabel(selectedRestaurant.approvalStatus, locale)}</Text></View>
            <View style={styles.statusCard}><Text style={styles.statusLabel}>{t("button.wallet")}</Text><Text style={styles.statusValue}>{foodDeliveryPaymentLabel(selectedRestaurant.paymentStatus, locale)}</Text></View>
            <View style={styles.statusCard}><Text style={styles.statusLabel}>{t("gate.foodDocs")}</Text><Text style={styles.statusValue}>{foodDeliveryKitchenLabel(selectedRestaurant.kitchenStatus, locale)}</Text></View>
          </View>
          <View style={styles.actionRow}>
            <Pressable onPress={() => openRoute(selectedRestaurant.messengerRoute)} style={styles.secondaryAction}><MessageCircle size={17} color={DEEP} /><Text style={styles.secondaryActionText}>{t("button.messenger")}</Text></Pressable>
            <Pressable onPress={() => openRoute(selectedRestaurant.streamRoute)} style={styles.secondaryAction}><Radio size={17} color={DEEP} /><Text style={styles.secondaryActionText}>{t("button.stream")}</Text></Pressable>
          </View>
          <View style={styles.itemsGrid}>{selectedRestaurantItems.map((item) => renderItemCard(item, true))}</View>
        </View>
      ) : null}
    </ScrollView>
  );

  const renderCart = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      <View style={styles.cartHero}>
        <ShoppingBasket size={28} color={DEEP} />
        <View style={{ flex: 1 }}>
          <Text style={styles.sectionTitle}>{t("section.cart")}</Text>
          <Text style={styles.detailText}>{notice}</Text>
        </View>
      </View>
      {cartLines.length ? cartLines.map(({ item, restaurant, quantity }) => (
        <View key={item.id} style={styles.cartLine}>
          <Image source={FOOD_IMAGES[item.photoKey]} style={styles.cartImage} resizeMode="cover" />
          <View style={{ flex: 1 }}>
            <Text style={styles.cartTitle}>{t(item.titleKey)}</Text>
            <Text style={styles.cartMeta}>{restaurant ? t(restaurant.titleKey) : t("label.restaurant")} · {t(item.priceLabelKey)}</Text>
            <View style={styles.qtyRow}>
              <Pressable onPress={() => decrement(item.id)} style={styles.qtyButton}><Minus size={14} color={INK} /></Pressable>
              <Text style={styles.qtyText}>{quantity}</Text>
              <Pressable onPress={() => addToCart(item)} style={styles.qtyButton}><Plus size={14} color={INK} /></Pressable>
            </View>
          </View>
        </View>
      )) : (
        <View style={styles.emptyCart}><Text style={styles.emptyText}>{t("label.cartEmpty")}</Text></View>
      )}

      <View style={styles.gateCard}>
        <View style={styles.gateTitleRow}>
          <ShieldCheck size={19} color={DEEP} />
          <Text style={styles.gateTitle}>{t("label.gate")}</Text>
        </View>
        <Text style={styles.detailText}>{t(selectedGate.reasonKey)}</Text>
        {selectedGate.requiredKeys.map((key) => (
          <View key={key} style={styles.requirementRow}>
            <CheckCircle2 size={15} color={GREEN} />
            <Text style={styles.requirementText}>{t(key)}</Text>
          </View>
        ))}
        <Pressable onPress={() => setNotice(t("notice.prepared"))} style={styles.prepareButton}>
          <Text style={styles.prepareButtonText}>{t("button.prepare")}</Text>
          <ChevronRight size={18} color="#FFFFFF" />
        </Pressable>
      </View>
    </ScrollView>
  );

  const renderProfile = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      <View style={styles.profileCard}>
        <UserRound size={30} color={DEEP} />
        <Text style={styles.sectionTitle}>{t("section.profile")}</Text>
        <Text style={styles.detailText}>{t("hero.notice")}</Text>
        <View style={styles.profileActions}>
          <Pressable onPress={() => openRoute("/profile")} style={styles.profileAction}><UserRound size={18} color={DEEP} /><Text style={styles.profileActionText}>{t("button.profile")}</Text></Pressable>
          <Pressable onPress={() => openRoute("/business")} style={styles.profileAction}><Building2 size={18} color={DEEP} /><Text style={styles.profileActionText}>{t("button.business")}</Text></Pressable>
          <Pressable onPress={() => openRoute("/wallet")} style={styles.profileAction}><WalletCards size={18} color={DEEP} /><Text style={styles.profileActionText}>{t("button.wallet")}</Text></Pressable>
        </View>
      </View>
      {renderEcosystemBlock()}
    </ScrollView>
  );

  const renderEcosystemBlock = () => (
    <View style={styles.ecosystemCard}>
      <Text style={styles.sectionTitle}>{t("section.flow")}</Text>
      {["ecosystem.wallet", "ecosystem.business", "ecosystem.admin", "ecosystem.map", "ecosystem.messenger", "ecosystem.stream"].map((key) => (
        <View key={key} style={styles.ecosystemRow}>
          <CheckCircle2 size={15} color={GREEN} />
          <Text style={styles.ecosystemText}>{t(key)}</Text>
        </View>
      ))}
    </View>
  );

  const renderActiveTab = () => {
    if (activeTab === "restaurants") return renderRestaurants();
    if (activeTab === "cart") return renderCart();
    if (activeTab === "profile") return renderProfile();
    return renderHome();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F6C46F" />
      {renderHeader()}
      <View style={styles.body}>{renderActiveTab()}</View>
      <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, 10) }]}> 
        {NAV_TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <Pressable key={tab.id} onPress={() => setActiveTab(tab.id)} style={[styles.navItem, active && styles.navItemActive]}>
              <Icon size={20} color={active ? "#FFFFFF" : DEEP} />
              <Text style={[styles.navText, active && styles.navTextActive]}>{t(tab.labelKey)}</Text>
              {tab.id === "cart" && cartCount > 0 ? <View style={styles.cartBadge}><Text style={styles.cartBadgeText}>{cartCount}</Text></View> : null}
            </Pressable>
          );
        })}
      </View>
      <Modal visible={Boolean(selectedItem)} transparent animationType="slide" onRequestClose={() => setSelectedItem(null)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setSelectedItem(null)}>
          <Pressable style={styles.modalCard} onPress={(event) => event.stopPropagation()}>
            {selectedItem ? (
              <>
                <Image source={FOOD_IMAGES[selectedItem.photoKey]} style={styles.modalImage} resizeMode="cover" />
                <Text style={styles.modalTitle}>{t(selectedItem.titleKey)}</Text>
                <Text style={styles.detailText}>{t(selectedItem.descriptionKey)}</Text>
                <View style={styles.modalMetaRow}>
                  <Clock3 size={15} color={DEEP} />
                  <Text style={styles.statusValue}>{t(selectedItem.prepTimeKey)}</Text>
                  <Text style={styles.priceText}>{t(selectedItem.priceLabelKey)}</Text>
                </View>
                <Text style={styles.statusLabel}>{t("label.options")}</Text>
                <View style={styles.optionWrap}>{selectedItem.optionKeys.map((key) => <Text key={key} style={styles.optionPill}>{t(key)}</Text>)}</View>
                <Pressable onPress={() => { addToCart(selectedItem); setSelectedItem(null); }} style={styles.prepareButton}>
                  <Text style={styles.prepareButtonText}>{t("button.add")}</Text>
                  <Plus size={18} color="#FFFFFF" />
                </Pressable>
              </>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG },
  header: { minHeight: 128, paddingHorizontal: 18, paddingBottom: 18, flexDirection: "row", alignItems: "center", overflow: "hidden" },
  headerGlowLeft: { position: "absolute", left: -45, top: -35, width: 170, height: 170, borderRadius: 85, backgroundColor: "rgba(255,255,255,0.42)" },
  headerGlowRight: { position: "absolute", right: -55, bottom: -60, width: 210, height: 210, borderRadius: 105, backgroundColor: "rgba(179,94,22,0.16)" },
  headerButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.72)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: BORDER },
  headerButtonAccent: { width: 44, height: 44, borderRadius: 22, backgroundColor: DEEP, alignItems: "center", justifyContent: "center" },
  headerTextWrap: { flex: 1, marginHorizontal: 12 },
  headerTitle: { color: INK, fontSize: 25, fontWeight: "900" },
  headerSubtitle: { color: MUTED, fontSize: 12, fontWeight: "700", marginTop: 3 },
  body: { flex: 1 },
  content: { padding: 16, paddingBottom: 112 },
  searchCard: { minHeight: 52, borderRadius: 24, backgroundColor: CARD, borderWidth: 1, borderColor: BORDER, paddingHorizontal: 15, flexDirection: "row", alignItems: "center", gap: 10, shadowColor: "#5A2C05", shadowOpacity: 0.08, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 3 },
  searchInput: { flex: 1, color: INK, fontSize: 14, fontWeight: "700", paddingVertical: 12 },
  heroCard: { height: 224, borderRadius: 32, overflow: "hidden", marginTop: 16, borderWidth: 1, borderColor: BORDER, backgroundColor: CARD },
  heroImage: { width: "100%", height: "100%" },
  heroOverlay: { ...StyleSheet.absoluteFillObject },
  heroContent: { position: "absolute", left: 18, right: 18, bottom: 18 },
  addressPill: { alignSelf: "flex-start", paddingHorizontal: 11, paddingVertical: 7, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.22)", flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 },
  addressText: { color: "#FFF8EA", fontSize: 12, fontWeight: "800" },
  heroTitle: { color: "#FFFFFF", fontSize: 29, fontWeight: "900" },
  heroSubtitle: { color: "rgba(255,255,255,0.9)", fontSize: 13, fontWeight: "700", marginTop: 5, maxWidth: 310 },
  sectionHeader: { marginTop: 22, marginBottom: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionTitle: { color: INK, fontSize: 19, fontWeight: "900" },
  sectionHint: { color: DEEP, fontSize: 12, fontWeight: "900" },
  categoryRail: { gap: 12, paddingRight: 10 },
  categoryTile: { width: 136, height: 156, borderRadius: 28, overflow: "hidden", backgroundColor: CARD, borderWidth: 1, borderColor: BORDER },
  categoryTileActive: { borderColor: ORANGE, borderWidth: 2 },
  categoryImage: { width: "100%", height: "100%" },
  categoryOverlay: { ...StyleSheet.absoluteFillObject },
  categoryTitle: { position: "absolute", left: 12, right: 12, bottom: 29, color: "#FFFFFF", fontSize: 15, fontWeight: "900" },
  categorySubtitle: { position: "absolute", left: 12, right: 12, bottom: 12, color: "rgba(255,255,255,0.86)", fontSize: 10, fontWeight: "700" },
  horizontalCards: { gap: 14, paddingRight: 10 },
  restaurantCard: { height: 238, borderRadius: 30, overflow: "hidden", backgroundColor: CARD, borderWidth: 1, borderColor: BORDER, shadowColor: "#5A2C05", shadowOpacity: 0.09, shadowRadius: 18, shadowOffset: { width: 0, height: 10 }, elevation: 3 },
  restaurantCardCompact: { marginBottom: 14 },
  restaurantImage: { width: "100%", height: "100%" },
  restaurantOverlay: { ...StyleSheet.absoluteFillObject },
  restaurantStatusPill: { position: "absolute", top: 12, left: 12, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 999, backgroundColor: "rgba(255,253,247,0.9)", flexDirection: "row", alignItems: "center", gap: 5 },
  restaurantStatusText: { color: DEEP, fontSize: 11, fontWeight: "900" },
  restaurantBody: { position: "absolute", left: 14, right: 14, bottom: 14 },
  restaurantTitle: { color: "#FFFFFF", fontSize: 21, fontWeight: "900" },
  restaurantDesc: { color: "rgba(255,255,255,0.86)", fontSize: 12, fontWeight: "700", marginTop: 4 },
  metaRow: { flexDirection: "row", alignItems: "center", marginTop: 8, gap: 6 },
  metaText: { color: "rgba(255,255,255,0.9)", fontSize: 11, fontWeight: "900" },
  metaDot: { color: "rgba(255,255,255,0.65)", fontWeight: "900" },
  itemsGrid: { gap: 12 },
  itemCard: { minHeight: 142, borderRadius: 26, backgroundColor: CARD, borderWidth: 1, borderColor: BORDER, padding: 10, flexDirection: "row", gap: 12, shadowColor: "#5A2C05", shadowOpacity: 0.07, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 2 },
  itemCardCompact: { marginTop: 12 },
  itemImage: { width: 116, borderRadius: 21, minHeight: 122 },
  itemBody: { flex: 1, paddingVertical: 4 },
  itemTitle: { color: INK, fontSize: 16, fontWeight: "900" },
  itemDesc: { color: MUTED, fontSize: 12, fontWeight: "700", marginTop: 4, lineHeight: 17 },
  itemRestaurant: { color: DEEP, fontSize: 11, fontWeight: "900", marginTop: 6 },
  itemFooter: { marginTop: "auto", flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  priceText: { color: INK, fontSize: 14, fontWeight: "900" },
  addButton: { minHeight: 36, paddingHorizontal: 12, borderRadius: 999, backgroundColor: ORANGE, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5 },
  addButtonText: { color: "#FFFFFF", fontSize: 12, fontWeight: "900" },
  mapPreview: { height: 178, borderRadius: 30, overflow: "hidden", borderWidth: 1, borderColor: BORDER, marginTop: 16, marginBottom: 16 },
  mapImage: { width: "100%", height: "100%" },
  mapOverlay: { ...StyleSheet.absoluteFillObject },
  mapContent: { position: "absolute", left: 16, right: 16, bottom: 16 },
  mapTitle: { color: "#FFFFFF", fontSize: 22, fontWeight: "900", marginTop: 6 },
  mapSubtitle: { color: "rgba(255,255,255,0.88)", fontSize: 12, fontWeight: "800", marginTop: 4 },
  restaurantList: { gap: 0 },
  detailCard: { marginTop: 8, borderRadius: 28, backgroundColor: CARD, borderWidth: 1, borderColor: BORDER, padding: 14 },
  detailText: { color: MUTED, fontSize: 13, fontWeight: "700", lineHeight: 19, marginTop: 6 },
  statusGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 14 },
  statusCard: { flexGrow: 1, flexBasis: "30%", minHeight: 78, padding: 11, borderRadius: 20, backgroundColor: "rgba(255,239,210,0.65)", borderWidth: 1, borderColor: BORDER },
  statusLabel: { color: MUTED, fontSize: 10, fontWeight: "900" },
  statusValue: { color: INK, fontSize: 12, fontWeight: "900", marginTop: 6 },
  actionRow: { flexDirection: "row", gap: 10, marginTop: 14 },
  secondaryAction: { flex: 1, minHeight: 45, borderRadius: 18, borderWidth: 1, borderColor: BORDER, backgroundColor: "rgba(255,255,255,0.58)", alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 7, paddingHorizontal: 8 },
  secondaryActionText: { color: DEEP, fontSize: 12, fontWeight: "900" },
  cartHero: { borderRadius: 28, backgroundColor: CARD, borderWidth: 1, borderColor: BORDER, padding: 16, flexDirection: "row", gap: 12, alignItems: "flex-start" },
  cartLine: { marginTop: 12, borderRadius: 24, backgroundColor: CARD, borderWidth: 1, borderColor: BORDER, padding: 10, flexDirection: "row", gap: 12, alignItems: "center" },
  cartImage: { width: 88, height: 88, borderRadius: 18 },
  cartTitle: { color: INK, fontSize: 15, fontWeight: "900" },
  cartMeta: { color: MUTED, fontSize: 12, fontWeight: "700", marginTop: 4 },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: 9, marginTop: 9 },
  qtyButton: { width: 30, height: 30, borderRadius: 15, backgroundColor: "rgba(230,139,44,0.18)", alignItems: "center", justifyContent: "center" },
  qtyText: { color: INK, fontSize: 14, fontWeight: "900" },
  emptyCart: { marginTop: 14, minHeight: 128, borderRadius: 24, borderWidth: 1, borderColor: BORDER, backgroundColor: "rgba(255,255,255,0.52)", alignItems: "center", justifyContent: "center" },
  emptyText: { color: MUTED, fontSize: 14, fontWeight: "800" },
  gateCard: { marginTop: 14, borderRadius: 28, backgroundColor: CARD, borderWidth: 1, borderColor: BORDER, padding: 16 },
  gateTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  gateTitle: { color: INK, fontSize: 17, fontWeight: "900" },
  requirementRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10 },
  requirementText: { color: MUTED, fontSize: 13, fontWeight: "800", flex: 1 },
  prepareButton: { marginTop: 16, minHeight: 50, borderRadius: 20, backgroundColor: DEEP, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 },
  prepareButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "900" },
  ecosystemCard: { marginTop: 18, borderRadius: 28, backgroundColor: CARD, borderWidth: 1, borderColor: BORDER, padding: 16 },
  ecosystemRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10 },
  ecosystemText: { color: MUTED, fontSize: 13, fontWeight: "800", flex: 1 },
  profileCard: { borderRadius: 30, backgroundColor: CARD, borderWidth: 1, borderColor: BORDER, padding: 18, alignItems: "flex-start" },
  profileActions: { width: "100%", gap: 10, marginTop: 16 },
  profileAction: { minHeight: 48, borderRadius: 18, backgroundColor: "rgba(255,239,210,0.65)", borderWidth: 1, borderColor: BORDER, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", gap: 10 },
  profileActionText: { color: DEEP, fontSize: 13, fontWeight: "900" },
  bottomNav: { position: "absolute", left: 12, right: 12, bottom: 0, backgroundColor: "rgba(255,253,247,0.97)", borderRadius: 28, borderWidth: 1, borderColor: BORDER, paddingTop: 10, paddingHorizontal: 10, flexDirection: "row", shadowColor: "#5A2C05", shadowOpacity: 0.11, shadowRadius: 18, shadowOffset: { width: 0, height: -8 }, elevation: 12 },
  navItem: { flex: 1, minHeight: 52, borderRadius: 19, alignItems: "center", justifyContent: "center", gap: 3 },
  navItemActive: { backgroundColor: DEEP },
  navText: { color: DEEP, fontSize: 10, fontWeight: "900" },
  navTextActive: { color: "#FFFFFF" },
  cartBadge: { position: "absolute", top: 4, right: 18, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: ORANGE, alignItems: "center", justifyContent: "center", paddingHorizontal: 4 },
  cartBadgeText: { color: "#FFFFFF", fontSize: 10, fontWeight: "900" },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(21,13,7,0.42)", justifyContent: "flex-end" },
  modalCard: { backgroundColor: BG, borderTopLeftRadius: 34, borderTopRightRadius: 34, padding: 18, paddingBottom: 28, borderWidth: 1, borderColor: BORDER },
  modalImage: { width: "100%", height: 220, borderRadius: 28, marginBottom: 14 },
  modalTitle: { color: INK, fontSize: 22, fontWeight: "900" },
  modalMetaRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12 },
  optionWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  optionPill: { paddingHorizontal: 11, paddingVertical: 7, borderRadius: 999, backgroundColor: "rgba(230,139,44,0.16)", color: DEEP, fontSize: 12, fontWeight: "900" },
});
