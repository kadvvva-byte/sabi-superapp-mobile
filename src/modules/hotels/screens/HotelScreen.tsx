import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  ArrowLeft,
  BedDouble,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  MapPin,
  MessageCircle,
  Minus,
  Plus,
  QrCode,
  Radio,
  Search,
  ShieldCheck,
  UserRound,
  Users,
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
  buildHotelBookingGate,
  findHotelProperty,
  findHotelRoom,
  getHotelProperties,
  getHotelStayTypes,
  searchHotelProperties,
} from "../application/hotel.service";
import type { HotelPhotoKey, HotelProperty, HotelPropertyId, HotelRoomId, HotelStayType, HotelTab } from "../domain/hotel.types";
import { hotelAmenityLabel, hotelStayTypeLabel, resolveHotelLocale, tHotel } from "../presentation/hotel.i18n";
import { useI18n } from "../../../shared/i18n";

const BACKGROUND = "#FFF8EA";
const CARD = "rgba(255, 253, 247, 0.96)";
const CARD_STRONG = "#FFFDF7";
const INK = "#22170C";
const MUTED = "#7B6443";
const GOLD = "#D6A037";
const DEEP_GOLD = "#A66C1A";
const BORDER = "rgba(154, 105, 35, 0.18)";

const HOTEL_IMAGES: Record<HotelPhotoKey, number> = {
  city_hotel: require("../../../../assets/images/hotels/city_hotel.png"),
  lobby: require("../../../../assets/images/hotels/lobby.png"),
  business_room: require("../../../../assets/images/hotels/business_room.png"),
  suite_room: require("../../../../assets/images/hotels/suite_room.png"),
  family_room: require("../../../../assets/images/hotels/family_room.png"),
  resort: require("../../../../assets/images/hotels/resort.png"),
  boutique: require("../../../../assets/images/hotels/boutique.png"),
  mountain_lodge: require("../../../../assets/images/hotels/mountain_lodge.png"),
};

const NAV_TABS: Array<{ id: HotelTab; icon: typeof Building2; labelKey: string }> = [
  { id: "home", icon: Building2, labelKey: "nav.home" },
  { id: "search", icon: Search, labelKey: "nav.search" },
  { id: "request", icon: BedDouble, labelKey: "nav.request" },
  { id: "profile", icon: UserRound, labelKey: "nav.profile" },
];

function statusKey(status: HotelProperty["approvalStatus"]) {
  if (status === "approved") return "status.approved";
  if (status === "pending") return "status.pending";
  return "status.provider_pending";
}

