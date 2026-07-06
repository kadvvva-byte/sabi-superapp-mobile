import { getAppLanguage } from "../../../shared/i18n";
import type { TaxiLocale } from "../domain/taxi.types";

const RU = {
  "brand.title": "Sabi Taxi",
  "brand.passengerSubtitle": "Премиум заказ: карта, маршрут, тарифы, безопасность",
  "brand.driverSubtitle": "Кабинет водителя: баланс, заказы, навигация, комиссия",
  "mode.passenger": "Пассажир",
  "mode.driver": "Водитель",
  "service.ride": "Такси",
  "service.delivery": "Доставка",
  "trip.city": "Город",
  "trip.intercity": "Межгород",
  "stage.order": "Заказ",
  "stage.quote": "Цена",
  "stage.search": "Поиск",
  "stage.live": "В пути",
  "stage.history": "История",
  "driver.stage.balance": "Баланс",
  "driver.stage.orders": "Заказы",
  "driver.stage.navigation": "Навигация",
  "driver.stage.documents": "Документы",
  "runtime.preview": "UI preview / provider-ready",
  "runtime.noBackground": "Такси не работает постоянно: геолокация и поиск активируются только при открытом Taxi или активной поездке после runtime approval.",
  "runtime.locked": "Без fake-success: заказ, водитель, оплата, завершение, геолокация и списание не подтверждаются без backend/provider.",
  "map.layer": "Sabi Map preview",
  "map.locationLocked": "Геолокация не запущена",
  "map.routePreview": "Route preview",
  "map.traffic": "Пробки",
  "map.radar": "Радары",
  "map.speed": "Скорость",
  "map.speedValue": "до 60 км/ч",
  "map.traffic.medium": "средние",
  "map.traffic.high": "плотные",
  "map.traffic.low": "свободно",
  "map.intercityBadge": "межгород",
  "field.from": "Точка A",
  "field.to": "Точка B",
  "field.packageFrom": "Забрать",
  "field.packageTo": "Доставить",
  "field.searchPlaceholder": "Введите адрес, город или объект",
  "point.current.title": "Моё местоположение",
  "point.current.subtitle": "Будет определяться только после разрешения runtime",
  "point.home.title": "Дом",
  "point.home.subtitle": "сохранённый адрес",
  "point.office.title": "Офис",
  "point.office.subtitle": "рабочий адрес",
  "point.airport.title": "Аэропорт",
  "point.airport.subtitle": "терминал / зона посадки",
  "point.station.title": "Вокзал",
  "point.station.subtitle": "главный вход",
  "point.market.title": "Рынок",
  "point.market.subtitle": "торговая зона",
  "point.hotel.title": "Гостиница",
  "point.hotel.subtitle": "вход для гостей",
  "point.restaurant.title": "Ресторан",
  "point.restaurant.subtitle": "зона выдачи заказа",
  "point.samarkand.title": "Самарканд",
  "point.samarkand.subtitle": "межгород из Ташкента",
  "point.bukhara.title": "Бухара",
  "point.bukhara.subtitle": "межгород из Ташкента",
  "tariff.economy.title": "Economy",
  "tariff.economy.subtitle": "быстро и выгодно",
  "tariff.comfort.title": "Comfort",
  "tariff.comfort.subtitle": "чистый салон, высокий рейтинг",
  "tariff.business.title": "Business",
  "tariff.business.subtitle": "премиум авто и опытный водитель",
  "tariff.premium.title": "Premium",
  "tariff.premium.subtitle": "лучшие авто, тихая подача, VIP",
  "tariff.intercity.title": "Intercity",
  "tariff.intercity.subtitle": "межгород с остановками и багажом",
  "delivery.delivery.title": "Delivery",
  "delivery.delivery.subtitle": "посылки и покупки",
  "delivery.courier.title": "Courier",
  "delivery.courier.subtitle": "документы и малые посылки",
  "delivery.cargo.title": "Cargo",
  "delivery.cargo.subtitle": "коробки и крупные покупки",
  "delivery.express.title": "Express",
  "delivery.express.subtitle": "приоритетная доставка",
  "capacity.four": "4 места",
  "capacity.premium": "премиум салон",
  "capacity.intercity": "межгород",
  "capacity.package": "маленькая посылка",
  "capacity.box": "коробка / пакет",
  "capacity.urgent": "срочно",
  "option.quiet.title": "Тихая поездка",
  "option.quiet.subtitle": "без лишних разговоров",
  "option.childSeat.title": "Детское кресло",
  "option.childSeat.subtitle": "только у проверенных машин",
  "option.baggage.title": "Багаж",
  "option.baggage.subtitle": "водитель увидит заранее",
  "option.pet.title": "С питомцем",
  "option.pet.subtitle": "если водитель разрешает",
  "option.fastPickup.title": "Быстрая подача",
  "option.fastPickup.subtitle": "приоритет после provider approval",
  "delivery.option.recipient.title": "Получатель",
  "delivery.option.recipient.subtitle": "номер будет скрыт через Sabi",
  "delivery.option.photo.title": "Фото подтверждение",
  "delivery.option.photo.subtitle": "после backend/provider",
  "delivery.option.fragile.title": "Хрупкое",
  "delivery.option.fragile.subtitle": "отдельное предупреждение",
  "delivery.option.door.title": "До двери",
  "delivery.option.door.subtitle": "подъезд, этаж, ориентир",
  "delivery.option.thermal.title": "Термосумка",
  "delivery.option.thermal.subtitle": "еда и продукты",
  "label.km": "км",
  "label.min": "мин",
  "label.pickup": "подача",
  "label.duration": "в пути",
  "label.price": "цена",
  "label.quote": "quote preview",
  "label.driverNet": "водителю",
  "label.commission": "admin-настраиваемая комиссия",
  "label.balance": "баланс",
  "label.minimum": "минимум",
  "button.prepareLocked": "Подготовить без отправки",
  "button.searchLocked": "Поиск водителя заблокирован",
  "button.openMessenger": "Чат / звонок через Messenger",
  "button.sos": "SOS",
  "button.shareRoute": "Поделиться маршрутом",
  "button.tipLocked": "Чаевые после поездки",
  "button.rateLocked": "Оценить после поездки",
  "button.accept": "Принять заказ",
  "button.acceptLocked": "Принять нельзя",
  "button.topUp": "Пополнить баланс",
  "button.navigationLocked": "Навигация preview",
  "gate.passenger.kyc": "Реальный заказ откроется после KYC/AML пассажира.",
  "gate.passenger.wallet": "Оплата откроется после Wallet / COIN маршрута.",
  "gate.passenger.provider": "Отправка заявки только после taxi backend/provider.",
  "gate.passenger.ready": "Заявка готова к отправке.",
  "gate.driver.documents": "Водитель не получает заказы до проверки документов, машины и Admin approval.",
  "gate.driver.balance": "Недостаточно баланса: водитель не может получать и принимать заказы.",
  "gate.driver.ready": "Водитель готов выйти на линию.",
  "driver.balance.title": "Баланс водителя",
  "driver.balance.rule": "Если на балансе нет денег, водитель не получает заказ. После завершения поездки backend автоматически спишет Admin % от стоимости заказа.",
  "driver.balance.autodebit": "Автосписание Admin % будет только после реального завершения поездки на backend.",
  "driver.order.preview": "Заказ preview",
  "driver.order.note.ride": "Пассажирская поездка. Принятие закрыто до документов, баланса и provider.",
  "driver.order.note.delivery": "Доставка без пассажира. Отдельный courier flow.",
  "driver.profile.title": "Карточка водителя",
  "driver.profile.text": "Фото, авто, номер, рейтинг, документы, страховка и жалобы должны прийти из backend.",
  "driver.payment.title": "Комиссия и payout",
  "driver.payment.text": "Payout не показываем как успешный. Только расчёт: admin-configured commission Sabi, остальное — будущий net водителя.",
  "driver.courier.title": "Courier mode",
  "driver.courier.text": "Отдельная карточка доставки: фото посылки, получатель, дверь, термосумка и proof-of-delivery после provider.",
  "doc.kyc.title": "Личность / KYC",
  "doc.kyc.description": "Паспорт/ID, телефон, AML проверка.",
  "doc.license.title": "Водительские права",
  "doc.license.description": "Категория, срок действия, страна.",
  "doc.car.title": "Автомобиль",
  "doc.car.description": "Марка, цвет, номер, фото салона.",
  "doc.insurance.title": "Страховка",
  "doc.insurance.description": "Действующая страховка и правила страны.",
  "doc.admin.title": "Admin approval",
  "doc.admin.description": "Итоговое разрешение Sabi на работу.",
  "status.approved": "подтверждено",
  "status.pending": "на проверке",
  "status.missing": "нужно загрузить",
  "safety.title": "Safety / SOS",
  "safety.text": "SOS, скрытый номер, шаринг маршрута, рейтинг и жалоба доступны как UI-ready, без fake incident submit.",
  "chat.title": "Чат и звонок",
  "chat.text": "Связь пассажира и водителя только через Messenger / Calls, без прямого раскрытия номера.",
  "history.title": "Рейтинг, чаевые, история",
  "history.text": "Появятся после реального завершения поездки. Сейчас только будущий экран и locked actions.",
  "search.title": "Поиск водителя",
  "search.text": "Не показываем найденного водителя без настоящего matching provider.",
  "live.title": "Live trip screen",
  "live.text": "Будущий live экран: ETA, скорость, пробки, радары, остановки, SOS, чат, звонок.",
  "quote.title": "Цена и маршрут",
  "quote.text": "Quote preview не списывает деньги и не создаёт заказ.",
  "premium.badge": "premium",
  "recommended.badge": "лучший",

  "premium.promise.title": "Премиум без мусора",
  "premium.promise.text": "Быстрый заказ, чистая навигация, честные locked states и ни одного fake-success.",
  "premium.layer.traffic": "Пробки",
  "premium.layer.radar": "Радары",
  "premium.layer.speed": "Скорость",
  "premium.layer.camera": "Камеры",
  "premium.layer.eta": "ETA",
  "premium.layer.locked": "preview, без runtime",
  "intercity.panel.title": "Межгород clean flow",
  "intercity.panel.text": "Остановки, багаж, отдых водителя и ночная безопасность будут включены только через backend/provider.",
  "intercity.stop": "остановки",
  "intercity.luggage": "багаж",
  "intercity.safety": "ночная безопасность",
  "delivery.proof.title": "Доставка / courier proof",
  "delivery.proof.text": "Фото забора, фото вручения и подпись получателя locked до provider/runtime.",
  "commission.settlement.title": "Расчёт Admin % без fake debit",
  "commission.settlement.text": "UI показывает будущую формулу: стоимость заказа → завершение поездки backend → списание Admin % → net водителя. Сейчас деньги не списываются.",
  "driver.balance.control": "Сценарий баланса preview",
  "driver.balance.low": "мало денег",
  "driver.balance.ready": "достаточно",
  "driver.balance.high": "премиум",
  "driver.balance.low.note": "Баланс ниже минимума: водитель не получает заказ.",
  "driver.balance.ready.note": "Даже при достаточном балансе заказ не принимается без документов/Admin/provider.",
  "driver.balance.topup.locked": "Пополнение баланса — только будущий Wallet/provider flow, без fake success.",
  "runtime.closedTaxi": "Закрыл Taxi — Taxi runtime закрыт. Фон включается только для активной поездки после approval.",

  "quick.homeAirport.title": "Дом → аэропорт",
  "quick.homeAirport.subtitle": "быстрый сценарий без запуска реального заказа",
  "quick.intercity.title": "Межгород premium",
  "quick.intercity.subtitle": "город, остановки, багаж и ночной safety preview",
  "quick.courier.title": "Courier за 2 тапа",
  "quick.courier.subtitle": "еда, документы, proof pickup/delivery locked",
  "quick.family.title": "Семья / безопасность",
  "quick.family.subtitle": "SOS, шаринг маршрута, скрытый номер, без fake submit",
  "check.location.title": "Геолокация честно закрыта",
  "check.location.text": "Не пишем “GPS найден”, пока нет реального permission/runtime/location provider.",
  "check.payment.title": "Оплата не проходит в UI",
  "check.payment.text": "Quote preview не списывает деньги, не создаёт payment intent и не показывает success.",
  "check.matching.title": "Matching не имитируется",
  "check.matching.text": "Водитель не найден и не назначен без backend/provider dispatch.",
  "check.completion.title": "Завершение не фейкуем",
  "check.completion.text": "Поездка, чаевые, рейтинг, payout и Admin % debit будут только после runtime approval.",
  "ledger.balance.title": "Баланс перед линией",
  "ledger.balance.text": "Если баланс ниже минимума, водитель не получает заказы.",
  "ledger.trip.title": "Заказ выполняется реально",
  "ledger.trip.text": "UI не завершает поездку сам — нужен backend trip lifecycle.",
  "ledger.commission.title": "Admin-настраиваемая комиссия",
  "ledger.commission.text": "После реального завершения backend спишет Admin % от стоимости заказа.",
  "ledger.net.title": "Net водителя",
  "ledger.net.text": "Остаток доступен только после ledger/settlement, без fake payout.",
  "route.advisor.title": "Premium route intelligence",
  "route.smartPickup.title": "Умная точка посадки",
  "route.smartPickup.text": "UI показывает удобную посадку без запуска реального GPS и без fake location success.",
  "route.trafficRadar.title": "Пробки + радары",
  "route.trafficRadar.text": "Слой пробок, радаров, камер и скорости остаётся preview до map/provider runtime.",
  "route.intercityNight.title": "Межгород и ночь",
  "route.intercityNight.text": "Для дальних поездок нужны остановки, проверка водителя, отдых и safety policy.",
  "route.noBackground.title": "Без вечного фона",
  "route.noBackground.text": "Если Taxi закрыт и нет активной поездки, модуль не должен держать геолокацию и поиск.",
  "driver.ready.balance.title": "Баланс обязателен",
  "driver.ready.balance.text": "Водитель не получает заказ, если баланс ниже минимума или будущей комиссии.",
  "driver.ready.documents.title": "Документы + Admin",
  "driver.ready.documents.text": "KYC, права, авто, страховка и Admin approval обязательны до линии.",
  "driver.ready.dispatch.title": "Dispatch provider",
  "driver.ready.dispatch.text": "Назначение заказа не имитируется: нужен backend/provider matching.",
  "driver.ready.exact.title": "Exact approval",
  "driver.ready.exact.text": "Пополнение, списание Admin %, payout и runtime включаются только отдельным approval.",
  "control.deck.title": "Премиум control deck",
  "control.oneScreen.title": "Один экран заказа",
  "control.oneScreen.text": "A/B, тариф, цена, маршрут, safety и courier/intercity переключаются без лишней навигации.",
  "control.routeConfidence.title": "Маршрут без фейка",
  "control.routeConfidence.text": "Пробки, радары, камеры и скорость показываются как provider-ready preview, не как реальный map runtime.",
  "control.fareLock.title": "Цена без списания",
  "control.fareLock.text": "Quote locked до backend: нет payment intent, нет списания, нет успешной оплаты в UI.",
  "control.privacy.title": "Чистый runtime",
  "control.privacy.text": "Закрыл Taxi — закрылись поиск, гео и dispatch. Фон только для активной поездки после approval.",
  "control.status.preview": "premium preview",
  "control.status.provider": "provider locked",
  "control.status.noPayment": "без оплаты",
  "control.status.noBackground": "без вечного фона",
  "courier.chain.title": "Courier proof chain",
  "courier.chain.pickup.title": "Забор заказа",
  "courier.chain.pickup.text": "Фото/QR/вес и время забора появятся только из backend/provider.",
  "courier.chain.route.title": "Маршрут курьера",
  "courier.chain.route.text": "Скорость, остановки и ETA не подтверждаются без live location runtime.",
  "courier.chain.handoff.title": "Вручение",
  "courier.chain.handoff.text": "Подпись, фото вручения и спор по доставке работают только после delivery runtime.",
  "courier.chain.locked": "proof locked",
  "driver.policy.title": "Правила баланса водителя",
  "driver.policy.reserve.title": "Резерв перед заказом",
  "driver.policy.reserve.text": "Перед линией баланс должен покрывать минимум и будущую комиссию Admin % по заказу.",
  "driver.policy.autodebit.title": "Автосписание Admin %",
  "driver.policy.autodebit.text": "После реального завершения backend списывает Admin %; UI не делает debit сам.",
  "driver.policy.noPayout.title": "Payout не фейкуем",
  "driver.policy.noPayout.text": "До settlement/ledger/provider нет статуса успешной выплаты и нет money movement.",
  "driver.policy.reserveMetric": "резерв",
  "driver.policy.shortageMetric": "не хватает",
  "assurance.deck.title": "Sabi premium сценарии",
  "assurance.airport.title": "Аэропорт без суеты",
  "assurance.airport.text": "Встреча у терминала, багаж, ожидание и быстрый сценарий остаются provider-ready без fake dispatch.",
  "assurance.family.title": "Family control",
  "assurance.family.text": "Шаринг маршрута, SOS и скрытый номер показываются как безопасный UI, без fake incident submit.",
  "assurance.business.title": "Business поездки",
  "assurance.business.text": "Чеки, корпоративный профиль и отчёты не создаются без backend billing/ledger.",
  "assurance.intercity.title": "Межгород planner",
  "assurance.intercity.text": "Остановки, скорость, радары, отдых водителя и ночной режим locked до route/provider runtime.",
  "driver.money.title": "Деньги водителя без фейка",
  "driver.money.balance.title": "Баланс до заказа",
  "driver.money.balance.text": "Если баланс ниже минимума или будущей комиссии, водитель не получает и не принимает заказ.",
  "driver.money.commission.title": "Admin % после завершения",
  "driver.money.commission.text": "Списание комиссии возможно только после реального backend trip completed, не в UI.",
  "driver.money.reserve.title": "Резерв комиссии",
  "driver.money.reserve.text": "UI показывает нужный резерв и shortage, но не пополняет и не списывает деньги.",
  "driver.money.payout.title": "Payout locked",
  "driver.money.payout.text": "Выплаты водителю не показываются успешными без ledger, provider и exact approval.",
  "dispatch.deck.title": "Dispatch transparent preview",
  "dispatch.quote.title": "Цена понятна до отправки",
  "dispatch.quote.text": "Показываем quote preview, но не создаём заказ и не списываем деньги без backend.",
  "dispatch.driver.title": "Водитель не назначен фейком",
  "dispatch.driver.text": "Поиск водителя показывает только locked/provider-ready состояние до реального dispatch.",
  "dispatch.route.title": "Маршрут с причинами",
  "dispatch.route.text": "Пробки, радары, скорость и ETA показываются как слои preview, а не как подтверждённый runtime.",
  "dispatch.cancel.title": "Отмена и спор честно",
  "dispatch.cancel.text": "Отмена, штраф, спор и возврат не исполняются в UI и ждут backend policy.",
  "dispatch.status.policy": "policy locked",
  "nav.clean.title": "Чистая навигация",
  "nav.clean.layers.title": "Слои без шума",
  "nav.clean.layers.text": "Пробки, радары, камеры, скорость и ETA видны рядом с картой, без лишних экранов.",
  "nav.clean.speed.title": "Скорость движения",
  "nav.clean.speed.text": "UI показывает expected speed preview; реальная скорость только после location/provider runtime.",
  "nav.clean.background.title": "Не висит в фоне",
  "nav.clean.background.text": "Если Taxi закрыт и нет активной поездки, гео, dispatch и поиск должны быть остановлены.",
  "driver.settlement.title": "Settlement guard",
  "driver.settlement.before.title": "Перед линией",
  "driver.settlement.before.text": "Баланс должен покрывать минимум и будущую комиссию; иначе водитель не получает заказы.",
  "driver.settlement.after.title": "После поездки",
  "driver.settlement.after.text": "Admin-настраиваемая комиссия списывается только после реального backend trip completed.",
  "driver.settlement.dispute.title": "Спор / отмена",
  "driver.settlement.dispute.text": "Если есть спор, отмена или жалоба, списание/settlement не показываются успешными.",
  "driver.settlement.ledger.title": "Ledger без payout fake",
  "driver.settlement.ledger.text": "Net водителя появится только после ledger/provider, без fake payout и без money movement.",
  "handoff.title": "Честная цепочка заказа",
  "handoff.request.title": "Подготовка заявки",
  "handoff.request.text": "UI собирает A/B, тариф, опции и quote preview, но не создаёт реальный заказ.",
  "handoff.dispatch.title": "Dispatch без фейка",
  "handoff.dispatch.text": "Водитель появится только после backend/provider matching и driver balance gate.",
  "handoff.route.title": "Навигация preview",
  "handoff.route.text": "Пробки, радары, камеры, скорость и ETA не считаются реальным runtime.",
  "handoff.close.title": "Закрытие поездки",
  "handoff.close.text": "Завершение, чаевые, рейтинг, Admin % debit и payout locked до backend completion.",
  "handoff.deliveryPickup.title": "Забор доставки",
  "handoff.deliveryPickup.text": "Фото/QR/вес и время забора не подтверждаются без courier runtime.",
  "handoff.deliveryRoute.title": "Маршрут courier",
  "handoff.deliveryRoute.text": "Live location, скорость и ETA включаются только после provider approval.",
  "handoff.deliveryProof.title": "Proof вручения",
  "handoff.deliveryProof.text": "Подпись/фото/спор не исполняются в UI и остаются locked.",
  "handoff.deliverySettle.title": "Settlement доставки",
  "handoff.deliverySettle.text": "Admin-настраиваемая комиссия и net курьера считаются только после backend delivered.",
  "driver.timeline.title": "Driver money timeline",
  "driver.timeline.balance.title": "Баланс перед заказом",
  "driver.timeline.balance.text": "Если баланс ниже резерва, заказ не приходит водителю.",
  "driver.timeline.commission.title": "Будущая комиссия",
  "driver.timeline.commission.text": "Admin % показывается как preview и не списывается в UI.",
  "driver.timeline.net.title": "Будущий net",
  "driver.timeline.net.text": "Net водителя появится только после ledger/settlement.",
  "driver.timeline.locked": "Нет fake debit, fake top-up и fake payout: только UI calculation до exact approval.",
  "driver.settlement.locked": "settlement locked",
  "lifecycle.open.title": "Открытие Taxi без фонового старта",
  "lifecycle.open.text": "UI модуль открывается по маршруту Taxi; он не должен поднимать гео, dispatch, платежи или socket сам по себе.",
  "lifecycle.active.title": "Активная поездка только после approval",
  "lifecycle.active.text": "Фон, live location и navigation runtime разрешаются только для настоящей активной поездки после backend/provider.",
  "lifecycle.close.title": "Закрытие Taxi очищает runtime",
  "lifecycle.close.text": "Когда пользователь закрывает Taxi без активной поездки, UI должен остановить поиск, гео-preview и любые будущие подписки.",
  "lifecycle.recover.title": "Возврат без fake resume",
  "lifecycle.recover.text": "После повторного открытия нельзя показывать найденного водителя, оплату или поездку как успешные без backend state.",
  "lifecycle.status.uiOnly": "UI only",
  "lifecycle.status.runtimeLocked": "runtime locked",
  "lifecycle.status.shutdown": "clean shutdown",
  "lifecycle.status.noFakeResume": "no fake resume",
  "nav.clean.permissions.title": "Разрешения без обмана",
  "nav.clean.permissions.text": "Запрос геолокации должен быть понятным и точечным: только при заказе/активной поездке, не постоянно.",
  "nav.clean.close.title": "Taxi закрыт — фон закрыт",
  "nav.clean.close.text": "Если нет активной поездки, закрытый Taxi не держит маршрут, скорость, радары, dispatch и поиск в фоне.",
  "driver.access.noBalance.title": "Нет баланса — нет заказа",
  "driver.access.noBalance.text": "Водитель без денег на балансе не выходит в dispatch pool и не видит новые заказы для принятия.",
  "driver.access.topup.title": "Пополнение без fake success",
  "driver.access.topup.text": "Кнопка пополнения только ведёт в будущий Wallet/provider flow; UI не рисует успешное пополнение.",
  "driver.access.commission.title": "Admin % списывается реально",
  "driver.access.commission.text": "Admin-настраиваемая комиссия списывается автоматически только после настоящего backend trip completed, не после нажатия в UI.",

  "polish.passenger.title": "Premium UX без мусора",
  "polish.passenger.pickup.title": "Посадка понятнее",
  "polish.passenger.pickup.text": "Пассажир видит точку A/B, ориентир, вход и заметку водителю без лишних экранов и без fake GPS success.",
  "polish.passenger.fare.title": "Цена прозрачная",
  "polish.passenger.fare.text": "Quote preview объясняет тариф, маршрут и будущую комиссию; оплата не считается успешной в UI.",
  "polish.passenger.intercity.title": "Межгород премиум",
  "polish.passenger.intercity.text": "Остановки, багаж, ночная безопасность, скорость и радары собраны в одном чистом сценарии.",
  "polish.passenger.safety.title": "Safety рядом",
  "polish.passenger.safety.text": "SOS, шаринг маршрута, чат/звонок и скрытый номер видны сразу, но incident submit locked до backend.",
  "lifecycle.guard.title": "Lifecycle без фонового мусора",
  "lifecycle.guard.coldOpen.title": "Открытие без автозапуска",
  "lifecycle.guard.coldOpen.text": "Экран Taxi не поднимает геолокацию, socket, dispatch, платежи или навигацию сам по себе.",
  "lifecycle.guard.closeStop.title": "Закрыли Taxi — всё остановлено",
  "lifecycle.guard.closeStop.text": "Без активной поездки должны закрываться поиск, route preview, скорость, радары и будущие подписки.",
  "lifecycle.guard.activeOnly.title": "Фон только для поездки",
  "lifecycle.guard.activeOnly.text": "Фоновая навигация разрешается только для настоящей active trip, подтверждённой backend/provider.",
  "lifecycle.guard.resumeVerified.title": "Resume из backend state",
  "lifecycle.guard.resumeVerified.text": "Нельзя восстановить найденного водителя, оплату или завершение поездки без проверенного состояния backend.",
  "driver.revenue.title": "Revenue integrity водителя",
  "driver.revenue.balance.title": "Баланс до линии",
  "driver.revenue.balance.text": "Driver dispatch pool закрыт, пока баланс не покрывает минимум и будущую Admin % комиссию.",
  "driver.revenue.commission.title": "Admin % только реально",
  "driver.revenue.commission.text": "Комиссия списывается автоматически только после backend trip completed, не на экране.",
  "driver.revenue.settlement.title": "Нет settlement до закрытия",
  "driver.revenue.settlement.text": "Спор, отмена, жалоба или незавершённая поездка блокируют успешный settlement в UI.",
  "driver.revenue.payout.title": "Payout locked",
  "driver.revenue.payout.text": "Выплата водителю не показывается как успешная без ledger/provider/exact approval.",
  "courier.premium.title": "Premium courier flow",
  "courier.premium.pickup.title": "Забор с proof",
  "courier.premium.pickup.text": "QR, фото, вес, упаковка и время забора locked до courier backend/runtime.",
  "courier.premium.privacy.title": "Приватность получателя",
  "courier.premium.privacy.text": "Телефон и адрес получателя должны идти через Sabi privacy layer, без прямого раскрытия в UI.",
  "courier.premium.dispute.title": "Спор доставки",
  "courier.premium.dispute.text": "Повреждение, опоздание, отказ получателя и refund не исполняются без backend policy.",
  "courier.premium.settlement.title": "Settlement после proof",
  "courier.premium.settlement.text": "Admin-настраиваемая комиссия и net курьера считаются только после delivered/proof accepted.",
  "fare.breakdown.title": "Честная цена без списания",
  "fare.breakdown.base.title": "База тарифа",
  "fare.breakdown.base.text": "Показываем стартовую цену тарифа и ETA как preview, без создания реального заказа.",
  "fare.breakdown.route.title": "Маршрут и слои",
  "fare.breakdown.route.text": "Дистанция, пробки, радары, камеры и скорость не считаются подтверждённым runtime.",
  "fare.breakdown.service.title": "Сервисная часть",
  "fare.breakdown.service.text": "Оплата, fee, возвраты и спор будут считаться только backend/provider policy.",
  "fare.breakdown.driverNet.title": "Net водителя",
  "fare.breakdown.driverNet.text": "Net водителя появляется только после реальной поездки, Admin % комиссии и ledger settlement.",
  "fare.breakdown.noDebit.title": "Нет debit в UI",
  "fare.breakdown.noDebit.text": "UI не списывает деньги, не делает payment intent и не показывает успешную оплату.",
  "ops.readiness.title": "Operational readiness без фейка",
  "ops.readiness.request.title": "Заявка собирается локально",
  "ops.readiness.request.text": "A/B, тариф, intercity/delivery и safety собираются как provider-ready контракт.",
  "ops.readiness.geo.title": "Гео только точечно",
  "ops.readiness.geo.text": "Запрос location должен включаться только при заказе или активной поездке, не постоянно.",
  "ops.readiness.dispatch.title": "Dispatch locked",
  "ops.readiness.dispatch.text": "Поиск и назначение водителя не запускаются без backend dispatch provider.",
  "ops.readiness.close.title": "Закрытие очищает",
  "ops.readiness.close.text": "Закрытый Taxi не должен держать route, speed, radar, socket, search или location runtime.",
  "ops.readiness.recover.title": "Resume из backend",
  "ops.readiness.recover.text": "Повторное открытие читает только реальное backend состояние, без fake найденного водителя.",
  "driver.pool.title": "Driver dispatch pool guard",
  "driver.pool.balance.title": "Баланс до линии",
  "driver.pool.balance.text": "Если баланса нет или он ниже резерва, водитель не попадает в пул заказов.",
  "driver.pool.docs.title": "Документы до заказов",
  "driver.pool.docs.text": "Права, авто, страховка, KYC и Admin approval обязательны до выдачи заказов.",
  "driver.pool.reserve.title": "Резерв на комиссию",
  "driver.pool.reserve.text": "Баланс должен покрывать минимум и будущие Admin % от заказа до принятия.",
  "driver.pool.commission.title": "Admin % после completed",
  "driver.pool.commission.text": "Автосписание комиссии допустимо только после реального backend trip completed.",
  "driver.pool.provider.title": "Provider/payment locked",
  "driver.pool.provider.text": "Top-up, debit, payout и settlement не исполняются без exact approval и provider runtime.",
  "summary.ready.title": "Ride summary без fake completion",
  "summary.ready.noCompletion.title": "Завершение не фейкуем",
  "summary.ready.noCompletion.text": "История, чек, рейтинг и чаевые не появляются как успешные, пока backend реально не закрыл поездку.",
  "summary.ready.rating.title": "Рейтинг после backend state",
  "summary.ready.rating.text": "Оценка водителя/пассажира открывается только после verified trip completed, не от UI кнопки.",
  "summary.ready.tips.title": "Чаевые без fake payment",
  "summary.ready.tips.text": "Чаевые не списываются и не показываются успешными до payment/provider runtime.",
  "summary.ready.receipt.title": "Чек и спор locked",
  "summary.ready.receipt.text": "Receipt, dispute, refund и service fee формируются только из backend ledger/policy.",
  "trust.safety.title": "Safety trust center",
  "trust.safety.sos.title": "SOS без fake incident",
  "trust.safety.sos.text": "SOS виден рядом с поездкой, но incident submit не исполняется без backend safety runtime.",
  "trust.safety.share.title": "Шаринг маршрута",
  "trust.safety.share.text": "Маршрут можно готовить в UI, но live sharing включается только для реальной active trip.",
  "trust.safety.mask.title": "Скрытый номер и чат",
  "trust.safety.mask.text": "Чат/звонок идут через Sabi Messenger/Calls contracts, без прямого раскрытия номера.",
  "trust.safety.incident.title": "Жалоба и спор честно",
  "trust.safety.incident.text": "Жалоба, блокировка и refund не рисуются успешными без policy decision.",
  "intercity.control.title": "Межгород control center",
  "intercity.control.stops.title": "Остановки и багаж",
  "intercity.control.stops.text": "Остановки, багаж, ожидание и точки отдыха собираются как clean preview до route provider.",
  "intercity.control.rest.title": "Отдых водителя",
  "intercity.control.rest.text": "Для дальних поездок UI показывает safety/rest правила, но не подтверждает их без backend.",
  "intercity.control.speed.title": "Скорость, радары, камеры",
  "intercity.control.speed.text": "Слои intercity navigation остаются locked до настоящего location/provider runtime.",
  "intercity.control.price.title": "Цена межгорода без списания",
  "intercity.control.price.text": "Quote preview не создаёт оплату, удержание, штраф или settlement.",
  "driver.enforce.title": "Driver access enforcement",
  "driver.enforce.feed.title": "Нет баланса — нет ленты заказов",
  "driver.enforce.feed.text": "Водитель с низким балансом не должен видеть новые заказы и не попадает в dispatch pool.",
  "driver.enforce.reserve.title": "Резерв до offer",
  "driver.enforce.reserve.text": "До показа offer баланс должен покрывать минимум и будущую комиссию Admin % по заказу.",
  "driver.enforce.debit.title": "Debit только после completed",
  "driver.enforce.debit.text": "Admin % списывается автоматически только по real backend completed, не при принятии заказа.",
  "driver.enforce.payout.title": "Payout только после ledger",
  "driver.enforce.payout.text": "Выплаты и net не показываются успешными без ledger, provider и exact approval.",
  "final.ready.title": "Final Taxi readiness: premium UI-only",
  "final.ready.rider.title": "Заказ без лишних экранов",
  "final.ready.rider.text": "Пассажир видит A/B, тариф, цену, safety и межгород в одном чистом premium cockpit.",
  "final.ready.background.title": "Без постоянного импорта",
  "final.ready.background.text": "Taxi не должен держать гео, dispatch, socket, радары, скорость или route runtime после закрытия экрана.",
  "final.ready.provider.title": "Provider-ready контракт",
  "final.ready.provider.text": "Все реальные действия ждут backend/provider: quote submit, matching, location, payment, completion и ledger.",
  "final.ready.noFake.title": "No fake success",
  "final.ready.noFake.text": "UI не показывает успешную оплату, найденного водителя, завершение, top-up, debit Admin % или payout без backend state.",
  "flow.oneTap.title": "One-tap premium order flow",
  "flow.oneTap.ab.title": "A/B без хаоса",
  "flow.oneTap.ab.text": "Точка посадки, вход, ориентир и пункт B доступны сразу, без отдельной тяжёлой формы.",
  "flow.oneTap.tariff.title": "Тариф и цена рядом",
  "flow.oneTap.tariff.text": "Economy, Comfort, Business, Premium, Delivery и Intercity показываются рядом с quote preview без оплаты.",
  "flow.oneTap.safety.title": "Safety до заказа",
  "flow.oneTap.safety.text": "SOS, маршрут, чат/звонок, скрытый номер и жалоба видны заранее, но runtime locked.",
  "flow.oneTap.close.title": "Закрытие чистое",
  "flow.oneTap.close.text": "Если пользователь вышел из Taxi без active trip, future subscriptions должны быть остановлены.",
  "boundary.runtime.title": "Provider/runtime boundary",
  "boundary.runtime.location.title": "Location только по делу",
  "boundary.runtime.location.text": "Реальный GPS нельзя стартовать при открытии экрана; только permission + active order/trip после approval.",
  "boundary.runtime.dispatch.title": "Dispatch только backend",
  "boundary.runtime.dispatch.text": "Лента водителя, offer, matching и назначение не создаются и не имитируются в mobile UI.",
  "boundary.runtime.payment.title": "Payment locked",
  "boundary.runtime.payment.text": "Quote preview не создаёт payment intent, hold, debit, refund или success экран.",
  "boundary.runtime.settlement.title": "Settlement после trip state",
  "boundary.runtime.settlement.text": "admin-configured commission, net водителя, чаевые, чек и payout возможны только после verified backend trip completed.",
  "driver.topup.title": "Driver top-up readiness",
  "driver.topup.entry.title": "Пополнение как locked flow",
  "driver.topup.entry.text": "Кнопка пополнения показывает будущий Wallet/provider путь, но не меняет баланс в UI.",
  "driver.topup.provider.title": "Provider и exact approval",
  "driver.topup.provider.text": "Реальное пополнение, debit и payout включаются только через foundation/backend/Admin/provider approval.",
  "driver.topup.noSuccess.title": "Нет fake top-up",
  "driver.topup.noSuccess.text": "Нельзя показывать успешное пополнение, если нет transaction id, ledger state и provider callback.",
  "driver.topup.dispatch.title": "Доступ к заказам после баланса",
  "driver.topup.dispatch.text": "Только подтверждённый баланс выше минимума возвращает водителя в dispatch pool.",
  "session.exit.title": "Session lifecycle contract",
  "session.exit.open.title": "Открытие Taxi — UI-only",
  "session.exit.open.text": "При входе в Taxi не стартует гео, socket, dispatch, payment или settlement runtime.",
  "session.exit.active.title": "Фон только для active trip",
  "session.exit.active.text": "Live location, скорость, радары и навигация допускаются только для реальной активной поездки после backend/provider approval.",
  "session.exit.close.title": "Закрыли Taxi — всё остановлено",
  "session.exit.close.text": "UI contract требует остановить поиск, гео, route preview, dispatch poll и навигационные слои при закрытии Taxi.",
  "session.exit.resume.title": "Resume только из backend state",
  "session.exit.resume.text": "При повторном открытии нельзя показывать найденного водителя, оплату или завершение без verified backend session.",
  "payment.truth.title": "Payment truth center",
  "payment.truth.preview.title": "Цена — только preview",
  "payment.truth.preview.text": "Quote показывает структуру цены, но не создаёт оплату, hold, чек, комиссию или списание.",
  "payment.truth.hold.title": "Hold locked до provider",
  "payment.truth.hold.text": "Удержание, promo, refund, dispute и service fee остаются locked до Wallet/payment provider runtime.",
  "payment.truth.tips.title": "Чаевые после trip state",
  "payment.truth.tips.text": "Чаевые доступны только после реального backend trip completed и не могут быть fake-success.",
  "payment.truth.receipt.title": "Чек из ledger",
  "payment.truth.receipt.text": "Чек, комиссия и net водителя должны строиться из backend ledger, не из UI state.",
  "driver.liquidity.title": "Driver liquidity contract",
  "driver.liquidity.minimum.title": "Минимум баланса до линии",
  "driver.liquidity.minimum.text": "Водитель не входит в линию заказов, если баланс ниже минимального резерва.",
  "driver.liquidity.reserve.title": "Резерв покрывает Admin %",
  "driver.liquidity.reserve.text": "Перед offer баланс должен покрывать будущую комиссию Admin % по стоимости заказа.",
  "driver.liquidity.feed.title": "Нет денег — нет dispatch feed",
  "driver.liquidity.feed.text": "При недостатке баланса водитель не видит ленту, не получает offer и не может принять заказ.",
  "driver.liquidity.topup.title": "Top-up locked",
  "driver.liquidity.topup.text": "Пополнение баланса остаётся будущим Wallet/provider flow без fake top-up success.",
  "driver.liquidity.commission.title": "Admin % после completed",
  "driver.liquidity.commission.text": "Автосписание комиссии выполняется только после реального backend trip completed.",
  "league.driver.title": "Лига водителей по государствам",
  "league.passenger.title": "Лига пассажиров по государствам",
  "league.prizes.title": "Призы топ-3",
  "league.fair.title": "Fair play без азартных ставок",
  "league.status.country": "отдельно по каждой стране",
  "league.status.points": "баллы после verified trip",
  "league.status.stars": "звёзды от второй стороны",
  "league.status.quality": "качество и вежливость",
  "league.status.prizeLocked": "приз locked до Admin/backend verification",
  "league.driver.country.title": "Отдельный рейтинг страны",
  "league.driver.country.text": "Узбекистан, Казахстан, Россия, Китай и другие страны имеют отдельную таблицу, чтобы водители соревновались внутри своего рынка.",
  "league.driver.orders.title": "Больше verified заказов",
  "league.driver.orders.text": "Основные баллы водителя идут за реальные завершённые поездки, а не за UI preview или fake completion.",
  "league.driver.culture.title": "Вежливость и звёзды",
  "league.driver.culture.text": "Пассажир оценивает водителя: уважение, спокойная езда, помощь с багажом, без хамства и давления.",
  "league.driver.clean.title": "Чистота машины",
  "league.driver.clean.text": "Чистый салон, запах, ремни, аккуратная посадка и внешний вид машины дают quality points.",
  "league.driver.prizes.title": "Топ-3 водителя",
  "league.driver.prizes.text": "1, 2 и 3 место получают призы по своей стране только после проверки поездок, рейтинга, жалоб и антифрода.",
  "league.passenger.country.title": "Пассажирская лига страны",
  "league.passenger.country.text": "Пассажиры соревнуются отдельно по государству: активность, культура поездок и честные звёзды от водителей.",
  "league.passenger.trips.title": "Больше реальных поездок",
  "league.passenger.trips.text": "Баллы пассажира начисляются за verified поездки: город, межгород, business, airport и delivery без fake trip state.",
  "league.passenger.stars.title": "Звёзды пассажиру от водителя",
  "league.passenger.stars.text": "После поездки водитель ставит пассажиру звёзды за пунктуальность, вежливость, чистоту, бережное отношение и безопасность.",
  "league.passenger.culture.title": "Культура общения",
  "league.passenger.culture.text": "Система учит пассажиров быть вежливыми: хамство, угрозы, грязь и споры снижают league score после проверки.",
  "league.passenger.prizes.title": "Топ-3 пассажира",
  "league.passenger.prizes.text": "Самые активные и культурные пассажиры получают призы по стране, но reward payout locked до backend/Admin rules.",
  "league.prize.first.title": "1 место",
  "league.prize.first.text": "Главный приз страны: premium reward, промо или бонус — только после Admin approval и legal/payment review.",
  "league.prize.second.title": "2 место",
  "league.prize.second.text": "Второй приз страны: reward preview без fake payout и без автоматического начисления в UI.",
  "league.prize.third.title": "3 место",
  "league.prize.third.text": "Третий приз страны: честная награда после антифрода, жалоб и verified leaderboard snapshot.",
  "league.fair.noGambling.title": "Не казино и не ставки",
  "league.fair.noGambling.text": "Это мотивационная лига качества: пользователи не делают ставок, не покупают шанс и не получают fake money success.",
  "league.fair.verified.title": "Только verified trips",
  "league.fair.verified.text": "Заказы, звёзды, чаевые, жалобы и завершение должны приходить из backend state, не из локального UI.",
  "league.fair.abuse.title": "Антифрод и жалобы",
  "league.fair.abuse.text": "Накрутка поездок, договорные оценки, хамство, опасная езда и грязный салон должны снижать score после проверки.",
  "league.fair.admin.title": "Призы через Admin",
  "league.fair.admin.text": "Размеры призов, страны, сезон, налоги, правила и payout включаются только через Admin/foundation exact approval.",
  "league.score.title": "Честный подсчёт баллов",
  "league.mutual.title": "Взаимные звёзды после поездки",
  "league.governance.title": "Правила призов по странам",
  "league.status.verifiedOnly": "только verified trips",
  "league.status.twoWayStars": "звёзды с двух сторон",
  "league.status.countrySeason": "сезон по стране",
  "league.status.driverToPassenger": "водитель → пассажир",
  "league.status.passengerToDriver": "пассажир → водитель",
  "league.status.adminLocked": "Admin rules locked",
  "league.score.orders.title": "Заказы важны, но не единственные",
  "league.score.orders.text": "Больше verified заказов даёт основу баллов, но накрутка, отмены и спорные поездки должны фильтроваться backend/Admin.",
  "league.score.driverStars.title": "Звёзды водителю",
  "league.score.driverStars.text": "Пассажир оценивает водителя за вежливость, чистоту машины, спокойную езду, безопасность и помощь.",
  "league.score.passengerStars.title": "Звёзды пассажиру",
  "league.score.passengerStars.text": "Водитель оценивает пассажира за пунктуальность, уважение, чистоту, бережное отношение и отсутствие хамства.",
  "league.score.countrySeason.title": "Отдельный сезон страны",
  "league.score.countrySeason.text": "Каждая страна имеет отдельный сезон и рейтинг, чтобы рынки не смешивались и призы были справедливыми.",
  "league.mutual.driverRates.title": "Водитель ставит звёзды пассажиру",
  "league.mutual.driverRates.text": "После verified поездки водитель может оценить пассажира: пришёл вовремя, говорил уважительно, не мусорил и соблюдал safety.",
  "league.mutual.passengerRates.title": "Пассажир ставит звёзды водителю",
  "league.mutual.passengerRates.text": "Пассажир оценивает качество сервиса: чистота, культура, маршрут, аккуратность и помощь с посадкой/багажом.",
  "league.mutual.education.title": "Мотивация к вежливости",
  "league.mutual.education.text": "Лига должна мягко учить хамов нормальному поведению: уважение повышает баллы, жалобы и грубость снижают score после проверки.",
  "league.mutual.dispute.title": "Спорные оценки не применяются сразу",
  "league.mutual.dispute.text": "Низкие оценки, жалобы, угрозы или конфликтные поездки должны проходить policy/antifraud review до влияния на призы.",
  "league.governance.country.title": "Государства не смешиваются",
  "league.governance.country.text": "У каждой страны свой топ водителей и пассажиров: отдельные правила, сезон, призовой фонд и compliance.",
  "league.governance.topThree.title": "Только 1/2/3 место",
  "league.governance.topThree.text": "Призовые места показываются как preview: 1 место, 2 место, 3 место — без автоматической выплаты из UI.",
  "league.governance.noFake.title": "Нет fake reward",
  "league.governance.noFake.text": "UI не начисляет приз, бонус, промокод, деньги или payout; всё ждёт backend ledger, Admin и legal/payment проверку.",
  "league.governance.admin.title": "Admin задаёт сезон и призы",
  "league.governance.admin.text": "Период конкурса, страны, лимиты, налоги, антифрод, правила баллов и prize payout включаются только через foundation/Admin.",
  "league.season.title": "Сезон лиги по странам",
  "league.abuse.title": "Антинакрутка лиги",
  "league.stars.title": "Культура звёзд",
  "league.season.countryWindow.title": "Сезон отдельно по стране",
  "league.season.countryWindow.text": "Узбекистан, Казахстан, Россия и другие рынки имеют отдельный сезон, чтобы сильные страны не смешивали очки с новыми рынками.",
  "league.season.monthly.title": "Период задаёт Admin",
  "league.season.monthly.text": "Месяц, квартал или спец-сезон выбираются только через Admin; UI не запускает конкурс и не назначает призы сам.",
  "league.season.snapshot.title": "Финальный snapshot топ-3",
  "league.season.snapshot.text": "1/2/3 место фиксируются только после verified trips, жалоб, отмен, звёзд и антифрод-проверки.",
  "league.season.noPayout.title": "Приз не выплачивается из UI",
  "league.season.noPayout.text": "Даже если пользователь видит лидерборд, payout, промокод или бонус locked до backend ledger и legal/payment approval.",
  "league.abuse.fakeTrips.title": "Нет фейковых поездок",
  "league.abuse.fakeTrips.text": "Баллы не начисляются за локальный preview, тестовые клики, отменённые заказы или поездки без backend completion.",
  "league.abuse.ratingFarm.title": "Нет договорных звёзд",
  "league.abuse.ratingFarm.text": "Повторяющиеся круговые оценки, семейные накрутки и подозрительные звёзды должны уйти в policy review.",
  "league.abuse.cancelLoop.title": "Отмены и споры снижают доверие",
  "league.abuse.cancelLoop.text": "Частые отмены, конфликтные поездки и жалобы не должны давать быстрый рост в рейтинге.",
  "league.abuse.identity.title": "Личность и рынок проверяются",
  "league.abuse.identity.text": "Страна, аккаунт, устройство, водительские документы и платежный профиль проверяются backend/Admin до призов.",
  "league.stars.driverPassenger.title": "Звёзды пассажиру от водителя",
  "league.stars.driverPassenger.text": "Водитель оценивает пассажира за вежливость, пунктуальность, чистоту, бережное отношение к машине и safety.",
  "league.stars.passengerDriver.title": "Звёзды водителю от пассажира",
  "league.stars.passengerDriver.text": "Пассажир оценивает водителя за чистоту машины, спокойную езду, маршрут, помощь и культуру общения.",
  "league.stars.confirmed.title": "Оценка только после verified поездки",
  "league.stars.confirmed.text": "Звёзды нельзя применить до реального завершения поездки, backend state и защиты от fake rating.",
  "league.stars.dispute.title": "Защита от мести и хамства",
  "league.stars.dispute.text": "Спорная низкая оценка, угрозы, хамство или жалоба должны проходить review, чтобы не ломать честный конкурс.",
  "league.ai.title": "Sabi AI контроль честности",
  "league.penalty.title": "Жалобы за 1 день",
  "league.complaint.title": "Разбор жалоб",
  "league.cancel.title": "Отмена и поездка после отмены",
  "league.status.aiReview": "Sabi AI review",
  "league.status.dailyWindow": "счётчик за 1 день",
  "league.status.bothSides": "одинаково для водителя и пассажира",
  "league.status.pointsRemoved": "минус баллы",
  "league.status.oneHourCooldown": "1 час без заказов",
  "league.status.threeHourCooldown": "3 часа без заказов",
  "league.status.blockedReview": "блок до выяснения",
  "league.ai.always.title": "Постоянная аналитика Sabi AI",
  "league.ai.always.text": "Sabi AI должен постоянно проверять жалобы, звёзды, отмены, повторные маршруты, устройства, страну и подозрительную активность.",
  "league.ai.daily.title": "Жалобы считаются за один день",
  "league.ai.daily.text": "Санкции применяются по дневному окну: 1, 2, 3 или больше 3 жалоб за один день, не за весь период.",
  "league.ai.bothSides.title": "Одинаковые правила для всех",
  "league.ai.bothSides.text": "Водитель и пассажир получают одинаковую дисциплину: жалобы, хамство, договорные действия и угрозы влияют на баллы и доступ.",
  "league.ai.noFake.title": "UI не наказывает сам",
  "league.ai.noFake.text": "Экран показывает правила, но не снимает баллы и не блокирует аккаунт без backend/Admin/Sabi AI verification.",
  "league.penalty.one.title": "1 жалоба за день",
  "league.penalty.one.text": "После проверки снимаются баллы и звёздный рост замораживается для спорной поездки.",
  "league.penalty.two.title": "2 жалобы за день",
  "league.penalty.two.text": "После проверки снимаются баллы, и пользователь или водитель не получает новые заказы 1 час.",
  "league.penalty.three.title": "3 жалобы за день",
  "league.penalty.three.text": "После проверки снимаются баллы, и доступ к новым заказам блокируется на 3 часа.",
  "league.penalty.more.title": "Больше 3 жалоб за день",
  "league.penalty.more.text": "Аккаунт блокируется до выяснения обстоятельств или объяснения водителя/пассажира через review.",
  "league.complaint.evidence.title": "Жалоба должна иметь доказательства",
  "league.complaint.evidence.text": "Sabi AI и Admin проверяют текст, маршрут, время, рейтинг, отмены, чат, звонки и повторяемость перед санкцией.",
  "league.complaint.explanation.title": "Право на объяснение",
  "league.complaint.explanation.text": "При серьёзной блокировке водитель или пассажир должен иметь возможность объяснить ситуацию до окончательного решения.",
  "league.complaint.noRevenge.title": "Защита от мести",
  "league.complaint.noRevenge.text": "Договорные жалобы, месть после конфликта и фейковые обвинения должны снижать trust самого нарушителя.",
  "league.complaint.sameRules.title": "Санкции для пассажира тоже",
  "league.complaint.sameRules.text": "Пассажиры с жалобами тоже теряют баллы, звёзды, доступ к конкурсу и могут получить временную блокировку заказов.",
  "league.cancel.agreement.title": "Договорная отмена — нарушение",
  "league.cancel.agreement.text": "Если водитель и пассажир отменили заказ договорно ради обхода комиссии или лиги, это уходит в нарушение.",
  "league.cancel.afterRide.title": "Поездка после отмены — нарушение",
  "league.cancel.afterRide.text": "Если после отмены поездка фактически состоялась, Sabi AI должен пометить это как риск обхода правил.",
  "league.cancel.noPoints.title": "Нет баллов после отмены",
  "league.cancel.noPoints.text": "Отменённые поездки, спорные поездки и поездки после отмены не дают баллы, звёзды или прогресс в призах.",
  "league.cancel.review.title": "Review перед жёсткой блокировкой",
  "league.cancel.review.text": "Перед долгой блокировкой нужны backend-доказательства, сигнал Sabi AI и Admin review; UI не делает автоматический fake-ban.",

  "league.daily.title": "Дневной счётчик жалоб",
  "league.evidence.title": "Sabi AI доказательства",
  "league.appeal.title": "Объяснение и апелляция",
  "league.discipline.title": "Дисциплина конкурса",
  "league.daily.reset.title": "Счётчик сбрасывается по дню",
  "league.daily.reset.text": "1/2/3/>3 жалобы считаются в рамках одного календарного дня по стране; старые жалобы не смешиваются с новым днём.",
  "league.daily.countryClock.title": "День считается по стране",
  "league.daily.countryClock.text": "Для каждой страны применяется локальное окно дня, чтобы Узбекистан, Казахстан, Россия и другие рынки считались справедливо.",
  "league.daily.noCarryFake.title": "Нет вечного наказания из UI",
  "league.daily.noCarryFake.text": "UI не переносит штрафы сам и не делает fake-ban; дневная история должна прийти из backend/Sabi AI/Admin.",
  "league.daily.repeatWatch.title": "Повторные сигналы под наблюдением",
  "league.daily.repeatWatch.text": "Если жалобы повторяются изо дня в день, Sabi AI повышает риск и отправляет кейс на ручную проверку.",
  "league.evidence.route.title": "Маршрут и повторяемость",
  "league.evidence.route.text": "Sabi AI смотрит повторные маршруты, отмены, поездки после отмены, частые совпадения водителя и пассажира.",
  "league.evidence.chat.title": "Чат, звонки и жалобы",
  "league.evidence.chat.text": "Перед санкцией учитываются жалобы, текст, звонки, угрозы, грубость и время событий; одно слово без доказательств не должно ломать рейтинг.",
  "league.evidence.device.title": "Устройство, аккаунт и страна",
  "league.evidence.device.text": "Антифрод проверяет устройство, аккаунт, страну, документы водителя и подозрительные связи между участниками.",
  "league.evidence.starComplaint.title": "Звёзды против жалоб",
  "league.evidence.starComplaint.text": "Если звёзды и жалобы конфликтуют, прогресс лиги замораживается до проверки, чтобы не было мести и накрутки.",
  "league.appeal.warning.title": "Сначала warning после проверки",
  "league.appeal.warning.text": "Мягкие нарушения могут получить предупреждение и минус баллы, но UI не должен автоматически блокировать без evidence.",
  "league.appeal.explanation.title": "Право объяснить ситуацию",
  "league.appeal.explanation.text": "При блокировке больше 3 жалоб за день водитель или пассажир должен иметь экран объяснения до финального решения.",
  "league.appeal.admin.title": "Admin review обязателен",
  "league.appeal.admin.text": "Длительная блокировка, снятие призов, payout/reward stop и спорные кейсы требуют Admin review и backend evidence.",
  "league.appeal.noAuto.title": "Нет автоматической казни",
  "league.appeal.noAuto.text": "Sabi AI даёт сигнал, но реальные санкции применяются только через backend policy, Admin и audit trail.",
  "league.discipline.driver.title": "Водитель отвечает за сервис",
  "league.discipline.driver.text": "Хамство, грязная машина, опасная езда, договорные отмены и поездки после отмены снимают баллы и могут закрыть доступ к заказам.",
  "league.discipline.passenger.title": "Пассажир тоже отвечает",
  "league.discipline.passenger.text": "Хамство, угрозы, грязь, неуважение и ложные жалобы снимают баллы пассажира и могут временно закрыть заказ такси.",
  "league.discipline.prize.title": "Призы замораживаются при споре",
  "league.discipline.prize.text": "Если участник в топ-3 имеет активные жалобы или спорные поездки, приз locked до окончания проверки.",
  "league.discipline.cooldown.title": "Cooldown без новых заказов",
  "league.discipline.cooldown.text": "2 жалобы за день дают 1 час без заказов, 3 жалобы — 3 часа, больше 3 — блок до выяснения после проверки.",
  "league.escalation.title": "Ежедневная эскалация жалоб",
  "league.analytics.title": "Sabi AI аналитика конкурса",
  "league.trust.title": "Trust статус участника",
  "league.reward.title": "Безопасность призов",
  "league.dailyEscalation.warning.title": "1 жалоба за день",
  "league.dailyEscalation.warning.text": "После проверки снимаются баллы; звёзды и конкурсный прогресс по спорной поездке замораживаются.",
  "league.dailyEscalation.oneHour.title": "2 жалобы за день",
  "league.dailyEscalation.oneHour.text": "После проверки снимаются баллы и водитель/пассажир не получает новые заказы 1 час.",
  "league.dailyEscalation.threeHour.title": "3 жалобы за день",
  "league.dailyEscalation.threeHour.text": "После проверки снимаются баллы и доступ к новым заказам закрыт на 3 часа.",
  "league.dailyEscalation.block.title": "Больше 3 жалоб за день",
  "league.dailyEscalation.block.text": "Участник блокируется до выяснения обстоятельств, объяснения и Admin/Sabi AI решения.",
  "league.analytics.complaints.title": "Постоянная проверка жалоб",
  "league.analytics.complaints.text": "Sabi AI смотрит частоту, источник, повторяемость, маршрут, чат, звонки и конфликтные оценки перед санкцией.",
  "league.analytics.cancelAfter.title": "Договорная отмена и поездка после отмены",
  "league.analytics.cancelAfter.text": "Отмена по договорённости, обход комиссии или фактическая поездка после отмены считаются нарушением и уходят в review.",
  "league.analytics.stars.title": "Звёзды проверяются на честность",
  "league.analytics.stars.text": "Звёзды от водителя и пассажира сравниваются с жалобами, отменами, временем поездки и поведением в чате.",
  "league.analytics.country.title": "Проверка по стране",
  "league.analytics.country.text": "Лиги, жалобы и призы считаются отдельно по государству, локальному дню и подтверждённой стране аккаунта.",
  "league.trust.cleanDay.title": "Чистый день",
  "league.trust.cleanDay.text": "Нет verified жалоб за день: участник сохраняет доступ к лиге, звёздам и заказам.",
  "league.trust.review.title": "На проверке",
  "league.trust.review.text": "Есть спорные жалобы или конфликт звёзд: баллы и призовой прогресс locked до проверки.",
  "league.trust.cooldown.title": "Cooldown",
  "league.trust.cooldown.text": "После 2 или 3 verified жалоб за день новые заказы временно закрываются по правилам.",
  "league.trust.blocked.title": "Блок до выяснения",
  "league.trust.blocked.text": "Больше 3 verified жалоб за день: доступ закрыт до объяснения и решения Admin/Sabi AI.",
  "league.reward.noInstant.title": "Нет мгновенных призов",
  "league.reward.noInstant.text": "UI не выдаёт призы, промокоды, деньги или бонусы без backend/Admin/payment проверки.",
  "league.reward.freeze.title": "Приз frozen при споре",
  "league.reward.freeze.text": "Если у топ-3 есть открытые жалобы, отмены или fraud-сигналы, приз locked до финального решения.",
  "league.reward.admin.title": "Admin утверждает приз",
  "league.reward.admin.text": "Каждый приз проходит season snapshot, legal правила, anti-fraud, backend ledger и Admin approval.",
  "league.reward.country.title": "Призы по странам",
  "league.reward.country.text": "1/2/3 место выбираются отдельно для каждой страны; рынки не смешиваются.",
  "league.history.title": "История санкций за день",
  "league.freeze.title": "Причины заморозки призов",
  "league.appealStatus.title": "Статус объяснения",
  "league.decision.title": "Решение Sabi AI по жалобе",
  "league.history.countryDay.title": "История по дню и стране",
  "league.history.countryDay.text": "Санкции считаются в рамках одного локального дня конкретного государства, а не как вечный общий счётчик.",
  "league.history.bothSides.title": "Отдельно для водителя и пассажира",
  "league.history.bothSides.text": "UI показывает одинаковую дисциплину: ежедневная история жалоб применяется и к водителю, и к пассажиру.",
  "league.history.repeatRisk.title": "Повторы усиливают риск",
  "league.history.repeatRisk.text": "Если жалобы повторяются несколько дней подряд, Sabi AI повышает risk level и отправляет кейс на ручной review.",
  "league.history.noUiWrite.title": "UI не пишет санкции",
  "league.history.noUiWrite.text": "Экран не снимает баллы, не блокирует и не очищает историю сам; это только contract для backend/Admin/Sabi AI.",
  "league.freeze.complaint.title": "Открытая verified жалоба",
  "league.freeze.complaint.text": "Пока жалоба проверяется, звёзды, баллы и призы топ-3 остаются frozen до решения.",
  "league.freeze.cancelAfter.title": "Отмена по договорённости",
  "league.freeze.cancelAfter.text": "Договорная отмена и поездка после отмены замораживают прогресс конкурса и уходят в Sabi AI/Admin review.",
  "league.freeze.starConflict.title": "Конфликт звёзд и жалоб",
  "league.freeze.starConflict.text": "Если высокий рейтинг конфликтует с жалобой, prize/reward locked до анализа маршрута, чата и поведения.",
  "league.freeze.admin.title": "Нужен финальный Admin decision",
  "league.freeze.admin.text": "Приз, промокод, бонус или снятие участника из топ-3 подтверждаются только после backend evidence и Admin решения.",
  "league.appealStatus.draft.title": "Объяснение ожидается",
  "league.appealStatus.draft.text": "При блоке больше 3 жалоб за день участник должен иметь возможность объяснить обстоятельства.",
  "league.appealStatus.evidence.title": "Evidence собирается",
  "league.appealStatus.evidence.text": "Sabi AI проверяет маршрут, чат, звонки, отмены, повторяемость, страну и устройство перед санкцией.",
  "league.appealStatus.decision.title": "Ожидается решение",
  "league.appealStatus.decision.text": "Длительный блок, снятие призов или возврат баллов требуют Admin review и audit trail.",
  "league.appealStatus.restored.title": "Восстановление после чистого решения",
  "league.appealStatus.restored.text": "Если жалоба ложная или недоказанная, доступ и конкурсный статус должны восстанавливаться backend policy.",
  "league.decision.verified.title": "Жалоба подтверждена",
  "league.decision.verified.text": "Только verified жалоба может снять баллы, заморозить звёзды или включить cooldown по дневному правилу.",
  "league.decision.falseReport.title": "Ложная жалоба тоже нарушение",
  "league.decision.falseReport.text": "Если пассажир или водитель жалуется специально/ложно, санкции применяются к автору ложной жалобы после review.",
  "league.decision.cooldown.title": "Cooldown с таймером",
  "league.decision.cooldown.text": "2 жалобы за день дают 1 час, 3 жалобы — 3 часа без заказов; больше 3 — блок до выяснения.",
  "league.decision.noFake.title": "Нет fake sanction execution",
  "league.decision.noFake.text": "UI не запускает санкцию и не выдаёт приз; он показывает правила до настоящего backend/Admin решения.",
  "league.scoreImpact.title": "Влияние на баллы",
  "league.scoreImpact.order.title": "Баллы только за verified заказ",
  "league.scoreImpact.order.text": "Заказы повышают рейтинг только после реального backend trip completed и проверки страны/аккаунта.",
  "league.scoreImpact.stars.title": "Звёзды усиливают культуру",
  "league.scoreImpact.stars.text": "Звёзды водителя и пассажира влияют на баллы только после verified поездки и проверки Sabi AI.",
  "league.scoreImpact.complaint.title": "Verified жалоба снижает баллы",
  "league.scoreImpact.complaint.text": "Баллы снимаются только после подтверждения жалобы; дневная шкала 1/2/3/>3 применяется одинаково к водителю и пассажиру.",
  "league.scoreImpact.noUi.title": "UI не меняет реальные баллы",
  "league.scoreImpact.noUi.text": "Экран показывает правила и preview; реальные баллы, звёзды и санкции меняет только backend/Admin/Sabi AI.",
  "league.cooldown.title": "Причины cooldown/block",
  "league.cooldown.oneHourReason.title": "2 жалобы за день",
  "league.cooldown.oneHourReason.text": "После 2 verified жалоб за один день участник теряет баллы и на 1 час не получает/не принимает заказы.",
  "league.cooldown.threeHourReason.title": "3 жалобы за день",
  "league.cooldown.threeHourReason.text": "После 3 verified жалоб за один день участник теряет баллы и на 3 часа не получает/не принимает заказы.",
  "league.cooldown.blockReason.title": "Больше 3 жалоб за день",
  "league.cooldown.blockReason.text": "Больше 3 verified жалоб за день блокирует доступ до выяснения обстоятельств и объяснения участника.",
  "league.cooldown.countryDay.title": "Окно: страна + день",
  "league.cooldown.countryDay.text": "Жалобы считаются по каждой стране отдельно и только в рамках одного календарного дня.",
  "league.falseComplaint.title": "Защита от ложных жалоб",
  "league.falseComplaint.detect.title": "Sabi AI ищет ложные жалобы",
  "league.falseComplaint.detect.text": "Проверяются чат, звонки, маршрут, отмены, повторяемость, звёзды и история конфликтов.",
  "league.falseComplaint.penalty.title": "Ложная жалоба тоже нарушение",
  "league.falseComplaint.penalty.text": "Если водитель или пассажир специально жалуется ложно, санкции применяются к тому, кто подал ложную жалобу.",
  "league.falseComplaint.restore.title": "Восстановление после чистой проверки",
  "league.falseComplaint.restore.text": "Если жалоба не подтверждена, доступ к заказам, баллы и конкурсный статус должны быть восстановлены backend policy.",
  "league.falseComplaint.noRevenge.title": "Без мести и давления",
  "league.falseComplaint.noRevenge.text": "UI не позволяет показывать fake-ban или fake revenge; все решения проходят evidence + Admin/Sabi AI review.",
  "league.recovery.title": "Восстановление после проверки",
  "league.recovery.clean.title": "Чистое решение",
  "league.recovery.clean.text": "После чистого решения участник возвращается в лигу без ручной накрутки и без fake reward.",
  "league.recovery.points.title": "Возврат баллов по решению",
  "league.recovery.points.text": "Возврат баллов или звёзд возможен только по backend evidence и Admin/Sabi AI решению.",
  "league.recovery.access.title": "Доступ к заказам",
  "league.recovery.access.text": "Снятие cooldown/block открывает заказы только после серверного статуса, а не после UI-кнопки.",
  "league.recovery.audit.title": "Аудит сохраняется",
  "league.recovery.audit.text": "Каждое восстановление сохраняет audit trail: страна, дата, причина, evidence и Admin decision.",

  "league.audit.title": "Audit баллов и санкций",
  "league.audit.countryDay.title": "Страна + день",
  "league.audit.countryDay.text": "Каждое снятие или возврат баллов должно показывать страну, локальную дату, роль участника и источник решения.",
  "league.audit.scoreDelta.title": "Баллы до и после",
  "league.audit.scoreDelta.text": "Пользователь должен видеть, сколько баллов было, сколько снято или возвращено и почему это произошло.",
  "league.audit.evidence.title": "Evidence привязан к решению",
  "league.audit.evidence.text": "Жалоба, отмена, поездка после отмены, чат, звонки и маршрут связываются с audit trail, но UI не выполняет санкцию сам.",
  "league.audit.noUi.title": "UI не меняет историю",
  "league.audit.noUi.text": "Экран только показывает честную историю; запись audit, снятие баллов и восстановление делает backend/Admin/Sabi AI.",
  "league.adjustment.title": "Почему изменились баллы",
  "league.adjustment.complaint.title": "Verified жалоба",
  "league.adjustment.complaint.text": "После verified жалобы за день система показывает минус баллы, cooldown или блокировку как результат backend/Admin решения.",
  "league.adjustment.falseReport.title": "Ложная жалоба",
  "league.adjustment.falseReport.text": "Если жалоба признана ложной, штраф должен применяться к автору ложной жалобы, а невиновный участник восстанавливается.",
  "league.adjustment.restored.title": "Баллы возвращены",
  "league.adjustment.restored.text": "Возврат баллов, звёзд и доступа показывается только после clean decision с audit trail.",
  "league.adjustment.rewardFrozen.title": "Приз заморожен",
  "league.adjustment.rewardFrozen.text": "Если участник в топ-3 имеет спор, приз остаётся locked до финальной проверки и legal/payment approval.",
  "league.timeline.title": "Dispute evidence timeline",
  "league.timeline.opened.title": "Кейс открыт",
  "league.timeline.opened.text": "После жалобы или спорной отмены создаётся review case: роль, страна, дата, поездка и причина.",
  "league.timeline.ai.title": "Sabi AI проверяет",
  "league.timeline.ai.text": "Sabi AI анализирует маршруты, чат, звонки, звёзды, повторяемость, устройство, страну и историю жалоб.",
  "league.timeline.admin.title": "Admin принимает решение",
  "league.timeline.admin.text": "Длительная блокировка, снятие призов, восстановление баллов и спорные случаи требуют Admin review.",
  "league.timeline.final.title": "Финал и восстановление",
  "league.timeline.final.text": "После решения участник видит итог: санкция, восстановление, заморозка приза или снятие с лиги — без fake action из UI.",
  "league.transparency.title": "Прозрачность для участника",
  "league.transparency.why.title": "Понятно почему",
  "league.transparency.why.text": "Водитель и пассажир должны видеть не просто наказание, а причину: жалоба, отмена, звёзды, хамство или evidence conflict.",
  "league.transparency.next.title": "Понятно что дальше",
  "league.transparency.next.text": "Экран показывает следующий шаг: ждать review, дать объяснение, пройти cooldown, получить восстановление или Admin decision.",
  "league.transparency.sameRules.title": "Одинаково для водителя и пассажира",
  "league.transparency.sameRules.text": "Баллы, звёзды, жалобы, ложные жалобы, cooldown и блокировки применяются симметрично к обеим сторонам.",
  "league.transparency.noFake.title": "Без fake результата",
  "league.transparency.noFake.text": "UI не пишет, что баллы уже сняты, приз выдан или блокировка применена, пока это не пришло из backend/Admin/Sabi AI.",

  "league.warning.title": "Предупреждения без унижения",
  "league.warning.soft.title": "Мягкое предупреждение",
  "league.warning.soft.text": "После первой verified жалобы за день UI показывает спокойное предупреждение и правила, но не делает fake-блокировку.",
  "league.warning.cooldown.title": "Перед cooldown всё проверяется",
  "league.warning.cooldown.text": "Перед 1 или 3 часами без заказов Sabi AI должен подтвердить дневное окно, роль, страну и evidence.",
  "league.warning.block.title": "Блокировка только после evidence",
  "league.warning.block.text": "Больше 3 verified жалоб за день ведёт к блокировке до выяснения, но UI не применяет её без backend/Admin state.",
  "league.warning.noShame.title": "Без публичного позора",
  "league.warning.noShame.text": "Лиги должны воспитывать культуру, а не унижать: причины и appeal видит участник, публично показывается только честный рейтинг.",
  "league.coach.title": "Культура поведения",
  "league.coach.driver.title": "Водитель: сервис и чистота",
  "league.coach.driver.text": "Вежливость, чистая машина, безопасная езда и спокойное общение повышают доверие и конкурсные баллы после verified поездки.",
  "league.coach.passenger.title": "Пассажир: уважение и пунктуальность",
  "league.coach.passenger.text": "Пунктуальность, уважительный тон, бережное отношение к машине и отсутствие хамства помогают пассажиру получать звёзды от водителя.",
  "league.coach.stars.title": "Звёзды = культура, не давление",
  "league.coach.stars.text": "Звёзды от водителя и пассажира принимаются только после verified поездки; договорные звёзды и давление считаются нарушением.",
  "league.coach.cleanDay.title": "Чистый день помогает восстановиться",
  "league.coach.cleanDay.text": "Чистые дни без verified жалоб улучшают trust, но не стирают audit trail и не выдают fake reward.",
  "league.confidence.title": "Sabi AI confidence",
  "league.confidence.low.title": "Низкая уверенность",
  "league.confidence.low.text": "Если evidence слабый или противоречивый, UI показывает review pending и не позволяет fake sanction.",
  "league.confidence.medium.title": "Средняя уверенность",
  "league.confidence.medium.text": "Средний риск отправляется на manual/Admin review: участник может дать объяснение до долгой блокировки или снятия приза.",
  "league.confidence.high.title": "Высокая уверенность",
  "league.confidence.high.text": "Высокий риск появляется только при verified evidence: повторные жалобы за день, отмена по договорённости или поездка после отмены.",
  "league.confidence.human.title": "Человек проверяет тяжёлые решения",
  "league.confidence.human.text": "Долгая блокировка, снятие приза, payout freeze и спорные кейсы требуют Admin/legal review, а не только AI preview.",
  "league.eligibility.title": "Допуск к призам",
  "league.eligibility.country.title": "Страна отдельно",
  "league.eligibility.country.text": "Участник соревнуется в стране verified профиля/поездки; страны не смешиваются и не накручиваются через роуминг.",
  "league.eligibility.cleanDay.title": "Чистое дневное окно",
  "league.eligibility.cleanDay.text": "Для попадания в топ-3 учитываются verified поездки, звёзды и отсутствие открытых verified жалоб в дневном окне.",
  "league.eligibility.noCase.title": "Открытый кейс замораживает приз",
  "league.eligibility.noCase.text": "Если у участника открыт спор, приз, промокод, бонус или payout остаются locked до финального решения.",
  "league.eligibility.noFake.title": "Приз не выдаётся UI-кнопкой",
  "league.eligibility.noFake.text": "UI показывает только eligibility preview; фактическая награда требует season snapshot, backend ledger, Admin и provider/payment approval.",
  "kernel.bound.title": "Taxi Kernel: все подключения через ядро",
  "kernel.bound.facade.title": "Только kernel facade",
  "kernel.bound.facade.text": "Mobile UI не вызывает provider, backend runtime, Wallet, payment или dispatch напрямую: все действия идут через Taxi kernel facade.",
  "kernel.bound.events.title": "Events/state вместо прямого runtime",
  "kernel.bound.events.text": "UI читает только kernel-safe state и события: open, close, quote preview, report status, appeal status и readiness.",
  "kernel.bound.noDirect.title": "Запрет прямых provider/backend import",
  "kernel.bound.noDirect.text": "Карта, гео, dispatch, payment, payout, AI report и Admin decision не подключаются напрямую из мобильного слоя.",
  "kernel.bound.close.title": "Чистое закрытие Taxi",
  "kernel.bound.close.text": "Закрытие Taxi должно остановить search preview, route layers и UI session; фоновые процессы возможны только при реальной active trip после approval.",
  "kernel.status.facade": "Kernel facade only",
  "kernel.status.events": "Kernel events/state",
  "kernel.status.noDirect": "No direct imports",
  "kernel.status.safeSummary": "Safe summary only",
  "kernel.status.foundationReady": "Foundation 100% contract",
  "kernel.status.adminReady": "Admin 100% contract",
  "kernel.status.mobileNext": "Mobile UI/UX next",
  "kernel.status.sharedContracts": "Shared kernel contracts",
  "kernel.report.title": "Admin/Sabi AI daily report summary",
  "kernel.report.ai.title": "AI daily review",
  "kernel.report.ai.text": "Sabi AI обязан проверять все жалобы каждый день по стране/дню, но mobile видит только статус, не raw evidence.",
  "kernel.report.complaints.title": "Все жалобы проверяются",
  "kernel.report.complaints.text": "Жалобы водителя и пассажира, ложные жалобы, отмены и поездки после отмены проходят через Admin-compatible foundation.",
  "kernel.report.admin.title": "Admin locked decision",
  "kernel.report.admin.text": "Hard block, prize freeze/release, points change и восстановление публикуются в mobile только после Admin locked decision.",
  "kernel.report.mobile.title": "Безопасный итог для UI",
  "kernel.report.mobile.text": "Raw evidence остаётся в foundation/Admin; mobile показывает только мягкий статус, следующий шаг и честное объяснение без публичного унижения.",
  "kernel.completion.title": "Foundation + Admin подготовлены",
  "kernel.completion.foundation.title": "Foundation contract готов",
  "kernel.completion.foundation.text": "Taxi foundation содержит daily AI report, complaint review, approval gates, schema plan, route locks и no-fake boundaries.",
  "kernel.completion.admin.title": "Admin contract готов",
  "kernel.completion.admin.text": "Admin sections, dashboard filters, action inbox, approval gates и report completeness уже совместимы с основой.",
  "kernel.completion.runtime.title": "Runtime всё ещё locked",
  "kernel.completion.runtime.text": "Routes, scheduler, DB, Wallet, provider, payment, payout и reward release не включаются из mobile UI и требуют exact approval.",
  "kernel.completion.mobile.title": "Теперь доработка UI/UX",
  "kernel.completion.mobile.text": "После foundation/Admin readiness следующий слой — premium mobile UX: понятнее, быстрее, красивее, но строго через kernel.",
  "kernel.ux.title": "Premium UI/UX через kernel",
  "kernel.ux.cockpit.title": "Один чистый cockpit",
  "kernel.ux.cockpit.text": "Пассажир и водитель видят ключевые статусы рядом: маршрут, цена, безопасность, report status, appeal и no-fake locks.",
  "kernel.ux.sameContracts.title": "Одни contracts для rider/driver",
  "kernel.ux.sameContracts.text": "Лиги, жалобы, звёзды, баллы, cooldown и восстановление используют одинаковые kernel-safe contracts для обеих сторон.",
  "kernel.ux.noBackground.title": "Без лишнего фона",
  "kernel.ux.noBackground.text": "Taxi не должен висеть в фоне после закрытия; live location/navigation включаются только при реальной approved active trip.",
  "kernel.ux.noFake.title": "Нет fake-success",
  "kernel.ux.noFake.text": "UI не показывает fake driver found, fake payment, fake completed, fake sanction, fake reward, fake debit или fake payout.",
  "smart.title": "Умная панель Taxi",
  "smart.subtitle": "Быстрые действия и статусы без прямого provider/backend runtime",
  "smart.route.title": "Маршрут",
  "smart.route.status": "route preview only",
  "smart.delivery.status": "delivery preview only",
  "smart.price.title": "Цена",
  "smart.price.status": "без fake payment",
  "smart.safety.title": "Безопасность",
  "smart.safety.text": "SOS, report status и appeal показываются только как kernel-safe UI state.",
  "smart.driver.balance.title": "Баланс",
  "smart.driver.ready": "можно принимать после backend approval",
  "smart.driver.locked": "баланс недостаточен",
  "smart.driver.commission.title": "admin-configured commission",
  "smart.driver.commission.status": "preview без debit",
  "smart.driver.orders.title": "Заказы",
  "smart.driver.orders.text": "order pool locked until runtime approval",
  "smart.safeKernel.text": "002A сохраняет правило: UI улучшает удобство, но не вызывает dispatch, geo, payment, payout, Wallet или Admin evidence напрямую.",
  "clarity.title": "Понятный ход поездки",
  "clarity.subtitle": "Timeline, trust chips и следующий шаг без прямого runtime",
  "clarity.timeline.pickup.title": "Посадка",
  "clarity.timeline.pickup.text": "Точка посадки и маршрут показываются как preview без fake GPS.",
  "clarity.timeline.quote.title": "Цена",
  "clarity.timeline.quote.text": "Quote виден заранее, но payment success не имитируется.",
  "clarity.timeline.match.title": "Поиск",
  "clarity.timeline.match.text": "Driver matching locked до backend/provider approval.",
  "clarity.timeline.live.title": "В пути",
  "clarity.timeline.live.text": "Live navigation стартует только при real approved active trip.",
  "clarity.timeline.balance.title": "Баланс",
  "clarity.timeline.balance.ready": "Баланс выглядит готовым, но dispatch всё ещё требует runtime approval.",
  "clarity.timeline.balance.locked": "Без баланса водитель не видит и не принимает заказы.",
  "clarity.timeline.pool.title": "Пул заказов",
  "clarity.timeline.pool.text": "Orders pool preview не подключён к real dispatch.",
  "clarity.timeline.navigate.title": "Навигация",
  "clarity.timeline.navigate.text": "Route layers остаются UI preview до real trip.",
  "clarity.timeline.settle.title": "Расчёт",
  "clarity.timeline.settle.text": "admin-configured commission и payout только после backend ledger approval.",
  "clarity.trust.kernel": "kernel-only",
  "clarity.trust.safeSummary": "safe summary",
  "clarity.trust.noFake": "no fake",
  "clarity.trust.passenger": "passenger clarity",
  "clarity.trust.driver": "driver clarity",
  "clarity.next.passenger.title": "Следующий шаг пассажира",
  "clarity.next.passenger.text": "Выбрать маршрут, тариф и safety options; реальный заказ появится только после backend/provider readiness.",
  "clarity.next.driver.title": "Следующий шаг водителя",
  "clarity.next.driver.text": "Поддерживать баланс, документы и рейтинг; реальные заказы появятся только после dispatch approval.",
  "clarity.footer": "002B добавляет понятность поездки, но не включает provider/backend runtime, Wallet, payment, payout, DB или fake-success.",
  "composer.title": "Премиум настройка заказа",
  "composer.subtitle": "Комфорт, тариф и safety options только как kernel-safe UI",
  "composer.passenger.mode": "пассажир",
  "composer.driver.mode": "водитель",
  "composer.tariff.title": "Тариф и уровень комфорта",
  "composer.preferences.title": "Пожелания к поездке",
  "composer.safety.title": "Safety-first заказ",
  "composer.safety.text": "Пожелания, SOS и trust hints сохраняются как UI state; реальный заказ требует backend/provider readiness.",
  "composer.driver.balance.title": "Баланс и доступ",
  "composer.driver.balance.ready": "preview готов",
  "composer.driver.balance.locked": "пополнение нужно",
  "composer.driver.radius.title": "Радиус заказов",
  "composer.driver.radius.text": "Радиус и очередь заказов остаются preview до dispatch runtime approval.",
  "composer.driver.orders.title": "Пул заказов",
  "composer.driver.orders.text": "Driver видит только safe preview, не real dispatch и не fake order.",
  "composer.driver.noFake.title": "No fake income",
  "composer.driver.noFake.text": "Комиссия, debit и payout не показываются как выполненные без backend ledger.",
  "composer.footer": "002C улучшает order composer и comfort preferences, но не включает geo, dispatch, Wallet, payment, payout, DB или provider runtime.",
  "routeLive.title": "Маршрут и live preview",
  "routeLive.subtitle": "ETA, route confidence и pickup/dropoff без fake GPS",
  "routeLive.state.preview": "preview",
  "routeLive.state.search": "поиск locked",
  "routeLive.state.live": "live только real trip",
  "routeLive.driver.ready": "доступ preview",
  "routeLive.driver.locked": "баланс locked",
  "routeLive.metric.eta": "ETA",
  "routeLive.metric.distance": "дистанция",
  "routeLive.metric.fare": "цена",
  "routeLive.pickup.title": "Посадка",
  "routeLive.pickup.text": "Pickup point остаётся kernel-safe preview до approved active trip.",
  "routeLive.pickup.delivery": "точка забора",
  "routeLive.dropoff.title": "Куда едем",
  "routeLive.dropoff.text": "Dropoff и маршрут видны заранее, но navigation runtime не включён.",
  "routeLive.dropoff.delivery": "получатель",
  "routeLive.confidence.title": "Уверенность",
  "routeLive.confidence.value": "честный preview",
  "routeLive.confidence.text": "ETA/fare не обещают fake driver, fake GPS или fake payment.",
  "routeLive.driver.access.title": "Доступ водителя",
  "routeLive.driver.access.ready": "Баланс preview достаточный, но real dispatch требует backend approval.",
  "routeLive.driver.access.locked": "При низком балансе водитель не должен получать заказы.",
  "routeLive.driver.pickup.title": "Следующая подача",
  "routeLive.driver.pickup.value": "safe preview",
  "routeLive.driver.pickup.text": "Pickup карточка не является реальным назначенным заказом.",
  "routeLive.driver.commission.title": "Комиссия",
  "routeLive.driver.commission.text": "admin-configured commission только preview без ledger debit.",
  "routeLive.chip.kernel": "kernel-only",
  "routeLive.chip.preview": "route preview",
  "routeLive.chip.locked": "runtime locked",
  "routeLive.chip.live": "real trip only",
  "routeLive.chip.driver": "driver clarity",
  "routeLive.chip.passenger": "passenger clarity",
  "routeLive.footer": "002D улучшает маршрут и live preview, но не включает real location, dispatch, Wallet, payment, payout, DB, provider runtime или fake-success.",
  "safetySupport.title": "Safety / Support cockpit",
  "safetySupport.subtitle": "SOS, доверенные контакты, sharing и appeal без прямого runtime",
  "safetySupport.status.preview": "safe preview",
  "safetySupport.status.liveLocked": "live locked",
  "safetySupport.hero.trip": "поездка",
  "safetySupport.hero.mode": "режим",
  "safetySupport.hero.passenger.text": "Пассажир видит безопасность спокойно, без raw evidence и без публичных санкций.",
  "safetySupport.hero.driver.text": "Водитель видит только safe status, без fake complaint penalty и без fake reward.",
  "safetySupport.hero.delivery.text": "Доставка использует proof/status preview; реальная выдача только после backend/provider.",
  "safetySupport.hero.ride.text": "Такси показывает trip safety preview; live tools только для approved active trip.",
  "safetySupport.sos.title": "SOS и помощь",
  "safetySupport.sos.passenger.text": "SOS кнопка и emergency flow видны как UI-ready, но incident submit не фейкуется.",
  "safetySupport.sos.driver.text": "Водитель получает safety помощь только через kernel-safe flow и Admin review.",
  "safetySupport.share.title": "Поделиться маршрутом",
  "safetySupport.share.passenger.text": "Trip share открывается только как preview до реальной active trip.",
  "safetySupport.share.delivery.text": "Delivery share показывает безопасный статус заказа без raw location stream.",
  "safetySupport.contact.title": "Доверенный контакт",
  "safetySupport.contact.passenger.text": "Контакт получает только безопасный summary, без персональных evidence details.",
  "safetySupport.appeal.title": "Жалоба / appeal",
  "safetySupport.appeal.passenger.text": "Жалобы, appeal и объяснения идут через foundation/Admin, а mobile показывает только статус.",
  "safetySupport.issue.title": "Проблема по поездке",
  "safetySupport.issue.driver.text": "Водитель может видеть понятный путь жалобы, но решение только после AI/Admin review.",
  "safetySupport.fairness.title": "Fairness без фейка",
  "safetySupport.fairness.driver.text": "Нет fake sanction, fake points removal, fake block, fake restore или fake payout.",
  "safetySupport.support.title": "Поддержка Sabi",
  "safetySupport.support.driver.text": "Support inbox остаётся safe preview до approved backend route.",
  "safetySupport.chip.kernel": "kernel-only",
  "safetySupport.chip.noRawEvidence": "no raw evidence",
  "safetySupport.chip.adminReview": "Admin review",
  "safetySupport.chip.realTripOnly": "real trip only",
  "safetySupport.chip.previewOnly": "preview only",
  "safetySupport.footer": "002E добавляет safety/support UI, но не включает SOS runtime, live location, dispatch, Wallet, payment, payout, DB, provider или fake-success.",
  "postRide.title": "Рейтинг и честность после поездки",
  "postRide.subtitle": "Звёзды, комплименты, жалобы и points только после verified ride",
  "postRide.status.verifiedPreview": "verified preview",
  "postRide.status.locked": "после поездки",
  "postRide.status.verifiedOnly": "только verified ride",
  "postRide.status.delivery": "delivery proof required",
  "postRide.status.ride": "trip proof required",
  "postRide.status.noFakePayment": "без fake payment",
  "postRide.score.passenger": "Оценка водителя",
  "postRide.score.driver": "Оценка пассажира",
  "postRide.score.verified.text": "После проверенной поездки можно честно оценить культуру, чистоту и безопасность.",
  "postRide.score.locked.text": "До verified ride UI не ставит звёзды, баллы, санкции или награды.",
  "postRide.metric.fare": "Итог",
  "postRide.metric.noPayment": "no payment success",
  "postRide.metric.points": "Points",
  "postRide.metric.noReward": "no fake reward",
  "postRide.rate.driver.title": "Оценить водителя",
  "postRide.rate.driver.text": "Звёзды учитываются только после подтверждённой поездки и без давления.",
  "postRide.rate.passenger.title": "Оценить пассажира",
  "postRide.rate.passenger.text": "Водитель оценивает пассажира только после verified trip и честной причины.",
  "postRide.compliment.title": "Комплимент",
  "postRide.compliment.passenger.text": "Чистая машина, вежливость и аккуратная поездка повышают trust preview.",
  "postRide.tip.title": "Чаевые preview",
  "postRide.tip.passenger.text": "Tips не списываются и не подтверждаются без Wallet/payment backend.",
  "postRide.complaint.title": "Жалоба / appeal",
  "postRide.complaint.passenger.text": "Жалобы идут на Sabi AI/Admin review; raw evidence не показывается публично.",
  "postRide.cleanliness.title": "Культура и чистота",
  "postRide.cleanliness.driver.text": "Пассажирская аккуратность и уважение влияют на trust только после review.",
  "postRide.ledger.title": "Ledger preview",
  "postRide.ledger.driver.text": "admin-configured commission и driver payout остаются preview без backend ledger debit.",
  "postRide.dispute.title": "Спор после поездки",
  "postRide.dispute.driver.text": "False complaints, cancellation abuse и appeals уходят в Admin-compatible foundation.",
  "postRide.chip.verifiedOnly": "verified ride only",
  "postRide.chip.noFakeStars": "no fake stars",
  "postRide.chip.noFakeReward": "no fake reward",
  "postRide.chip.passengerFair": "passenger fair",
  "postRide.chip.driverFair": "driver fair",
  "postRide.footer": "002F добавляет post-ride fairness UI, но не включает stars write, points change, tips, payment, payout, Wallet, DB, provider или fake-success.",


  "trustPay.title": "Оплата и доверие preview",
  "trustPay.subtitle.passenger": "Честная цена и способы оплаты показываются без fake charge",
  "trustPay.subtitle.driver": "Расчёт, комиссия и payout остаются locked до backend approval",
  "trustPay.status.previewOnly": "preview only",
  "trustPay.hero.ride.label": "Ride payment readiness",
  "trustPay.hero.delivery.label": "Delivery payment readiness",
  "trustPay.hero.passenger.text": "Пассажир видит quote, способы оплаты и refund path как честный preview без списания.",
  "trustPay.hero.driver.text": "Водитель видит settlement, admin-configured commission и payout lock как safe preview без ledger mutation.",
  "trustPay.method.cash.title": "Наличные / COD",
  "trustPay.method.cash.text": "Способ может быть показан только как вариант; UI не подтверждает paid status.",
  "trustPay.method.card.title": "Карта / provider",
  "trustPay.method.card.text": "Card charge требует backend/payment provider и не выполняется из mobile UI.",
  "trustPay.method.wallet.title": "Sabi Wallet",
  "trustPay.method.wallet.text": "Wallet debit/top-up locked; screen only explains future payment readiness.",
  "trustPay.method.refund.title": "Refund / dispute",
  "trustPay.method.refund.text": "Refund, dispute and correction go through Admin/foundation review, not a UI fake result.",
  "trustPay.driver.settlement.title": "Settlement lock",
  "trustPay.driver.settlement.text": "Driver settlement starts only after verified completion and backend ledger approval.",
  "trustPay.driver.commission.title": "admin-configured commission",
  "trustPay.driver.commission.value": "Admin % locked",
  "trustPay.driver.commission.text": "Commission is preview only until verified trip and ledger debit are approved.",
  "trustPay.driver.balance.title": "Driver balance gate",
  "trustPay.driver.balance.ready": "ready preview",
  "trustPay.driver.balance.locked": "balance locked",
  "trustPay.driver.balance.text": "Low balance blocks order access; mobile does not create fake top-up or debit.",
  "trustPay.driver.payout.title": "Payout lock",
  "trustPay.driver.payout.text": "Payout requires creator/driver settlement, Admin/legal/payment approval and provider runtime.",
  "trustPay.method.locked": "locked",
  "trustPay.method.providerLocked": "provider locked",
  "trustPay.method.walletLocked": "Wallet locked",
  "trustPay.method.adminReview": "Admin review",
  "trustPay.confidence.quote": "quote",
  "trustPay.confidence.provider": "provider",
  "trustPay.confidence.receipt": "receipt",
  "trustPay.receipt.preview": "preview",
  "trustPay.chip.noCharge": "no charge",
  "trustPay.chip.noRefund": "no refund",
  "trustPay.chip.noPayout": "no payout",
  "trustPay.chip.passengerTruth": "passenger truth",
  "trustPay.chip.driverLedger": "driver ledger locked",
  "trustPay.footer": "002H добавляет payment-readiness trust UI, но не включает charge, refund, Wallet debit, top-up, payout, provider, DB, backend/Admin runtime или fake-success.",

  "earnings.title": "Баланс и доступ к заказам",
  "earnings.subtitle.driver": "Очередь заказов открывается только при достаточном driver balance",
  "earnings.subtitle.passenger": "Пассажир видит честную цену и правила доступа водителя без fake assignment",
  "earnings.status.accessReady": "доступ preview",
  "earnings.status.topUpRequired": "нужен баланс",
  "earnings.driver.balance.title": "Баланс водителя",
  "earnings.driver.balance.ready": "Баланс достаточный для order pool после backend approval.",
  "earnings.driver.balance.locked": "При низком балансе водитель не получает и не принимает заказы.",
  "earnings.driver.queue.title": "Очередь заказов",
  "earnings.driver.queue.text": "Order pool остаётся locked до реального dispatch/runtime approval.",
  "earnings.driver.commission.title": "Admin-настраиваемая комиссия",
  "earnings.driver.commission.text": "Комиссия списывается только после verified completed ride через backend ledger.",
  "earnings.driver.net.title": "Net preview",
  "earnings.driver.net.text": "До Wallet/payout approval это только расчётный preview, не доход и не payout.",
  "earnings.passenger.price.title": "Честная цена",
  "earnings.passenger.price.text": "Цена показана как quote preview без fake payment и без auto debit.",
  "earnings.passenger.access.title": "Доступ водителя",
  "earnings.passenger.access.value": "balance gate",
  "earnings.passenger.access.text": "Заказы видят только водители с approved access и достаточным балансом.",
  "earnings.passenger.commission.title": "Комиссия сервиса",
  "earnings.passenger.commission.text": "Admin % применяется к водителю после verified completion, не как fake списание.",
  "earnings.passenger.reward.title": "Reward fairness",
  "earnings.passenger.reward.text": "Призы, баллы и eligibility публикуются только после Admin/Sabi AI review.",
  "earnings.queue.preview": "queue preview",
  "earnings.queue.locked": "locked",
  "earnings.reward.preview": "review only",
  "earnings.hero.driver.label": "Driver access control",
  "earnings.hero.driver.text": "Баланс, очередь заказов, комиссия и net preview показаны честно, без Wallet mutation и fake payout.",
  "earnings.hero.passenger.label": "Passenger trust view",
  "earnings.hero.passenger.text": "Пассажир понимает цену, доступ водителя, комиссию и no-fake правила до реального runtime.",
  "earnings.access.minimum": "минимум",
  "earnings.access.service": "сервис",
  "earnings.access.runtime": "runtime",
  "earnings.chip.balanceGate": "balance gate",
  "earnings.chip.orderPoolLocked": "order pool locked",
  "earnings.chip.noWalletMutation": "no Wallet mutation",
  "earnings.chip.driverPreview": "driver preview",
  "earnings.chip.passengerTrust": "passenger trust",
  "earnings.footer": "002G улучшает driver earnings/access UI, но не включает Wallet debit, top-up, payout, payment, provider dispatch, order pool runtime, DB write или fake-success.",

  "adminPricing.title": "Тарифы и подключение управляются Admin",
  "adminPricing.subtitle.passenger": "Цена, тарифы и правила сервиса приходят из Admin config, не из hardcode UI.",
  "adminPricing.subtitle.driver": "Заявка подключения, комиссия и доступ к заказам проходят Admin review.",
  "adminPricing.status.adminControlled": "Admin controlled",
  "adminPricing.hero.ride.label": "Admin pricing control",
  "adminPricing.hero.delivery.label": "Admin delivery pricing",
  "adminPricing.hero.passenger.text": "Пассажир видит честный quote preview, но тарифы задаются и меняются в Admin.",
  "adminPricing.hero.driver.text": "Водитель/таксопарк подаёт заявку; подключение и комиссия одобряются в Admin.",
  "adminPricing.tariffs.title": "Тарифы из Admin",
  "adminPricing.tariffs.passenger.text": "Economy, Comfort, Business, Premium, delivery и intercity цены задаются в Admin panel.",
  "adminPricing.tariffs.driver.text": "Водитель видит тарифы только как approved/Admin-configured preview, без локального hardcode.",
  "adminPricing.quote.title": "Quote preview",
  "adminPricing.quote.passenger.text": "Mobile показывает расчётный preview; финальная цена приходит из backend/Admin tariff config.",
  "adminPricing.commission.title": "Комиссия из Admin",
  "adminPricing.commission.value": "Admin %",
  "adminPricing.commission.passenger.text": "Процент сервиса не фиксируется в mobile UI; Admin может менять commission policy.",
  "adminPricing.commission.driver.text": "Комиссия списывается только после verified ride и по текущей Admin-approved ставке.",
  "adminPricing.application.title": "Заявка на подключение",
  "adminPricing.application.review": "на рассмотрении",
  "adminPricing.application.reviewShort": "review",
  "adminPricing.application.approvedPreview": "approved preview",
  "adminPricing.application.passenger.text": "Пассажир получает водителя только после approved driver/park connection, не fake assignment.",
  "adminPricing.application.driver.text": "Driver/park application отправляется в Admin на проверку документов, условий и approval.",
  "adminPricing.runtime.title": "Runtime locked",
  "adminPricing.runtime.text": "Заявка, тарифы, комиссия и dispatch не включаются из UI; нужен backend/Admin runtime.",
  "adminPricing.value.admin": "Admin config",
  "adminPricing.chip.tariffsAdmin": "тарифы в Admin",
  "adminPricing.chip.commissionAdmin": "комиссия в Admin",
  "adminPricing.chip.applicationReview": "заявка на review",
  "adminPricing.chip.passengerTruth": "честная цена",
  "adminPricing.chip.driverConnect": "подключение через Admin",
  "adminPricing.footer": "002I фиксирует правило: тарифы и commission rate задаются в Admin, а подключение водителя/таксопарка проходит Admin review/approval; mobile только показывает kernel-safe preview без fake approval.",


  "onboarding.title": "Подключение через Admin review",
  "onboarding.subtitle.driver": "Заявка водителя/таксопарка: документы, авто, тарифы и approval только через Admin",
  "onboarding.subtitle.passenger": "Пассажир видит честный статус: водитель подключается только после Admin approval",
  "onboarding.status.adminReview": "Admin review",
  "onboarding.status.required": "обязательно",
  "onboarding.status.documents": "документы",
  "onboarding.status.adminConfig": "Admin config",
  "onboarding.status.pending": "на рассмотрении",
  "onboarding.status.previewReady": "preview ready",
  "onboarding.status.noFake": "no fake approval",
  "onboarding.hero.driver.label": "Заявка подключения",
  "onboarding.hero.driver.text": "Водитель или таксопарк подаёт заявку, а Admin проверяет профиль, документы, авто, тарифы и commission config.",
  "onboarding.hero.driver.value": "review",
  "onboarding.hero.passenger.label": "Доверие к подключению",
  "onboarding.hero.passenger.text": "Пассажир не видит fake-approved водителей: подключение появляется только после Admin review и approved runtime.",
  "onboarding.hero.passenger.value": "Admin",
  "onboarding.hero.unit": "approval",
  "onboarding.step.profile.title": "Профиль и страна",
  "onboarding.step.profile.text": "Admin проверяет личность, роль, страну работы и базовые условия подключения.",
  "onboarding.step.vehicle.title": "Авто / парк",
  "onboarding.step.vehicle.text": "Машина, класс, фото, таксопарк и доступ к заказам проходят review до показа как approved.",
  "onboarding.step.documents.title": "Документы",
  "onboarding.step.documents.text": "Водительские документы, лицензии и safety checks остаются pending до Admin decision.",
  "onboarding.step.tariffs.title": "Тарифы и комиссия",
  "onboarding.step.tariffs.text": "Тарифы, commission rate и правила доступа задаются в Admin, mobile только показывает preview.",
  "onboarding.step.decision.title": "Admin decision",
  "onboarding.step.decision.text": "Одобрение, отказ, hold или повторная проверка не фейкуются и не делаются из mobile UI.",
  "onboarding.passenger.trusted.title": "Проверенный водитель",
  "onboarding.passenger.trusted.text": "Пассажир получает только водителя, который прошёл Admin-compatible onboarding и runtime approval.",
  "onboarding.passenger.price.title": "Цена из Admin config",
  "onboarding.passenger.price.text": "Тарифы и commission config не hardcoded в mobile, а приходят из будущей Admin/foundation конфигурации.",
  "onboarding.passenger.noFake.title": "Без fake approval",
  "onboarding.passenger.noFake.text": "Mobile UI не показывает подключение, заказ или выплату как выполненные без backend/Admin/provider state.",
  "onboarding.chip.adminReview": "Admin review",
  "onboarding.chip.noFakeApproval": "no fake approval",
  "onboarding.chip.tariffAdmin": "tariffs in Admin",
  "onboarding.chip.driverPark": "driver/park request",
  "onboarding.chip.deliveryPark": "courier/park request",
  "onboarding.footer": "002J закрепляет: заявка подключения водителя/таксопарка уходит на Admin review/approval; тарифы и commission rate задаются в Admin; mobile остаётся kernel-safe UI без fake approval, payment, payout, dispatch или runtime.",

  "adminTariff.title": "Admin тарифы и eligibility",
  "adminTariff.subtitle.passenger": "Пассажир видит каталог тарифов и авто только как Admin-configured preview.",
  "adminTariff.subtitle.driver": "Водитель/таксопарк получает классы, комиссию и доступ к заказам только после Admin review.",
  "adminTariff.status.adminCatalog": "Admin catalog",
  "adminTariff.status.adminReview": "Admin review",
  "adminTariff.status.countryAdmin": "country config",
  "adminTariff.status.adminPercent": "Admin %",
  "adminTariff.status.previewReady": "preview ready",
  "adminTariff.status.locked": "locked",
  "adminTariff.status.eligibleOnly": "eligible only",
  "adminTariff.status.serviceConfig": "service config",
  "adminTariff.status.noFake": "no fake",
  "adminTariff.status.selected": "selected",
  "adminTariff.status.admin": "Admin",
  "adminTariff.hero.passenger.label": "Каталог из Admin",
  "adminTariff.hero.passenger.text": "Цена, классы авто, delivery/intercity и правила доступны только как честный preview до Admin/backend config.",
  "adminTariff.hero.driver.label": "Eligibility водителя",
  "adminTariff.hero.driver.text": "Класс авто, страна, тариф, комиссия и доступ к заказам проверяются и одобряются в Admin.",
  "adminTariff.hero.driver.value": "review",
  "adminTariff.catalog.adminPrice": "цена из Admin",
  "adminTariff.passenger.honest.title": "Честная цена",
  "adminTariff.passenger.honest.text": "Quote не обещает финальное списание: тариф и правила приходят из Admin/foundation config.",
  "adminTariff.passenger.vehicle.title": "Авто по eligibility",
  "adminTariff.passenger.vehicle.text": "Economy, Comfort, Business и Premium доступны только после approved vehicle/service eligibility.",
  "adminTariff.passenger.service.title": "Сервис",
  "adminTariff.passenger.service.ride": "Ride/intercity правила задаются в Admin и не включают fake driver assignment.",
  "adminTariff.passenger.service.delivery": "Delivery/courier/cargo правила задаются в Admin и не включают fake pickup proof.",
  "adminTariff.passenger.runtime.title": "Runtime locked",
  "adminTariff.passenger.runtime.text": "Mobile не включает dispatch, geo, charge, refund, payout или approval без backend/Admin/provider.",
  "adminTariff.eligibility.vehicle.title": "Класс авто",
  "adminTariff.eligibility.vehicle.text": "Admin проверяет авто, фото, класс, документы и возможность принимать конкретные тарифы.",
  "adminTariff.eligibility.country.title": "Страна работы",
  "adminTariff.eligibility.country.text": "Тарифы, комиссии и правила доступа разделяются по стране и не смешиваются в mobile.",
  "adminTariff.eligibility.commission.title": "Комиссия",
  "adminTariff.eligibility.commission.text": "Процент комиссии меняется в Admin; mobile показывает только Admin % preview.",
  "adminTariff.eligibility.orders.title": "Доступ к заказам",
  "adminTariff.eligibility.orders.text": "Пул заказов открывается только после approved application, баланса и runtime provider readiness.",
  "adminTariff.config.tariff": "тариф",
  "adminTariff.config.commission": "комиссия",
  "adminTariff.config.application": "заявка",
  "adminTariff.chip.tariffCatalog": "catalog from Admin",
  "adminTariff.chip.commissionAdmin": "commission in Admin",
  "adminTariff.chip.applicationReview": "application review",
  "adminTariff.chip.driverEligibility": "driver eligibility",
  "adminTariff.chip.passengerTruth": "passenger truth",
  "adminTariff.footer": "002K добавляет Admin-configured tariff catalog и vehicle/service eligibility preview: тарифы, commission rate и подключение одобряются в Admin; mobile не делает fake approval, dispatch, payment, payout, Wallet или runtime.",
  "zoneCoverage.title": "Города, зоны и доступность",
  "zoneCoverage.subtitle.passenger": "Зоны, аэропорт, межгород и доставка задаются в Admin",
  "zoneCoverage.subtitle.driver": "Город работы, аэропорт, межгород и доставка проходят Admin eligibility",
  "zoneCoverage.status.adminConfig": "Admin config",
  "zoneCoverage.status.adminZone": "Admin zone",
  "zoneCoverage.status.airportReview": "airport review",
  "zoneCoverage.status.airportPreview": "airport preview",
  "zoneCoverage.status.routeConfig": "route config",
  "zoneCoverage.status.deliveryConfig": "delivery config",
  "zoneCoverage.status.deliveryPreview": "delivery preview",
  "zoneCoverage.status.optional": "optional",
  "zoneCoverage.status.countryAdmin": "country in Admin",
  "zoneCoverage.status.runtimeLocked": "runtime locked",
  "zoneCoverage.hero.passenger.label": "Coverage из Admin",
  "zoneCoverage.hero.passenger.text": "Пассажир видит только честный preview: город, аэропорт, межгород и доставка открываются по Admin config и runtime readiness.",
  "zoneCoverage.hero.driver.label": "Рабочая зона водителя",
  "zoneCoverage.hero.driver.text": "Водитель/парк получает зоны, аэропорт, межгород и доставку только после Admin review, документов и eligibility.",
  "zoneCoverage.hero.driver.ready": "ready",
  "zoneCoverage.hero.driver.review": "review",
  "zoneCoverage.hero.driver.unit": "Admin",
  "zoneCoverage.passenger.city.title": "Городская зона",
  "zoneCoverage.passenger.city.text": "Городские тарифы, районы и доступность приходят из Admin catalog, не из mobile hardcode.",
  "zoneCoverage.passenger.airport.title": "Аэропорт",
  "zoneCoverage.passenger.airport.text": "Airport pickup/dropoff показывается как preview до реального provider/runtime включения.",
  "zoneCoverage.passenger.intercity.title": "Межгород",
  "zoneCoverage.passenger.intercity.text": "Межгород доступен только по Admin route config, country rules и approved drivers.",
  "zoneCoverage.passenger.delivery.title": "Доставка",
  "zoneCoverage.passenger.delivery.text": "Доставка, courier и cargo показываются как Admin-configured service preview без fake pickup.",
  "zoneCoverage.driver.city.title": "Город работы",
  "zoneCoverage.driver.city.text": "Driver city/region закрепляется в Admin после заявки, документов и проверки страны.",
  "zoneCoverage.driver.airport.title": "Аэропорт доступ",
  "zoneCoverage.driver.airport.text": "Аэропорт, терминалы и правила очереди включаются только после Admin eligibility.",
  "zoneCoverage.driver.intercity.title": "Межгород доступ",
  "zoneCoverage.driver.intercity.text": "Межгород требует отдельной Admin zone/route approval и не открывает provider dispatch из UI.",
  "zoneCoverage.driver.delivery.title": "Доставка доступ",
  "zoneCoverage.driver.delivery.text": "Delivery/courier/cargo назначаются в Admin и остаются locked до backend/provider readiness.",
  "zoneCoverage.config.country": "страна",
  "zoneCoverage.config.city": "зона",
  "zoneCoverage.config.runtime": "runtime",
  "zoneCoverage.chip.adminZones": "зоны из Admin",
  "zoneCoverage.chip.countrySeparated": "страны отдельно",
  "zoneCoverage.chip.noDispatchRuntime": "без dispatch runtime",
  "zoneCoverage.chip.driverApproval": "driver approval",
  "zoneCoverage.chip.passengerTruth": "честная доступность",
  "zoneCoverage.footer": "002L добавляет city/zone coverage preview: страна, город, аэропорт, межгород и доставка управляются Admin config/eligibility; mobile не запускает dispatch, geo, provider, payment, payout или fake approval.",
  "dispatchReadiness.title": "Готовность к заказам",
  "dispatchReadiness.subtitle.passenger": "Показываем, когда водитель будет доступен без fake assignment",
  "dispatchReadiness.subtitle.driver": "Доступ к заказам после Admin approval, баланса и runtime readiness",
  "dispatchReadiness.status.lockedPreview": "locked preview",
  "dispatchReadiness.status.adminConfig": "Admin config",
  "dispatchReadiness.status.adminReview": "Admin review",
  "dispatchReadiness.status.approvedPreview": "approved preview",
  "dispatchReadiness.status.balancePreview": "balance preview",
  "dispatchReadiness.status.balanceLocked": "balance locked",
  "dispatchReadiness.status.providerLocked": "provider locked",
  "dispatchReadiness.status.runtimeLocked": "runtime locked",
  "dispatchReadiness.status.poolPreview": "pool preview",
  "dispatchReadiness.status.noFake": "no fake",
  "dispatchReadiness.hero.passenger.label": "Честная готовность заказа",
  "dispatchReadiness.hero.passenger.text": "Пассажир видит ETA и доступность только как kernel-safe preview до реального Admin/backend/provider readiness.",
  "dispatchReadiness.hero.driver.label": "Доступ к очереди заказов",
  "dispatchReadiness.hero.driver.text": "Водитель попадает в очередь только после Admin одобрения заявки, баланса, зоны и live runtime readiness.",
  "dispatchReadiness.hero.driver.queue": "queue",
  "dispatchReadiness.hero.driver.review": "review",
  "dispatchReadiness.hero.driver.unit": "Admin",
  "dispatchReadiness.passenger.catalog.title": "Тариф из Admin",
  "dispatchReadiness.passenger.catalog.text": "Цена, классы авто и зоны приходят из Admin config; mobile не назначает тариф сам.",
  "dispatchReadiness.passenger.pool.title": "Пул водителей",
  "dispatchReadiness.passenger.pool.text": "Водитель показывается только после approved application, balance gate и provider readiness.",
  "dispatchReadiness.passenger.provider.title": "Provider readiness",
  "dispatchReadiness.passenger.provider.text": "Настоящий dispatch требует provider/backend runtime, а mobile пока показывает только preview.",
  "dispatchReadiness.passenger.noFake.title": "Без fake driver found",
  "dispatchReadiness.passenger.noFake.text": "UI не показывает найденного водителя, завершение или оплату без подтверждения backend/Admin/provider.",
  "dispatchReadiness.driver.admin.title": "Admin approval",
  "dispatchReadiness.driver.admin.text": "Заявка водителя/таксопарка проходит Admin review до доступа к заказам.",
  "dispatchReadiness.driver.balance.title": "Balance gate",
  "dispatchReadiness.driver.balance.text": "Без достаточного баланса водитель не входит в очередь и не получает заказы.",
  "dispatchReadiness.driver.provider.title": "Provider readiness",
  "dispatchReadiness.driver.provider.text": "Провайдер dispatch остаётся locked до backend readiness и отдельного approval.",
  "dispatchReadiness.driver.runtime.title": "Live runtime",
  "dispatchReadiness.driver.runtime.text": "GPS, навигация, назначение и live trip включаются только для настоящей approved поездки.",
  "dispatchReadiness.flow.application": "заявка подключения",
  "dispatchReadiness.flow.admin": "Admin review/approval",
  "dispatchReadiness.flow.balance": "баланс и зона",
  "dispatchReadiness.flow.provider": "provider readiness",
  "dispatchReadiness.flow.live": "live trip runtime",
  "dispatchReadiness.config.tariff": "тариф",
  "dispatchReadiness.config.access": "доступ",
  "dispatchReadiness.config.runtime": "runtime",
  "dispatchReadiness.chip.adminApproval": "Admin approval",
  "dispatchReadiness.chip.balanceGate": "balance gate",
  "dispatchReadiness.chip.providerReadiness": "provider readiness",
  "dispatchReadiness.chip.driverQueue": "очередь locked",
  "dispatchReadiness.chip.passengerTruth": "честный ETA",
  "dispatchReadiness.footer": "002M добавляет dispatch-readiness preview: доступ к заказам зависит от Admin approval, баланса, зон, provider/backend runtime и kernel-safe state; mobile не запускает dispatch, GPS, payment, payout или fake assignment.",
  "liveMap.title": "Live map control",
  "liveMap.subtitle.passenger": "Карта, пробки, радары и ETA как kernel-safe preview",
  "liveMap.subtitle.driver": "Навигация, скорость и зоны только после approval/runtime",
  "liveMap.status.uiOnly": "UI only",
  "liveMap.status.kernelPreview": "kernel preview",
  "liveMap.status.adminZone": "Admin zone",
  "liveMap.status.runtimeLocked": "runtime locked",
  "liveMap.status.noFakeGps": "no fake GPS",
  "liveMap.status.adminReview": "Admin review",
  "liveMap.status.routePreview": "route preview",
  "liveMap.status.speedPreview": "speed preview",
  "liveMap.status.noDispatch": "no dispatch",
  "liveMap.hero.passenger.label": "Карта без fake GPS",
  "liveMap.hero.passenger.text": "Показываем маршрут, пробки и ETA как preview; live location стартует только для настоящей approved поездки.",
  "liveMap.hero.driver.label": "Навигация после допуска",
  "liveMap.hero.driver.text": "Водитель получает live карту только после Admin approval, баланса, зоны, provider/backend readiness и approved trip.",
  "liveMap.hero.driver.ready": "ready",
  "liveMap.hero.driver.locked": "locked",
  "liveMap.hero.driver.unit": "map",
  "liveMap.passenger.pickup.title": "Точка подачи",
  "liveMap.passenger.pickup.text": "Pickup/dropoff видны как preview; настоящая геолокация не запускается из UI.",
  "liveMap.passenger.traffic.title": "Пробки",
  "liveMap.passenger.traffic.text": "Traffic layer зависит от runtime/provider data и сейчас остаётся честным preview.",
  "liveMap.passenger.radar.title": "Радары",
  "liveMap.passenger.radar.text": "Radar hints не заменяют правила дороги и не включают real navigation runtime.",
  "liveMap.passenger.eta.title": "ETA честно",
  "liveMap.passenger.eta.text": "Время подачи показывается как estimate, без fake driver assignment.",
  "liveMap.driver.zone.title": "Зона работы",
  "liveMap.driver.zone.text": "Город, аэропорт, межгород и доставка приходят из Admin eligibility.",
  "liveMap.driver.route.title": "Маршрут",
  "liveMap.driver.route.text": "Route preview не означает реальный заказ или live navigation.",
  "liveMap.driver.speed.title": "Скорость и безопасность",
  "liveMap.driver.speed.text": "Speed/radar подсказки только UI preview до approved runtime.",
  "liveMap.driver.live.title": "Live trip lock",
  "liveMap.driver.live.text": "GPS, dispatch и navigation включаются только после backend/provider/Admin approval.",
  "liveMap.chip.traffic": "traffic preview",
  "liveMap.chip.radar": "radar hints",
  "liveMap.chip.safePickup": "safe pickup",
  "liveMap.chip.noFakeGps": "no fake GPS",
  "liveMap.chip.zone": "Admin zone",
  "liveMap.chip.speed": "speed preview",
  "liveMap.chip.navigation": "navigation locked",
  "liveMap.chip.noDispatch": "no dispatch runtime",
  "liveMap.config.source": "source",
  "liveMap.config.kernel": "Taxi kernel",
  "liveMap.config.runtime": "runtime",
  "liveMap.config.dispatch": "dispatch",
  "liveMap.footer": "002N добавляет live-map/control preview: карта, пробки, радары, скорость и ETA остаются kernel-safe UI; mobile не запускает GPS, dispatch, provider, backend/Admin route, payment, payout или fake assignment.",

  "arrivalCoord.title": "Связь и встреча",
  "arrivalCoord.subtitle.passenger": "Точка встречи, сообщение, ожидание и поддержка только как kernel-safe preview",
  "arrivalCoord.subtitle.driver": "Я на месте, связь и pickup coordination без прямого звонка/runtime",
  "arrivalCoord.status.uiOnly": "UI only",
  "arrivalCoord.status.pickupPreview": "точка preview",
  "arrivalCoord.status.messengerLocked": "Messenger locked",
  "arrivalCoord.status.waitPreview": "ожидание preview",
  "arrivalCoord.status.safeSummary": "safe summary",
  "arrivalCoord.status.readyPreview": "ready preview",
  "arrivalCoord.status.adminReview": "Admin review",
  "arrivalCoord.status.routePreview": "route preview",
  "arrivalCoord.status.adminLocked": "Admin locked",
  "arrivalCoord.hero.passenger.label": "Встреча без fake call",
  "arrivalCoord.hero.passenger.text": "Пассажир видит точку встречи, сообщение и ожидание только как preview до approved trip/runtime.",
  "arrivalCoord.hero.driver.label": "Pickup coordination",
  "arrivalCoord.hero.driver.text": "Водитель видит сценарий связи и arrival только после Admin approval, balance, zone и runtime readiness.",
  "arrivalCoord.hero.driver.ready": "ready",
  "arrivalCoord.hero.driver.review": "review",
  "arrivalCoord.hero.driver.unit": "Admin",
  "arrivalCoord.meet.passenger.title": "Точка встречи",
  "arrivalCoord.meet.passenger.text": "Подъезд, вход, ориентир и безопасная зона показываются как подсказка, не как live GPS.",
  "arrivalCoord.meet.driver.title": "Я на месте",
  "arrivalCoord.meet.driver.text": "Статус arrival не отправляется из UI без реального approved trip и backend state.",
  "arrivalCoord.meet.delivery.text": "Для доставки точка выдачи, получатель и контакт остаются masked/preview до backend/provider readiness.",
  "arrivalCoord.passenger.meet.title": "Где встречаемся",
  "arrivalCoord.passenger.meet.text": "Pickup note, entrance и safe spot остаются UI подсказками без live dispatch.",
  "arrivalCoord.passenger.message.title": "Сообщение / звонок",
  "arrivalCoord.passenger.message.text": "Связь пойдёт через Messenger/kernel после approval; mobile не делает прямой call/SMS/provider action.",
  "arrivalCoord.passenger.wait.title": "Ожидание",
  "arrivalCoord.passenger.wait.text": "Waiting rules, fees и grace time приходят из Admin/backend config, не из hardcode UI.",
  "arrivalCoord.passenger.support.title": "Поддержка",
  "arrivalCoord.passenger.support.text": "Жалоба, спор или appeal показываются как safe entry без raw evidence в mobile.",
  "arrivalCoord.driver.arrived.title": "Я на месте",
  "arrivalCoord.driver.arrived.text": "Arrival статус публикуется только после реального заказа; сейчас это preview без fake completed.",
  "arrivalCoord.driver.contact.title": "Связь с пассажиром",
  "arrivalCoord.driver.contact.text": "Чат/звонок через защищённый Messenger/kernel, без прямого раскрытия телефона из UI.",
  "arrivalCoord.driver.pickup.title": "Pickup route",
  "arrivalCoord.driver.pickup.text": "Маршрут к точке встречи не запускает live navigation до approved runtime.",
  "arrivalCoord.driver.issue.title": "Проблема на pickup",
  "arrivalCoord.driver.issue.text": "No-show, отмена или спор уходят в Admin/Sabi AI review, не в fake санкцию.",
  "arrivalCoord.action.message": "message preview",
  "arrivalCoord.action.call": "call locked",
  "arrivalCoord.action.safety": "support safe",
  "arrivalCoord.chip.meetPoint": "точка встречи",
  "arrivalCoord.chip.safeMessenger": "safe Messenger",
  "arrivalCoord.chip.noFakeCall": "no fake call",
  "arrivalCoord.chip.waitingPreview": "ожидание preview",
  "arrivalCoord.chip.driverArrived": "arrival locked",
  "arrivalCoord.chip.adminReview": "Admin review",
  "arrivalCoord.chip.noDirectCall": "no direct call",
  "arrivalCoord.chip.kernelState": "kernel state",
  "arrivalCoord.footer": "002O добавляет связь и coordination: сообщение, звонок, arrival, waiting и pickup issue остаются kernel-safe UI; mobile не запускает прямой call/SMS, backend route, live GPS, dispatch, payment, payout или fake approval.",


  "tripProgress.title": "Ход поездки без fake-complete",
  "tripProgress.subtitle.passenger": "Статусы заказа, ожидания, старта и финиша только как kernel-safe preview",
  "tripProgress.subtitle.driver": "Очередь, подача, старт и расчёт после Admin/backend/runtime gates",
  "tripProgress.status.preview": "preview",
  "tripProgress.status.liveLocked": "live locked",
  "tripProgress.status.driverReadyPreview": "ready preview",
  "tripProgress.status.adminBalanceLocked": "Admin/balance",
  "tripProgress.status.waitingPreview": "ожидание preview",
  "tripProgress.status.noFakeStart": "без fake start",
  "tripProgress.status.noFakeComplete": "без fake finish",
  "tripProgress.status.receiptLocked": "receipt locked",
  "tripProgress.status.arrivalLocked": "arrival locked",
  "tripProgress.status.payoutLocked": "payout locked",
  "tripProgress.hero.passenger.label": "Поездка не завершается фейком",
  "tripProgress.hero.passenger.text": "UI показывает прогресс спокойно: заявка, поиск, подача, поездка, финиш — только после реальных backend/provider статусов.",
  "tripProgress.hero.driver.label": "Рабочий статус водителя",
  "tripProgress.hero.driver.text": "Водитель проходит Admin approval, balance gate, zone eligibility и runtime readiness до очереди и поездки.",
  "tripProgress.hero.driver.ready": "ready",
  "tripProgress.hero.driver.review": "review",
  "tripProgress.hero.driver.unit": "Admin",
  "tripProgress.passenger.request.title": "Заявка",
  "tripProgress.passenger.request.text": "Создание заказа не отправляется без backend/provider и Admin-config tariff.",
  "tripProgress.passenger.match.title": "Поиск",
  "tripProgress.passenger.match.text": "Нельзя показывать найденного водителя без реального matching/dispatch.",
  "tripProgress.passenger.pickup.title": "Подача",
  "tripProgress.passenger.pickup.text": "Подача и ожидание не стартуют без approved trip runtime.",
  "tripProgress.passenger.finish.title": "Финиш",
  "tripProgress.passenger.finish.text": "Завершение, чек и рейтинг доступны только после verified ride.",
  "tripProgress.driver.access.title": "Доступ",
  "tripProgress.driver.access.text": "Доступ к линии после Admin approval, документов, зоны и баланса.",
  "tripProgress.driver.queue.title": "Очередь",
  "tripProgress.driver.queue.text": "Заказы не приходят, пока provider/backend runtime locked.",
  "tripProgress.driver.pickup.title": "Подача",
  "tripProgress.driver.pickup.text": "Навигация и arrival status только после реального заказа.",
  "tripProgress.driver.settle.title": "Расчёт",
  "tripProgress.driver.settle.text": "Комиссия и payout остаются Admin-configured/locked до backend ledger.",
  "tripProgress.passenger.waiting.title": "Ожидание",
  "tripProgress.passenger.waiting.text": "Правила ожидания и платное ожидание задаются Admin/backend, не mobile hardcode.",
  "tripProgress.passenger.waiting.delivery.text": "Для доставки ожидание получателя и handoff остаются preview до backend/provider.",
  "tripProgress.passenger.start.title": "Старт поездки",
  "tripProgress.passenger.start.text": "Старт поездки не показывается без approved driver, live GPS и backend trip state.",
  "tripProgress.passenger.complete.title": "Финиш",
  "tripProgress.passenger.complete.text": "Финиш, оплата, рейтинг и очки появляются только после verified completion.",
  "tripProgress.passenger.receipt.title": "Чек",
  "tripProgress.passenger.receipt.text": "Чек и спор доступны после реального backend receipt, без fake payment/refund.",
  "tripProgress.driver.online.title": "На линии",
  "tripProgress.driver.online.text": "Статус линии не открывает очередь без approval, баланса, зоны и provider runtime.",
  "tripProgress.driver.arrive.title": "Я на месте",
  "tripProgress.driver.arrive.text": "Arrival публикуется только после реального заказа и kernel event.",
  "tripProgress.driver.finish.title": "Завершить",
  "tripProgress.driver.finish.text": "Driver не может fake complete поездку; backend должен подтвердить маршрут/статус.",
  "tripProgress.driver.settlement.title": "Расчёт",
  "tripProgress.driver.settlement.text": "Payout, комиссия и баланс меняются только через backend/Admin ledger.",
  "tripProgress.truth.title": "Честный state machine",
  "tripProgress.truth.text": "Mobile показывает только безопасные статусы. Старт, финиш, списание, refund, баллы и санкции не происходят в UI.",
  "tripProgress.truth.delivery.text": "Для доставки proof, handoff, dispute и receipt тоже ждут backend/provider и Admin review.",
  "tripProgress.chip.kernelState": "kernel state",
  "tripProgress.chip.noFakeStart": "no fake start",
  "tripProgress.chip.noFakeFinish": "no fake finish",
  "tripProgress.chip.adminConfig": "Admin config",
  "tripProgress.chip.adminApproval": "Admin approval",
  "tripProgress.chip.balanceGate": "balance gate",
  "tripProgress.chip.providerRuntime": "provider runtime",
  "tripProgress.chip.noPayout": "payout locked",
  "tripProgress.footer": "002P добавляет trip-progress/ride-state preview: заявка, поиск, подача, старт, ожидание, финиш и чек остаются kernel-safe UI; mobile не создаёт fake trip, fake complete, payment, refund, payout, DB или dispatch.",
  "cancelFair.title": "Отмена и честность без fake санкций",
  "cancelFair.subtitle.passenger": "Отмена, ожидание, no-show и appeal только через kernel-safe preview",
  "cancelFair.subtitle.driver": "Водитель защищён evidence/Admin review до штрафов, cooldown или блокировки",
  "cancelFair.status.safeRules": "правила",
  "cancelFair.status.matchingPreview": "matching preview",
  "cancelFair.status.driverReadyPreview": "ready preview",
  "cancelFair.status.adminReview": "Admin review",
  "cancelFair.status.previewOnly": "preview only",
  "cancelFair.status.aiReview": "Sabi AI review",
  "cancelFair.status.appealOpen": "appeal open",
  "cancelFair.status.noFakePenalty": "no fake penalty",
  "cancelFair.status.safeEvidence": "safe evidence",
  "cancelFair.status.locked": "locked",
  "cancelFair.hero.passenger.label": "Отмена не наказывает UI-кнопкой",
  "cancelFair.hero.passenger.text": "Пассажир видит правила отмены, ожидания и спора, но баллы/санкции не меняются без Admin/Sabi AI decision.",
  "cancelFair.hero.passenger.delivery.text": "Для доставки отмена, no-show получателя и handoff dispute идут как preview до backend/Admin review.",
  "cancelFair.hero.passenger.metric": "appeal",
  "cancelFair.hero.driver.label": "Защита водителя и пассажира",
  "cancelFair.hero.driver.ready.text": "Даже при готовом доступе водитель не получает fake penalty: no-show, отмена и спор проверяются.",
  "cancelFair.hero.driver.review.text": "Пока заявка/баланс/зона не готовы, отмена и очередь отображаются как Admin review preview.",
  "cancelFair.hero.driver.ready": "ready",
  "cancelFair.hero.driver.review": "review",
  "cancelFair.hero.unit": "fair",
  "cancelFair.passenger.before.title": "До matching",
  "cancelFair.passenger.before.text": "Отмена до реального matching остаётся безопасным UI preview без payment/refund.",
  "cancelFair.passenger.matching.title": "Во время поиска",
  "cancelFair.passenger.matching.text": "Нельзя показать driver found или penalty, пока dispatch/provider runtime locked.",
  "cancelFair.passenger.pickup.title": "Pickup / ожидание",
  "cancelFair.passenger.pickup.text": "Ожидание, no-show и pickup dispute требуют evidence, дневного окна и Admin review.",
  "cancelFair.passenger.after.title": "После поездки",
  "cancelFair.passenger.after.text": "Complaint, rating, receipt и appeal доступны только после verified ride/backend state.",
  "cancelFair.driver.review.title": "Заявка/доступ",
  "cancelFair.driver.review.text": "Таксопарк/водитель ждёт Admin approval; отмена не открывает очередь сама.",
  "cancelFair.driver.queue.title": "Очередь",
  "cancelFair.driver.queue.text": "Заказы, отказ и no-show не работают без approved runtime/provider readiness.",
  "cancelFair.driver.pickup.title": "На pickup",
  "cancelFair.driver.pickup.text": "Опоздание, no-show или конфликт сохраняются как safe evidence preview.",
  "cancelFair.driver.settle.title": "После кейса",
  "cancelFair.driver.settle.text": "Баллы, cooldown, reward freeze и восстановление публикуются только после Admin locked decision.",
  "cancelFair.passenger.clean.title": "Чистая отмена",
  "cancelFair.passenger.clean.text": "UI объясняет правила без списания, refund или fake status change.",
  "cancelFair.passenger.noshow.title": "No-show",
  "cancelFair.passenger.noshow.text": "No-show не становится санкцией без evidence bundle и review.",
  "cancelFair.passenger.arranged.title": "Отмена по договорённости",
  "cancelFair.passenger.arranged.text": "Договорная отмена и поездка после отмены отмечаются как violation candidate, не как готовое наказание.",
  "cancelFair.passenger.appeal.title": "Appeal",
  "cancelFair.passenger.appeal.text": "Участник видит мягкий entry для объяснения, raw evidence остаётся в Admin/foundation.",
  "cancelFair.driver.cancel.title": "Отмена водителя",
  "cancelFair.driver.cancel.text": "Причина отмены уходит на review; mobile не снимает баллы и не закрывает доступ.",
  "cancelFair.driver.noshow.title": "Пассажир не вышел",
  "cancelFair.driver.noshow.text": "No-show пассажира проверяется по времени, месту и evidence, не по кнопке.",
  "cancelFair.driver.issue.title": "Pickup спор",
  "cancelFair.driver.issue.text": "Pickup issue идёт через Messenger/kernel summary и Admin/Sabi AI review.",
  "cancelFair.driver.appeal.title": "Защита решения",
  "cancelFair.driver.appeal.text": "До тяжёлых мер водитель/пассажир получает explanation/appeal path.",
  "cancelFair.truth.title": "Только честный outcome",
  "cancelFair.truth.passenger.text": "Mobile не делает fake sanction, refund, reward, cooldown или block; он показывает next step и review status.",
  "cancelFair.truth.driver.text": "Driver balance, queue access, score и payout не меняются из UI после жалобы или отмены.",
  "cancelFair.chip.dailyWindow": "daily window",
  "cancelFair.chip.noFakePenalty": "no fake penalty",
  "cancelFair.chip.adminReview": "Admin review",
  "cancelFair.chip.appeal": "appeal",
  "cancelFair.chip.driverProtected": "driver protected",
  "cancelFair.chip.noShowReview": "no-show review",
  "cancelFair.chip.arrangedCancel": "arranged cancel",
  "cancelFair.chip.noPayoutChange": "no payout change",
  "cancelFair.footer": "002Q добавляет cancellation/fairness preview: отмена, no-show, ожидание, договорная отмена, поездка после отмены и appeal остаются kernel-safe UI; mobile не применяет fake санкции, refund, reward, DB, dispatch, payment или payout.",

  "leagueVisible.title": "Лиги и призы: честный preview",
  "leagueVisible.subtitle.passenger": "Страна, очки, звёзды и призы только после verified ride/Admin rules",
  "leagueVisible.subtitle.driver": "Доступ к лиге после Admin approval, баланса и verified trips",
  "leagueVisible.status.previewOnly": "preview only",
  "leagueVisible.status.reviewReady": "review ready",
  "leagueVisible.status.driverEligiblePreview": "eligible preview",
  "leagueVisible.status.adminReview": "Admin review",
  "leagueVisible.status.countrySeparated": "страна отдельно",
  "leagueVisible.status.verifiedRideOnly": "только verified ride",
  "leagueVisible.status.adminAiReview": "Admin/Sabi AI",
  "leagueVisible.status.noFakeReward": "no fake reward",
  "leagueVisible.status.payoutLocked": "payout locked",
  "leagueVisible.status.locked": "locked",
  "leagueVisible.hero.passenger.label": "Пассажирская лига",
  "leagueVisible.hero.passenger.text": "Очки, звёзды, культура поездки и призы показываются как честный preview до verified backend state.",
  "leagueVisible.hero.passenger.delivery.text": "Доставка тоже учитывается только после verified delivery state, без fake points и публичного shame.",
  "leagueVisible.hero.driver.label": "Водительская лига",
  "leagueVisible.hero.driver.ready.text": "Водитель видит eligibility preview: страна, баланс, качество, verified trips и Admin-config rules.",
  "leagueVisible.hero.driver.review.text": "Пока заявка/баланс/зона не approved, лига и очередь заказов остаются locked preview.",
  "leagueVisible.hero.driver.ready": "ready",
  "leagueVisible.hero.driver.review": "review",
  "leagueVisible.hero.unit": "state",
  "leagueVisible.passenger.country.title": "Лига по стране",
  "leagueVisible.passenger.country.text": "Пассажиры и водители сравниваются отдельно по стране, без смешивания рынков и зон.",
  "leagueVisible.passenger.stars.title": "Звёзды после поездки",
  "leagueVisible.passenger.stars.text": "Звёзды и отзывы появляются только после verified ride, без fake rating.",
  "leagueVisible.passenger.fair.title": "Жалобы проверяются",
  "leagueVisible.passenger.fair.text": "Все жалобы, false complaint, отмены и апелляции проходят daily Sabi AI/Admin review.",
  "leagueVisible.passenger.prize.title": "Призы честно",
  "leagueVisible.passenger.prize.text": "Top prize eligibility не выдаётся из UI; reward release требует Admin/legal/finance review.",
  "leagueVisible.driver.country.title": "Страна работы",
  "leagueVisible.driver.country.text": "Водитель участвует только в approved country/zone, которые задаются в Admin.",
  "leagueVisible.driver.orders.title": "Заказы и очки",
  "leagueVisible.driver.orders.text": "Очки идут от verified trips/orders, а не от UI preview или fake assignment.",
  "leagueVisible.driver.quality.title": "Культура и чистота",
  "leagueVisible.driver.quality.text": "Вежливость, чистота, безопасность и звёзды влияют после review-ready событий.",
  "leagueVisible.driver.reward.title": "Призы и payout",
  "leagueVisible.driver.reward.text": "Prize/payout остаются locked до официального решения, compliance и Admin approval.",
  "leagueVisible.audit.verified.title": "Verified ride",
  "leagueVisible.audit.verified.text": "Очки и звёзды появляются только после backend verified trip/order state.",
  "leagueVisible.audit.polite.title": "Культура",
  "leagueVisible.audit.polite.text": "Вежливость, чистота и безопасность видны как safe preview без mutation.",
  "leagueVisible.audit.appeal.title": "Апелляция",
  "leagueVisible.audit.appeal.text": "Спорные очки и жалобы идут через explanation/appeal, не через мгновенную санкцию.",
  "leagueVisible.audit.approval.title": "Admin approval",
  "leagueVisible.audit.approval.text": "Driver/park must be approved in Admin before league/order access becomes real.",
  "leagueVisible.audit.balance.title": "Баланс доступа",
  "leagueVisible.audit.balance.text": "Driver balance gate controls order access; UI не списывает и не пополняет баланс.",
  "leagueVisible.audit.quality.title": "Quality review",
  "leagueVisible.audit.quality.text": "Quality score waits for verified ride, complaint checks and Admin/Sabi AI fairness.",
  "leagueVisible.truth.title": "Нет fake points/prize",
  "leagueVisible.truth.passenger.text": "Mobile не начисляет очки, не выдаёт призы и не меняет рейтинг; он показывает только kernel-safe статус.",
  "leagueVisible.truth.driver.text": "Driver score, prizes, payout and access не меняются из UI; всё ждёт backend/Admin ledger.",
  "leagueVisible.chip.country": "country league",
  "leagueVisible.chip.verified": "verified ride",
  "leagueVisible.chip.noFakePoints": "no fake points",
  "leagueVisible.chip.adminReview": "Admin review",
  "leagueVisible.chip.driver": "driver league",
  "leagueVisible.chip.balance": "balance gate",
  "leagueVisible.chip.adminConfigured": "Admin config",
  "leagueVisible.chip.noPayout": "no payout UI",
  "leagueVisible.footer": "002R добавляет league/rewards visibility preview: страна, очки, звёзды, fairness, призы и eligibility видны честно, но mobile не начисляет points, не выдаёт prize, не делает payout, не меняет рейтинг и не включает runtime.",

  "trustProfile.title": "Профиль доверия и проверка",
  "trustProfile.subtitle.passenger": "Водитель, авто, парк и рейтинг только после Admin-approved state",
  "trustProfile.subtitle.driver": "Документы, авто и passenger trust проходят review без fake approval",
  "trustProfile.status.adminPreview": "Admin preview",
  "trustProfile.status.verifiedPreview": "verified preview",
  "trustProfile.status.readyPreview": "ready preview",
  "trustProfile.status.adminReview": "Admin review",
  "trustProfile.status.adminApprovedOnly": "approved only",
  "trustProfile.status.vehicleReview": "vehicle review",
  "trustProfile.status.parkReview": "park review",
  "trustProfile.status.verifiedRideOnly": "verified ride",
  "trustProfile.status.documents": "documents",
  "trustProfile.status.safeSummary": "safe summary",
  "trustProfile.status.locked": "locked",
  "trustProfile.hero.passenger.label": "Проверенный водитель",
  "trustProfile.hero.passenger.text": "Пассажир видит профиль водителя, авто и таксопарк только как Admin-approved preview без fake assignment.",
  "trustProfile.hero.passenger.delivery.text": "Для доставки курьер, авто/пеший режим и получатель остаются masked preview до approved backend/provider state.",
  "trustProfile.hero.driver.label": "Профиль допуска",
  "trustProfile.hero.driver.ready.text": "Водитель видит trust profile preview после заявки, документов, авто, баланса и Admin rules.",
  "trustProfile.hero.driver.review.text": "Пока Admin не рассмотрел заявку, профиль остаётся pending и не открывает очередь заказов.",
  "trustProfile.hero.driver.ready": "ready",
  "trustProfile.hero.driver.review": "review",
  "trustProfile.hero.unit": "trust",
  "trustProfile.passenger.driver.title": "Водитель",
  "trustProfile.passenger.driver.text": "Имя, рейтинг и статус показываются только после approved match/backend state, не из UI.",
  "trustProfile.passenger.vehicle.title": "Авто",
  "trustProfile.passenger.vehicle.text": "Марка, номер, цвет и класс авто требуют Admin vehicle eligibility и provider readiness.",
  "trustProfile.passenger.park.title": "Таксопарк",
  "trustProfile.passenger.park.text": "Парк или самозанятый статус показывается после Admin review, без fake approved badge.",
  "trustProfile.passenger.rating.title": "Отзывы",
  "trustProfile.passenger.rating.text": "Рейтинг, звёзды и compliments появляются только после verified ride и fairness checks.",
  "trustProfile.driver.identity.title": "Личность",
  "trustProfile.driver.identity.text": "Профиль, страна, роль и контактные данные проверяются Admin/foundation side.",
  "trustProfile.driver.vehicle.title": "Авто и класс",
  "trustProfile.driver.vehicle.text": "Авто, фото, класс тарифа, зона и delivery/intercity eligibility идут через Admin approval.",
  "trustProfile.driver.docs.title": "Документы",
  "trustProfile.driver.docs.text": "Лицензии, права, страховка и safety checks остаются pending до Admin decision.",
  "trustProfile.driver.passenger.title": "Пассажирское доверие",
  "trustProfile.driver.passenger.text": "Водитель видит только safe passenger summary; raw complaints/evidence остаются Admin/foundation.",
  "trustProfile.audit.profile.title": "Профиль",
  "trustProfile.audit.profile.passenger.text": "Профиль водителя публикуется пассажиру только после approved match и safe summary.",
  "trustProfile.audit.profile.driver.text": "Профиль водителя/парка проходит Admin review до доступа к заказам.",
  "trustProfile.audit.car.title": "Авто",
  "trustProfile.audit.car.passenger.text": "Данные авто не фейкуются и не показываются как assigned без dispatch/runtime.",
  "trustProfile.audit.car.driver.text": "Vehicle eligibility определяет тарифы, зоны, airport/intercity/delivery access.",
  "trustProfile.audit.safe.title": "Safety",
  "trustProfile.audit.safe.passenger.text": "Safety badge не заменяет real support, SOS, tracking или Admin review.",
  "trustProfile.audit.safe.driver.text": "Complaint history и passenger trust доступны только как redacted safe status.",
  "trustProfile.truth.title": "Без fake profile/approval",
  "trustProfile.truth.passenger.text": "Mobile не создаёт fake verified driver, fake vehicle, fake park или fake rating; всё ждёт Admin/backend/provider state.",
  "trustProfile.truth.driver.text": "Driver profile, queue access, documents, rating и passenger trust не становятся approved из UI.",
  "trustProfile.chip.driverVerified": "verified driver",
  "trustProfile.chip.vehicleChecked": "vehicle checked",
  "trustProfile.chip.noFakeProfile": "no fake profile",
  "trustProfile.chip.safePassenger": "safe passenger",
  "trustProfile.chip.adminDocs": "Admin docs",
  "trustProfile.chip.vehicleEligibility": "vehicle eligibility",
  "trustProfile.chip.passengerTrust": "passenger trust",
  "trustProfile.chip.noFakeApproval": "no fake approval",
  "trustProfile.footer": "002S добавляет trust profile preview: водитель, пассажир, авто, таксопарк, документы, рейтинг и safety summary видны честно, но mobile не делает fake approved profile, assignment, rating, documents, Wallet, payment, payout или runtime.",



  "rideHistory.title": "История и чек поездки",
  "rideHistory.subtitle.passenger": "Чек, спор, refund status и история только после verified ride",
  "rideHistory.subtitle.driver": "Ledger, settlement и отзывы только после backend/Admin state",
  "rideHistory.status.safeArchive": "safe archive",
  "rideHistory.status.verifiedOnly": "только verified",
  "rideHistory.status.noFakeReceipt": "без fake-чека",
  "rideHistory.status.adminReview": "Admin review",
  "rideHistory.status.noRefundRuntime": "refund locked",
  "rideHistory.status.backendLedger": "backend ledger",
  "rideHistory.status.noPayoutRuntime": "payout locked",
  "rideHistory.status.locked": "locked",
  "rideHistory.hero.passenger.label": "История без fake-чека",
  "rideHistory.hero.passenger.text": "Пассажир видит историю, чек, спор и refund status только после verified ride/backend receipt state.",
  "rideHistory.hero.passenger.delivery.text": "Для доставки чек, proof, спор и refund path остаются preview до backend/Admin/provider readiness.",
  "rideHistory.hero.driver.label": "Driver ledger preview",
  "rideHistory.hero.driver.ready.text": "Водитель видит ledger/settlement preview, но баланс, комиссия, payout и спор идут через backend/Admin.",
  "rideHistory.hero.driver.review.text": "Пока Admin approval, баланс или provider readiness не готовы, история и доход остаются safe preview.",
  "rideHistory.hero.unit": "чек",
  "rideHistory.passenger.history.title": "История",
  "rideHistory.passenger.history.text": "Поездка появится в истории только после verified completion от backend/provider.",
  "rideHistory.passenger.history.delivery.text": "Доставка появится в истории только после verified handoff/proof от backend/provider.",
  "rideHistory.passenger.receipt.title": "Чек",
  "rideHistory.passenger.receipt.text": "Receipt не создаётся из UI; сумма, тариф и комиссия берутся из Admin/backend ledger.",
  "rideHistory.passenger.dispute.title": "Спор",
  "rideHistory.passenger.dispute.text": "Жалоба, отмена, no-show и спор идут в Sabi AI/Admin review с redacted mobile summary.",
  "rideHistory.passenger.refund.title": "Refund status",
  "rideHistory.passenger.refund.text": "Refund не запускается из mobile UI; статус показывается только после payment/backend decision.",
  "rideHistory.driver.ledger.title": "Ledger",
  "rideHistory.driver.ledger.text": "Доход, комиссия Admin % и net preview не мутируют Wallet без backend verified completion.",
  "rideHistory.driver.settlement.title": "Settlement",
  "rideHistory.driver.settlement.text": "Settlement/payout остаются locked до Admin/legal/finance/provider readiness.",
  "rideHistory.driver.review.title": "Отзывы",
  "rideHistory.driver.review.text": "Отзывы и stars появляются только после verified ride и fairness checks.",
  "rideHistory.driver.appeal.title": "Appeal",
  "rideHistory.driver.appeal.text": "Водитель может видеть safe appeal entry; raw evidence остаётся Admin/foundation side.",
  "rideHistory.timeline.verified.title": "Verified ride",
  "rideHistory.timeline.verified.passenger.text": "История открывается только после реального backend verified ride/order state.",
  "rideHistory.timeline.verified.driver.text": "Driver ledger ждёт verified trip/order completion, не UI-кнопку.",
  "rideHistory.timeline.receipt.title": "Receipt",
  "rideHistory.timeline.receipt.passenger.text": "Чек формируется из backend/Admin тарифов, payment state и ledger.",
  "rideHistory.timeline.dispute.title": "Dispute",
  "rideHistory.timeline.dispute.passenger.text": "Спор, refund, жалоба и appeal не меняют деньги/очки без review.",
  "rideHistory.timeline.ledger.title": "Ledger",
  "rideHistory.timeline.ledger.driver.text": "Комиссия и net income берутся из Admin-configured ledger, не из hardcoded mobile.",
  "rideHistory.timeline.settlement.title": "Settlement",
  "rideHistory.timeline.settlement.driver.text": "Payout и reward release требуют Admin/legal/finance/provider approval.",
  "rideHistory.truth.title": "No fake history/payment",
  "rideHistory.truth.passenger.text": "Mobile не создаёт fake receipt, fake refund, fake payment или fake completed trip; всё ждёт backend/Admin state.",
  "rideHistory.truth.driver.text": "Mobile не создаёт fake income, fake payout, fake commission debit или fake settlement; всё ждёт ledger/Admin state.",
  "rideHistory.chip.verified": "verified only",
  "rideHistory.chip.receipt": "backend receipt",
  "rideHistory.chip.noRefundRuntime": "no refund UI",
  "rideHistory.chip.adminReview": "Admin review",
  "rideHistory.chip.backendLedger": "backend ledger",
  "rideHistory.chip.adminCommission": "Admin %",
  "rideHistory.chip.noPayout": "no payout UI",
  "rideHistory.chip.noFakeIncome": "no fake income",
  "rideHistory.footer": "002T добавляет history/receipt center: история, чек, dispute, refund status, ledger и settlement показаны честно, но mobile не завершает поездку, не создаёт чек, не списывает деньги, не делает refund, не платит payout и не мутирует Wallet.",

} as const;
type Keys = keyof typeof RU;


