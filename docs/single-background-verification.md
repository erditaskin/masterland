# Tek tam ekran arka plan doğrulaması — 14 Kasım 2026

Katla Patla projesindeki tek ImageBackground ve cover yaklaşımı incelendi; Katla Patla değiştirilmedi. Ultima artık tek CityBackground1.png sahnesini pencerenin tamamında, oranını koruyarak gösterir. Ayrı üst gökyüzü, yan sahne parçaları ve alt dolgu bandı kullanılmaz. Güvenli alan payları yalnızca kontrollere uygulanır. Tahta ve butonlar gerçek etkileşimli arayüzdür.

Oyun verisi değişirken GeometryReader içindeki görünümün eski veriyi göstermesi de düzeltildi. CityCanvas, GameModel değişikliklerini doğrudan izler. Enerji, tahta, ilanlar ve sayaçlar canlı yenilenir.

## Doğrulama

- 31 model kontrolü geçti.
- iPhone 17 Pro: 6 UI testi geçti. İlk görev akışı, üretici satın alma, kayıt ve yeniden açılış, kısa dokunuşta tek enerji harcama, uzun basmada enerji harcamadan detay açma, kare hücreler, görsel konumlar ve tek arka planın pencereyi kaplaması doğrulandı.
- iPhone 13 Pro: tek arka plan kapsama testi geçti. Geometri testi, Device Hub açılış geçişi tamamlandıktan sonra aynı boyut şartlarıyla tekrar çalıştırıldı ve geçti. Dokuz satırın hücreleri kare ve eşit; üretici hedefi en az 44 pt.
- Gerçek simülatör görüntüleri her iki boyutta görsel olarak incelendi. Gökyüzü, kıyı ve çimen tek sahnede devam eder.

Sonuç paketleri: /private/tmp/ultima-single-bg-acceptance.xcresult, /private/tmp/ultima-single-bg-compact-acceptance.xcresult (kapsama testi; ilk geometri ölçümü açılış geçişine denk geldi), /private/tmp/ultima-compact-settled-geometry.xcresult.

Güncel ekran: assets/ui/skara-single-background-native.png. Görsel üretim yöntemi: yerleşik image_gen. Arka plan kaynağı: ios/Resources/CityBackground1.png. İstem: ios/Resources/single-background-prompt.txt.

Bu doğrulama bütün ekranın referansla pixel-perfect eşleştiği anlamına gelmez. Yeni arka plan çiziminin kullanıcı görsel onayı beklenmektedir. Önceki 1,82 ROI ölçümü eski parçalı uygulamaya aittir.
