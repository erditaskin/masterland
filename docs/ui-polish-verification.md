# Arayüz düzeltmeleri — 14 Kasım 2026

Üst HUD değerleri canlıdır; yazı tipi, ilan başlığı ve ahşap doku onaylı referansa yaklaştırılmıştır. Tek tam ekran arka plan korunur. Bütün ekranın pixel-perfect görsel kabulü ayrıca kullanıcı değerlendirmesini gerektirir.

İlan alanında üç eşit kart görünür. Kartta tek ürün görseli, ilk ürün miktarı, altın ve XP ödülü bulunur. Ek ürün sayısı +N daha ile gösterilir; tüm içerik Tümü sayfasında incelenir. Diğer ilanlar yatay kaydırılır. Deneme havuzu bir ana ve beş tekrar ilanından oluşur.

Alt menü artık ekran kırpımı değildir. Gerçek saydam simgeler ve ayrı yazılar, beş eşit sekmenin merkezindedir. Basma geri bildirimi ölçek değiştirmez. Tahta hücresi sabit boyutta seçili çerçeve gösterir. Sürükleme aynı boyutta görüntüyle yapılır; sistemin büyüyen önizlemesi kaldırılmıştır. Hücrelerin canlı model takibi sağlanmıştır.

Koleksiyon, Depo, Şehirler, Market, profil, üretici ve bilgi sayfaları ortak tam ekran parşömen/ahşap çerçevesini kullanır. İçerik kaydırılabilir; kapatma düğmesi sağ üsttedir. Yarım ekran drawer kullanılmaz.

## Doğrulama

31 model kontrolü ve 8 UI testi geçti. Üretim, aynı ürünleri birleştirme, görev teslimi, kayıt/yükleme, enerji, kare hücreler, sabit boyutlu seçim/sürükleme, eşit kartlar, yatay kaydırma ve tam ekran açma/kapatma doğrulandı. Son üç kart genişliği ve kart hizalı kaydırma ayarı ayrıca ilgili kaydırma testiyle kontrol edildi ve geçti.

Test paketi: /private/tmp/ultima-polish-final-suite.xcresult. İlgili son geometri/kaydırma testi: /private/tmp/ultima-three-card-paging-final.xcresult.

Görseller gerçek simülatör çıktısıdır. Bunlar, yeni bir tasarım mockup görseli değildir.