const EN: Record<Keys, string> = { ...RU };

EN["adminPricing.title"] = "Tariffs and connection are Admin-controlled";
EN["adminPricing.subtitle.passenger"] = "Price, tariffs and service rules come from Admin config, not hardcoded UI.";
EN["adminPricing.subtitle.driver"] = "Driver connection request, commission and order access go through Admin review.";
EN["adminPricing.status.adminControlled"] = "Admin controlled";
EN["adminPricing.hero.ride.label"] = "Admin pricing control";
EN["adminPricing.hero.delivery.label"] = "Admin delivery pricing";
EN["adminPricing.hero.passenger.text"] = "Passenger sees honest quote preview, while tariffs are configured and changed in Admin.";
EN["adminPricing.hero.driver.text"] = "Driver/park submits an application; connection and commission are approved in Admin.";
EN["adminPricing.tariffs.title"] = "Tariffs from Admin";
EN["adminPricing.tariffs.passenger.text"] = "Economy, Comfort, Business, Premium, delivery and intercity prices are set in Admin panel.";
EN["adminPricing.tariffs.driver.text"] = "Driver sees tariffs only as approved/Admin-configured preview without local hardcode.";
EN["adminPricing.quote.title"] = "Quote preview";
EN["adminPricing.quote.passenger.text"] = "Mobile shows calculation preview; final price comes from backend/Admin tariff config.";
EN["adminPricing.commission.title"] = "Commission from Admin";
EN["adminPricing.commission.value"] = "Admin %";
EN["adminPricing.commission.passenger.text"] = "Service percentage is not fixed in mobile UI; Admin can change commission policy.";
EN["adminPricing.commission.driver.text"] = "Commission is charged only after verified ride and current Admin-approved rate.";
EN["adminPricing.application.title"] = "Connection application";
EN["adminPricing.application.review"] = "under review";
EN["adminPricing.application.reviewShort"] = "review";
EN["adminPricing.application.approvedPreview"] = "approved preview";
EN["adminPricing.application.passenger.text"] = "Passenger gets a driver only after approved driver/park connection, not fake assignment.";
EN["adminPricing.application.driver.text"] = "Driver/park application goes to Admin for documents, terms and approval review.";
EN["adminPricing.runtime.title"] = "Runtime locked";
EN["adminPricing.runtime.text"] = "Application, tariffs, commission and dispatch are not enabled from UI; backend/Admin runtime is required.";
EN["adminPricing.value.admin"] = "Admin config";
EN["adminPricing.chip.tariffsAdmin"] = "tariffs in Admin";
EN["adminPricing.chip.commissionAdmin"] = "commission in Admin";
EN["adminPricing.chip.applicationReview"] = "application review";
EN["adminPricing.chip.passengerTruth"] = "honest price";
EN["adminPricing.chip.driverConnect"] = "Admin connection";
EN["adminPricing.footer"] = "002I fixes the rule: tariffs and commission rate are set in Admin, and driver/park connection goes through Admin review/approval; mobile shows kernel-safe preview only without fake approval.";



