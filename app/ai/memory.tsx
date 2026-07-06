import createLazyRouteScreen from "../../src/shared/navigation/createLazyRouteScreen";

export default createLazyRouteScreen(
  () => import("../../src/modules/ai/mobile/screens/AiMobileMemoryScreen"),
  "AiMobileMemoryRoute",
);
