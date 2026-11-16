# Yeni ekonomi ve New Haven çalışması — talep kaydı, 16 Kasım 2026

Durum: Gereksinimler incelendi. Kullanıcı plan kesinleşmeden soruların sorulmasını istedi. Yedi karar sorusu yanıtlandı; kapsam ve uygulama yetkisi onaylandı. Güncel kararlar docs/kararlar.md ve uygulama planı docs/milestone-plan-20261116.md içindedir. Bu belge nihai uygulama planı veya yeni ekonomi onayı değildir. Oyun kodu bu değerlendirme turunda değiştirilmedi.

## Kesinleşen yeni enerji kuralı

- Genel enerji birikim tavanı kaldırılır. Zamanla yenilenme yalnız 100'e kadar çalışır.
- Hediye, level, başarı veya satın alma ile gelen enerji 100 üzerine eklenir ve kullanıldığında zamanla geri kazanılmaz.
- Örnek: 100 + 25 ödül = 125. Enerji 90'a harcanırsa zamanla en fazla 100'e döner.
- Kalıcı kapasite satışı ve kapasite ödülü kaldırılır. Enerji artısı yalnız enerji satın alma/hediye akışını açar.
- Önceden kazanılmış enerji ve cüzdan bakiyeleri güncellemede azaltılmaz. Eski kapasite kayıt alanının dönüşümü açık ve tekrar çalıştırılabilir bir migration gerektirir.
- Mevcut 120 saniyede 1 dolum ve 100 üzerindeyken seçilebilen 1x/2x/3x/4x üretim davranışı yeni bir değişiklik istenmedikçe korunacak varsayımlardır.
- Üst HUD enerji sayısını tek başına gösterir; /100 veya artırılabilir kapasite göstermez. 100'e dolmaya kalan süre görünür, 100 ve üzerinde yanıltıcı dolum sayacı olmaz.
- Elmasla enerji paketleri eski 15 elmaslık kapasite örneğinden daha erişilebilir olacak şekilde yeniden dengelenir. Fiyat henüz kesinleşmedi.

## Şehir ve ekonomi

- Yeni şehre erişimde genel level koşulu ve tek seferlik altın giriş ücreti düşünülür. XP harcanmaz.
- Şehirler, tamamlanması zorunlu görev zincirleriyle gereksiz yere kilitlenmez. Haritada anlaşılır giriş/seçme düğmesi ve eksik koşul gösterimi gerekir.
- Kod incelemesinde New Haven ve Cove için travel_enabled=false görüldü. Oyuncunun level 6'da geçememesinin nedeni eksik görev değil, prototipte seyahatin kapalı oluşudur.
- İlk erişim ücreti ile yeniden ziyaret birbirinden ayrılmalıdır; tekrar her ziyarette giriş ücreti önerilmez.
- Yeni üretici, üst ürün alanı, depo genişletme ve şehir erişimi altın harcama alanları olarak birlikte dengelenmelidir.
- Ücretsiz oyuncu için Skara'dan New Haven'a geçiş süresi ve level eşiği soru olarak gönderildi.
- New Haven ileri fırıncılık/pastane ve pembe şehir teması taşır. Ana tahta/arayüz geometrisi ortak standardı korur.
- New Haven'ın bu tur oynanabilir kapsamı ve şehirler arası tahta/depo paylaşımı soruldu. Önceki Baker ustalığının yeni şehirde devam etmesi kararı korunur.

## Skara üretici zincirleri

- Kullanıcı Skara'nın beş üreticisine 7–12 arasında toplam merge basamağı uygulanmasını istedi.
- Sayılar içerik tasarlanırken dağıtılır; her açılışta veya oyuncuda yeniden rastgele zincir üretilmesi istenmiş sayılmaz.
- İki aynı ürün birleşerek bir üst ürünü verir. Ayrı malzemeleri karıştıran tarif sistemi eklenmez.
- Mevcut sabit item/producer ID'leri ve kayıtlar korunur. Yeni basamaklar kendi sabit ID ve ad anahtarlarını kullanır.
- Yeni ürün ikonları imagegen ile uygulamanın mevcut sanat stiline uygun, alfa arka planlı ve küçük boyutta ayırt edilebilir hazırlanır.
- 12. basamak, yalnız ilk ürünle üretimde 2048 ilk ürün değerindedir. Level/altın kilitleri, üretici güçleri, ilan ödülleri ve oynama süresi bu artışla birlikte hesaplanmalıdır.
- Yeni uzun zincirlerde koleksiyon ve ürün açma ekranları dört sütun/tek sabit atlas varsayımına bağlı kalamaz. Uzunluk içerik verisinden gelmelidir.

