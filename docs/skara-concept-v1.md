# Skara Brae — Görsel konsept seti 01

15 Kasım 2026. Durum: kullanıcı sanat yönünü beğendi; tahta ve harita için aşağıdaki düzeltmeleri istedi. Native uygulama görsel kabulü henüz yapılmadı. Aktif uygulamanın onaylı yerleşimi veya ekonomisi bu çalışma ile değiştirilmez.

## Amaç

Travel Town'un görsel hiyerarşisini ve ödül sunumunu inceleyerek Masterland'ın ekranlarını tek bir sanat dilinde geliştirmek. Referans, kopyalanmış marka veya UI varlığı değildir. Büyük, okunaklı ürünler; belirgin hazır/kapalı/seçili durumları; sade zeminler; temaya uygun kısa hareketler hedeflenir.

İncelenen kaynaklar: kullanıcının Travel Town koleksiyon ekranı (assets/references/travel-town-collection.jpeg), onaylı Masterland hedefi (assets/references/masterland-visual-target-v11.png), resmi Google Play sayfası https://play.google.com/store/apps/details?id=io.randomco.travel ve destekleyici oyun ekranları. Mağaza görselleri hareket sürelerini kanıtlamaz. Aşağıdaki süreler Masterland için önerilerdir; Travel Town'un ölçülmüş değerleri değildir.

## Ortak sanat dili

Turkuaz/lacivert ana yüzey, sıcak krem parşömen, kontrollü bal-altını kenarlar, Skara'nın yeşil tarlaları ve sıcak fırın ışığı. Büyük ve sade biçimli ürünler. Bir başlık ailesi ve okunaklı gövde fontu; kesin font dosyaları native örnekte seçilecek. Altın yalnız odak ve ödülleri vurgular. Kart, gölge ve buton durumları ekranlar arasında aynı aileden gelir.

## Ekranlar

1. **Ana tahta:** mevcut HUD–ilan–üretici–tahta–alt menü sırası korunur. 6×9 kapasite ve eşit kare hücreler, iki aynı üründen merge ve tek seçim vurgusu korunur. Hazır ilanda tüm şartlar karşılanmış sayaç ve Ver bulunur.
2. **Splash:** M amblemi ve Masterland adı, Skara'nın çiftlik/liman manzarası. OS açılışı statik olabilir; bu aşamaya oyun mantığı veya ses zorunluluğu eklenmez.
3. **Loading:** aynı kimlik ve sahne; gerçek yükleme işi ilerledikçe dolan bar. Yapay bekleme, reklam veya sahte süre yoktur. Yükleme hızlı biterse ekran gereksiz tutulmaz.
4. **Ürün açma/promote:** büyük üretici görseli, yatay ürün zinciri ve seçilen tek basamağın koşulları. Açık, keşfedilmiş, leveli eksik ve satın alınabilir durumları ayrıdır. Level koşulu sağlansa da satın almadan ürün açılmaz. Tarif sistemi eklenmez. Görseldeki fiyat ve level, yalnız konsept örneğidir; canlı veri JSON'dan gelir.
5. **Koleksiyon:** şehir ve üreticiye göre keşif albümü. Bilinmeyen ürünler ?, yeni keşifler küçük Yeni rozeti taşır. Depo ile karışmaz. Altın/XP ve sürpriz elmas ödülü mevcut motor kurallarına göre sunulur; elmas garanti edilmez.
6. **Şehir yolu:** harita, parşömen içine işlenmiş illüstrasyon hissi verir. Sıradan ilanlar değil, unvan/hediye/enerji/XP başarıları yol kenarındadır. Sağ kısayollar yalnız harita konumuna gider. Kilitli şehirler oynanabilir gibi gösterilmez.

## Hareket ve ses önerileri

| Olay | Görsel öneri | Süre hedefi | Ses |
|---|---|---|---|
| Üreticiye dokunma | Butonun iç çiziminde kısa basma, ürünün boş hücreye kısa yayı | 80–180 ms | Yumuşak ahşap/mallet varyasyonu |
| Merge | İki ürün birleşir, sonuç kısa ışık halkasıyla belirir | 180–260 ms | Hafif yükselen iki nota |
| Hazır ilan | Sabit yeşil Ver durumu; sürekli zıplama yok | Durum kalıcı | Geçişte kısa bildirim |
| İlan teslimi | Küçük altın/XP parçacıkları ilgili HUD alanına gider | 350–500 ms | Kısa sıcak ödül sesi |
| Ürün alanı açma | Kilit çözülür, silüet renklenir, zincirde tek basamak parlar | 350–600 ms | Tek kısa açılma vurgusu |
| Yeni keşif | Küçük yerinde kutlama; her merge'de tam ekran kesinti yok | 450–650 ms | Kristalimsi kısa nota |
| Loading | Ayrı değirmen kanadı ve çok hafif su/ışık hareketi | Yükleme boyunca | Otomatik müzik zorunlu değil |
| Başarı ödülü | Sandık kapağı açılır, gerçek ödüller görünür | 500–800 ms | Kısa çözülme akoru |

