export type Stream112JLiveRoomSourceControlsPolishPlan = {
  readonly stage: "112J";
  readonly scope: "stream_live_room_source_controls";
  readonly cinemaMixedIntoStream: false;
  readonly backendTouched: false;
  readonly walletTouched: false;
  readonly messengerTouched: false;
  readonly callsTouched: false;
  readonly fakeProviderSuccessAllowed: false;
  readonly controls: readonly string[];
};

export const stream112jLiveRoomSourceControlsPolishPlan: Stream112JLiveRoomSourceControlsPolishPlan = {
  stage: "112J",
  scope: "stream_live_room_source_controls",
  cinemaMixedIntoStream: false,
  backendTouched: false,
  walletTouched: false,
  messengerTouched: false,
  callsTouched: false,
  fakeProviderSuccessAllowed: false,
  controls: [
    "source_controls_inside_room_settings_only",
    "camera_screen_game_video_rtmp_local_mode_selection",
    "screen_capture_preparation_local_only",
    "game_capture_preparation_local_only",
    "rtmp_draft_local_only_no_fake_key",
    "audio_mix_orientation_quality_local_state",
    "host_lifecycle_source_mode_sync",
    "no_cinema_series_anime_mixing",
  ],
};
