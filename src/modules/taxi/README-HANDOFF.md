# TAXI-MOBILE-UI-001G — Sabi Taxi premium UI handoff

Scope: mobile UI only for `C:\Users\User\Desktop\superapp-mobile`.

## What changed in 001G

- Added transparent dispatch preview deck for fare, driver assignment, route reasons, cancel/dispute policy.
- Added clean navigation deck: traffic/radar/camera/speed/ETA layers stay near the map without noisy extra screens.
- Added driver settlement guard deck: balance before line, Admin-configured commission after real trip completion, dispute lock, ledger/payout lock.
- Kept driver rule: no balance means no order receive and no order accept.
- Kept commission rule: Admin-configured commission is displayed only as provider-ready preview; no auto-debit in UI.
- Kept no-always-on background: when Taxi is closed and there is no active approved trip, Taxi runtime must be closed.

## Safety boundaries

No backend touched. No Admin touched. No provider call. No Wallet mutation. No payment runtime. No payout runtime. No real location runtime.

Blocked fake states:

- fake GPS/location success
- fake driver matching/dispatch success
- fake payment success
- fake ride completion
- fake delivery completion
- fake driver top-up success
- fake Admin-configured commission auto-debit success
- fake driver payout success

## Files

- `app/taxi.tsx`
- `src/modules/taxi/domain/taxi.types.ts`
- `src/modules/taxi/data/taxi.local.ts`
- `src/modules/taxi/data/taxi.premium.ts`
- `src/modules/taxi/application/taxi.service.ts`
- `src/modules/taxi/presentation/taxi.i18n.ts`
- `src/modules/taxi/screens/TaxiScreen.tsx`

## Verification

Local transpile check passed for all Taxi TS/TSX files and `app/taxi.tsx`.

Owner should run in `C:\Users\User\Desktop\superapp-mobile`:

```powershell
$env:NODE_OPTIONS="--max-old-space-size=8192"
node .\node_modules\typescript\bin\tsc --noEmit -p tsconfig.json
```

## TAXI-MOBILE-UI-001J

Scope: mobile Taxi UI/UX only for `C:\Users\User\Desktop\superapp-mobile`. Backend, Admin, provider, payment, payout, Wallet debit, real location and runtime dispatch are not touched.

Added in 001H:
- Honest order handoff chain for ride and courier: request preparation, dispatch, route preview, closing/settlement.
- Delivery chain: pickup, courier route, proof of handoff, delivery settlement, all locked/provider-ready.
- Driver money timeline: balance before order, future Admin-configured commission commission, future net, no fake debit/top-up/payout.
- Repeated premium guardrails: no fake GPS, no fake driver assignment, no fake payment, no fake trip completion, no fake auto-debit, no fake payout.

Driver balance rule remains locked into UI:
- If balance is below minimum/reserve, driver cannot receive or accept order.
- Admin-configured commission Sabi commission is only a preview until backend trip completed + exact approval.

Verification:
- Local TypeScript transpile check passed for Taxi app route and all Taxi module TS/TSX files.


## TAXI-MOBILE-UI-001J additions

- Added explicit Taxi lifecycle cards: open UI-only, active trip runtime locked, clean shutdown, no fake resume.
- Added permission/background clarity: Taxi closed means no always-on location, dispatch, speed, radar, or search runtime unless a real active trip exists after approval.
- Added driver access settlement cards: no balance means no order, top-up has no fake success, and Admin-configured commission commission debits only after real backend trip completion.
- Still mobile UI only. No backend, provider, payment, payout, Wallet mutation, fake GPS, fake matching, fake completion, fake debit, or fake payout.


## TAXI-MOBILE-UI-001J

Added premium readiness polish:
- passenger fare breakdown deck with no payment/debit fake-success;
- operational readiness deck for request, location, dispatch, clean-close and backend resume;
- driver dispatch pool guard for balance, documents, reserve, Admin-configured commission commission and provider/payment locks;
- fixed TaxiScreen duplicated preview wrappers and removed the extra useMemo dependency argument for stricter TypeScript compatibility.

