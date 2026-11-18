# Masterland

## Şehir teması refaktörü — 18 Kasım 2026

Beş şehir için ortak tema ve bileşik ekran çalışması sürüyor. Son ekran çizimleri uygulama yönüdür; cihaz ölçülü referansların hazırlanması onaylandı; %100 piksel kabulü henüz yoktur. Apple/TestFlight gönderimi kullanıcının son kararıyla beklemededir. İlk cihaz türetimindeki sanat yönü/dal hataları ayrıca kaydedilmiş ve o paket kabul hedefinden çıkarılmıştır. Kod, kanıtlar ve açık sınırlar [şehir teması refaktörü](docs/city-theme-composites-20261118.md) belgesindedir.

## Güncel TestFlight hazırlığı — 17 Kasım 2026

VPS bağlantılı mevcut sürüm 0.2.0 (3) olarak derlendi, Release kanal kontrolü geçti ve cihaz arşivi imzalandı. Apple yüklemesi bir zaman aşımı ve ardından iki HTTP 500 hatası nedeniyle tamamlanmadı; bu build henüz TestFlight'ta mevcut olarak raporlanmaz. Yeni kanal `npm run ios:beta-vps` ile tekrar üretilir; test kredileri ve gerçek satış kapalıdır, eski test kredili beta kaydı ayrı korunur. Ayrıntılar `docs/testflight-vps-20261117.md` içindedir. Aşağıdaki ilk 0.2.0 (2) beta bilgileri tarihçedir.

Travel Town tarzı saf merge tahtasını, şehirlerde farklı yaşam temaları ve XP ile açılan haritayla birleştiren mobil oyun prototipi.

## Aktif proje

- Klasör: `/Users/erdi/masterland/masterland-mobile`
- Uygulama: `mobile/` — React Native / Expo, TypeScript, Hermes.
- iOS kimliği: `com.erditaskin.masterland`; bağlantı şeması: `masterland://`.
- İlk oynanabilir şehrin Türkçe adı Belenyaka'dır. İlk beş şehir adı Belenyaka, Badınca, Yalıkoru, Demirdere ve İpekyolu olarak belirlenmiştir. Beşli görsel hedef, bütün şehirlerin oynanış kabulünün tamamlandığı anlamına gelmez. Eski UO adları tarihsel/esin referanslarıdır.
- İçerik ve değiştirilebilir adların tek kaynağı: `data/content-reference.json`.

17 Kasım 2026 altyapı geçişi: API `/Users/erdi/masterland/masterland-api`, web `/Users/erdi/masterland/masterland-web` altında ayrı depolardır. Mobil origin `erditaskin/masterland` olarak korunur. Expo kökü bu repo içinde hâlâ `mobile/` altındadır. API origin'i `https://api.masterland.app`; Supabase çalışma zamanı ve SDK bağımlılığı kaldırılmıştır. Eski altyapı raporları tarihçedir. Güncel kapsam ve kabul sınırları `docs/vps-migration-20261117.md` içindedir.

SwiftUI oyun kaynakları aktif projeden çıkarılmıştır. Güvenlik arşivi proje dışında `/Users/erdi/Documents/Codex/2026-11-14/kanki/work/swiftui-archive-20261115` altında korunur. `mobile/ios` Expo tarafından üretilir; sürüm kontrolüne girmez. Native UI testleri Swift ile yazılmıştır; bunlar SwiftUI oyun kodu değildir.

## Çalıştırma

Node 22.13 veya üstü ve Xcode gerekir.

```sh
cd mobile
npm ci
npm run typecheck
npm run lint
npm test
npx expo run:ios --device Masterland-QA
```

Metro gerektirmeyen Release sürümü:

```sh
npx expo run:ios --configuration Release --device Masterland-QA
```

Native proje yeniden üretilebilir: `npx expo prebuild --platform ios`. UI test hedefi `plugins/with-ui-tests.js` ile üretilir. Üretilen projeye elle oyun mantığı eklemeyin.

