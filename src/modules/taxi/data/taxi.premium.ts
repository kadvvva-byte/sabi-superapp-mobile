export interface TaxiPremiumAction {
  id: string;
  titleKey: string;
  subtitleKey: string;
  lockedKey: string;
}

export interface TaxiRuntimeChecklistItem {
  id: string;
  titleKey: string;
  descriptionKey: string;
}

export interface TaxiDriverLedgerStep {
  id: string;
  titleKey: string;
  descriptionKey: string;
}

export interface TaxiPremiumRouteCard {
  id: string;
  titleKey: string;
  descriptionKey: string;
  lockedKey: string;
}

export interface TaxiDriverReadinessCard {
  id: string;
  titleKey: string;
  descriptionKey: string;
  lockedKey: string;
}

export interface TaxiPremiumControlCard {
  id: string;
  titleKey: string;
  descriptionKey: string;
  statusKey: string;
}

export interface TaxiCourierProofStep {
  id: string;
  titleKey: string;
  descriptionKey: string;
  lockedKey: string;
}

export interface TaxiDriverBalancePolicyCard {
  id: string;
  titleKey: string;
  descriptionKey: string;
  statusKey: string;
}

export interface TaxiPremiumAssuranceCard {
  id: string;
  titleKey: string;
  descriptionKey: string;
  statusKey: string;
}

export interface TaxiDispatchTransparencyCard {
  id: string;
  titleKey: string;
  descriptionKey: string;
  statusKey: string;
}

export interface TaxiNavigationCleanCard {
  id: string;
  titleKey: string;
  descriptionKey: string;
  statusKey: string;
}

export interface TaxiDriverSettlementGuardCard {
  id: string;
  titleKey: string;
  descriptionKey: string;
  statusKey: string;
}

export interface TaxiPremiumReadinessCard {
  id: string;
  titleKey: string;
  descriptionKey: string;
  statusKey: string;
}

export const premiumQuickActions: TaxiPremiumAction[] = [
  { id: "home-airport", titleKey: "quick.homeAirport.title", subtitleKey: "quick.homeAirport.subtitle", lockedKey: "runtime.locked" },
  { id: "intercity-samarkand", titleKey: "quick.intercity.title", subtitleKey: "quick.intercity.subtitle", lockedKey: "premium.layer.locked" },
  { id: "courier-food", titleKey: "quick.courier.title", subtitleKey: "quick.courier.subtitle", lockedKey: "delivery.proof.text" },
  { id: "family-safe", titleKey: "quick.family.title", subtitleKey: "quick.family.subtitle", lockedKey: "safety.text" },
];

export const taxiRuntimeChecklist: TaxiRuntimeChecklistItem[] = [
  { id: "location", titleKey: "check.location.title", descriptionKey: "check.location.text" },
  { id: "payment", titleKey: "check.payment.title", descriptionKey: "check.payment.text" },
  { id: "matching", titleKey: "check.matching.title", descriptionKey: "check.matching.text" },
  { id: "completion", titleKey: "check.completion.title", descriptionKey: "check.completion.text" },
];

export const driverLedgerPreview: TaxiDriverLedgerStep[] = [
  { id: "balance", titleKey: "ledger.balance.title", descriptionKey: "ledger.balance.text" },
  { id: "trip", titleKey: "ledger.trip.title", descriptionKey: "ledger.trip.text" },
  { id: "commission", titleKey: "ledger.commission.title", descriptionKey: "ledger.commission.text" },
  { id: "net", titleKey: "ledger.net.title", descriptionKey: "ledger.net.text" },
];

export const premiumRouteCards: TaxiPremiumRouteCard[] = [
  { id: "pickup", titleKey: "route.smartPickup.title", descriptionKey: "route.smartPickup.text", lockedKey: "premium.layer.locked" },
  { id: "traffic-radar", titleKey: "route.trafficRadar.title", descriptionKey: "route.trafficRadar.text", lockedKey: "runtime.locked" },
  { id: "intercity-night", titleKey: "route.intercityNight.title", descriptionKey: "route.intercityNight.text", lockedKey: "intercity.safety" },
  { id: "background", titleKey: "route.noBackground.title", descriptionKey: "route.noBackground.text", lockedKey: "runtime.closedTaxi" },
];

export const driverReadinessCards: TaxiDriverReadinessCard[] = [
  { id: "balance", titleKey: "driver.ready.balance.title", descriptionKey: "driver.ready.balance.text", lockedKey: "gate.driver.balance" },
  { id: "documents", titleKey: "driver.ready.documents.title", descriptionKey: "driver.ready.documents.text", lockedKey: "gate.driver.documents" },
  { id: "dispatch", titleKey: "driver.ready.dispatch.title", descriptionKey: "driver.ready.dispatch.text", lockedKey: "runtime.locked" },
  { id: "exact", titleKey: "driver.ready.exact.title", descriptionKey: "driver.ready.exact.text", lockedKey: "driver.balance.topup.locked" },
];


export const premiumControlDeck: TaxiPremiumControlCard[] = [
  { id: "one-screen-order", titleKey: "control.oneScreen.title", descriptionKey: "control.oneScreen.text", statusKey: "control.status.preview" },
  { id: "route-confidence", titleKey: "control.routeConfidence.title", descriptionKey: "control.routeConfidence.text", statusKey: "control.status.provider" },
  { id: "fare-lock", titleKey: "control.fareLock.title", descriptionKey: "control.fareLock.text", statusKey: "control.status.noPayment" },
  { id: "privacy", titleKey: "control.privacy.title", descriptionKey: "control.privacy.text", statusKey: "control.status.noBackground" },
  { id: "session-open", titleKey: "lifecycle.open.title", descriptionKey: "lifecycle.open.text", statusKey: "lifecycle.status.uiOnly" },
  { id: "session-active", titleKey: "lifecycle.active.title", descriptionKey: "lifecycle.active.text", statusKey: "lifecycle.status.runtimeLocked" },
  { id: "session-close", titleKey: "lifecycle.close.title", descriptionKey: "lifecycle.close.text", statusKey: "lifecycle.status.shutdown" },
  { id: "session-recover", titleKey: "lifecycle.recover.title", descriptionKey: "lifecycle.recover.text", statusKey: "lifecycle.status.noFakeResume" },
];

export const courierProofChain: TaxiCourierProofStep[] = [
  { id: "pickup", titleKey: "courier.chain.pickup.title", descriptionKey: "courier.chain.pickup.text", lockedKey: "delivery.proof.text" },
  { id: "route", titleKey: "courier.chain.route.title", descriptionKey: "courier.chain.route.text", lockedKey: "runtime.locked" },
  { id: "handoff", titleKey: "courier.chain.handoff.title", descriptionKey: "courier.chain.handoff.text", lockedKey: "courier.chain.locked" },
];

export const driverBalancePolicyCards: TaxiDriverBalancePolicyCard[] = [
  { id: "reserve", titleKey: "driver.policy.reserve.title", descriptionKey: "driver.policy.reserve.text", statusKey: "gate.driver.balance" },
  { id: "auto-debit", titleKey: "driver.policy.autodebit.title", descriptionKey: "driver.policy.autodebit.text", statusKey: "driver.balance.autodebit" },
  { id: "no-payout", titleKey: "driver.policy.noPayout.title", descriptionKey: "driver.policy.noPayout.text", statusKey: "runtime.locked" },
];