EN["trustPay.title"] = "Payment and trust preview";
EN["trustPay.subtitle.passenger"] = "Honest price and payment methods are shown without fake charge.";
EN["trustPay.subtitle.driver"] = "Settlement, commission and payout stay locked until backend approval.";
EN["trustPay.status.previewOnly"] = "preview only";
EN["trustPay.hero.ride.label"] = "Ride payment readiness";
EN["trustPay.hero.delivery.label"] = "Delivery payment readiness";
EN["trustPay.hero.passenger.text"] = "Passenger sees quote, payment methods and refund path as honest preview without charge.";
EN["trustPay.hero.driver.text"] = "Driver sees settlement, admin-configured commission and payout lock as safe preview without ledger mutation.";
EN["trustPay.method.cash.title"] = "Cash / COD";
EN["trustPay.method.cash.text"] = "The method can be shown only as an option; UI does not confirm paid status.";
EN["trustPay.method.card.title"] = "Card / provider";
EN["trustPay.method.card.text"] = "Card charge requires backend/payment provider and is not executed from mobile UI.";
EN["trustPay.method.wallet.title"] = "Sabi Wallet";
EN["trustPay.method.wallet.text"] = "Wallet debit/top-up is locked; this screen only explains future payment readiness.";
EN["trustPay.method.refund.title"] = "Refund / dispute";
EN["trustPay.method.refund.text"] = "Refund, dispute and correction go through Admin/foundation review, not a UI fake result.";
EN["trustPay.driver.settlement.title"] = "Settlement lock";
EN["trustPay.driver.settlement.text"] = "Driver settlement starts only after verified completion and backend ledger approval.";
EN["trustPay.driver.commission.title"] = "admin-configured commission";
EN["trustPay.driver.commission.value"] = "Admin % locked";
EN["trustPay.driver.commission.text"] = "Commission is preview only until verified trip and ledger debit are approved.";
EN["trustPay.driver.balance.title"] = "Driver balance gate";
EN["trustPay.driver.balance.ready"] = "ready preview";
EN["trustPay.driver.balance.locked"] = "balance locked";
EN["trustPay.driver.balance.text"] = "Low balance blocks order access; mobile does not create fake top-up or debit.";
EN["trustPay.driver.payout.title"] = "Payout lock";
EN["trustPay.driver.payout.text"] = "Payout requires driver settlement, Admin/legal/payment approval and provider runtime.";
EN["trustPay.method.locked"] = "locked";
EN["trustPay.method.providerLocked"] = "provider locked";
EN["trustPay.method.walletLocked"] = "Wallet locked";
EN["trustPay.method.adminReview"] = "Admin review";
EN["trustPay.confidence.quote"] = "quote";
EN["trustPay.confidence.provider"] = "provider";
EN["trustPay.confidence.receipt"] = "receipt";
EN["trustPay.receipt.preview"] = "preview";
EN["trustPay.chip.noCharge"] = "no charge";
EN["trustPay.chip.noRefund"] = "no refund";
EN["trustPay.chip.noPayout"] = "no payout";
EN["trustPay.chip.passengerTruth"] = "passenger truth";
EN["trustPay.chip.driverLedger"] = "driver ledger locked";
EN["trustPay.footer"] = "002H adds payment-readiness trust UI, but does not enable charge, refund, Wallet debit, top-up, payout, provider, DB, backend/Admin runtime or fake success.";

