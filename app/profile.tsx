import createLazyRouteScreen from "../src/shared/navigation/createLazyRouteScreen";

const ProfileScreen = createLazyRouteScreen(
  () => import("../src/modules/profile/routes/ProfileMainRoute"),
  "ProfileScreen",
);

export default ProfileScreen;