export const premiumAssuranceCards: TaxiPremiumAssuranceCard[] = [
  { id: "airport", titleKey: "assurance.airport.title", descriptionKey: "assurance.airport.text", statusKey: "control.status.provider" },
  { id: "family", titleKey: "assurance.family.title", descriptionKey: "assurance.family.text", statusKey: "control.status.preview" },
  { id: "business", titleKey: "assurance.business.title", descriptionKey: "assurance.business.text", statusKey: "control.status.noPayment" },
  { id: "intercity", titleKey: "assurance.intercity.title", descriptionKey: "assurance.intercity.text", statusKey: "premium.layer.locked" },
];

export const driverMoneyGuardCards: TaxiPremiumAssuranceCard[] = [
  { id: "balance-gate", titleKey: "driver.money.balance.title", descriptionKey: "driver.money.balance.text", statusKey: "gate.driver.balance" },
  { id: "commission-gate", titleKey: "driver.money.commission.title", descriptionKey: "driver.money.commission.text", statusKey: "driver.balance.autodebit" },
  { id: "reserve-gate", titleKey: "driver.money.reserve.title", descriptionKey: "driver.money.reserve.text", statusKey: "driver.policy.reserveMetric" },
  { id: "payout-gate", titleKey: "driver.money.payout.title", descriptionKey: "driver.money.payout.text", statusKey: "runtime.locked" },
];



export const passengerFareBreakdownCards: TaxiPremiumControlCard[] = [
  { id: "base-fare", titleKey: "fare.breakdown.base.title", descriptionKey: "fare.breakdown.base.text", statusKey: "control.status.preview" },
  { id: "route-cost", titleKey: "fare.breakdown.route.title", descriptionKey: "fare.breakdown.route.text", statusKey: "premium.layer.locked" },
  { id: "service-fee", titleKey: "fare.breakdown.service.title", descriptionKey: "fare.breakdown.service.text", statusKey: "control.status.noPayment" },
  { id: "driver-net", titleKey: "fare.breakdown.driverNet.title", descriptionKey: "fare.breakdown.driverNet.text", statusKey: "driver.balance.autodebit" },
  { id: "no-debit", titleKey: "fare.breakdown.noDebit.title", descriptionKey: "fare.breakdown.noDebit.text", statusKey: "control.status.noPayment" },
];

export const taxiOperationalReadinessCards: TaxiPremiumControlCard[] = [
  { id: "request-builder", titleKey: "ops.readiness.request.title", descriptionKey: "ops.readiness.request.text", statusKey: "control.status.preview" },
  { id: "geo-permission", titleKey: "ops.readiness.geo.title", descriptionKey: "ops.readiness.geo.text", statusKey: "lifecycle.status.runtimeLocked" },
  { id: "dispatch-runtime", titleKey: "ops.readiness.dispatch.title", descriptionKey: "ops.readiness.dispatch.text", statusKey: "runtime.locked" },
  { id: "clean-close", titleKey: "ops.readiness.close.title", descriptionKey: "ops.readiness.close.text", statusKey: "lifecycle.status.shutdown" },
  { id: "state-recovery", titleKey: "ops.readiness.recover.title", descriptionKey: "ops.readiness.recover.text", statusKey: "lifecycle.status.noFakeResume" },
];

export const driverDispatchPoolCards: TaxiPremiumControlCard[] = [
  { id: "pool-balance", titleKey: "driver.pool.balance.title", descriptionKey: "driver.pool.balance.text", statusKey: "gate.driver.balance" },
  { id: "pool-documents", titleKey: "driver.pool.docs.title", descriptionKey: "driver.pool.docs.text", statusKey: "gate.driver.documents" },
  { id: "pool-reserve", titleKey: "driver.pool.reserve.title", descriptionKey: "driver.pool.reserve.text", statusKey: "driver.policy.reserveMetric" },
  { id: "pool-commission", titleKey: "driver.pool.commission.title", descriptionKey: "driver.pool.commission.text", statusKey: "driver.balance.autodebit" },
  { id: "pool-provider", titleKey: "driver.pool.provider.title", descriptionKey: "driver.pool.provider.text", statusKey: "driver.balance.topup.locked" },
];


export const taxiPassengerPremiumPolishCards: TaxiPremiumControlCard[] = [
  { id: "pickup-clarity", titleKey: "polish.passenger.pickup.title", descriptionKey: "polish.passenger.pickup.text", statusKey: "control.status.preview" },
  { id: "fare-confidence", titleKey: "polish.passenger.fare.title", descriptionKey: "polish.passenger.fare.text", statusKey: "control.status.noPayment" },
  { id: "intercity-comfort", titleKey: "polish.passenger.intercity.title", descriptionKey: "polish.passenger.intercity.text", statusKey: "premium.layer.locked" },
  { id: "safety-routing", titleKey: "polish.passenger.safety.title", descriptionKey: "polish.passenger.safety.text", statusKey: "lifecycle.status.runtimeLocked" },
];

export const taxiNoBackgroundLifecycleCards: TaxiPremiumControlCard[] = [
  { id: "cold-open", titleKey: "lifecycle.guard.coldOpen.title", descriptionKey: "lifecycle.guard.coldOpen.text", statusKey: "lifecycle.status.uiOnly" },
  { id: "close-stop", titleKey: "lifecycle.guard.closeStop.title", descriptionKey: "lifecycle.guard.closeStop.text", statusKey: "lifecycle.status.shutdown" },
  { id: "active-only", titleKey: "lifecycle.guard.activeOnly.title", descriptionKey: "lifecycle.guard.activeOnly.text", statusKey: "lifecycle.status.runtimeLocked" },
  { id: "resume-verified", titleKey: "lifecycle.guard.resumeVerified.title", descriptionKey: "lifecycle.guard.resumeVerified.text", statusKey: "lifecycle.status.noFakeResume" },
];

export const taxiDriverRevenueIntegrityCards: TaxiPremiumControlCard[] = [
  { id: "balance-required", titleKey: "driver.revenue.balance.title", descriptionKey: "driver.revenue.balance.text", statusKey: "gate.driver.balance" },
  { id: "commission-real", titleKey: "driver.revenue.commission.title", descriptionKey: "driver.revenue.commission.text", statusKey: "driver.balance.autodebit" },
  { id: "no-settlement-before-close", titleKey: "driver.revenue.settlement.title", descriptionKey: "driver.revenue.settlement.text", statusKey: "driver.settlement.locked" },
  { id: "no-payout-fake", titleKey: "driver.revenue.payout.title", descriptionKey: "driver.revenue.payout.text", statusKey: "runtime.locked" },
];

export const taxiCourierPremiumFlowCards: TaxiPremiumControlCard[] = [
  { id: "pickup-proof", titleKey: "courier.premium.pickup.title", descriptionKey: "courier.premium.pickup.text", statusKey: "courier.chain.locked" },
  { id: "recipient-privacy", titleKey: "courier.premium.privacy.title", descriptionKey: "courier.premium.privacy.text", statusKey: "control.status.provider" },
  { id: "handoff-dispute", titleKey: "courier.premium.dispute.title", descriptionKey: "courier.premium.dispute.text", statusKey: "dispatch.status.policy" },
  { id: "settlement-after-proof", titleKey: "courier.premium.settlement.title", descriptionKey: "courier.premium.settlement.text", statusKey: "driver.balance.autodebit" },
];

