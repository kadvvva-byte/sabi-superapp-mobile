import { Platform } from "react-native";

type EndHandler = () => void;

function isIos() {
  return Platform.OS === "ios";
}

export async function ensureIosCallKitConfigured() {
  if (!isIos()) return false;
  return false;
}

export async function syncIosCallKitFromSession(_: {
  contactName: string;
  handle?: string;
}) {
  if (!isIos()) return null;
  return null;
}

export function endIosSystemCall(_uuid?: string | null) {
  return;
}

export function subscribeIosCallKitEnd(_handler: EndHandler) {
  return () => {};
}

export function cleanupIosCallKitListeners() {
  return;
}

export function getCurrentIosCallUUID() {
  return null;
}

export function reportIosOutgoingCallConnecting(_uuid?: string | null) {
  return;
}

export function reportIosOutgoingCallConnected(_uuid?: string | null) {
  return;
}