import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  CameraView,
  useCameraPermissions,
  type BarcodeScanningResult,
} from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  resolveSabiQr,
  validateSabiQr,
} from "../../src/modules/qr/api/qrApiClient";
import {
  assertSabiQrRawValue,
  assertSabiQrStrictPayload,
} from "../../src/modules/qr/runtime/qrScanPipeline";
import {
  buildSabiQrScanResultParams,
  classifySabiQrScanValue,
  type SabiQrScanClassification,
} from "../../src/modules/qr/runtime/qrScanClassifier";
import {
  tryOpenClassifiedSabiQrAction,
  tryOpenResolvedSabiQrAction,
} from "../../src/modules/qr/runtime/qrActionRouter";
import { useQrMobileTranslations } from "../../src/shared/i18n/qr-mobile-hooks";
import {
  buildSabiCameraMountKey,
  getSabiCameraRemountDelayMs,
  getSabiCameraRetryDelayMs,
  getSabiQrScannerAutofocusPulseMs,
  getSabiQrScannerAutofocusResetMs,
  getSabiQrScannerDuplicateWindowMs,
  getSabiQrScannerErrorUnlockDelayMs,
  getSabiQrScannerZoom,
  canUseSabiQrScannerTorch,
  normalizeSabiCameraMountError,
  toggleSabiCameraFacing,
  type SabiCameraAutofocusMode,
  type SabiCameraFacing,
} from "../../src/shared/camera/sabiCameraRuntime";

function pushQr(href: { pathname: string; params?: Record<string, string> }) {
  (router.push as unknown as (nextHref: typeof href) => void)(href);
}

function toUnsupportedResult(
  classification: SabiQrScanClassification,
  reasonKey: string,
): SabiQrScanClassification {
  const hideRawPayload = classification.kind === "sabi_server_token";

  return {
    ...classification,
    kind: "unsupported",
    handledLocally: true,
    ok: false,
    status: reasonKey === "qr.mobile.error.invalidQr" ? "restricted" : "failed",
    titleKey: "qr.mobile.scan.unsupported.title",
    descriptionKey: "qr.mobile.scan.unsupported.description",
    displayValue: hideRawPayload ? "—" : classification.displayValue,
    safeValue: hideRawPayload ? "—" : classification.safeValue,
    reasonKey,
  };
}

type AcceptedQrScan = {
  readonly rawValue: string;
  readonly acceptedAt: number;
};

function normalizeNativeQrScanValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export default function SabiQrScannerScreen() {
  const insets = useSafeAreaInsets();
  const { tq, errorLabel } = useQrMobileTranslations();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRetryCountRef = useRef(0);
  const cameraRemountTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const autofocusPulseTimerRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const autofocusResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const scanInFlightRef = useRef(false);
  const lastAcceptedScanRef = useRef<AcceptedQrScan | null>(null);
  const scanUnlockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [busy, setBusy] = useState(false);
  const [locked, setLocked] = useState(false);
  const [error, setError] = useState("");
  const [cameraError, setCameraError] = useState("");
  const [cameraFacing, setCameraFacing] = useState<SabiCameraFacing>("back");
  const [cameraAutofocus, setCameraAutofocus] =
    useState<SabiCameraAutofocusMode>("on");
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [cameraMountVersion, setCameraMountVersion] = useState(0);
  const [cameraSurfaceVisible, setCameraSurfaceVisible] = useState(false);
  const cameraMountKey = buildSabiCameraMountKey({
    scope: "qr-scanner",
    facing: cameraFacing,
    mode: "barcode",
    version: cameraMountVersion,
  });
  const scannerZoom = getSabiQrScannerZoom(cameraFacing);
  const torchSupported = canUseSabiQrScannerTorch(cameraFacing);
  const scannerTorchEnabled = torchSupported && torchEnabled;
  const canScan = useMemo(
    () =>
      Boolean(permission?.granted) &&
      !busy &&
      !locked &&
      !cameraError &&
      cameraSurfaceVisible,
    [permission?.granted, busy, locked, cameraError, cameraSurfaceVisible],
  );

  const remountCameraSurface = useCallback(
    (delayMs = getSabiCameraRemountDelayMs()) => {
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
    },
    [],
  );

  const resetScanGate = useCallback(() => {
    if (scanUnlockTimerRef.current) {
      clearTimeout(scanUnlockTimerRef.current);
      scanUnlockTimerRef.current = null;
    }
    scanInFlightRef.current = false;
    lastAcceptedScanRef.current = null;
  }, []);

  const releaseScanGateAfterError = useCallback(() => {
    if (scanUnlockTimerRef.current) {
      clearTimeout(scanUnlockTimerRef.current);
      scanUnlockTimerRef.current = null;
    }
    scanUnlockTimerRef.current = setTimeout(() => {
      scanUnlockTimerRef.current = null;
      scanInFlightRef.current = false;
    }, getSabiQrScannerErrorUnlockDelayMs());
  }, []);

  const tryAcceptNativeScan = useCallback((rawValue: string) => {
    if (!rawValue || scanInFlightRef.current) return false;

    const now = Date.now();
    const lastAccepted = lastAcceptedScanRef.current;

    if (
      lastAccepted?.rawValue === rawValue &&
      now - lastAccepted.acceptedAt < getSabiQrScannerDuplicateWindowMs()
    ) {
      return false;
    }

    scanInFlightRef.current = true;
    lastAcceptedScanRef.current = { rawValue, acceptedAt: now };
    return true;
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

  useEffect(() => {
    return () => {
      if (scanUnlockTimerRef.current) {
        clearTimeout(scanUnlockTimerRef.current);
        scanUnlockTimerRef.current = null;
      }
      scanInFlightRef.current = false;
      lastAcceptedScanRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (autofocusPulseTimerRef.current) {
      clearInterval(autofocusPulseTimerRef.current);
      autofocusPulseTimerRef.current = null;
    }
    if (autofocusResetTimerRef.current) {
      clearTimeout(autofocusResetTimerRef.current);
      autofocusResetTimerRef.current = null;
    }

    setCameraAutofocus("on");

    if (!permission?.granted || !cameraSurfaceVisible || cameraError || busy) {
      return undefined;
    }

    const pulseAutofocus = () => {
      setCameraAutofocus("off");
      autofocusResetTimerRef.current = setTimeout(() => {
        autofocusResetTimerRef.current = null;
        setCameraAutofocus("on");
      }, getSabiQrScannerAutofocusResetMs());
    };

    pulseAutofocus();
    autofocusPulseTimerRef.current = setInterval(
      pulseAutofocus,
      getSabiQrScannerAutofocusPulseMs(),
    );

    return () => {
      if (autofocusPulseTimerRef.current) {
        clearInterval(autofocusPulseTimerRef.current);
        autofocusPulseTimerRef.current = null;
      }
      if (autofocusResetTimerRef.current) {
        clearTimeout(autofocusResetTimerRef.current);
        autofocusResetTimerRef.current = null;
      }
    };
  }, [
    busy,
    cameraError,
    cameraFacing,
    cameraSurfaceVisible,
    permission?.granted,
  ]);

  const retryCamera = useCallback(() => {
    resetScanGate();
    setError("");
    setLocked(false);
    setCameraError("");
    cameraRetryCountRef.current = 0;
    remountCameraSurface(getSabiCameraRetryDelayMs());
  }, [remountCameraSurface, resetScanGate]);

  const switchCamera = useCallback(() => {
    resetScanGate();
    setError("");
    setLocked(false);
    setCameraError("");
    setTorchEnabled(false);
    cameraRetryCountRef.current = 0;
    setCameraFacing((current) => toggleSabiCameraFacing(current));
  }, [resetScanGate]);

  const toggleTorch = useCallback(() => {
    if (!torchSupported) return;
    setError("");
    setTorchEnabled((current) => !current);
  }, [torchSupported]);

  const handleCameraMountError = useCallback(
    (event: unknown) => {
      const message = normalizeSabiCameraMountError(
        event,
        errorLabel("qr.mobile.scanner.cameraRequired"),
      );
      resetScanGate();
      setCameraError(message);
      setLocked(false);

      if (cameraRetryCountRef.current < 2) {
        cameraRetryCountRef.current += 1;
        remountCameraSurface(getSabiCameraRetryDelayMs());
      }
    },
    [errorLabel, remountCameraSurface, resetScanGate],
  );

  const onScanned = useCallback(
    async (event: BarcodeScanningResult) => {
      if (!canScan) return;

      const nativeRawValue = normalizeNativeQrScanValue(event.data);
      if (!nativeRawValue || !tryAcceptNativeScan(nativeRawValue)) return;

      setLocked(true);
      setBusy(true);
      setError("");

      try {
        const rawValue = assertSabiQrRawValue(nativeRawValue);
        const classification = classifySabiQrScanValue(rawValue);

        if (classification.handledLocally) {
          const actionOpened = await tryOpenClassifiedSabiQrAction(
            classification,
            rawValue,
          );
          if (actionOpened) return;

          pushQr({
            pathname: "/qr/result",
            params: buildSabiQrScanResultParams(classification),
          });
          return;
        }

        try {
          const resolved = await resolveSabiQr(rawValue);
          if (!resolved.ok || !resolved.token || !resolved.function) {
            throw new Error(
              resolved.reason?.startsWith("qr.mobile.")
                ? resolved.reason
                : "qr.mobile.scanner.resolveFailed",
            );
          }

          const validated = await validateSabiQr(rawValue);
          if (!validated.valid) {
            throw new Error(
              validated.reason?.startsWith("qr.mobile.")
                ? validated.reason
                : "qr.mobile.scanner.validationFailed",
            );
          }

          const strictPayload = assertSabiQrStrictPayload({
            rawValue,
            token: validated.token ?? resolved.token,
            definition: validated.function ?? resolved.function,
          });

          const actionOpened = await tryOpenResolvedSabiQrAction(strictPayload);
          if (actionOpened) return;

          pushQr({
            pathname: "/qr/confirm",
            params: { rawValue: encodeURIComponent(rawValue) },
          });
        } catch (backendError) {
          const reasonKey =
            backendError instanceof Error &&
            backendError.message.startsWith("qr.mobile.")
              ? backendError.message
              : "qr.mobile.scanner.resolveFailed";
          pushQr({
            pathname: "/qr/result",
            params: buildSabiQrScanResultParams(
              toUnsupportedResult(classification, reasonKey),
            ),
          });
        }
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "qr.mobile.scanner.resolveFailed";
        setError(errorLabel(message));
        setLocked(false);
        releaseScanGateAfterError();
      } finally {
        setBusy(false);
      }
    },
    [canScan, errorLabel, releaseScanGateAfterError, tryAcceptNativeScan],
  );

  return (
    <LinearGradient
      colors={["#06122B", "#101A35", "#040914"]}
      style={styles.root}
    >
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 10) }]}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityLabel={tq("qr.mobile.common.back")}
        >
          <Ionicons name="arrow-back" size={18} color="#FFFFFF" />
        </Pressable>
        <View style={styles.topText}>
          <Text style={styles.eyebrow}>{tq("qr.mobile.scanner.eyebrow")}</Text>
          <Text style={styles.title}>{tq("qr.mobile.scanner.title")}</Text>
        </View>
      </View>

      {!permission ? (
        <Center>
          <ActivityIndicator color="#FFFFFF" />
        </Center>
      ) : permission.granted ? (
        <View style={styles.cameraWrap}>
          {cameraSurfaceVisible ? (
            <CameraView
              key={cameraMountKey}
              style={StyleSheet.absoluteFillObject}
              facing={cameraFacing}
              autofocus={cameraAutofocus}
              enableTorch={scannerTorchEnabled}
              zoom={scannerZoom}
              barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
              onBarcodeScanned={onScanned}
              onMountError={handleCameraMountError}
            />
          ) : (
            <View
              style={[StyleSheet.absoluteFillObject, styles.cameraBootSurface]}
            />
          )}
          <View style={styles.overlay}>
            <View style={styles.scanFrame}>
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />
            </View>
          </View>
          <View
            style={[
              styles.bottomCard,
              { paddingBottom: Math.max(insets.bottom + 16, 24) },
            ]}
          >
            {busy ? (
              <View style={styles.inlineRow}>
                <ActivityIndicator color="#FFFFFF" />
                <Text style={styles.bottomText}>
                  {tq("qr.mobile.scanner.resolving")}
                </Text>
              </View>
            ) : cameraError ? (
              <>
                <Text style={styles.errorText}>{cameraError}</Text>
                <View style={styles.cameraActionRow}>
                  <Pressable
                    onPress={retryCamera}
                    style={styles.secondaryButton}
                  >
                    <Text style={styles.secondaryButtonText}>
                      {tq("qr.mobile.common.scanAgain")}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={switchCamera}
                    style={styles.secondaryButton}
                  >
                    <Text style={styles.secondaryButtonText}>
                      {cameraFacing === "back"
                        ? tq("qr.mobile.scanner.frontCamera")
                        : tq("qr.mobile.scanner.backCamera")}
                    </Text>
                  </Pressable>
                </View>
              </>
            ) : error ? (
              <>
                <Text style={styles.errorText}>{error}</Text>
                <Pressable
                  onPress={() => {
                    resetScanGate();
                    setError("");
                    setLocked(false);
                  }}
                  style={styles.secondaryButton}
                >
                  <Text style={styles.secondaryButtonText}>
                    {tq("qr.mobile.common.scanAgain")}
                  </Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text style={styles.bottomText}>
                  {tq("qr.mobile.scanner.pointCamera")}
                </Text>
                <View style={styles.quickActionRow}>
                  <Pressable
                    onPress={toggleTorch}
                    disabled={!torchSupported}
                    style={[
                      styles.quickActionButton,
                      scannerTorchEnabled ? styles.quickActionButtonActive : null,
                      !torchSupported ? styles.quickActionButtonDisabled : null,
                    ]}
                    accessibilityLabel={
                      scannerTorchEnabled
                        ? tq("qr.mobile.scanner.torchOff")
                        : tq("qr.mobile.scanner.torchOn")
                    }
                  >
                    <Ionicons
                      name={scannerTorchEnabled ? "flashlight" : "flashlight-outline"}
                      size={16}
                      color="#FFFFFF"
                    />
                    <Text style={styles.quickActionText}>
                      {scannerTorchEnabled
                        ? tq("qr.mobile.scanner.torchOff")
                        : tq("qr.mobile.scanner.torchOn")}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={switchCamera}
                    style={styles.quickActionButton}
                    accessibilityLabel={
                      cameraFacing === "back"
                        ? tq("qr.mobile.scanner.frontCamera")
                        : tq("qr.mobile.scanner.backCamera")
                    }
                  >
                    <Ionicons name="camera-reverse-outline" size={16} color="#FFFFFF" />
                    <Text style={styles.quickActionText}>
                      {cameraFacing === "back"
                        ? tq("qr.mobile.scanner.frontCamera")
                        : tq("qr.mobile.scanner.backCamera")}
                    </Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </View>
      ) : (
        <Center>
          <Ionicons name="camera" size={38} color="#77A7FF" />
          <Text style={styles.permissionTitle}>
            {tq("qr.mobile.scanner.cameraRequired")}
          </Text>
          <Pressable
            onPress={() => requestPermission()}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>
              {tq("qr.mobile.scanner.allowCamera")}
            </Text>
          </Pressable>
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
  topBar: {
    paddingHorizontal: 18,
    paddingBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  topText: { flex: 1 },
  eyebrow: {
    color: "#77A7FF",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.4,
  },
  title: { color: "#FFFFFF", fontSize: 25, fontWeight: "900" },
  cameraWrap: { flex: 1, overflow: "hidden" },
  cameraBootSurface: { backgroundColor: "#040914" },
  cameraActionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  quickActionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
    marginTop: 14,
  },
  quickActionButton: {
    minHeight: 40,
    paddingHorizontal: 13,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  quickActionButtonActive: {
    backgroundColor: "rgba(119,167,255,0.24)",
    borderColor: "rgba(119,167,255,0.45)",
  },
  quickActionButtonDisabled: {
    opacity: 0.45,
  },
  quickActionText: { color: "#FFFFFF", fontSize: 12, fontWeight: "900" },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  scanFrame: {
    width: 274,
    height: 274,
    borderRadius: 34,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  corner: {
    position: "absolute",
    width: 54,
    height: 54,
    borderColor: "#77A7FF",
  },
  cornerTL: {
    left: -1,
    top: -1,
    borderLeftWidth: 4,
    borderTopWidth: 4,
    borderTopLeftRadius: 34,
  },
  cornerTR: {
    right: -1,
    top: -1,
    borderRightWidth: 4,
    borderTopWidth: 4,
    borderTopRightRadius: 34,
  },
  cornerBL: {
    left: -1,
    bottom: -1,
    borderLeftWidth: 4,
    borderBottomWidth: 4,
    borderBottomLeftRadius: 34,
  },
  cornerBR: {
    right: -1,
    bottom: -1,
    borderRightWidth: 4,
    borderBottomWidth: 4,
    borderBottomRightRadius: 34,
  },
  bottomCard: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 16,
    backgroundColor: "rgba(6,18,43,0.94)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  inlineRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  bottomText: {
    color: "#FFFFFF",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "800",
  },
  errorText: {
    color: "#FF9B9B",
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "800",
    marginBottom: 12,
  },
  secondaryButton: {
    alignSelf: "flex-start",
    minHeight: 42,
    paddingHorizontal: 15,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
    marginTop: 12,
  },
  secondaryButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" },
  centerBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 14,
  },
  permissionTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
  },
  primaryButton: {
    minHeight: 50,
    paddingHorizontal: 20,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#77A7FF",
  },
  primaryButtonText: { color: "#07111E", fontSize: 14, fontWeight: "900" },
});
