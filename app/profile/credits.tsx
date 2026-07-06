import createLazyRouteScreen from "../../src/shared/navigation/createLazyRouteScreen";

const ProfileCreditsScreen = createLazyRouteScreen(
  () => import("../../src/modules/profile/routes/ProfileCreditsRoute"),
  "ProfileCreditsScreen",
);

export default ProfileCreditsScreen;
