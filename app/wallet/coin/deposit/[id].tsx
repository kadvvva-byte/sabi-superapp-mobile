import React from "react";

import CoinProviderNoticeScreen from "../../../../src/modules/wallet/coin/CoinProviderNoticeScreen";

export default function DepositDetailsScreen() {
  return (
    <CoinProviderNoticeScreen
      screenKey="depositDetails"
      fallbackTitle="Locked Coin Details"
      fallbackSubtitle="Deposit details require provider-backed principal lock, interest ledger, maturity date and release status."
      tone="earn"
    />
  );
}