Hareketler seri üretim dokunuşlarını kilitlemez. Eşya seçimi büyüme veya eşleşme önerisi üretmez. Hareketi azalt ve ses kapatma tercihleri korunur. Sonsuz parıltı, bütün ekranı kaplayan konfeti ve üst üste ses yığılması kullanılmaz.

## Görselden uygulamaya geçiş

Bu PNG'ler sanat yönü çalışmasıdır. Üretim aracı kesin cihaz oranı, font metriği veya hücre geometrisi garantilemez. Görselin başarılı görünmesi pixel-perfect uygulama kabulü değildir.

1. Kullanıcı sanat yönünü ve ekran fikirlerini değerlendirir.
2. Seçilen ekran için hedef cihazda ölçülü React Native tasarım sahnesi hazırlanır. Safe area ve alt alan gerçek cihaz ölçüsünden gelir.
3. Arka plan, ikon, çerçeve ve düğme assetleri ayrı ve yazısız hazırlanır; metinler, sayılar, durumlar native kalır.
4. Aynı font dosyası ve ortak tasarım değerleri bütün ekranlarda kullanılır.
5. Aynı fixture ile ekran görüntüsü, üst üste karşılaştırma ve bölgesel fark haritası çıkarılır. Metin, sayılar ve geometri ayrıca kontrol edilir.
6. Kullanıcının native görünüm onayından sonra çalışan oyun bağlanır. PNG tek resim olarak uygulama arayüzü yapılmaz.

Görsel tutarlılık, semantik doğruluk ve etkileşim testleri ayrı kabul kapılarıdır. Rastgele tek bir benzerlik puanı bütün kaliteyi temsil etmez.

## Kullanıcının son düzeltmeleri

- Hücreler tekrar eşit kare olacaktır. Bu karar, önceki fotoğraftan alınan yatay hücre oranının yerine geçer. Raster örnekler kesin geometri ölçümü sayılmaz.
- Üretici ikonları ve rafı küçülür; şehir başlığı üstte başlar. Tahta yan kenarlara daha yakın ve daha uzun olur. Küçük şehir detayları yalnız kenarlarda kalır. Son kompakt çalışma 01-board-compact-v4.png içindedir; önceki adaylar tarihçedir.
- Harita çok sayıda başarıyı tek görsele sığdırmaz. Her şehir uzun, kaydırılan bir yola sahiptir; aynı anda yalnız görünür duraklar gösterilir. 06-city-route-long-v2.png bunun viewport örneğidir.
- Native uygulamada bütün şehri tek dev bitmap olarak büyütmek yerine birbirine bağlanan tekrar kullanılabilir sahne parçaları ve görünür alan için başarı bileşenleri kullanılmalıdır. Yatay şehir kısayolları ayrı sabit katmanda, scroll konumu şehir başına korunur. Bu teknik yaklaşım öneridir; performans ölçümü yapılmış sayılmaz.
- Diğer ekranların sanat yönü olumlu karşılandı. Görseldeki fiyatlar, keşif sayıları ve yükleme barı ekonomi veya gerçek ilerleme kararı değildir. Splash ve loading için üretim logosu tek ortak asset olarak hazırlanacaktır; konsept çizimlerindeki logo varyasyonları ayrı marka kararı değildir.

## Dosyalar ve üretim

Üretim modu: yerleşik imagegen. Her PNG için aynı adlı -prompt.txt dosyası korunur. Bütün adaylar assets/concepts/skara-v1 altında bulunur. index.html altı güncel ekranı ve uygulama kabul notlarını bir arada gösterir. Tahta ilk satırları ile alt boş satırları arasında raster oran farkı kalabilir; gerçek grid tek s kenarından 6s×9s olarak oluşturulmadan kare şartı tamamlandı sayılmaz.
