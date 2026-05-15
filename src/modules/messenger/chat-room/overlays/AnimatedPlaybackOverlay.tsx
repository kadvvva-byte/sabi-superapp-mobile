import React, { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  ImageSourcePropType,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";
import { AVPlaybackStatus, ResizeMode, Video } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";

import { getGiftSceneSource } from "../../gifts/giftSceneMap";
import { getPremiumAnimatedPreviewSource } from "../premiumAnimatedAssetMap";

const { width, height } = Dimensions.get("window");

export type AnimatedPlaybackPayload = {
  id: string;
  emoji: string;
  title: string;
  subtitle?: string;
  durationMs?: number;
  kind: "reaction" | "emoji" | "gift";
  premium?: boolean;
} | null;

type Props = {
  visible: boolean;
  accent: string;
  payload: AnimatedPlaybackPayload;
  onClose: () => void;
};

type ReactionEffectKey =
  | "heart"
  | "kiss"
  | "laugh"
  | "cool"
  | "cry"
  | "fire"
  | "clap"
  | "wow"
  | "default";

type ReactionVisual = {
  imageSource?: ImageSourcePropType;
  fallbackEmoji: string;
  effectKey: ReactionEffectKey;
};

const PREMIUM_REACTION_VISUALS: Record<string, ReactionVisual> = {
  "heart-burst": { imageSource: require("../../../../../assets/low/reactions/reaction_heart_love.png"), fallbackEmoji: "💚", effectKey: "heart" },
  "reaction-heart-love": { imageSource: require("../../../../../assets/low/reactions/reaction_heart_love.png"), fallbackEmoji: "💚", effectKey: "heart" },
  "kiss-hearts": { imageSource: require("../../../../../assets/low/reactions/reaction_kiss_hearts.png"), fallbackEmoji: "😘", effectKey: "kiss" },
  "reaction-kiss-hearts": { imageSource: require("../../../../../assets/low/reactions/reaction_kiss_hearts.png"), fallbackEmoji: "😘", effectKey: "kiss" },
  "laugh-pop": { imageSource: require("../../../../../assets/low/reactions/reaction_lol_tears.png"), fallbackEmoji: "😂", effectKey: "laugh" },
  "reaction-lol-tears": { imageSource: require("../../../../../assets/low/reactions/reaction_lol_tears.png"), fallbackEmoji: "😂", effectKey: "laugh" },
  "cool-flash": { imageSource: require("../../../../../assets/low/reactions/reaction_cool_sunglasses.png"), fallbackEmoji: "😎", effectKey: "cool" },
  "reaction-cool-sunglasses": { imageSource: require("../../../../../assets/low/reactions/reaction_cool_sunglasses.png"), fallbackEmoji: "😎", effectKey: "cool" },
  "cry-soft": { imageSource: require("../../../../../assets/low/reactions/reaction_cry_sad.png"), fallbackEmoji: "😢", effectKey: "cry" },
  "reaction-cry-sad": { imageSource: require("../../../../../assets/low/reactions/reaction_cry_sad.png"), fallbackEmoji: "😢", effectKey: "cry" },
  "fire-wave": { fallbackEmoji: "🔥", effectKey: "fire" },
  "clap-light": { fallbackEmoji: "👏", effectKey: "clap" },
  "wow-shine": { fallbackEmoji: "😮", effectKey: "wow" },
};

function clampDuration(value?: number) {
  if (!value || Number.isNaN(value)) return 2600;
  return Math.max(1200, Math.min(value, 20000));
}

function scheduleHaptics(kind: "reaction" | "emoji" | "gift") {
  if (Platform.OS === "web") return () => {};
  const timers: ReturnType<typeof setTimeout>[] = [];
  const hit = (delay: number, style: Haptics.ImpactFeedbackStyle) => {
    timers.push(setTimeout(() => void Haptics.impactAsync(style), delay));
  };
  if (kind === "gift") {
    [0, 240, 1200, 3200, 5600, 8200, 11200, 14600, 18200].forEach((delay, index) => {
      hit(delay, index % 2 === 0 ? Haptics.ImpactFeedbackStyle.Heavy : Haptics.ImpactFeedbackStyle.Medium);
    });
  } else {
    hit(0, Haptics.ImpactFeedbackStyle.Medium);
    hit(180, Haptics.ImpactFeedbackStyle.Light);
  }
  return () => timers.forEach(clearTimeout);
}

function getReactionVisual(payload: AnimatedPlaybackPayload): ReactionVisual {
  if (!payload) return { fallbackEmoji: "✨", effectKey: "default" };
  const sharedPreviewSource = payload.id ? getPremiumAnimatedPreviewSource(payload.id) : null;
  const mapped = PREMIUM_REACTION_VISUALS[payload.id];
  if (mapped) return { ...mapped, imageSource: sharedPreviewSource ?? mapped.imageSource };
  return { imageSource: sharedPreviewSource ?? undefined, fallbackEmoji: payload.emoji || "✨", effectKey: "default" };
}

function getParticleTint(effectKey: ReactionEffectKey, accent: string) {
  switch (effectKey) {
    case "heart":
    case "kiss": return "#FF6FA9";
    case "laugh": return "#FFC857";
    case "cool": return "#67A8FF";
    case "cry": return "#7CC7FF";
    case "fire": return "#FF8A5B";
    case "clap": return "#FFD76A";
    case "wow": return "#B88CFF";
    default: return accent;
  }
}

function getParticleGlyph(effectKey: ReactionEffectKey) {
  switch (effectKey) {
    case "heart":
    case "kiss": return "♥";
    case "laugh":
    case "cool":
    case "clap":
    case "wow":
    case "fire": return "✦";
    case "cry": return "•";
    default: return "•";
  }
}

export function AnimatedPlaybackOverlay({ visible, accent, payload, onClose }: Props) {
  const sceneSource = useMemo(() => (payload?.kind === "gift" && payload?.id ? getGiftSceneSource(payload.id) : null), [payload]);
  const reactionVisual = useMemo(() => (payload?.kind === "reaction" ? getReactionVisual(payload) : null), [payload]);
  const isGift = payload?.kind === "gift";
  const isReaction = payload?.kind === "reaction";
  const hasSceneVideo = Boolean(sceneSource);
  const durationMs = clampDuration(payload?.durationMs);

  const backdrop = useRef(new Animated.Value(0)).current;
  const entry = useRef(new Animated.Value(0)).current;
  const floatY = useRef(new Animated.Value(0)).current;
  const wobble = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const particleA = useRef(new Animated.Value(0)).current;
  const particleB = useRef(new Animated.Value(0)).current;
  const particleC = useRef(new Animated.Value(0)).current;
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const floatLoopRef = useRef<Animated.CompositeAnimation | null>(null);
  const wobbleLoopRef = useRef<Animated.CompositeAnimation | null>(null);
  const pulseLoopRef = useRef<Animated.CompositeAnimation | null>(null);
  const particleLoopARef = useRef<Animated.CompositeAnimation | null>(null);
  const particleLoopBRef = useRef<Animated.CompositeAnimation | null>(null);
  const particleLoopCRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (!visible || !payload) {
      backdrop.setValue(0); entry.setValue(0); floatY.setValue(0); wobble.setValue(0); pulse.setValue(0); particleA.setValue(0); particleB.setValue(0); particleC.setValue(0);
      floatLoopRef.current?.stop(); wobbleLoopRef.current?.stop(); pulseLoopRef.current?.stop(); particleLoopARef.current?.stop(); particleLoopBRef.current?.stop(); particleLoopCRef.current?.stop();
      if (closeTimerRef.current) { clearTimeout(closeTimerRef.current); closeTimerRef.current = null; }
      return;
    }

    Animated.parallel([
      Animated.timing(backdrop, { toValue: 1, duration: 220, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(entry, { toValue: 1, duration: isGift ? 520 : 380, easing: Easing.out(Easing.bezier(0.16, 1, 0.3, 1)), useNativeDriver: true }),
    ]).start();

    if (!isGift) {
      floatLoopRef.current = Animated.loop(Animated.sequence([
        Animated.timing(floatY, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(floatY, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]));
      wobbleLoopRef.current = Animated.loop(Animated.sequence([
        Animated.timing(wobble, { toValue: 1, duration: 780, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(wobble, { toValue: -1, duration: 780, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(wobble, { toValue: 0, duration: 540, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]));
      pulseLoopRef.current = Animated.loop(Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 820, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 820, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]));
      const startParticleLoop = (value: Animated.Value, delay: number, ref: React.MutableRefObject<Animated.CompositeAnimation | null>) => {
        ref.current = Animated.loop(Animated.sequence([
          Animated.delay(delay),
          Animated.timing(value, { toValue: 1, duration: 1400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(value, { toValue: 0, duration: 0, useNativeDriver: true }),
        ]));
        ref.current.start();
      };
      floatLoopRef.current.start(); wobbleLoopRef.current.start(); pulseLoopRef.current.start();
      startParticleLoop(particleA, 0, particleLoopARef);
      startParticleLoop(particleB, 260, particleLoopBRef);
      startParticleLoop(particleC, 520, particleLoopCRef);
    }

    const clearHaptics = scheduleHaptics(payload.kind);
    if (!hasSceneVideo) closeTimerRef.current = setTimeout(onClose, durationMs);

    return () => {
      clearHaptics();
      floatLoopRef.current?.stop(); wobbleLoopRef.current?.stop(); pulseLoopRef.current?.stop(); particleLoopARef.current?.stop(); particleLoopBRef.current?.stop(); particleLoopCRef.current?.stop();
      if (closeTimerRef.current) { clearTimeout(closeTimerRef.current); closeTimerRef.current = null; }
    };
  }, [visible, payload, isGift, hasSceneVideo, durationMs, backdrop, entry, floatY, wobble, pulse, particleA, particleB, particleC, onClose]);

  if (!payload) return null;

  const backdropOpacity = backdrop.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const translateY = entry.interpolate({ inputRange: [0, 1], outputRange: [isGift ? 40 : 22, 0] });
  const scale = entry.interpolate({ inputRange: [0, 0.7, 1], outputRange: [0.84, 1.05, 1] });
  const stickerFloatTranslateY = floatY.interpolate({ inputRange: [0, 1], outputRange: [0, -10] });
  const stickerRotate = wobble.interpolate({ inputRange: [-1, 0, 1], outputRange: ["-4deg", "0deg", "4deg"] });
  const stickerPulseScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] });
  const tint = isReaction ? getParticleTint(reactionVisual?.effectKey ?? "default", accent) : accent;
  const particleGlyph = getParticleGlyph(reactionVisual?.effectKey ?? "default");
  const particleTravelY = (value: Animated.Value, effectKey: ReactionEffectKey) => value.interpolate({ inputRange: [0, 1], outputRange: effectKey === "cry" ? [-10, 90] : [12, -94] });
  const particleOpacity = (value: Animated.Value) => value.interpolate({ inputRange: [0, 0.1, 0.72, 1], outputRange: [0, 0.95, 0.78, 0] });
  const particleScale = (value: Animated.Value) => value.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1.22] });
  const handlePlaybackStatus = (status: AVPlaybackStatus) => { if (status.isLoaded && status.didJustFinish) onClose(); };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay} pointerEvents="box-none">
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View style={[styles.backdropWrap, { opacity: backdropOpacity }]}> 
          <LinearGradient colors={["rgba(4,8,18,0.04)", "rgba(4,8,18,0.34)", "rgba(4,8,18,0.64)"]} style={StyleSheet.absoluteFill} />
        </Animated.View>
        <Animated.View style={[styles.stage, { transform: [{ translateY }, { scale }] }]} pointerEvents="box-none">
          {isGift && hasSceneVideo ? (
            <View style={styles.videoShell}>
              <Video source={sceneSource!} style={styles.videoScene} resizeMode={ResizeMode.COVER} shouldPlay isLooping={false} onPlaybackStatusUpdate={handlePlaybackStatus} />
            </View>
          ) : (
            <View style={styles.reactionWrap}>
              {isReaction ? (
                <>
                  <Animated.Text style={[styles.particle, styles.particleA, { color: tint, opacity: particleOpacity(particleA), transform: [{ translateY: particleTravelY(particleA, reactionVisual?.effectKey ?? "default") }, { translateX: -88 }, { scale: particleScale(particleA) }] }]}>{particleGlyph}</Animated.Text>
                  <Animated.Text style={[styles.particle, styles.particleB, { color: tint, opacity: particleOpacity(particleB), transform: [{ translateY: particleTravelY(particleB, reactionVisual?.effectKey ?? "default") }, { translateX: 0 }, { scale: particleScale(particleB) }] }]}>{particleGlyph}</Animated.Text>
                  <Animated.Text style={[styles.particle, styles.particleC, { color: tint, opacity: particleOpacity(particleC), transform: [{ translateY: particleTravelY(particleC, reactionVisual?.effectKey ?? "default") }, { translateX: 88 }, { scale: particleScale(particleC) }] }]}>{particleGlyph}</Animated.Text>
                  <Animated.View style={[styles.stickerOnlyWrap, { transform: [{ translateY: stickerFloatTranslateY }, { rotate: stickerRotate }, { scale: stickerPulseScale }] }]}>
                    {reactionVisual?.imageSource ? <Image source={reactionVisual.imageSource} style={styles.reactionImageHuge} resizeMode="contain" /> : <Text style={styles.reactionEmojiHuge}>{reactionVisual?.fallbackEmoji || payload.emoji || "✨"}</Text>}
                  </Animated.View>
                </>
              ) : (
                <Animated.View style={{ transform: [{ translateY: stickerFloatTranslateY }, { scale: stickerPulseScale }] }}>
                  <Text style={styles.reactionEmojiHuge}>{payload.emoji || "✨"}</Text>
                </Animated.View>
              )}
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

export default AnimatedPlaybackOverlay;

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "transparent" },
  backdropWrap: { ...StyleSheet.absoluteFillObject },
  stage: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 12 },
  videoShell: { width: Math.min(width * 0.92, 440), height: Math.min(height * 0.86, 820), borderRadius: 30, overflow: "hidden", backgroundColor: "#050B12", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", shadowColor: "#000000", shadowOpacity: 0.34, shadowRadius: 24, shadowOffset: { width: 0, height: 16 }, elevation: 18 },
  videoScene: { width: "100%", height: "100%" },
  reactionWrap: { width: Math.min(width * 0.86, 360), height: Math.min(width * 0.86, 360), alignItems: "center", justifyContent: "center" },
  stickerOnlyWrap: { alignItems: "center", justifyContent: "center" },
  reactionImageHuge: { width: Math.min(width * 0.70, 320), height: Math.min(width * 0.70, 320) },
  reactionEmojiHuge: { fontSize: Math.min(width * 0.30, 132), lineHeight: Math.min(width * 0.32, 140) },
  particle: { position: "absolute", fontSize: 28, fontWeight: "900" },
  particleA: { top: 164 },
  particleB: { top: 126 },
  particleC: { top: 172 },
});