Still mobile UI only. No backend, Admin, provider, Wallet, payout, debit, location runtime or dispatch runtime was enabled.


## TAXI-MOBILE-UI-001K

Premium polish added for passenger UX, driver revenue integrity, courier proof flow, and no-background lifecycle.

Safety/runtime boundaries remain unchanged:
- no fake GPS/location success;
- no fake driver assignment;
- no fake payment/top-up/debit;
- no fake ride/delivery completion;
- no fake driver payout;
- driver cannot receive/accept orders without enough balance;
- Admin-configured commission commission is UI preview only until backend trip completion + exact approval.


## TAXI-MOBILE-UI-001L

- Added ride summary readiness: rating, tips, receipt, dispute, and completion stay locked until verified backend trip state.
- Added safety trust center: SOS, route sharing, masked chat/call, incident/dispute are visible as premium UI contracts without fake submission.
- Added intercity control center: stops, baggage, driver rest, speed/radar/camera layers and intercity price remain provider-ready only.
- Added driver access enforcement: no balance means no dispatch feed, no offer, no accept; Admin-configured commission debit only after real backend completed; payout only after ledger/provider/exact approval.
- Still mobile UI-only: no backend, no Admin, no provider runtime, no money movement, no fake GPS/payment/completion/top-up/payout.

## TAXI-MOBILE-UI-001M

Scope: mobile UI/UX only for `C:\Users\User\Desktop\superapp-mobile`. Backend, Admin, provider, payment, payout, dispatch runtime and location runtime stay untouched.

Added in 001M:
- Final Taxi readiness deck: premium UI-only, no always-on background import, provider-ready contract, no fake-success.
- One-tap premium order flow: A/B, tariff, fare, safety and clean close are visible in one rider cockpit.
- Provider/runtime boundary deck: location, dispatch, payment and settlement remain locked until backend/provider/exact approval.
- Driver top-up readiness deck: top-up button is future Wallet/provider path only; no fake balance change, no fake top-up success.
- Driver order access remains blocked when confirmed balance is below reserve/minimum; Admin-configured commission commission remains preview-only until real backend trip completed.

Hard locks preserved:
- no fake GPS/location success
- no fake driver assignment
- no fake payment success
- no fake trip completion
- no fake top-up success
- no fake Admin-configured commission debit
- no fake payout/settlement
- no background Taxi runtime when Taxi is closed and there is no active trip



## TAXI-MOBILE-UI-001N

- Added session lifecycle contract: Taxi open is UI-only, active-trip runtime only after backend/provider approval, clean shutdown on close, resume only from verified backend state.
- Added payment truth center: price/quote is preview-only; hold, tips, receipt, refunds and ledger are locked until real Wallet/payment/backend runtime.
- Added driver liquidity contract: minimum balance and Admin-configured commission reserve are required before dispatch feed/offer/accept; top-up remains locked; commission debit only after real backend trip completed.
- Reinforced no fake GPS, no fake driver assignment, no fake payment, no fake ride completion, no fake top-up, no fake debit, no fake payout.
- Scope remains mobile UI-only in superapp-mobile. No backend, Admin, provider, payout, payment, location, dispatch or settlement runtime was enabled.


## TAXI-MOBILE-UI-001O

Added Taxi country leagues as premium UI-only gamification, not gambling or betting:
- Driver league per country: points for verified completed orders, politeness, clean car, high stars and safe behavior.
- Passenger league per country: points for verified rides plus stars given by the driver for punctuality, politeness, cleanliness, care and safety.
- Top-3 prize preview per country: 1st, 2nd and 3rd place remain locked until Admin/backend verification, legal/payment review and antifraud checks.
- No fake rewards, fake payout, fake trip completion, fake stars or fake leaderboard state.
- Backend, Admin, payment, payout, Wallet, location and dispatch runtime remain untouched.


## TAXI-MOBILE-UI-001P

