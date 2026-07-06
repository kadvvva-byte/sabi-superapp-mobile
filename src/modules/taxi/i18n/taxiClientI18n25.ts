// SABI TAXI 25 LANGUAGE RULE:
// Every new Taxi Client button, function, state, panel, label, error, status, and action
// must be added to all 25 languages in this file in the same patch.
// One selected language must render the whole Taxi screen without mixed-language UI.

﻿export type TaxiLang =
  | "ru"
  | "en"
  | "uz"
  | "zh"
  | "ar"
  | "tr"
  | "fr"
  | "de"
  | "es"
  | "it"
  | "pt"
  | "hi"
  | "ur"
  | "fa"
  | "ko"
  | "ja"
  | "id"
  | "ms"
  | "th"
  | "vi"
  | "kk"
  | "ky"
  | "tg"
  | "az"
  | "pl";

export const TAXI_LANGS: Array<{ code: TaxiLang; label: string; nativeName: string }> = [
  { code: "ru", label: "RU", nativeName: "Русский" },
  { code: "en", label: "EN", nativeName: "English" },
  { code: "uz", label: "UZ", nativeName: "O‘zbek" },
  { code: "zh", label: "ZH", nativeName: "中文" },
  { code: "ar", label: "AR", nativeName: "العربية" },
  { code: "tr", label: "TR", nativeName: "Türkçe" },
  { code: "fr", label: "FR", nativeName: "Français" },
  { code: "de", label: "DE", nativeName: "Deutsch" },
  { code: "es", label: "ES", nativeName: "Español" },
  { code: "it", label: "IT", nativeName: "Italiano" },
  { code: "pt", label: "PT", nativeName: "Português" },
  { code: "hi", label: "HI", nativeName: "हिन्दी" },
  { code: "ur", label: "UR", nativeName: "اردو" },
  { code: "fa", label: "FA", nativeName: "فارسی" },
  { code: "ko", label: "KO", nativeName: "한국어" },
  { code: "ja", label: "JA", nativeName: "日本語" },
  { code: "id", label: "ID", nativeName: "Indonesia" },
  { code: "ms", label: "MS", nativeName: "Melayu" },
  { code: "th", label: "TH", nativeName: "ไทย" },
  { code: "vi", label: "VI", nativeName: "Tiếng Việt" },
  { code: "kk", label: "KK", nativeName: "Қазақша" },
  { code: "ky", label: "KY", nativeName: "Кыргызча" },
  { code: "tg", label: "TG", nativeName: "Тоҷикӣ" },
  { code: "az", label: "AZ", nativeName: "Azərbaycanca" },
  { code: "pl", label: "PL", nativeName: "Polski" },
];

const keys = [
  "brand","geoOn","geoOff","from","to","currentLocation","enterAddress","service","tariff","mapWaiting",
  "mapPreview","routeEmpty","routeLoading","routeReady","addressNotFound","buildRoute","orderNow","calc",
  "payment","shield","profile","history","help","back","taxi","food","supermarket","marketplace","parcel",
  "cargo","intercity","economy","comfort","business","premium","delivery","deliveryTitle","walletTitle",
  "safetyTitle","starsTitle","receiptTitle","helpTitle","comment","sendReview","repeatRoute",
  "photoProof","receiverCode","finishTitle","paid",
  "mapLoading","mapUnavailable","mapKeyMissing",
  "collapsePanel","expandPanel"
] as const;

type TaxiCopyKey = (typeof keys)[number];
export type TaxiCopy = Record<TaxiCopyKey, string>;

