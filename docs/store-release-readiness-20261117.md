# Reklamlı ilk App Store yayını — 17 Kasım 2026

## Güncel kapsam

Kullanıcının son kararı ilk App Store sürümünü reklamlarla yayımlamak, gerçek para satışını yayın sonrasına bırakmaktır. Altın/elmas ile mevcut oyun içi takaslar bundan ayrıdır. R2 offsite yedeği de kullanıcı tarafından ertelenmiştir; mevcut günlük VPS yedeği bağımsız afet kurtarma değildir. Fiziksel Apple silme/revoke testi servis sorunu nedeniyle beklemededir ve tamamlandı sayılmaz. İki cihaz bulut kabulü önceki kullanıcı kararıyla ertelenmiştir.

## Sağlayıcı panellerinde doğrulanan durum

- Google Verification Center, hassas veya kısıtlı scope olmadığı için data access doğrulaması gerekmediğini bildirmiştir. Marka/logonun gösterilmesi ayrı doğrulamaya bağlıdır.
- Google marka doğrulaması başlatılmış ve ana sayfa alan adı sahipliğinin doğrulanmadığı sonucu alınmıştır. Kullanıcı Cloudflare'a Search Console TXT kaydını eklemiştir. Haricî DNS resolver kaydı döndürmüş, doğru Google hesabında Search Console **Sahiplik doğrulandı** sonucunu göstermiştir. Bu TXT kaydı korunmalıdır. Google hata metni, sahiplik doğrulamasından sonra sistemlerin güncellenmesi için 24 saat bekleyip marka doğrulamasını yeniden denemeyi istemektedir. Marka onayı henüz alınmamıştır.
- AdMob Masterland uygulaması **İnceleme gerekli / Sınırlı reklam sunumu / Limiti kaldırmak için mağaza ekleyin** durumundadır. Mevcut App Store ID 6835346739 ile arama sonuç vermemiştir. TestFlight kaydı halka açık App Store kaydı gibi gösterilmemiş ve yanlış mağaza uygulaması bağlanmamıştır. Kamuya açık mağaza kaydı sonrası eşleştirme ve AdMob incelemesi tamamlanmalıdır.
- AdMob 0.2.0 sürümüne özel test modu açık kalmıştır. Canlı ödül kabulü test envanteriyle yapılmıştır. Reklam gelirine geçişte mağaza sürümü/test modu ayrımı ayrıca uygulanmalıdır; bu rapor test modunu kapatmamıştır.
- Meta **Unpublished** durumundadır. Yayın kontrol listesi Data deletion URL ve Business verification istemektedir. Mevcut `https://masterland.app/delete-account/` crawler User-Agent ile HTTP 200 dönmesine rağmen Meta kaydetme denemesi **Data deletion instructions URL should represent a valid URL** hatası vermiştir. Reddedilen taslak Discard ile geri alınmıştır. Sayfanın erişilebilir olması Meta kabulü gibi raporlanmaz. Kullanıcının sonraki açık kararıyla ilk sürümde yeni giriş ekranındaki Facebook düğmesi gizlenecektir; bu engel ilk sürümde yeni Facebook girişi vaat edilerek aşılmayacaktır. Mevcut hesap ve yeniden doğrulama kodu korunur.
- Meta doğrulama akışı bağlı bir business portfolio istemektedir; açılan form yeni hesap oluşturma adımına gelmiştir. Hesap oluşturulmamış, yeni sözleşme kabul edilmemiş, kişisel kimlik belgesi gönderilmemiştir. Genel Facebook girişi hâlâ tamamlanmış değildir.

## Apple ve mağaza kapıları

App Store Connect uygulamanın distribution adresi açıldığında login sayfasına `authResult=FAILED` ile dönmüştür. Paneldeki güncel metadata veya inceleme durumu bu oturumda doğrulanamamıştır. Apple hesabının genel giriş kesintisi ayrı kabul raporunda belgelenmiştir; App Store oturum hatasının kesin nedeni yalnız bu yönlendirmeyle belirlenemez.

Fiziksel Apple silme/revoke başarısı beklenir. Başarısız talebin hesabı ve yerel ilerlemeyi koruduğu doğrulanmıştır; başarısızlık, silme kabulü değildir. Sonraki başarılı testten sonra onaylı iki oyun kaydı dar kapsamla geri yüklenip Facebook hesabına dönülecektir.

## Tekrarlanabilir yerel yayın kontrolü

