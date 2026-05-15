import type { SabiQrFunctionDefinition, SabiQrTokenRecord } from "../contracts/universalQr.contracts";

export type SabiQrAdminRiskSignal = {
  eventType: "qr_created" | "qr_scanned" | "qr_validated" | "qr_execute_requested" | "qr_restricted";
  riskLevel: SabiQrFunctionDefinition["riskLevel"];
  functionCode: SabiQrFunctionDefinition["code"];
  surface: SabiQrFunctionDefinition["surface"];
  actorUserId?: string | null;
  tokenId?: string | null;
  requiresAdminReview: boolean;
  userVisible: false;
  note: string;
};

export function buildQrAdminRiskSignal(params: {
  eventType: SabiQrAdminRiskSignal["eventType"];
  definition: SabiQrFunctionDefinition;
  token?: SabiQrTokenRecord | null;
  note?: string;
}): SabiQrAdminRiskSignal {
  const requiresAdminReview =
    params.definition.riskLevel === "high" ||
    params.definition.riskLevel === "critical" ||
    params.definition.requiresAdminProviderConfig;

  return {
    eventType: params.eventType,
    riskLevel: params.definition.riskLevel,
    functionCode: params.definition.code,
    surface: params.definition.surface,
    actorUserId: params.token?.actorUserId ?? null,
    tokenId: params.token?.tokenId ?? null,
    requiresAdminReview,
    userVisible: false,
    note:
      params.note ??
      "QR risk signal for internal admin/compliance review. AI must not accuse the user or bypass provider/backend validation.",
  };
}

export const SABI_QR_AI_ASSIST_POLICY = {
  canExplainQrStatus: true,
  canExecutePayment: false,
  canOverrideRiskHold: false,
  canReadProviderSecrets: false,
  canApproveVirtualCardIssuing: false,
  requiresBackendValidationForEveryAction: true,
} as const;
