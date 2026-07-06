import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Constants from "expo-constants";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { SafeAreaView } from "react-native-safe-area-context";
import { taxiCopy, type TaxiLang } from "../i18n/taxiClientI18n25";
import { approvedTaxiScreenCopy } from "../i18n/taxiClientApprovedScreenI18n25";
import TaxiProgramEntryScreen from "./TaxiProgramEntryScreen";
import type { TaxiClientScreen } from "../architecture/taxiClientScreenState";
import { getSabiGlobalProfileLanguage, subscribeSabiGlobalProfileLanguage } from "../../../shared/profile/sabiGlobalProfileLanguage";

type Coordinate = {
  latitude: number;
  longitude: number;
};

type MapMode = "scheme" | "real" | "3d";
type TariffId = "standard" | "comfort" | "business";

const DEFAULT_MAP_CENTER: Coordinate = {
  latitude: 41.311081,
  longitude: 69.240562,
};

function formatMoney(value: number) {
  return `${Math.round(value).toLocaleString("ru-RU").replace(/,/g, " ")} UZS`;
}

function OptionPill({ title, active, onPress }: { title: string; active?: boolean; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.optionPill, active ? styles.optionPillActive : null]}>
      <Text style={[styles.optionPillText, active ? styles.optionPillTextActive : null]}>{title}</Text>
    </Pressable>
  );
}

