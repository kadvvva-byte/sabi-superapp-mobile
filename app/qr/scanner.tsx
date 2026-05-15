import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { resolveSabiQr, validateSabiQr } from "../../src/modules/qr/api/qrApiClient";
import {
  assertSabiQrRawValue,
  assertSabiQrStrictPayload,
} from "../../src/modules/qr/runtime/qrScanPipeline";
import { useQrMobileTranslations } from "../../src/shared/i18n/qr-mobile-translations";
import {
  buildSabiCameraMountKey,
  getSabiCameraRemountDelayMs,
  getSabiCameraRetryDelayMs,
  normalizeSabiCameraMountError,
  toggleSabiCameraFacing,
  type SabiCameraFacing,
} from "../../src/shared/camera/sabiCameraRuntime";

function pushQr(href: { pathname: string; params?: Record<string, string> }) {
  (router.push as unknown as (nextHref: typeof href) => void)(href);
}

export default function SabiQrScannerScreen() {
  const insets = useSafeAreaInsets();
  const { tq, errorLabel } = useQrMobileTranslations();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRetryCountRef = useRef(0);
  const cameraRemountTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [busy, setBusy] = useState(false);
  const [locked, setLocked] = useState(false);
  const [error, setError] = useState("");
  const [cameraError, setCameraError] = useState("");
  const [cameraFacing, setCameraFacing] = useState<SabiCameraFacing>("back");
  const [cameraMountVersion, setCameraMountVersion] = useState(0);
  const [cameraSurfaceVisible, setCameraSurfaceVisible] = useState(false);
  const cameraMountKey = buildSabiCameraMountKey({
    scope: "qr-scanner",
    facing: cameraFacing,
    mode: "barcode",
    version: cameraMountVersion,
  });
  const canScan = useMemo(
    () => Boolean(permission?.granted) && !busy && !locked && !cameraError && cameraSurfaceVisible,
    [permission?.granted, busy, locked, cameraError, cameraSurfaceVisible],
  );

  const remountCameraSurface = useCallback((delayMs = getSabiCameraRemountDelayMs()) => {
    if (cameraRemountTimerRef.current) {
      clearTimeout(cameraRemountTimerRef.current);
      cameraRemountTimerRef.current = null;
    }

    setCameraSurfaceVisible(false);
    cameraRemountTimerRef.current = setTimeout(() => {
      cameraRemountTimerRef.current = null;
      setCameraMountVersion((current) => current + 1);
      setCameraSurfaceVisible(true);
    }, delayMs);
  }, []);

  useEffect(() => {
    if (!permission?.granted) {
      setCameraSurfaceVisible(false);
      return undefined;
    }

    setCameraError("");
    cameraRetryCountRef.current = 0;
    remountCameraSurface(getSabiCameraRemountDelayMs());

    return () => {
      if (cameraRemountTimerRef.current) {
        clearTimeout(cameraRemountTimerRef.current);
        cameraRemountTimerRef.current = null;
      }
    };
  }, [cameraFacing, permission?.granted, remountCameraSurface]);

  const retryCamera = useCallback(() => {
    setError("");
    setLocked(false);
    setCameraError("");
    cameraRetryCountRef.current = 0;
    remountCameraSurface(getSabiCameraRetryDelayMs());
  }, [remountCameraSurface]);

  const switchCamera = useCallback(() => {
    setError("");
    setLocked(false);
    setCameraError("");
    cameraRetryCountRef.current = 0;
    setCameraFacing((current) => toggleSabiCameraFacing(current));
  }, []);

  const handleCameraMountError = useCallback((event: unknown) => {
    const message = normalizeSabiCameraMountError(event, errorLabel("qr.mobile.scanner.cameraRequired"));
    setCameraError(message);
    setLocked(false);

    if (cameraRetryCountRef.current < 2) {
      cameraRetryCountRef.current += 1;
      remountCameraSurface(getSabiCameraRetryDelayMs());
    }
  }, [errorLabel, remountCameraSurface]);

  const onScanned = useCallback(async (event: BarcodeScanningResult) => {
    if (!canScan) return;

    setLocked(true);
    setBusy(true);
    setError("");

    try {
      const rawValue = assertSabiQrRawValue(event.data);
      const resolved = await resolveSabiQr(rawValue);
      if (!resolved.ok || !resolved.token || !resolved.function) {
        throw new Error(resolved.reason?.startsWith("qr.mobile.") ? resolved.reason : "qr.mobile.scanner.resolveFailed");
      }

      const validated = await validateSabiQr(rawValue);
      if (!validated.valid) {
        throw new Error(validated.reason?.startsWith("qr.mobile.") ? validated.reason : "qr.mobile.scanner.validationFailed");
      }

      assertSabiQrStrictPayload({
        rawValue,
        token: validated.token ?? resolved.token,
        definition: validated.function ?? resolved.function,
      });

      pushQr({ pathname: "/qr/confirm", params: { rawValue: encodeURIComponent(rawValue) } });
    } catch (err) {
      const message = err instanceof Error ? err.message : "qr.mobile.scanner.resolveFailed";
      setError(errorLabel(message));
      setLocked(false);
    } finally {
      setBusy(false);
    }
  }, [canScan, errorLabel]);

  return (
    <LinearGradient colors={["#06122B", "#101A35", "#040914"]} style={styles.root}>
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 10) }]}> 
        <Pressable onPress={() => router.back()} style={styles.backButton} accessibilityLabel={tq("qr.mobile.common.back")}>
          <Ionicons name="arrow-back" size={18} color="#FFFFFF" />
        </Pressable>
        <View style={styles.topText}>
          <Text style={styles.eyebrow}>{tq("qr.mobile.scanner.eyebrow")}</Text>
          <Text style={styles.title}>{tq("qr.mobile.scanner.title")}</Text>
        </View>
      </View>

      {!permission ? (
        <Center><ActivityIndicator color="#FFFFFF" /></Center>
      ) : permission.granted ? (
        <View style={styles.cameraWrap}>
          {cameraSurfaceVisible ? (
            <CameraView
              key={cameraMountKey}
              style={StyleSheet.absoluteFillObject}
              facing={cameraFacing}
              barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
              onBarcodeScanned={onScanned}
              onMountError={handleCameraMountError}
            />
          ) : (
            <View style={[StyleSheet.absoluteFillObject, styles.cameraBootSurface]} />
          )}
          <View style={styles.overlay}>
            <View style={styles.scanFrame}>
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />
            </View>
          </View>
          <View style={[styles.bottomCard, { paddingBottom: Math.max(insets.bottom + 16, 24) }]}> 
            {busy ? (
              <View style={styles.inlineRow}><ActivityIndicator color="#FFFFFF" /><Text style={styles.bottomText}>{tq("qr.mobile.scanner.resolving")}</Text></View>
            ) : cameraError ? (
              <>
                <Text style={styles.errorText}>{cameraError}</Text>
                <View style={styles.cameraActionRow}>
                  <Pressable onPress={retryCamera} style={styles.secondaryButton}><Text style={styles.secondaryButtonText}>{tq("qr.mobile.common.scanAgain")}</Text></Pressable>
                  <Pressable onPress={switchCamera} style={styles.secondaryButton}><Text style={styles.secondaryButtonText}>{cameraFacing === "back" ? tq("qr.mobile.scanner.frontCamera") : tq("qr.mobile.scanner.backCamera")}</Text></Pressable>
                </View>
              </>
            ) : error ? (
              <>
                <Text style={styles.errorText}>{error}</Text>
                <Pressable onPress={() => { setError(""); setLocked(false); }} style={styles.secondaryButton}><Text style={styles.secondaryButtonText}>{tq("qr.mobile.common.scanAgain")}</Text></Pressable>
              </>
            ) : (
              <Text style={styles.bottomText}>{tq("qr.mobile.scanner.pointCamera")}</Text>
            )}
          </View>
        </View>
      ) : (
        <Center>
          <Ionicons name="camera" size={38} color="#77A7FF" />
          <Text style={styles.permissionTitle}>{tq("qr.mobile.scanner.cameraRequired")}</Text>
          <Pressable onPress={() => requestPermission()} style={styles.primaryButton}><Text style={styles.primaryButtonText}>{tq("qr.mobile.scanner.allowCamera")}</Text></Pressable>
        </Center>
      )}
    </LinearGradient>
  );
}