export const dispatchTransparencyCards: TaxiDispatchTransparencyCard[] = [
  { id: "quote", titleKey: "dispatch.quote.title", descriptionKey: "dispatch.quote.text", statusKey: "control.status.noPayment" },
  { id: "driver", titleKey: "dispatch.driver.title", descriptionKey: "dispatch.driver.text", statusKey: "runtime.locked" },
  { id: "route", titleKey: "dispatch.route.title", descriptionKey: "dispatch.route.text", statusKey: "control.status.provider" },
  { id: "cancel", titleKey: "dispatch.cancel.title", descriptionKey: "dispatch.cancel.text", statusKey: "dispatch.status.policy" },
];

export const navigationCleanCards: TaxiNavigationCleanCard[] = [
  { id: "layers", titleKey: "nav.clean.layers.title", descriptionKey: "nav.clean.layers.text", statusKey: "premium.layer.locked" },
  { id: "speed", titleKey: "nav.clean.speed.title", descriptionKey: "nav.clean.speed.text", statusKey: "control.status.provider" },
  { id: "background", titleKey: "nav.clean.background.title", descriptionKey: "nav.clean.background.text", statusKey: "control.status.noBackground" },
  { id: "permissions", titleKey: "nav.clean.permissions.title", descriptionKey: "nav.clean.permissions.text", statusKey: "lifecycle.status.runtimeLocked" },
  { id: "close-clean", titleKey: "nav.clean.close.title", descriptionKey: "nav.clean.close.text", statusKey: "lifecycle.status.shutdown" },
];

export const driverSettlementGuardCards: TaxiDriverSettlementGuardCard[] = [
  { id: "before-line", titleKey: "driver.settlement.before.title", descriptionKey: "driver.settlement.before.text", statusKey: "gate.driver.balance" },
  { id: "after-trip", titleKey: "driver.settlement.after.title", descriptionKey: "driver.settlement.after.text", statusKey: "driver.balance.autodebit" },
  { id: "dispute", titleKey: "driver.settlement.dispute.title", descriptionKey: "driver.settlement.dispute.text", statusKey: "driver.settlement.locked" },
  { id: "ledger", titleKey: "driver.settlement.ledger.title", descriptionKey: "driver.settlement.ledger.text", statusKey: "runtime.locked" },
  { id: "no-balance-no-order", titleKey: "driver.access.noBalance.title", descriptionKey: "driver.access.noBalance.text", statusKey: "gate.driver.balance" },
  { id: "topup-not-fake", titleKey: "driver.access.topup.title", descriptionKey: "driver.access.topup.text", statusKey: "driver.balance.topup.locked" },
  { id: "auto-commission-real", titleKey: "driver.access.commission.title", descriptionKey: "driver.access.commission.text", statusKey: "driver.balance.autodebit" },
];

export const taxiRideSummaryReadinessCards: TaxiPremiumReadinessCard[] = [
  { id: "summary-no-completion", titleKey: "summary.ready.noCompletion.title", descriptionKey: "summary.ready.noCompletion.text", statusKey: "runtime.locked" },
  { id: "summary-rating", titleKey: "summary.ready.rating.title", descriptionKey: "summary.ready.rating.text", statusKey: "lifecycle.status.runtimeLocked" },
  { id: "summary-tips", titleKey: "summary.ready.tips.title", descriptionKey: "summary.ready.tips.text", statusKey: "control.status.noPayment" },
  { id: "summary-receipt", titleKey: "summary.ready.receipt.title", descriptionKey: "summary.ready.receipt.text", statusKey: "driver.settlement.locked" },
];

export const taxiSafetyTrustCards: TaxiPremiumReadinessCard[] = [
  { id: "sos-locked", titleKey: "trust.safety.sos.title", descriptionKey: "trust.safety.sos.text", statusKey: "lifecycle.status.runtimeLocked" },
  { id: "route-share", titleKey: "trust.safety.share.title", descriptionKey: "trust.safety.share.text", statusKey: "control.status.provider" },
  { id: "masked-calls", titleKey: "trust.safety.mask.title", descriptionKey: "trust.safety.mask.text", statusKey: "control.status.preview" },
  { id: "incident-policy", titleKey: "trust.safety.incident.title", descriptionKey: "trust.safety.incident.text", statusKey: "dispatch.status.policy" },
];

export const taxiIntercityControlCards: TaxiPremiumReadinessCard[] = [
  { id: "stops", titleKey: "intercity.control.stops.title", descriptionKey: "intercity.control.stops.text", statusKey: "premium.layer.locked" },
  { id: "driver-rest", titleKey: "intercity.control.rest.title", descriptionKey: "intercity.control.rest.text", statusKey: "control.status.provider" },
  { id: "speed-radar", titleKey: "intercity.control.speed.title", descriptionKey: "intercity.control.speed.text", statusKey: "lifecycle.status.runtimeLocked" },
  { id: "price-boundary", titleKey: "intercity.control.price.title", descriptionKey: "intercity.control.price.text", statusKey: "control.status.noPayment" },
];

export const taxiDriverAccessEnforcementCards: TaxiPremiumReadinessCard[] = [
  { id: "no-balance-no-feed", titleKey: "driver.enforce.feed.title", descriptionKey: "driver.enforce.feed.text", statusKey: "gate.driver.balance" },
  { id: "reserve-before-offer", titleKey: "driver.enforce.reserve.title", descriptionKey: "driver.enforce.reserve.text", statusKey: "driver.policy.reserveMetric" },
  { id: "completed-before-debit", titleKey: "driver.enforce.debit.title", descriptionKey: "driver.enforce.debit.text", statusKey: "driver.balance.autodebit" },
  { id: "payout-after-ledger", titleKey: "driver.enforce.payout.title", descriptionKey: "driver.enforce.payout.text", statusKey: "runtime.locked" },
];

export const taxiFinalProductionReadinessCards: TaxiPremiumReadinessCard[] = [
  { id: "rider-entry", titleKey: "final.ready.rider.title", descriptionKey: "final.ready.rider.text", statusKey: "lifecycle.status.uiOnly" },
  { id: "no-background-import", titleKey: "final.ready.background.title", descriptionKey: "final.ready.background.text", statusKey: "control.status.noBackground" },
  { id: "provider-contract", titleKey: "final.ready.provider.title", descriptionKey: "final.ready.provider.text", statusKey: "control.status.provider" },
  { id: "no-fake-success", titleKey: "final.ready.noFake.title", descriptionKey: "final.ready.noFake.text", statusKey: "runtime.locked" },
];

export const taxiPassengerOneTapFlowCards: TaxiPremiumReadinessCard[] = [
  { id: "fast-ab", titleKey: "flow.oneTap.ab.title", descriptionKey: "flow.oneTap.ab.text", statusKey: "control.status.preview" },
  { id: "fast-tariff", titleKey: "flow.oneTap.tariff.title", descriptionKey: "flow.oneTap.tariff.text", statusKey: "control.status.noPayment" },
  { id: "fast-safety", titleKey: "flow.oneTap.safety.title", descriptionKey: "flow.oneTap.safety.text", statusKey: "lifecycle.status.runtimeLocked" },
  { id: "fast-close", titleKey: "flow.oneTap.close.title", descriptionKey: "flow.oneTap.close.text", statusKey: "lifecycle.status.shutdown" },
];