export default function TaxiScreen() {
  const [lang, setLang] = useState<TaxiLang>(() => getSabiGlobalProfileLanguage() as TaxiLang);
  const baseCopy = taxiCopy[lang] ?? taxiCopy.ru;
  const screenCopy = approvedTaxiScreenCopy[lang] ?? approvedTaxiScreenCopy.ru;

  const googleMapsKey =
    (Constants.expoConfig?.extra?.googleMapsApiKey as string | undefined) ||
    process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ||
    "";

  const [screen, setScreen] = useState<TaxiClientScreen>("program_entry");
  const [current, setCurrent] = useState<Coordinate | null>(null);
  const [mapMode, setMapMode] = useState<MapMode>("scheme");
  const [fromText, setFromText] = useState(baseCopy.currentLocation);
  const [toText, setToText] = useState("");
  const [selectedTariff, setSelectedTariff] = useState<TariffId>("standard");
  const [preferences, setPreferences] = useState({
    passengers: 1,
    luggage: 0,
    childSeat: false,
    pets: false,
    quietRide: false,
  });

  useEffect(() => {
    return subscribeSabiGlobalProfileLanguage((nextLanguage) => {
      if (taxiCopy[nextLanguage as TaxiLang]) setLang(nextLanguage as TaxiLang);
    });
  }, []);

  useEffect(() => {
    setFromText(baseCopy.currentLocation);
  }, [baseCopy.currentLocation]);

  useEffect(() => {
    let alive = true;

    async function loadLocation() {
      try {
        const permission = await Location.requestForegroundPermissionsAsync();
        const position =
          permission.status === "granted"
            ? await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High })
            : await Location.getLastKnownPositionAsync();

        if (!alive || !position) return;

        setCurrent({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      } catch {
        if (!alive) return;
      }
    }

    loadLocation();

    return () => {
      alive = false;
    };
  }, []);

  const staticMapUrl = useMemo(() => {
    if (!googleMapsKey) return "";

    const center = current ?? DEFAULT_MAP_CENTER;
    const params = [
      `center=${center.latitude},${center.longitude}`,
      "zoom=15",
      "size=640x640",
      "scale=2",
      mapMode === "real" ? "maptype=satellite" : "maptype=roadmap",
      `markers=${encodeURIComponent(`color:green|label:A|${center.latitude},${center.longitude}`)}`,
      `key=${encodeURIComponent(googleMapsKey)}`,
    ];

    return `https://maps.googleapis.com/maps/api/staticmap?${params.join("&")}`;
  }, [current, googleMapsKey, mapMode]);

  const tariffs = [
    { id: "standard" as const, title: screenCopy.taxiStandard, price: 18000, eta: "3" },
    { id: "comfort" as const, title: screenCopy.taxiComfort, price: 28000, eta: "4" },
    { id: "business" as const, title: screenCopy.taxiBusiness, price: 52000, eta: "5" },
  ];

  const activeTariff = tariffs.find((item) => item.id === selectedTariff) ?? tariffs[0];

  function goHome() {
    setScreen("program_entry");
  }

  function openTaxiClient() {
    setScreen("entry_home");
  }

  function renderHeader() {
    return (
      <View style={styles.topBar}>
        <Pressable onPress={goHome} style={styles.brandRow}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>S</Text>
          </View>
          <Text style={styles.brandWhite}>Sabi</Text>
          <Text style={styles.brandGreen}> Taxi</Text>
        </Pressable>

        <View style={styles.topActions}>
          <Pressable onPress={() => setScreen("saved_addresses")} style={styles.circleButton}>
            <Text style={styles.circleIcon}>☆</Text>
          </Pressable>
          <Pressable onPress={() => setScreen("ride_preferences")} style={styles.circleButton}>
            <Text style={styles.circleIcon}>☰</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  function renderMapModes() {
    return (
      <View style={styles.modeSegment}>
        <OptionPill title={screenCopy.mapScheme} active={mapMode === "scheme"} onPress={() => setMapMode("scheme")} />
        <OptionPill title={screenCopy.mapReal} active={mapMode === "real"} onPress={() => setMapMode("real")} />
        <OptionPill title={screenCopy.map3d} active={mapMode === "3d"} onPress={() => setMapMode("3d")} />
      </View>
    );
  }

  function renderMap() {
    return (
      <View style={styles.map}>
        {staticMapUrl ? (
          <Image key={staticMapUrl} source={{ uri: staticMapUrl }} style={styles.mapImage} resizeMode="cover" />
        ) : (
          <View style={styles.mapFallback}>
            <Text style={styles.mapFallbackTitle}>{baseCopy.mapKeyMissing}</Text>
          </View>
        )}
        <LinearGradient colors={["rgba(0,0,0,0.48)", "rgba(0,0,0,0.04)", "rgba(0,0,0,0.76)"]} style={styles.mapShade} />
      </View>
    );
  }

  function renderEntryHome() {
    return (
      <View style={styles.mainSheet}>
        <View style={styles.sheetHandle} />
        <Text style={styles.sheetTitle}>{screenCopy.whereToTitle}</Text>

        <Pressable onPress={() => setScreen("destination_search")} style={styles.routeBox}>
          <View style={styles.pointColumn}>
            <Text style={styles.pointA}>A</Text>
            <View style={styles.pointLine} />
            <Text style={styles.pointB}>B</Text>
          </View>
          <View style={styles.routeTextColumn}>
            <Text style={styles.routeLabel}>{baseCopy.from}</Text>
            <Text style={styles.routeValue}>{fromText}</Text>
            <View style={styles.routeDivider} />
            <Text style={styles.routeLabel}>{baseCopy.to}</Text>
            <Text style={[styles.routeValue, !toText ? styles.routePlaceholder : null]}>
              {toText || screenCopy.destinationSearchTitle}
            </Text>
          </View>
        </Pressable>

        <Pressable onPress={() => setScreen("tariffs")} style={styles.selectedTariffCard}>
          <View>
            <Text style={styles.cardSmall}>{screenCopy.selected}</Text>
            <Text style={styles.tariffTitle}>{activeTariff.title}</Text>
          </View>
          <View style={styles.priceBlock}>
            <Text style={styles.cardSmall}>{screenCopy.pricePreview}</Text>
            <Text style={styles.tariffPrice}>{formatMoney(activeTariff.price)}</Text>
          </View>
        </Pressable>

        <View style={styles.ctaRow}>
          <Pressable onPress={() => setScreen(toText ? "order_details" : "destination_search")} style={styles.primaryCta}>
            <Text style={styles.primaryCtaText}>{screenCopy.findDriver}</Text>
          </Pressable>
          <Pressable onPress={() => setScreen("ride_preferences")} style={styles.squareCta}>
            <Text style={styles.squareCtaText}>☷</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  function renderDestinationSearch() {
    return (
      <View style={styles.mainSheetLarge}>
        <View style={styles.sheetHeaderRow}>
          <Text style={styles.sheetTitle}>{screenCopy.destinationSearchTitle}</Text>
          <Pressable onPress={goHome} style={styles.closeButton}>
            <Text style={styles.closeText}>×</Text>
          </Pressable>
        </View>

        <View style={styles.inputCard}>
          <Text style={styles.routeLabel}>{baseCopy.from}</Text>
          <TextInput value={fromText} onChangeText={setFromText} style={styles.bigInput} placeholderTextColor="#9eaaa7" />
          <View style={styles.routeDivider} />
          <Text style={styles.routeLabel}>{baseCopy.to}</Text>
          <TextInput
            value={toText}
            onChangeText={setToText}
            style={styles.bigInput}
            placeholder={baseCopy.enterAddress}
            placeholderTextColor="#9eaaa7"
          />
        </View>

        <View style={styles.quickGrid}>
          {[screenCopy.useCurrentLocation, screenCopy.homeAddress, screenCopy.workAddress, screenCopy.airportAddress].map((item) => (
            <Pressable key={item} onPress={() => setToText(item)} style={styles.quickAddress}>
              <Text style={styles.quickAddressText}>{item}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable onPress={() => setScreen("tariffs")} style={styles.primaryCta}>
          <Text style={styles.primaryCtaText}>{screenCopy.next}</Text>
        </Pressable>
      </View>
    );
  }

  function renderSavedAddresses() {
    return (
      <View style={styles.mainSheetLarge}>
        <View style={styles.sheetHeaderRow}>
          <Text style={styles.sheetTitle}>{screenCopy.savedAddressesTitle}</Text>
          <Pressable onPress={goHome} style={styles.closeButton}>
            <Text style={styles.closeText}>×</Text>
          </Pressable>
        </View>

        {[screenCopy.homeAddress, screenCopy.workAddress, screenCopy.airportAddress].map((item) => (
          <Pressable
            key={item}
            onPress={() => {
              setToText(item);
              setScreen("tariffs");
            }}
            style={styles.savedCard}
          >
            <Text style={styles.savedIcon}>◆</Text>
            <View style={styles.savedCopy}>
              <Text style={styles.savedTitle}>{item}</Text>
              <Text style={styles.savedSubtitle}>{screenCopy.selectAddress}</Text>
            </View>
          </Pressable>
        ))}
      </View>
    );
  }

  function renderMapModeScreen() {
    return (
      <View style={styles.mainSheetLarge}>
        <View style={styles.sheetHeaderRow}>
          <Text style={styles.sheetTitle}>{screenCopy.mapModeTitle}</Text>
          <Pressable onPress={goHome} style={styles.closeButton}>
            <Text style={styles.closeText}>×</Text>
          </Pressable>
        </View>

        {[
          { id: "scheme" as const, title: screenCopy.mapScheme },
          { id: "real" as const, title: screenCopy.mapReal },
          { id: "3d" as const, title: screenCopy.map3d },
        ].map((item) => (
          <Pressable
            key={item.id}
            onPress={() => {
              setMapMode(item.id);
              goHome();
            }}
            style={[styles.modeCard, mapMode === item.id ? styles.modeCardActive : null]}
          >
            <Text style={styles.modeCardTitle}>{item.title}</Text>
            <Text style={styles.modeCardText}>{screenCopy.routePreview}</Text>
          </Pressable>
        ))}
      </View>
    );
  }

  function renderTariffs() {
    return (
      <View style={styles.mainSheetLarge}>
        <View style={styles.sheetHeaderRow}>
          <Text style={styles.sheetTitle}>{screenCopy.tariffsTitle}</Text>
          <Pressable onPress={goHome} style={styles.closeButton}>
            <Text style={styles.closeText}>×</Text>
          </Pressable>
        </View>

        {tariffs.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => setSelectedTariff(item.id)}
            style={[styles.tariffCard, selectedTariff === item.id ? styles.tariffCardActive : null]}
          >
            <View style={styles.carMock} />
            <View style={styles.tariffCopy}>
              <Text style={styles.tariffTitle}>{item.title}</Text>
              <Text style={styles.tariffMeta}>{item.eta} min • {screenCopy.safeRoute}</Text>
            </View>
            <Text style={styles.tariffPrice}>{formatMoney(item.price)}</Text>
          </Pressable>
        ))}

        <Pressable onPress={() => setScreen("ride_preferences")} style={styles.primaryCta}>
          <Text style={styles.primaryCtaText}>{screenCopy.chooseTariff}</Text>
        </Pressable>
      </View>
    );
  }

  function renderPreferences() {
    return (
      <View style={styles.mainSheetLarge}>
        <View style={styles.sheetHeaderRow}>
          <Text style={styles.sheetTitle}>{screenCopy.preferencesTitle}</Text>
          <Pressable onPress={goHome} style={styles.closeButton}>
            <Text style={styles.closeText}>×</Text>
          </Pressable>
        </View>

        <View style={styles.preferenceGrid}>
          <OptionPill
            title={`${screenCopy.passengers}: ${preferences.passengers}`}
            active
            onPress={() => setPreferences((value) => ({ ...value, passengers: value.passengers >= 4 ? 1 : value.passengers + 1 }))}
          />
          <OptionPill
            title={`${screenCopy.luggage}: ${preferences.luggage}`}
            active={preferences.luggage > 0}
            onPress={() => setPreferences((value) => ({ ...value, luggage: value.luggage >= 3 ? 0 : value.luggage + 1 }))}
          />
          <OptionPill
            title={screenCopy.childSeat}
            active={preferences.childSeat}
            onPress={() => setPreferences((value) => ({ ...value, childSeat: !value.childSeat }))}
          />
          <OptionPill
            title={screenCopy.pets}
            active={preferences.pets}
            onPress={() => setPreferences((value) => ({ ...value, pets: !value.pets }))}
          />
          <OptionPill
            title={screenCopy.quietRide}
            active={preferences.quietRide}
            onPress={() => setPreferences((value) => ({ ...value, quietRide: !value.quietRide }))}
          />
        </View>

        <Pressable onPress={() => setScreen("order_details")} style={styles.primaryCta}>
          <Text style={styles.primaryCtaText}>{screenCopy.next}</Text>
        </Pressable>
      </View>
    );
  }

  function renderOrderDetails() {
    return (
      <View style={styles.mainSheetLarge}>
        <View style={styles.sheetHeaderRow}>
          <Text style={styles.sheetTitle}>{screenCopy.orderDetailsTitle}</Text>
          <Pressable onPress={goHome} style={styles.closeButton}>
            <Text style={styles.closeText}>×</Text>
          </Pressable>
        </View>

        <View style={styles.detailsCard}>
          <Text style={styles.detailsLine}>{screenCopy.routePreview}</Text>
          <Text style={styles.detailsStrong}>{fromText}</Text>
          <Text style={styles.detailsStrong}>{toText || baseCopy.enterAddress}</Text>
          <View style={styles.routeDivider} />
          <Text style={styles.detailsLine}>{activeTariff.title} • {formatMoney(activeTariff.price)}</Text>
          <Text style={styles.detailsLine}>{screenCopy.paymentGlobalWallet}</Text>
          <Text style={styles.detailsLine}>{screenCopy.cashbackVisa}</Text>
        </View>

        <Pressable onPress={() => setScreen("searching_driver")} style={styles.primaryCta}>
          <Text style={styles.primaryCtaText}>{screenCopy.confirmOrder}</Text>
        </Pressable>
      </View>
    );
  }

  function renderSearching() {
    return (
      <View style={styles.mainSheetLarge}>
        <Text style={styles.searchingTitle}>{screenCopy.searchingTitle}</Text>
        <View style={styles.searchOrb}>
          <Text style={styles.searchOrbText}>S</Text>
        </View>
        <Text style={styles.searchingText}>{screenCopy.safeRoute}</Text>
        <Pressable onPress={goHome} style={styles.secondaryCta}>
          <Text style={styles.secondaryCtaText}>{screenCopy.cancelSearch}</Text>
        </Pressable>
      </View>
    );
  }

  function renderScreen() {
    if (screen === "destination_search") return renderDestinationSearch();
    if (screen === "saved_addresses") return renderSavedAddresses();
    if (screen === "map_mode") return renderMapModeScreen();
    if (screen === "tariffs") return renderTariffs();
    if (screen === "ride_preferences") return renderPreferences();
    if (screen === "order_details") return renderOrderDetails();
    if (screen === "searching_driver") return renderSearching();
    return renderEntryHome();
  }

  if (screen === "program_entry") {
    return <TaxiProgramEntryScreen lang={lang} onOpenTaxiClient={openTaxiClient} />;
  }

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#020807" />
      {renderMap()}
      {renderHeader()}
      {renderMapModes()}

      <Pressable onPress={() => setScreen("map_mode")} style={styles.mapModeEntry}>
        <Text style={styles.mapModeEntryText}>{screenCopy.mapModeTitle}</Text>
      </Pressable>

      {renderScreen()}

      <View style={styles.bottomNav}>
        {[
          { label: screenCopy.navHome, icon: "⌂", next: "entry_home" as TaxiClientScreen },
          { label: screenCopy.navHistory, icon: "◴", next: "entry_home" as TaxiClientScreen },
          { label: screenCopy.navFavorites, icon: "☆", next: "saved_addresses" as TaxiClientScreen },
          { label: screenCopy.navWallet, icon: "▣", next: "entry_home" as TaxiClientScreen },
          { label: screenCopy.navMore, icon: "☰", next: "ride_preferences" as TaxiClientScreen },
        ].map((item) => (
          <Pressable key={item.label} onPress={() => setScreen(item.next)} style={styles.navItem}>
            <Text style={styles.navIcon}>{item.icon}</Text>
            <Text style={styles.navText}>{item.label}</Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

const rawStyles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#020807" },
  map: { ...StyleSheet.absoluteFillObject, backgroundColor: "#020807" },
  mapImage: { ...StyleSheet.absoluteFillObject, width: "100%", height: "100%" },
  mapShade: { ...StyleSheet.absoluteFillObject },
  mapFallback: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  mapFallbackTitle: { color: "#f4fff8", fontSize: 18, fontWeight: "900", textAlign: "center" },

  topBar: {
    position: "absolute",
    left: 22,
    right: 22,
    top: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brandRow: { flexDirection: "row", alignItems: "center" },
  logoBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    backgroundColor: "#75ee34",
    shadowColor: "#76ff38",
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  logoText: { color: "#06140b", fontSize: 27, fontWeight: "900" },
  brandWhite: { color: "#ffffff", fontSize: 31, fontWeight: "900", letterSpacing: -0.8 },
  brandGreen: { color: "#78ff39", fontSize: 31, fontWeight: "900", letterSpacing: -0.8 },
  topActions: { flexDirection: "row", gap: 12 },
  circleButton: {
    width: 50,
    height: 50,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(4,10,10,0.58)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.20)",
  },
  circleIcon: { color: "#ffffff", fontSize: 23, fontWeight: "900" },

  modeSegment: {
    position: "absolute",
    top: 132,
    alignSelf: "center",
    height: 52,
    borderRadius: 999,
    padding: 5,
    flexDirection: "row",
    backgroundColor: "rgba(6,10,11,0.70)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  optionPill: {
    minHeight: 42,
    borderRadius: 999,
    paddingHorizontal: 15,
    marginRight: 6,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  optionPillActive: {
    backgroundColor: "rgba(78,148,27,0.68)",
    borderColor: "rgba(128,255,62,0.55)",
  },
  optionPillText: { color: "#d6e3df", fontSize: 13, fontWeight: "900" },
  optionPillTextActive: { color: "#d8ffb6" },

  mapModeEntry: {
    position: "absolute",
    left: 22,
    top: 196,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "rgba(5,12,12,0.66)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
  },
  mapModeEntryText: { color: "#ffffff", fontSize: 13, fontWeight: "900" },

  mainSheet: {
    position: "absolute",
    left: 22,
    right: 22,
    bottom: 106,
    borderRadius: 30,
    padding: 16,
    backgroundColor: "rgba(5,11,12,0.84)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    shadowColor: "#000",
    shadowOpacity: 0.42,
    shadowRadius: 24,
    elevation: 12,
  },
  mainSheetLarge: {
    position: "absolute",
    left: 22,
    right: 22,
    bottom: 106,
    maxHeight: 560,
    borderRadius: 30,
    padding: 18,
    backgroundColor: "rgba(5,11,12,0.90)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    shadowColor: "#000",
    shadowOpacity: 0.42,
    shadowRadius: 24,
    elevation: 12,
  },
  sheetHandle: {
    alignSelf: "center",
    width: 64,
    height: 5,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.60)",
    marginBottom: 12,
  },
  sheetHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  sheetTitle: { color: "#ffffff", fontSize: 24, fontWeight: "900", letterSpacing: -0.4 },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  closeText: { color: "#ffffff", fontSize: 28, fontWeight: "800" },

  routeBox: {
    flexDirection: "row",
    borderRadius: 24,
    padding: 14,
    backgroundColor: "rgba(8,17,19,0.88)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  pointColumn: { width: 38, alignItems: "center", paddingTop: 4 },
  pointA: { color: "#bfff9a", fontSize: 15, fontWeight: "900" },
  pointB: { color: "#bfff9a", fontSize: 15, fontWeight: "900" },
  pointLine: { width: 2, height: 42, backgroundColor: "rgba(120,255,57,0.45)", marginVertical: 5 },
  routeTextColumn: { flex: 1 },
  routeLabel: { color: "#a4b7b3", fontSize: 12, fontWeight: "800", marginBottom: 3 },
  routeValue: { color: "#ffffff", fontSize: 18, fontWeight: "900", marginBottom: 5 },
  routePlaceholder: { color: "#a8b6b2" },
  routeDivider: { height: 1, backgroundColor: "rgba(255,255,255,0.13)", marginVertical: 8 },

  selectedTariffCard: {
    marginTop: 12,
    borderRadius: 24,
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "rgba(10,22,18,0.88)",
    borderWidth: 1,
    borderColor: "rgba(121,255,56,0.38)",
  },
  cardSmall: { color: "#9fb0ac", fontSize: 11, fontWeight: "900", marginBottom: 4 },
  tariffTitle: { color: "#fff08a", fontSize: 18, fontWeight: "900" },
  priceBlock: { alignItems: "flex-end" },
  tariffPrice: { color: "#ffffff", fontSize: 18, fontWeight: "900" },

  ctaRow: { flexDirection: "row", gap: 12, marginTop: 14 },
  primaryCta: {
    flex: 1,
    minHeight: 60,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#75ee34",
    shadowColor: "#76ff38",
    shadowOpacity: 0.42,
    shadowRadius: 20,
    elevation: 12,
  },
  primaryCtaText: { color: "#071008", fontSize: 19, fontWeight: "900" },
  secondaryCta: {
    minHeight: 58,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  secondaryCtaText: { color: "#ffffff", fontSize: 16, fontWeight: "900" },
  squareCta: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(10,18,18,0.88)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  squareCtaText: { color: "#dce8e5", fontSize: 24, fontWeight: "900" },

  inputCard: {
    borderRadius: 24,
    padding: 15,
    backgroundColor: "rgba(8,17,19,0.88)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  bigInput: { color: "#ffffff", fontSize: 19, fontWeight: "900", padding: 0, marginBottom: 4 },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", marginVertical: 14, gap: 9 },
  quickAddress: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 11,
    backgroundColor: "rgba(255,255,255,0.09)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  quickAddressText: { color: "#ffffff", fontSize: 13, fontWeight: "900" },

  savedCard: {
    minHeight: 78,
    borderRadius: 22,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: "rgba(8,17,19,0.88)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  savedIcon: { color: "#75ee34", fontSize: 24, marginRight: 14 },
  savedCopy: { flex: 1 },
  savedTitle: { color: "#ffffff", fontSize: 17, fontWeight: "900" },
  savedSubtitle: { color: "#9fb0ac", fontSize: 12, fontWeight: "800", marginTop: 4 },

  modeCard: {
    minHeight: 82,
    borderRadius: 22,
    padding: 15,
    marginBottom: 10,
    backgroundColor: "rgba(8,17,19,0.88)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  modeCardActive: { borderColor: "rgba(121,255,56,0.58)", backgroundColor: "rgba(28,70,28,0.72)" },
  modeCardTitle: { color: "#ffffff", fontSize: 18, fontWeight: "900" },
  modeCardText: { color: "#9fb0ac", fontSize: 12, fontWeight: "800", marginTop: 6 },

  tariffCard: {
    minHeight: 92,
    borderRadius: 22,
    padding: 13,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(8,17,19,0.88)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  tariffCardActive: {
    borderColor: "rgba(121,255,56,0.58)",
    shadowColor: "#76ff38",
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 8,
  },
  carMock: {
    width: 76,
    height: 40,
    borderRadius: 18,
    marginRight: 13,
    backgroundColor: "rgba(117,255,52,0.20)",
    borderWidth: 1,
    borderColor: "rgba(121,255,56,0.50)",
  },
  tariffCopy: { flex: 1 },
  tariffMeta: { color: "#b9c5c2", fontSize: 12, marginTop: 5 },

  preferenceGrid: { flexDirection: "row", flexWrap: "wrap", gap: 9, marginBottom: 14 },
  detailsCard: {
    borderRadius: 24,
    padding: 16,
    marginBottom: 14,
    backgroundColor: "rgba(8,17,19,0.88)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  detailsLine: { color: "#aebbb8", fontSize: 14, fontWeight: "800", marginBottom: 8 },
  detailsStrong: { color: "#ffffff", fontSize: 18, fontWeight: "900", marginBottom: 5 },

  searchingTitle: { color: "#ffffff", fontSize: 26, fontWeight: "900", textAlign: "center", marginBottom: 18 },
  searchOrb: {
    alignSelf: "center",
    width: 110,
    height: 110,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(10,22,18,0.86)",
    borderWidth: 2,
    borderColor: "rgba(122,255,54,0.70)",
    shadowColor: "#74ff33",
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 12,
    marginBottom: 18,
  },
  searchOrbText: { color: "#76ff38", fontSize: 48, fontWeight: "900" },
  searchingText: { color: "#cfe0dc", fontSize: 14, fontWeight: "800", textAlign: "center", marginBottom: 18 },

  bottomNav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 10,
    height: 86,
    flexDirection: "row",
    paddingHorizontal: 18,
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(1,7,8,0.88)",
  },
  navItem: { flex: 1, alignItems: "center" },
  navIcon: { color: "#76ff38", fontSize: 26, fontWeight: "900" },
  navText: { color: "#c4d1ce", fontSize: 11, marginTop: 4, fontWeight: "800", textAlign: "center" },
});

const styles = rawStyles as Record<string, any>;