## Keşif ve özel ödüller

- Yeni keşifte kazanım ve parşömen kutlaması isteniyor. Açma ile ilk elde etmenin ayrı olay olup olmayacağı soruldu.
- Altın, elmas, enerji ve XP gibi ödüller içerik üzerinden ayarlanabilir olmalıdır. Özel mesaj, süsleme ve kutlama varyantı desteklenir.
- Özel şehir başarıları ve level ödülleri de aynı bildirim altyapısını kullanır.
- Sıradan ilan teslimleri hızlı kalır; her teslimde tam ekran ödül kesintisi eklenmez.
- Bildirimlerin otomatik/kullanıcı kapatmalı ayrımı soruldu.
- Teknik değerlendirme: ödül verme ile kutlama göstermek ayrılmalı; aynı ödül kimliği yeniden işlenince para/enerji ikinci kez verilmemelidir. Uygulama kapanırsa kazanım kaybolmamalı, bildirim kuyruğu tekrar para vermemelidir.
- Ödül miktarları henüz onaylanmış yeni ekonomi sayılmaz.

## HUD ve tamamlanabilirlik

- Level alanı daralır; kalkan içindeki sayı geometrik olarak ortalanır.
- Altın/elmas ikonları ve rakamları büyür. Ortak rakam fontu ve okunabilir boyut standardı kullanılır.
- Profil ve bilgi düğmeleri aşağı satıra alınabilir; HUD genişliği sayılara ayrılır.
- Güncel hafif glow oyuncu tarafından yeterince fark edilir bulunmadı. Tamamlanabilir ürün/ilan çerçevesi kısa ve küçük bir vurgu ile belirginleştirilmelidir.
- Seçili eşya büyümez ve merge eşi önerilmez. Hazır durum vurgusu bu davranışlarla karıştırılmaz.
- Efektte ortak UI-thread zamanlaması, yalnız küçük görsel katmanların değişmesi, hareket azaltma tercihi ve ekran görünür değilken animasyonun durması değerlendirilmelidir.

## İlan üretim rehberi

- Eksik ilana dokunmak tüm ilanlar listesini açmayacaktır.
- Yalnız o ilanın gerekli ürünlerini ve her ürünün hangi üreticiden, hangi ikili merge adımlarıyla elde edildiğini gösteren görsel rehber açılır.
- Çok ürünlü ilanda ürünler ayrı seçilebilir; oyuncunun açık/keşfedilmiş basamakları, kilit koşulları ve gereken adetler anlaşılır gösterilir.
- Tamamlanabilir ilanın hızlı Ver eylemi korunur. Tüm ilanlar mevcut ayrı Tümü düğmesinde kalabilir.
- Bu ekran yeni bir üretim/karışık tarif mekaniği değildir; mevcut merge zincirinin açıklamasıdır.

## Market ve gerçek para

- Market, yalnız cüzdan bakiyesi gösteren boş sayfa olmaktan çıkar.
- Altın/elmasla alınabilen oyun paketleri ve gerçek parayla alınabilecek altın/elmas paketleri ayrı ve anlaşılır fiyatlarla listelenir.
- Kullanıcının Apple Pay ifadesi için standart dijital ürün akışı Apple In-App Purchase / StoreKit olarak açıklanmıştır.
- Kaynaklar: https://developer.apple.com/design/human-interface-guidelines/apple-in-app-purchase ve https://docs.expo.dev/guides/in-app-purchases/
- Yerel StoreKit testi mi, App Store sandbox ve sunucu doğrulaması mı istendiği; mevcut ürün/backend bulunup bulunmadığı soruldu.
- Gerçek para ödülü yalnız istemcinin başarılı satın alma iddiasına dayanarak verilmemelidir. İptal, bekleyen ödeme, yeniden deneme ve yinelenen işlem için ayrı doğrulama gerekir.
- Gerçek ödeme onayı veya kullanıcı adına para harcama bu plan isteğinden çıkarılmaz.

## Doğrulama beklentisi

Mevcut telefon kaydı, yaklaşık level 6 ve 3000 altın/12 elmas örneği dahil korunmalıdır. Enerji 100 üzeri ödül, 100'e yenilenme, offline süre, saat geri gitmesi, eski kayıt dönüşümü, şehir erişim bedelinin tek sefer oluşu, farklı şehir envanteri, uzun zincir merge/ikonları, ödülün tek sefer verilmesi, bildirim kuyruğu, satın alma tekrarları ve görsel ilan rehberi için anlamlı kontroller gereklidir. Sayısal ekonomi simülasyonu ve gerçek Release simülatöründeki görsel/etkileşim incelemesi tamamlanmadan teslim edilmiş sayılmamalıdır.