- Added country-separated Taxi leagues for drivers and passengers with stronger fair-play UI contracts.
- Added mutual stars: driver rates passenger after a verified trip, and passenger rates driver after a verified trip.
- Added scoring integrity: verified orders are the base, but politeness, car cleanliness, punctuality, safety and complaint/antifraud review affect score.
- Added prize governance: top-3 per country are preview-only; no fake prize, bonus, payout or promo credit is granted by mobile UI.
- Still mobile UI-only: no backend, Admin, provider, payment, reward payout, stars mutation or leaderboard runtime enabled.


## TAXI-MOBILE-UI-001Q
- Added premium Taxi League season UI: separate country seasons, Admin-controlled periods, top-3 snapshot and no payout from UI.
- Added anti-abuse cards: no fake trips, no rating farms, cancellation/dispute trust checks and identity/market verification.
- Added star etiquette cards: driver rates passenger, passenger rates driver, ratings apply only after verified backend trip state and disputed stars wait for review.
- Scope remains mobile UI-only; no backend, Admin, provider, payment, payout, real leaderboard or real reward runtime was enabled.


## TAXI-MOBILE-UI-001R — Sabi AI daily fairness and complaint enforcement

- Added country-league fairness UI contracts for daily complaint windows: penalties are counted per 1 day, not all-time.
- Driver and passenger rules are symmetrical: 1 complaint/day removes points after review; 2 complaints/day removes points and blocks new orders for 1 hour; 3 complaints/day removes points and blocks new orders for 3 hours; more than 3 complaints/day blocks until circumstances/explanation are reviewed.
- Sabi AI analytics is represented as always-on verification contract for league integrity, arranged stars, arranged cancellation, repeated routes, cancelled-then-completed rides, and evidence review.
- Cancelled trips, disputed trips, and rides that happen after cancellation do not grant league points, stars, prize progress, payout, or fake reward from UI.
- Still mobile UI-only: no backend, Admin, provider, payment, payout, location runtime, punishment runtime, prize payout, fake stars, or fake blocking was enabled.


## TAXI-MOBILE-UI-001S
- Added premium daily fairness UI contracts: one-day complaint windows by country, daily reset, repeated complaint watch, and no permanent UI punishment.
- Added Sabi AI evidence panels: route repetition, ride-after-cancel, chat/call signals, device/account/country checks, and star-vs-complaint conflict freeze.
- Added appeal/explanation flow: warning, right to explain, Admin review, and no automatic punishment from UI.
- Added contest discipline for drivers and passengers: complaints, rude behavior, arranged cancellations, and dirty/unsafe behavior can remove points, freeze prizes, and block order access only after backend/Sabi AI/Admin verification.
- Still mobile UI-only: no backend/Admin/provider/payment/payout/location/dispatch runtime, no fake sanctions, no fake rewards.


## TAXI-MOBILE-UI-001T
- Added daily fairness escalation UI for driver/passenger leagues: 1/2/3/>3 verified complaints in one country-day.
- Added Sabi AI contest analytics cards for complaints, arranged cancellation, ride after cancellation, stars and country verification.
- Added participant trust status and reward safety cards: no instant prize, no fake reward, Admin/backend/legal/payment locked.
- Scope remains mobile UI-only; no backend/Admin/provider/payment/payout/location/dispatch runtime enabled.


## TAXI-MOBILE-UI-001U
- Added premium fair-play UI contracts for daily sanction history by country.
- Added prize/reward freeze reason cards: verified complaint, arranged cancellation, ride after cancellation, star/complaint conflict, Admin decision.
- Added participant appeal status for both drivers and passengers: explanation expected, evidence collection, decision pending, restoration after clean decision.
- Added Sabi AI complaint decision cards: verified complaint, false report violation, cooldown timer and no fake sanction execution.
- Still mobile UI-only: no backend/Admin/provider/payment/payout/location/dispatch runtime, no fake points removal, no fake ban, no fake reward.


