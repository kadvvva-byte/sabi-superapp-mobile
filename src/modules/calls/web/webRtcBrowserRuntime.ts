export function isBrowserWebRtcAvailable() {
  return typeof window !== "undefined" && typeof window.RTCPeerConnection === "function" && Boolean(navigator.mediaDevices?.getUserMedia);
}

export async function createSabiBrowserCallStream(kind: "audio" | "video") {
  if (!isBrowserWebRtcAvailable()) {
    throw new Error("browser_webrtc_not_available");
  }
  return navigator.mediaDevices.getUserMedia({ audio: true, video: kind === "video" });
}