const rows: Record<TaxiLang, string[]> = {
  ru: ["Sabi Taxi","Гео активно","Включите геолокацию","Откуда","Куда","Моё местоположение","Введите адрес","Сервис","Тариф","Ждём геолокацию","Google Maps · просмотр","Введите адрес назначения","Строим маршрут","Маршрут готов","Адрес не найден","Построить маршрут","Заказать","расчёт","Оплата","Shield","Профиль","История","Помощь","Назад","Такси","Еда","Супермаркет","Marketplace","Посылка","Груз","Межгород","Эконом","Комфорт","Бизнес","Premium","Доставка","Доставка","Sabi Wallet","Sabi AI Shield","Sabi Stars","Чек","Центр помощи","Комментарий","Отправить отзыв","Повторить маршрут", "Фото / proof", "Код получателя", "Оцените поездку", "Оплачено", "Карта загружается", "Карта временно недоступна", "Ключ карты не найден", "Свернуть", "Развернуть"],
  en: ["Sabi Taxi","Location active","Enable location","From","To","My location","Enter address","Service","Tariff","Waiting for location","Google Maps · preview","Enter destination","Building route","Route ready","Address not found","Build route","Order","calculation","Payment","Shield","Profile","History","Help","Back","Taxi","Food","Supermarket","Marketplace","Parcel","Cargo","Intercity","Economy","Comfort","Business","Premium","Delivery","Delivery","Sabi Wallet","Sabi AI Shield","Sabi Stars","Receipt","Help center","Comment","Send review","Repeat route", "Photo / proof", "Receiver code", "Rate the trip", "Paid", "Map is loading", "Map is temporarily unavailable", "Map key not found", "Collapse", "Expand"],
  uz: ["Sabi Taxi","Geolokatsiya faol","Geolokatsiyani yoqing","Qayerdan","Qayerga","Mening joylashuvim","Manzil kiriting","Xizmat","Tarif","Geolokatsiya kutilmoqda","Google Maps · ko‘rish","Manzilni kiriting","Yo‘nalish qurilmoqda","Yo‘nalish tayyor","Manzil topilmadi","Yo‘nalish qurish","Buyurtma berish","hisoblash","To‘lov","Shield","Profil","Tarix","Yordam","Orqaga","Taksi","Ovqat","Supermarket","Marketplace","Jo‘natma","Yuk","Shaharlararo","Ekonom","Komfort","Biznes","Premium","Yetkazish","Yetkazish","Sabi Wallet","Sabi AI Shield","Sabi Stars","Chek","Yordam markazi","Izoh","Bahoni yuborish","Yo‘nalishni takrorlash", "Foto / dalil", "Qabul qiluvchi kodi", "Safarni baholang", "To‘landi", "Xarita yuklanmoqda", "Xarita vaqtincha mavjud emas", "Xarita kaliti topilmadi", "Yig‘ish", "Ochish"],
  zh: ["Sabi Taxi","定位已开启","开启定位","出发地","目的地","我的位置","输入地址","服务","车型","等待定位","Google Maps · 预览","输入目的地","正在规划路线","路线已完成","未找到地址","规划路线","下单","计算中","支付","Shield","个人资料","历史","帮助","返回","出租车","餐饮","超市","Marketplace","包裹","货运","城际","经济","舒适","商务","Premium","配送","配送","Sabi Wallet","Sabi AI Shield","Sabi Stars","收据","帮助中心","评论","提交评价","重复路线", "照片 / 凭证", "收件码", "评价行程", "已支付", "地图正在加载", "地图暂时不可用", "未找到地图密钥", "收起", "展开"],
  ar: ["Sabi Taxi","الموقع مفعل","فعّل الموقع","من","إلى","موقعي","أدخل العنوان","الخدمة","التعرفة","بانتظار الموقع","Google Maps · معاينة","أدخل الوجهة","جار بناء المسار","المسار جاهز","العنوان غير موجود","بناء المسار","اطلب الآن","حساب","الدفع","Shield","الملف الشخصي","السجل","المساعدة","رجوع","تاكسي","طعام","سوبرماركت","Marketplace","طرد","شحن","بين المدن","اقتصادي","مريح","أعمال","Premium","توصيل","توصيل","Sabi Wallet","Sabi AI Shield","Sabi Stars","إيصال","مركز المساعدة","تعليق","إرسال التقييم","تكرار المسار", "صورة / إثبات", "رمز المستلم", "قيّم الرحلة", "تم الدفع", "يتم تحميل الخريطة", "الخريطة غير متاحة مؤقتاً", "لم يتم العثور على مفتاح الخريطة", "طي", "توسيع"],
  tr: ["Sabi Taxi","Konum aktif","Konumu açın","Nereden","Nereye","Konumum","Adres girin","Hizmet","Tarife","Konum bekleniyor","Google Maps · önizleme","Varış adresini girin","Rota hazırlanıyor","Rota hazır","Adres bulunamadı","Rota oluştur","Sipariş ver","hesaplama","Ödeme","Shield","Profil","Geçmiş","Yardım","Geri","Taksi","Yemek","Süpermarket","Marketplace","Paket","Yük","Şehirlerarası","Ekonomi","Konfor","Business","Premium","Teslimat","Teslimat","Sabi Wallet","Sabi AI Shield","Sabi Stars","Fiş","Yardım merkezi","Yorum","Değerlendirme gönder","Rotayı tekrarla", "Fotoğraf / kanıt", "Alıcı kodu", "Yolculuğu değerlendir", "Ödendi", "Harita yükleniyor", "Harita geçici olarak kullanılamıyor", "Harita anahtarı bulunamadı", "Daralt", "Genişlet"],
  fr: ["Sabi Taxi","Position active","Activez la position","Départ","Arrivée","Ma position","Entrez une adresse","Service","Tarif","Position en attente","Google Maps · aperçu","Entrez la destination","Calcul de l’itinéraire","Itinéraire prêt","Adresse introuvable","Créer l’itinéraire","Commander","calcul","Paiement","Shield","Profil","Historique","Aide","Retour","Taxi","Repas","Supermarché","Marketplace","Colis","Fret","Interurbain","Éco","Confort","Business","Premium","Livraison","Livraison","Sabi Wallet","Sabi AI Shield","Sabi Stars","Reçu","Centre d’aide","Commentaire","Envoyer l’avis","Répéter l’itinéraire", "Photo / preuve", "Code destinataire", "Notez le trajet", "Payé", "La carte se charge", "Carte temporairement indisponible", "Clé de carte introuvable", "Réduire", "Déployer"],
  de: ["Sabi Taxi","Standort aktiv","Standort aktivieren","Von","Nach","Mein Standort","Adresse eingeben","Dienst","Tarif","Warte auf Standort","Google Maps · Vorschau","Ziel eingeben","Route wird erstellt","Route bereit","Adresse nicht gefunden","Route erstellen","Bestellen","Berechnung","Zahlung","Shield","Profil","Verlauf","Hilfe","Zurück","Taxi","Essen","Supermarkt","Marketplace","Paket","Fracht","Fernfahrt","Economy","Komfort","Business","Premium","Lieferung","Lieferung","Sabi Wallet","Sabi AI Shield","Sabi Stars","Beleg","Hilfezentrum","Kommentar","Bewertung senden","Route wiederholen", "Foto / Nachweis", "Empfängercode", "Fahrt bewerten", "Bezahlt", "Karte wird geladen", "Karte vorübergehend nicht verfügbar", "Kartenschlüssel nicht gefunden", "Einklappen", "Ausklappen"],
  es: ["Sabi Taxi","Ubicación activa","Activa la ubicación","Desde","Hasta","Mi ubicación","Introduce dirección","Servicio","Tarifa","Esperando ubicación","Google Maps · vista previa","Introduce destino","Creando ruta","Ruta lista","Dirección no encontrada","Crear ruta","Pedir","cálculo","Pago","Shield","Perfil","Historial","Ayuda","Volver","Taxi","Comida","Supermercado","Marketplace","Paquete","Carga","Interurbano","Económico","Confort","Business","Premium","Entrega","Entrega","Sabi Wallet","Sabi AI Shield","Sabi Stars","Recibo","Centro de ayuda","Comentario","Enviar reseña","Repetir ruta", "Foto / prueba", "Código del destinatario", "Valora el viaje", "Pagado", "El mapa se está cargando", "Mapa temporalmente no disponible", "Clave del mapa no encontrada", "Contraer", "Expandir"],
  it: ["Sabi Taxi","Posizione attiva","Attiva posizione","Da","A","La mia posizione","Inserisci indirizzo","Servizio","Tariffa","In attesa posizione","Google Maps · anteprima","Inserisci destinazione","Creazione percorso","Percorso pronto","Indirizzo non trovato","Crea percorso","Ordina","calcolo","Pagamento","Shield","Profilo","Cronologia","Aiuto","Indietro","Taxi","Cibo","Supermercato","Marketplace","Pacco","Cargo","Intercity","Economy","Comfort","Business","Premium","Consegna","Consegna","Sabi Wallet","Sabi AI Shield","Sabi Stars","Ricevuta","Centro assistenza","Commento","Invia recensione","Ripeti percorso", "Foto / prova", "Codice destinatario", "Valuta la corsa", "Pagato", "Mappa in caricamento", "Mappa temporaneamente non disponibile", "Chiave mappa non trovata", "Comprimi", "Espandi"],
  pt: ["Sabi Taxi","Localização ativa","Ative a localização","De","Para","Minha localização","Digite o endereço","Serviço","Tarifa","Aguardando localização","Google Maps · prévia","Digite o destino","Criando rota","Rota pronta","Endereço não encontrado","Criar rota","Pedir","cálculo","Pagamento","Shield","Perfil","Histórico","Ajuda","Voltar","Táxi","Comida","Supermercado","Marketplace","Encomenda","Carga","Intermunicipal","Econômico","Conforto","Business","Premium","Entrega","Entrega","Sabi Wallet","Sabi AI Shield","Sabi Stars","Recibo","Central de ajuda","Comentário","Enviar avaliação","Repetir rota", "Foto / comprovante", "Código do destinatário", "Avalie a viagem", "Pago", "Mapa carregando", "Mapa temporariamente indisponível", "Chave do mapa não encontrada", "Recolher", "Expandir"],
  hi: ["Sabi Taxi","स्थान सक्रिय","स्थान चालू करें","कहाँ से","कहाँ तक","मेरा स्थान","पता दर्ज करें","सेवा","किराया","स्थान की प्रतीक्षा","Google Maps · पूर्वावलोकन","गंतव्य दर्ज करें","रूट बन रहा है","रूट तैयार","पता नहीं मिला","रूट बनाएं","ऑर्डर करें","गणना","भुगतान","Shield","प्रोफ़ाइल","इतिहास","सहायता","वापस","टैक्सी","भोजन","सुपरमार्केट","Marketplace","पार्सल","कार्गो","शहरों के बीच","इकॉनमी","कम्फर्ट","बिजनेस","Premium","डिलीवरी","डिलीवरी","Sabi Wallet","Sabi AI Shield","Sabi Stars","रसीद","सहायता केंद्र","टिप्पणी","समीक्षा भेजें","रूट दोहराएं", "फ़ोटो / प्रमाण", "प्राप्तकर्ता कोड", "यात्रा का मूल्यांकन करें", "भुगतान हुआ", "मानचित्र लोड हो रहा है", "मानचित्र अस्थायी रूप से उपलब्ध नहीं है", "मानचित्र कुंजी नहीं मिली", "समेटें", "खोलें"],
  ur: ["Sabi Taxi","مقام فعال","مقام فعال کریں","کہاں سے","کہاں تک","میرا مقام","پتہ درج کریں","سروس","کرایہ","مقام کا انتظار","Google Maps · پیش منظر","منزل درج کریں","راستہ بن رہا ہے","راستہ تیار","پتہ نہیں ملا","راستہ بنائیں","آرڈر کریں","حساب","ادائیگی","Shield","پروفائل","تاریخ","مدد","واپس","ٹیکسی","کھانا","سپر مارکیٹ","Marketplace","پارسل","کارگو","شہر سے شہر","اکانومی","کمفرٹ","بزنس","Premium","ڈیلیوری","ڈیلیوری","Sabi Wallet","Sabi AI Shield","Sabi Stars","رسید","مدد مرکز","تبصرہ","ریویو بھیجیں","راستہ دہرائیں", "تصویر / ثبوت", "وصول کنندہ کوڈ", "سفر کی درجہ بندی کریں", "ادائیگی ہو گئی", "نقشہ لوڈ ہو رہا ہے", "نقشہ عارضی طور پر دستیاب نہیں", "نقشہ کلید نہیں ملی", "سکیڑیں", "کھولیں"],
  fa: ["Sabi Taxi","مکان فعال است","مکان را فعال کنید","از","به","مکان من","آدرس را وارد کنید","خدمت","تعرفه","در انتظار مکان","Google Maps · پیش‌نمایش","مقصد را وارد کنید","در حال ساخت مسیر","مسیر آماده است","آدرس پیدا نشد","ساخت مسیر","سفارش","محاسبه","پرداخت","Shield","پروفایل","تاریخچه","کمک","بازگشت","تاکسی","غذا","سوپرمارکت","Marketplace","بسته","بار","بین‌شهری","اقتصادی","راحت","بیزنس","Premium","تحویل","تحویل","Sabi Wallet","Sabi AI Shield","Sabi Stars","رسید","مرکز کمک","نظر","ارسال نظر","تکرار مسیر", "عکس / مدرک", "کد گیرنده", "سفر را ارزیابی کنید", "پرداخت شد", "نقشه در حال بارگذاری است", "نقشه موقتاً در دسترس نیست", "کلید نقشه پیدا نشد", "جمع کردن", "باز کردن"],
  ko: ["Sabi Taxi","위치 활성","위치를 켜세요","출발","도착","내 위치","주소 입력","서비스","요금제","위치 대기 중","Google Maps · 미리보기","목적지 입력","경로 생성 중","경로 준비됨","주소를 찾을 수 없음","경로 만들기","주문","계산","결제","Shield","프로필","기록","도움말","뒤로","택시","음식","슈퍼마켓","Marketplace","소포","화물","도시간","이코노미","컴포트","비즈니스","Premium","배송","배송","Sabi Wallet","Sabi AI Shield","Sabi Stars","영수증","도움말 센터","댓글","리뷰 보내기","경로 반복", "사진 / 증빙", "수령인 코드", "이동 평가", "결제됨", "지도를 불러오는 중", "지도를 일시적으로 사용할 수 없음", "지도 키를 찾을 수 없음", "접기", "펼치기"],
  ja: ["Sabi Taxi","位置情報オン","位置情報を有効にする","出発地","目的地","現在地","住所を入力","サービス","料金","位置情報待ち","Google Maps · プレビュー","目的地を入力","ルート作成中","ルート準備完了","住所が見つかりません","ルート作成","注文","計算","支払い","Shield","プロフィール","履歴","ヘルプ","戻る","タクシー","フード","スーパー","Marketplace","荷物","貨物","都市間","エコノミー","コンフォート","ビジネス","Premium","配送","配送","Sabi Wallet","Sabi AI Shield","Sabi Stars","領収書","ヘルプセンター","コメント","レビュー送信","ルートを繰り返す", "写真 / 証明", "受取人コード", "乗車を評価", "支払い済み", "地図を読み込み中", "地図は一時的に利用できません", "地図キーが見つかりません", "閉じる", "開く"],
  id: ["Sabi Taxi","Lokasi aktif","Aktifkan lokasi","Dari","Ke","Lokasi saya","Masukkan alamat","Layanan","Tarif","Menunggu lokasi","Google Maps · pratinjau","Masukkan tujuan","Membuat rute","Rute siap","Alamat tidak ditemukan","Buat rute","Pesan","hitung","Pembayaran","Shield","Profil","Riwayat","Bantuan","Kembali","Taksi","Makanan","Supermarket","Marketplace","Paket","Kargo","Antarkota","Ekonomi","Nyaman","Bisnis","Premium","Pengiriman","Pengiriman","Sabi Wallet","Sabi AI Shield","Sabi Stars","Struk","Pusat bantuan","Komentar","Kirim ulasan","Ulangi rute", "Foto / bukti", "Kode penerima", "Nilai perjalanan", "Dibayar", "Peta sedang dimuat", "Peta sementara tidak tersedia", "Kunci peta tidak ditemukan", "Ciutkan", "Perluas"],
  ms: ["Sabi Taxi","Lokasi aktif","Hidupkan lokasi","Dari","Ke","Lokasi saya","Masukkan alamat","Perkhidmatan","Tambang","Menunggu lokasi","Google Maps · pratonton","Masukkan destinasi","Membina laluan","Laluan sedia","Alamat tidak dijumpai","Bina laluan","Pesan","kiraan","Pembayaran","Shield","Profil","Sejarah","Bantuan","Kembali","Teksi","Makanan","Pasar raya","Marketplace","Bungkusan","Kargo","Antara bandar","Ekonomi","Selesa","Bisnes","Premium","Penghantaran","Penghantaran","Sabi Wallet","Sabi AI Shield","Sabi Stars","Resit","Pusat bantuan","Komen","Hantar ulasan","Ulang laluan", "Foto / bukti", "Kod penerima", "Nilai perjalanan", "Dibayar", "Peta sedang dimuat", "Peta sementara tidak tersedia", "Kunci peta tidak ditemui", "Kecilkan", "Kembangkan"],
  th: ["Sabi Taxi","เปิดตำแหน่งแล้ว","เปิดตำแหน่ง","จาก","ไป","ตำแหน่งของฉัน","ใส่ที่อยู่","บริการ","อัตรา","รอตำแหน่ง","Google Maps · ตัวอย่าง","ใส่ปลายทาง","กำลังสร้างเส้นทาง","เส้นทางพร้อมแล้ว","ไม่พบที่อยู่","สร้างเส้นทาง","สั่ง","คำนวณ","ชำระเงิน","Shield","โปรไฟล์","ประวัติ","ช่วยเหลือ","กลับ","แท็กซี่","อาหาร","ซูเปอร์มาร์เก็ต","Marketplace","พัสดุ","ขนส่งสินค้า","ระหว่างเมือง","ประหยัด","สบาย","ธุรกิจ","Premium","จัดส่ง","จัดส่ง","Sabi Wallet","Sabi AI Shield","Sabi Stars","ใบเสร็จ","ศูนย์ช่วยเหลือ","ความคิดเห็น","ส่งรีวิว","ใช้เส้นทางซ้ำ", "รูปภาพ / หลักฐาน", "รหัสผู้รับ", "ให้คะแนนการเดินทาง", "ชำระแล้ว", "กำลังโหลดแผนที่", "แผนที่ไม่พร้อมใช้งานชั่วคราว", "ไม่พบคีย์แผนที่", "ย่อ", "ขยาย"],
  vi: ["Sabi Taxi","Định vị đang bật","Bật định vị","Từ","Đến","Vị trí của tôi","Nhập địa chỉ","Dịch vụ","Giá cước","Đang chờ định vị","Google Maps · xem trước","Nhập điểm đến","Đang tạo tuyến","Tuyến đã sẵn sàng","Không tìm thấy địa chỉ","Tạo tuyến","Đặt xe","tính toán","Thanh toán","Shield","Hồ sơ","Lịch sử","Trợ giúp","Quay lại","Taxi","Đồ ăn","Siêu thị","Marketplace","Bưu kiện","Hàng hóa","Liên tỉnh","Tiết kiệm","Thoải mái","Doanh nghiệp","Premium","Giao hàng","Giao hàng","Sabi Wallet","Sabi AI Shield","Sabi Stars","Biên lai","Trung tâm trợ giúp","Bình luận","Gửi đánh giá","Lặp lại tuyến", "Ảnh / bằng chứng", "Mã người nhận", "Đánh giá chuyến đi", "Đã thanh toán", "Đang tải bản đồ", "Bản đồ tạm thời không khả dụng", "Không tìm thấy khóa bản đồ", "Thu gọn", "Mở rộng"],
  kk: ["Sabi Taxi","Гео белсенді","Геоны қосыңыз","Қайдан","Қайда","Менің орным","Мекенжай енгізіңіз","Қызмет","Тариф","Геоны күту","Google Maps · қарау","Баратын жерді енгізіңіз","Маршрут құрылуда","Маршрут дайын","Мекенжай табылмады","Маршрут құру","Тапсырыс беру","есептеу","Төлем","Shield","Профиль","Тарих","Көмек","Артқа","Такси","Тамақ","Супермаркет","Marketplace","Сәлемдеме","Жүк","Қалааралық","Эконом","Комфорт","Бизнес","Premium","Жеткізу","Жеткізу","Sabi Wallet","Sabi AI Shield","Sabi Stars","Чек","Көмек орталығы","Пікір","Баға жіберу","Маршрутты қайталау", "Фото / дәлел", "Алушы коды", "Сапарды бағалау", "Төленді", "Карта жүктелуде", "Карта уақытша қолжетімсіз", "Карта кілті табылмады", "Жию", "Ашу"],
  ky: ["Sabi Taxi","Гео активдүү","Геону күйгүзүңүз","Кайдан","Кайда","Менин жайгашкан жерим","Дарек киргизиңиз","Кызмат","Тариф","Гео күтүлүүдө","Google Maps · көрүү","Бара турган жерди киргизиңиз","Маршрут түзүлүүдө","Маршрут даяр","Дарек табылган жок","Маршрут түзүү","Буйрутма берүү","эсептөө","Төлөм","Shield","Профиль","Тарых","Жардам","Артка","Такси","Тамак","Супермаркет","Marketplace","Посылка","Жүк","Шаар аралык","Эконом","Комфорт","Бизнес","Premium","Жеткирүү","Жеткирүү","Sabi Wallet","Sabi AI Shield","Sabi Stars","Чек","Жардам борбору","Комментарий","Бааны жөнөтүү","Маршрутту кайталоо", "Фото / далил", "Алуучу коду", "Сапарды баалоо", "Төлөндү", "Карта жүктөлүүдө", "Карта убактылуу жеткиликсиз", "Карта ачкычы табылган жок", "Жыйуу", "Ачуу"],
  tg: ["Sabi Taxi","Гео фаъол аст","Георо фаъол кунед","Аз куҷо","Ба куҷо","Ҷойи ман","Суроға ворид кунед","Хизмат","Тариф","Интизори гео","Google Maps · намоиш","Мақсадро ворид кунед","Масир сохта мешавад","Масир тайёр","Суроға ёфт нашуд","Сохтани масир","Фармоиш","ҳисоб","Пардохт","Shield","Профил","Таърих","Кӯмак","Бозгашт","Таксӣ","Ғизо","Супермаркет","Marketplace","Баста","Бор","Байнишаҳрӣ","Эконом","Комфорт","Бизнес","Premium","Расонидан","Расонидан","Sabi Wallet","Sabi AI Shield","Sabi Stars","Чек","Маркази кӯмак","Шарҳ","Фиристодани баҳо","Такрори масир", "Акс / далел", "Рамзи қабулкунанда", "Сафарро баҳогузорӣ кунед", "Пардохт шуд", "Харита бор шуда истодааст", "Харита муваққатан дастрас нест", "Калиди харита ёфт нашуд", "Пӯшидан", "Кушодан"],
  az: ["Sabi Taxi","Məkan aktivdir","Məkanı aktiv edin","Haradan","Haraya","Mənim məkanım","Ünvan daxil edin","Xidmət","Tarif","Məkan gözlənilir","Google Maps · önbaxış","Təyinatı daxil edin","Marşrut qurulur","Marşrut hazırdır","Ünvan tapılmadı","Marşrut qur","Sifariş et","hesablama","Ödəniş","Shield","Profil","Tarixçə","Kömək","Geri","Taksi","Yemək","Supermarket","Marketplace","Bağlama","Yük","Şəhərlərarası","Ekonom","Komfort","Biznes","Premium","Çatdırılma","Çatdırılma","Sabi Wallet","Sabi AI Shield","Sabi Stars","Qəbz","Kömək mərkəzi","Şərh","Rəy göndər","Marşrutu təkrarla", "Foto / sübut", "Qəbul edən kodu", "Səfəri qiymətləndir", "Ödənildi", "Xəritə yüklənir", "Xəritə müvəqqəti əlçatan deyil", "Xəritə açarı tapılmadı", "Yığ", "Aç"],
  pl: ["Sabi Taxi","Lokalizacja aktywna","Włącz lokalizację","Skąd","Dokąd","Moja lokalizacja","Wpisz adres","Usługa","Taryfa","Oczekiwanie na lokalizację","Google Maps · podgląd","Wpisz cel","Tworzenie trasy","Trasa gotowa","Nie znaleziono adresu","Utwórz trasę","Zamów","obliczanie","Płatność","Shield","Profil","Historia","Pomoc","Wstecz","Taxi","Jedzenie","Supermarket","Marketplace","Paczka","Ładunek","Międzymiastowe","Ekonomiczna","Komfort","Biznes","Premium","Dostawa","Dostawa","Sabi Wallet","Sabi AI Shield","Sabi Stars","Paragon","Centrum pomocy","Komentarz","Wyślij opinię","Powtórz trasę"]
};

export const taxiCopy: Record<TaxiLang, TaxiCopy> = Object.fromEntries(
  Object.entries(rows).map(([lang, row]) => [
    lang,
    Object.fromEntries(keys.map((key, index) => [key, row[index] ?? rows.en[index] ?? key])),
  ]),
) as Record<TaxiLang, TaxiCopy>;