## TAXI-MOBILE-UI-001V
- Adds transparent score impact decks for verified orders, mutual stars, verified complaints and no-UI mutations.
- Adds cooldown/block reason cards: 2 daily complaints = 1h, 3 daily complaints = 3h, >3 daily complaints = review block, counted per country/day.
- Adds false complaint protection: Sabi AI checks evidence and can penalize the false reporter after review.
- Adds post-review recovery UI: clean decision, point restoration, access restoration and audit trail, all backend/Admin/Sabi AI locked.
- Scope remains mobile UI-only; no fake sanctions, fake reward, fake stars, fake point removal, backend/Admin/provider/payment/payout/runtime.


## TAXI-MOBILE-UI-001W

Added premium league/fairness transparency UI: daily audit trail by country/day, before/after score adjustment reasons, dispute evidence timeline, participant next-step transparency, symmetric driver/passenger rules, no fake point removal, no fake sanction, no fake reward, and no backend/Admin/provider/payment/payout runtime.


## TAXI-MOBILE-UI-001X

Added final premium league culture layer: warning nudges without shaming, civility coaching for drivers and passengers, Sabi AI confidence states, country/day prize eligibility guards, protection from fake sanctions/rewards, and no backend/Admin/provider/payment/payout runtime activation.


## TAXI-MOBILE-UI-001Y

- Returned to mobile UI/UX after backend foundation/Admin contract readiness 001Q.
- Added universal Taxi kernel connection cockpit to the mobile screen.
- Mobile UI is visually bound to Taxi kernel facade/events/state and must not import provider/backend runtime/payment/payout/Wallet/dispatch directly.
- Added Admin/Sabi AI daily report safe summary cards: all complaints checked every day, Admin locked decision, raw evidence stays foundation/Admin-only.
- Added foundation/Admin completion cards and next mobile UX gate.
- Added premium UX continuity cards: one cockpit, same rider/driver contracts, no background Taxi after close, no fake success.
- Scope remains mobile UI-only in `superapp-mobile`; no backend, Admin runtime, provider, payment, payout, Wallet, DB, real location or dispatch runtime enabled.


## TAXI-MOBILE-UI-002A
- Adds a premium Smart Taxi panel for passenger/driver route, price, safety, balance, commission and order-state clarity.
- Keeps mobile UI strictly kernel-bound: no direct provider/backend runtime, dispatch, geo, Wallet, payment, payout, Admin evidence, DB, or fake success.
- Runtime remains locked until backend/Admin exact approval.

## TAXI-MOBILE-UI-002B
- Added premium ride clarity layer: passenger and driver timelines, trust chips, next-step explanation and kernel-safe footer.
- Passenger timeline covers pickup, quote, match and live trip without fake GPS, fake payment, fake driver matching or fake live navigation.
- Driver timeline covers balance, order pool, navigation and settlement while preserving the rule that low balance blocks order visibility/acceptance and Admin-configured commission commission remains backend-ledger locked.
- Scope remains mobile UI-only; no provider/backend runtime, DB, Wallet, payment, payout, dispatch, real location, Admin evidence access or fake success was enabled.

## TAXI-MOBILE-UI-002C
- Added premium order composer / comfort preferences layer for passenger and driver modes.
- Passenger can preview tariff and preference selections as UI state only.
- Driver sees balance/access/radius/orders/no-fake-income preview cards without dispatch runtime.
- Mobile remains bound to Taxi kernel facade/events/state only.
- No backend/Admin runtime, DB, provider, Wallet, payment, payout, real geo/dispatch, fake order, fake debit, fake reward, or fake payout.


## TAXI-MOBILE-UI-002D

- Added premium route/live preview layer for passenger and driver.
- Shows ETA, distance, fare, pickup/dropoff, driver access, Admin-configured commission commission preview and route confidence as kernel-safe UI only.
- No real GPS, no dispatch assignment, no provider call, no Wallet/payment/payout/DB/Admin runtime, no fake success.
- Mobile remains bound to Taxi kernel facade/events/state.

## TAXI-MOBILE-UI-002E

