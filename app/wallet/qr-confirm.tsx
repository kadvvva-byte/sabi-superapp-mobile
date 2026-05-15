import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { replaceWithSabiQrConfirm } from "../../src/modules/qr/runtime/qrEntryRoutes";

function firstString(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default function WalletQrConfirmRedirect() {
  const params = useLocalSearchParams<{ rawValue?: string; qrValue?: string }>();

  useEffect(() => {
    const rawValue = firstString(params.rawValue) ?? firstString(params.qrValue) ?? "";
    replaceWithSabiQrConfirm(rawValue, "wallet");
  }, [params.qrValue, params.rawValue]);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#06122B" }}>
      <ActivityIndicator size="large" color="#77A7FF" />
    </View>
  );
}
