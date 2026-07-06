import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  ArrowLeft,
  BadgeCheck,
  BriefcaseBusiness,
  ChevronRight,
  LockKeyhole,
  MessageCircle,
  Radio,
  Search,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Store,
} from "lucide-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
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
  buildSilkRoadVerificationStateForProduct,
  findSilkRoadCategory,
  findSilkRoadManufacturer,
  getSilkRoadCategories,
  getSilkRoadDefaultVerificationState,
  getSilkRoadManufacturers,
  getSilkRoadProducts,
  getSilkRoadRouteLinks,
  type SilkRoadFilterMode,
} from "../application/marketplace.service";
import type { SilkRoadCategory, SilkRoadCategoryId, SilkRoadProduct, SilkRoadRiskLevel } from "../domain/marketplace.types";
import { useMarketplaceCart } from "../state/useMarketplaceCart";
import {
  formatSilkRoadPrice,
  getSilkRoadDisplayName,
  resolveSilkRoadLocale,
  tSilkRoad,
} from "../presentation/marketplace.i18n";
import { useI18n } from "../../../shared/i18n";

const BACKGROUND = "#FFF8EA";
const INK = "#2A1A08";
const MUTED = "#7C5C2B";
const GOLD = "#D99A2B";
const SOFT_GOLD = "#F6DFA4";
const CARD = "rgba(255, 252, 244, 0.96)";
const BORDER = "rgba(174, 116, 30, 0.18)";

type SilkRoadTab = "home" | "category" | "cart" | "profile";

type FilterTab = {
  id: SilkRoadFilterMode;
  labelKey: string;
};

const FILTER_TABS: FilterTab[] = [
  { id: "all", labelKey: "tabs.all" },
  { id: "verified", labelKey: "tabs.verified" },
  { id: "restricted", labelKey: "tabs.restricted" },
  { id: "stream", labelKey: "tabs.stream" },
];

const NAV_TABS: Array<{ id: SilkRoadTab; labelKey: string }> = [
  { id: "home", labelKey: "nav.home" },
  { id: "category", labelKey: "nav.category" },
  { id: "cart", labelKey: "nav.cart" },
  { id: "profile", labelKey: "nav.profile" },
];

const CATEGORY_IMAGES: Record<SilkRoadCategoryId, number> = {
  electronics: require("../../../../assets/images/silkroad/categories/electronics.png"),
  clothing: require("../../../../assets/images/silkroad/categories/clothing.png"),
  footwear: require("../../../../assets/images/silkroad/categories/footwear.png"),
  home_kitchen: require("../../../../assets/images/silkroad/categories/home_kitchen.png"),
  beauty: require("../../../../assets/images/silkroad/categories/beauty.png"),
  children: require("../../../../assets/images/silkroad/categories/children.png"),
  auto: require("../../../../assets/images/silkroad/categories/auto.png"),
  construction_machinery: require("../../../../assets/images/silkroad/categories/construction_machinery.png"),
  tools: require("../../../../assets/images/silkroad/categories/tools.png"),
  sports: require("../../../../assets/images/silkroad/categories/sports.png"),
  accessories: require("../../../../assets/images/silkroad/categories/accessories.png"),
  food_products: require("../../../../assets/images/silkroad/categories/food_products.png"),
  business_goods: require("../../../../assets/images/silkroad/categories/business_goods.png"),
  wholesale_goods: require("../../../../assets/images/silkroad/categories/wholesale_goods.png"),
  manufacturers: require("../../../../assets/images/silkroad/categories/manufacturers.png"),
  new_arrivals: require("../../../../assets/images/silkroad/categories/new_arrivals.png"),
  premium_goods: require("../../../../assets/images/silkroad/categories/premium_goods.png"),
  chemicals: require("../../../../assets/images/silkroad/categories/chemicals.png"),
  metals: require("../../../../assets/images/silkroad/categories/metals.png"),
  equipment: require("../../../../assets/images/silkroad/categories/equipment.png"),
  petroleum_products: require("../../../../assets/images/silkroad/categories/petroleum_products.png"),
  gold_jewelry: require("../../../../assets/images/silkroad/categories/gold_jewelry.png"),
  precious_stones: require("../../../../assets/images/silkroad/categories/precious_stones.png"),
};

function riskBadgeKey(risk: SilkRoadRiskLevel) {
  if (risk === "restricted") return "badge.restricted";
  if (risk === "business") return "badge.business";
  return "badge.standard";
}

function AnimatedRouteSand() {
  const shift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shift, { toValue: 1, duration: 3600, useNativeDriver: true }),
        Animated.timing(shift, { toValue: 0, duration: 3600, useNativeDriver: true }),
      ]),
    );

    animation.start();
    return () => animation.stop();
  }, [shift]);

  const translateX = shift.interpolate({ inputRange: [0, 1], outputRange: [-36, 36] });
  const opacity = shift.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.35, 0.68, 0.35] });

  return (
    <Animated.View style={[styles.routeSand, { opacity, transform: [{ translateX }] }]}> 
      <View style={styles.routeSandLine} />
      <View style={[styles.routeSandLine, styles.routeSandLineSecond]} />
      <View style={[styles.routeSandLine, styles.routeSandLineThird]} />
    </Animated.View>
  );
}

