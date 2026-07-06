import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

import {
  replaceWithSabiQrFunction,
  SABI_QR_ENTRY_FUNCTIONS,
} from "../../qr/runtime/qrEntryRoutes";

export default function ProfileQrRoute() {
  useEffect(() => {
    replaceWithSabiQrFunction(SABI_QR_ENTRY_FUNCTIONS.profile);
  }, []);

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#150A2E",
      }}
    >
      <ActivityIndicator size="large" color="#B588FF" />
    </View>
  );
}
