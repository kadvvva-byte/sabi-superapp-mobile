import React from "react";

import CoinProviderNoticeScreen from "../../../src/modules/wallet/coin/CoinProviderNoticeScreen";

export default function CoinUseCasesScreen() {
  return (
    <CoinProviderNoticeScreen
      screenKey="useCases"
      fallbackTitle="Coin Use Cases"
      fallbackSubtitle="COIN use cases require the real Coin Wallet backend, provider route, QR route, ledger and admin controls before live execution."
      bridgeRouteKind="view"
      tone="coin"
    />
  );
}