export const taxiProviderRuntimeBoundaryCards: TaxiPremiumReadinessCard[] = [
  { id: "location-boundary", titleKey: "boundary.runtime.location.title", descriptionKey: "boundary.runtime.location.text", statusKey: "lifecycle.status.runtimeLocked" },
  { id: "dispatch-boundary", titleKey: "boundary.runtime.dispatch.title", descriptionKey: "boundary.runtime.dispatch.text", statusKey: "runtime.locked" },
  { id: "payment-boundary", titleKey: "boundary.runtime.payment.title", descriptionKey: "boundary.runtime.payment.text", statusKey: "control.status.noPayment" },
  { id: "settlement-boundary", titleKey: "boundary.runtime.settlement.title", descriptionKey: "boundary.runtime.settlement.text", statusKey: "driver.settlement.locked" },
];

export const taxiDriverTopUpReadinessCards: TaxiPremiumReadinessCard[] = [
  { id: "topup-entry", titleKey: "driver.topup.entry.title", descriptionKey: "driver.topup.entry.text", statusKey: "driver.balance.topup.locked" },
  { id: "topup-provider", titleKey: "driver.topup.provider.title", descriptionKey: "driver.topup.provider.text", statusKey: "control.status.provider" },
  { id: "topup-no-success", titleKey: "driver.topup.noSuccess.title", descriptionKey: "driver.topup.noSuccess.text", statusKey: "runtime.locked" },
  { id: "topup-dispatch-return", titleKey: "driver.topup.dispatch.title", descriptionKey: "driver.topup.dispatch.text", statusKey: "gate.driver.balance" },
];

export const taxiSessionExitContractCards: TaxiPremiumReadinessCard[] = [
  { id: "session-open-ui", titleKey: "session.exit.open.title", descriptionKey: "session.exit.open.text", statusKey: "lifecycle.status.uiOnly" },
  { id: "session-active-trip-only", titleKey: "session.exit.active.title", descriptionKey: "session.exit.active.text", statusKey: "lifecycle.status.runtimeLocked" },
  { id: "session-close-clean", titleKey: "session.exit.close.title", descriptionKey: "session.exit.close.text", statusKey: "lifecycle.status.shutdown" },
  { id: "session-resume-backend", titleKey: "session.exit.resume.title", descriptionKey: "session.exit.resume.text", statusKey: "lifecycle.status.noFakeResume" },
];

export const taxiPaymentTruthCards: TaxiPremiumReadinessCard[] = [
  { id: "price-preview-only", titleKey: "payment.truth.preview.title", descriptionKey: "payment.truth.preview.text", statusKey: "control.status.noPayment" },
  { id: "no-hold-before-provider", titleKey: "payment.truth.hold.title", descriptionKey: "payment.truth.hold.text", statusKey: "control.status.provider" },
  { id: "tips-after-trip", titleKey: "payment.truth.tips.title", descriptionKey: "payment.truth.tips.text", statusKey: "summary.ready.tips.title" },
  { id: "receipt-from-ledger", titleKey: "payment.truth.receipt.title", descriptionKey: "payment.truth.receipt.text", statusKey: "driver.settlement.locked" },
];

export const taxiDriverLiquidityContractCards: TaxiPremiumReadinessCard[] = [
  { id: "liquidity-minimum", titleKey: "driver.liquidity.minimum.title", descriptionKey: "driver.liquidity.minimum.text", statusKey: "gate.driver.balance" },
  { id: "liquidity-reserve", titleKey: "driver.liquidity.reserve.title", descriptionKey: "driver.liquidity.reserve.text", statusKey: "driver.policy.reserveMetric" },
  { id: "liquidity-no-feed", titleKey: "driver.liquidity.feed.title", descriptionKey: "driver.liquidity.feed.text", statusKey: "driver.enforce.feed.title" },
  { id: "liquidity-topup-locked", titleKey: "driver.liquidity.topup.title", descriptionKey: "driver.liquidity.topup.text", statusKey: "driver.balance.topup.locked" },
  { id: "liquidity-commission-after-complete", titleKey: "driver.liquidity.commission.title", descriptionKey: "driver.liquidity.commission.text", statusKey: "driver.balance.autodebit" },
];

export const taxiDriverCountryLeagueCards: TaxiPremiumReadinessCard[] = [
  { id: "country-board", titleKey: "league.driver.country.title", descriptionKey: "league.driver.country.text", statusKey: "league.status.country" },
  { id: "points-orders", titleKey: "league.driver.orders.title", descriptionKey: "league.driver.orders.text", statusKey: "league.status.points" },
  { id: "points-culture", titleKey: "league.driver.culture.title", descriptionKey: "league.driver.culture.text", statusKey: "league.status.stars" },
  { id: "points-clean-car", titleKey: "league.driver.clean.title", descriptionKey: "league.driver.clean.text", statusKey: "league.status.quality" },
  { id: "top-three-prizes", titleKey: "league.driver.prizes.title", descriptionKey: "league.driver.prizes.text", statusKey: "league.status.prizeLocked" },
];

export const taxiPassengerCountryLeagueCards: TaxiPremiumReadinessCard[] = [
  { id: "rider-country-board", titleKey: "league.passenger.country.title", descriptionKey: "league.passenger.country.text", statusKey: "league.status.country" },
  { id: "rider-trip-points", titleKey: "league.passenger.trips.title", descriptionKey: "league.passenger.trips.text", statusKey: "league.status.points" },
  { id: "rider-driver-stars", titleKey: "league.passenger.stars.title", descriptionKey: "league.passenger.stars.text", statusKey: "league.status.stars" },
  { id: "rider-culture", titleKey: "league.passenger.culture.title", descriptionKey: "league.passenger.culture.text", statusKey: "league.status.quality" },
  { id: "rider-prizes", titleKey: "league.passenger.prizes.title", descriptionKey: "league.passenger.prizes.text", statusKey: "league.status.prizeLocked" },
];

export const taxiLeaguePrizeCards: TaxiPremiumReadinessCard[] = [
  { id: "first-place", titleKey: "league.prize.first.title", descriptionKey: "league.prize.first.text", statusKey: "league.status.prizeLocked" },
  { id: "second-place", titleKey: "league.prize.second.title", descriptionKey: "league.prize.second.text", statusKey: "league.status.prizeLocked" },
  { id: "third-place", titleKey: "league.prize.third.title", descriptionKey: "league.prize.third.text", statusKey: "league.status.prizeLocked" },
];

export const taxiLeagueFairPlayCards: TaxiPremiumReadinessCard[] = [
  { id: "no-gambling", titleKey: "league.fair.noGambling.title", descriptionKey: "league.fair.noGambling.text", statusKey: "runtime.locked" },
  { id: "verified-trips-only", titleKey: "league.fair.verified.title", descriptionKey: "league.fair.verified.text", statusKey: "lifecycle.status.runtimeLocked" },
  { id: "anti-abuse", titleKey: "league.fair.abuse.title", descriptionKey: "league.fair.abuse.text", statusKey: "dispatch.status.policy" },
  { id: "admin-prizes", titleKey: "league.fair.admin.title", descriptionKey: "league.fair.admin.text", statusKey: "league.status.prizeLocked" },
];


export const taxiLeagueScoringIntegrityCards: TaxiPremiumReadinessCard[] = [
  { id: "score-verified-orders", titleKey: "league.score.orders.title", descriptionKey: "league.score.orders.text", statusKey: "league.status.verifiedOnly" },
  { id: "score-driver-stars", titleKey: "league.score.driverStars.title", descriptionKey: "league.score.driverStars.text", statusKey: "league.status.twoWayStars" },
  { id: "score-passenger-stars", titleKey: "league.score.passengerStars.title", descriptionKey: "league.score.passengerStars.text", statusKey: "league.status.twoWayStars" },
  { id: "score-country-season", titleKey: "league.score.countrySeason.title", descriptionKey: "league.score.countrySeason.text", statusKey: "league.status.countrySeason" },
];

