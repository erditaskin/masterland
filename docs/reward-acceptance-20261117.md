# Reklam ödülü incelemesi — 17 Kasım 2026

## Bildirim ve neden

Kullanıcı test videosu sonunda “ödül verildi” görmesine rağmen ödül alamadığını bildirdi. Son telefona kurulan kontrollü TestFlight derlemesi `EXPO_PUBLIC_TEST_MODE=false` ve test reklam envanteri kullanıyordu. Bu kombinasyonun mevcut davranışı yalnız önizlemedir; `service.ts` earned callback’inde oyun bakiyesine dokunmadan döner. Buna rağmen düğmede “Reklam · +25 enerji” veya üreticiyi hazırlama vaadi bulunuyordu. Bu çelişki giderildi.

Release simülatöründe Google test reklamının kendi ekranındaki “Reward granted” yazısı doğrudan görüldü. Bu yazı uygulamanın sunucu ödeme onayı değildir. Test reklamını göstermek, test ödülünü uygulamak ve Google imzasıyla sunucu ödülünü doğrulamak ayrı kontrollerdir.

## Değişiklik

Ödül vermeyen kontrollü önizleme düğmesi artık açıkça “Test reklamını önizle · ödülsüz” der. Video earned callback’i sonrasında uygulama “Test reklamı tamamlandı. Bu önizleme ödül vermez.” açıklamasını gösterir. Test modunda ödül uygulanıp kalıcı kayıt yazımı tamamlanmadan uygulama başarı sonucu yayımlamaz. Kayıt hatası başarı olarak gösterilmez. Üretici/enerji ödülleri ve günlük kota sözleşmesi değiştirilmedi. SDK earned callback’i canlı bakiye otoritesi yapılmadı.

## Doğrulama

- 22 API testi gerçek izole PostgreSQL ile geçti. Ek HTTP testi kapalı callback’in ödeme yapmadığını, değiştirilmiş imzanın reddedildiğini ve eşzamanlı callback/redeem tekrarlarının yalnız bir +25 ödül ürettiğini doğrular. Anahtar servisi test içinde yerel ECDSA anahtarıyla taklit edilir; Google’ın canlı callback’i olarak raporlanmaz. API runtime kaynakları değiştirilmedi; yeni deployment gerekmedi.
- 165 mobil testi geçti. Yeni servis testleri kontrollü önizlemede sıfır ödeme, test modunda earned tekrarıyla tek ödeme, disk yazımını bekleme ve yazım hatasında başarı göstermeme davranışını kapsar. Mevcut iptal, geç doğrulama ve owner değişimi testleri de geçti.
- TypeScript ve ESLint geçti.
- Kontrollü, test modu kapalı Release sürümünde üçüncü gerçek video testi geçti: düğme ödülsüz olarak işaretliydi, video sonrasında ödül verilmediği uygulamada açıklandı ve 100 enerji değişmedi. Ekran görüntüsü görsel olarak incelendi. Sonuç paketi `/private/tmp/masterland-reward-preview-native-20261117.xcresult` içindedir.
- Gerçek Release iPhone 16 Pro simülatöründe Google test videosuyla üretici ödülü geçti: üretici hazırlandı; enerji değişmedi.
- Aynı simülatörde enerji videosu geçti: 100 enerji 125 oldu. Uygulama kapatılıp açıldıktan sonra 125 enerji ve günlük 1/4 kullanımı korundu. Bu test geçici qa-reset sahnesinde değil, simülatörün kalıcı test-modu kaydında çalıştırıldı.
- Ekran kanıtları `verification/2026-11-17-reward/` altındadır. Test sonuç paketi `/private/tmp/masterland-reward-fix-native-20261117.xcresult` içindedir.

## Kabul sınırı

Telefon build’i değiştirilmedi. Normal telefon kaydı ve bulut bakiyesi bu incelemede değiştirilmedi. Test ödülü test kaydı içindir; canlı sunucu ödeme kabulü sayılmaz. `productionRewardsEnabled=false` ve `ADMOB_SSV_ENABLED=false` kapıları korunur. Gerçek Google imzalı SSV ile sunucu entitlement/redeem, gerçek cihazda geç callback/iptal ve tam akış kabulü henüz tamamlanmadı. Bu nedenle sekiz adımlık listenin reklam maddesi bütünüyle tamamlandı olarak kapatılamaz.

Google kaynakları: [iOS test reklamları](https://developers.google.com/admob/ios/test-ads), [sunucu doğrulaması](https://developers.google.com/admob/ios/ssv).