EN["earnings.title"] = "Balance and order access";
EN["earnings.subtitle.driver"] = "Order queue opens only when driver balance is sufficient.";
EN["earnings.subtitle.passenger"] = "Passenger sees honest price and driver access rules without fake assignment.";
EN["earnings.status.accessReady"] = "access preview";
EN["earnings.status.topUpRequired"] = "balance needed";
EN["earnings.driver.balance.title"] = "Driver balance";
EN["earnings.driver.balance.ready"] = "Balance is enough for the order pool after backend approval.";
EN["earnings.driver.balance.locked"] = "With low balance, the driver cannot receive or accept orders.";
EN["earnings.driver.queue.title"] = "Order queue";
EN["earnings.driver.queue.text"] = "Order pool stays locked until real dispatch/runtime approval.";
EN["earnings.driver.commission.title"] = "admin-configured commission";
EN["earnings.driver.commission.text"] = "Commission is charged only after verified completed ride through backend ledger.";
EN["earnings.driver.net.title"] = "Net preview";
EN["earnings.driver.net.text"] = "Before Wallet/payout approval this is only a calculation preview, not income or payout.";
EN["earnings.passenger.price.title"] = "Honest price";
EN["earnings.passenger.price.text"] = "Price is shown as quote preview without fake payment or auto debit.";
EN["earnings.passenger.access.title"] = "Driver access";
EN["earnings.passenger.access.value"] = "balance gate";
EN["earnings.passenger.access.text"] = "Only drivers with approved access and enough balance can see orders.";
EN["earnings.passenger.commission.title"] = "Service commission";
EN["earnings.passenger.commission.text"] = "Admin % applies to the driver after verified completion, not as fake debit.";
EN["earnings.passenger.reward.title"] = "Reward fairness";
EN["earnings.passenger.reward.text"] = "Prizes, points and eligibility publish only after Admin/Sabi AI review.";
EN["earnings.queue.preview"] = "queue preview";
EN["earnings.queue.locked"] = "locked";
EN["earnings.reward.preview"] = "review only";
EN["earnings.hero.driver.label"] = "Driver access control";
EN["earnings.hero.driver.text"] = "Balance, order queue, commission and net preview are shown honestly without Wallet mutation or fake payout.";
EN["earnings.hero.passenger.label"] = "Passenger trust view";
EN["earnings.hero.passenger.text"] = "Passenger understands price, driver access, commission and no-fake rules before real runtime.";
EN["earnings.access.minimum"] = "minimum";
EN["earnings.access.service"] = "service";
EN["earnings.access.runtime"] = "runtime";
EN["earnings.chip.balanceGate"] = "balance gate";
EN["earnings.chip.orderPoolLocked"] = "order pool locked";
EN["earnings.chip.noWalletMutation"] = "no Wallet mutation";
EN["earnings.chip.driverPreview"] = "driver preview";
EN["earnings.chip.passengerTrust"] = "passenger trust";
EN["earnings.footer"] = "002G improves driver earnings/access UI, but does not enable Wallet debit, top-up, payout, payment, provider dispatch, order pool runtime, DB write or fake-success.";

