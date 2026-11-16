# Ekonomi, şehir ve ödül uygulama planı — 16 Kasım 2026

Durum: Uygulama ve Release simülatör doğrulaması tamamlandı; 51 motor testi ve 10 native kontrol geçti. Telefon kurulumu yapıldı. Fiziksel kullanıcı kabulü ve canlı satış bu aşamanın dışında kalır. Son kanıt ve sınırlar docs/milestone-verification-20261116.md içindedir.

## 1. Enerji ve kayıt güvenliği

Pasif dolumu 100 ile sınırla, ödül enerjisini sınırsız ekle. Eski kapasite alanını uyumluluk için okuyup etkisizleştir; mevcut enerji, para, keşif ve eşyaları koru. Tam doluyken geçen süre sonradan enerjiye dönüşmesin. HUD tek enerji sayısı ve 100'e kalan süreyi göstersin. Test derlemesi dolum düğmesi production'da hem görünüm hem işlem katmanında kapalı olsun.

Kabul: 100+25=125; 125'ten 90'a harcama sonrası dolum 100'de durur. Uygulama kapanıp açıldığında da aynı sonuç oluşur. Eski kayıt kaybolmaz.

## 2. İçerik ve ekonomi

Skara'nın beş zincirini 7–12 sabit basamağa genişlet. Mevcut ürün ID'lerini koru. Yeni ürün adları ve zincirler veri dosyasında tarafsız ID'lerle tanımlansın. Aynı iki ürün bir üst ürün verir; farklı ürünlerden tarif yoktur.

Enerji bütçesi, aktif oturumlar, üretici beklemesi, ürün maliyetleri ve ilan getirilerini birlikte simüle et. İlk erişim yaklaşık 1 gün; sonraki erişimler giderek uzasın. Altın giriş ücreti oyuncuyu geri dönüşsüz kilitlemesin. İlanlar yalnız erişilebilir ürünlerden üretilebilsin. Mevcut level 6 kaydına geriye dönük görev tamamlama zorunluluğu eklenmesin.

## 3. Şehir sistemi ve New Haven

Tek tasarım standardını koruyarak şehir bazlı üretici, ürün, ilan, tahta ve depo seçimini uygula. Haritada şehir koşulu, altın ücreti ve açık seyahat düğmesi bulunur. Satın alınmış giriş yeniden ücretlendirilmez. Şehir odağı ile gerçek oynanan şehir ayrımı açık kalır. New Haven pembe pastane görselleri ve 7–12 basamaklı kendi üreticileriyle oynanabilir olur.

## 4. Ödül ve kutlama

Keşif, level ve başarı ödüllerini kayıtla birlikte atomik ve tekrar ödenmeyecek şekilde işle. Görsel bildirimi ödül ödeme kaynağı yapma. Keşif küçük otomatik parşömen; level ve başarı daha büyük dokunarak kapanan parşömen kullanır. Çoklu level atlama ve arka arkaya keşifler kaybolmadan sıraya alınır. Süsleme ve mesaj içerik verisiyle özelleşir. Mevcut keşiflere yanlışlıkla toplu tekrar ödül verilmez.

## 5. HUD, ilan rehberi ve efekt

Level alanını daralt ve sayıyı ortala. Para ikonlarını ve rakamlarını büyüt; tek sayısal tipografi standardı kullan. Profil/bilgi alt satıra taşınabilir. Eksik ilana dokunma yalnız o ilanın üretici ve merge zincirini görsel adımlarla açar; çok ürünlü ilanda ürün seçilir. Hazır ilan doğrudan teslim edilir. Tümü bağlantısı ayrı kalır.

Hazır çerçevede küçük, anlaşılır ve ortak Reanimated değerinden çalışan opaklık parlaması kullan. Hücre ve eşya geometrisini büyütme. Hareketi azalt tercihine uy; görünmeyen ekranda animasyonu durdur.

## 6. Market

Altın/elmasla alınan oyun paketleri ile StoreKit test ürünlerini ayır. Gerçek olmayan satın alma başarılıymış gibi para yazma. İptal, bekleyen işlem, tekrar gelen işlem ve yetersiz bakiye yollarını doğrula. Canlı satış veya production ödeme doğrulaması bu turun tamamlanma şartı değildir; sonraki aşama olarak açıkça belirtilir.

## 7. Görsel üretim ve doğrulama

Eksik ürünleri imagegen ile mevcut sanat stilinde üret; ürünler küçük ölçekte birbirinden ayırt edilsin. Metin ve sayaçlar görsele gömülmesin. Yeşil Skara, oyma ahşap kabuk, kare 6×9 tahta ve kesintisiz arka plan korunur.

Her aşamada anlamlı motor testleri, TypeScript ve lint çalıştırılır. Son Release simülatöründe normal kayıt, soğuk açılış, seri üretim, iki merge yöntemi, üst basamaklar, şehir gidiş/dönüş, ücretin bir kez alınması, ödül kuyruğu, rehber, market test işlemleri, kenar taşmaları ve azaltılmış hareket kontrol edilir. Yeni hata varsa düzeltilip ilgili kontrol tekrarlanır. Sonrasında imzalı sürüm bağlı telefona yüklenir; kullanıcı kaydı sıfırlanmaz. Ölçülmeyen piksel uyumu veya performans iddiasında bulunulmaz.
