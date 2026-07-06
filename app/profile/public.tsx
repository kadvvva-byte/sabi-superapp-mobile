import createLazyRouteScreen from "../../src/shared/navigation/createLazyRouteScreen";

const ProfilePublicScreen = createLazyRouteScreen(
  () => import("../../src/modules/profile/routes/ProfilePublicRoute"),
  "ProfilePublicScreen",
);

export default ProfilePublicScreen;
