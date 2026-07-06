export const stream113bPeopleCohostBattleUxPlan = {
  version: "STREAM-113B",
  title: "Live room people / co-host / battle UI/UX polish",
  scope: "mobile-stream-ui-only",
  touches: [
    "src/modules/stream/mobile/StreamRoomRuntimePanel.tsx",
    "src/modules/stream/mobile/stream113bPeopleCohostBattleUxRuntime.ts",
  ],
  guarantees: {
    fakeLive: false,
    fakeRealtime: false,
    fakeProvider: false,
    fakePayment: false,
    cinemaMixedIntoStream: false,
    walletTouched: false,
    messengerTouched: false,
    aiTouched: false,
  },
  path: ["participants", "cohosts", "battle", "share"],
} as const;
