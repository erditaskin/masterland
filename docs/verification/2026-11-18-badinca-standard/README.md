# Badınca şehir ekranı doğrulaması

Badınca, [ortak şehir standardını](../../sehir-ekrani-standardi.md) kullanır. Kullanıcının 17 Kasım 2026 saat 22.54.17 tarihli referansı görsel kaynaktır. Dört oynanabilir üretici Kurabiye Fırını, Tart Tezgâhı, Pasta Atölyesi ve Çikolata Dükkânı’dır. Referanstaki şekerleme kutusuna karşılık gelen bir üretici veya ürün zinciri güncel içerik planında yoktur.

Boş üst panel, ilan yüzeyleri, üretici rafı, tahta ve alt menü ayrı alfa kanallı varlıklardır. Şehir zemini ayrı tam ekran görseldir ve Badınca’nın alt sayfalarında devam eder. İkon, metin, fiyat, kilit durumu, ödül ve seçili menü öğesi canlı bileşenlerden gelir. Dört üreticinin alt ürün sayıları sırasıyla 7, 8, 9 ve 10’dur. Mevcut atlas üzerinde 34 ayrı ürün dilimi, geçerli piksel sınırları ve şeffaflık doğrulandı.

Şehir arka planı yerleşik ImageGen ile üretildi. İstem, Badınca referansından pembe tenteli pastane sokağı ve bakır ayrıntıları alıp tahtanın en dış kenarlarına kurabiye tepsileri, tartlar ve çikolata kasaları yerleştirmeyi, arayüzü bağımsız bırakmayı istedi. Boş malzemeler şehir paletine uyarlandı. Üretici yüzleri referanstan ölçülü olarak ayrıldı.

Yerel test bağlantısı `masterland://presentation-review/badinca` Badınca’yı aktif şehir yapar ve dört zinciri açar. Bu oturumun eylemleri geçici test kaydında işler. Gerçek şehir açılış koşulları normal kayıtta uygulanır.

[34 alt ürünün ayrılmış atlas önizlemesi](urun-atlasi.png)

İlk cihaz incelemesinde mevcut atlasta hücre sınırına taşan komşu ikon parçaları görüldü. Badınca’nın 34 ürünündeki bağımsız komşu parçalar temizlendi, ürünlerin ana siluetleri ve mevcut içerik kimlikleri korundu.

## iPhone 16 Pro Release

Dört üretici kutusu, üretimle enerji harcaması, 54 hücre, dört zincirin 34 açık ürün girişi ve Badınca’nın Şehirler sayfası doğrulandı. Belenyaka’nın çok ürünlü ilanı ve sabit zemini için gerileme kontrolü geçti. 178 birim testi geçti.

[Badınca tahtası](tahta.png) · [Şehirler sayfası](sehirler.png)