export default function HotelScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { language } = useI18n();
  const locale = resolveHotelLocale(language);
  const t = (key: string) => tHotel(key, locale);
  const hotels = useMemo(() => getHotelProperties(), []);
  const stayTypes = useMemo(() => getHotelStayTypes(), []);
  const cardWidth = Math.min(320, Math.max(260, width * 0.72));

  const [activeTab, setActiveTab] = useState<HotelTab>("home");
  const [cityQuery, setCityQuery] = useState("");
  const [datesLabel, setDatesLabel] = useState(t("hero.date"));
  const [guests, setGuests] = useState(2);
  const [rooms, setRooms] = useState(1);
  const [stayType, setStayType] = useState<HotelStayType | "all">("all");
  const [selectedHotelId, setSelectedHotelId] = useState<HotelPropertyId | null>(hotels[0]?.id ?? null);
  const [selectedRoomId, setSelectedRoomId] = useState<HotelRoomId | null>(hotels[0]?.rooms[0]?.id ?? null);
  const [selectedHotelForModal, setSelectedHotelForModal] = useState<HotelProperty | null>(null);
  const [notice, setNotice] = useState(t("notice.noFakeBooking"));

  const filteredHotels = useMemo(
    () =>
      searchHotelProperties({
        cityQuery,
        datesLabel,
        guests,
        rooms,
        stayType,
      }),
    [cityQuery, datesLabel, guests, rooms, stayType],
  );

  const selectedHotel = findHotelProperty(selectedHotelId) ?? hotels[0];
  const selectedRoom = findHotelRoom(selectedHotel, selectedRoomId) ?? selectedHotel?.rooms[0];
  const gate = buildHotelBookingGate(selectedHotel);

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

  const chooseHotel = (hotel: HotelProperty) => {
    setSelectedHotelId(hotel.id);
    setSelectedRoomId(hotel.rooms[0]?.id ?? null);
    setSelectedHotelForModal(hotel);
  };

  const addRoomToRequest = (hotel: HotelProperty, roomId: HotelRoomId) => {
    setSelectedHotelId(hotel.id);
    setSelectedRoomId(roomId);
    setActiveTab("request");
    setSelectedHotelForModal(null);
    setNotice(t("notice.noFakeBooking"));
  };

  const adjustGuests = (delta: number) => setGuests((value) => Math.max(1, Math.min(12, value + delta)));
  const adjustRooms = (delta: number) => setRooms((value) => Math.max(1, Math.min(6, value + delta)));

  const renderHeader = () => (
    <LinearGradient colors={["#F8DFA6", "#FFF8EA"]} style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}> 
      <View style={styles.headerCircleLeft} />
      <View style={styles.headerCircleRight} />
      <Pressable onPress={goBack} style={styles.headerButton}>
        <ArrowLeft size={24} color={INK} />
      </Pressable>
      <View style={styles.headerTitleWrap}>
        <Text style={styles.headerTitle}>{t("brand.title")}</Text>
        <Text style={styles.headerSubtitle}>{t("brand.subtitle")}</Text>
      </View>
      <Pressable style={styles.headerButtonGold} onPress={() => openRoute("/qr")}> 
        <QrCode size={21} color="#FFFFFF" />
      </Pressable>
    </LinearGradient>
  );

  const renderSearchBox = () => (
    <View style={styles.searchBox}>
      <Search size={18} color={DEEP_GOLD} />
      <TextInput
        value={cityQuery}
        onChangeText={setCityQuery}
        placeholder={t("hero.search")}
        placeholderTextColor="rgba(104,79,43,0.55)"
        style={styles.searchInput}
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  );

  const renderMiniControls = () => (
    <View style={styles.controlsGrid}>
      <Pressable onPress={() => setDatesLabel(t("hero.date"))} style={styles.controlCard}>
        <CalendarDays size={18} color={DEEP_GOLD} />
        <Text style={styles.controlLabel}>{t("hero.date")}</Text>
        <Text style={styles.controlValue}>{datesLabel}</Text>
      </Pressable>

      <View style={styles.controlCard}>
        <Users size={18} color={DEEP_GOLD} />
        <Text style={styles.controlLabel}>{t("hero.guests")}</Text>
        <View style={styles.stepperRow}>
          <Pressable onPress={() => adjustGuests(-1)} style={styles.stepperButton}><Minus size={14} color={INK} /></Pressable>
          <Text style={styles.stepperValue}>{guests}</Text>
          <Pressable onPress={() => adjustGuests(1)} style={styles.stepperButton}><Plus size={14} color={INK} /></Pressable>
        </View>
      </View>

      <View style={styles.controlCard}>
        <BedDouble size={18} color={DEEP_GOLD} />
        <Text style={styles.controlLabel}>{t("hero.rooms")}</Text>
        <View style={styles.stepperRow}>
          <Pressable onPress={() => adjustRooms(-1)} style={styles.stepperButton}><Minus size={14} color={INK} /></Pressable>
          <Text style={styles.stepperValue}>{rooms}</Text>
          <Pressable onPress={() => adjustRooms(1)} style={styles.stepperButton}><Plus size={14} color={INK} /></Pressable>
        </View>
      </View>
    </View>
  );

  const renderStayTypeTabs = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typeTabs}>
      {stayTypes.map((type) => {
        const active = stayType === type;
        return (
          <Pressable key={type} onPress={() => setStayType(type)} style={[styles.typeTab, active && styles.typeTabActive]}>
            <Text style={[styles.typeTabText, active && styles.typeTabTextActive]}>{hotelStayTypeLabel(type, locale)}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );

  const renderHotelCard = (hotel: HotelProperty, compact = false) => (
    <Pressable key={hotel.id} onPress={() => chooseHotel(hotel)} style={[styles.hotelCard, compact && styles.hotelCardCompact, { width: compact ? "100%" : cardWidth }]}> 
      <Image source={HOTEL_IMAGES[hotel.heroPhotoKey]} style={styles.hotelImage} resizeMode="cover" />
      <LinearGradient colors={["rgba(16,11,5,0.02)", "rgba(16,11,5,0.42)"]} style={styles.hotelImageOverlay} />
      <View style={styles.statusPill}>
        <ShieldCheck size={13} color={hotel.approvalStatus === "approved" ? "#2F7B48" : DEEP_GOLD} />
        <Text style={styles.statusPillText}>{t(statusKey(hotel.approvalStatus))}</Text>
      </View>
      <View style={styles.hotelInfo}>
        <Text style={styles.hotelTitle} numberOfLines={1}>{t(hotel.titleKey)}</Text>
        <View style={styles.hotelMetaRow}>
          <MapPin size={13} color={MUTED} />
          <Text style={styles.hotelMeta} numberOfLines={1}>{t(hotel.cityKey)} · {t(hotel.areaKey)} · {t(hotel.distanceLabelKey)}</Text>
        </View>
        <View style={styles.hotelBottomRow}>
          <Text style={styles.ratingText}>{t("label.rating")} {hotel.ratingLabel}</Text>
          <Text style={styles.priceText}>{t("label.fromHotel")}</Text>
        </View>
      </View>
    </Pressable>
  );

  const renderHome = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <View style={styles.heroCard}>
        <LinearGradient colors={["#FFF6DE", "#FFFFFF"]} style={styles.heroInner}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroIconWrap}><Building2 size={25} color="#FFFFFF" /></View>
            <View style={styles.heroBadge}><Text style={styles.heroBadgeText}>Sabi Travel</Text></View>
          </View>
          <Text style={styles.heroTitle}>{t("hero.title")}</Text>
          <Text style={styles.heroDescription}>{t("hero.description")}</Text>
          {renderSearchBox()}
          {renderMiniControls()}
        </LinearGradient>
      </View>

      {renderStayTypeTabs()}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t("section.recommended")}</Text>
        <Text style={styles.sectionCount}>{filteredHotels.length}</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalHotels}>
        {filteredHotels.map((hotel) => renderHotelCard(hotel))}
      </ScrollView>

      <View style={styles.integrationCard}>
        <Text style={styles.sectionTitle}>{t("section.integration")}</Text>
        {["integration.wallet", "integration.business", "integration.admin", "integration.map", "integration.qr"].map((key) => (
          <View key={key} style={styles.integrationRow}>
            <CheckCircle2 size={16} color={DEEP_GOLD} />
            <Text style={styles.integrationText}>{t(key)}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderSearchTab = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      {renderSearchBox()}
      {renderMiniControls()}
      {renderStayTypeTabs()}
      <View style={styles.fakeMapCard}>
        <LinearGradient colors={["#F6E3B7", "#FFFDF6"]} style={styles.fakeMapInner}>
          <MapPin size={28} color={DEEP_GOLD} />
          <Text style={styles.fakeMapTitle}>{t("section.map")}</Text>
          <Text style={styles.fakeMapText}>{t("integration.map")}</Text>
        </LinearGradient>
      </View>
      {filteredHotels.map((hotel) => renderHotelCard(hotel, true))}
    </ScrollView>
  );

  const renderRequestTab = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <View style={styles.requestCard}>
        <Text style={styles.sectionTitle}>{t("section.request")}</Text>
        <Text style={styles.requestNotice}>{notice}</Text>
        {selectedHotel ? (
          <View style={styles.requestHotelRow}>
            <Image source={HOTEL_IMAGES[selectedHotel.heroPhotoKey]} style={styles.requestImage} />
            <View style={styles.requestInfo}>
              <Text style={styles.requestHotelTitle}>{t(selectedHotel.titleKey)}</Text>
              <Text style={styles.requestMeta}>{t(selectedHotel.cityKey)} · {t(selectedHotel.areaKey)}</Text>
              <Text style={styles.requestMeta}>{selectedRoom ? t(selectedRoom.titleKey) : t("gate.selectHotel")}</Text>
            </View>
          </View>
        ) : null}

        <View style={styles.requestGrid}>
          <View style={styles.requestMiniCard}><Text style={styles.controlLabel}>{t("hero.guests")}</Text><Text style={styles.requestValue}>{guests}</Text></View>
          <View style={styles.requestMiniCard}><Text style={styles.controlLabel}>{t("hero.rooms")}</Text><Text style={styles.requestValue}>{rooms}</Text></View>
          <View style={styles.requestMiniCard}><Text style={styles.controlLabel}>{t("hero.date")}</Text><Text style={styles.requestValue}>{datesLabel}</Text></View>
        </View>

        <View style={styles.gateCard}>
          <ShieldCheck size={20} color={DEEP_GOLD} />
          <View style={styles.gateTextWrap}>
            <Text style={styles.gateTitle}>{t("gate.title")}</Text>
            <Text style={styles.gateDescription}>{t(gate.blockedReasonKey)}</Text>
          </View>
        </View>

        <Pressable onPress={() => setNotice(t("notice.requestPrepared"))} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>{t("button.prepare")}</Text>
          <ChevronRight size={18} color="#FFFFFF" />
        </Pressable>
        <Pressable onPress={() => selectedHotel && openRoute(selectedHotel.messengerRoute)} style={styles.secondaryButton}>
          <MessageCircle size={18} color={DEEP_GOLD} />
          <Text style={styles.secondaryButtonText}>{t("button.messenger")}</Text>
        </Pressable>
        <Pressable onPress={() => openRoute("/wallet" as never)} style={styles.secondaryButton}>
          <WalletCards size={18} color={DEEP_GOLD} />
          <Text style={styles.secondaryButtonText}>{t("button.wallet")}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );

  const renderProfileTab = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <View style={styles.profileCard}>
        <View style={styles.profileIcon}><UserRound size={28} color="#FFFFFF" /></View>
        <Text style={styles.sectionTitle}>{t("nav.profile")}</Text>
        <Text style={styles.profileText}>{t("profile.note")}</Text>
        <Pressable onPress={() => openRoute("/profile")} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>{t("button.profile")}</Text>
          <ChevronRight size={18} color="#FFFFFF" />
        </Pressable>
        <Pressable onPress={() => openRoute("/business")} style={styles.secondaryButton}>
          <BriefcaseBusiness size={18} color={DEEP_GOLD} />
          <Text style={styles.secondaryButtonText}>{t("integration.business")}</Text>
        </Pressable>
        <Pressable onPress={() => openRoute("/stream")} style={styles.secondaryButton}>
          <Radio size={18} color={DEEP_GOLD} />
          <Text style={styles.secondaryButtonText}>{t("button.stream")}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );

  const renderRoomCard = (hotel: HotelProperty, room: HotelProperty["rooms"][number]) => (
    <View key={room.id} style={styles.roomCard}>
      <Image source={HOTEL_IMAGES[room.photoKey]} style={styles.roomImage} resizeMode="cover" />
      <View style={styles.roomBody}>
        <Text style={styles.roomTitle}>{t(room.titleKey)}</Text>
        <Text style={styles.roomSubtitle}>{t(room.subtitleKey)}</Text>
        <View style={styles.roomMetaRow}>
          <Users size={14} color={MUTED} />
          <Text style={styles.roomMeta}>{room.capacityAdults} {t("label.adults")} · {room.capacityChildren} {t("label.children")}</Text>
        </View>
        <Text style={styles.roomTerms}>{t(room.bedKey)} · {t(room.priceKey)}</Text>
        <Pressable onPress={() => addRoomToRequest(hotel, room.id)} style={styles.roomButton}>
          <Text style={styles.roomButtonText}>{t("button.addRequest")}</Text>
        </Pressable>
      </View>
    </View>
  );

  const renderHotelModal = () => {
    const hotel = selectedHotelForModal;
    return (
      <Modal visible={Boolean(hotel)} animationType="slide" transparent onRequestClose={() => setSelectedHotelForModal(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            {hotel ? (
              <>
                <Image source={HOTEL_IMAGES[hotel.heroPhotoKey]} style={styles.modalHero} resizeMode="cover" />
                <View style={styles.modalBody}>
                  <View style={styles.modalTitleRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.modalTitle}>{t(hotel.titleKey)}</Text>
                      <Text style={styles.modalMeta}>{t(hotel.cityKey)} · {t(hotel.areaKey)} · {t(hotel.travelTimeKey)}</Text>
                    </View>
                    <Pressable onPress={() => setSelectedHotelForModal(null)} style={styles.modalClose}>
                      <Text style={styles.modalCloseText}>×</Text>
                    </Pressable>
                  </View>
                  <View style={styles.amenityWrap}>
                    {hotel.amenities.map((item) => (
                      <View key={item} style={styles.amenityPill}>
                        <Text style={styles.amenityText}>{hotelAmenityLabel(item, locale)}</Text>
                      </View>
                    ))}
                  </View>
                  <Text style={styles.sectionTitle}>{t("section.rooms")}</Text>
                  <ScrollView style={styles.roomsScroll} showsVerticalScrollIndicator={false}>
                    {hotel.rooms.map((room) => renderRoomCard(hotel, room))}
                    <View style={{ height: 20 }} />
                  </ScrollView>
                </View>
              </>
            ) : null}
          </View>
        </View>
      </Modal>
    );
  };

  const renderContent = () => {
    if (activeTab === "search") return renderSearchTab();
    if (activeTab === "request") return renderRequestTab();
    if (activeTab === "profile") return renderProfileTab();
    return renderHome();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right"]}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.screen}>
        {renderHeader()}
        <View style={styles.content}>{renderContent()}</View>
        <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, 12) }]}> 
          {NAV_TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <Pressable key={tab.id} onPress={() => setActiveTab(tab.id)} style={[styles.navItem, active && styles.navItemActive]}>
                <Icon size={20} color={active ? INK : MUTED} />
                <Text style={[styles.navText, active && styles.navTextActive]}>{t(tab.labelKey)}</Text>
              </Pressable>
            );
          })}
        </View>
        {renderHotelModal()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BACKGROUND },
  screen: { flex: 1, backgroundColor: BACKGROUND },
  header: {
    minHeight: 154,
    paddingHorizontal: 20,
    paddingBottom: 26,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomLeftRadius: 42,
    borderBottomRightRadius: 42,
    overflow: "hidden",
  },
  headerCircleLeft: { position: "absolute", left: -100, bottom: -120, width: 280, height: 280, borderRadius: 140, backgroundColor: "rgba(255,255,255,0.45)" },
  headerCircleRight: { position: "absolute", right: -120, top: -120, width: 310, height: 310, borderRadius: 155, backgroundColor: "rgba(255,255,255,0.28)" },
  headerButton: { width: 56, height: 56, borderRadius: 28, backgroundColor: "rgba(255,255,255,0.82)", alignItems: "center", justifyContent: "center" },
  headerButtonGold: { width: 56, height: 56, borderRadius: 28, backgroundColor: GOLD, alignItems: "center", justifyContent: "center", shadowColor: GOLD, shadowOpacity: 0.28, shadowRadius: 14, elevation: 4 },
  headerTitleWrap: { flex: 1, alignItems: "center", paddingHorizontal: 10 },
  headerTitle: { color: INK, fontSize: 28, fontWeight: "900", letterSpacing: 0.2 },
  headerSubtitle: { marginTop: 4, color: MUTED, fontSize: 13, fontWeight: "800" },
  content: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 132 },
  heroCard: { borderRadius: 34, borderWidth: 1, borderColor: BORDER, backgroundColor: CARD, overflow: "hidden", shadowColor: "#8E5D19", shadowOpacity: 0.12, shadowRadius: 22, elevation: 4 },
  heroInner: { padding: 18 },
  heroTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  heroIconWrap: { width: 52, height: 52, borderRadius: 20, backgroundColor: GOLD, alignItems: "center", justifyContent: "center" },
  heroBadge: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: "rgba(214,160,55,0.16)", borderWidth: 1, borderColor: BORDER },
  heroBadgeText: { color: DEEP_GOLD, fontWeight: "900", fontSize: 12 },
  heroTitle: { marginTop: 16, color: INK, fontSize: 24, fontWeight: "900", lineHeight: 30 },
  heroDescription: { marginTop: 10, color: MUTED, fontSize: 14, fontWeight: "700", lineHeight: 21 },
  searchBox: { minHeight: 54, paddingHorizontal: 16, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.88)", borderWidth: 1, borderColor: BORDER, flexDirection: "row", alignItems: "center", gap: 10, marginTop: 14 },
  searchInput: { flex: 1, color: INK, fontSize: 15, fontWeight: "800" },
  controlsGrid: { marginTop: 12, flexDirection: "row", gap: 10 },
  controlCard: { flex: 1, minHeight: 92, padding: 11, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.72)", borderWidth: 1, borderColor: BORDER },
  controlLabel: { color: MUTED, fontSize: 11, fontWeight: "900" },
  controlValue: { marginTop: 10, color: INK, fontSize: 13, fontWeight: "900" },
  stepperRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 9 },
  stepperButton: { width: 28, height: 28, borderRadius: 14, backgroundColor: "rgba(214,160,55,0.18)", alignItems: "center", justifyContent: "center" },
  stepperValue: { color: INK, fontSize: 18, fontWeight: "900" },
  typeTabs: { gap: 9, paddingTop: 16, paddingBottom: 8 },
  typeTab: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999, backgroundColor: CARD_STRONG, borderWidth: 1, borderColor: BORDER },
  typeTabActive: { backgroundColor: GOLD, borderColor: GOLD },
  typeTabText: { color: MUTED, fontSize: 13, fontWeight: "900" },
  typeTabTextActive: { color: "#FFFFFF" },
  sectionHeader: { marginTop: 12, marginBottom: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionTitle: { color: INK, fontSize: 21, fontWeight: "900" },
  sectionCount: { color: DEEP_GOLD, fontWeight: "900", paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: "rgba(214,160,55,0.14)" },
  horizontalHotels: { gap: 14, paddingRight: 20, paddingBottom: 10 },
  hotelCard: { height: 304, borderRadius: 32, backgroundColor: CARD_STRONG, overflow: "hidden", borderWidth: 1, borderColor: BORDER, marginBottom: 14, shadowColor: "#8E5D19", shadowOpacity: 0.10, shadowRadius: 18, elevation: 3 },
  hotelCardCompact: { height: 286 },
  hotelImage: { width: "100%", height: 176 },
  hotelImageOverlay: { position: "absolute", top: 0, left: 0, right: 0, height: 176 },
  statusPill: { position: "absolute", top: 12, right: 12, flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.88)" },
  statusPillText: { color: INK, fontSize: 10, fontWeight: "900" },
  hotelInfo: { padding: 14 },
  hotelTitle: { color: INK, fontSize: 18, fontWeight: "900" },
  hotelMetaRow: { marginTop: 7, flexDirection: "row", alignItems: "center", gap: 5 },
  hotelMeta: { flex: 1, color: MUTED, fontSize: 12, fontWeight: "800" },
  hotelBottomRow: { marginTop: 13, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  ratingText: { color: DEEP_GOLD, fontSize: 12, fontWeight: "900" },
  priceText: { color: INK, fontSize: 12, fontWeight: "900" },
  integrationCard: { marginTop: 16, padding: 16, borderRadius: 28, backgroundColor: CARD_STRONG, borderWidth: 1, borderColor: BORDER },
  integrationRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 12 },
  integrationText: { flex: 1, color: MUTED, fontSize: 13, fontWeight: "800", lineHeight: 18 },
  fakeMapCard: { marginTop: 16, marginBottom: 14, borderRadius: 30, overflow: "hidden", borderWidth: 1, borderColor: BORDER },
  fakeMapInner: { minHeight: 156, padding: 18, justifyContent: "center", alignItems: "center" },
  fakeMapTitle: { marginTop: 8, color: INK, fontSize: 20, fontWeight: "900" },
  fakeMapText: { marginTop: 6, color: MUTED, textAlign: "center", fontWeight: "800" },
  requestCard: { padding: 16, borderRadius: 32, backgroundColor: CARD_STRONG, borderWidth: 1, borderColor: BORDER },
  requestNotice: { marginTop: 10, color: MUTED, fontSize: 13, fontWeight: "800", lineHeight: 19 },
  requestHotelRow: { marginTop: 16, flexDirection: "row", gap: 12, alignItems: "center" },
  requestImage: { width: 92, height: 74, borderRadius: 20, backgroundColor: "#F2E2BD" },
  requestInfo: { flex: 1 },
  requestHotelTitle: { color: INK, fontSize: 16, fontWeight: "900" },
  requestMeta: { marginTop: 4, color: MUTED, fontSize: 12, fontWeight: "800" },
  requestGrid: { flexDirection: "row", gap: 10, marginTop: 16 },
  requestMiniCard: { flex: 1, minHeight: 74, padding: 11, borderRadius: 20, backgroundColor: "rgba(214,160,55,0.10)" },
  requestValue: { marginTop: 10, color: INK, fontSize: 15, fontWeight: "900" },
  gateCard: { marginTop: 16, padding: 14, borderRadius: 24, backgroundColor: "rgba(214,160,55,0.12)", borderWidth: 1, borderColor: BORDER, flexDirection: "row", gap: 12 },
  gateTextWrap: { flex: 1 },
  gateTitle: { color: INK, fontSize: 15, fontWeight: "900" },
  gateDescription: { marginTop: 4, color: MUTED, fontSize: 12, fontWeight: "800", lineHeight: 18 },
  primaryButton: { marginTop: 16, minHeight: 54, borderRadius: 22, backgroundColor: GOLD, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8, shadowColor: GOLD, shadowOpacity: 0.24, shadowRadius: 14, elevation: 3 },
  primaryButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "900" },
  secondaryButton: { marginTop: 10, minHeight: 52, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.84)", borderWidth: 1, borderColor: BORDER, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 },
  secondaryButtonText: { color: INK, fontSize: 14, fontWeight: "900" },
  profileCard: { padding: 18, borderRadius: 32, backgroundColor: CARD_STRONG, borderWidth: 1, borderColor: BORDER, alignItems: "center" },
  profileIcon: { width: 66, height: 66, borderRadius: 24, backgroundColor: GOLD, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  profileText: { color: MUTED, textAlign: "center", fontSize: 14, fontWeight: "800", lineHeight: 21, marginTop: 8 },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(20,12,4,0.34)", justifyContent: "flex-end" },
  modalCard: { maxHeight: "92%", backgroundColor: BACKGROUND, borderTopLeftRadius: 36, borderTopRightRadius: 36, overflow: "hidden" },
  modalHero: { height: 220, width: "100%" },
  modalBody: { padding: 18 },
  modalTitleRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  modalTitle: { color: INK, fontSize: 22, fontWeight: "900" },
  modalMeta: { marginTop: 6, color: MUTED, fontSize: 13, fontWeight: "800" },
  modalClose: { width: 38, height: 38, borderRadius: 19, backgroundColor: "rgba(255,255,255,0.9)", alignItems: "center", justifyContent: "center" },
  modalCloseText: { color: INK, fontSize: 24, fontWeight: "800", marginTop: -2 },
  amenityWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 14, marginBottom: 16 },
  amenityPill: { paddingHorizontal: 11, paddingVertical: 7, borderRadius: 999, backgroundColor: "rgba(214,160,55,0.12)", borderWidth: 1, borderColor: BORDER },
  amenityText: { color: DEEP_GOLD, fontSize: 12, fontWeight: "900" },
  roomsScroll: { maxHeight: 390, marginTop: 12 },
  roomCard: { backgroundColor: CARD_STRONG, borderWidth: 1, borderColor: BORDER, borderRadius: 26, marginBottom: 12, overflow: "hidden" },
  roomImage: { width: "100%", height: 136 },
  roomBody: { padding: 14 },
  roomTitle: { color: INK, fontSize: 17, fontWeight: "900" },
  roomSubtitle: { marginTop: 5, color: MUTED, fontSize: 12, fontWeight: "800" },
  roomMetaRow: { marginTop: 9, flexDirection: "row", alignItems: "center", gap: 6 },
  roomMeta: { color: MUTED, fontSize: 12, fontWeight: "800" },
  roomTerms: { marginTop: 8, color: INK, fontSize: 12, fontWeight: "900" },
  roomButton: { marginTop: 12, minHeight: 44, borderRadius: 18, backgroundColor: GOLD, alignItems: "center", justifyContent: "center" },
  roomButtonText: { color: "#FFFFFF", fontWeight: "900" },
  bottomNav: { position: "absolute", left: 16, right: 16, bottom: 0, minHeight: 86, borderRadius: 32, backgroundColor: "rgba(255,253,246,0.96)", borderWidth: 1, borderColor: BORDER, flexDirection: "row", alignItems: "center", justifyContent: "space-around", paddingTop: 10, shadowColor: "#8E5D19", shadowOpacity: 0.14, shadowRadius: 22, elevation: 8 },
  navItem: { flex: 1, minHeight: 56, alignItems: "center", justifyContent: "center", borderRadius: 24, gap: 4 },
  navItemActive: { backgroundColor: "rgba(214,160,55,0.18)" },
  navText: { color: MUTED, fontSize: 11, fontWeight: "900" },
  navTextActive: { color: INK },
});
