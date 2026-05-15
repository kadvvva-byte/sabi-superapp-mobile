import React from "react";

import CoinProviderNoticeScreen from "../../../src/modules/wallet/coin/CoinProviderNoticeScreen";

export default function CoinWithdrawScreen() {
  return (
    <CoinProviderNoticeScreen
      screenKey="withdraw"
      fallbackTitle="Move COIN"
      fallbackSubtitle="COIN can cash out only through Sabi Wallet after provider confirmation, not directly to bank cards."
      bridgeRouteKind="cashout_to_sabi_wallet"
      tone="coin"
    />
  );
}
