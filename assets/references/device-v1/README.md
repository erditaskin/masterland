> 18 Kasım ek denetimi: Bu ilk türetim nihai referans değildir. Seçili Belenyaka navigasyonu onay panosundaki altın yerine yeşildir. Ayrıca `account-deletion` sahnesi `startswith` dalı nedeniyle yanlışlıkla misafir hesap gövdesini içerir. Bu iki hata ve sanat yönü denetimi nedeniyle v1 karşılaştırmaları yalnız tanısaldır; kabul hedefi olarak kullanılamaz. Özgün dosyalar denetim geçmişi için korunur.

# Cihaz referansları — 18 Kasım 2026

Kullanıcı cihaz ölçüsüne normalleştirmeyi onaylamıştır. Bu paket uygulamanın kabul edilmiş çıktısı değildir.

26 bağımsız tasarım sahnesi iPhone 16 Pro / iOS 18.6 Release renderer’ında, 402×874 pt ve 1206×2622 piksel ölçüsünde yakalanmıştır. Yakalama testi 95,049 saniyede geçmiştir. SHA-256 ve renk metaverisi `native/manifest.json` içindedir.

Sahneler onaylı konseptlerden ve dondurulmuş katmanlardan hazırlanmıştır. Mevcut uygulama ekran görüntüleri tasarım girdisi değildir. Ayrı Expo QA giriş noktası oyun kaydına, hesap oturumuna veya API’ye erişmez. Testten sonra özgün uygulama paketi veri silinmeden geri kurulmuş ve bundle hash eşitliği doğrulanmıştır.

## Kapsam ve sınırlar

Belenyaka için 18 görünüm; diğer dört şehir için tahta ve şehir listesi bulunur. Kare 6×9 tahta, tekil depo öğeleri ve tutarlı sayaçlar korunur. Üçüncü, dördüncü ve beşinci şehir yalnız görsel konsepttir; oynanabilirlik veya ekonomi kabulü değildir. Örnek ödül değerleri tasarım verisidir.

`specs/`, `palettes.json`, `fixtures.json` ve `source-assets.json` bağımsız tasarım girdileridir. `png/` masaüstü önizlemeleridir; iOS piksel karşılaştırmasında `native/` kullanılır. Referanslar ile eski uygulama yakalamaları farklı fixture durumları içerdiğinden bu karşılaştırma kabul testi sayılamaz. Kabul matrisi 0/90 durumundadır.

## iOS ve Android

İlk dağıtım iOS içindir. Ortak tema, bileşen, içerik kimlikleri ve etkileşim mantığı React Native içinde platformdan bağımsız kalacaktır. Bu paketin Swift çizicisi yalnız çevrimdışı tasarım aracıdır; uygulama runtime bağımlılığı değildir. Güvenli alan, font metrikleri ve Apple gibi sistem sağlayıcı kontrolleri platform sınırında ele alınacaktır. Android için ayrı cihaz ölçüsü ve font referansları ile etkileşim/performance doğrulaması gereklidir. iOS test sonucu Android kabulü değildir.

## Görünümler

- [city1-account-deletion](native/city1-account-deletion.png)
- [city1-account-guest](native/city1-account-guest.png)
- [city1-account-registered](native/city1-account-registered.png)
- [city1-achievement](native/city1-achievement.png)
- [city1-achievements](native/city1-achievements.png)
- [city1-board](native/city1-board.png)
- [city1-cities](native/city1-cities.png)
- [city1-cloud-choice](native/city1-cloud-choice.png)
- [city1-collection](native/city1-collection.png)
- [city1-collection-chain](native/city1-collection-chain.png)
- [city1-energy](native/city1-energy.png)
- [city1-item](native/city1-item.png)
- [city1-market](native/city1-market.png)
- [city1-order-guide](native/city1-order-guide.png)
- [city1-orders](native/city1-orders.png)
- [city1-producer-cooldown](native/city1-producer-cooldown.png)
- [city1-storage](native/city1-storage.png)
- [city1-storage-board-full](native/city1-storage-board-full.png)
- [city2-board](native/city2-board.png)
- [city2-cities](native/city2-cities.png)
- [city3-board](native/city3-board.png)
- [city3-cities](native/city3-cities.png)
- [city4-board](native/city4-board.png)
- [city4-cities](native/city4-cities.png)
- [city5-board](native/city5-board.png)
- [city5-cities](native/city5-cities.png)

İlk türetimin PNG yakalamaları yerel denetim için korunur; Git yalnız kaynak sahneleri, üretici kodunun arşivini ve yakalama hash manifestini taşır. Bu geçersiz ilk türetim yeni kabul için kullanılmaz.