export const taxiMutualRatingCards: TaxiPremiumReadinessCard[] = [
  { id: "driver-rates-passenger", titleKey: "league.mutual.driverRates.title", descriptionKey: "league.mutual.driverRates.text", statusKey: "league.status.driverToPassenger" },
  { id: "passenger-rates-driver", titleKey: "league.mutual.passengerRates.title", descriptionKey: "league.mutual.passengerRates.text", statusKey: "league.status.passengerToDriver" },
  { id: "culture-education", titleKey: "league.mutual.education.title", descriptionKey: "league.mutual.education.text", statusKey: "league.status.quality" },
  { id: "rating-dispute", titleKey: "league.mutual.dispute.title", descriptionKey: "league.mutual.dispute.text", statusKey: "dispatch.status.policy" },
];

export const taxiLeaguePrizeGovernanceCards: TaxiPremiumReadinessCard[] = [
  { id: "governance-state-split", titleKey: "league.governance.country.title", descriptionKey: "league.governance.country.text", statusKey: "league.status.country" },
  { id: "governance-top-three", titleKey: "league.governance.topThree.title", descriptionKey: "league.governance.topThree.text", statusKey: "league.status.prizeLocked" },
  { id: "governance-no-fake-reward", titleKey: "league.governance.noFake.title", descriptionKey: "league.governance.noFake.text", statusKey: "runtime.locked" },
  { id: "governance-admin-rules", titleKey: "league.governance.admin.title", descriptionKey: "league.governance.admin.text", statusKey: "league.status.adminLocked" },
];

export const taxiLeagueSeasonCards: TaxiPremiumReadinessCard[] = [
  { id: "season-country-window", titleKey: "league.season.countryWindow.title", descriptionKey: "league.season.countryWindow.text", statusKey: "league.status.countrySeason" },
  { id: "season-monthly-cycle", titleKey: "league.season.monthly.title", descriptionKey: "league.season.monthly.text", statusKey: "league.status.adminLocked" },
  { id: "season-top-three-snapshot", titleKey: "league.season.snapshot.title", descriptionKey: "league.season.snapshot.text", statusKey: "league.status.prizeLocked" },
  { id: "season-no-prize-payout", titleKey: "league.season.noPayout.title", descriptionKey: "league.season.noPayout.text", statusKey: "runtime.locked" },
];

export const taxiLeagueAntiAbuseCards: TaxiPremiumReadinessCard[] = [
  { id: "anti-fake-trips", titleKey: "league.abuse.fakeTrips.title", descriptionKey: "league.abuse.fakeTrips.text", statusKey: "league.status.verifiedOnly" },
  { id: "anti-rating-farm", titleKey: "league.abuse.ratingFarm.title", descriptionKey: "league.abuse.ratingFarm.text", statusKey: "dispatch.status.policy" },
  { id: "anti-cancel-loop", titleKey: "league.abuse.cancelLoop.title", descriptionKey: "league.abuse.cancelLoop.text", statusKey: "lifecycle.status.runtimeLocked" },
  { id: "anti-identity-proof", titleKey: "league.abuse.identity.title", descriptionKey: "league.abuse.identity.text", statusKey: "league.status.adminLocked" },
];

export const taxiLeagueStarEtiquetteCards: TaxiPremiumReadinessCard[] = [
  { id: "driver-stars-passenger", titleKey: "league.stars.driverPassenger.title", descriptionKey: "league.stars.driverPassenger.text", statusKey: "league.status.driverToPassenger" },
  { id: "passenger-stars-driver", titleKey: "league.stars.passengerDriver.title", descriptionKey: "league.stars.passengerDriver.text", statusKey: "league.status.passengerToDriver" },
  { id: "stars-confirmed-after-trip", titleKey: "league.stars.confirmed.title", descriptionKey: "league.stars.confirmed.text", statusKey: "league.status.verifiedOnly" },
  { id: "stars-dispute-safe", titleKey: "league.stars.dispute.title", descriptionKey: "league.stars.dispute.text", statusKey: "dispatch.status.policy" },
];


export const taxiSabiAiFairnessCards: TaxiPremiumReadinessCard[] = [
  { id: "ai-always-checking", titleKey: "league.ai.always.title", descriptionKey: "league.ai.always.text", statusKey: "league.status.aiReview" },
  { id: "ai-daily-window", titleKey: "league.ai.daily.title", descriptionKey: "league.ai.daily.text", statusKey: "league.status.dailyWindow" },
  { id: "ai-driver-passenger", titleKey: "league.ai.bothSides.title", descriptionKey: "league.ai.bothSides.text", statusKey: "league.status.bothSides" },
  { id: "ai-no-fake-sanctions", titleKey: "league.ai.noFake.title", descriptionKey: "league.ai.noFake.text", statusKey: "runtime.locked" },
];

export const taxiDailyComplaintPenaltyCards: TaxiPremiumReadinessCard[] = [
  { id: "daily-one-complaint", titleKey: "league.penalty.one.title", descriptionKey: "league.penalty.one.text", statusKey: "league.status.pointsRemoved" },
  { id: "daily-two-complaints", titleKey: "league.penalty.two.title", descriptionKey: "league.penalty.two.text", statusKey: "league.status.oneHourCooldown" },
  { id: "daily-three-complaints", titleKey: "league.penalty.three.title", descriptionKey: "league.penalty.three.text", statusKey: "league.status.threeHourCooldown" },
  { id: "daily-more-than-three", titleKey: "league.penalty.more.title", descriptionKey: "league.penalty.more.text", statusKey: "league.status.blockedReview" },
];

export const taxiComplaintEvidenceCards: TaxiPremiumReadinessCard[] = [
  { id: "complaint-evidence", titleKey: "league.complaint.evidence.title", descriptionKey: "league.complaint.evidence.text", statusKey: "league.status.aiReview" },
  { id: "complaint-explanation", titleKey: "league.complaint.explanation.title", descriptionKey: "league.complaint.explanation.text", statusKey: "league.status.blockedReview" },
  { id: "complaint-no-revenge", titleKey: "league.complaint.noRevenge.title", descriptionKey: "league.complaint.noRevenge.text", statusKey: "dispatch.status.policy" },
  { id: "complaint-same-rules", titleKey: "league.complaint.sameRules.title", descriptionKey: "league.complaint.sameRules.text", statusKey: "league.status.bothSides" },
];

export const taxiCancelAfterComplaintCards: TaxiPremiumReadinessCard[] = [
  { id: "cancel-agreement", titleKey: "league.cancel.agreement.title", descriptionKey: "league.cancel.agreement.text", statusKey: "dispatch.status.policy" },
  { id: "ride-after-cancel", titleKey: "league.cancel.afterRide.title", descriptionKey: "league.cancel.afterRide.text", statusKey: "league.status.aiReview" },
  { id: "no-points-after-cancel", titleKey: "league.cancel.noPoints.title", descriptionKey: "league.cancel.noPoints.text", statusKey: "league.status.pointsRemoved" },
  { id: "review-before-ban", titleKey: "league.cancel.review.title", descriptionKey: "league.cancel.review.text", statusKey: "league.status.blockedReview" },
];


