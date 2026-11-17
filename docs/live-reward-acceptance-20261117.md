# Canlı reklam ödülü kabulü — 17 Kasım 2026

## Yetki ve etkin yapılandırma

Kullanıcı canlı sunucu ödülünü çalıştırıp fiziksel telefonda uçtan uca doğrulamayı açıkça istedi. Önce reklam maddesi bitecek, ardından hesap silme ve önceki sekiz adımlı sıra izlenecektir. VPS `ADMOB_SSV_ENABLED=true` yapıldı; önceki env dosyası root erişimli 0600 dosyada korundu. Hesap silme ve gerçek para satın alma kapıları açılmadı.

Etkin API release’i `76f23907b6a53ee6b5d4d954fd045b85494df8cc`’dir. İmaj arşivinin SHA-256 değeri, sıralı içerik katmanları, platform ve runtime config’i doğrulandı. DB yedeği alındıktan sonra Drizzle tarafından üretilen eklemeli `0001_many_martin_li.sql` migrationı uygulandı; yalnız nullable `ad_intents.cancelled_at` eklendi. Eski API’ye rollback ve yeni release’e tekrar aktivasyon geçti; mevcut kayıtlar silinmedi.

Mobil doğrulanmış ödül yolu `EXPO_PUBLIC_VERIFIED_REWARDS_ENABLED=true` ile, test modu kapalı production veya kontrollü TestFlight kanalında açılır. `npm run ios:rewards` kontrollü kabulü tekrar üretir. Normal `ios:acceptance` hâlâ ödülsüz demo önizlemesidir. Test modu kayıtları canlı sunucuya yüklenmez.

## Google test trafiği

Masterland’in kendi enerji ve üretici birimleri kullanıldı. Demo TestIds birimleri SSV kabulü olarak gösterilmedi. Simülatör Google tarafından otomatik test cihazıdır. Fiziksel cihaz için AdMob’un sürüme özel test uygulaması özelliğinde yalnız Masterland iOS 0.2.0 test moduna alındı; panelde açık anahtar görüldü. Bu sürüm reklam geliri üretmez. Yayından önce bu ayar kapatılacak veya yayın sürümü uygun şekilde ayrılacaktır; mevcut test ayarı açıkça yayın kontrol listesine taşınmalıdır.

