import {
  TAXI_DRIVER_BALANCE_COIN,
  TAXI_DRIVER_COMMISSION_RATE,
  TAXI_DRIVER_MINIMUM_BALANCE_COIN,
  deliveryOptions,
  deliveryTariffs,
  driverDocuments,
  driverOrders,
  rideOptions,
  rideTariffs,
  taxiPoints,
} from "../data/taxi.local";
import {
  courierProofChain,
  dispatchTransparencyCards,
  driverBalancePolicyCards,
  driverLedgerPreview,
  driverMoneyGuardCards,
  driverSettlementGuardCards,
  driverReadinessCards,
  navigationCleanCards,
  passengerFareBreakdownCards,
  premiumAssuranceCards,
  premiumControlDeck,
  premiumQuickActions,
  premiumRouteCards,
  taxiOperationalReadinessCards,
  taxiRuntimeChecklist,
  driverDispatchPoolCards,
  taxiPassengerPremiumPolishCards,
  taxiNoBackgroundLifecycleCards,
  taxiDriverRevenueIntegrityCards,
  taxiCourierPremiumFlowCards,
  taxiRideSummaryReadinessCards,
  taxiSafetyTrustCards,
  taxiIntercityControlCards,
  taxiDriverAccessEnforcementCards,
  taxiFinalProductionReadinessCards,
  taxiPassengerOneTapFlowCards,
  taxiProviderRuntimeBoundaryCards,
  taxiDriverTopUpReadinessCards,
  taxiSessionExitContractCards,
  taxiPaymentTruthCards,
  taxiDriverLiquidityContractCards,
  taxiDriverCountryLeagueCards,
  taxiPassengerCountryLeagueCards,
  taxiLeaguePrizeCards,
  taxiLeagueFairPlayCards,
  taxiLeagueScoringIntegrityCards,
  taxiMutualRatingCards,
  taxiLeaguePrizeGovernanceCards,
  taxiLeagueSeasonCards,
  taxiLeagueAntiAbuseCards,
  taxiLeagueStarEtiquetteCards,
  taxiSabiAiFairnessCards,
  taxiDailyComplaintPenaltyCards,
  taxiComplaintEvidenceCards,
  taxiCancelAfterComplaintCards,
  taxiComplaintDailyResetCards,
  taxiSabiAiEvidenceSignalCards,
  taxiFairnessAppealFlowCards,
  taxiContestDisciplineCards,
  taxiDailyFairnessEscalationCards,
  taxiSabiAiContestAnalyticsCards,
  taxiParticipantTrustStatusCards,
  taxiLeagueRewardSafetyCards,
  taxiDailySanctionHistoryCards,
  taxiFairnessFreezeReasonCards,
  taxiParticipantAppealStatusCards,
  taxiSabiAiComplaintDecisionCards,
  taxiLeagueScoreImpactCards,
  taxiCooldownReasonCards,
  taxiFalseComplaintProtectionCards,
  taxiPostReviewRecoveryCards,
  taxiLeagueAuditTrailCards,
  taxiScoreAdjustmentReasonCards,
  taxiDisputeEvidenceTimelineCards,
  taxiLeagueTransparencyCards,
  taxiLeagueWarningNudgeCards,
  taxiCivilityCoachingCards,
  taxiSabiAiRiskConfidenceCards,
  taxiContestEligibilityGuardCards,
  taxiKernelBoundConnectionCards,
  taxiAdminDailyReportSummaryCards,
  taxiFoundationAdminCompletionCards,
  taxiPremiumKernelUxCards,
} from "../data/taxi.premium";
import type {
  TaxiDriverGate,
  TaxiEstimate,
  TaxiPassengerGate,
  TaxiPassengerService,
  TaxiPointId,
  TaxiTariffId,
} from "../domain/taxi.types";

export function getTaxiPoints() {
  return taxiPoints;
}

export function getRideTariffs() {
  return rideTariffs;
}

export function getDeliveryTariffs() {
  return deliveryTariffs;
}

export function getTaxiTariffs(service: TaxiPassengerService) {
  return service === "delivery" ? deliveryTariffs : rideTariffs;
}