export const taxiComplaintDailyResetCards: TaxiPremiumReadinessCard[] = [
  { id: "daily-window-reset", titleKey: "league.daily.reset.title", descriptionKey: "league.daily.reset.text", statusKey: "league.status.dailyWindow" },
  { id: "daily-country-clock", titleKey: "league.daily.countryClock.title", descriptionKey: "league.daily.countryClock.text", statusKey: "league.status.countrySeason" },
  { id: "daily-no-carry-fake", titleKey: "league.daily.noCarryFake.title", descriptionKey: "league.daily.noCarryFake.text", statusKey: "runtime.locked" },
  { id: "daily-repeat-watch", titleKey: "league.daily.repeatWatch.title", descriptionKey: "league.daily.repeatWatch.text", statusKey: "league.status.aiReview" },
];

export const taxiSabiAiEvidenceSignalCards: TaxiPremiumReadinessCard[] = [
  { id: "signal-route-repeat", titleKey: "league.evidence.route.title", descriptionKey: "league.evidence.route.text", statusKey: "league.status.aiReview" },
  { id: "signal-chat-call", titleKey: "league.evidence.chat.title", descriptionKey: "league.evidence.chat.text", statusKey: "dispatch.status.policy" },
  { id: "signal-device-account", titleKey: "league.evidence.device.title", descriptionKey: "league.evidence.device.text", statusKey: "league.status.adminLocked" },
  { id: "signal-star-complaint", titleKey: "league.evidence.starComplaint.title", descriptionKey: "league.evidence.starComplaint.text", statusKey: "league.status.twoWayStars" },
];

export const taxiFairnessAppealFlowCards: TaxiPremiumReadinessCard[] = [
  { id: "appeal-warning", titleKey: "league.appeal.warning.title", descriptionKey: "league.appeal.warning.text", statusKey: "league.status.aiReview" },
  { id: "appeal-explanation", titleKey: "league.appeal.explanation.title", descriptionKey: "league.appeal.explanation.text", statusKey: "league.status.blockedReview" },
  { id: "appeal-admin", titleKey: "league.appeal.admin.title", descriptionKey: "league.appeal.admin.text", statusKey: "league.status.adminLocked" },
  { id: "appeal-no-auto-punish", titleKey: "league.appeal.noAuto.title", descriptionKey: "league.appeal.noAuto.text", statusKey: "runtime.locked" },
];

export const taxiContestDisciplineCards: TaxiPremiumReadinessCard[] = [
  { id: "discipline-driver", titleKey: "league.discipline.driver.title", descriptionKey: "league.discipline.driver.text", statusKey: "league.status.bothSides" },
  { id: "discipline-passenger", titleKey: "league.discipline.passenger.title", descriptionKey: "league.discipline.passenger.text", statusKey: "league.status.bothSides" },
  { id: "discipline-prize-freeze", titleKey: "league.discipline.prize.title", descriptionKey: "league.discipline.prize.text", statusKey: "league.status.prizeLocked" },
  { id: "discipline-cooldown", titleKey: "league.discipline.cooldown.title", descriptionKey: "league.discipline.cooldown.text", statusKey: "league.status.blockedReview" },
];

export const taxiDailyFairnessEscalationCards: TaxiPremiumReadinessCard[] = [
  { id: "daily-warning", titleKey: "league.dailyEscalation.warning.title", descriptionKey: "league.dailyEscalation.warning.text", statusKey: "league.status.dailyWindow" },
  { id: "daily-cooldown-one", titleKey: "league.dailyEscalation.oneHour.title", descriptionKey: "league.dailyEscalation.oneHour.text", statusKey: "league.status.oneHourCooldown" },
  { id: "daily-cooldown-three", titleKey: "league.dailyEscalation.threeHour.title", descriptionKey: "league.dailyEscalation.threeHour.text", statusKey: "league.status.threeHourCooldown" },
  { id: "daily-block-review", titleKey: "league.dailyEscalation.block.title", descriptionKey: "league.dailyEscalation.block.text", statusKey: "league.status.blockedReview" },
];

export const taxiSabiAiContestAnalyticsCards: TaxiPremiumReadinessCard[] = [
  { id: "analytics-complaints", titleKey: "league.analytics.complaints.title", descriptionKey: "league.analytics.complaints.text", statusKey: "league.status.aiReview" },
  { id: "analytics-cancel-after", titleKey: "league.analytics.cancelAfter.title", descriptionKey: "league.analytics.cancelAfter.text", statusKey: "dispatch.status.policy" },
  { id: "analytics-stars", titleKey: "league.analytics.stars.title", descriptionKey: "league.analytics.stars.text", statusKey: "league.status.twoWayStars" },
  { id: "analytics-country", titleKey: "league.analytics.country.title", descriptionKey: "league.analytics.country.text", statusKey: "league.status.countrySeason" },
];

export const taxiParticipantTrustStatusCards: TaxiPremiumReadinessCard[] = [
  { id: "trust-clean-day", titleKey: "league.trust.cleanDay.title", descriptionKey: "league.trust.cleanDay.text", statusKey: "league.status.verifiedOnly" },
  { id: "trust-under-review", titleKey: "league.trust.review.title", descriptionKey: "league.trust.review.text", statusKey: "league.status.aiReview" },
  { id: "trust-cooldown", titleKey: "league.trust.cooldown.title", descriptionKey: "league.trust.cooldown.text", statusKey: "league.status.oneHourCooldown" },
  { id: "trust-blocked", titleKey: "league.trust.blocked.title", descriptionKey: "league.trust.blocked.text", statusKey: "league.status.blockedReview" },
];

export const taxiLeagueRewardSafetyCards: TaxiPremiumReadinessCard[] = [
  { id: "reward-no-instant", titleKey: "league.reward.noInstant.title", descriptionKey: "league.reward.noInstant.text", statusKey: "runtime.locked" },
  { id: "reward-dispute-freeze", titleKey: "league.reward.freeze.title", descriptionKey: "league.reward.freeze.text", statusKey: "league.status.prizeLocked" },
  { id: "reward-admin", titleKey: "league.reward.admin.title", descriptionKey: "league.reward.admin.text", statusKey: "league.status.adminLocked" },
  { id: "reward-country", titleKey: "league.reward.country.title", descriptionKey: "league.reward.country.text", statusKey: "league.status.country" },
];


export const taxiDailySanctionHistoryCards: TaxiPremiumReadinessCard[] = [
  { id: "history-country-day", titleKey: "league.history.countryDay.title", descriptionKey: "league.history.countryDay.text", statusKey: "league.status.dailyWindow" },
  { id: "history-driver-passenger", titleKey: "league.history.bothSides.title", descriptionKey: "league.history.bothSides.text", statusKey: "league.status.bothSides" },
  { id: "history-repeat-risk", titleKey: "league.history.repeatRisk.title", descriptionKey: "league.history.repeatRisk.text", statusKey: "league.status.aiReview" },
  { id: "history-no-ui-write", titleKey: "league.history.noUiWrite.title", descriptionKey: "league.history.noUiWrite.text", statusKey: "runtime.locked" },
];

