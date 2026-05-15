import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { replaceWithSabiQrFunction } from "../../../src/modules/qr/runtime/qrEntryRoutes";

export default function CoinWalletQrEntryScreen() {
  useEffect(() => {
    replaceWithSabiQrFunction("coin_wallet_receive");
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#77A7FF" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#06122B",
  },
});
