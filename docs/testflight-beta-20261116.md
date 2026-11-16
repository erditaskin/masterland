# TestFlight oynanış betası — 16 Kasım 2026

## Onaylanan kapsam

Masterland, arkadaşla oynanış ve cihaz davranışını test etmek için TestFlight'a hazırlanır. Gerçek para satın almaları bu kanalda kapalıdır. Altın/elmas ile oyun içi takaslar devam eder. Sağ alttaki test enerji düğmesi açık kalır. Davet yöntemi ve arkadaş erişimi kullanıcı tarafından daha sonra belirtilecektir; bu aşamada dış testçi daveti veya public link açılmaz.

## Kanal ayrımı

- Yerel QA: EXPO_PUBLIC_TEST_MODE=true ve EXPO_PUBLIC_DISTRIBUTION_CHANNEL=local. Yerel Xcode StoreKit test ürünleri kullanılabilir.
- TestFlight: EXPO_PUBLIC_TEST_MODE=true ve EXPO_PUBLIC_DISTRIBUTION_CHANNEL=testflight. Enerji düğmesi açıktır; StoreKit arayüzü ve StoreKit kredi eylemi kapalıdır. QA/review bağlantıları normal oyuncu kaydını değiştiremez.
- Production: EXPO_PUBLIC_TEST_MODE=false ve EXPO_PUBLIC_DISTRIBUTION_CHANNEL=production. Test enerji düğmesi ve satın alma kredileri kapalıdır. Canlı ödeme doğrulaması ayrıca geliştirilecektir.

Bu değişkenler Expo tarafından JS paketine build sırasında gömülür. Dağıtılmış bir paketin kanalını sonradan ortam değişkeniyle değiştirmek mümkün değildir; yeniden derleme gerekir.

## Uygulama kimliği

- App Store Connect uygulama ID: 6835346739
- Bundle ID: com.erditaskin.masterland
- Apple Team: F3F723W4SF
- SKU: masterland-ios
- Ana dil: Türkçe
- İlk beta: 0.2.0 (2)
- TestFlight sayfası: https://appstoreconnect.apple.com/teams/cbcc3501-be9e-4a5f-b194-1ef0e35c7e40/apps/6835346739/testflight

## Yeniden üretme

mobile klasöründe Node 22.13+ ile npm ci, typecheck, lint ve npm test çalıştırılır. EXPO_PUBLIC_TEST_MODE=true ve EXPO_PUBLIC_DISTRIBUTION_CHANNEL=testflight ortamıyla expo prebuild --platform ios --no-install ve pod install uygulanır. Üretilen mobile/ios dosyaları elle düzenlenmez.

Aynı Pods dizinini kullanan native arşiv ve simülatör derlemeleri eşzamanlı çalıştırılmaz. ReactNativeDependencies değiştirme betiği ortak framework dizinine yazdığı için bu çalışma sırasında çakışma saptanmış, sıralı derlemeyle giderilmiştir.

MasterlandQA şemasında yalnız testTestFlightBetaPurchasePolicy kontrolü beta kanalıyla çalıştırılır. Diğer QA fixture testleri yerel kanal gerektirir. Beta kontrolü enerji düğmesini, QA bağlantısının kaydı değiştirmemesini ve satın alma butonlarının görünmemesini doğrular.

Arşiv için aynı beta ortamıyla xcodebuild archive, Masterland şeması ve generic/platform=iOS hedefi kullanılır. Pazarlama sürümü ve build numarası archive Info.plist üzerinden doğrulanır. Dağıtım seçeneği mobile/qa/ExportOptions-TestFlight.plist içindedir. Bu plist destination=upload içerir; xcodebuild -exportArchive ile kullanılması Apple'a yükleme başlatır. Yalnız yerel IPA almak için ayrı kopyada destination=export seçilir.

## İnceleme ve davet

Yüklemenin tamamlanması, Apple işlemesinin tamamlanması ve dış testçilere beta inceleme onayı ayrı durumlardır. TestFlight ekranında durum görülmeden erişime hazır olduğu söylenmez. Apple hesabına yeni yasal sözleşme sunulursa kullanıcı tamamlar. Arkadaş daveti, kullanıcı yöntemi belirttikten sonra hazırlanır.

## Sonuç

0.2.0 (2) yüklendi ve Apple işlemesi tamamlandı. TestFlight durumu Ready to Submit olarak doğrulandı. Ayrıntılar testflight-beta-verification-20261116.md içindedir. Davet ve dış beta incelemesi henüz başlatılmadı.