export const taxiFairnessFreezeReasonCards: TaxiPremiumReadinessCard[] = [
  { id: "freeze-open-complaint", titleKey: "league.freeze.complaint.title", descriptionKey: "league.freeze.complaint.text", statusKey: "league.status.prizeLocked" },
  { id: "freeze-cancel-after", titleKey: "league.freeze.cancelAfter.title", descriptionKey: "league.freeze.cancelAfter.text", statusKey: "dispatch.status.policy" },
  { id: "freeze-star-conflict", titleKey: "league.freeze.starConflict.title", descriptionKey: "league.freeze.starConflict.text", statusKey: "league.status.twoWayStars" },
  { id: "freeze-admin-decision", titleKey: "league.freeze.admin.title", descriptionKey: "league.freeze.admin.text", statusKey: "league.status.adminLocked" },
];

export const taxiParticipantAppealStatusCards: TaxiPremiumReadinessCard[] = [
  { id: "appeal-status-draft", titleKey: "league.appealStatus.draft.title", descriptionKey: "league.appealStatus.draft.text", statusKey: "league.status.blockedReview" },
  { id: "appeal-status-evidence", titleKey: "league.appealStatus.evidence.title", descriptionKey: "league.appealStatus.evidence.text", statusKey: "league.status.aiReview" },
  { id: "appeal-status-decision", titleKey: "league.appealStatus.decision.title", descriptionKey: "league.appealStatus.decision.text", statusKey: "league.status.adminLocked" },
  { id: "appeal-status-restored", titleKey: "league.appealStatus.restored.title", descriptionKey: "league.appealStatus.restored.text", statusKey: "league.status.verifiedOnly" },
];

export const taxiSabiAiComplaintDecisionCards: TaxiPremiumReadinessCard[] = [
  { id: "decision-verified", titleKey: "league.decision.verified.title", descriptionKey: "league.decision.verified.text", statusKey: "league.status.aiReview" },
  { id: "decision-false-report", titleKey: "league.decision.falseReport.title", descriptionKey: "league.decision.falseReport.text", statusKey: "dispatch.status.policy" },
  { id: "decision-cooldown-timer", titleKey: "league.decision.cooldown.title", descriptionKey: "league.decision.cooldown.text", statusKey: "league.status.oneHourCooldown" },
  { id: "decision-no-fake-execution", titleKey: "league.decision.noFake.title", descriptionKey: "league.decision.noFake.text", statusKey: "runtime.locked" },
];


export const taxiLeagueScoreImpactCards: TaxiPremiumReadinessCard[] = [
  { id: "score-verified-order", titleKey: "league.scoreImpact.order.title", descriptionKey: "league.scoreImpact.order.text", statusKey: "league.status.verifiedOnly" },
  { id: "score-stars-culture", titleKey: "league.scoreImpact.stars.title", descriptionKey: "league.scoreImpact.stars.text", statusKey: "league.status.twoWayStars" },
  { id: "score-complaint-impact", titleKey: "league.scoreImpact.complaint.title", descriptionKey: "league.scoreImpact.complaint.text", statusKey: "league.status.pointsRemoved" },
  { id: "score-no-ui-mutation", titleKey: "league.scoreImpact.noUi.title", descriptionKey: "league.scoreImpact.noUi.text", statusKey: "runtime.locked" },
];

export const taxiCooldownReasonCards: TaxiPremiumReadinessCard[] = [
  { id: "cooldown-one-hour", titleKey: "league.cooldown.oneHourReason.title", descriptionKey: "league.cooldown.oneHourReason.text", statusKey: "league.status.oneHourCooldown" },
  { id: "cooldown-three-hour", titleKey: "league.cooldown.threeHourReason.title", descriptionKey: "league.cooldown.threeHourReason.text", statusKey: "league.status.threeHourCooldown" },
  { id: "cooldown-block-review", titleKey: "league.cooldown.blockReason.title", descriptionKey: "league.cooldown.blockReason.text", statusKey: "league.status.blockedReview" },
  { id: "cooldown-country-day", titleKey: "league.cooldown.countryDay.title", descriptionKey: "league.cooldown.countryDay.text", statusKey: "league.status.dailyWindow" },
];

export const taxiFalseComplaintProtectionCards: TaxiPremiumReadinessCard[] = [
  { id: "false-complaint-detect", titleKey: "league.falseComplaint.detect.title", descriptionKey: "league.falseComplaint.detect.text", statusKey: "league.status.aiReview" },
  { id: "false-complaint-penalty", titleKey: "league.falseComplaint.penalty.title", descriptionKey: "league.falseComplaint.penalty.text", statusKey: "dispatch.status.policy" },
  { id: "false-complaint-restore", titleKey: "league.falseComplaint.restore.title", descriptionKey: "league.falseComplaint.restore.text", statusKey: "league.status.verifiedOnly" },
  { id: "false-complaint-no-revenge", titleKey: "league.falseComplaint.noRevenge.title", descriptionKey: "league.falseComplaint.noRevenge.text", statusKey: "runtime.locked" },
];

export const taxiPostReviewRecoveryCards: TaxiPremiumReadinessCard[] = [
  { id: "recovery-clean-decision", titleKey: "league.recovery.clean.title", descriptionKey: "league.recovery.clean.text", statusKey: "league.status.verifiedOnly" },
  { id: "recovery-points-restored", titleKey: "league.recovery.points.title", descriptionKey: "league.recovery.points.text", statusKey: "league.status.pointsRemoved" },
  { id: "recovery-order-access", titleKey: "league.recovery.access.title", descriptionKey: "league.recovery.access.text", statusKey: "league.status.adminLocked" },
  { id: "recovery-audit-trail", titleKey: "league.recovery.audit.title", descriptionKey: "league.recovery.audit.text", statusKey: "league.status.aiReview" },
];


export const taxiLeagueAuditTrailCards: TaxiPremiumReadinessCard[] = [
  { id: "audit-country-day", titleKey: "league.audit.countryDay.title", descriptionKey: "league.audit.countryDay.text", statusKey: "league.status.dailyWindow" },
  { id: "audit-score-before-after", titleKey: "league.audit.scoreDelta.title", descriptionKey: "league.audit.scoreDelta.text", statusKey: "league.status.pointsRemoved" },
  { id: "audit-evidence-link", titleKey: "league.audit.evidence.title", descriptionKey: "league.audit.evidence.text", statusKey: "league.status.aiReview" },
  { id: "audit-no-ui-write", titleKey: "league.audit.noUi.title", descriptionKey: "league.audit.noUi.text", statusKey: "runtime.locked" },
];

export const taxiScoreAdjustmentReasonCards: TaxiPremiumReadinessCard[] = [
  { id: "adjust-complaint", titleKey: "league.adjustment.complaint.title", descriptionKey: "league.adjustment.complaint.text", statusKey: "league.status.pointsRemoved" },
  { id: "adjust-false-complaint", titleKey: "league.adjustment.falseReport.title", descriptionKey: "league.adjustment.falseReport.text", statusKey: "dispatch.status.policy" },
  { id: "adjust-restored", titleKey: "league.adjustment.restored.title", descriptionKey: "league.adjustment.restored.text", statusKey: "league.status.verifiedOnly" },
  { id: "adjust-reward-frozen", titleKey: "league.adjustment.rewardFrozen.title", descriptionKey: "league.adjustment.rewardFrozen.text", statusKey: "league.status.prizeLocked" },
];

