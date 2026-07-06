import React, { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  CreditCard,
  Heart,
  LockKeyhole,
  MapPin,
  Minus,
  Navigation,
  Plus,
  Search,
  ShieldCheck,
  ShoppingCart,
  SlidersHorizontal,
  Store,
} from "lucide-react-native";

import SabiMapStoreCard from "../../sabi-map/components/SabiMapStoreCard";
import SabiMapView from "../../sabi-map/components/SabiMapView";
import type { SabiMapFilter } from "../../sabi-map/domain/sabiMap.types";
import { getVisibleSabiMarkers } from "../../sabi-map/application/sabiMap.service";
import { useI18n } from "../../../shared/i18n";
import {
  filterProducts,
  formatSupermarketAmount,
  listActiveCustomerStores,
  listDepartmentsForStore,
  localizeText,
  makeStoreMapMarker,
  resolveSupermarketLocale,
  searchStoresAndProducts,
  sortStoresForCustomer,
  storeStatusLabel,
  storeTypeLabel,
} from "../application/supermarket.service";
import { useSupermarketCart } from "../state/useSupermarketCart";
import type {
  SupermarketDepartment,
  SupermarketDepartmentId,
  SupermarketProduct,
  SupermarketStore,
} from "../domain/supermarket.types";
import {
  deliveryMethodText,
  paymentMethodText,
  supermarketText,
} from "../presentation/supermarket.i18n";

function goBack() {
  if (router.canGoBack()) {
    router.back();
    return;
  }
  router.push("/" as never);
}

function productToneStyle(tone: SupermarketProduct["imageTone"]) {
  if (tone === "green") return styles.tone_green;
  if (tone === "cream") return styles.tone_cream;
  if (tone === "blue") return styles.tone_blue;
  if (tone === "amber") return styles.tone_amber;
  return styles.tone_rose;
}

function ProductTone({ tone }: { tone: SupermarketProduct["imageTone"] }) {
  return <View style={[styles.productVisual, productToneStyle(tone)]} />;
}

function DepartmentPill({
  department,
  active,
  language,
  onPress,
}: {
  department: SupermarketDepartment;
  active: boolean;
  language: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.departmentPill, active ? styles.departmentPillActive : null]}>
      <Text style={[styles.departmentPillText, active ? styles.departmentPillTextActive : null]}>
        {localizeText(department.shortTitle, language)}
      </Text>
      {department.compliance.restricted ? <LockKeyhole size={12} color={active ? "#FFFFFF" : "#7B8D82"} /> : null}
    </Pressable>
  );
}

