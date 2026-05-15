import { createSabiQrToken, executeSabiQr, resolveSabiQr, validateSabiQr } from "../api/qrApiClient";
import type { SabiQrFunctionDefinition, SabiQrTokenRequest } from "../contracts/universalQr.contracts";
import { assertQrFunctionSeparation, validateServerSignedToken } from "../security/qrSecurity";
import { normalizeQrAmount, normalizeQrCurrency, normalizeQrText, validateQrInput } from "./qrTokenPayload";
import { buildWalletQrTokenMetadata } from "../../../shared/wallet/wallet-qr-integration";
import { patchSabiQrRuntimeState, setSabiQrRuntimeError, setSabiQrRuntimeToken } from "./qrRuntimeStore";
import {
  requireSabiQrActorIdentity,
  toSabiQrVerifiedIdentityPayload,
} from "./qrIdentityBinding";

function buildAutoReference(definition: SabiQrFunctionDefinition, actorUserId: string) {
  const stamp = Date.now().toString(36).toUpperCase();
  const suffix = actorUserId.slice(-6).toUpperCase();
  return `${definition.code.toUpperCase()}-${suffix}-${stamp}`;
}

export async function generateSabiQrToken(definition: SabiQrFunctionDefinition, input: {
  amount?: string | null;
  currency?: string | null;
  reference?: string | null;
  counterpartyId?: string | null;
  organizationId?: string | null;
}) {
  assertQrFunctionSeparation(definition);

  const inputError = validateQrInput(definition, input);
  if (inputError) {
    setSabiQrRuntimeError(inputError);
    throw new Error(inputError);
  }

  const actor = requireSabiQrActorIdentity();
  patchSabiQrRuntimeState({ status: "generating", lastError: null });

  const amount = normalizeQrAmount(input.amount);
  const currency = normalizeQrCurrency(input.currency);
  const verifiedIdentity = toSabiQrVerifiedIdentityPayload(actor);
  const reference = normalizeQrText(input.reference) ?? buildAutoReference(definition, actor.userId);
  const counterpartyId = normalizeQrText(input.counterpartyId);
  const organizationId = normalizeQrText(input.organizationId);
  const walletQrMetadata = await buildWalletQrTokenMetadata(definition, {
    amount,
    currency,
    reference,
    counterpartyId,
    organizationId,
  });

  const request: SabiQrTokenRequest = {
    functionCode: definition.code,
    actorUserId: actor.userId,
    amount,
    currency,
    reference,
    counterpartyId,
    organizationId,
    verifiedIdentity,
    metadata: {
      actorUserId: actor.userId,
      verifiedFirstName: actor.firstName,
      verifiedLastName: actor.lastName,
      verifiedDisplayName: actor.displayName,
      verifiedUsername: actor.username,
      sabiDisplayId: actor.sabiDisplayId,
      profileCompleted: actor.profileCompleted,
      verificationStatus: actor.verificationStatus,
      identitySource: actor.source,
      autoFilledIdentity: true,
      ...walletQrMetadata,
    },
  };

  try {
    const token = await createSabiQrToken(request);
    validateServerSignedToken(token);
    setSabiQrRuntimeToken(token);
    return token;
  } catch (error) {
    const message = error instanceof Error && error.message.startsWith("qr.mobile.")
      ? error.message
      : "qr.mobile.error.createFailed";
    setSabiQrRuntimeError(message);
    throw new Error(message);
  }
}

export const sabiQrRuntime = {
  generate: generateSabiQrToken,
  resolve: resolveSabiQr,
  validate: validateSabiQr,
  execute: executeSabiQr,
};
