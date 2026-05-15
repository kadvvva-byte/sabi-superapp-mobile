import React from "react";

import CoinProviderNoticeScreen from "../../../src/modules/wallet/coin/CoinProviderNoticeScreen";

export default function CoinSendScreen() {
  return (
    <CoinProviderNoticeScreen
      screenKey="send"
      fallbackTitle="Send COIN"
      fallbackSubtitle="COIN sending requires unified user ID, provider-backed balance, risk checks and explicit confirmation."
      bridgeRouteKind="send"
      tone="coin"
    />
  );
}
