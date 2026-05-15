import React from "react";

import CoinProviderNoticeScreen from "../../../src/modules/wallet/coin/CoinProviderNoticeScreen";

export default function WithdrawDiamondsScreen() {
  return (
    <CoinProviderNoticeScreen
      screenKey="withdrawDiamonds"
      fallbackTitle="Withdraw Diamonds"
      fallbackSubtitle="Only eligible withdrawable diamonds may convert back into COIN through monthly policy and provider-controlled settlement."
      bridgeRouteKind="diamond_to_coin"
      tone="diamond"
    />
  );
}
