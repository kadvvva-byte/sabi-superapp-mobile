import createLazyRouteScreen from "../../src/shared/navigation/createLazyRouteScreen";

const ProfileDevicesScreen = createLazyRouteScreen(
  () => import("../../src/modules/profile/routes/ProfileDevicesRoute"),
  "ProfileDevicesScreen",
);

export default ProfileDevicesScreen;