export function getTaxiOptions(service: TaxiPassengerService) {
  return service === "delivery" ? deliveryOptions : rideOptions;
}

export function getDriverOrders() {
  return driverOrders;
}

export function getDriverDocuments() {
  return driverDocuments;
}

export function getPremiumQuickActions() {
  return premiumQuickActions;
}

export function getTaxiRuntimeChecklist() {
  return taxiRuntimeChecklist;
}

export function getDriverLedgerPreview() {
  return driverLedgerPreview;
}

export function getPremiumRouteCards() {
  return premiumRouteCards;
}

export function getDriverReadinessCards() {
  return driverReadinessCards;
}

export function getPremiumControlDeck() {
  return premiumControlDeck;
}

export function getPremiumAssuranceCards() {
  return premiumAssuranceCards;
}

export function getDriverMoneyGuardCards() {
  return driverMoneyGuardCards;
}

export function getCourierProofChain() {
  return courierProofChain;
}

export function getDriverBalancePolicyCards() {
  return driverBalancePolicyCards;
}

export function getDispatchTransparencyCards() {
  return dispatchTransparencyCards;
}

export function getNavigationCleanCards() {
  return navigationCleanCards;
}

export function getDriverSettlementGuardCards() {
  return driverSettlementGuardCards;
}

export function getPassengerFareBreakdownCards() {
  return passengerFareBreakdownCards;
}

export function getTaxiOperationalReadinessCards() {
  return taxiOperationalReadinessCards;
}

export function getDriverDispatchPoolCards() {
  return driverDispatchPoolCards;
}

export function getTaxiPassengerPremiumPolishCards() {
  return taxiPassengerPremiumPolishCards;
}

export function getTaxiNoBackgroundLifecycleCards() {
  return taxiNoBackgroundLifecycleCards;
}

export function getTaxiDriverRevenueIntegrityCards() {
  return taxiDriverRevenueIntegrityCards;
}

export function getTaxiCourierPremiumFlowCards() {
  return taxiCourierPremiumFlowCards;
}

export function getTaxiRideSummaryReadinessCards() {
  return taxiRideSummaryReadinessCards;
}

export function getTaxiSafetyTrustCards() {
  return taxiSafetyTrustCards;
}

export function getTaxiIntercityControlCards() {
  return taxiIntercityControlCards;
}

export function getTaxiDriverAccessEnforcementCards() {
  return taxiDriverAccessEnforcementCards;
}

export function getTaxiPoint(id: TaxiPointId) {
  return taxiPoints.find((point) => point.id === id) ?? taxiPoints[0];
}

export function getTaxiTariff(service: TaxiPassengerService, tariffId: TaxiTariffId) {
  const list = getTaxiTariffs(service);
  return list.find((item) => item.id === tariffId) ?? list[0];
}

export function calculateDriverCommission(quoteCoin: number) {
  return Number((quoteCoin * TAXI_DRIVER_COMMISSION_RATE).toFixed(2));
}

export function buildTaxiEstimate(input: {
  service: TaxiPassengerService;
  fromId: TaxiPointId;
  toId: TaxiPointId;
  tariffId: TaxiTariffId;
}): TaxiEstimate {
  const from = getTaxiPoint(input.fromId);
  const to = getTaxiPoint(input.toId);
  const tariff = getTaxiTariff(input.service, input.tariffId);
  const tripKind = to.intercity || tariff.intercityReady ? "intercity" : "city";
  const baseDistance = Math.abs(to.distanceKm - from.distanceKm);
  const distanceKm = Math.max(tripKind === "intercity" ? 75 : 1.8, baseDistance + (input.service === "delivery" ? 1.2 : 2.1));
  const trafficLevel = tripKind === "intercity" ? "medium" : distanceKm > 10 ? "high" : "medium";
  const averageSpeedKmh = tripKind === "intercity" ? 86 : trafficLevel === "high" ? 22 : 34;
  const durationMin = Math.round((distanceKm / averageSpeedKmh) * 60 + tariff.etaMin);
  const distanceMultiplier = tripKind === "intercity" ? 0.42 : input.service === "delivery" ? 1.05 : 1.22;
  const quoteCoin = Math.max(tariff.priceCoin, Math.round(tariff.priceCoin + distanceKm * distanceMultiplier));
  const driverCommissionCoin = calculateDriverCommission(quoteCoin);

  return {
    from,
    to,
    tariff,
    tripKind,
    distanceKm: Number(distanceKm.toFixed(1)),
    durationMin,
    etaMin: tariff.etaMin,
    quoteCoin,
    trafficLevel,
    averageSpeedKmh,
    driverCommissionCoin,
    driverNetCoin: Number((quoteCoin - driverCommissionCoin).toFixed(2)),
    runtimeStatus: "preview_only",
  };
}

