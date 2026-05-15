import type { SharedPublicProfileSnapshot } from "./publicProfileRuntime";

declare module "./publicProfileRuntime" {
  export type PublicProfileSnapshot = SharedPublicProfileSnapshot;
}
