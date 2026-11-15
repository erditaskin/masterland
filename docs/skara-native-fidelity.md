# Skara native görsel uygulaması — 15 Kasım 2026

## Kanonik hedef

Kullanıcının tekrar belirttiği kaynak `outputs/masterland/skara-concept-set-v1.zip` paketidir. Paket ve orijinal konseptler değiştirilmez. Tahta kaynağı `assets/concepts/skara-v1/01-board-compact-v4.png`, şehir yolu kaynağı `06-city-route-long-v2.png` dosyasıdır. Kare hücre kararı rasterdeki küçük oran tutarsızlıklarının önündedir.

## Uygulanan yapı

- Tahta tek fiziksel piksele hizalanan kenar ölçüsünden 6×9 kare hücre üretir. Son satır ayrı bir ölçü kullanmaz. Yerleşim HUD, kompakt ilanlar, üretici rafı ve alt navigasyonun kalan alanından hesaplanır.
- Tam ekran şehir arka planı tek görsel katmanıdır. Safe area yalnız etkileşimli içeriğe uygulanır. Başlık, ilanlar, üreticiler ve grid ayrı canlı katmanlardır.
- Native splash ilk root layout'unda gizlenir. Kayıt, font ve görseller hazır olana kadar gerçek ilerlemeli loading kullanılır. Üretim sürümünde yapay bekleme yoktur. `masterland://loading-review` yalnız inceleme sahnesidir; normal kaydı değiştirmez.
- Sayfalarda ortak kapatma konumu ve gövde ölçüsü kullanılır. Koleksiyon ve üretici sayfaları boş, yazısız krem panel ve yeşil/gold düğmeler kullanır. Harita referanstaki kıvrık parşömeni kullanır.
- Haritanın Skara alanı temizlenmiş kanonik görselden x=31, y=320, genişlik=675, yükseklik=1230 bölgesini eşit eksen ölçeğiyle gösterir. Bu bölümde gömülü yazı, ödül veya düğme yoktur.
- 402 pt ekran için parşömen 386 pt, harita sol kenarı 15 pt, harita genişliği 319 pt olur. Kaynaktaki sol kenar 31/851×402 = 14,64 pt, genişlik 675/851×402 = 318,86 pt değerindedir. Bu ölçüm yalnız harita resim alanına aittir; bütün ekran benzerlik puanı değildir.
- Her yol bölümü en fazla dört başarı gösterir. FlatList yalnız yakın bölümleri tutar; 200 başarı için de kartlar küçülmez. Sağdaki şehir ayraçları sabittir. Kaydırma konumu başarı ayrıntısından dönüşte korunur.
- Açık sandık, pusula, yıldız ve enerji şişesi ayrı alfa ikonlarıdır. Başlık, ilerleme ve ödül alma gerçek kayıttan çizilir. Görselde örnek olarak tamamlanmış görünen başarılar oyuncu adına tamamlanmaz.
- Seçili eşya yalnız çerçeveyle belirtilir. Eşleşebilen ikinci ürün vurgulanmaz. Sürükleme ve iki dokunuşla merge kuralları korunur.

## Asset kaynağı ve ses

Yeni rasterler yerleşik imagegen ile hazırlanmıştır; her birinin `-prompt.txt` dosyası asset yanında korunur. `skara-ui-chrome-v1.png` kanonik konseptin dokular için yerel kopyasıdır; kaynak açıklaması ayrı dosyadadır. Metin veya sayı içeren bütün ekran görüntüsü etkileşimlerin üstüne kaplanmaz.

Mevcut yedi ses önceden yüklenen oynatıcılardan çalınır; kısa buton geri bildirimi seri dokunmayı kilitlemez. Ses kapatma ve hareket azaltma tercihleri korunur. Bu tur yeni bir ses bestesi veya gerçek cihazda dinleme onayı olarak sunulmaz.

## Kabul sınırı

Native ekranlar cihazın çentik/safe area ölçülerine uyarlanır. Görsel fixture ile normal ilerleme ekranının sayıları farklı olabilir. Temizlenmiş arka plan orijinal kompozisyonu korur; raster bütün piksellerde özdeş değildir. Fonksiyonel testlerin geçmesi %100 görsel özdeşlik veya kullanıcı estetik kabulü anlamına gelmez.

## Doğrulama

TypeScript, ESLint ve 41 birim testi geçti. Masterland-QA, iOS 26.3 üzerinde Release derlemesinde 22 native test sıfır hatayla geçti (320,381 saniye). Son üretici ikon yerleşimi düzeltmesinden sonra etkilenen 5 test ayrıca sıfır hatayla geçti (82,161 saniye). Soğuk açılışta üretici görünür ve dokunulabilir; loading katmanı kalmamıştır.

Native ölçüm dosyası 402×874 pt ekran, 3× ölçek ve 54 adet 57×57 pt hücre doğrular. Harita, koleksiyon, loading ve üretici ekranlarının gerçek test görüntüleri görsel olarak incelendi. Device Hub penceresinde son Release'in açık olduğu ayrıca görüldü. Yalnız Masterland-QA simülatörü boot edilmiş durumdadır.

Kanıt paketleri: `/private/tmp/masterland-canonical-final.xcresult` ve son yerleşim kontrolü `/private/tmp/masterland-canonical-polish.xcresult`. Kullanıcıya sunulan yan yana ekranlar `outputs/masterland/native-canonical-v1/index.html` içindedir. Bu yol sohbet çıktıları altındadır; depo içine ikinci kez kopyalanmaz.