EN["kernel.bound.title"] = "Taxi Kernel: all connections through core";
EN["kernel.bound.facade.title"] = "Kernel facade only";
EN["kernel.bound.facade.text"] = "Mobile UI never calls provider, backend runtime, Wallet, payment or dispatch directly; every action goes through Taxi kernel facade.";
EN["kernel.bound.events.title"] = "Events/state instead of direct runtime";
EN["kernel.bound.events.text"] = "UI reads only kernel-safe state and events: open, close, quote preview, report status, appeal status and readiness.";
EN["kernel.bound.noDirect.title"] = "No direct provider/backend import";
EN["kernel.bound.noDirect.text"] = "Map, geo, dispatch, payment, payout, AI report and Admin decisions are not connected directly from mobile layer.";
EN["kernel.bound.close.title"] = "Clean Taxi close";
EN["kernel.bound.close.text"] = "Closing Taxi stops search preview, route layers and UI session; background work is allowed only for a real approved active trip.";
EN["kernel.status.facade"] = "Kernel facade only";
EN["kernel.status.events"] = "Kernel events/state";
EN["kernel.status.noDirect"] = "No direct imports";
EN["kernel.status.safeSummary"] = "Safe summary only";
EN["kernel.status.foundationReady"] = "Foundation 100% contract";
EN["kernel.status.adminReady"] = "Admin 100% contract";
EN["kernel.status.mobileNext"] = "Mobile UI/UX next";
EN["kernel.status.sharedContracts"] = "Shared kernel contracts";
EN["kernel.report.title"] = "Admin/Sabi AI daily report summary";
EN["kernel.report.ai.title"] = "AI daily review";
EN["kernel.report.ai.text"] = "Sabi AI must check all complaints every day by country/day, while mobile sees only status and not raw evidence.";
EN["kernel.report.complaints.title"] = "All complaints checked";
EN["kernel.report.complaints.text"] = "Driver and rider complaints, false reports, cancellations and trips after cancellation go through Admin-compatible foundation.";
EN["kernel.report.admin.title"] = "Admin locked decision";
EN["kernel.report.admin.text"] = "Hard block, prize freeze/release, points change and restoration publish to mobile only after Admin locked decision.";
EN["kernel.report.mobile.title"] = "Safe UI result";
EN["kernel.report.mobile.text"] = "Raw evidence stays in foundation/Admin; mobile shows only calm status, next step and honest explanation without public humiliation.";
EN["kernel.completion.title"] = "Foundation + Admin prepared";
EN["kernel.completion.foundation.title"] = "Foundation contract ready";
EN["kernel.completion.foundation.text"] = "Taxi foundation includes daily AI report, complaint review, approval gates, schema plan, route locks and no-fake boundaries.";
EN["kernel.completion.admin.title"] = "Admin contract ready";
EN["kernel.completion.admin.text"] = "Admin sections, dashboard filters, action inbox, approval gates and report completeness are already compatible with foundation.";
EN["kernel.completion.runtime.title"] = "Runtime still locked";
EN["kernel.completion.runtime.text"] = "Routes, scheduler, DB, Wallet, provider, payment, payout and reward release are not enabled from mobile UI and require exact approval.";
EN["kernel.completion.mobile.title"] = "Now improve UI/UX";
EN["kernel.completion.mobile.text"] = "After foundation/Admin readiness, the next layer is premium mobile UX: clearer, faster, cleaner, but strictly through kernel.";
EN["kernel.ux.title"] = "Premium UI/UX through kernel";
EN["kernel.ux.cockpit.title"] = "One clean cockpit";
EN["kernel.ux.cockpit.text"] = "Passenger and driver see key statuses together: route, fare, safety, report status, appeal and no-fake locks.";
EN["kernel.ux.sameContracts.title"] = "Same contracts for rider/driver";
EN["kernel.ux.sameContracts.text"] = "Leagues, complaints, stars, points, cooldown and recovery use the same kernel-safe contracts for both sides.";
EN["kernel.ux.noBackground.title"] = "No useless background";
EN["kernel.ux.noBackground.text"] = "Taxi must not stay alive in background after close; live location/navigation starts only for a real approved active trip.";
EN["kernel.ux.noFake.title"] = "No fake success";
EN["kernel.ux.noFake.text"] = "UI does not show fake driver found, fake payment, fake completed, fake sanction, fake reward, fake debit or fake payout.";
EN["smart.title"] = "Smart Taxi panel";
EN["smart.subtitle"] = "Fast actions and states without direct provider/backend runtime";
EN["smart.route.title"] = "Route";
EN["smart.route.status"] = "route preview only";
EN["smart.delivery.status"] = "delivery preview only";
EN["smart.price.title"] = "Price";
EN["smart.price.status"] = "no fake payment";
EN["smart.safety.title"] = "Safety";
EN["smart.safety.text"] = "SOS, report status and appeal are shown only as kernel-safe UI state.";
EN["smart.driver.balance.title"] = "Balance";
EN["smart.driver.ready"] = "available after backend approval";
EN["smart.driver.locked"] = "balance too low";
EN["smart.driver.commission.title"] = "admin-configured commission";
EN["smart.driver.commission.status"] = "preview without debit";
EN["smart.driver.orders.title"] = "Orders";
EN["smart.driver.orders.text"] = "order pool locked until runtime approval";
EN["smart.safeKernel.text"] = "002A keeps the rule: UI improves convenience, but never calls dispatch, geo, payment, payout, Wallet or Admin evidence directly.";

EN["clarity.title"] = "Clear ride flow";
EN["clarity.subtitle"] = "Timeline, trust chips and next step without direct runtime";
EN["clarity.timeline.pickup.title"] = "Pickup";
EN["clarity.timeline.pickup.text"] = "Pickup point and route are shown as preview without fake GPS.";
EN["clarity.timeline.quote.title"] = "Quote";
EN["clarity.timeline.quote.text"] = "Quote is visible before action, but payment success is never simulated.";
EN["clarity.timeline.match.title"] = "Match";
EN["clarity.timeline.match.text"] = "Driver matching stays locked until backend/provider approval.";
EN["clarity.timeline.live.title"] = "Live trip";
EN["clarity.timeline.live.text"] = "Live navigation starts only for a real approved active trip.";
EN["clarity.timeline.balance.title"] = "Balance";
EN["clarity.timeline.balance.ready"] = "Balance looks ready, but dispatch still requires runtime approval.";
EN["clarity.timeline.balance.locked"] = "Without balance, the driver cannot see or accept orders.";
EN["clarity.timeline.pool.title"] = "Order pool";
EN["clarity.timeline.pool.text"] = "Order pool preview is not connected to real dispatch.";
EN["clarity.timeline.navigate.title"] = "Navigation";
EN["clarity.timeline.navigate.text"] = "Route layers remain UI preview until a real trip.";
EN["clarity.timeline.settle.title"] = "Settlement";
EN["clarity.timeline.settle.text"] = "admin-configured commission and payout require backend ledger approval.";
EN["clarity.trust.kernel"] = "kernel-only";
EN["clarity.trust.safeSummary"] = "safe summary";
EN["clarity.trust.noFake"] = "no fake";
EN["clarity.trust.passenger"] = "passenger clarity";
EN["clarity.trust.driver"] = "driver clarity";
EN["clarity.next.passenger.title"] = "Passenger next step";
EN["clarity.next.passenger.text"] = "Choose route, tariff and safety options; real ordering appears only after backend/provider readiness.";
EN["clarity.next.driver.title"] = "Driver next step";
EN["clarity.next.driver.text"] = "Keep balance, documents and rating ready; real orders appear only after dispatch approval.";
EN["clarity.footer"] = "002B adds ride clarity but does not enable provider/backend runtime, Wallet, payment, payout, DB or fake success.";
EN["composer.title"] = "Premium order composer";
EN["composer.subtitle"] = "Comfort, tariff and safety options as kernel-safe UI only";
EN["composer.passenger.mode"] = "passenger";
EN["composer.driver.mode"] = "driver";
EN["composer.tariff.title"] = "Tariff and comfort level";
EN["composer.preferences.title"] = "Ride preferences";
EN["composer.safety.title"] = "Safety-first order";
EN["composer.safety.text"] = "Preferences, SOS and trust hints stay as UI state; real ordering requires backend/provider readiness.";
EN["composer.driver.balance.title"] = "Balance and access";
EN["composer.driver.balance.ready"] = "preview ready";
EN["composer.driver.balance.locked"] = "top-up needed";
EN["composer.driver.radius.title"] = "Order radius";
EN["composer.driver.radius.text"] = "Radius and order queue remain preview until dispatch runtime approval.";
EN["composer.driver.orders.title"] = "Order pool";
EN["composer.driver.orders.text"] = "Driver sees only safe preview, not real dispatch and not fake order.";
EN["composer.driver.noFake.title"] = "No fake income";
EN["composer.driver.noFake.text"] = "Commission, debit and payout are never shown as completed without backend ledger.";
EN["composer.footer"] = "002C improves order composer and comfort preferences, but does not enable geo, dispatch, Wallet, payment, payout, DB or provider runtime.";
EN["routeLive.title"] = "Route and live preview";
EN["routeLive.subtitle"] = "ETA, route confidence and pickup/dropoff without fake GPS";
EN["routeLive.state.preview"] = "preview";
EN["routeLive.state.search"] = "search locked";
EN["routeLive.state.live"] = "live only for real trip";
EN["routeLive.driver.ready"] = "access preview";
EN["routeLive.driver.locked"] = "balance locked";
EN["routeLive.metric.eta"] = "ETA";
EN["routeLive.metric.distance"] = "distance";
EN["routeLive.metric.fare"] = "fare";
EN["routeLive.pickup.title"] = "Pickup";
EN["routeLive.pickup.text"] = "Pickup point stays as kernel-safe preview until an approved active trip.";
EN["routeLive.pickup.delivery"] = "pickup point";
EN["routeLive.dropoff.title"] = "Dropoff";
EN["routeLive.dropoff.text"] = "Dropoff and route are visible early, but navigation runtime is not enabled.";
EN["routeLive.dropoff.delivery"] = "recipient";
EN["routeLive.confidence.title"] = "Confidence";
EN["routeLive.confidence.value"] = "honest preview";
EN["routeLive.confidence.text"] = "ETA/fare never promise fake driver, fake GPS or fake payment.";
EN["routeLive.driver.access.title"] = "Driver access";
EN["routeLive.driver.access.ready"] = "Balance preview is enough, but real dispatch requires backend approval.";
EN["routeLive.driver.access.locked"] = "With low balance, the driver must not receive orders.";
EN["routeLive.driver.pickup.title"] = "Next pickup";
EN["routeLive.driver.pickup.value"] = "safe preview";
EN["routeLive.driver.pickup.text"] = "Pickup card is not a real assigned order.";
EN["routeLive.driver.commission.title"] = "Commission";
EN["routeLive.driver.commission.text"] = "admin-configured commission is preview only without ledger debit.";
EN["routeLive.chip.kernel"] = "kernel-only";
EN["routeLive.chip.preview"] = "route preview";
EN["routeLive.chip.locked"] = "runtime locked";
EN["routeLive.chip.live"] = "real trip only";
EN["routeLive.chip.driver"] = "driver clarity";
EN["routeLive.chip.passenger"] = "passenger clarity";
EN["routeLive.footer"] = "002D improves route and live preview, but does not enable real location, dispatch, Wallet, payment, payout, DB, provider runtime or fake-success.";
EN["safetySupport.title"] = "Safety / Support cockpit";
EN["safetySupport.subtitle"] = "SOS, trusted contact, sharing and appeal without direct runtime";
EN["safetySupport.status.preview"] = "safe preview";
EN["safetySupport.status.liveLocked"] = "live locked";
EN["safetySupport.hero.trip"] = "trip";
EN["safetySupport.hero.mode"] = "mode";
EN["safetySupport.hero.passenger.text"] = "Passenger sees calm safety status without raw evidence or public sanctions.";
EN["safetySupport.hero.driver.text"] = "Driver sees only safe status, no fake complaint penalty and no fake reward.";
EN["safetySupport.hero.delivery.text"] = "Delivery uses proof/status preview; real handoff needs backend/provider approval.";
EN["safetySupport.hero.ride.text"] = "Taxi shows trip safety preview; live tools start only for an approved active trip.";
EN["safetySupport.sos.title"] = "SOS and help";
EN["safetySupport.sos.passenger.text"] = "SOS button and emergency flow are UI-ready, but incident submit is never faked.";
EN["safetySupport.sos.driver.text"] = "Driver safety help goes only through kernel-safe flow and Admin review.";
EN["safetySupport.share.title"] = "Share trip";
EN["safetySupport.share.passenger.text"] = "Trip sharing stays preview-only until a real active trip.";
EN["safetySupport.share.delivery.text"] = "Delivery sharing shows safe order status without raw location stream.";
EN["safetySupport.contact.title"] = "Trusted contact";
EN["safetySupport.contact.passenger.text"] = "Trusted contact receives only safe summary, not personal evidence details.";
EN["safetySupport.appeal.title"] = "Complaint / appeal";
EN["safetySupport.appeal.passenger.text"] = "Complaints, appeal and explanations go through foundation/Admin; mobile shows status only.";
EN["safetySupport.issue.title"] = "Trip issue";
EN["safetySupport.issue.driver.text"] = "Driver sees a clear complaint path, but final decision requires AI/Admin review.";
EN["safetySupport.fairness.title"] = "Fairness without fake";
EN["safetySupport.fairness.driver.text"] = "No fake sanction, fake points removal, fake block, fake restore or fake payout.";
EN["safetySupport.support.title"] = "Sabi support";
EN["safetySupport.support.driver.text"] = "Support inbox remains safe preview until an approved backend route.";
EN["safetySupport.chip.kernel"] = "kernel-only";
EN["safetySupport.chip.noRawEvidence"] = "no raw evidence";
EN["safetySupport.chip.adminReview"] = "Admin review";
EN["safetySupport.chip.realTripOnly"] = "real trip only";
EN["safetySupport.chip.previewOnly"] = "preview only";
EN["safetySupport.footer"] = "002E adds safety/support UI but does not enable SOS runtime, live location, dispatch, Wallet, payment, payout, DB, provider or fake-success.";
EN["brand.passengerSubtitle"] = "Premium order: map, route, tariffs and safety";
EN["brand.driverSubtitle"] = "Driver cockpit: balance, orders, navigation and commission";
EN["runtime.locked"] = "No fake success: order, driver, payment, completion, location and debit are not confirmed without backend/provider.";
EN["driver.balance.rule"] = "If the driver balance has no money, the driver cannot receive orders. After trip completion, backend will automatically charge Admin % of the order price.";
EN["button.topUp"] = "Top up balance";
EN["gate.driver.balance"] = "Insufficient driver balance: orders and accepts are locked.";
EN["tariff.economy.title"] = "Economy";
EN["tariff.comfort.title"] = "Comfort";
EN["tariff.business.title"] = "Business";
EN["tariff.premium.title"] = "Premium";
EN["tariff.intercity.title"] = "Intercity";
EN["delivery.delivery.title"] = "Delivery";
EN["search.title"] = "Driver search";
EN["live.title"] = "Live trip screen";
EN["premium.promise.title"] = "Premium without junk";
EN["premium.promise.text"] = "Fast ordering, clean navigation, honest locked states and zero fake success.";
EN["commission.settlement.title"] = "Admin % calculation without fake debit";
EN["driver.balance.low"] = "low balance";
EN["driver.balance.ready"] = "enough";
EN["driver.balance.high"] = "premium";

