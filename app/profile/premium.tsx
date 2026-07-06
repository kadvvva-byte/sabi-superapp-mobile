import createLazyRouteScreen from "../../src/shared/navigation/createLazyRouteScreen";

const ProfilePremiumScreen = createLazyRouteScreen(
  () => import("../../src/modules/profile/routes/ProfilePremiumRoute"),
  "ProfilePremiumScreen",
);

export default ProfilePremiumScreen;