function ProductCard({
  product,
  quantity,
  language,
  addLabel,
  stockLabel,
  lockedTitle,
  lockedText,
  onAdd,
  onDecrease,
}: {
  product: SupermarketProduct;
  quantity: number;
  language: string;
  addLabel: string;
  stockLabel: string;
  lockedTitle: string;
  lockedText: string;
  onAdd: () => void;
  onDecrease: () => void;
}) {
  const locked = product.compliance.restricted;

  return (
    <View style={[styles.productCard, locked ? styles.lockedProductCard : null]}>
      <ProductTone tone={product.imageTone} />
      <View style={styles.productBody}>
        <Text style={styles.productTitle} numberOfLines={2}>{localizeText(product.title, language)}</Text>
        <Text style={styles.productSubtitle} numberOfLines={2}>{localizeText(product.subtitle, language)}</Text>
        <View style={styles.productMetaRow}>
          <Text style={styles.productPrice}>{product.price > 0 ? formatSupermarketAmount(product.price) : "—"}</Text>
          <Text style={styles.productUnit}>{localizeText(product.unitLabel, language)}</Text>
        </View>
        {locked ? (
          <View style={styles.lockedBox}>
            <LockKeyhole size={13} color="#8A5B18" />
            <View style={styles.lockedCopy}>
              <Text style={styles.lockedTitle}>{lockedTitle}</Text>
              <Text style={styles.lockedText}>{lockedText}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.productActionRow}>
            <Text style={styles.stockText}>{stockLabel}: {product.stock}</Text>
            {quantity > 0 ? (
              <View style={styles.quantityBox}>
                <Pressable onPress={onDecrease} style={styles.quantityButton}>
                  <Minus size={14} color="#0F5132" />
                </Pressable>
                <Text style={styles.quantityText}>{quantity}</Text>
                <Pressable onPress={onAdd} style={styles.quantityButton}>
                  <Plus size={14} color="#0F5132" />
                </Pressable>
              </View>
            ) : (
              <Pressable onPress={onAdd} style={styles.addButton}>
                <Plus size={14} color="#FFFFFF" />
                <Text style={styles.addButtonText}>{addLabel}</Text>
              </Pressable>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

export default function SupermarketScreen() {
  const insets = useSafeAreaInsets();
  const { language } = useI18n();
  const text = supermarketText(language);
  const locale = resolveSupermarketLocale(language);
  const [address, setAddress] = useState(locale === "ru" ? "Текущая локация · Юнусабад" : locale === "uz" ? "Joriy lokatsiya · Yunusobod" : "Current location · Yunusabad");
  const [query, setQuery] = useState("");
  const [storeSort, setStoreSort] = useState<"nearest" | "coverage" | "fast">("nearest");
  const [selectedStoreId, setSelectedStoreId] = useState("green-family-market");
  const [catalogStoreId, setCatalogStoreId] = useState<string | null>(null);
  const [departmentId, setDepartmentId] = useState<SupermarketDepartmentId>("products");
  const [catalogQuery, setCatalogQuery] = useState("");

  const activeStores = useMemo(() => {
    const stores = searchStoresAndProducts(query, language);
    return sortStoresForCustomer(stores, storeSort);
  }, [language, query, storeSort]);

  const selectedStore = useMemo(() => {
    return activeStores.find((store) => store.id === selectedStoreId) || activeStores[0] || listActiveCustomerStores()[0];
  }, [activeStores, selectedStoreId]);

  const catalogStore = useMemo(() => {
    return (catalogStoreId ? listActiveCustomerStores().find((store) => store.id === catalogStoreId) : undefined) || selectedStore;
  }, [catalogStoreId, selectedStore]);

  const cart = useSupermarketCart(catalogStore);

  const departments = useMemo(() => listDepartmentsForStore(catalogStore), [catalogStore]);

  const products = useMemo(() => filterProducts({
    storeId: catalogStore.id,
    departmentId,
    query: catalogQuery,
    language,
  }), [catalogQuery, catalogStore.id, departmentId, language]);

  const markers = useMemo(() => activeStores.map(makeStoreMapMarker), [activeStores]);

  const mapFilters = useMemo<SabiMapFilter[]>(() => {
    if (storeSort === "coverage") return ["has_needed_products"];
    if (storeSort === "fast") return ["fast_delivery", "open_now"];
    return ["nearest", "open_now"];
  }, [storeSort]);

  const visibleMarkers = useMemo(() => getVisibleSabiMarkers(markers, mapFilters), [mapFilters, markers]);

  const openStore = (store: SupermarketStore) => {
    setSelectedStoreId(store.id);
    setCatalogStoreId(store.id);
    setDepartmentId("products");
    setCatalogQuery("");
  };

  const showMap = !catalogStoreId;

  const checkoutDisabled = cart.lines.length === 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right"]}>
      <StatusBar barStyle="light-content" />
      <View style={styles.page}>
        <LinearGradient colors={["#0F5132", "#1E9E62", "#F7F3E8"] as const} style={styles.topGradient}>
          <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}>
            <Pressable onPress={showMap ? goBack : () => setCatalogStoreId(null)} style={styles.headerButton}>
              <ArrowLeft size={20} color="#FFFFFF" />
            </Pressable>
            <View style={styles.headerTitleBlock}>
              <Text style={styles.headerTitle}>{text.title}</Text>
              <Text style={styles.headerSubtitle} numberOfLines={1}>{showMap ? text.subtitle : catalogStore.title}</Text>
            </View>
            <View style={styles.headerButton}>
              <ShoppingCart size={20} color="#FFFFFF" />
            </View>
          </View>

          <View style={styles.addressCard}>
            <MapPin size={18} color="#0F5132" />
            <View style={styles.addressBody}>
              <Text style={styles.addressLabel}>{text.addressTitle}</Text>
              <TextInput
                value={address}
                onChangeText={(value) => {
                  setAddress(value);
                  cart.setDeliveryAddress(value);
                }}
                placeholder={text.addressPlaceholder}
                placeholderTextColor="#7D9185"
                style={styles.addressInput}
              />
            </View>
          </View>
        </LinearGradient>

        {showMap ? (
          <ScrollView style={styles.scroll} contentContainerStyle={styles.mapContent} showsVerticalScrollIndicator={false}>
            <View style={styles.searchRow}>
              <View style={styles.searchBox}>
                <Search size={18} color="#6B7F72" />
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder={text.searchPlaceholder}
                  placeholderTextColor="#819186"
                  style={styles.searchInput}
                />
              </View>
              <View style={styles.filterIconBox}>
                <SlidersHorizontal size={18} color="#0F5132" />
              </View>
            </View>

            <View style={styles.filtersRow}>
              <Pressable onPress={() => setStoreSort("nearest")} style={[styles.filterChip, storeSort === "nearest" ? styles.filterChipActive : null]}>
                <Text style={[styles.filterChipText, storeSort === "nearest" ? styles.filterChipTextActive : null]}>{text.nearest}</Text>
              </Pressable>
              <Pressable onPress={() => setStoreSort("coverage")} style={[styles.filterChip, storeSort === "coverage" ? styles.filterChipActive : null]}>
                <Text style={[styles.filterChipText, storeSort === "coverage" ? styles.filterChipTextActive : null]}>{text.coverage}</Text>
              </Pressable>
              <Pressable onPress={() => setStoreSort("fast")} style={[styles.filterChip, storeSort === "fast" ? styles.filterChipActive : null]}>
                <Text style={[styles.filterChipText, storeSort === "fast" ? styles.filterChipTextActive : null]}>{text.fast}</Text>
              </Pressable>
            </View>

            <SabiMapView
              language={language}
              markers={visibleMarkers}
              selectedMarkerId={selectedStore?.id}
              onSelectMarker={(storeId) => setSelectedStoreId(storeId)}
            />

            <View style={styles.sectionHead}>
              <View>
                <Text style={styles.sectionTitle}>{text.storesNearby}</Text>
                <Text style={styles.sectionSubtitle}>{text.chooseStore}</Text>
              </View>
              <View style={styles.countPill}>
                <Text style={styles.countPillText}>{activeStores.length}</Text>
              </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.storeCardsRow}>
              {activeStores.map((store) => (
                <View key={store.id} style={styles.storeCardWrap}>
                  <SabiMapStoreCard
                    marker={makeStoreMapMarker(store)}
                    selected={store.id === selectedStore?.id}
                    typeLabel={storeTypeLabel(store.type, language)}
                    statusLabel={storeStatusLabel(store.status, language)}
                    openLabel={`${text.minOrder}: ${formatSupermarketAmount(store.minOrder)} · ${text.likes}: ${store.likes}`}
                    onPress={() => setSelectedStoreId(store.id)}
                  />
                  <Pressable onPress={() => openStore(store)} style={styles.openStoreButton}>
                    <Text style={styles.openStoreButtonText}>{text.openStore}</Text>
                  </Pressable>
                </View>
              ))}
            </ScrollView>

            <View style={styles.merchantAccessCard}>
              <View style={styles.merchantAccessIcon}>
                <Building2 size={18} color="#0F5132" />
              </View>
              <View style={styles.merchantAccessBody}>
                <Text style={styles.merchantAccessTitle}>{text.merchantClosedAccess}</Text>
                <Text style={styles.merchantAccessText}>{text.merchantClosedAccessText}</Text>
              </View>
              <LockKeyhole size={18} color="#6D7F74" />
            </View>
          </ScrollView>
        ) : (
          <ScrollView style={styles.scroll} contentContainerStyle={styles.catalogContent} showsVerticalScrollIndicator={false}>
            <View style={styles.storeHeroCard}>
              <View style={styles.storeHeroTop}>
                <View style={styles.storeHeroIcon}>
                  <Store size={26} color="#0F5132" />
                </View>
                <View style={styles.storeHeroBody}>
                  <Text style={styles.storeHeroTitle}>{catalogStore.title}</Text>
                  <Text style={styles.storeHeroMeta}>{storeTypeLabel(catalogStore.type, language)} · {storeStatusLabel(catalogStore.status, language)}</Text>
                </View>
                <View style={styles.ratingMini}>
                  <Heart size={14} color="#0F5132" />
                  <Text style={styles.ratingMiniText}>{catalogStore.rating.toFixed(1)}</Text>
                </View>
              </View>
              <View style={styles.storeStatsRow}>
                <View style={styles.storeStatBox}>
                  <Navigation size={14} color="#607869" />
                  <Text style={styles.storeStatText}>{catalogStore.distanceKm.toFixed(1)} км</Text>
                </View>
                <View style={styles.storeStatBox}>
                  <CheckCircle2 size={14} color="#607869" />
                  <Text style={styles.storeStatText}>{text.neededProducts}: {catalogStore.coverageScore}%</Text>
                </View>
                <View style={styles.storeStatBox}>
                  <ShieldCheck size={14} color="#607869" />
                  <Text style={styles.storeStatText}>{text.commission}: {catalogStore.serviceFeePercent}%</Text>
                </View>
              </View>
            </View>

            <View style={styles.catalogSearchBox}>
              <Search size={17} color="#6B7F72" />
              <TextInput
                value={catalogQuery}
                onChangeText={setCatalogQuery}
                placeholder={text.searchPlaceholder}
                placeholderTextColor="#819186"
                style={styles.searchInput}
              />
            </View>

            <Text style={styles.defaultDepartmentNote}>{text.defaultDepartmentNote}</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.departmentsRow}>
              {departments.map((department) => (
                <DepartmentPill
                  key={department.id}
                  department={department}
                  active={department.id === departmentId}
                  language={language}
                  onPress={() => setDepartmentId(department.id)}
                />
              ))}
            </ScrollView>

            <View style={styles.productsGrid}>
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  quantity={cart.getQuantity(product.id)}
                  language={language}
                  addLabel={text.add}
                  stockLabel={text.stock}
                  lockedTitle={text.lockedDepartment}
                  lockedText={text.lockedDepartmentText}
                  onAdd={() => cart.addProduct(product)}
                  onDecrease={() => cart.decreaseProduct(product.id)}
                />
              ))}
            </View>

            <View style={styles.cartCard}>
              <View style={styles.cartHeader}>
                <View>
                  <Text style={styles.cartTitle}>{text.cart}</Text>
                  <Text style={styles.cartSubtitle}>{cart.lines.length ? catalogStore.title : text.cartEmpty}</Text>
                </View>
                <View style={styles.cartIconCircle}>
                  <ShoppingCart size={18} color="#0F5132" />
                </View>
              </View>

              {cart.lines.map((line) => (
                <View key={line.product.id} style={styles.cartLine}>
                  <Text style={styles.cartLineTitle} numberOfLines={1}>{localizeText(line.product.title, language)}</Text>
                  <Text style={styles.cartLineMeta}>{line.quantity} × {formatSupermarketAmount(line.product.price)}</Text>
                  <Text style={styles.cartLineTotal}>{formatSupermarketAmount(line.lineTotal)}</Text>
                </View>
              ))}

              <View style={styles.checkoutBlock}>
                <Text style={styles.checkoutLabel}>{text.deliveryAddress}</Text>
                <TextInput
                  value={cart.deliveryAddress || address}
                  onChangeText={cart.setDeliveryAddress}
                  placeholder={text.addressPlaceholder}
                  placeholderTextColor="#819186"
                  style={styles.checkoutInput}
                />

                <Text style={styles.checkoutLabel}>{text.deliveryMethod}</Text>
                <View style={styles.optionRow}>
                  {(["delivery", "pickup"] as const).map((method) => (
                    <Pressable
                      key={method}
                      onPress={() => cart.setDeliveryMethod(method)}
                      style={[styles.optionChip, cart.deliveryMethod === method ? styles.optionChipActive : null]}
                    >
                      <Text style={[styles.optionChipText, cart.deliveryMethod === method ? styles.optionChipTextActive : null]}>
                        {deliveryMethodText(method, text)}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={styles.checkoutLabel}>{text.paymentMethod}</Text>
                <View style={styles.optionRow}>
                  {(["sabi_wallet", "business_card", "cash_after_provider"] as const).map((method) => (
                    <Pressable
                      key={method}
                      onPress={() => cart.setPaymentMethod(method)}
                      style={[styles.optionChip, cart.paymentMethod === method ? styles.optionChipActive : null]}
                    >
                      <CreditCard size={13} color={cart.paymentMethod === method ? "#FFFFFF" : "#0F5132"} />
                      <Text style={[styles.optionChipText, cart.paymentMethod === method ? styles.optionChipTextActive : null]}>
                        {paymentMethodText(method, text)}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <View style={styles.totalRows}>
                  <View style={styles.totalRow}><Text style={styles.totalLabel}>{text.subtotal}</Text><Text style={styles.totalValue}>{formatSupermarketAmount(cart.checkout.subtotal)}</Text></View>
                  <View style={styles.totalRow}><Text style={styles.totalLabel}>{text.delivery}</Text><Text style={styles.totalValue}>{formatSupermarketAmount(cart.checkout.deliveryFee)}</Text></View>
                  <View style={styles.totalRow}><Text style={styles.totalLabel}>{text.sabiService}</Text><Text style={styles.totalValue}>{formatSupermarketAmount(cart.checkout.sabiServiceFee)}</Text></View>
                  <View style={styles.totalRowStrong}><Text style={styles.totalStrongLabel}>{text.total}</Text><Text style={styles.totalStrongValue}>{formatSupermarketAmount(cart.checkout.total)}</Text></View>
                </View>

                {cart.checkoutNotice ? <Text style={styles.pendingNotice}>{cart.checkoutNotice}</Text> : null}

                <Pressable
                  disabled={checkoutDisabled}
                  onPress={() => cart.prepareCheckoutPreview(text.pendingOrder)}
                  style={[styles.prepareButton, checkoutDisabled ? styles.prepareButtonDisabled : null]}
                >
                  <Text style={styles.prepareButtonText}>{text.prepareOrder}</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7F3E8",
  },
  page: {
    flex: 1,
    backgroundColor: "#F7F3E8",
  },
  topGradient: {
    paddingHorizontal: 16,
    paddingBottom: 18,
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingBottom: 14,
  },
  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.24)",
  },
  headerTitleBlock: {
    flex: 1,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    marginTop: 3,
    color: "rgba(255,255,255,0.82)",
    fontSize: 12,
    fontWeight: "700",
  },
  addressCard: {
    minHeight: 70,
    borderRadius: 25,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.42)",
  },
  addressBody: {
    flex: 1,
  },
  addressLabel: {
    color: "#0F5132",
    fontSize: 12,
    fontWeight: "900",
  },
  addressInput: {
    marginTop: 2,
    padding: 0,
    color: "#183529",
    fontSize: 15,
    fontWeight: "800",
  },
  scroll: {
    flex: 1,
  },
  mapContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 34,
    gap: 14,
  },
  catalogContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 36,
    gap: 14,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchBox: {
    flex: 1,
    height: 52,
    borderRadius: 20,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(15,81,50,0.08)",
  },
  searchInput: {
    flex: 1,
    padding: 0,
    color: "#173327",
    fontSize: 14,
    fontWeight: "800",
  },
  filterIconBox: {
    width: 52,
    height: 52,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF7EF",
    borderWidth: 1,
    borderColor: "rgba(15,81,50,0.08)",
  },
  filtersRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
  },
  filterChip: {
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.86)",
    borderWidth: 1,
    borderColor: "rgba(15,81,50,0.08)",
  },
  filterChipActive: {
    backgroundColor: "#0F5132",
    borderColor: "#0F5132",
  },
  filterChipText: {
    color: "#486252",
    fontSize: 12,
    fontWeight: "900",
  },
  filterChipTextActive: {
    color: "#FFFFFF",
  },
  sectionHead: {
    marginTop: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: "#12251C",
    fontSize: 19,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    marginTop: 3,
    color: "#6A7F72",
    fontSize: 12,
    fontWeight: "700",
  },
  countPill: {
    minWidth: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF7EF",
  },
  countPillText: {
    color: "#0F5132",
    fontSize: 14,
    fontWeight: "900",
  },
  storeCardsRow: {
    gap: 12,
    paddingRight: 20,
  },
  storeCardWrap: {
    gap: 10,
  },
  openStoreButton: {
    height: 46,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0F5132",
  },
  openStoreButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },
  merchantAccessCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 27,
    padding: 15,
    backgroundColor: "rgba(255,255,255,0.86)",
    borderWidth: 1,
    borderColor: "rgba(15,81,50,0.08)",
  },
  merchantAccessIcon: {
    width: 44,
    height: 44,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF7EF",
  },
  merchantAccessBody: {
    flex: 1,
  },
  merchantAccessTitle: {
    color: "#12251C",
    fontSize: 14,
    fontWeight: "900",
  },
  merchantAccessText: {
    marginTop: 4,
    color: "#6A7F72",
    fontSize: 11,
    fontWeight: "700",
    lineHeight: 16,
  },
  storeHeroCard: {
    borderRadius: 30,
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(15,81,50,0.08)",
  },
  storeHeroTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  storeHeroIcon: {
    width: 56,
    height: 56,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF7EF",
  },
  storeHeroBody: {
    flex: 1,
  },
  storeHeroTitle: {
    color: "#12251C",
    fontSize: 19,
    fontWeight: "900",
  },
  storeHeroMeta: {
    marginTop: 4,
    color: "#6A7F72",
    fontSize: 12,
    fontWeight: "800",
  },
  ratingMini: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#EAF7EF",
  },
  ratingMiniText: {
    color: "#0F5132",
    fontSize: 12,
    fontWeight: "900",
  },
  storeStatsRow: {
    marginTop: 14,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  storeStatBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#F4F6EF",
  },
  storeStatText: {
    color: "#486252",
    fontSize: 11,
    fontWeight: "800",
  },
  catalogSearchBox: {
    height: 52,
    borderRadius: 20,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(15,81,50,0.08)",
  },
  defaultDepartmentNote: {
    color: "#0F5132",
    fontSize: 12,
    fontWeight: "900",
  },
  departmentsRow: {
    gap: 9,
    paddingRight: 20,
  },
  departmentPill: {
    minHeight: 43,
    paddingHorizontal: 14,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(15,81,50,0.08)",
  },
  departmentPillActive: {
    backgroundColor: "#0F5132",
    borderColor: "#0F5132",
  },
  departmentPillText: {
    color: "#486252",
    fontSize: 13,
    fontWeight: "900",
  },
  departmentPillTextActive: {
    color: "#FFFFFF",
  },
  productsGrid: {
    gap: 12,
  },
  productCard: {
    minHeight: 150,
    borderRadius: 28,
    padding: 13,
    flexDirection: "row",
    gap: 13,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(15,81,50,0.08)",
  },
  lockedProductCard: {
    backgroundColor: "#FFF8EC",
    borderColor: "rgba(138,91,24,0.18)",
  },
  productVisual: {
    width: 88,
    borderRadius: 24,
  },
  tone_green: { backgroundColor: "#DDF7E7" },
  tone_cream: { backgroundColor: "#F7EED7" },
  tone_blue: { backgroundColor: "#E1EEF9" },
  tone_amber: { backgroundColor: "#F8E5B7" },
  tone_rose: { backgroundColor: "#F7DCDC" },
  productBody: {
    flex: 1,
  },
  productTitle: {
    color: "#12251C",
    fontSize: 16,
    fontWeight: "900",
  },
  productSubtitle: {
    marginTop: 5,
    color: "#6A7F72",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 17,
  },
  productMetaRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },
  productPrice: {
    color: "#0F5132",
    fontSize: 17,
    fontWeight: "900",
  },
  productUnit: {
    color: "#7B8D82",
    fontSize: 11,
    fontWeight: "800",
  },
  productActionRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  stockText: {
    flex: 1,
    color: "#7B8D82",
    fontSize: 11,
    fontWeight: "800",
  },
  addButton: {
    height: 38,
    paddingHorizontal: 12,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    backgroundColor: "#0F5132",
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },
  quantityBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 8,
    height: 38,
    borderRadius: 15,
    backgroundColor: "#EAF7EF",
  },
  quantityButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  quantityText: {
    color: "#0F5132",
    fontSize: 13,
    fontWeight: "900",
  },
  lockedBox: {
    marginTop: 10,
    flexDirection: "row",
    gap: 8,
    borderRadius: 16,
    padding: 10,
    backgroundColor: "rgba(255,255,255,0.65)",
  },
  lockedCopy: {
    flex: 1,
  },
  lockedTitle: {
    color: "#8A5B18",
    fontSize: 12,
    fontWeight: "900",
  },
  lockedText: {
    marginTop: 2,
    color: "#8A744C",
    fontSize: 10,
    fontWeight: "700",
    lineHeight: 14,
  },
  cartCard: {
    borderRadius: 30,
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(15,81,50,0.08)",
  },
  cartHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  cartTitle: {
    color: "#12251C",
    fontSize: 19,
    fontWeight: "900",
  },
  cartSubtitle: {
    marginTop: 3,
    color: "#6A7F72",
    fontSize: 12,
    fontWeight: "700",
  },
  cartIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 18,
    backgroundColor: "#EAF7EF",
    alignItems: "center",
    justifyContent: "center",
  },
  cartLine: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(15,81,50,0.08)",
  },
  cartLineTitle: {
    flex: 1,
    color: "#12251C",
    fontSize: 13,
    fontWeight: "800",
  },
  cartLineMeta: {
    color: "#6A7F72",
    fontSize: 11,
    fontWeight: "700",
  },
  cartLineTotal: {
    color: "#0F5132",
    fontSize: 12,
    fontWeight: "900",
  },
  checkoutBlock: {
    marginTop: 14,
    gap: 10,
  },
  checkoutLabel: {
    color: "#12251C",
    fontSize: 12,
    fontWeight: "900",
  },
  checkoutInput: {
    minHeight: 48,
    borderRadius: 18,
    paddingHorizontal: 13,
    color: "#173327",
    fontSize: 13,
    fontWeight: "800",
    backgroundColor: "#F5F7F1",
  },
  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionChip: {
    minHeight: 40,
    paddingHorizontal: 12,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F5F7F1",
  },
  optionChipActive: {
    backgroundColor: "#0F5132",
  },
  optionChipText: {
    color: "#486252",
    fontSize: 12,
    fontWeight: "900",
  },
  optionChipTextActive: {
    color: "#FFFFFF",
  },
  totalRows: {
    marginTop: 6,
    borderRadius: 22,
    padding: 13,
    gap: 8,
    backgroundColor: "#F7F3E8",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  totalLabel: {
    color: "#607869",
    fontSize: 12,
    fontWeight: "800",
  },
  totalValue: {
    color: "#12251C",
    fontSize: 12,
    fontWeight: "900",
  },
  totalRowStrong: {
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(15,81,50,0.10)",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  totalStrongLabel: {
    color: "#12251C",
    fontSize: 15,
    fontWeight: "900",
  },
  totalStrongValue: {
    color: "#0F5132",
    fontSize: 16,
    fontWeight: "900",
  },
  pendingNotice: {
    borderRadius: 18,
    padding: 12,
    color: "#7A5A12",
    backgroundColor: "#FFF6D8",
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 17,
  },
  prepareButton: {
    minHeight: 52,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0F5132",
  },
  prepareButtonDisabled: {
    backgroundColor: "#B4C7BA",
  },
  prepareButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
});