export function buildPassengerGate(input: { kycPassed: boolean; walletReady: boolean; providerReady: boolean }): TaxiPassengerGate {
  if (!input.kycPassed) return { allowed: false, reasonKey: "gate.passenger.kyc", kycRequired: true, walletRequired: false, providerRequired: false };
  if (!input.walletReady) return { allowed: false, reasonKey: "gate.passenger.wallet", kycRequired: false, walletRequired: true, providerRequired: false };
  if (!input.providerReady) return { allowed: false, reasonKey: "gate.passenger.provider", kycRequired: false, walletRequired: false, providerRequired: true };
  return { allowed: true, reasonKey: "gate.passenger.ready", kycRequired: false, walletRequired: false, providerRequired: false };
}

export function buildDriverGate(input?: { balanceCoin?: number; quoteCoin?: number }): TaxiDriverGate {
  const allApproved = driverDocuments.every((doc) => doc.status === "approved");
  const balanceCoin = input?.balanceCoin ?? TAXI_DRIVER_BALANCE_COIN;
  const quoteCoin = input?.quoteCoin ?? driverOrders[0]?.quoteCoin ?? 0;
  const commissionPreviewCoin = calculateDriverCommission(quoteCoin);
  const balanceTopUpRequired = balanceCoin < TAXI_DRIVER_MINIMUM_BALANCE_COIN || balanceCoin < commissionPreviewCoin;
  const acceptOrderAllowed = allApproved && !balanceTopUpRequired;

  return {
    onlineAllowed: allApproved && !balanceTopUpRequired,
    acceptOrderAllowed,
    balanceTopUpRequired,
    reasonKey: !allApproved ? "gate.driver.documents" : balanceTopUpRequired ? "gate.driver.balance" : "gate.driver.ready",
    verificationStatus: allApproved ? "approved" : "pending",
    balanceCoin,
    minimumBalanceCoin: TAXI_DRIVER_MINIMUM_BALANCE_COIN,
    commissionRate: TAXI_DRIVER_COMMISSION_RATE,
    commissionPreviewCoin,
    netPreviewCoin: Number((quoteCoin - commissionPreviewCoin).toFixed(2)),
  };
}

export function getTaxiFinalProductionReadinessCards() {
  return taxiFinalProductionReadinessCards;
}

export function getTaxiPassengerOneTapFlowCards() {
  return taxiPassengerOneTapFlowCards;
}

export function getTaxiProviderRuntimeBoundaryCards() {
  return taxiProviderRuntimeBoundaryCards;
}

export function getTaxiDriverTopUpReadinessCards() {
  return taxiDriverTopUpReadinessCards;
}

export function getTaxiSessionExitContractCards() {
  return taxiSessionExitContractCards;
}

export function getTaxiPaymentTruthCards() {
  return taxiPaymentTruthCards;
}

export function getTaxiDriverLiquidityContractCards() {
  return taxiDriverLiquidityContractCards;
}

export function getTaxiDriverCountryLeagueCards() {
  return taxiDriverCountryLeagueCards;
}

export function getTaxiPassengerCountryLeagueCards() {
  return taxiPassengerCountryLeagueCards;
}

export function getTaxiLeaguePrizeCards() {
  return taxiLeaguePrizeCards;
}

export function getTaxiLeagueFairPlayCards() {
  return taxiLeagueFairPlayCards;
}


export function getTaxiLeagueScoringIntegrityCards() {
  return taxiLeagueScoringIntegrityCards;
}

