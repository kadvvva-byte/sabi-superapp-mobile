import createLazyRouteScreen from "../../src/shared/navigation/createLazyRouteScreen";

export default createLazyRouteScreen(
  () => import("../../src/modules/profile/routes/ProfileLikesRoute"),
  "ProfileLikesRoute",
);