EN["quick.homeAirport.title"] = "Home → airport";
EN["quick.homeAirport.subtitle"] = "Fast scenario without starting a real order";
EN["quick.intercity.title"] = "Premium intercity";
EN["quick.courier.title"] = "Courier in 2 taps";
EN["quick.family.title"] = "Family / safety";
EN["check.location.title"] = "Location stays honest";
EN["check.payment.title"] = "No UI payment success";
EN["check.matching.title"] = "No fake matching";
EN["check.completion.title"] = "No fake completion";
EN["ledger.commission.title"] = "admin-configured commission";
EN["ledger.net.title"] = "Driver net";
EN["route.advisor.title"] = "Premium route intelligence";
EN["route.smartPickup.title"] = "Smart pickup";
EN["route.trafficRadar.title"] = "Traffic + radar";
EN["route.intercityNight.title"] = "Intercity night safety";
EN["route.noBackground.title"] = "No always-on background";
EN["driver.ready.balance.title"] = "Balance required";
EN["driver.ready.documents.title"] = "Docs + Admin";
EN["driver.ready.dispatch.title"] = "Dispatch provider";
EN["driver.ready.exact.title"] = "Exact approval";

EN["control.deck.title"] = "Premium control deck";
EN["control.oneScreen.title"] = "One-screen order";
EN["control.routeConfidence.title"] = "No fake route";
EN["control.fareLock.title"] = "Fare without debit";
EN["control.privacy.title"] = "Clean runtime";
EN["courier.chain.title"] = "Courier proof chain";
EN["courier.chain.pickup.title"] = "Pickup proof";
EN["courier.chain.route.title"] = "Courier route";
EN["courier.chain.handoff.title"] = "Handoff";
EN["driver.policy.title"] = "Driver balance rules";
EN["driver.policy.reserve.title"] = "Order reserve";
EN["driver.policy.autodebit.title"] = "Admin % auto-debit";
EN["driver.policy.noPayout.title"] = "No fake payout";
EN["driver.policy.reserveMetric"] = "reserve";
EN["driver.policy.shortageMetric"] = "shortage";
EN["assurance.deck.title"] = "Sabi premium scenarios";
EN["assurance.airport.title"] = "Airport without friction";
EN["assurance.family.title"] = "Family control";
EN["assurance.business.title"] = "Business rides";
EN["assurance.intercity.title"] = "Intercity planner";
EN["driver.money.title"] = "Driver money guard";
EN["driver.money.balance.title"] = "Balance before order";
EN["driver.money.commission.title"] = "Admin % after completion";
EN["driver.money.reserve.title"] = "Commission reserve";
EN["driver.money.payout.title"] = "Payout locked";

EN["dispatch.deck.title"] = "Transparent dispatch preview";
EN["dispatch.quote.title"] = "Clear fare before request";
EN["dispatch.driver.title"] = "No fake driver assignment";
EN["dispatch.route.title"] = "Route with reasons";
EN["dispatch.cancel.title"] = "Honest cancel/dispute";
EN["nav.clean.title"] = "Clean navigation";
EN["nav.clean.layers.title"] = "Layers without noise";
EN["nav.clean.speed.title"] = "Movement speed";
EN["nav.clean.background.title"] = "No background hanging";
EN["driver.settlement.title"] = "Settlement guard";
EN["driver.settlement.before.title"] = "Before going online";
EN["driver.settlement.after.title"] = "After trip";
EN["driver.settlement.dispute.title"] = "Dispute / cancel";
EN["driver.settlement.ledger.title"] = "Ledger without fake payout";
EN["driver.settlement.locked"] = "settlement locked";
EN["handoff.title"] = "Honest order chain";
EN["handoff.request.title"] = "Request preparation";
EN["handoff.dispatch.title"] = "No fake dispatch";
EN["handoff.route.title"] = "Navigation preview";
EN["handoff.close.title"] = "Trip closing";
EN["handoff.deliveryPickup.title"] = "Delivery pickup";
EN["handoff.deliveryRoute.title"] = "Courier route";
EN["handoff.deliveryProof.title"] = "Proof of handoff";
EN["handoff.deliverySettle.title"] = "Delivery settlement";
EN["driver.timeline.title"] = "Driver money timeline";
EN["driver.timeline.balance.title"] = "Balance before order";
EN["driver.timeline.commission.title"] = "Future commission";
EN["driver.timeline.net.title"] = "Future net";
EN["driver.timeline.locked"] = "No fake debit, fake top-up or fake payout: UI calculation only until exact approval.";

EN["lifecycle.open.title"] = "Open Taxi without background start";
EN["lifecycle.active.title"] = "Active trip only after approval";
EN["lifecycle.close.title"] = "Closing Taxi cleans runtime";
EN["lifecycle.recover.title"] = "Return without fake resume";
EN["lifecycle.status.uiOnly"] = "UI only";
EN["lifecycle.status.runtimeLocked"] = "runtime locked";
EN["lifecycle.status.shutdown"] = "clean shutdown";
EN["lifecycle.status.noFakeResume"] = "no fake resume";
EN["nav.clean.permissions.title"] = "Honest permissions";
EN["nav.clean.close.title"] = "Taxi closed means background closed";
EN["driver.access.noBalance.title"] = "No balance, no orders";
EN["driver.access.topup.title"] = "No fake top-up success";
EN["driver.access.commission.title"] = "Admin % debits only for real trips";

EN["polish.passenger.title"] = "Premium UX without clutter";
EN["polish.passenger.pickup.title"] = "Clearer pickup";
EN["polish.passenger.fare.title"] = "Transparent fare";
EN["polish.passenger.intercity.title"] = "Premium intercity";
EN["polish.passenger.safety.title"] = "Safety nearby";
EN["lifecycle.guard.title"] = "Lifecycle without background clutter";
EN["driver.revenue.title"] = "Driver revenue integrity";
EN["courier.premium.title"] = "Premium courier flow";

EN["summary.ready.title"] = "Ride summary without fake completion";
EN["summary.ready.noCompletion.title"] = "No fake completion";
EN["summary.ready.rating.title"] = "Rating after backend state";
EN["summary.ready.tips.title"] = "Tips without fake payment";
EN["summary.ready.receipt.title"] = "Receipt and dispute locked";
EN["trust.safety.title"] = "Safety trust center";
EN["trust.safety.sos.title"] = "SOS without fake incident";
EN["trust.safety.share.title"] = "Route sharing";
EN["trust.safety.mask.title"] = "Masked chat and calls";
EN["trust.safety.incident.title"] = "Honest complaint/dispute";
EN["intercity.control.title"] = "Intercity control center";
EN["intercity.control.stops.title"] = "Stops and baggage";
EN["intercity.control.rest.title"] = "Driver rest";
EN["intercity.control.speed.title"] = "Speed, radars, cameras";
EN["intercity.control.price.title"] = "Intercity price without debit";
EN["driver.enforce.title"] = "Driver access enforcement";
EN["driver.enforce.feed.title"] = "No balance, no order feed";
EN["driver.enforce.reserve.title"] = "Reserve before offer";
EN["driver.enforce.debit.title"] = "Debit only after completed";
EN["driver.enforce.payout.title"] = "Payout only after ledger";

EN["final.ready.title"] = "Final Taxi readiness: premium UI-only";
EN["final.ready.rider.title"] = "Order without extra screens";
EN["final.ready.background.title"] = "No always-on background import";
EN["final.ready.provider.title"] = "Provider-ready contract";
EN["final.ready.noFake.title"] = "No fake success";
EN["flow.oneTap.title"] = "One-tap premium order flow";
EN["flow.oneTap.ab.title"] = "A/B without chaos";
EN["flow.oneTap.tariff.title"] = "Fare and tariff nearby";
EN["flow.oneTap.safety.title"] = "Safety before order";
EN["flow.oneTap.close.title"] = "Clean close";
EN["boundary.runtime.title"] = "Provider/runtime boundary";
EN["boundary.runtime.location.title"] = "Location only when needed";
EN["boundary.runtime.dispatch.title"] = "Backend-only dispatch";
EN["boundary.runtime.payment.title"] = "Payment locked";
EN["boundary.runtime.settlement.title"] = "Settlement after trip state";
EN["driver.topup.title"] = "Driver top-up readiness";
EN["driver.topup.entry.title"] = "Top-up as locked flow";
EN["driver.topup.provider.title"] = "Provider and exact approval";
EN["driver.topup.noSuccess.title"] = "No fake top-up";
EN["driver.topup.dispatch.title"] = "Order access after balance";

EN["session.exit.title"] = "Session lifecycle contract";
EN["session.exit.open.title"] = "Opening Taxi is UI-only";
EN["session.exit.open.text"] = "Entering Taxi does not start location, sockets, dispatch, payment, or settlement runtime.";
EN["session.exit.active.title"] = "Background only for active trip";
EN["session.exit.active.text"] = "Live location, speed, radars, and navigation are allowed only for a real active trip after backend/provider approval.";
EN["session.exit.close.title"] = "Closing Taxi stops everything";
EN["session.exit.close.text"] = "The UI contract requires search, geo, route preview, dispatch polling, and navigation layers to stop when Taxi closes.";
EN["session.exit.resume.title"] = "Resume only from backend state";
EN["session.exit.resume.text"] = "Reopening Taxi must not show driver found, payment, or completion without verified backend session state.";
EN["payment.truth.title"] = "Payment truth center";
EN["payment.truth.preview.title"] = "Price is preview only";
EN["payment.truth.preview.text"] = "Quote shows the fare structure but creates no payment, hold, receipt, commission, or debit.";
EN["payment.truth.hold.title"] = "Hold locked until provider";
EN["payment.truth.hold.text"] = "Hold, promo, refund, dispute, and service fee stay locked until Wallet/payment provider runtime.";
EN["payment.truth.tips.title"] = "Tips after trip state";
EN["payment.truth.tips.text"] = "Tips become available only after real backend trip completed and cannot be fake-success.";
EN["payment.truth.receipt.title"] = "Receipt from ledger";
EN["payment.truth.receipt.text"] = "Receipt, commission, and driver net must come from backend ledger, not UI state.";
EN["driver.liquidity.title"] = "Driver liquidity contract";
EN["driver.liquidity.minimum.title"] = "Minimum balance before line";
EN["driver.liquidity.minimum.text"] = "The driver cannot enter the order line when balance is below the minimum reserve.";
EN["driver.liquidity.reserve.title"] = "Reserve covers Admin %";
EN["driver.liquidity.reserve.text"] = "Before an offer, balance must cover the future admin-configured commission for that order.";
EN["driver.liquidity.feed.title"] = "No money, no dispatch feed";
EN["driver.liquidity.feed.text"] = "With insufficient balance, the driver sees no feed, receives no offer, and cannot accept orders.";
EN["driver.liquidity.topup.title"] = "Top-up locked";
EN["driver.liquidity.topup.text"] = "Balance top-up remains a future Wallet/provider flow with no fake top-up success.";
EN["driver.liquidity.commission.title"] = "Admin % after completed";
EN["driver.liquidity.commission.text"] = "Automatic commission debit runs only after real backend trip completed.";

EN["league.driver.title"] = "Driver league by country";
EN["league.passenger.title"] = "Passenger league by country";
EN["league.prizes.title"] = "Top-3 prizes";
EN["league.fair.title"] = "Fair play, no gambling";
EN["league.status.country"] = "separate per country";
EN["league.status.points"] = "points after verified trip";
EN["league.status.stars"] = "stars from the other side";
EN["league.status.quality"] = "quality and politeness";
EN["league.status.prizeLocked"] = "prize locked until Admin/backend verification";
EN["league.driver.country.title"] = "Separate country board";
EN["league.driver.country.text"] = "Each country has its own leaderboard so drivers compete inside their market.";
EN["league.driver.orders.title"] = "More verified orders";
EN["league.driver.orders.text"] = "Driver points come mainly from real completed trips, not UI preview or fake completion.";
EN["league.driver.culture.title"] = "Politeness and stars";
EN["league.driver.culture.text"] = "Passengers rate respect, calm driving, luggage help and clean communication.";
EN["league.driver.clean.title"] = "Clean car";
EN["league.driver.clean.text"] = "Clean interior, smell, seatbelts, careful pickup and car condition add quality points.";
EN["league.driver.prizes.title"] = "Top-3 drivers";
EN["league.driver.prizes.text"] = "1st, 2nd and 3rd place win country prizes only after trip, rating, complaint and antifraud checks.";
EN["league.passenger.country.title"] = "Passenger country league";
EN["league.passenger.country.text"] = "Passengers compete per country by activity, trip culture and honest driver stars.";
EN["league.passenger.trips.title"] = "More real rides";
EN["league.passenger.trips.text"] = "Passenger points are awarded for verified rides across city, intercity, business, airport and delivery flows.";
EN["league.passenger.stars.title"] = "Driver stars for passenger";
EN["league.passenger.stars.text"] = "After the ride, the driver rates the passenger for punctuality, politeness, cleanliness, care and safety.";
EN["league.passenger.culture.title"] = "Communication culture";
EN["league.passenger.culture.text"] = "The system motivates polite passenger behavior; abuse, threats, dirt and disputes reduce league score after review.";
EN["league.passenger.prizes.title"] = "Top-3 passengers";
EN["league.passenger.prizes.text"] = "The most active and respectful passengers can win country prizes, but reward payout stays locked until backend/Admin rules.";
EN["league.prize.first.title"] = "1st place";
EN["league.prize.first.text"] = "Main country prize: premium reward, promo or bonus only after Admin approval and legal/payment review.";
EN["league.prize.second.title"] = "2nd place";
EN["league.prize.second.text"] = "Second country prize: reward preview with no fake payout and no automatic UI credit.";
EN["league.prize.third.title"] = "3rd place";
EN["league.prize.third.text"] = "Third country prize after antifraud, complaint review and verified leaderboard snapshot.";
EN["league.fair.noGambling.title"] = "Not casino or betting";
EN["league.fair.noGambling.text"] = "This is a quality motivation league: users do not place bets, buy chances or receive fake money success.";
EN["league.fair.verified.title"] = "Verified trips only";
EN["league.fair.verified.text"] = "Orders, stars, tips, complaints and completion must come from backend state, not local UI.";
EN["league.fair.abuse.title"] = "Antifraud and complaints";
EN["league.fair.abuse.text"] = "Rating abuse, arranged trips, rude behavior, unsafe driving and dirty cars must lower score after review.";
EN["league.fair.admin.title"] = "Prizes through Admin";
EN["league.fair.admin.text"] = "Prize size, countries, season, taxes, rules and payout activate only through Admin/foundation exact approval.";

EN["league.score.title"] = "Honest points scoring";
EN["league.mutual.title"] = "Mutual stars after ride";
EN["league.governance.title"] = "Country prize governance";
EN["league.status.verifiedOnly"] = "verified trips only";
EN["league.status.twoWayStars"] = "two-way stars";
EN["league.status.countrySeason"] = "country season";
EN["league.status.driverToPassenger"] = "driver → passenger";
EN["league.status.passengerToDriver"] = "passenger → driver";
EN["league.status.adminLocked"] = "Admin rules locked";
EN["league.score.orders.title"] = "Orders matter, not alone";
EN["league.score.orders.text"] = "More verified orders form the base score, but abuse, cancellations and disputed rides must be filtered by backend/Admin.";
EN["league.score.driverStars.title"] = "Stars for the driver";
EN["league.score.driverStars.text"] = "Passengers rate politeness, car cleanliness, calm driving, safety and help.";
EN["league.score.passengerStars.title"] = "Stars for the passenger";
EN["league.score.passengerStars.text"] = "Drivers rate punctuality, respect, cleanliness, careful behavior and no rude conduct.";
EN["league.score.countrySeason.title"] = "Separate country season";
EN["league.score.countrySeason.text"] = "Each country has its own season and leaderboard, so markets do not mix and prizes stay fair.";
EN["league.mutual.driverRates.title"] = "Driver rates passenger";
EN["league.mutual.driverRates.text"] = "After a verified ride, the driver can rate whether the passenger came on time, behaved respectfully, kept clean and followed safety.";
EN["league.mutual.passengerRates.title"] = "Passenger rates driver";
EN["league.mutual.passengerRates.text"] = "The passenger rates service quality: cleanliness, culture, route, careful driving and pickup/luggage help.";
EN["league.mutual.education.title"] = "Motivation for politeness";
EN["league.mutual.education.text"] = "The league should gently teach rude users better behavior: respect raises points; complaints and abuse lower score after review.";
EN["league.mutual.dispute.title"] = "Disputed ratings wait";
EN["league.mutual.dispute.text"] = "Low ratings, complaints, threats or conflict rides must pass policy/antifraud review before affecting prizes.";
EN["league.governance.country.title"] = "Countries do not mix";
EN["league.governance.country.text"] = "Each country has its own top drivers and passengers: separate rules, season, prize fund and compliance.";
EN["league.governance.topThree.title"] = "Only 1st/2nd/3rd place";
EN["league.governance.topThree.text"] = "Prize places are preview-only: 1st, 2nd, 3rd — no automatic payout from UI.";
EN["league.governance.noFake.title"] = "No fake reward";
EN["league.governance.noFake.text"] = "The UI does not grant a prize, bonus, promo, money or payout; everything waits for backend ledger, Admin and legal/payment review.";
EN["league.governance.admin.title"] = "Admin sets season and prizes";
EN["league.governance.admin.text"] = "Contest period, countries, limits, taxes, antifraud, scoring rules and prize payout activate only through foundation/Admin.";

EN["league.season.title"] = "Country league season";
EN["league.abuse.title"] = "League anti-abuse";
EN["league.stars.title"] = "Star etiquette";
EN["league.season.countryWindow.title"] = "Separate season per country";
EN["league.season.countryWindow.text"] = "Uzbekistan, Kazakhstan, Russia and other markets keep separate seasons so mature markets do not mix points with new markets.";
EN["league.season.monthly.title"] = "Admin sets the period";
EN["league.season.monthly.text"] = "A month, quarter or special season is selected only through Admin; the UI does not start contests or assign prizes by itself.";
EN["league.season.snapshot.title"] = "Final top-3 snapshot";
EN["league.season.snapshot.text"] = "1st, 2nd and 3rd place are locked only after verified trips, complaints, cancellations, stars and antifraud checks.";
EN["league.season.noPayout.title"] = "No prize payout from UI";
EN["league.season.noPayout.text"] = "Even when users see the leaderboard, payout, promo or bonus stays locked until backend ledger and legal/payment approval.";
EN["league.abuse.fakeTrips.title"] = "No fake trips";
EN["league.abuse.fakeTrips.text"] = "Points are not awarded for local previews, test taps, cancelled orders or rides without backend completion.";
EN["league.abuse.ratingFarm.title"] = "No arranged stars";
EN["league.abuse.ratingFarm.text"] = "Circular ratings, family farming and suspicious stars must go to policy review.";
EN["league.abuse.cancelLoop.title"] = "Cancellations and disputes lower trust";
EN["league.abuse.cancelLoop.text"] = "Frequent cancellations, conflict rides and complaints should not create fast leaderboard growth.";
EN["league.abuse.identity.title"] = "Identity and market checks";
EN["league.abuse.identity.text"] = "Country, account, device, driver documents and payment profile are verified by backend/Admin before prizes.";
EN["league.stars.driverPassenger.title"] = "Driver stars for passenger";
EN["league.stars.driverPassenger.text"] = "The driver rates the passenger for politeness, punctuality, cleanliness, care for the car and safety.";
EN["league.stars.passengerDriver.title"] = "Passenger stars for driver";
EN["league.stars.passengerDriver.text"] = "The passenger rates car cleanliness, calm driving, route, help and communication culture.";
EN["league.stars.confirmed.title"] = "Rating only after verified ride";
EN["league.stars.confirmed.text"] = "Stars cannot apply before real trip completion, backend state and fake-rating protection.";
EN["league.stars.dispute.title"] = "Protection from revenge and abuse";
EN["league.stars.dispute.text"] = "A disputed low rating, threats, rude behavior or complaint must pass review so the contest stays fair.";
EN["league.ai.title"] = "Sabi AI fairness control";
EN["league.penalty.title"] = "Complaints in one day";
EN["league.complaint.title"] = "Complaint review";
EN["league.cancel.title"] = "Cancellation and ride after cancellation";
EN["league.status.aiReview"] = "Sabi AI review";
EN["league.status.dailyWindow"] = "one-day counter";
EN["league.status.bothSides"] = "same for driver and passenger";
EN["league.status.pointsRemoved"] = "points removed";
EN["league.status.oneHourCooldown"] = "1 hour without orders";
EN["league.status.threeHourCooldown"] = "3 hours without orders";
EN["league.status.blockedReview"] = "blocked until review";
EN["league.ai.always.title"] = "Continuous Sabi AI analytics";
EN["league.ai.always.text"] = "Sabi AI should continuously review complaints, stars, cancellations, repeated routes, devices, country and suspicious activity.";
EN["league.ai.daily.title"] = "Complaints count inside one day";
EN["league.ai.daily.text"] = "Penalties use a daily window: 1, 2, 3 or more than 3 complaints in one day, not all-time history.";
EN["league.ai.bothSides.title"] = "Same rules for everyone";
EN["league.ai.bothSides.text"] = "Drivers and passengers follow the same discipline: complaints, rude behavior, arranged actions and threats affect points and access.";
EN["league.ai.noFake.title"] = "UI does not punish by itself";
EN["league.ai.noFake.text"] = "The screen shows rules only; it does not remove points or block accounts without backend/Admin/Sabi AI verification.";
EN["league.penalty.one.title"] = "1 complaint in a day";
EN["league.penalty.one.text"] = "After review, points are removed and star growth is frozen for the disputed ride.";
EN["league.penalty.two.title"] = "2 complaints in a day";
EN["league.penalty.two.text"] = "After review, points are removed and the driver or passenger cannot receive new orders for 1 hour.";
EN["league.penalty.three.title"] = "3 complaints in a day";
EN["league.penalty.three.text"] = "After review, points are removed and access to new orders is blocked for 3 hours.";
EN["league.penalty.more.title"] = "More than 3 complaints in a day";
EN["league.penalty.more.text"] = "The account is blocked until circumstances are clarified or the driver/passenger explanation is reviewed.";
EN["league.complaint.evidence.title"] = "Complaints need evidence";
EN["league.complaint.evidence.text"] = "Sabi AI and Admin review text, route, time, rating, cancellations, chat, calls and repeated patterns before sanctions.";
EN["league.complaint.explanation.title"] = "Right to explain";
EN["league.complaint.explanation.text"] = "For serious blocks, the driver or passenger should be able to explain the situation before the final decision.";
EN["league.complaint.noRevenge.title"] = "Protection from revenge";
EN["league.complaint.noRevenge.text"] = "Arranged complaints, revenge after conflict and fake accusations should reduce the violator's own trust.";
EN["league.complaint.sameRules.title"] = "Passenger penalties too";
EN["league.complaint.sameRules.text"] = "Passengers with complaints also lose points, stars, contest access and may receive temporary order blocking.";
EN["league.cancel.agreement.title"] = "Arranged cancellation is a violation";
EN["league.cancel.agreement.text"] = "If driver and passenger cancel by agreement to bypass commission or league rules, it goes to violation review.";
EN["league.cancel.afterRide.title"] = "Ride after cancellation is a violation";
EN["league.cancel.afterRide.text"] = "If the trip actually happens after cancellation, Sabi AI should mark it as a rule-bypass risk.";
EN["league.cancel.noPoints.title"] = "No points after cancellation";
EN["league.cancel.noPoints.text"] = "Cancelled rides, disputed rides and rides after cancellation do not grant points, stars or prize progress.";
EN["league.cancel.review.title"] = "Review before hard blocking";
EN["league.cancel.review.text"] = "Before long blocking, backend evidence, Sabi AI signal and Admin review are required; no automatic fake-ban from UI.";


EN["league.daily.title"] = "Daily complaint counter";
EN["league.evidence.title"] = "Sabi AI evidence";
EN["league.appeal.title"] = "Explanation and appeal";
EN["league.discipline.title"] = "Contest discipline";
EN["league.daily.reset.title"] = "Counter resets by day";
EN["league.daily.reset.text"] = "1/2/3/>3 complaints are counted inside one country-day; old complaints do not mix with a new day.";
EN["league.daily.countryClock.title"] = "Country-local day";
EN["league.daily.countryClock.text"] = "Each country uses its local daily window so Uzbekistan, Kazakhstan, Russia and other markets stay fair.";
EN["league.daily.noCarryFake.title"] = "No permanent UI punishment";
EN["league.daily.noCarryFake.text"] = "The UI does not carry penalties or fake-ban users by itself; daily history must come from backend/Sabi AI/Admin.";
EN["league.daily.repeatWatch.title"] = "Repeated signals watched";
EN["league.daily.repeatWatch.text"] = "If complaints repeat across days, Sabi AI raises risk and sends the case to manual review.";
EN["league.evidence.route.title"] = "Route and repetition";
EN["league.evidence.route.text"] = "Sabi AI checks repeated routes, cancellations, rides after cancellation and frequent driver/passenger matching.";
EN["league.evidence.chat.title"] = "Chat, calls and complaints";
EN["league.evidence.chat.text"] = "Complaints, text, calls, threats, rude behavior and event timing are reviewed before sanctions; one unsupported word should not break rating.";
EN["league.evidence.device.title"] = "Device, account and country";
EN["league.evidence.device.text"] = "Antifraud checks device, account, country, driver documents and suspicious participant links.";
EN["league.evidence.starComplaint.title"] = "Stars versus complaints";
EN["league.evidence.starComplaint.text"] = "If stars and complaints conflict, league progress is frozen until review to prevent revenge and farming.";
EN["league.appeal.warning.title"] = "Verified warning first";
EN["league.appeal.warning.text"] = "Soft violations may receive warning and point loss, but UI must not auto-block without evidence.";
EN["league.appeal.explanation.title"] = "Right to explain";
EN["league.appeal.explanation.text"] = "When more than 3 daily complaints trigger block review, the driver or passenger should have an explanation screen before final decision.";
EN["league.appeal.admin.title"] = "Admin review required";
EN["league.appeal.admin.text"] = "Long blocks, prize removal, payout/reward stop and disputed cases require Admin review and backend evidence.";
EN["league.appeal.noAuto.title"] = "No automatic execution";
EN["league.appeal.noAuto.text"] = "Sabi AI provides a signal, but real sanctions apply only through backend policy, Admin and audit trail.";
EN["league.discipline.driver.title"] = "Driver is responsible for service";
EN["league.discipline.driver.text"] = "Rudeness, dirty car, unsafe driving, arranged cancellations and rides after cancellation remove points and may close order access.";
EN["league.discipline.passenger.title"] = "Passenger is responsible too";
EN["league.discipline.passenger.text"] = "Rudeness, threats, mess, disrespect and false complaints remove passenger points and may temporarily close taxi ordering.";
EN["league.discipline.prize.title"] = "Prizes freeze during disputes";
EN["league.discipline.prize.text"] = "If a top-3 participant has active complaints or disputed rides, the prize stays locked until review is complete.";
EN["league.discipline.cooldown.title"] = "Cooldown without new orders";
EN["league.discipline.cooldown.text"] = "2 complaints in one day mean 1 hour without orders, 3 complaints mean 3 hours, more than 3 means block until review after verification.";

EN["league.escalation.title"] = "Daily complaint escalation";
EN["league.analytics.title"] = "Sabi AI contest analytics";
EN["league.trust.title"] = "Participant trust status";
EN["league.reward.title"] = "Reward safety";
EN["league.dailyEscalation.warning.title"] = "1 complaint in one day";
EN["league.dailyEscalation.warning.text"] = "After review, points are removed; stars and contest progress for the disputed ride are frozen.";
EN["league.dailyEscalation.oneHour.title"] = "2 complaints in one day";
EN["league.dailyEscalation.oneHour.text"] = "After review, points are removed and the driver/passenger cannot receive new orders for 1 hour.";
EN["league.dailyEscalation.threeHour.title"] = "3 complaints in one day";
EN["league.dailyEscalation.threeHour.text"] = "After review, points are removed and access to new orders is closed for 3 hours.";
EN["league.dailyEscalation.block.title"] = "More than 3 complaints in one day";
EN["league.dailyEscalation.block.text"] = "The participant is blocked until circumstances, explanation and Admin/Sabi AI decision are reviewed.";
EN["league.analytics.complaints.title"] = "Continuous complaint checks";
EN["league.analytics.complaints.text"] = "Sabi AI reviews frequency, source, repetition, route, chat, calls and rating conflicts before sanctions.";
EN["league.analytics.cancelAfter.title"] = "Arranged cancellation and ride after cancellation";
EN["league.analytics.cancelAfter.text"] = "Arranged cancellation, commission bypass or real ride after cancellation is treated as a violation and sent to review.";
EN["league.analytics.stars.title"] = "Stars are checked for fairness";
EN["league.analytics.stars.text"] = "Driver and passenger stars are compared with complaints, cancellations, trip timing and chat behavior.";
EN["league.analytics.country.title"] = "Country-based verification";
EN["league.analytics.country.text"] = "Leagues, complaints and rewards are counted separately by country, local day and verified account country.";
EN["league.trust.cleanDay.title"] = "Clean day";
EN["league.trust.cleanDay.text"] = "No verified complaints in the day: league, stars and order access stay available.";
EN["league.trust.review.title"] = "Under review";
EN["league.trust.review.text"] = "Disputed complaints or star conflicts lock points and reward progress until review.";
EN["league.trust.cooldown.title"] = "Cooldown";
EN["league.trust.cooldown.text"] = "After 2 or 3 verified daily complaints, new orders are temporarily closed by policy.";
EN["league.trust.blocked.title"] = "Blocked until clarification";
EN["league.trust.blocked.text"] = "More than 3 verified daily complaints close access until explanation and Admin/Sabi AI decision.";
EN["league.reward.noInstant.title"] = "No instant rewards";
EN["league.reward.noInstant.text"] = "UI does not issue prizes, promo codes, money or bonuses without backend/Admin/payment review.";
EN["league.reward.freeze.title"] = "Reward frozen during dispute";
EN["league.reward.freeze.text"] = "If a top-3 participant has open complaints, cancellations or fraud signals, the prize is locked until the final decision.";
EN["league.reward.admin.title"] = "Admin approves rewards";
EN["league.reward.admin.text"] = "Every prize requires season snapshot, legal rules, anti-fraud, backend ledger and Admin approval.";
EN["league.reward.country.title"] = "Rewards by country";
EN["league.reward.country.text"] = "1st/2nd/3rd places are selected separately for every country; markets are not mixed.";