## Kayıt ve inceleme

Normal ilerleme cihazda `@masterland/save/v2` anahtarıyla saklanır. Bozuk kayıt sessizce sıfırlanmaz. Eski RN ve Swift kayıtları `mobile/scripts/import-rn-save.py` ve `import-swift-save.py` ile kaynak değiştirilmeden aktarılabilir.

`masterland://review` görsel inceleme, `masterland://qa-reset` temiz test oturumudur. İkisi de normal oyuncu kaydını değiştirmez. Bunlar prototip girişleridir; mağaza yayını öncesi sınırlandırılmalıdır.

## Kararlar ve kalite

- `docs/kararlar.md`: Onaylı kararlar.
- `docs/acik-konular.md`: Açık tasarım ve denge konuları.
- `docs/isim-referanslari.md`: Sabit ID ve değiştirilebilir ad standardı.
- `docs/ureticiler-ve-zincirler.md`: Üretici, ürün ve başlangıç ekonomi tablosu.
- `docs/ui-standard.md`: 15 Kasım fotoğrafına göre güncel ortak görsel hedef.
- `docs/reference-fidelity-20261115.md`: Gerçek ekran, renk uzayı ve geometri ölçümleri.
- `docs/react-native-migration.md`: Mimari, etkileşim ve doğrulama sınırları.
- `docs/masterland-release-verification.md`: Güncel uygulama doğrulaması.
- `docs/degisiklik-gecmisi.md`: Önceki kararların tarihçesi.

Eski `ios/` yolları ve Ultima adı geçen tarihsel raporlar geçmiş SwiftUI sürümüne aittir. Eski test sonuçları RN sürümünün kanıtı sayılmaz. Mekanik test başarısı, görsel kabul veya gerçek cihaz performans ölçümü değildir. Ekonomi sayıları deneme ayarıdır; gerçek reklam ve satın alma henüz eklenmemiştir.

## Güncel Skara uygulama doğrulaması

Kanonik konsept paketi, native kare tahta, loading ve şehir yolu uygulamasının ölçümleri ve kabul sınırı `docs/skara-native-fidelity.md` içindedir. Eski görsel turlar güncel kare hücre kararının yerine geçmez.


### Enerji ve New Haven prototipi — 16 Kasım 2026

Pasif enerji yenilenmesi 100'de durur; hediye enerjisi sınırsız birikebilir. New Haven seviye 12 ve tek seferlik 6.000 altınla açılır. Şehirlerin kayıtları ayrıdır. Güncel içerik tablosu `docs/producer-tiers-20261116.md`, ekonomi hesabı `docs/economy-20261116.md`, test kanıtları `docs/milestone-verification-20261116.md` içindedir.

Test enerji düğmesi ve yerel StoreKit kredileri yalnız `EXPO_PUBLIC_TEST_MODE=true` ile açılır. `npm run ios:test` test sürümünü; `npm run ios:production` test özelliği kapalı sürümü üretir. Gerçek para satışı açık değildir. Yerel StoreKit kataloğu `mobile/qa/Masterland.storekit`, test şeması `MasterlandQA` kullanılır. iOS 26.3 CLI StoreKit testi SKInternalErrorDomain Code=3 verebildiğinden son başarılı satın alma testi iOS 18.6 simülatöründe çalıştırılmıştır.


### TestFlight oynanış betası

İlk TestFlight sürümü **0.2.0 (2)**. `npm run ios:beta` satın almalar kapalı, test enerji düğmesi açık kanalı üretir. Uygulama ID: `6835346739`. Dağıtım ve tekrar üretme ayrıntıları `docs/testflight-beta-20261116.md`, son doğrulama `docs/testflight-beta-verification-20261116.md` içindedir. Yerel StoreKit QA ile TestFlight kanalı aynı değildir.
