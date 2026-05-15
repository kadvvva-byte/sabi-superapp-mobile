export type HomeBackgroundType = "image" | "default";

export type HomeBackgroundState = {
  type: HomeBackgroundType;
  uri: string | null;
};