Kaynaklar: [Google test reklamları](https://developers.google.com/admob/ios/test-ads), [sürüme özel test modu](https://support.google.com/admob/answer/17080939?hl=en), [SSV](https://developers.google.com/admob/ios/ssv).

## Düzeltilen davranışlar

- Canlı intent yalnız açık izleme eyleminde hazırlanır. Enerji sayfasına bakmak kota rezervasyonu oluşturmaz.
- İptal endpoint’i yalnız eşleşen owner/session rezervasyonunu bırakır. Metadata korunur; geç gelen geçerli imzalı callback kazanılmış ödülü kaybetmez.
- Reklam earned olmadan kapanırsa veya uygulama yükleme/gösterim sırasında arka plana alınırsa rezervasyon en iyi gayretle bırakılır. Ağ yoksa sunucunun 15 dakikalık süre sınırı yedektir. Sunucu imzası olmadan ödül verilmez.
- Mobilin eski 20 dakikalık hazır intent eşiği 14 dakikaya çekildi; sunucunun 15 dakikalık süresiyle uyumludur.
- Mevcut eşitlenmiş owner reklam izleme başında yeniden bağlanıp epoch sıfırlamaz. Bulut seçimi gerekiyorsa kullanıcı hesap bölümüne yönlendiren açıklama görür.
- Başarı sonucu yalnız sunucu receipt’i ve aynı owner’ın tamamlanmış yerel eşitlemesiyle gösterilir. Kayıt henüz tamamlanmadığında “ödül verildi” denmez.

## Otomatik kontroller

169 mobil testi ve 23 API testi geçti. API testleri gerçek izole PostgreSQL kullanır. İmzalı HTTP testi ECDSA doğrulaması, kapalı kapıda sıfır ödeme, değiştirilmiş callback reddi, eşzamanlı tekrarların tek ödemesi ve kalıcı +25 bakiyeyi kapsar. İptal testi kota rezervasyonunu bırakırken geçerli geç ödülün kaybolmamasını doğrular. Bu sentetik ECDSA testi Google’ın canlı callback’iyle karıştırılmaz.

TypeScript ve ESLint kontrolleri geçti. API format/build kontrolleri geçti.

## Gerçek Google ve cihaz kabulü

- Canlı Google anahtarlarıyla doğrulanan gerçek SSV callback’leri, canlı ledger ve redeem üzerinden işlendi; sahte test anahtarı veya elle ödül yazımı kullanılmadı.
- Release simülatör enerji testi +25 artış, reklamdan oyuna dönüş ve yeniden açılışta kalıcılığı doğruladı; test logunda 28.146 saniyede passed kaydı vardır. Sonraki yavaş üretici testi durdurulduğundan birleşik xcresult finalize olmadı. Bu paket iki başarılı test gibi raporlanmaz; enerji logu ve fiziksel kabul ayrıca korunur.
- Bağımsız Release üretici testi geçti: üretici normal oyun hamleleriyle beklemeye sokuldu, kendi Google birimiyle doğrulandı, yalnız hedef üretici yenilendi ve yeniden açılışta kullanılabildi. Test enerji artışını, olası doğal dolum sınırından ayırdı. Sonuç paketi `/private/tmp/masterland-live-rewards-producer-final-20261117.xcresult` içindedir.
- Gerçek ortak kota testi geçti: aynı misafir test hesabında üç enerji ve bir üretici ödülünden sonra beşinci reklam açılmadı; 4/4 ve devre dışı düğme görüldü. Sonuç paketi `/private/tmp/masterland-live-rewards-quota-20261117.xcresult` içindedir.
- Kullanıcı fiziksel iPhone’da +25 enerjinin eklendiğini doğruladı. Ayrıca video tamamlanmadan arka plana alıp dönünce devam etmesini ve earned sonrasında oyuna dönmeden çıkılsa da ödülün korunmasını doğruladı.
- Aggregate kontrolde misafir test hesabında enerji 3 × 25 ve üretici 1 × yenileme; kayıtlı tarafta enerji 3 × 25 görüldü. İptal edilmiş bir rezervasyonun sonradan geçerli imzayla ödenmesi de doğrulandı. Bunlar farklı ödül birimleri olduğundan üretici amount=1 enerji toplamına eklenmez.

İlk own-unit testleri Google’ın iki videolu test yaratıcılarının erişilebilirlikte kapatma düğmesini devre dışı placeholder olarak sunması ve yükleme sırasında devre dışı düğmeye erken basılması nedeniyle başarısız oldu. Testler, etkinleşmeyi bekleme ve görülen Reward granted etiketinin sağındaki gerçek X konumunu kullanma desteğiyle düzeltildi. Başarısız koşular başarılı kabul olarak sayılmadı. Kanıt ekranları `verification/2026-11-17-live-rewards/` altındadır.

## Negatif kabul ve tamamlanma

Telefon günlük sınıra ulaştığından tamamen terk etme alt senaryosu o hesapta tekrar denenmedi. Kota veya ledger sıfırlanmadı. Yeni, temiz `Masterland-Reward-Cancel-QA` Release simülatöründe gerçek Masterland Google reklamı gösterildi, tamamlanmadan ana ekrana dönüldü ve uygulama tamamen sonlandırıldı. Yeniden açılışta enerji 100, günlük kullanım 0/4 kaldı. Test 32.758 saniyede geçti; sonuç paketi `/private/tmp/masterland-live-rewards-abandon-20261117.xcresult` içindedir. Canlı DB’de test başlangıcından sonra oluşan tek misafir için sıfır reward, bir iptal edilmiş intent ve min/max 100 enerji ayrıca doğrulandı. Bu negatif kontrol fiziksel telefon kontrolü gibi sunulmaz.

Reklam maddesinin uygulama/sunucu kabulü tamamlandı: fiziksel +25 ve arka plan kurtarması, gerçek Google imzalı enerji/üretici ödemesi, yeniden açılış, terk etmede sıfır ödeme ve ortak günlük sınır doğrulandı. Eşzamanlı tekrar ve yetkisiz iptal korumaları izole otomatik testlerle doğrulandı. Meta/AdMob genel yayın incelemeleri ve mağaza dağıtımı sonraki maddelerdir; bu kabul, reklam gelirinin veya mağaza yayınının açıldığı anlamına gelmez.

## Test temizliği

Kullanıcının ek isteğiyle yerel `masterland-api-test-20261117` konteyneri ve yalnız ona bağlı anonim PostgreSQL test volume’u silindi. Yerel Docker envanterinde Masterland test konteyneri kalmadığı doğrulandı. Başka projelerin konteynerleri ve canlı VPS servisleri değiştirilmedi. Sonraki aşamalarda oluşturulacak yerel test konteynerleri de işi bitince temizlenecektir.