EN["league.history.title"] = "Daily sanction history";
EN["league.freeze.title"] = "Reward freeze reasons";
EN["league.appealStatus.title"] = "Explanation status";
EN["league.decision.title"] = "Sabi AI complaint decision";
EN["league.history.countryDay.title"] = "History by day and country";
EN["league.history.countryDay.text"] = "Sanctions are counted inside one local day for one country, not as a permanent all-time counter.";
EN["league.history.bothSides.title"] = "Separate for driver and passenger";
EN["league.history.bothSides.text"] = "The UI shows equal discipline: daily complaint history applies to drivers and passengers.";
EN["league.history.repeatRisk.title"] = "Repeats raise risk";
EN["league.history.repeatRisk.text"] = "If complaints repeat across days, Sabi AI raises risk level and sends the case to manual review.";
EN["league.history.noUiWrite.title"] = "UI does not write sanctions";
EN["league.history.noUiWrite.text"] = "The screen does not remove points, block users or clear history by itself; it is a backend/Admin/Sabi AI contract.";
EN["league.freeze.complaint.title"] = "Open verified complaint";
EN["league.freeze.complaint.text"] = "While a complaint is under review, stars, points and top-3 rewards remain frozen until decision.";
EN["league.freeze.cancelAfter.title"] = "Arranged cancellation";
EN["league.freeze.cancelAfter.text"] = "Arranged cancellation and ride after cancellation freeze contest progress and go to Sabi AI/Admin review.";
EN["league.freeze.starConflict.title"] = "Stars versus complaint conflict";
EN["league.freeze.starConflict.text"] = "If a high rating conflicts with a complaint, prize/reward stays locked until route, chat and behavior are analyzed.";
EN["league.freeze.admin.title"] = "Final Admin decision required";
EN["league.freeze.admin.text"] = "Prize, promo, bonus or top-3 removal is confirmed only after backend evidence and Admin decision.";
EN["league.appealStatus.draft.title"] = "Explanation expected";
EN["league.appealStatus.draft.text"] = "When more than 3 complaints in a day cause block review, the participant should be able to explain circumstances.";
EN["league.appealStatus.evidence.title"] = "Evidence is collected";
EN["league.appealStatus.evidence.text"] = "Sabi AI checks route, chat, calls, cancellations, repetition, country and device before sanctions.";
EN["league.appealStatus.decision.title"] = "Decision pending";
EN["league.appealStatus.decision.text"] = "Long block, prize removal or point restoration require Admin review and audit trail.";
EN["league.appealStatus.restored.title"] = "Restored after clean decision";
EN["league.appealStatus.restored.text"] = "If a complaint is false or unproven, access and contest status should be restored by backend policy.";
EN["league.decision.verified.title"] = "Complaint verified";
EN["league.decision.verified.text"] = "Only a verified complaint can remove points, freeze stars or start cooldown by the daily rule.";
EN["league.decision.falseReport.title"] = "False complaint is a violation too";
EN["league.decision.falseReport.text"] = "If a passenger or driver reports falsely on purpose, penalties apply to the false reporter after review.";
EN["league.decision.cooldown.title"] = "Cooldown with timer";
EN["league.decision.cooldown.text"] = "2 complaints in a day mean 1 hour, 3 complaints mean 3 hours without orders; more than 3 means block until review.";
EN["league.decision.noFake.title"] = "No fake sanction execution";
EN["league.decision.noFake.text"] = "UI does not execute sanctions or issue rewards; it shows rules until real backend/Admin decision.";

EN["league.scoreImpact.title"] = "Score impact";
EN["league.scoreImpact.order.title"] = "Points only for verified orders";
EN["league.scoreImpact.order.text"] = "Orders increase ranking only after real backend trip completed and country/account verification.";
EN["league.scoreImpact.stars.title"] = "Stars improve culture";
EN["league.scoreImpact.stars.text"] = "Driver and passenger stars affect points only after a verified trip and Sabi AI review.";
EN["league.scoreImpact.complaint.title"] = "Verified complaint removes points";
EN["league.scoreImpact.complaint.text"] = "Points are removed only after complaint verification; the daily 1/2/3/>3 rule applies to drivers and passengers.";
EN["league.scoreImpact.noUi.title"] = "UI does not mutate real points";
EN["league.scoreImpact.noUi.text"] = "The screen shows rules and preview; real points, stars and sanctions are changed only by backend/Admin/Sabi AI.";
EN["league.cooldown.title"] = "Cooldown/block reasons";
EN["league.cooldown.oneHourReason.title"] = "2 complaints in one day";
EN["league.cooldown.oneHourReason.text"] = "After 2 verified complaints in one day, the participant loses points and cannot receive/accept orders for 1 hour.";
EN["league.cooldown.threeHourReason.title"] = "3 complaints in one day";
EN["league.cooldown.threeHourReason.text"] = "After 3 verified complaints in one day, the participant loses points and cannot receive/accept orders for 3 hours.";
EN["league.cooldown.blockReason.title"] = "More than 3 complaints in one day";
EN["league.cooldown.blockReason.text"] = "More than 3 verified complaints in one day blocks access until investigation and participant explanation.";
EN["league.cooldown.countryDay.title"] = "Window: country + day";
EN["league.cooldown.countryDay.text"] = "Complaints are counted per country and only within one calendar day.";
EN["league.falseComplaint.title"] = "False complaint protection";
EN["league.falseComplaint.detect.title"] = "Sabi AI detects false reports";
EN["league.falseComplaint.detect.text"] = "Chat, calls, route, cancellations, repetition, stars and conflict history are checked.";
EN["league.falseComplaint.penalty.title"] = "False complaint is a violation too";
EN["league.falseComplaint.penalty.text"] = "If a driver or passenger intentionally reports falsely, penalties apply to the false reporter.";
EN["league.falseComplaint.restore.title"] = "Restore after clean review";
EN["league.falseComplaint.restore.text"] = "If the complaint is not verified, order access, points and league status should be restored by backend policy.";
EN["league.falseComplaint.noRevenge.title"] = "No revenge or pressure";
EN["league.falseComplaint.noRevenge.text"] = "UI must not show fake-ban or fake revenge; all decisions require evidence + Admin/Sabi AI review.";
EN["league.recovery.title"] = "Recovery after review";
EN["league.recovery.clean.title"] = "Clean decision";
EN["league.recovery.clean.text"] = "After a clean decision, the participant returns to the league without manual score farming or fake reward.";
EN["league.recovery.points.title"] = "Point restoration by decision";
EN["league.recovery.points.text"] = "Points or stars can be restored only by backend evidence and Admin/Sabi AI decision.";
EN["league.recovery.access.title"] = "Order access";
EN["league.recovery.access.text"] = "Cooldown/block removal opens orders only after server status, not after a UI button.";
EN["league.recovery.audit.title"] = "Audit trail remains";
EN["league.recovery.audit.text"] = "Every recovery keeps audit trail: country, date, reason, evidence and Admin decision.";

EN["league.audit.title"] = "Score and sanction audit";
EN["league.audit.countryDay.title"] = "Country + day";
EN["league.audit.countryDay.text"] = "Every point removal or restoration should show country, local date, participant role and decision source.";
EN["league.audit.scoreDelta.title"] = "Before and after points";
EN["league.audit.scoreDelta.text"] = "The participant should see previous score, removed or restored points and the reason behind the change.";
EN["league.audit.evidence.title"] = "Evidence is linked to the decision";
EN["league.audit.evidence.text"] = "Complaint, cancellation, ride after cancellation, chat, calls and route link to audit trail, but UI does not execute sanctions.";
EN["league.audit.noUi.title"] = "UI does not change history";
EN["league.audit.noUi.text"] = "The screen only displays honest history; audit writes, point removal and recovery belong to backend/Admin/Sabi AI.";
EN["league.adjustment.title"] = "Why points changed";
EN["league.adjustment.complaint.title"] = "Verified complaint";
EN["league.adjustment.complaint.text"] = "After a verified daily complaint, the system shows point loss, cooldown or block as a backend/Admin decision result.";
EN["league.adjustment.falseReport.title"] = "False complaint";
EN["league.adjustment.falseReport.text"] = "If a complaint is false, penalties should apply to the false reporter and the innocent participant should be restored.";
EN["league.adjustment.restored.title"] = "Points restored";
EN["league.adjustment.restored.text"] = "Point, star and access restoration is shown only after a clean decision with audit trail.";
EN["league.adjustment.rewardFrozen.title"] = "Prize frozen";
EN["league.adjustment.rewardFrozen.text"] = "If a top-3 participant has a dispute, the prize remains locked until final review and legal/payment approval.";
EN["league.timeline.title"] = "Dispute evidence timeline";
EN["league.timeline.opened.title"] = "Case opened";
EN["league.timeline.opened.text"] = "After complaint or disputed cancellation, a review case is created with role, country, date, trip and reason.";
EN["league.timeline.ai.title"] = "Sabi AI reviews";
EN["league.timeline.ai.text"] = "Sabi AI checks routes, chat, calls, stars, repetition, device, country and complaint history.";
EN["league.timeline.admin.title"] = "Admin decides";
EN["league.timeline.admin.text"] = "Long blocks, prize removal, point restoration and disputed cases require Admin review.";
EN["league.timeline.final.title"] = "Final result and recovery";
EN["league.timeline.final.text"] = "After decision, the participant sees sanction, recovery, prize freeze or league removal without fake UI action.";
EN["league.transparency.title"] = "Participant transparency";
EN["league.transparency.why.title"] = "Clear reason";
EN["league.transparency.why.text"] = "Drivers and passengers should see the reason: complaint, cancellation, stars, rude behavior or evidence conflict.";
EN["league.transparency.next.title"] = "Clear next step";
EN["league.transparency.next.text"] = "The screen shows the next step: wait for review, explain, pass cooldown, get restored or wait for Admin decision.";
EN["league.transparency.sameRules.title"] = "Same rules for driver and passenger";
EN["league.transparency.sameRules.text"] = "Points, stars, complaints, false reports, cooldown and blocks apply symmetrically to both sides.";
EN["league.transparency.noFake.title"] = "No fake result";
EN["league.transparency.noFake.text"] = "UI does not say points were removed, prize issued or block applied until backend/Admin/Sabi AI state confirms it.";

EN["league.warning.title"] = "Warnings without humiliation";
EN["league.warning.soft.title"] = "Soft warning";
EN["league.warning.soft.text"] = "After the first verified daily complaint, UI shows calm rules and warning but never fake-blocks the participant.";
EN["league.warning.cooldown.title"] = "Cooldown is verified first";
EN["league.warning.cooldown.text"] = "Before 1 or 3 hours without orders, Sabi AI must verify daily window, role, country and evidence.";
EN["league.warning.block.title"] = "Block only after evidence";
EN["league.warning.block.text"] = "More than 3 verified complaints in one day leads to review block, but UI does not apply it without backend/Admin state.";
EN["league.warning.noShame.title"] = "No public shaming";
EN["league.warning.noShame.text"] = "Leagues should teach culture, not humiliate: reasons and appeal are private; public UI shows only fair rating.";
EN["league.coach.title"] = "Behavior culture";
EN["league.coach.driver.title"] = "Driver: service and cleanliness";
EN["league.coach.driver.text"] = "Politeness, clean car, safe driving and calm communication improve trust and contest points after a verified trip.";
EN["league.coach.passenger.title"] = "Passenger: respect and punctuality";
EN["league.coach.passenger.text"] = "Punctuality, respectful tone, careful car behavior and no rude conduct help the passenger receive stars from the driver.";
EN["league.coach.stars.title"] = "Stars mean culture, not pressure";
EN["league.coach.stars.text"] = "Driver and passenger stars count only after a verified trip; arranged stars and pressure are violations.";
EN["league.coach.cleanDay.title"] = "A clean day helps recovery";
EN["league.coach.cleanDay.text"] = "Clean days without verified complaints improve trust but do not erase audit trail or issue fake rewards.";
EN["league.confidence.title"] = "Sabi AI confidence";
EN["league.confidence.low.title"] = "Low confidence";
EN["league.confidence.low.text"] = "If evidence is weak or conflicting, UI shows review pending and does not allow fake sanctions.";
EN["league.confidence.medium.title"] = "Medium confidence";
EN["league.confidence.medium.text"] = "Medium risk goes to manual/Admin review: the participant can explain before long block or prize removal.";
EN["league.confidence.high.title"] = "High confidence";
EN["league.confidence.high.text"] = "High risk appears only with verified evidence: repeat daily complaints, arranged cancellation or ride after cancellation.";
EN["league.confidence.human.title"] = "Human review for heavy decisions";
EN["league.confidence.human.text"] = "Long block, prize removal, payout freeze and disputed cases require Admin/legal review, not only AI preview.";
EN["league.eligibility.title"] = "Prize eligibility";
EN["league.eligibility.country.title"] = "Country separate";
EN["league.eligibility.country.text"] = "The participant competes in the verified profile/trip country; countries are not mixed or gamed through roaming.";
EN["league.eligibility.cleanDay.title"] = "Clean daily window";
EN["league.eligibility.cleanDay.text"] = "Top-3 eligibility uses verified trips, stars and no open verified complaints in the daily window.";
EN["league.eligibility.noCase.title"] = "Open case freezes prize";
EN["league.eligibility.noCase.text"] = "If a participant has an open dispute, prize, promo, bonus or payout remains locked until final decision.";
EN["league.eligibility.noFake.title"] = "Prize is not issued by UI button";
EN["league.eligibility.noFake.text"] = "UI shows eligibility preview only; actual reward requires season snapshot, backend ledger, Admin and provider/payment approval.";


EN["postRide.title"] = "Post-ride rating and fairness";
EN["postRide.subtitle"] = "Stars, compliments, complaints and points only after a verified ride";
EN["postRide.status.verifiedPreview"] = "verified preview";
EN["postRide.status.locked"] = "after trip";
EN["postRide.status.verifiedOnly"] = "verified ride only";
EN["postRide.status.delivery"] = "delivery proof required";
EN["postRide.status.ride"] = "trip proof required";
EN["postRide.status.noFakePayment"] = "no fake payment";
EN["postRide.score.passenger"] = "Rate the driver";
EN["postRide.score.driver"] = "Rate the passenger";
EN["postRide.score.verified.text"] = "After a verified ride, the app can honestly rate culture, cleanliness and safety.";
EN["postRide.score.locked.text"] = "Before a verified ride, UI does not set stars, points, penalties or rewards.";
EN["postRide.metric.fare"] = "Total";
EN["postRide.metric.noPayment"] = "no payment success";
EN["postRide.metric.points"] = "Points";
EN["postRide.metric.noReward"] = "no fake reward";
EN["postRide.rate.driver.title"] = "Rate driver";
EN["postRide.rate.driver.text"] = "Stars count only after a confirmed trip and without pressure.";
EN["postRide.rate.passenger.title"] = "Rate passenger";
EN["postRide.rate.passenger.text"] = "The driver rates the passenger only after verified trip and honest reason.";
EN["postRide.compliment.title"] = "Compliment";
EN["postRide.compliment.passenger.text"] = "Clean car, politeness and careful driving improve trust preview.";
EN["postRide.tip.title"] = "Tip preview";
EN["postRide.tip.passenger.text"] = "Tips are not charged or confirmed without Wallet/payment backend.";
EN["postRide.complaint.title"] = "Complaint / appeal";
EN["postRide.complaint.passenger.text"] = "Complaints go to Sabi AI/Admin review; raw evidence is not shown publicly.";
EN["postRide.cleanliness.title"] = "Culture and cleanliness";
EN["postRide.cleanliness.driver.text"] = "Passenger care and respect affect trust only after review.";
EN["postRide.ledger.title"] = "Ledger preview";
EN["postRide.ledger.driver.text"] = "admin-configured commission and driver payout stay preview only, without backend ledger debit.";
EN["postRide.dispute.title"] = "Post-trip dispute";
EN["postRide.dispute.driver.text"] = "False complaints, cancellation abuse and appeals go to Admin-compatible foundation.";
EN["postRide.chip.verifiedOnly"] = "verified ride only";
EN["postRide.chip.noFakeStars"] = "no fake stars";
EN["postRide.chip.noFakeReward"] = "no fake reward";
EN["postRide.chip.passengerFair"] = "passenger fair";
EN["postRide.chip.driverFair"] = "driver fair";
EN["postRide.footer"] = "002F adds post-ride fairness UI, but does not enable stars write, points change, tips, payment, payout, Wallet, DB, provider or fake success.";


EN["onboarding.title"] = "Connection through Admin review";
EN["onboarding.subtitle.driver"] = "Driver/park application: documents, vehicle, tariffs and approval only through Admin";
EN["onboarding.subtitle.passenger"] = "Passenger sees honest status: drivers connect only after Admin approval";
EN["onboarding.status.adminReview"] = "Admin review";
EN["onboarding.status.required"] = "required";
EN["onboarding.status.documents"] = "documents";
EN["onboarding.status.adminConfig"] = "Admin config";
EN["onboarding.status.pending"] = "under review";
EN["onboarding.status.previewReady"] = "preview ready";
EN["onboarding.status.noFake"] = "no fake approval";
EN["onboarding.hero.driver.label"] = "Connection request";
EN["onboarding.hero.driver.text"] = "The driver or taxi park submits an application, while Admin reviews profile, documents, vehicle, tariffs and commission config.";
EN["onboarding.hero.driver.value"] = "review";
EN["onboarding.hero.passenger.label"] = "Connection trust";
EN["onboarding.hero.passenger.text"] = "Passengers never see fake-approved drivers: connection appears only after Admin review and approved runtime.";
EN["onboarding.hero.passenger.value"] = "Admin";
EN["onboarding.hero.unit"] = "approval";
EN["onboarding.step.profile.title"] = "Profile and country";
EN["onboarding.step.profile.text"] = "Admin checks identity, role, work country and basic connection conditions.";
EN["onboarding.step.vehicle.title"] = "Vehicle / park";
EN["onboarding.step.vehicle.text"] = "Car, class, photos, taxi park and order access go through review before appearing as approved.";
EN["onboarding.step.documents.title"] = "Documents";
EN["onboarding.step.documents.text"] = "Driver documents, licenses and safety checks remain pending until Admin decision.";
EN["onboarding.step.tariffs.title"] = "Tariffs and commission";
EN["onboarding.step.tariffs.text"] = "Tariffs, commission rate and access rules are configured in Admin; mobile only shows preview.";
EN["onboarding.step.decision.title"] = "Admin decision";
EN["onboarding.step.decision.text"] = "Approval, rejection, hold or re-check are not faked and are not performed from mobile UI.";
EN["onboarding.passenger.trusted.title"] = "Verified driver";
EN["onboarding.passenger.trusted.text"] = "Passenger receives only a driver who passed Admin-compatible onboarding and runtime approval.";
EN["onboarding.passenger.price.title"] = "Price from Admin config";
EN["onboarding.passenger.price.text"] = "Tariffs and commission config are not hardcoded in mobile; they come from future Admin/foundation config.";
EN["onboarding.passenger.noFake.title"] = "No fake approval";
EN["onboarding.passenger.noFake.text"] = "Mobile UI does not show connection, order or payout as completed without backend/Admin/provider state.";
EN["onboarding.chip.adminReview"] = "Admin review";
EN["onboarding.chip.noFakeApproval"] = "no fake approval";
EN["onboarding.chip.tariffAdmin"] = "tariffs in Admin";
EN["onboarding.chip.driverPark"] = "driver/park request";
EN["onboarding.chip.deliveryPark"] = "courier/park request";
EN["onboarding.footer"] = "002J locks the rule: driver/park connection request goes to Admin review/approval; tariffs and commission rate are configured in Admin; mobile remains kernel-safe UI without fake approval, payment, payout, dispatch or runtime.";

EN["adminTariff.title"] = "Admin tariffs and eligibility";
EN["adminTariff.subtitle.passenger"] = "Passenger sees tariff and vehicle catalog only as Admin-configured preview.";
EN["adminTariff.subtitle.driver"] = "Driver/park receives classes, commission and order access only after Admin review.";
EN["adminTariff.status.adminCatalog"] = "Admin catalog";
EN["adminTariff.status.adminReview"] = "Admin review";
EN["adminTariff.status.countryAdmin"] = "country config";
EN["adminTariff.status.adminPercent"] = "Admin %";
EN["adminTariff.status.previewReady"] = "preview ready";
EN["adminTariff.status.locked"] = "locked";
EN["adminTariff.status.eligibleOnly"] = "eligible only";
EN["adminTariff.status.serviceConfig"] = "service config";
EN["adminTariff.status.noFake"] = "no fake";
EN["adminTariff.status.selected"] = "selected";
EN["adminTariff.status.admin"] = "Admin";
EN["adminTariff.hero.passenger.label"] = "Catalog from Admin";
EN["adminTariff.hero.passenger.text"] = "Price, vehicle classes, delivery/intercity and rules stay honest preview until Admin/backend config.";
EN["adminTariff.hero.driver.label"] = "Driver eligibility";
EN["adminTariff.hero.driver.text"] = "Vehicle class, country, tariff, commission and order access are reviewed and approved in Admin.";
EN["adminTariff.hero.driver.value"] = "review";
EN["adminTariff.catalog.adminPrice"] = "price from Admin";
EN["adminTariff.passenger.honest.title"] = "Honest price";
EN["adminTariff.passenger.honest.text"] = "Quote does not promise final charge: tariff and rules come from Admin/foundation config.";
EN["adminTariff.passenger.vehicle.title"] = "Vehicle by eligibility";
EN["adminTariff.passenger.vehicle.text"] = "Economy, Comfort, Business and Premium are available only after approved vehicle/service eligibility.";
EN["adminTariff.passenger.service.title"] = "Service";
EN["adminTariff.passenger.service.ride"] = "Ride/intercity rules are set in Admin and do not include fake driver assignment.";
EN["adminTariff.passenger.service.delivery"] = "Delivery/courier/cargo rules are set in Admin and do not include fake pickup proof.";
EN["adminTariff.passenger.runtime.title"] = "Runtime locked";
EN["adminTariff.passenger.runtime.text"] = "Mobile does not enable dispatch, geo, charge, refund, payout or approval without backend/Admin/provider.";
EN["adminTariff.eligibility.vehicle.title"] = "Vehicle class";
EN["adminTariff.eligibility.vehicle.text"] = "Admin reviews car, photos, class, documents and ability to accept selected tariffs.";
EN["adminTariff.eligibility.country.title"] = "Work country";
EN["adminTariff.eligibility.country.text"] = "Tariffs, commissions and access rules are separated by country and not mixed in mobile.";
EN["adminTariff.eligibility.commission.title"] = "Commission";
EN["adminTariff.eligibility.commission.text"] = "Commission rate changes in Admin; mobile shows only Admin % preview.";
EN["adminTariff.eligibility.orders.title"] = "Order access";
EN["adminTariff.eligibility.orders.text"] = "Order pool opens only after approved application, balance and runtime provider readiness.";
EN["adminTariff.config.tariff"] = "tariff";
EN["adminTariff.config.commission"] = "commission";
EN["adminTariff.config.application"] = "application";
EN["adminTariff.chip.tariffCatalog"] = "catalog from Admin";
EN["adminTariff.chip.commissionAdmin"] = "commission in Admin";
EN["adminTariff.chip.applicationReview"] = "application review";
EN["adminTariff.chip.driverEligibility"] = "driver eligibility";
EN["adminTariff.chip.passengerTruth"] = "passenger truth";
EN["adminTariff.footer"] = "002K adds Admin-configured tariff catalog and vehicle/service eligibility preview: tariffs, commission rate and connection are approved in Admin; mobile does not perform fake approval, dispatch, payment, payout, Wallet or runtime.";

EN["zoneCoverage.title"] = "Cities, zones and availability";
EN["zoneCoverage.subtitle.passenger"] = "Zones, airport, intercity and delivery are configured in Admin";
EN["zoneCoverage.subtitle.driver"] = "Work city, airport, intercity and delivery need Admin eligibility";
EN["zoneCoverage.status.adminConfig"] = "Admin config";
EN["zoneCoverage.status.adminZone"] = "Admin zone";
EN["zoneCoverage.status.airportReview"] = "airport review";
EN["zoneCoverage.status.airportPreview"] = "airport preview";
EN["zoneCoverage.status.routeConfig"] = "route config";
EN["zoneCoverage.status.deliveryConfig"] = "delivery config";
EN["zoneCoverage.status.deliveryPreview"] = "delivery preview";
EN["zoneCoverage.status.optional"] = "optional";
EN["zoneCoverage.status.countryAdmin"] = "country in Admin";
EN["zoneCoverage.status.runtimeLocked"] = "runtime locked";
EN["zoneCoverage.hero.passenger.label"] = "Coverage from Admin";
EN["zoneCoverage.hero.passenger.text"] = "Passenger sees honest preview only: city, airport, intercity and delivery open through Admin config and runtime readiness.";
EN["zoneCoverage.hero.driver.label"] = "Driver work zone";
EN["zoneCoverage.hero.driver.text"] = "Driver/park receives zones, airport, intercity and delivery only after Admin review, documents and eligibility.";
EN["zoneCoverage.hero.driver.ready"] = "ready";
EN["zoneCoverage.hero.driver.review"] = "review";
EN["zoneCoverage.hero.driver.unit"] = "Admin";
EN["zoneCoverage.passenger.city.title"] = "City zone";
EN["zoneCoverage.passenger.city.text"] = "City tariffs, districts and availability come from Admin catalog, not mobile hardcode.";
EN["zoneCoverage.passenger.airport.title"] = "Airport";
EN["zoneCoverage.passenger.airport.text"] = "Airport pickup/dropoff is preview only until real provider/runtime enablement.";
EN["zoneCoverage.passenger.intercity.title"] = "Intercity";
EN["zoneCoverage.passenger.intercity.text"] = "Intercity is available only through Admin route config, country rules and approved drivers.";
EN["zoneCoverage.passenger.delivery.title"] = "Delivery";
EN["zoneCoverage.passenger.delivery.text"] = "Delivery, courier and cargo are shown as Admin-configured service preview without fake pickup.";
EN["zoneCoverage.driver.city.title"] = "Work city";
EN["zoneCoverage.driver.city.text"] = "Driver city/region is assigned in Admin after application, documents and country review.";
EN["zoneCoverage.driver.airport.title"] = "Airport access";
EN["zoneCoverage.driver.airport.text"] = "Airport, terminals and queue rules are enabled only after Admin eligibility.";
EN["zoneCoverage.driver.intercity.title"] = "Intercity access";
EN["zoneCoverage.driver.intercity.text"] = "Intercity requires separate Admin zone/route approval and does not open provider dispatch from UI.";
EN["zoneCoverage.driver.delivery.title"] = "Delivery access";
EN["zoneCoverage.driver.delivery.text"] = "Delivery/courier/cargo are assigned in Admin and stay locked until backend/provider readiness.";
EN["zoneCoverage.config.country"] = "country";
EN["zoneCoverage.config.city"] = "zone";
EN["zoneCoverage.config.runtime"] = "runtime";
EN["zoneCoverage.chip.adminZones"] = "zones from Admin";
EN["zoneCoverage.chip.countrySeparated"] = "countries separated";
EN["zoneCoverage.chip.noDispatchRuntime"] = "no dispatch runtime";
EN["zoneCoverage.chip.driverApproval"] = "driver approval";
EN["zoneCoverage.chip.passengerTruth"] = "honest availability";
EN["zoneCoverage.footer"] = "002L adds city/zone coverage preview: country, city, airport, intercity and delivery are controlled by Admin config/eligibility; mobile does not start dispatch, geo, provider, payment, payout or fake approval.";


EN["dispatchReadiness.title"] = "Order readiness";
EN["dispatchReadiness.subtitle.passenger"] = "Shows when a driver can be available without fake assignment";
EN["dispatchReadiness.subtitle.driver"] = "Order access after Admin approval, balance and runtime readiness";
EN["dispatchReadiness.status.lockedPreview"] = "locked preview";
EN["dispatchReadiness.status.adminConfig"] = "Admin config";
EN["dispatchReadiness.status.adminReview"] = "Admin review";
EN["dispatchReadiness.status.approvedPreview"] = "approved preview";
EN["dispatchReadiness.status.balancePreview"] = "balance preview";
EN["dispatchReadiness.status.balanceLocked"] = "balance locked";
EN["dispatchReadiness.status.providerLocked"] = "provider locked";
EN["dispatchReadiness.status.runtimeLocked"] = "runtime locked";
EN["dispatchReadiness.status.poolPreview"] = "pool preview";
EN["dispatchReadiness.status.noFake"] = "no fake";
EN["dispatchReadiness.hero.passenger.label"] = "Honest order readiness";
EN["dispatchReadiness.hero.passenger.text"] = "Passenger sees ETA and availability as kernel-safe preview only until real Admin/backend/provider readiness.";
EN["dispatchReadiness.hero.driver.label"] = "Order queue access";
EN["dispatchReadiness.hero.driver.text"] = "Driver enters the queue only after Admin application approval, balance, zone and live runtime readiness.";
EN["dispatchReadiness.hero.driver.queue"] = "queue";
EN["dispatchReadiness.hero.driver.review"] = "review";
EN["dispatchReadiness.hero.driver.unit"] = "Admin";
EN["dispatchReadiness.passenger.catalog.title"] = "Tariff from Admin";
EN["dispatchReadiness.passenger.catalog.text"] = "Price, vehicle classes and zones come from Admin config; mobile does not assign tariff by itself.";
EN["dispatchReadiness.passenger.pool.title"] = "Driver pool";
EN["dispatchReadiness.passenger.pool.text"] = "Driver appears only after approved application, balance gate and provider readiness.";
EN["dispatchReadiness.passenger.provider.title"] = "Provider readiness";
EN["dispatchReadiness.passenger.provider.text"] = "Real dispatch needs provider/backend runtime; mobile currently shows preview only.";
EN["dispatchReadiness.passenger.noFake.title"] = "No fake driver found";
EN["dispatchReadiness.passenger.noFake.text"] = "UI does not show found driver, completion or payment without backend/Admin/provider confirmation.";
EN["dispatchReadiness.driver.admin.title"] = "Admin approval";
EN["dispatchReadiness.driver.admin.text"] = "Driver/park connection request goes through Admin review before order access.";
EN["dispatchReadiness.driver.balance.title"] = "Balance gate";
EN["dispatchReadiness.driver.balance.text"] = "Without sufficient balance, driver does not enter queue and does not receive orders.";
EN["dispatchReadiness.driver.provider.title"] = "Provider readiness";
EN["dispatchReadiness.driver.provider.text"] = "Dispatch provider stays locked until backend readiness and separate approval.";
EN["dispatchReadiness.driver.runtime.title"] = "Live runtime";
EN["dispatchReadiness.driver.runtime.text"] = "GPS, navigation, assignment and live trip start only for a real approved trip.";
EN["dispatchReadiness.flow.application"] = "connection request";
EN["dispatchReadiness.flow.admin"] = "Admin review/approval";
EN["dispatchReadiness.flow.balance"] = "balance and zone";
EN["dispatchReadiness.flow.provider"] = "provider readiness";
EN["dispatchReadiness.flow.live"] = "live trip runtime";
EN["dispatchReadiness.config.tariff"] = "tariff";
EN["dispatchReadiness.config.access"] = "access";
EN["dispatchReadiness.config.runtime"] = "runtime";
EN["dispatchReadiness.chip.adminApproval"] = "Admin approval";
EN["dispatchReadiness.chip.balanceGate"] = "balance gate";
EN["dispatchReadiness.chip.providerReadiness"] = "provider readiness";
EN["dispatchReadiness.chip.driverQueue"] = "queue locked";
EN["dispatchReadiness.chip.passengerTruth"] = "honest ETA";
EN["dispatchReadiness.footer"] = "002M adds dispatch-readiness preview: order access depends on Admin approval, balance, zones, provider/backend runtime and kernel-safe state; mobile does not start dispatch, GPS, payment, payout or fake assignment.";

EN["liveMap.title"] = "Live map control";
EN["liveMap.subtitle.passenger"] = "Map, traffic, radar and ETA as kernel-safe preview";
EN["liveMap.subtitle.driver"] = "Navigation, speed and zones only after approval/runtime";
EN["liveMap.status.uiOnly"] = "UI only";
EN["liveMap.status.kernelPreview"] = "kernel preview";
EN["liveMap.status.adminZone"] = "Admin zone";
EN["liveMap.status.runtimeLocked"] = "runtime locked";
EN["liveMap.status.noFakeGps"] = "no fake GPS";
EN["liveMap.status.adminReview"] = "Admin review";
EN["liveMap.status.routePreview"] = "route preview";
EN["liveMap.status.speedPreview"] = "speed preview";
EN["liveMap.status.noDispatch"] = "no dispatch";
EN["liveMap.hero.passenger.label"] = "Map without fake GPS";
EN["liveMap.hero.passenger.text"] = "Shows route, traffic and ETA as preview; live location starts only for a real approved trip.";
EN["liveMap.hero.driver.label"] = "Navigation after access";
EN["liveMap.hero.driver.text"] = "Driver receives live map only after Admin approval, balance, zone, provider/backend readiness and approved trip.";
EN["liveMap.hero.driver.ready"] = "ready";
EN["liveMap.hero.driver.locked"] = "locked";
EN["liveMap.hero.driver.unit"] = "map";
EN["liveMap.passenger.pickup.title"] = "Pickup point";
EN["liveMap.passenger.pickup.text"] = "Pickup/dropoff are preview only; real geolocation does not start from UI.";
EN["liveMap.passenger.traffic.title"] = "Traffic";
EN["liveMap.passenger.traffic.text"] = "Traffic layer depends on runtime/provider data and remains honest preview now.";
EN["liveMap.passenger.radar.title"] = "Radar";
EN["liveMap.passenger.radar.text"] = "Radar hints do not replace road rules and do not enable real navigation runtime.";
EN["liveMap.passenger.eta.title"] = "Honest ETA";
EN["liveMap.passenger.eta.text"] = "Pickup time is an estimate without fake driver assignment.";
EN["liveMap.driver.zone.title"] = "Work zone";
EN["liveMap.driver.zone.text"] = "City, airport, intercity and delivery come from Admin eligibility.";
EN["liveMap.driver.route.title"] = "Route";
EN["liveMap.driver.route.text"] = "Route preview does not mean a real order or live navigation.";
EN["liveMap.driver.speed.title"] = "Speed and safety";
EN["liveMap.driver.speed.text"] = "Speed/radar hints are UI preview only until approved runtime.";
EN["liveMap.driver.live.title"] = "Live trip lock";
EN["liveMap.driver.live.text"] = "GPS, dispatch and navigation start only after backend/provider/Admin approval.";
EN["liveMap.chip.traffic"] = "traffic preview";
EN["liveMap.chip.radar"] = "radar hints";
EN["liveMap.chip.safePickup"] = "safe pickup";
EN["liveMap.chip.noFakeGps"] = "no fake GPS";
EN["liveMap.chip.zone"] = "Admin zone";
EN["liveMap.chip.speed"] = "speed preview";
EN["liveMap.chip.navigation"] = "navigation locked";
EN["liveMap.chip.noDispatch"] = "no dispatch runtime";
EN["liveMap.config.source"] = "source";
EN["liveMap.config.kernel"] = "Taxi kernel";
EN["liveMap.config.runtime"] = "runtime";
EN["liveMap.config.dispatch"] = "dispatch";
EN["liveMap.footer"] = "002N adds live-map/control preview: map, traffic, radar, speed and ETA stay kernel-safe UI; mobile does not start GPS, dispatch, provider, backend/Admin route, payment, payout or fake assignment.";

