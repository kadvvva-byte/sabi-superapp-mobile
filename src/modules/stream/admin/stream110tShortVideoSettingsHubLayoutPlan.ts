export type Stream110TShortVideoSettingsHubLayoutPlan = {
  readonly version: "110T";
  readonly name: "Shorts settings hub layout clean pass";
  readonly scope: "mobile_stream_only";
  readonly viewerScreenRule: {
    readonly socialActionsStayVisible: readonly ["like", "comments", "share", "save"];
    readonly creationToolsHiddenBehindSettings: readonly ["video", "upload", "edit", "text", "overlays", "effects", "mp3", "review"];
  };
  readonly safety: {
    readonly walletTouched: false;
    readonly messengerTouched: false;
    readonly callsTouched: false;
    readonly backendTouched: false;
    readonly fakePublishSuccessAllowed: false;
    readonly fakeRenderSuccessAllowed: false;
    readonly storageProviderRequired: true;
  };
};

export const stream110TShortVideoSettingsHubLayoutPlan: Stream110TShortVideoSettingsHubLayoutPlan = {
  version: "110T",
  name: "Shorts settings hub layout clean pass",
  scope: "mobile_stream_only",
  viewerScreenRule: {
    socialActionsStayVisible: ["like", "comments", "share", "save"],
    creationToolsHiddenBehindSettings: ["video", "upload", "edit", "text", "overlays", "effects", "mp3", "review"],
  },
  safety: {
    walletTouched: false,
    messengerTouched: false,
    callsTouched: false,
    backendTouched: false,
    fakePublishSuccessAllowed: false,
    fakeRenderSuccessAllowed: false,
    storageProviderRequired: true,
  },
};
