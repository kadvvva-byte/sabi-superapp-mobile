import { router } from "expo-router";

import type { SabiQrFunctionCode } from "../contracts/universalQr.contracts";

export type SabiQrRouteParams = Record<string, string>;
export type SabiQrRouteTarget = {
  pathname: string;
  params?: SabiQrRouteParams;
};

function replaceQrRoute(target: SabiQrRouteTarget) {
  (router.replace as unknown as (nextHref: SabiQrRouteTarget) => void)(target);
}

function pushQrRoute(target: SabiQrRouteTarget) {
  (router.push as unknown as (nextHref: SabiQrRouteTarget) => void)(target);
}

export function createSabiQrFunctionRoute(functionCode: SabiQrFunctionCode): SabiQrRouteTarget {
  return { pathname: "/qr/create", params: { functionCode } };
}

export function createSabiQrCenterRoute(scope?: string): SabiQrRouteTarget {
  return { pathname: "/qr", params: scope ? { scope } : undefined };
}

export function createSabiQrScannerRoute(scope?: string): SabiQrRouteTarget {
  return { pathname: "/qr/scanner", params: scope ? { scope } : undefined };
}

export function createSabiQrConfirmRoute(rawValue: string): SabiQrRouteTarget {
  return { pathname: "/qr/confirm", params: { rawValue } };
}

export function createSabiQrResultRoute(params: SabiQrRouteParams): SabiQrRouteTarget {
  return { pathname: "/qr/result", params };
}

export const SABI_QR_ENTRY_FUNCTIONS = {
  profile: "profile_identity",
  wallet: "wallet_receive",
  walletPayment: "wallet_user_payment",
  coinWallet: "coin_wallet_receive",
  coinTransfer: "coin_wallet_transfer",
  cryptoWallet: "crypto_wallet_receive",
  merchant: "merchant_static_entry",
  merchantOrder: "merchant_dynamic_order",
  business: "business_invoice",
  messenger: "messenger_profile",
  messengerPayment: "messenger_payment",
  marketplace: "marketplace_order",
  stream: "stream_donation",
  taxi: "taxi_trip_payment",
  delivery: "delivery_order",
  schoolCheckIn: "school_check_in",
  schoolCheckOut: "school_check_out",
  workCheckIn: "work_check_in",
  workCheckOut: "work_check_out",
  virtualCard: "virtual_card_issuance",
  virtualCardPayment: "virtual_card_payment",
} as const satisfies Record<string, SabiQrFunctionCode>;

export function replaceWithSabiQrFunction(functionCode: SabiQrFunctionCode) {
  replaceQrRoute(createSabiQrFunctionRoute(functionCode));
}

export function replaceWithSabiQrCenter(scope?: string) {
  replaceQrRoute(createSabiQrCenterRoute(scope));
}

export function replaceWithSabiQrScanner(scope?: string) {
  replaceQrRoute(createSabiQrScannerRoute(scope));
}

export function replaceWithSabiQrConfirm(rawValue: string, fallbackScope?: string) {
  if (rawValue.trim()) {
    replaceQrRoute(createSabiQrConfirmRoute(rawValue.trim()));
    return;
  }

  replaceQrRoute(createSabiQrScannerRoute(fallbackScope));
}

export function replaceWithSabiQrResult(params: SabiQrRouteParams) {
  replaceQrRoute(createSabiQrResultRoute(params));
}

export function pushSabiQrFunction(functionCode: SabiQrFunctionCode) {
  pushQrRoute(createSabiQrFunctionRoute(functionCode));
}

export function pushSabiQrScanner(scope?: string) {
  pushQrRoute(createSabiQrScannerRoute(scope));
}