- Added premium safety/support cockpit for passenger and driver.
- Passenger gets SOS/help, share trip, trusted contact and complaint/appeal guidance as kernel-safe UI state only.
- Driver gets safety support, trip issue path, fairness/no-fake protection and Sabi support preview without runtime calls.
- Mobile shows only safe summaries; raw evidence, final complaint decisions, sanctions, blocks, point changes and reward release remain foundation/Admin side.
- Scope remains mobile UI-only: no SOS runtime, no live location runtime, no dispatch, no backend/Admin route, no DB, no provider, no Wallet/payment/payout, no fake success.


## TAXI-MOBILE-UI-002F
- Added premium post-ride fairness layer for verified-ride-only ratings, compliments, complaints/appeals, tips preview and points preview.
- Mobile remains kernel-safe UI-only: no stars write, no points mutation, no tips/payment, no payout, no Wallet, no DB, no provider/runtime dispatch, no fake success.
- Passenger and driver fairness are symmetric; raw evidence and final decisions stay in foundation/Admin/Sabi AI.


## TAXI-MOBILE-UI-002G
- Added premium driver earnings/access layer for mobile UI/UX.
- Driver side shows balance gate, order queue preview, Admin-configured commission commission and net preview.
- Passenger side shows honest quote, driver access rules, service commission and reward fairness as safe preview.
- Mobile remains kernel-only: no direct provider/backend runtime, no Wallet debit/top-up, no payment, no payout, no DB write, no order pool runtime and no fake success.


## TAXI-MOBILE-UI-002H
- Added premium passenger trust/payment-readiness preview layer for mobile UI/UX.
- Passenger sees honest quote, cash/card/Wallet/refund readiness and receipt preview without charge/refund execution.
- Driver sees settlement lock, Admin-configured commission commission preview, balance gate and payout lock without ledger mutation.
- Mobile remains kernel-only: no direct provider/backend runtime, no Wallet debit/top-up, no payment charge, no refund, no payout, no DB write and no fake success.


## TAXI-MOBILE-UI-002I
- Owner rule captured: tariffs are configured in Admin, not fixed in mobile UI.
- Owner rule captured: the commission rate is Admin-configurable; mobile must not hardcode fixed-percent as the final policy.
- Driver/taxi-park connection request goes to Admin for review and approval before order access.
- Mobile only shows kernel-safe preview; no fake approval, no runtime dispatch, no Wallet/payment/payout/provider/DB.

## TAXI-MOBILE-UI-002J

- Added premium driver/park onboarding review UI after Admin-controlled pricing.
- Driver/taxi-park connection request is shown as Admin review/approval only.
- Tariffs and commission rate stay Admin-configured; mobile does not hardcode final pricing/commission decisions.
- Passenger view explains that approved drivers/couriers/parks appear only after Admin review and approved runtime.
- Mobile stays kernel-safe UI only: no backend/Admin runtime, no DB, no provider dispatch, no Wallet/payment/payout, no fake approval.


## TAXI-MOBILE-UI-002K
- Added Admin-configured tariff catalog and vehicle/service eligibility preview.
- Tariffs and commission rate remain Admin-controlled; mobile shows only kernel-safe preview.
- Driver/park connection, country/service eligibility and order access remain Admin review/approval only.
- No visible fixed commission percent, no fake approval, no dispatch, no geolocation runtime, no Wallet/payment/payout/DB/provider/backend runtime.


## TAXI-MOBILE-UI-002L
- Adds premium city/zone coverage preview for passenger and driver.
- Country, city, airport, intercity and delivery availability are Admin-configured and eligibility-gated.
- Driver/park zone access remains under Admin review/approval and backend/provider readiness.
- Mobile UI does not start dispatch, geo, provider, payment, payout, Wallet, DB or fake approval.
- All Taxi UI remains bound to Taxi kernel facade/events/state only.

## TAXI-MOBILE-UI-002M
- Adds premium dispatch-readiness preview for passenger and driver.
- Order access depends on Admin application approval, Admin-configured tariffs/commission, driver balance gate, country/zone eligibility, provider/backend readiness and live runtime approval.
- Passenger sees honest ETA/driver-pool preview only; no fake driver found, no fake assignment and no fake payment/completion.
- Driver sees queue access as locked until Admin review, balance, zone and provider/runtime readiness.
- Mobile remains kernel-safe UI only: no dispatch runtime, no GPS runtime, no backend/Admin route, no DB, no provider, no Wallet/payment/payout and no fake success.


