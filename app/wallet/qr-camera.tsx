import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { replaceWithSabiQrScanner } from "../../src/modules/qr/runtime/qrEntryRoutes";

export default function WalletQrCameraRedirect() {
  useEffect(() => {
    replaceWithSabiQrScanner("wallet");
  }, []);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#06122B" }}>
      <ActivityIndicator size="large" color="#77A7FF" />
    </View>
  );
}