export function getTaxiMutualRatingCards() {
  return taxiMutualRatingCards;
}

export function getTaxiLeaguePrizeGovernanceCards() {
  return taxiLeaguePrizeGovernanceCards;
}


export function getTaxiLeagueSeasonCards() {
  return taxiLeagueSeasonCards;
}

export function getTaxiLeagueAntiAbuseCards() {
  return taxiLeagueAntiAbuseCards;
}

export function getTaxiLeagueStarEtiquetteCards() {
  return taxiLeagueStarEtiquetteCards;
}


export function getTaxiSabiAiFairnessCards() {
  return taxiSabiAiFairnessCards;
}

export function getTaxiDailyComplaintPenaltyCards() {
  return taxiDailyComplaintPenaltyCards;
}

export function getTaxiComplaintEvidenceCards() {
  return taxiComplaintEvidenceCards;
}

export function getTaxiCancelAfterComplaintCards() {
  return taxiCancelAfterComplaintCards;
}


export function getTaxiComplaintDailyResetCards() {
  return taxiComplaintDailyResetCards;
}

export function getTaxiSabiAiEvidenceSignalCards() {
  return taxiSabiAiEvidenceSignalCards;
}

export function getTaxiFairnessAppealFlowCards() {
  return taxiFairnessAppealFlowCards;
}

export function getTaxiContestDisciplineCards() {
  return taxiContestDisciplineCards;
}


export function getTaxiDailyFairnessEscalationCards() {
  return taxiDailyFairnessEscalationCards;
}

export function getTaxiSabiAiContestAnalyticsCards() {
  return taxiSabiAiContestAnalyticsCards;
}

export function getTaxiParticipantTrustStatusCards() {
  return taxiParticipantTrustStatusCards;
}

export function getTaxiLeagueRewardSafetyCards() {
  return taxiLeagueRewardSafetyCards;
}

export function getTaxiDailySanctionHistoryCards() {
  return taxiDailySanctionHistoryCards;
}

export function getTaxiFairnessFreezeReasonCards() {
  return taxiFairnessFreezeReasonCards;
}

export function getTaxiParticipantAppealStatusCards() {
  return taxiParticipantAppealStatusCards;
}

export function getTaxiSabiAiComplaintDecisionCards() {
  return taxiSabiAiComplaintDecisionCards;
}

export function getTaxiLeagueScoreImpactCards() {
  return taxiLeagueScoreImpactCards;
}

export function getTaxiCooldownReasonCards() {
  return taxiCooldownReasonCards;
}

export function getTaxiFalseComplaintProtectionCards() {
  return taxiFalseComplaintProtectionCards;
}

export function getTaxiPostReviewRecoveryCards() {
  return taxiPostReviewRecoveryCards;
}


export function getTaxiLeagueAuditTrailCards() {
  return taxiLeagueAuditTrailCards;
}

export function getTaxiScoreAdjustmentReasonCards() {
  return taxiScoreAdjustmentReasonCards;
}

export function getTaxiDisputeEvidenceTimelineCards() {
  return taxiDisputeEvidenceTimelineCards;
}

export function getTaxiLeagueTransparencyCards() {
  return taxiLeagueTransparencyCards;
}


export function getTaxiLeagueWarningNudgeCards() {
  return taxiLeagueWarningNudgeCards;
}

export function getTaxiCivilityCoachingCards() {
  return taxiCivilityCoachingCards;
}

export function getTaxiSabiAiRiskConfidenceCards() {
  return taxiSabiAiRiskConfidenceCards;
}

export function getTaxiContestEligibilityGuardCards() {
  return taxiContestEligibilityGuardCards;
}


export function getTaxiKernelBoundConnectionCards() {
  return taxiKernelBoundConnectionCards;
}

export function getTaxiAdminDailyReportSummaryCards() {
  return taxiAdminDailyReportSummaryCards;
}

export function getTaxiFoundationAdminCompletionCards() {
  return taxiFoundationAdminCompletionCards;
}

export function getTaxiPremiumKernelUxCards() {
  return taxiPremiumKernelUxCards;
}