EN["arrivalCoord.title"] = "Contact and pickup coordination";
EN["arrivalCoord.subtitle.passenger"] = "Meeting point, message, waiting and support as kernel-safe preview only";
EN["arrivalCoord.subtitle.driver"] = "Arrived status, contact and pickup coordination without direct call/runtime";
EN["arrivalCoord.status.uiOnly"] = "UI only";
EN["arrivalCoord.status.pickupPreview"] = "pickup preview";
EN["arrivalCoord.status.messengerLocked"] = "Messenger locked";
EN["arrivalCoord.status.waitPreview"] = "waiting preview";
EN["arrivalCoord.status.safeSummary"] = "safe summary";
EN["arrivalCoord.status.readyPreview"] = "ready preview";
EN["arrivalCoord.status.adminReview"] = "Admin review";
EN["arrivalCoord.status.routePreview"] = "route preview";
EN["arrivalCoord.status.adminLocked"] = "Admin locked";
EN["arrivalCoord.hero.passenger.label"] = "Meet without fake call";
EN["arrivalCoord.hero.passenger.text"] = "Passenger sees meeting point, message and waiting as preview only until approved trip/runtime.";
EN["arrivalCoord.hero.driver.label"] = "Pickup coordination";
EN["arrivalCoord.hero.driver.text"] = "Driver sees contact and arrival flow only after Admin approval, balance, zone and runtime readiness.";
EN["arrivalCoord.hero.driver.ready"] = "ready";
EN["arrivalCoord.hero.driver.review"] = "review";
EN["arrivalCoord.hero.driver.unit"] = "Admin";
EN["arrivalCoord.meet.passenger.title"] = "Meeting point";
EN["arrivalCoord.meet.passenger.text"] = "Entrance, landmark and safe pickup zone are hints, not live GPS.";
EN["arrivalCoord.meet.driver.title"] = "I am here";
EN["arrivalCoord.meet.driver.text"] = "Arrival status is not sent from UI without real approved trip and backend state.";
EN["arrivalCoord.meet.delivery.text"] = "For delivery, handoff point, recipient and contact remain masked/preview until backend/provider readiness.";
EN["arrivalCoord.passenger.meet.title"] = "Where to meet";
EN["arrivalCoord.passenger.meet.text"] = "Pickup note, entrance and safe spot remain UI hints without live dispatch.";
EN["arrivalCoord.passenger.message.title"] = "Message / call";
EN["arrivalCoord.passenger.message.text"] = "Contact goes through Messenger/kernel after approval; mobile does not perform direct call/SMS/provider action.";
EN["arrivalCoord.passenger.wait.title"] = "Waiting";
EN["arrivalCoord.passenger.wait.text"] = "Waiting rules, fees and grace time come from Admin/backend config, not mobile hardcode.";
EN["arrivalCoord.passenger.support.title"] = "Support";
EN["arrivalCoord.passenger.support.text"] = "Complaint, dispute or appeal are shown as safe entry without raw evidence in mobile.";
EN["arrivalCoord.driver.arrived.title"] = "I am here";
EN["arrivalCoord.driver.arrived.text"] = "Arrival status is published only after a real order; now it is preview without fake completed.";
EN["arrivalCoord.driver.contact.title"] = "Contact passenger";
EN["arrivalCoord.driver.contact.text"] = "Chat/call through protected Messenger/kernel without direct phone exposure from UI.";
EN["arrivalCoord.driver.pickup.title"] = "Pickup route";
EN["arrivalCoord.driver.pickup.text"] = "Route to meeting point does not start live navigation until approved runtime.";
EN["arrivalCoord.driver.issue.title"] = "Pickup issue";
EN["arrivalCoord.driver.issue.text"] = "No-show, cancellation or dispute goes to Admin/Sabi AI review, not fake sanction.";
EN["arrivalCoord.action.message"] = "message preview";
EN["arrivalCoord.action.call"] = "call locked";
EN["arrivalCoord.action.safety"] = "support safe";
EN["arrivalCoord.chip.meetPoint"] = "meeting point";
EN["arrivalCoord.chip.safeMessenger"] = "safe Messenger";
EN["arrivalCoord.chip.noFakeCall"] = "no fake call";
EN["arrivalCoord.chip.waitingPreview"] = "waiting preview";
EN["arrivalCoord.chip.driverArrived"] = "arrival locked";
EN["arrivalCoord.chip.adminReview"] = "Admin review";
EN["arrivalCoord.chip.noDirectCall"] = "no direct call";
EN["arrivalCoord.chip.kernelState"] = "kernel state";
EN["arrivalCoord.footer"] = "002O adds contact and pickup coordination: message, call, arrival, waiting and pickup issue remain kernel-safe UI; mobile does not start direct call/SMS, backend route, live GPS, dispatch, payment, payout or fake approval.";


EN["tripProgress.title"] = "Trip progress without fake completion";
EN["tripProgress.subtitle.passenger"] = "Order, wait, start and finish states as kernel-safe preview only";
EN["tripProgress.subtitle.driver"] = "Queue, pickup, start and settlement after Admin/backend/runtime gates";
EN["tripProgress.status.preview"] = "preview";
EN["tripProgress.status.liveLocked"] = "live locked";
EN["tripProgress.status.driverReadyPreview"] = "ready preview";
EN["tripProgress.status.adminBalanceLocked"] = "Admin/balance";
EN["tripProgress.status.waitingPreview"] = "waiting preview";
EN["tripProgress.status.noFakeStart"] = "no fake start";
EN["tripProgress.status.noFakeComplete"] = "no fake finish";
EN["tripProgress.status.receiptLocked"] = "receipt locked";
EN["tripProgress.status.arrivalLocked"] = "arrival locked";
EN["tripProgress.status.payoutLocked"] = "payout locked";
EN["tripProgress.hero.passenger.label"] = "Trip cannot finish by fake UI";
EN["tripProgress.hero.passenger.text"] = "UI shows calm progress: request, match, pickup, ride and finish only after real backend/provider states.";
EN["tripProgress.hero.driver.label"] = "Driver working state";
EN["tripProgress.hero.driver.text"] = "Driver passes Admin approval, balance gate, zone eligibility and runtime readiness before queue and trip.";
EN["tripProgress.hero.driver.ready"] = "ready";
EN["tripProgress.hero.driver.review"] = "review";
EN["tripProgress.hero.driver.unit"] = "Admin";
EN["tripProgress.passenger.request.title"] = "Request";
EN["tripProgress.passenger.request.text"] = "Order creation is not sent without backend/provider and Admin-config tariff.";
EN["tripProgress.passenger.match.title"] = "Matching";
EN["tripProgress.passenger.match.text"] = "Mobile cannot show driver found without real matching/dispatch.";
EN["tripProgress.passenger.pickup.title"] = "Pickup";
EN["tripProgress.passenger.pickup.text"] = "Pickup and waiting do not start without approved trip runtime.";
EN["tripProgress.passenger.finish.title"] = "Finish";
EN["tripProgress.passenger.finish.text"] = "Completion, receipt and rating are available only after verified ride.";
EN["tripProgress.driver.access.title"] = "Access";
EN["tripProgress.driver.access.text"] = "Line access follows Admin approval, documents, zone and balance.";
EN["tripProgress.driver.queue.title"] = "Queue";
EN["tripProgress.driver.queue.text"] = "Orders do not arrive while provider/backend runtime is locked.";
EN["tripProgress.driver.pickup.title"] = "Pickup";
EN["tripProgress.driver.pickup.text"] = "Navigation and arrival status require a real order.";
EN["tripProgress.driver.settle.title"] = "Settlement";
EN["tripProgress.driver.settle.text"] = "Commission and payout remain Admin-configured/locked until backend ledger.";
EN["tripProgress.passenger.waiting.title"] = "Waiting";
EN["tripProgress.passenger.waiting.text"] = "Waiting rules and paid waiting come from Admin/backend, not mobile hardcode.";
EN["tripProgress.passenger.waiting.delivery.text"] = "For delivery, recipient waiting and handoff remain preview until backend/provider.";
EN["tripProgress.passenger.start.title"] = "Trip start";
EN["tripProgress.passenger.start.text"] = "Trip start is not shown without approved driver, live GPS and backend trip state.";
EN["tripProgress.passenger.complete.title"] = "Finish";
EN["tripProgress.passenger.complete.text"] = "Finish, payment, rating and points appear only after verified completion.";
EN["tripProgress.passenger.receipt.title"] = "Receipt";
EN["tripProgress.passenger.receipt.text"] = "Receipt and dispute are available after real backend receipt, without fake payment/refund.";
EN["tripProgress.driver.online.title"] = "Online";
EN["tripProgress.driver.online.text"] = "Online status does not open queue without approval, balance, zone and provider runtime.";
EN["tripProgress.driver.arrive.title"] = "I am here";
EN["tripProgress.driver.arrive.text"] = "Arrival is published only after real order and kernel event.";
EN["tripProgress.driver.finish.title"] = "Complete";
EN["tripProgress.driver.finish.text"] = "Driver cannot fake complete a trip; backend must verify route/status.";
EN["tripProgress.driver.settlement.title"] = "Settlement";
EN["tripProgress.driver.settlement.text"] = "Payout, commission and balance change only through backend/Admin ledger.";
EN["tripProgress.truth.title"] = "Honest state machine";
EN["tripProgress.truth.text"] = "Mobile shows only safe states. Start, finish, charge, refund, points and sanctions do not happen in UI.";
EN["tripProgress.truth.delivery.text"] = "For delivery, proof, handoff, dispute and receipt also wait for backend/provider and Admin review.";
EN["tripProgress.chip.kernelState"] = "kernel state";
EN["tripProgress.chip.noFakeStart"] = "no fake start";
EN["tripProgress.chip.noFakeFinish"] = "no fake finish";
EN["tripProgress.chip.adminConfig"] = "Admin config";
EN["tripProgress.chip.adminApproval"] = "Admin approval";
EN["tripProgress.chip.balanceGate"] = "balance gate";
EN["tripProgress.chip.providerRuntime"] = "provider runtime";
EN["tripProgress.chip.noPayout"] = "payout locked";
EN["tripProgress.footer"] = "002P adds trip-progress/ride-state preview: request, matching, pickup, start, waiting, finish and receipt remain kernel-safe UI; mobile does not create fake trip, fake complete, payment, refund, payout, DB or dispatch.";

EN["cancelFair.title"] = "Cancellation and fairness without fake penalties";
EN["cancelFair.subtitle.passenger"] = "Cancel, waiting, no-show and appeal as kernel-safe preview only";
EN["cancelFair.subtitle.driver"] = "Driver is protected by evidence/Admin review before penalty, cooldown or block";
EN["cancelFair.status.safeRules"] = "rules";
EN["cancelFair.status.matchingPreview"] = "matching preview";
EN["cancelFair.status.driverReadyPreview"] = "ready preview";
EN["cancelFair.status.adminReview"] = "Admin review";
EN["cancelFair.status.previewOnly"] = "preview only";
EN["cancelFair.status.aiReview"] = "Sabi AI review";
EN["cancelFair.status.appealOpen"] = "appeal open";
EN["cancelFair.status.noFakePenalty"] = "no fake penalty";
EN["cancelFair.status.safeEvidence"] = "safe evidence";
EN["cancelFair.status.locked"] = "locked";
EN["cancelFair.hero.passenger.label"] = "Cancel does not punish by UI button";
EN["cancelFair.hero.passenger.text"] = "Passenger sees cancellation, waiting and dispute rules, but points/penalties do not change without Admin/Sabi AI decision.";
EN["cancelFair.hero.passenger.delivery.text"] = "For delivery, cancellation, recipient no-show and handoff dispute remain preview until backend/Admin review.";
EN["cancelFair.hero.passenger.metric"] = "appeal";
EN["cancelFair.hero.driver.label"] = "Protect driver and passenger";
EN["cancelFair.hero.driver.ready.text"] = "Even when access looks ready, driver does not receive fake penalty: no-show, cancellation and dispute are reviewed.";
EN["cancelFair.hero.driver.review.text"] = "While application, balance or zone are not ready, cancellation and queue stay Admin review preview.";
EN["cancelFair.hero.driver.ready"] = "ready";
EN["cancelFair.hero.driver.review"] = "review";
EN["cancelFair.hero.unit"] = "fair";
EN["cancelFair.passenger.before.title"] = "Before matching";
EN["cancelFair.passenger.before.text"] = "Cancel before real matching stays safe UI preview without payment/refund.";
EN["cancelFair.passenger.matching.title"] = "During search";
EN["cancelFair.passenger.matching.text"] = "UI cannot show driver found or penalty while dispatch/provider runtime is locked.";
EN["cancelFair.passenger.pickup.title"] = "Pickup / waiting";
EN["cancelFair.passenger.pickup.text"] = "Waiting, no-show and pickup dispute require evidence, daily window and Admin review.";
EN["cancelFair.passenger.after.title"] = "After ride";
EN["cancelFair.passenger.after.text"] = "Complaint, rating, receipt and appeal are available only after verified ride/backend state.";
EN["cancelFair.driver.review.title"] = "Application/access";
EN["cancelFair.driver.review.text"] = "Park/driver waits for Admin approval; cancellation does not open queue by itself.";
EN["cancelFair.driver.queue.title"] = "Queue";
EN["cancelFair.driver.queue.text"] = "Orders, refusal and no-show do not work without approved runtime/provider readiness.";
EN["cancelFair.driver.pickup.title"] = "At pickup";
EN["cancelFair.driver.pickup.text"] = "Delay, no-show or conflict are stored as safe evidence preview.";
EN["cancelFair.driver.settle.title"] = "After case";
EN["cancelFair.driver.settle.text"] = "Points, cooldown, reward freeze and recovery publish only after Admin locked decision.";
EN["cancelFair.passenger.clean.title"] = "Clean cancel";
EN["cancelFair.passenger.clean.text"] = "UI explains rules without charge, refund or fake status change.";
EN["cancelFair.passenger.noshow.title"] = "No-show";
EN["cancelFair.passenger.noshow.text"] = "No-show does not become a penalty without evidence bundle and review.";
EN["cancelFair.passenger.arranged.title"] = "Arranged cancellation";
EN["cancelFair.passenger.arranged.text"] = "Arranged cancellation and trip after cancellation are marked as violation candidates, not ready punishment.";
EN["cancelFair.passenger.appeal.title"] = "Appeal";
EN["cancelFair.passenger.appeal.text"] = "Participant sees a calm explanation entry; raw evidence stays in Admin/foundation.";
EN["cancelFair.driver.cancel.title"] = "Driver cancel";
EN["cancelFair.driver.cancel.text"] = "Cancel reason goes to review; mobile does not remove points or close access.";
EN["cancelFair.driver.noshow.title"] = "Passenger no-show";
EN["cancelFair.driver.noshow.text"] = "Passenger no-show is checked by time, place and evidence, not by button.";
EN["cancelFair.driver.issue.title"] = "Pickup dispute";
EN["cancelFair.driver.issue.text"] = "Pickup issue goes through Messenger/kernel summary and Admin/Sabi AI review.";
EN["cancelFair.driver.appeal.title"] = "Decision protection";
EN["cancelFair.driver.appeal.text"] = "Before heavy actions, driver/passenger gets explanation/appeal path.";
EN["cancelFair.truth.title"] = "Only honest outcome";
EN["cancelFair.truth.passenger.text"] = "Mobile does not apply fake sanction, refund, reward, cooldown or block; it shows next step and review status.";
EN["cancelFair.truth.driver.text"] = "Driver balance, queue access, score and payout do not change from UI after complaint or cancel.";
EN["cancelFair.chip.dailyWindow"] = "daily window";
EN["cancelFair.chip.noFakePenalty"] = "no fake penalty";
EN["cancelFair.chip.adminReview"] = "Admin review";
EN["cancelFair.chip.appeal"] = "appeal";
EN["cancelFair.chip.driverProtected"] = "driver protected";
EN["cancelFair.chip.noShowReview"] = "no-show review";
EN["cancelFair.chip.arrangedCancel"] = "arranged cancel";
EN["cancelFair.chip.noPayoutChange"] = "no payout change";
EN["cancelFair.footer"] = "002Q adds cancellation/fairness preview: cancel, no-show, waiting, arranged cancellation, trip after cancellation and appeal remain kernel-safe UI; mobile does not apply fake penalties, refund, reward, DB, dispatch, payment or payout.";

EN["leagueVisible.title"] = "Leagues and prizes: honest preview";
EN["leagueVisible.subtitle.passenger"] = "Country, points, stars and prizes only after verified ride/Admin rules";
EN["leagueVisible.subtitle.driver"] = "League access after Admin approval, balance and verified trips";
EN["leagueVisible.status.previewOnly"] = "preview only";
EN["leagueVisible.status.reviewReady"] = "review ready";
EN["leagueVisible.status.driverEligiblePreview"] = "eligible preview";
EN["leagueVisible.status.adminReview"] = "Admin review";
EN["leagueVisible.status.countrySeparated"] = "country separated";
EN["leagueVisible.status.verifiedRideOnly"] = "verified ride only";
EN["leagueVisible.status.adminAiReview"] = "Admin/Sabi AI";
EN["leagueVisible.status.noFakeReward"] = "no fake reward";
EN["leagueVisible.status.payoutLocked"] = "payout locked";
EN["leagueVisible.status.locked"] = "locked";
EN["leagueVisible.hero.passenger.label"] = "Passenger league";
EN["leagueVisible.hero.passenger.text"] = "Points, stars, ride culture and prizes stay honest preview until verified backend state.";
EN["leagueVisible.hero.passenger.delivery.text"] = "Delivery is counted only after verified delivery state, with no fake points and no public shaming.";
EN["leagueVisible.hero.driver.label"] = "Driver league";
EN["leagueVisible.hero.driver.ready.text"] = "Driver sees eligibility preview: country, balance, quality, verified trips and Admin-config rules.";
EN["leagueVisible.hero.driver.review.text"] = "Until application, balance and zone are approved, league and order queue remain locked preview.";
EN["leagueVisible.hero.driver.ready"] = "ready";
EN["leagueVisible.hero.driver.review"] = "review";
EN["leagueVisible.hero.unit"] = "state";
EN["leagueVisible.passenger.country.title"] = "Country league";
EN["leagueVisible.passenger.country.text"] = "Passengers and drivers are compared by country, without mixing markets and zones.";
EN["leagueVisible.passenger.stars.title"] = "Stars after ride";
EN["leagueVisible.passenger.stars.text"] = "Stars and reviews appear only after verified ride, with no fake rating.";
EN["leagueVisible.passenger.fair.title"] = "Complaints checked";
EN["leagueVisible.passenger.fair.text"] = "All complaints, false reports, cancellations and appeals go through daily Sabi AI/Admin review.";
EN["leagueVisible.passenger.prize.title"] = "Prizes honestly";
EN["leagueVisible.passenger.prize.text"] = "Top prize eligibility is not issued by UI; reward release needs Admin/legal/finance review.";
EN["leagueVisible.driver.country.title"] = "Work country";
EN["leagueVisible.driver.country.text"] = "Driver participates only in approved country/zone configured in Admin.";
EN["leagueVisible.driver.orders.title"] = "Orders and points";
EN["leagueVisible.driver.orders.text"] = "Points come from verified trips/orders, not UI preview or fake assignment.";
EN["leagueVisible.driver.quality.title"] = "Culture and cleanliness";
EN["leagueVisible.driver.quality.text"] = "Politeness, cleanliness, safety and stars affect score after review-ready events.";
EN["leagueVisible.driver.reward.title"] = "Prize and payout";
EN["leagueVisible.driver.reward.text"] = "Prize/payout stay locked until official decision, compliance and Admin approval.";
EN["leagueVisible.audit.verified.title"] = "Verified ride";
EN["leagueVisible.audit.verified.text"] = "Points and stars appear only after backend verified trip/order state.";
EN["leagueVisible.audit.polite.title"] = "Culture";
EN["leagueVisible.audit.polite.text"] = "Politeness, cleanliness and safety are shown as safe preview without mutation.";
EN["leagueVisible.audit.appeal.title"] = "Appeal";
EN["leagueVisible.audit.appeal.text"] = "Disputed points and complaints go through explanation/appeal, not instant sanction.";
EN["leagueVisible.audit.approval.title"] = "Admin approval";
EN["leagueVisible.audit.approval.text"] = "Driver/park must be approved in Admin before league/order access becomes real.";
EN["leagueVisible.audit.balance.title"] = "Balance access";
EN["leagueVisible.audit.balance.text"] = "Driver balance gate controls order access; UI does not debit or top up balance.";
EN["leagueVisible.audit.quality.title"] = "Quality review";
EN["leagueVisible.audit.quality.text"] = "Quality score waits for verified ride, complaint checks and Admin/Sabi AI fairness.";
EN["leagueVisible.truth.title"] = "No fake points/prize";
EN["leagueVisible.truth.passenger.text"] = "Mobile does not add points, issue prizes or change rating; it shows only kernel-safe status.";
EN["leagueVisible.truth.driver.text"] = "Driver score, prizes, payout and access do not change from UI; everything waits for backend/Admin ledger.";
EN["leagueVisible.chip.country"] = "country league";
EN["leagueVisible.chip.verified"] = "verified ride";
EN["leagueVisible.chip.noFakePoints"] = "no fake points";
EN["leagueVisible.chip.adminReview"] = "Admin review";
EN["leagueVisible.chip.driver"] = "driver league";
EN["leagueVisible.chip.balance"] = "balance gate";
EN["leagueVisible.chip.adminConfigured"] = "Admin config";
EN["leagueVisible.chip.noPayout"] = "no payout UI";
EN["leagueVisible.footer"] = "002R adds league/rewards visibility preview: country, points, stars, fairness, prizes and eligibility are honest, but mobile does not add points, issue prize, pay out, change rating or enable runtime.";


EN["rideHistory.title"] = "Ride history and receipt center";
EN["rideHistory.subtitle.passenger"] = "Receipt, dispute, refund status and history only after verified ride";
EN["rideHistory.subtitle.driver"] = "Ledger, settlement and reviews only after backend/Admin state";
EN["rideHistory.status.safeArchive"] = "safe archive";
EN["rideHistory.status.verifiedOnly"] = "verified only";
EN["rideHistory.status.noFakeReceipt"] = "no fake receipt";
EN["rideHistory.status.adminReview"] = "Admin review";
EN["rideHistory.status.noRefundRuntime"] = "refund locked";
EN["rideHistory.status.backendLedger"] = "backend ledger";
EN["rideHistory.status.noPayoutRuntime"] = "payout locked";
EN["rideHistory.status.locked"] = "locked";
EN["rideHistory.hero.passenger.label"] = "History without fake receipt";
EN["rideHistory.hero.passenger.text"] = "Passenger sees history, receipt, dispute and refund status only after verified ride/backend receipt state.";
EN["rideHistory.hero.passenger.delivery.text"] = "For delivery, receipt, proof, dispute and refund path stay preview until backend/Admin/provider readiness.";
EN["rideHistory.hero.driver.label"] = "Driver ledger preview";
EN["rideHistory.hero.driver.ready.text"] = "Driver sees ledger/settlement preview, but balance, Admin commission, payout and dispute go through backend/Admin.";
EN["rideHistory.hero.driver.review.text"] = "Until Admin approval, balance or provider readiness is ready, history and income stay safe preview.";
EN["rideHistory.hero.unit"] = "receipt";
EN["rideHistory.passenger.history.title"] = "History";
EN["rideHistory.passenger.history.text"] = "Ride appears in history only after verified completion from backend/provider.";
EN["rideHistory.passenger.history.delivery.text"] = "Delivery appears in history only after verified handoff/proof from backend/provider.";
EN["rideHistory.passenger.receipt.title"] = "Receipt";
EN["rideHistory.passenger.receipt.text"] = "Receipt is not created by UI; amount, tariff and commission come from Admin/backend ledger.";
EN["rideHistory.passenger.dispute.title"] = "Dispute";
EN["rideHistory.passenger.dispute.text"] = "Complaint, cancellation, no-show and dispute go to Sabi AI/Admin review with redacted mobile summary.";
EN["rideHistory.passenger.refund.title"] = "Refund status";
EN["rideHistory.passenger.refund.text"] = "Refund does not start from mobile UI; status appears only after payment/backend decision.";
EN["rideHistory.driver.ledger.title"] = "Ledger";
EN["rideHistory.driver.ledger.text"] = "Income, Admin commission and net preview do not mutate Wallet without backend verified completion.";
EN["rideHistory.driver.settlement.title"] = "Settlement";
EN["rideHistory.driver.settlement.text"] = "Settlement/payout stay locked until Admin/legal/finance/provider readiness.";
EN["rideHistory.driver.review.title"] = "Reviews";
EN["rideHistory.driver.review.text"] = "Reviews and stars appear only after verified ride and fairness checks.";
EN["rideHistory.driver.appeal.title"] = "Appeal";
EN["rideHistory.driver.appeal.text"] = "Driver can see safe appeal entry; raw evidence stays on Admin/foundation side.";
EN["rideHistory.timeline.verified.title"] = "Verified ride";
EN["rideHistory.timeline.verified.passenger.text"] = "History opens only after real backend verified ride/order state.";
EN["rideHistory.timeline.verified.driver.text"] = "Driver ledger waits for verified trip/order completion, not UI button.";
EN["rideHistory.timeline.receipt.title"] = "Receipt";
EN["rideHistory.timeline.receipt.passenger.text"] = "Receipt is built from backend/Admin tariffs, payment state and ledger.";
EN["rideHistory.timeline.dispute.title"] = "Dispute";
EN["rideHistory.timeline.dispute.passenger.text"] = "Dispute, refund, complaint and appeal do not change money/points without review.";
EN["rideHistory.timeline.ledger.title"] = "Ledger";
EN["rideHistory.timeline.ledger.driver.text"] = "Commission and net income come from Admin-configured ledger, not hardcoded mobile.";
EN["rideHistory.timeline.settlement.title"] = "Settlement";
EN["rideHistory.timeline.settlement.driver.text"] = "Payout and reward release need Admin/legal/finance/provider approval.";
EN["rideHistory.truth.title"] = "No fake history/payment";
EN["rideHistory.truth.passenger.text"] = "Mobile does not create fake receipt, fake refund, fake payment or fake completed trip; everything waits for backend/Admin state.";
EN["rideHistory.truth.driver.text"] = "Mobile does not create fake income, fake payout, fake commission debit or fake settlement; everything waits for ledger/Admin state.";
EN["rideHistory.chip.verified"] = "verified only";
EN["rideHistory.chip.receipt"] = "backend receipt";
EN["rideHistory.chip.noRefundRuntime"] = "no refund UI";
EN["rideHistory.chip.adminReview"] = "Admin review";
EN["rideHistory.chip.backendLedger"] = "backend ledger";
EN["rideHistory.chip.adminCommission"] = "Admin %";
EN["rideHistory.chip.noPayout"] = "no payout UI";
EN["rideHistory.chip.noFakeIncome"] = "no fake income";
EN["rideHistory.footer"] = "002T adds history/receipt center: history, receipt, dispute, refund status, ledger and settlement are honest, but mobile does not complete trip, create receipt, charge money, refund, pay payout or mutate Wallet.";

const UZ: Record<Keys, string> = { ...RU };
UZ["brand.title"] = "Sabi Taksi";
UZ["mode.driver"] = "Haydovchi";
UZ["mode.passenger"] = "Yo‘lovchi";
UZ["button.topUp"] = "Balansni to‘ldirish";
UZ["gate.driver.balance"] = "Balans yetarli emas: haydovchi buyurtma olmaydi.";

const ZH: Record<Keys, string> = { ...RU };
ZH["brand.title"] = "Sabi 出行";
ZH["mode.passenger"] = "乘客";
ZH["mode.driver"] = "司机";
ZH["button.topUp"] = "充值余额";
ZH["gate.driver.balance"] = "司机余额不足，无法接单。";

const DICTIONARY: Record<TaxiLocale, Record<Keys, string>> = {
  ru: RU,
  en: EN,
  uz: UZ,
  zh: ZH,
};

function resolveTaxiLocale(language: string): TaxiLocale {
  if (language === "en" || language === "uz" || language === "zh") return language;
  return "ru";
}


EN["trustProfile.title"] = "Trust profile and verification";
EN["trustProfile.subtitle.passenger"] = "Driver, car, park and rating only after Admin-approved state";
EN["trustProfile.subtitle.driver"] = "Documents, car and passenger trust go through review without fake approval";
EN["trustProfile.status.adminPreview"] = "Admin preview";
EN["trustProfile.status.verifiedPreview"] = "verified preview";
EN["trustProfile.status.readyPreview"] = "ready preview";
EN["trustProfile.status.adminReview"] = "Admin review";
EN["trustProfile.status.adminApprovedOnly"] = "approved only";
EN["trustProfile.status.vehicleReview"] = "vehicle review";
EN["trustProfile.status.parkReview"] = "park review";
EN["trustProfile.status.verifiedRideOnly"] = "verified ride";
EN["trustProfile.status.documents"] = "documents";
EN["trustProfile.status.safeSummary"] = "safe summary";
EN["trustProfile.status.locked"] = "locked";
EN["trustProfile.hero.passenger.label"] = "Verified driver";
EN["trustProfile.hero.passenger.text"] = "Passenger sees driver profile, vehicle and fleet only as Admin-approved preview without fake assignment.";
EN["trustProfile.hero.passenger.delivery.text"] = "For delivery, courier, vehicle/walking mode and recipient stay masked preview until approved backend/provider state.";
EN["trustProfile.hero.driver.label"] = "Access profile";
EN["trustProfile.hero.driver.ready.text"] = "Driver sees trust profile preview after application, documents, vehicle, balance and Admin rules.";
EN["trustProfile.hero.driver.review.text"] = "Until Admin reviews the application, the profile stays pending and does not open the order queue.";
EN["trustProfile.hero.driver.ready"] = "ready";
EN["trustProfile.hero.driver.review"] = "review";
EN["trustProfile.hero.unit"] = "trust";
EN["trustProfile.passenger.driver.title"] = "Driver";
EN["trustProfile.passenger.driver.text"] = "Name, rating and status show only after approved match/backend state, not from UI.";
EN["trustProfile.passenger.vehicle.title"] = "Vehicle";
EN["trustProfile.passenger.vehicle.text"] = "Make, plate, color and class require Admin vehicle eligibility and provider readiness.";
EN["trustProfile.passenger.park.title"] = "Taxi park";
EN["trustProfile.passenger.park.text"] = "Fleet or independent status appears after Admin review, without fake approved badge.";
EN["trustProfile.passenger.rating.title"] = "Reviews";
EN["trustProfile.passenger.rating.text"] = "Rating, stars and compliments appear only after verified ride and fairness checks.";
EN["trustProfile.driver.identity.title"] = "Identity";
EN["trustProfile.driver.identity.text"] = "Profile, country, role and contact data are checked on Admin/foundation side.";
EN["trustProfile.driver.vehicle.title"] = "Car and class";
EN["trustProfile.driver.vehicle.text"] = "Vehicle, photo, tariff class, zone and delivery/intercity eligibility go through Admin approval.";
EN["trustProfile.driver.docs.title"] = "Documents";
EN["trustProfile.driver.docs.text"] = "Licenses, driving documents, insurance and safety checks stay pending until Admin decision.";
EN["trustProfile.driver.passenger.title"] = "Passenger trust";
EN["trustProfile.driver.passenger.text"] = "Driver sees only safe passenger summary; raw complaints/evidence stay in Admin/foundation.";
EN["trustProfile.audit.profile.title"] = "Profile";
EN["trustProfile.audit.profile.passenger.text"] = "Driver profile is published to passenger only after approved match and safe summary.";
EN["trustProfile.audit.profile.driver.text"] = "Driver/park profile goes through Admin review before order access.";
EN["trustProfile.audit.car.title"] = "Vehicle";
EN["trustProfile.audit.car.passenger.text"] = "Vehicle data is not faked and is not shown as assigned without dispatch/runtime.";
EN["trustProfile.audit.car.driver.text"] = "Vehicle eligibility controls tariffs, zones, airport/intercity/delivery access.";
EN["trustProfile.audit.safe.title"] = "Safety";
EN["trustProfile.audit.safe.passenger.text"] = "Safety badge does not replace real support, SOS, tracking or Admin review.";
EN["trustProfile.audit.safe.driver.text"] = "Complaint history and passenger trust are available only as redacted safe status.";
EN["trustProfile.truth.title"] = "No fake profile/approval";
EN["trustProfile.truth.passenger.text"] = "Mobile does not create fake verified driver, fake vehicle, fake fleet or fake rating; it waits for Admin/backend/provider state.";
EN["trustProfile.truth.driver.text"] = "Driver profile, queue access, documents, rating and passenger trust do not become approved from UI.";
EN["trustProfile.chip.driverVerified"] = "verified driver";
EN["trustProfile.chip.vehicleChecked"] = "vehicle checked";
EN["trustProfile.chip.noFakeProfile"] = "no fake profile";
EN["trustProfile.chip.safePassenger"] = "safe passenger";
EN["trustProfile.chip.adminDocs"] = "Admin docs";
EN["trustProfile.chip.vehicleEligibility"] = "vehicle eligibility";
EN["trustProfile.chip.passengerTrust"] = "passenger trust";
EN["trustProfile.chip.noFakeApproval"] = "no fake approval";
EN["trustProfile.footer"] = "002S adds trust profile preview: driver, passenger, car, park, documents, rating and safety summary are honest, but mobile does not fake approved profile, assignment, rating, documents, Wallet, payment, payout or runtime.";

export function useTaxiText() {
  const locale = resolveTaxiLocale(getAppLanguage());
  const dict = DICTIONARY[locale] ?? RU;

  return {
    t(key: string) {
      return dict[key as Keys] ?? RU[key as Keys] ?? key;
    },
    locale,
  };
}