export default function MarketplaceScreen() {
  const insets = useSafeAreaInsets();
  const { width: viewportWidth } = useWindowDimensions();
  const { language } = useI18n();
  const locale = resolveSilkRoadLocale(language);
  const t = (key: string) => tSilkRoad(key, locale);
  const categoryTileWidth = Math.floor((viewportWidth - 48) / 3);

  const categories = useMemo(() => getSilkRoadCategories(), []);
  const manufacturers = useMemo(() => getSilkRoadManufacturers(), []);
  const routeLinks = useMemo(() => getSilkRoadRouteLinks(), []);
  const allProducts = useMemo(() => getSilkRoadProducts(), []);
  const cart = useMarketplaceCart(allProducts);

  const [activeTab, setActiveTab] = useState<SilkRoadTab>("home");
  const [query, setQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<SilkRoadCategoryId | null>(null);
  const [filterMode, setFilterMode] = useState<SilkRoadFilterMode>("all");
  const [selectedProduct, setSelectedProduct] = useState<SilkRoadProduct | null>(null);

  const title = getSilkRoadDisplayName(language);
  const homeProducts = useMemo(
    () =>
      getSilkRoadProducts({
        categoryId: "all",
        query,
        mode: filterMode,
      }),
    [filterMode, query],
  );
  const selectedCategoryDetail = selectedCategoryId ? findSilkRoadCategory(selectedCategoryId) : null;
  const categoryProducts = useMemo(
    () =>
      getSilkRoadProducts({
        categoryId: selectedCategoryId ?? "all",
        query,
        mode: filterMode,
      }),
    [filterMode, query, selectedCategoryId],
  );

  const defaultGate = useMemo(() => getSilkRoadDefaultVerificationState(), []);
  const selectedManufacturer = selectedProduct ? findSilkRoadManufacturer(selectedProduct.manufacturerId) : undefined;
  const selectedCategory = selectedProduct ? findSilkRoadCategory(selectedProduct.categoryId) : undefined;
  const selectedGate = selectedProduct ? buildSilkRoadVerificationStateForProduct(selectedProduct) : defaultGate;

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

  const openCategory = (categoryId: SilkRoadCategoryId) => {
    setSelectedCategoryId(categoryId);
    setActiveTab("category");
  };

  const renderSearch = () => (
    <View style={styles.searchCard}>
      <Search size={19} color="#8A641F" />
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder={t("hero.search")}
        placeholderTextColor="rgba(108,77,22,0.58)"
        style={styles.searchInput}
        autoCorrect={false}
        autoCapitalize="none"
      />
      <SlidersHorizontal size={18} color="#8A641F" />
    </View>
  );

  const renderFilterTabs = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabRow}>
      {FILTER_TABS.map((tab) => {
        const active = filterMode === tab.id;
        return (
          <Pressable key={tab.id} onPress={() => setFilterMode(tab.id)} style={[styles.tabButton, active && styles.tabButtonActive]}>
            <Text style={[styles.tabText, active && styles.tabTextActive]}>{t(tab.labelKey)}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );

  const renderCategoryTile = (category: SilkRoadCategory) => {
    const selected = selectedCategoryId === category.id;

    return (
      <Pressable
        key={category.id}
        onPress={() => openCategory(category.id)}
        style={[styles.categoryTile, { width: categoryTileWidth }, selected && styles.categoryTileActive]}
      >
        <View style={styles.categoryPhotoWrap}>
          <Image source={CATEGORY_IMAGES[category.id]} style={styles.categoryTilePhoto} resizeMode="cover" />
          <LinearGradient
            colors={["rgba(255,255,255,0.00)", "rgba(255,248,232,0.22)"]}
            style={styles.categoryPhotoShade}
          />
          {category.riskLevel !== "standard" ? (
            <View style={styles.categoryTileLock}>
              <LockKeyhole size={10} color="#7A4D12" />
            </View>
          ) : null}
        </View>

        <View style={styles.categoryTileBody}>
          <Text style={styles.categoryTileTitle} numberOfLines={2}>{t(category.titleKey)}</Text>
          <Text style={styles.categoryTileMeta}>{category.subcategories.length} {t("category.sections")}</Text>
        </View>
      </Pressable>
    );
  };

  const renderProduct = (product: SilkRoadProduct) => {
    const manufacturer = findSilkRoadManufacturer(product.manufacturerId);
    const category = findSilkRoadCategory(product.categoryId);
    return (
      <Pressable key={product.id} onPress={() => setSelectedProduct(product)} style={styles.productCard}>
        <LinearGradient colors={resolveProductGradient(product.imageTone)} style={styles.productVisual}>
          <AnimatedRouteSand />
          <ShoppingBag size={25} color="#FFFFFF" strokeWidth={2.2} />
        </LinearGradient>

        <View style={styles.productBody}>
          <View style={styles.badgeRow}>
            <View style={[styles.smallBadge, product.riskLevel === "restricted" && styles.warningBadge]}>
              <Text style={[styles.smallBadgeText, product.riskLevel === "restricted" && styles.warningBadgeText]}>
                {t(riskBadgeKey(product.riskLevel))}
              </Text>
            </View>
            {manufacturer?.verified ? (
              <View style={styles.verifiedMini}>
                <BadgeCheck size={12} color="#8A5A16" />
                <Text style={styles.verifiedMiniText}>{t("badge.verified")}</Text>
              </View>
            ) : null}
          </View>

          <Text style={styles.productTitle} numberOfLines={2}>{t(product.titleKey)}</Text>
          <Text style={styles.productPrice}>{formatSilkRoadPrice(product.priceFrom, product.currency, language)}</Text>
          <Text style={styles.productMeta} numberOfLines={1}>{manufacturer?.name ?? "Sabi"}</Text>
          <Text style={styles.productMeta} numberOfLines={1}>{category ? t(category.titleKey) : ""} · {t(product.deliveryLabelKey)}</Text>
        </View>
      </Pressable>
    );
  };

  const renderCartCard = (standalone = false) => (
    <View style={[styles.cartCard, standalone && styles.standaloneCard]}>
      <View style={styles.sectionHeaderInline}>
        <Text style={styles.sectionTitle}>{t("section.cart")}</Text>
        <ShoppingBag size={18} color="#9A5F16" />
      </View>
      {cart.isEmpty ? (
        <Text style={styles.cartEmpty}>{t("cart.empty")}</Text>
      ) : (
        <View style={styles.cartLineWrap}>
          {cart.detailedLines.map((line) => (
            <View key={`${line.productId}-${line.variant || "base"}`} style={styles.cartLine}>
              <Text style={styles.cartLineTitle} numberOfLines={1}>{t(line.product.titleKey)}</Text>
              <Text style={styles.cartLineQty}>{t("product.quantity")}: {line.quantity}</Text>
            </View>
          ))}
          {cart.totalByCurrency.map((total) => (
            <Text key={total.currency} style={styles.cartTotal}>{t("cart.total")}: {formatSilkRoadPrice(total.amount, total.currency as never, language)}</Text>
          ))}
        </View>
      )}
      <Text style={styles.cartNote}>{t("cart.note")}</Text>
    </View>
  );

  const renderGateCard = () => (
    <View style={styles.gateCard}>
      <View style={styles.gateIconWrap}>
        <ShieldCheck size={22} color="#FFFFFF" />
      </View>
      <View style={styles.gateTextWrap}>
        <Text style={styles.gateTitle}>{t("gate.title")}</Text>
        <Text style={styles.gateBody}>{t("gate.body")}</Text>
        <Text style={styles.gateSeller}>{t("gate.seller")}</Text>
      </View>
    </View>
  );

  const renderHomeTab = () => (
    <>
      <LinearGradient colors={["#FFF7E6", "#F5D58B", "#B8751E"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroCard}>
        <View style={styles.heroNoise} />
        <AnimatedRouteSand />
        <Text style={styles.heroEyebrow}>{t("hero.eyebrow")}</Text>
        <Text style={styles.heroTitle}>{title}</Text>
        <Text style={styles.heroSubtitle}>{t("hero.subtitle")}</Text>
        <View style={styles.heroRoutePill}>
          <Text style={styles.heroRouteText}>{t("hero.route")}</Text>
        </View>
      </LinearGradient>

      {renderSearch()}
      {renderFilterTabs()}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t("section.homeProducts")}</Text>
        <Text style={styles.sectionCount}>{homeProducts.length}</Text>
      </View>
      <View style={styles.productGrid}>{homeProducts.map(renderProduct)}</View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t("section.manufacturers")}</Text>
        <Text style={styles.sectionCount}>{manufacturers.length}</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.manufacturerRow}>
        {manufacturers.map((manufacturer) => (
          <Pressable key={manufacturer.id} onPress={() => openRoute(manufacturer.messengerRoute)} style={styles.manufacturerCard}>
            <View style={styles.manufacturerTop}>
              <View style={styles.manufacturerAvatar}>
                <Text style={styles.manufacturerAvatarText}>{manufacturer.name.slice(0, 1)}</Text>
              </View>
              <View style={styles.verifiedBadgeLarge}>
                <BadgeCheck size={14} color="#8A5A16" />
                <Text style={styles.verifiedBadgeText}>{t("badge.verified")}</Text>
              </View>
            </View>
            <Text style={styles.manufacturerName} numberOfLines={2}>{manufacturer.name}</Text>
            <Text style={styles.manufacturerMeta}>{t(manufacturer.specializationKey)}</Text>
            <Text style={styles.manufacturerCountry}>{t(manufacturer.countryKey)} · {manufacturer.city}</Text>
            <View style={styles.manufacturerActions}>
              <MessageCircle size={14} color="#8A5A16" />
              <Radio size={14} color="#8A5A16" />
              <BriefcaseBusiness size={14} color="#8A5A16" />
            </View>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t("section.ecosystem")}</Text>
      </View>
      <View style={styles.routeGrid}>{routeLinks.map(renderRouteCard)}</View>
    </>
  );

  const renderCategoryTab = () => {
    if (selectedCategoryDetail) {
      const isRestricted = selectedCategoryDetail.riskLevel !== "standard";
      return (
        <>
          {renderSearch()}
          <Pressable onPress={() => setSelectedCategoryId(null)} style={styles.categoryBackButton}>
            <ArrowLeft size={16} color="#7A4D12" />
            <Text style={styles.categoryBackText}>{t("category.back")}</Text>
          </Pressable>
          <View style={styles.categoryDetailHero}>
            <View style={[styles.categoryDetailIconWrap, { backgroundColor: selectedCategoryDetail.accent }]}>
              <Image source={CATEGORY_IMAGES[selectedCategoryDetail.id]} style={styles.categoryDetailImage} resizeMode="contain" />
            </View>
            <View style={styles.categoryDetailTextWrap}>
              <Text style={styles.categoryDetailTitle}>{t(selectedCategoryDetail.titleKey)}</Text>
              <Text style={styles.categoryDetailBody}>{t(isRestricted ? "category.restrictedHint" : "category.detailHint")}</Text>
            </View>
            {isRestricted ? <LockKeyhole size={20} color="#7A4D12" /> : null}
          </View>
          {isRestricted ? renderGateCard() : null}
          <View style={styles.selectedSubcategoryWrap}>
            {selectedCategoryDetail.subcategories.map((subcategory) => (
              <View key={subcategory.id} style={styles.selectedSubcategoryPill}>
                <Text style={styles.selectedSubcategoryText}>{t(subcategory.titleKey)}</Text>
              </View>
            ))}
          </View>
          {renderFilterTabs()}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t("section.products")}</Text>
            <Text style={styles.sectionCount}>{categoryProducts.length}</Text>
          </View>
          <View style={styles.productGrid}>{categoryProducts.map(renderProduct)}</View>
        </>
      );
    }

    return (
      <>
        {renderSearch()}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t("section.categories")}</Text>
          <Text style={styles.sectionCount}>{categories.length}</Text>
        </View>
        <View style={styles.categoryTileGrid}>{categories.map(renderCategoryTile)}</View>
      </>
    );
  };

  const renderProfileTab = () => (
    <>
      <View style={styles.profileCard}>
        <View style={styles.profileIconWrap}>
          <Store size={24} color="#FFFFFF" />
        </View>
        <Text style={styles.profileTitle}>{t("profile.sharedTitle")}</Text>
        <Text style={styles.profileBody}>{t("profile.sharedBody")}</Text>
        <Pressable onPress={() => openRoute("/profile")} style={styles.primarySheetButton}>
          <Text style={styles.primarySheetButtonText}>{t("action.openProfile")}</Text>
        </Pressable>
      </View>
      {renderGateCard()}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t("section.ecosystem")}</Text>
      </View>
      <View style={styles.routeGrid}>{routeLinks.map(renderRouteCard)}</View>
    </>
  );

  const renderRouteCard = (item: (typeof routeLinks)[number]) => (
    <Pressable key={item.id} onPress={() => openRoute(item.route)} style={styles.routeCard}>
      <View style={styles.routeIconWrap}>{renderRouteIcon(item.id)}</View>
      <View style={styles.routeTextWrap}>
        <Text style={styles.routeTitle}>{t(item.titleKey)}</Text>
        <Text style={styles.routeBody}>{t(item.bodyKey)}</Text>
      </View>
      <ChevronRight size={18} color="#A66D1A" />
    </Pressable>
  );

  const renderContent = () => {
    if (activeTab === "category") return renderCategoryTab();
    if (activeTab === "cart") return renderCartCard(true);
    if (activeTab === "profile") return renderProfileTab();
    return renderHomeTab();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor={BACKGROUND} />
      <View style={styles.screen}>
        <View style={styles.topGoldAura} />
        <View style={styles.bottomGoldAura} />

        <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}> 
          <Pressable onPress={goBack} style={styles.headerButton}>
            <ArrowLeft size={21} color={INK} />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{title}</Text>
            <Text style={styles.headerSubtitle}>{t("hero.eyebrow")}</Text>
          </View>
          <View style={styles.headerButtonGold}>
            <Store size={20} color="#FFFFFF" />
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 16) + 94 }]}> 
          {renderContent()}
        </ScrollView>

        <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, 10) }]}> 
          {NAV_TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <Pressable key={tab.id} onPress={() => setActiveTab(tab.id)} style={[styles.bottomNavItem, active && styles.bottomNavItemActive]}>
                <View style={styles.bottomNavIcon}>{renderBottomNavIcon(tab.id, active)}</View>
                <Text style={[styles.bottomNavText, active && styles.bottomNavTextActive]}>{t(tab.labelKey)}</Text>
              </Pressable>
            );
          })}
        </View>

        <Modal visible={Boolean(selectedProduct)} animationType="slide" transparent onRequestClose={() => setSelectedProduct(null)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.productSheet, { paddingBottom: Math.max(insets.bottom, 16) }]}> 
              {selectedProduct ? (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetContent}>
                  <LinearGradient colors={resolveProductGradient(selectedProduct.imageTone)} style={styles.sheetVisual}>
                    <AnimatedRouteSand />
                    <ShoppingBag size={42} color="#FFFFFF" strokeWidth={2.2} />
                  </LinearGradient>

                  <View style={styles.sheetTitleRow}>
                    <View style={styles.sheetTitleWrap}>
                      <Text style={styles.sheetTitle}>{t(selectedProduct.titleKey)}</Text>
                      <Text style={styles.sheetSubtitle}>{selectedManufacturer?.name ?? "Sabi"}</Text>
                    </View>
                    <Pressable onPress={() => setSelectedProduct(null)} style={styles.closeButton}>
                      <Text style={styles.closeButtonText}>{t("action.close")}</Text>
                    </Pressable>
                  </View>

                  <Text style={styles.sheetPrice}>{formatSilkRoadPrice(selectedProduct.priceFrom, selectedProduct.currency, language)}</Text>

                  <View style={styles.sheetInfoGrid}>
                    <InfoPill label={t("product.minimum")} value={String(selectedProduct.minQuantity)} />
                    <InfoPill label={t("product.available")} value={t(selectedProduct.stockLabelKey)} />
                    <InfoPill label={t("product.delivery")} value={t(selectedProduct.deliveryLabelKey)} />
                    <InfoPill label={t("product.reviews")} value={`${selectedProduct.reviewCount}`} />
                  </View>

                  <View style={styles.variantWrap}>
                    <Text style={styles.blockTitle}>{t("product.variant")}</Text>
                    <View style={styles.variantRow}>
                      {selectedProduct.variants.map((variant) => (
                        <View key={variant} style={styles.variantPill}>
                          <Text style={styles.variantText}>{variant.startsWith("variant.") ? t(variant) : variant}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  <View style={styles.specCard}>
                    <Text style={styles.blockTitle}>{t("product.specs")}</Text>
                    {selectedProduct.specs.map((spec) => (
                      <View key={`${spec.labelKey}-${spec.value}`} style={styles.specRow}>
                        <Text style={styles.specLabel}>{t(spec.labelKey)}</Text>
                        <Text style={styles.specValue}>{spec.value.startsWith("value.") ? t(spec.value) : spec.value}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.specCard}>
                    <Text style={styles.blockTitle}>{t("product.manufacturer")}</Text>
                    <Text style={styles.manufacturerName}>{selectedManufacturer?.name ?? "Sabi"}</Text>
                    <Text style={styles.manufacturerMeta}>{selectedManufacturer ? t(selectedManufacturer.specializationKey) : ""}</Text>
                    <Text style={styles.manufacturerCountry}>{selectedManufacturer ? `${t(selectedManufacturer.countryKey)} · ${selectedManufacturer.city}` : ""}</Text>
                    {selectedCategory ? <Text style={styles.categoryTileMeta}>{t(selectedCategory.titleKey)} · {t(riskBadgeKey(selectedProduct.riskLevel))}</Text> : null}
                  </View>

                  <View style={styles.gateCardSheet}>
                    <View style={styles.gateIconWrap}>
                      <LockKeyhole size={20} color="#FFFFFF" />
                    </View>
                    <View style={styles.gateTextWrap}>
                      <Text style={styles.gateTitle}>{t(selectedGate.checkoutBlockedReason)}</Text>
                      <Text style={styles.gateBody}>{t("gate.body")}</Text>
                      <Text style={styles.gateSeller}>{t("gate.seller")}</Text>
                    </View>
                  </View>

                  <View style={styles.sheetActionGrid}>
                    <Pressable onPress={() => cart.addProduct(selectedProduct, selectedProduct.variants[0])} style={styles.primarySheetButton}>
                      <Text style={styles.primarySheetButtonText}>{t("action.addCart")}</Text>
                    </Pressable>
                    <Pressable onPress={() => openRoute(selectedManufacturer?.messengerRoute || "/tabs/chats")} style={styles.secondarySheetButton}>
                      <MessageCircle size={17} color="#7A4D12" />
                      <Text style={styles.secondarySheetButtonText}>{t("action.messenger")}</Text>
                    </Pressable>
                    <Pressable onPress={() => openRoute(selectedManufacturer?.businessStreamRoute || "/stream")} style={styles.secondarySheetButton}>
                      <Radio size={17} color="#7A4D12" />
                      <Text style={styles.secondarySheetButtonText}>{t("action.stream")}</Text>
                    </Pressable>
                    <Pressable onPress={() => openRoute("/merchant")} style={styles.secondarySheetButton}>
                      <BriefcaseBusiness size={17} color="#7A4D12" />
                      <Text style={styles.secondarySheetButtonText}>{t("action.merchant")}</Text>
                    </Pressable>
                  </View>
                </ScrollView>
              ) : null}
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoPill}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function renderBottomNavIcon(tab: SilkRoadTab, active: boolean) {
  const color = active ? "#2A1A08" : "#8A5A16";
  switch (tab) {
    case "home":
      return <Store size={19} color={color} />;
    case "category":
      return <ShoppingBag size={19} color={color} />;
    case "cart":
      return <ShoppingBag size={19} color={color} />;
    case "profile":
      return <BriefcaseBusiness size={19} color={color} />;
    default:
      return <Store size={19} color={color} />;
  }
}

function renderRouteIcon(id: string) {
  const color = "#8A5A16";
  switch (id) {
    case "messenger":
      return <MessageCircle size={18} color={color} />;
    case "business_stream":
      return <Radio size={18} color={color} />;
    case "business_account":
    case "business_merchant":
      return <BriefcaseBusiness size={18} color={color} />;
    case "wallet":
      return <ShoppingBag size={18} color={color} />;
    case "admin":
      return <ShieldCheck size={18} color={color} />;
    case "qr":
      return <Store size={18} color={color} />;
    default:
      return <ChevronRight size={18} color={color} />;
  }
}

function resolveProductGradient(tone: SilkRoadProduct["imageTone"]): [string, string, string] {
  switch (tone) {
    case "sand":
      return ["#B66F1C", "#D99A2B", "#F8DFA4"];
    case "amber":
      return ["#9F5A16", "#D08A20", "#FFE2A2"];
    case "pearl":
      return ["#CFA660", "#F7E2B2", "#FFF8EA"];
    case "bronze":
      return ["#6E3E13", "#A96A1D", "#E5BD72"];
    default:
      return ["#8F5517", "#D99A2B", "#FFF0C7"];
  }
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  screen: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  topGoldAura: {
    position: "absolute",
    top: -80,
    left: -40,
    right: -40,
    height: 240,
    backgroundColor: "rgba(239, 184, 86, 0.36)",
    borderBottomLeftRadius: 220,
    borderBottomRightRadius: 220,
  },
  bottomGoldAura: {
    position: "absolute",
    left: -60,
    right: -60,
    bottom: -130,
    height: 240,
    backgroundColor: "rgba(220, 156, 43, 0.22)",
    borderTopLeftRadius: 240,
    borderTopRightRadius: 240,
  },
  header: {
    paddingHorizontal: 18,
    paddingBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.72)",
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: "center",
    justifyContent: "center",
  },
  headerButtonGold: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: GOLD,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: GOLD,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 12,
  },
  headerTitle: {
    color: INK,
    fontSize: 20,
    fontWeight: "900",
  },
  headerSubtitle: {
    marginTop: 2,
    color: MUTED,
    fontSize: 12,
    fontWeight: "700",
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  heroCard: {
    borderRadius: 30,
    padding: 22,
    minHeight: 188,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.66)",
    shadowColor: "#9A5A13",
    shadowOpacity: 0.22,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 16 },
    elevation: 10,
  },
  heroNoise: {
    position: "absolute",
    top: -60,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(255,255,255,0.24)",
  },
  heroEyebrow: {
    color: "rgba(68,43,9,0.72)",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  heroTitle: {
    color: "#2A1705",
    fontSize: 32,
    fontWeight: "900",
    marginTop: 8,
  },
  heroSubtitle: {
    color: "rgba(42,23,5,0.78)",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
    marginTop: 8,
    maxWidth: 315,
  },
  heroRoutePill: {
    alignSelf: "flex-start",
    marginTop: 16,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: "rgba(255,255,255,0.42)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.46)",
  },
  heroRouteText: {
    color: "#4D3008",
    fontSize: 12,
    fontWeight: "900",
  },
  routeSand: {
    position: "absolute",
    left: 18,
    right: 18,
    top: 34,
    height: 100,
  },
  routeSandLine: {
    position: "absolute",
    height: 2,
    left: 20,
    right: 20,
    top: 26,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.46)",
    transform: [{ rotate: "-8deg" }],
  },
  routeSandLineSecond: {
    top: 50,
    left: 42,
    right: 34,
    opacity: 0.7,
    transform: [{ rotate: "6deg" }],
  },
  routeSandLineThird: {
    top: 74,
    left: 8,
    right: 70,
    opacity: 0.48,
    transform: [{ rotate: "-3deg" }],
  },
  searchCard: {
    marginTop: 18,
    borderRadius: 22,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: INK,
    fontSize: 14,
    fontWeight: "700",
    paddingVertical: 2,
  },
  gateCard: {
    marginTop: 14,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.72)",
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    flexDirection: "row",
    gap: 12,
  },
  gateCardSheet: {
    marginTop: 14,
    borderRadius: 24,
    backgroundColor: "rgba(255,247,229,0.94)",
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    flexDirection: "row",
    gap: 12,
  },
  gateIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#B8751E",
    alignItems: "center",
    justifyContent: "center",
  },
  gateTextWrap: {
    flex: 1,
  },
  gateTitle: {
    color: INK,
    fontSize: 14,
    fontWeight: "900",
  },
  gateBody: {
    marginTop: 5,
    color: MUTED,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
  },
  gateSeller: {
    marginTop: 7,
    color: "#8A4F10",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "800",
  },
  tabRow: {
    gap: 8,
    paddingVertical: 16,
  },
  tabButton: {
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.66)",
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  tabButtonActive: {
    backgroundColor: "#3A2206",
    borderColor: "#3A2206",
  },
  tabText: {
    color: MUTED,
    fontSize: 12,
    fontWeight: "900",
  },
  tabTextActive: {
    color: "#FFF8EA",
  },
  sectionHeader: {
    marginTop: 8,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionHeaderInline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: INK,
    fontSize: 18,
    fontWeight: "900",
  },
  sectionCount: {
    minWidth: 32,
    textAlign: "center",
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: SOFT_GOLD,
    color: "#75450D",
    fontSize: 12,
    fontWeight: "900",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  categoryIntro: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
    marginTop: -4,
    marginBottom: 12,
  },
  categoryTileGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
    paddingBottom: 4,
  },
  categoryTile: {
    minHeight: 132,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderWidth: 1,
    borderColor: "rgba(174,116,30,0.15)",
    overflow: "hidden",
    shadowColor: "#8A4F10",
    shadowOpacity: 0.09,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  categoryTileActive: {
    borderColor: "#B8751E",
    backgroundColor: "rgba(255,250,236,0.98)",
  },
  categoryPhotoWrap: {
    height: 82,
    width: "100%",
    backgroundColor: "#F6E8C8",
    overflow: "hidden",
  },
  categoryTilePhoto: {
    width: "100%",
    height: "100%",
  },
  categoryPhotoShade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 32,
  },
  categoryTileBody: {
    minHeight: 50,
    paddingHorizontal: 7,
    paddingTop: 7,
    paddingBottom: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryTileTitle: {
    color: INK,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900",
    textAlign: "center",
  },
  categoryTileMeta: {
    color: MUTED,
    fontSize: 9,
    fontWeight: "800",
    marginTop: 4,
    textAlign: "center",
  },
  categoryTileLock: {
    position: "absolute",
    right: 6,
    top: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,249,235,0.92)",
    borderWidth: 1,
    borderColor: BORDER,
  },
  categoryBackButton: {
    alignSelf: "flex-start",
    marginTop: 14,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: "rgba(255,255,255,0.76)",
    borderWidth: 1,
    borderColor: BORDER,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  categoryBackText: {
    color: "#7A4D12",
    fontSize: 12,
    fontWeight: "900",
  },
  categoryDetailHero: {
    marginTop: 12,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.82)",
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  categoryDetailIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  categoryDetailImage: {
    width: 58,
    height: 58,
  },
  categoryDetailTextWrap: {
    flex: 1,
  },
  categoryDetailTitle: {
    color: INK,
    fontSize: 18,
    fontWeight: "900",
  },
  categoryDetailBody: {
    color: MUTED,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
    marginTop: 6,
  },
  selectedSubcategoryWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  selectedSubcategoryPill: {
    borderRadius: 999,
    backgroundColor: "rgba(238, 202, 125, 0.24)",
    borderWidth: 1,
    borderColor: "rgba(174,116,30,0.12)",
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  selectedSubcategoryText: {
    color: "#6E4610",
    fontSize: 11,
    fontWeight: "900",
  },
  manufacturerRow: {
    gap: 12,
    paddingBottom: 6,
  },
  manufacturerCard: {
    width: 226,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.78)",
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
  },
  manufacturerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  manufacturerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#3A2206",
    alignItems: "center",
    justifyContent: "center",
  },
  manufacturerAvatarText: {
    color: "#FFF3CF",
    fontSize: 18,
    fontWeight: "900",
  },
  verifiedBadgeLarge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 999,
    backgroundColor: SOFT_GOLD,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  verifiedBadgeText: {
    color: "#71440E",
    fontSize: 10,
    fontWeight: "900",
  },
  manufacturerName: {
    color: INK,
    fontSize: 14,
    fontWeight: "900",
    marginTop: 12,
    lineHeight: 18,
  },
  manufacturerMeta: {
    color: MUTED,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
    marginTop: 7,
  },
  manufacturerCountry: {
    color: "#8A4F10",
    fontSize: 12,
    fontWeight: "900",
    marginTop: 7,
  },
  manufacturerActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  productGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  productCard: {
    width: "48%",
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.82)",
    borderWidth: 1,
    borderColor: BORDER,
    overflow: "hidden",
  },
  productVisual: {
    height: 112,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  productBody: {
    padding: 12,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  smallBadge: {
    borderRadius: 999,
    backgroundColor: "rgba(246, 223, 164, 0.7)",
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  warningBadge: {
    backgroundColor: "rgba(122, 77, 18, 0.12)",
  },
  smallBadgeText: {
    color: "#75450D",
    fontSize: 9,
    fontWeight: "900",
  },
  warningBadgeText: {
    color: "#64380A",
  },
  verifiedMini: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  verifiedMiniText: {
    color: "#8A5A16",
    fontSize: 9,
    fontWeight: "900",
  },
  productTitle: {
    color: INK,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
    minHeight: 34,
  },
  productPrice: {
    color: "#8A4F10",
    fontSize: 15,
    fontWeight: "900",
    marginTop: 8,
  },
  productMeta: {
    color: MUTED,
    fontSize: 11,
    fontWeight: "700",
    marginTop: 5,
  },
  routeGrid: {
    gap: 10,
  },
  routeCard: {
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.78)",
    borderWidth: 1,
    borderColor: BORDER,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  routeIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: SOFT_GOLD,
    alignItems: "center",
    justifyContent: "center",
  },
  routeTextWrap: {
    flex: 1,
  },
  routeTitle: {
    color: INK,
    fontSize: 13,
    fontWeight: "900",
  },
  routeBody: {
    color: MUTED,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "700",
    marginTop: 4,
  },
  cartCard: {
    marginTop: 18,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.82)",
    borderWidth: 1,
    borderColor: BORDER,
    padding: 15,
  },
  standaloneCard: {
    marginTop: 12,
  },
  cartEmpty: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
    marginTop: 10,
  },
  cartLineWrap: {
    gap: 8,
    marginTop: 12,
  },
  cartLine: {
    borderRadius: 14,
    backgroundColor: "rgba(246,223,164,0.24)",
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  cartLineTitle: {
    flex: 1,
    color: INK,
    fontSize: 12,
    fontWeight: "900",
  },
  cartLineQty: {
    color: "#7A4D12",
    fontSize: 12,
    fontWeight: "900",
  },
  cartTotal: {
    color: "#5F3508",
    fontSize: 15,
    fontWeight: "900",
    marginTop: 4,
  },
  cartNote: {
    marginTop: 12,
    color: MUTED,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "700",
  },
  profileCard: {
    marginTop: 12,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.84)",
    borderWidth: 1,
    borderColor: BORDER,
    padding: 18,
  },
  profileIconWrap: {
    width: 54,
    height: 54,
    borderRadius: 20,
    backgroundColor: GOLD,
    alignItems: "center",
    justifyContent: "center",
  },
  profileTitle: {
    color: INK,
    fontSize: 19,
    fontWeight: "900",
    marginTop: 14,
  },
  profileBody: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
    marginTop: 8,
    marginBottom: 14,
  },
  bottomNav: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 8,
    borderRadius: 28,
    backgroundColor: "rgba(255,252,244,0.96)",
    borderWidth: 1,
    borderColor: BORDER,
    paddingTop: 9,
    paddingHorizontal: 7,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#8A4F10",
    shadowOpacity: 0.14,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 9,
  },
  bottomNavItem: {
    flex: 1,
    minHeight: 52,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  bottomNavItemActive: {
    backgroundColor: "rgba(246,223,164,0.62)",
  },
  bottomNavIcon: {
    minHeight: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomNavText: {
    color: MUTED,
    fontSize: 10,
    fontWeight: "900",
  },
  bottomNavTextActive: {
    color: INK,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(42,26,8,0.38)",
    justifyContent: "flex-end",
  },
  productSheet: {
    maxHeight: "90%",
    backgroundColor: BACKGROUND,
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    overflow: "hidden",
  },
  sheetContent: {
    padding: 16,
    paddingBottom: 24,
  },
  sheetVisual: {
    height: 210,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  sheetTitleRow: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  sheetTitleWrap: {
    flex: 1,
  },
  sheetTitle: {
    color: INK,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "900",
  },
  sheetSubtitle: {
    color: MUTED,
    fontSize: 13,
    fontWeight: "800",
    marginTop: 6,
  },
  closeButton: {
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.86)",
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  closeButtonText: {
    color: "#7A4D12",
    fontSize: 12,
    fontWeight: "900",
  },
  sheetPrice: {
    color: "#7A4D12",
    fontSize: 22,
    fontWeight: "900",
    marginTop: 14,
  },
  sheetInfoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14,
  },
  infoPill: {
    width: "48%",
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.78)",
    borderWidth: 1,
    borderColor: BORDER,
    padding: 11,
  },
  infoLabel: {
    color: MUTED,
    fontSize: 10,
    fontWeight: "900",
  },
  infoValue: {
    color: INK,
    fontSize: 12,
    fontWeight: "900",
    marginTop: 5,
  },
  variantWrap: {
    marginTop: 16,
  },
  blockTitle: {
    color: INK,
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 10,
  },
  variantRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  variantPill: {
    borderRadius: 999,
    backgroundColor: SOFT_GOLD,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  variantText: {
    color: "#72440E",
    fontSize: 12,
    fontWeight: "900",
  },
  specCard: {
    marginTop: 16,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
  },
  specRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(174,116,30,0.1)",
  },
  specLabel: {
    color: MUTED,
    fontSize: 12,
    fontWeight: "800",
  },
  specValue: {
    flex: 1,
    color: INK,
    fontSize: 12,
    fontWeight: "900",
    textAlign: "right",
  },
  sheetActionGrid: {
    marginTop: 16,
    gap: 10,
  },
  primarySheetButton: {
    borderRadius: 20,
    backgroundColor: "#3A2206",
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  primarySheetButtonText: {
    color: "#FFF8EA",
    fontSize: 14,
    fontWeight: "900",
  },
  secondarySheetButton: {
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.86)",
    borderWidth: 1,
    borderColor: BORDER,
    paddingVertical: 13,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  secondarySheetButtonText: {
    color: "#7A4D12",
    fontSize: 13,
    fontWeight: "900",
  },
});