## TAXI-MOBILE-UI-002N
- Adds premium live-map/control preview for passenger and driver.
- Map, traffic, radar, speed, ETA, pickup/dropoff and navigation controls are shown as kernel-safe UI preview only.
- Driver live map remains gated by Admin application approval, balance, zone, provider/backend readiness and approved trip runtime.
- Passenger sees honest ETA and route clarity without fake GPS, fake driver assignment, fake dispatch, fake payment or fake completion.
- Mobile remains kernel-safe UI only: no GPS runtime, no dispatch runtime, no backend/Admin route, no DB, no provider, no Wallet/payment/payout and no fake success.


## TAXI-MOBILE-UI-002O
- Added premium contact and pickup coordination UI: meeting point, message/call preview, waiting preview, arrived status, pickup issue entry.
- Mobile stays kernel-safe: no direct call/SMS, no backend/Admin runtime route, no live GPS, no dispatch, no payment, no payout, no fake approval.
- Tariffs and commission remain Admin-configured; driver/park access still requires Admin review/approval.


## TAXI-MOBILE-UI-002P
- Added premium trip-progress/ride-state preview for passenger and driver.
- Passenger sees request, matching, pickup, waiting, trip start, finish and receipt as kernel-safe states only.
- Driver sees access, queue, pickup, arrival, completion and settlement as preview gated by Admin approval, balance, zone, provider/backend runtime and backend ledger.
- Mobile does not create fake trip, fake start, fake completion, fake payment/refund, payout, DB write or dispatch.
- Tariffs and commission remain Admin-configured; driver/park access still requires Admin review/approval.


## TAXI-MOBILE-UI-002Q
- Added premium cancellation/fairness preview for passenger and driver.
- Covers cancellation, waiting, no-show, arranged cancellation, trip after cancellation, dispute and appeal as kernel-safe UI only.
- No mobile fake penalties, fake refund, fake reward, score mutation, DB, dispatch, provider, Wallet, payment or payout.
- Tariffs and commission remain Admin-configured; visible fixed commission percent stays blocked.


## TAXI-MOBILE-UI-002R — Premium league/rewards visibility preview
- Added country-separated league/rewards visibility for passenger and driver.
- Points, stars, prizes, eligibility and ranking are shown only as kernel-safe preview.
- Mobile does not add points, issue prize, change rating, release payout, mutate Wallet, or enable provider/backend runtime.
- Tariffs and commission stay Admin-configured; driver/park access still requires Admin review/approval, balance, zone and runtime/provider readiness.


## TAXI-MOBILE-UI-002S
- Added premium trust profile layer for passenger/driver.
- Driver, vehicle, taxi park, documents, rating and passenger trust are displayed as Admin/backend/provider-approved previews only.
- No fake profile approval, fake assignment, fake rating, fake documents, Wallet, payment, payout, dispatch, GPS or runtime.
- Tariffs and commission remain Admin-configured; fixed commission percent is not shown in visible UI.

## TAXI-MOBILE-UI-002T
- Added premium ride history / receipt center as mobile UI-only preview.
- Passenger sees verified history, backend receipt, dispute and refund status only after backend/Admin state.
- Driver sees ledger, settlement, reviews and appeal entry as safe preview only.
- Tariffs and commission remain Admin-configured; no visible fixed commission percent.
- No fake receipt, fake refund, fake payment, fake completed trip, fake income, fake payout, Wallet mutation, provider/backend runtime, DB, dispatch or GPS runtime.


## TAXI-MOBILE-UI-002T-FIX1
- Fixed ride history hero metric to use TaxiEstimate.quoteCoin instead of non-existent TaxiEstimate.priceCoin.
- Strengthened checker to block invalid TaxiEstimate property access in TaxiScreen.
- Scope remains mobile UI-only: no backend/Admin runtime, DB, provider, Wallet, payment, payout, dispatch, GPS, fake receipt/refund/payment, or fake trip completion.
