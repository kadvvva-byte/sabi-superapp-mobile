import createLazyRouteScreen from "../../src/shared/navigation/createLazyRouteScreen";

const ProfilePhotosScreen = createLazyRouteScreen(
  () => import("../../src/modules/profile/routes/ProfilePhotosRoute"),
  "ProfilePhotosScreen",
);

export default ProfilePhotosScreen;
