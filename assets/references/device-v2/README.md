# Bağımsız cihaz hedefleri — ikinci türetim

Durum: tasarım hedefleri yakalandı; uygulama piksel kabulü verilmedi. Özgün beş şehir ve sekiz ikincil pano sanat yönü kaynağı olarak korunur. Bu türetimin de özgün panoya sadakati ayrıca denetlenir.

İlk türetimde bulunan iki hata düzeltildi: Belenyaka seçili navigasyonu altın, Badınca seçili navigasyonu kremdir; birincil eylem renkleri ayrıdır. Hesap silme artık misafir gövdesine düşmez. Bu düzeltmeler uygulama ekran görüntüsü kopyalanarak yapılmamıştır. Kaynak katmanlar ve sahne komutları `source-assets.json` ve `specs/` içinde bağımsız olarak dondurulmuştur.

26 sahne, yalnız referans çizicisinin kurulduğu ayrı Masterland-Design-Reference-QA cihazında yakalandı. iPhone 16 Pro / iOS 18.6 / Türkçe / tr_TR / 1206×2622 kullanıldı. Gerçek uygulama girişi bu çiziciyi import etmez. Üç referans regresyon kontrolü silme gövdesini, navigasyon/eylem ayrımını ve kaynak dosyaların uygulama yakalamalarından gelmediğini denetler.

`fixtures.json` örnek oyun durumlarını açıklar. Gelecek şehir tahtaları konsepttir; oyun motoruna yeni üretici veya kilit eklenmiş sayılmaz. iOS sonucu Android kabulü değildir.

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

## Yeniden üretme

Depo kökünde `python3 tools/design-reference/build_specs.py`, ardından `python3 tools/design-reference/test_specs.py` ve `python3 tools/design-reference/package_native.py` çalıştırılır. Son komut onaylı kaynak panoların QA girişinin ihtiyaç duyduğu özel kopyalarını oluşturur; production Metro yapılandırmasını değiştirmez. Native yakalama için ayrı Expo girişi `mobile/qa/reference/index.tsx`, XCTest sınıfı `MasterlandReferenceTests` kullanılır. Asıl uygulama girişi `mobile/index.js` olarak kalır. Native hedef PNG’leri yeniden üretmek kendiliğinden kabul veya yeni baseline onayı vermez; önceki dosyalarla fark ve kaynak hash’leri incelenmelidir.
