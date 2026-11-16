# Rastgele üretim ve ilan arayüzü doğrulaması — 16 Kasım 2026

- Üretim rastgele boş hücreyi seçer. Dört yönde komşusuz boşluk varsa bu küme kullanılır; kalmadığında üretim herhangi bir boş hücrede devam eder. Mevcut eşyalar taşınmaz.
- Çok ürünlü ilanlarda her ürün ve karşılanan/gereken adedi gösterilir. Kart genişliği ve yatay kaydırma korunur. Ürün kılavuzu ve hızlı teslim değişmez.
- Üreticiler 44 yerine 48 ölçekli birimdir. Raf yüksekliği, tahta yerleşim formülü ve 54 kare hücre değişmemiştir. Tümü sabit ahşap kontrol; profil düğmesi HUD ebeveyninin dışına alınmıştır, dokunma alanı artık ebeveyn sınırında kalmaz. Üst info düğmesi kaldırılmıştır.

## Kontroller

TypeScript, ESLint ve 53 motor testi geçti. Release / iOS 18.6 / iPhone 16 Pro üzerinde beş hedefli native kontrol geçti: kare geometri/ilan kaydırma; rastgele yerleşim/profil/çok ürünlü ilan; seri üretim/bekleme; geçersiz bırakma/merge; tam sayfa ekranlar/depo. Yeni rastgele yerleşime bağlı eski native testlerin sabit indeks varsayımları gerçek ürün konumlarını bulacak şekilde güncellendi. Bu tur bütün tarihsel native test paketi tekrar çalıştırılmadı.

İlk turda görsel adet tekrarı ve alt boşluk sıkışması görüldü, düzeltildi. İkinci görsel test ScrollView test kimliği XCTest ağacında bulunmadığından başarısız oldu; görünür ilan koordinatlarıyla kaydırma sonrası aynı kontrol geçti. Başarısız ara tur gizlenmez. Son çok ürünlü ilan ve rastgele üretim ekranları görsel olarak incelendi.

TestFlight'taki 0.2.0 (2) değiştirilmedi; bu geliştirmeler yerel simülatör sürümündedir. Fiziksel telefona bu tur kurulmadı. Gerçek cihaz performans ölçümü veya bütün ekran için piksel özdeşliği iddia edilmez.
