import React from "react";

import CoinProviderNoticeScreen from "../../../src/modules/wallet/coin/CoinProviderNoticeScreen";

export default function DiamondsCenterScreen() {
  return (
    <CoinProviderNoticeScreen
      screenKey="diamonds"
      fallbackTitle="Diamonds"
      fallbackSubtitle="Diamonds stay as an internal product balance. They do not have wallet transfer functions and cannot be counted as income unless policy allows."
      bridgeRouteKind="coin_to_diamond"
      tone="diamond"
    />
  );
}
