import createLazyRouteScreen from "../../src/shared/navigation/createLazyRouteScreen";

const ProfileQrScreen = createLazyRouteScreen(
  () => import("../../src/modules/profile/routes/ProfileQrRoute"),
  "ProfileQrScreen",
);

export default ProfileQrScreen;