export const taxiDisputeEvidenceTimelineCards: TaxiPremiumReadinessCard[] = [
  { id: "timeline-opened", titleKey: "league.timeline.opened.title", descriptionKey: "league.timeline.opened.text", statusKey: "league.status.aiReview" },
  { id: "timeline-ai-review", titleKey: "league.timeline.ai.title", descriptionKey: "league.timeline.ai.text", statusKey: "league.status.aiReview" },
  { id: "timeline-admin-review", titleKey: "league.timeline.admin.title", descriptionKey: "league.timeline.admin.text", statusKey: "league.status.adminLocked" },
  { id: "timeline-final", titleKey: "league.timeline.final.title", descriptionKey: "league.timeline.final.text", statusKey: "league.status.verifiedOnly" },
];

export const taxiLeagueTransparencyCards: TaxiPremiumReadinessCard[] = [
  { id: "transparent-why", titleKey: "league.transparency.why.title", descriptionKey: "league.transparency.why.text", statusKey: "league.status.aiReview" },
  { id: "transparent-what-next", titleKey: "league.transparency.next.title", descriptionKey: "league.transparency.next.text", statusKey: "league.status.adminLocked" },
  { id: "transparent-same-rules", titleKey: "league.transparency.sameRules.title", descriptionKey: "league.transparency.sameRules.text", statusKey: "league.status.bothSides" },
  { id: "transparent-no-fake", titleKey: "league.transparency.noFake.title", descriptionKey: "league.transparency.noFake.text", statusKey: "runtime.locked" },
];


export const taxiLeagueWarningNudgeCards: TaxiPremiumReadinessCard[] = [
  { id: "warning-soft-first", titleKey: "league.warning.soft.title", descriptionKey: "league.warning.soft.text", statusKey: "league.status.dailyWindow" },
  { id: "warning-before-cooldown", titleKey: "league.warning.cooldown.title", descriptionKey: "league.warning.cooldown.text", statusKey: "league.status.cooldown" },
  { id: "warning-before-block", titleKey: "league.warning.block.title", descriptionKey: "league.warning.block.text", statusKey: "league.status.blocked" },
  { id: "warning-no-shaming", titleKey: "league.warning.noShame.title", descriptionKey: "league.warning.noShame.text", statusKey: "league.status.aiReview" },
];

export const taxiCivilityCoachingCards: TaxiPremiumReadinessCard[] = [
  { id: "coach-driver", titleKey: "league.coach.driver.title", descriptionKey: "league.coach.driver.text", statusKey: "league.status.bothSides" },
  { id: "coach-passenger", titleKey: "league.coach.passenger.title", descriptionKey: "league.coach.passenger.text", statusKey: "league.status.bothSides" },
  { id: "coach-stars", titleKey: "league.coach.stars.title", descriptionKey: "league.coach.stars.text", statusKey: "league.status.verifiedOnly" },
  { id: "coach-clean-day", titleKey: "league.coach.cleanDay.title", descriptionKey: "league.coach.cleanDay.text", statusKey: "league.status.dailyWindow" },
];

export const taxiSabiAiRiskConfidenceCards: TaxiPremiumReadinessCard[] = [
  { id: "confidence-low", titleKey: "league.confidence.low.title", descriptionKey: "league.confidence.low.text", statusKey: "league.status.aiReview" },
  { id: "confidence-medium", titleKey: "league.confidence.medium.title", descriptionKey: "league.confidence.medium.text", statusKey: "league.status.adminLocked" },
  { id: "confidence-high", titleKey: "league.confidence.high.title", descriptionKey: "league.confidence.high.text", statusKey: "league.status.pointsRemoved" },
  { id: "confidence-human", titleKey: "league.confidence.human.title", descriptionKey: "league.confidence.human.text", statusKey: "league.status.adminLocked" },
];

export const taxiContestEligibilityGuardCards: TaxiPremiumReadinessCard[] = [
  { id: "eligibility-country", titleKey: "league.eligibility.country.title", descriptionKey: "league.eligibility.country.text", statusKey: "league.status.countrySeparate" },
  { id: "eligibility-clean-day", titleKey: "league.eligibility.cleanDay.title", descriptionKey: "league.eligibility.cleanDay.text", statusKey: "league.status.dailyWindow" },
  { id: "eligibility-no-open-case", titleKey: "league.eligibility.noCase.title", descriptionKey: "league.eligibility.noCase.text", statusKey: "league.status.prizeLocked" },
  { id: "eligibility-no-fake", titleKey: "league.eligibility.noFake.title", descriptionKey: "league.eligibility.noFake.text", statusKey: "runtime.locked" },
];


export const taxiKernelBoundConnectionCards: TaxiPremiumReadinessCard[] = [
  { id: "kernel-facade-only", titleKey: "kernel.bound.facade.title", descriptionKey: "kernel.bound.facade.text", statusKey: "kernel.status.facade" },
  { id: "kernel-event-state", titleKey: "kernel.bound.events.title", descriptionKey: "kernel.bound.events.text", statusKey: "kernel.status.events" },
  { id: "kernel-no-direct-provider", titleKey: "kernel.bound.noDirect.title", descriptionKey: "kernel.bound.noDirect.text", statusKey: "kernel.status.noDirect" },
  { id: "kernel-clean-close", titleKey: "kernel.bound.close.title", descriptionKey: "kernel.bound.close.text", statusKey: "lifecycle.status.shutdown" },
];

export const taxiAdminDailyReportSummaryCards: TaxiPremiumReadinessCard[] = [
  { id: "daily-ai-status", titleKey: "kernel.report.ai.title", descriptionKey: "kernel.report.ai.text", statusKey: "league.status.aiReview" },
  { id: "daily-complaint-status", titleKey: "kernel.report.complaints.title", descriptionKey: "kernel.report.complaints.text", statusKey: "league.status.dailyWindow" },
  { id: "daily-admin-lock", titleKey: "kernel.report.admin.title", descriptionKey: "kernel.report.admin.text", statusKey: "league.status.adminLocked" },
  { id: "daily-mobile-safe", titleKey: "kernel.report.mobile.title", descriptionKey: "kernel.report.mobile.text", statusKey: "kernel.status.safeSummary" },
];

export const taxiFoundationAdminCompletionCards: TaxiPremiumReadinessCard[] = [
  { id: "foundation-100", titleKey: "kernel.completion.foundation.title", descriptionKey: "kernel.completion.foundation.text", statusKey: "kernel.status.foundationReady" },
  { id: "admin-100", titleKey: "kernel.completion.admin.title", descriptionKey: "kernel.completion.admin.text", statusKey: "kernel.status.adminReady" },
  { id: "runtime-locked", titleKey: "kernel.completion.runtime.title", descriptionKey: "kernel.completion.runtime.text", statusKey: "runtime.locked" },
  { id: "mobile-next", titleKey: "kernel.completion.mobile.title", descriptionKey: "kernel.completion.mobile.text", statusKey: "kernel.status.mobileNext" },
];

export const taxiPremiumKernelUxCards: TaxiPremiumReadinessCard[] = [
  { id: "ux-one-cockpit", titleKey: "kernel.ux.cockpit.title", descriptionKey: "kernel.ux.cockpit.text", statusKey: "control.status.preview" },
  { id: "ux-rider-driver-same", titleKey: "kernel.ux.sameContracts.title", descriptionKey: "kernel.ux.sameContracts.text", statusKey: "kernel.status.sharedContracts" },
  { id: "ux-no-background", titleKey: "kernel.ux.noBackground.title", descriptionKey: "kernel.ux.noBackground.text", statusKey: "control.status.noBackground" },
  { id: "ux-no-fake", titleKey: "kernel.ux.noFake.title", descriptionKey: "kernel.ux.noFake.text", statusKey: "runtime.locked" },
];