function Center({ children }: { children: React.ReactNode }) {
  return <View style={styles.centerBox}>{children}</View>;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: { paddingHorizontal: 18, paddingBottom: 14, flexDirection: "row", alignItems: "center", gap: 12 },
  backButton: { width: 40, height: 40, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.10)", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)" },
  topText: { flex: 1 },
  eyebrow: { color: "#77A7FF", fontSize: 11, fontWeight: "900", letterSpacing: 1.4 },
  title: { color: "#FFFFFF", fontSize: 25, fontWeight: "900" },
  cameraWrap: { flex: 1, overflow: "hidden" },
  cameraBootSurface: { backgroundColor: "#040914" },
  cameraActionRow: { flexDirection: "row", alignItems: "center", gap: 10, flexWrap: "wrap" },
  overlay: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" },
  scanFrame: { width: 274, height: 274, borderRadius: 34, borderWidth: 1, borderColor: "rgba(255,255,255,0.18)", backgroundColor: "rgba(0,0,0,0.05)" },
  corner: { position: "absolute", width: 54, height: 54, borderColor: "#77A7FF" },
  cornerTL: { left: -1, top: -1, borderLeftWidth: 4, borderTopWidth: 4, borderTopLeftRadius: 34 },
  cornerTR: { right: -1, top: -1, borderRightWidth: 4, borderTopWidth: 4, borderTopRightRadius: 34 },
  cornerBL: { left: -1, bottom: -1, borderLeftWidth: 4, borderBottomWidth: 4, borderBottomLeftRadius: 34 },
  cornerBR: { right: -1, bottom: -1, borderRightWidth: 4, borderBottomWidth: 4, borderBottomRightRadius: 34 },
  bottomCard: { position: "absolute", left: 14, right: 14, bottom: 0, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 16, backgroundColor: "rgba(6,18,43,0.94)", borderWidth: 1, borderColor: "rgba(255,255,255,0.10)" },
  inlineRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  bottomText: { color: "#FFFFFF", fontSize: 14, lineHeight: 20, fontWeight: "800" },
  errorText: { color: "#FF9B9B", fontSize: 14, lineHeight: 19, fontWeight: "800", marginBottom: 12 },
  secondaryButton: { alignSelf: "flex-start", minHeight: 42, paddingHorizontal: 15, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.10)", marginTop: 12 },
  secondaryButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" },
  centerBox: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24, gap: 14 },
  permissionTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "900", textAlign: "center" },
  primaryButton: { minHeight: 50, paddingHorizontal: 20, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: "#77A7FF" },
  primaryButtonText: { color: "#07111E", fontSize: 14, fontWeight: "900" },
});