`npm run ios:store-release`, production kanalını, test modu kapalı, canlı backend/doğrulanmış reklam ve hesap silme arayüzü açık olacak şekilde açık bayraklarla üretir. `EXPO_PUBLIC_FACEBOOK_LOGIN_HIDDEN=true` yalnız yeni giriş ekranındaki Facebook seçeneğini ve yakında metnini gizler; önceki kabul preset'lerini değiştirmez. Gerçek para satışını açan bayrak yoktur; StoreKit test mağazası yalnız yerel test modu için kalır. Bu komut Apple'a arşiv yüklemez. Eski `ios:production` komutu temel kapalı varsayılanlar için korunmuştur.

Yeni native `testProductionReleasePolicy`, test cüzdan/enerji/seviye düğmelerinin yokluğunu, QA bağlantılarının normal kaydı değiştirmemesini, Facebook'un gizlenmesini ve gerçek para satın alma düğmelerinin kapalı olmasını kontrol eder. İlk koşu qa-reset bağlantısının test tahtasını açtığını yakalamış ve başarısız olmuştur. Production hem başlangıç/sıcak bağlantı işleyicisinde hem doğrudan kayıt yükleme sınırında normal kayıtla sınırlandırılmıştır. Düzeltme sonrası doğrulama sonucu aşağıdadır.

Son doğrulama: 170 mobil testi, TypeScript ve ESLint geçti. Gerçek production Release `testProductionReleasePolicy`, Masterland-Store-Release-QA adlı ayrı iOS 18.6 simülatöründe 19.490 saniyede geçti. Test kontrolleri ve gerçek para düğmeleri yoktur; qa-reset/milestone bağlantıları üretim sonrası enerji değerini değiştirmemiştir; Apple/Google görünür, Facebook görünmezdir. Üç native ekran görsel olarak incelendi. Sonuç paketi `/private/tmp/masterland-store-release-policy-final-20261117.xcresult`, görüntüler `verification/2026-11-17-store-release/` içindedir. Bu kontrol yeni Apple silme kabulü, production reklam videosu tekrarı veya mağaza onayı değildir. Reklamın önceki fiziksel/sunucu kabulü ayrı raporda korunur.

Google kanıtı: `verification/2026-11-17-store-release/google-domain-verified.png`. Kaynak paneller: Google Auth Platform masterland-514913; Search Console masterland.app; Meta app 999025329335282; AdMob Masterland iOS 5586706771.

## App Store metin taslağı

Aşağıdaki metinler panel erişimi beklerken hazırlanmıştır; App Store Connect'e kaydedilmemiş veya incelemeye gönderilmemiştir. Mevcut panel değerleri okunmadan onların yerine yazılmaz.

Türkçe alt başlık: **Birleştir ve şehirleri keşfet**

Türkçe açıklama:

Masterland'de aynı eşyaları birleştir, yeni ürünler keşfet ve siparişleri tamamla. Bahçeyaka'nın çiftliklerinden Ballıca'nın fırınlarına uzanan yolculukta üreticilerini geliştir, koleksiyonunu büyüt ve yeni hedeflere ilerle.

Kendi hızında oyna. Temel oyun internet bağlantısı olmadan çalışır. İstersen Apple veya Google hesabınla giriş yaparak ilerlemeni buluta kaydet. İsteğe bağlı ödüllü reklamlarla enerji kazan veya bekleyen üreticini yenile; reklam ve bulut özellikleri internet bağlantısı gerektirir.

English subtitle: **Merge, craft and explore**

English description:

Merge matching items, discover new products and complete orders in Masterland. Travel from Meadowbrook's farms to Baker's Market's ovens as you build your collection and work toward new goals.

Play at your own pace. Core gameplay works offline. Sign in with Apple or Google if you want to save your progress to the cloud. Optional rewarded ads can provide energy or refresh a waiting producer. Ads and cloud features require an internet connection.

Destek: `https://masterland.app/support/`. Gizlilik: `https://masterland.app/privacy/`. Pazarlama: `https://masterland.app/`. Yaş derecelendirmesi, reklam/gizlilik beyanları ve inceleme iletişim bilgileri mevcut panelle karşılaştırılıp gerçek SDK davranışına göre tamamlanmalıdır. Google Mobile Ads'ın veri beyanı, yalnız uygulamanın kendi API kayıtlarına bakılarak eksik doldurulmaz.

Apple'ın [ekran görüntüsü ölçüleri](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/) ve [hesap silme gereği](https://developer.apple.com/app-store/review/guidelines/#privacy) kontrol edilmiştir. Hesap oluşturma sunan sürüm uygulama içi silme sunmalıdır. Mağazaya gönderilecek görseller gerçek son sürümden alınmalı; mevcut teknik QA görüntüleri otomatik olarak mağaza pazarlama görseli kabul edilmemelidir.
