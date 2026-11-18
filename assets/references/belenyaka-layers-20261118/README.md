# Belenyaka iPhone katmanları

Kaynak, 17 Kasım 2026 saat 22.53.25 tarihli Belenyaka panosunun sol oyun ekranıdır. Çalışma alanı iPhone 16 Pro referansıyla aynı boyuttadır (1206 × 2622 piksel). Kaynak panelin oranı korunur.

Bileşimi kurmak için `00-zemin.png` dosyasını (0, 0) noktasına yerleştirin. `katmanlar.json` listesindeki şeffaf PNG’leri verilen sol üst köşe koordinatlarına ve sıralarına göre, yeniden ölçeklemeden üst üste koyun. Bu bileşim iPhone referansının bütün RGBA değerleriyle eşleşir. Yazı ve ikon dahil orijinal görünümü bu katmanlar saklar.

`bos-yuzeyler/` içinde canlı içerik yerleştirmeye uygun alternatifler bulunur. Bu sürümlerde metin, ikon ve örnek eşyaların kapattığı bölümler tamamlanmıştır. Üretici görselleri, menü simgeleri ve tahta öğeleri on-katmanlar dizininde ayrı PNG’lerdir. Boş yüzeylerin koordinatları katmanlar.json içindeki emptyFaceRect alanında bulunur. `zemin-temiz.png` arayüzsüz bağımsız manzaradır. Düzleştirilmiş kaynakta arayüzün altında kalan pikseller görünmediği için bu bölgeler yeniden oluşturulmuştur. Birebir piksel kontrolü, orijinal görünümlü katmanların birlikte kullanıldığı bileşim için geçerlidir.

Bağımsız zemin yerleşimi yerleşik ImageGen aracıyla üretildi. Belenyaka paneli düzenleme girdisi olarak kullanıldı. İstem, köyün üst manzarasını ve kadrajını korurken arayüzü kaldırmayı, kontrol alanlarının altında bal tonlu ahşabı ve tahtanın altında kesintisiz bahçeyi tamamlamayı istedi. Referansa hizalanan RGBA katmanları kaynak PNG’nin piksellerinden çıkarıldı.

Yerel tarayıcı önizlemesini açmak için `belenyaka.html` dosyasını açın. Üstteki seçenekler üç eşit kart, iki eşit kart ve iki farklı genişlikte kart gösterir. İlan kartının dokusu yatayda esner, köşe genişlikleri sabit kalır. Ver düğmesi ayrı bir PNG’dir. Önizlemede alt menü referans konumundan 18 fiziksel piksel yukarı alınmıştır. Bu yerleşimin varlık ve ölçü bilgileri `uyarlanabilir-yerlesim.json` dosyasındadır.
