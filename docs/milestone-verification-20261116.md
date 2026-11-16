# Masterland — teslim ve doğrulama, 16 Kasım 2026

## Uygulanan kapsam

- Pasif enerji dolumu yalnız 100'e kadardır. Ödül/satın alma enerjisi 100 üzerinde birikir. Artırılabilir kapasite kaldırılmıştır. Enerji miktarı, dolum süresi ve daha büyük cüzdan göstergeleri HUD'a bağlanmıştır.
- Test sürümünde sağ altta enerji doldurma düğmesi vardır. 100 üzerinde enerji azaltılmaz. Production varsayılanında hem düğme hem test kredi eylemleri kapalıdır.
- Skara'nın beş zinciri 7/8/9/10/12; New Haven'ın dört zinciri 7/8/9/10 basamaktır. Eksik 60 ürün ve dört üretici portresi, iki alfa atlası içinde imagegen ile üretildi. New Haven için ayrı tam ekran arka plan üretildi. Özgün promptlar ve kesme koordinatları arşivdedir.
- New Haven seviye 12 ve tek seferlik 6.000 altınla açılır. Her şehir kendi tahta/depo/üreticisini korur; cüzdan ve XP ortaktır. Cove önizlemedir; bu tur oynanabilir ikinci şehir New Haven'dır.
- İlk keşif ödülleri, level ve özel başarı kutlamaları kayıtlı, tekrar ödenmeyen ödül kuyruğuna bağlıdır. Keşif bildirimi kısa ve otomatik; diğerleri dokunarak kapanır. Başarı mesajı ve süslemesi veriden değiştirilebilir.
- Eksik ilan kendine özel görsel üretim rehberini açar. Hazır ilan tek dokunuşla teslim edilir. Hazır çerçevede ortak, hafif UI-thread glow vardır; eşya büyümez.
- Market, altın/elmas harcamalarını ve gerçek StoreKit yerel test satın alma paketlerini içerir. Paket verildikten sonra kayıt yazımı tamamlanmadan StoreKit işlemi bitirilmez. İşlem ID'leri tekrar ödeme yapmaz.

## Doğrulama

TypeScript ve ESLint geçti. 51 motor testi geçti. Bütün üreticilerin bütün ara basamakları gerçek motorla merge edildi. Kayıt dönüşümü, sınır aşan enerji, şehir gidiş/dönüş ve tek seferlik ücret, keşif tekrar ödememe, test/production ayrımı ve işlem tekilliği kontrol edildi.

Son toplu Release turunda 10 native test sıfır hatayla geçti: sayfalar/depo; geometri ve kayan ilanlar; keşif/level kutlamaları; şehir gidiş/dönüş; enerji ve üretim rehberi; market harcamaları ve özelleştirilmiş başarı; StoreKit satın alma; hızlı üretim ve bekleme; iki dokunuşla merge/kilitli basamak; 54 eşit kare hücre ölçümü. Son ekran görüntüleri ayrıca görsel olarak incelendi.

Önceki turlardaki hatalar gizlenmedi: eski ilan kimliği varsayımı güncellendi; StoreKit kataloğu UI test paketine alındı; kaydırma testleri native erişilebilirlik ağacına uyarlandı. iOS 26.3 yerel StoreKit test ortamında SKInternalErrorDomain Code=3 görüldüğü için son satın alma doğrulaması kurulu iOS 18.6 simülatöründe yapıldı. İlk iOS 18.6 ödeme denemesi sonuç kutlamasını süre içinde göremedi; teşhis turu ve son toplu tur gerçek StoreKit işlemiyle geçti. Bu kayıt ilk denemede bütün testler geçti iddiası değildir.

İmzalı Release bağlı iPhone'a normal uygulamanın üzerine kuruldu ve devicectl ile başlatıldı. Kullanıcı kaydı sıfırlanmadı; telefon üzerine QA fixture'ı aktarılmadı. Bu turda fiziksel ekranın tamamına yeniden manuel görsel kabul veya FPS/pil/termal ölçümü yapılmadı. Kullanıcının fiziksel kabul testi ayrı kalır.

## Sınırlar ve kullanım

Gerçek para satışı henüz açık değildir. StoreKit test ürünleri, yerel Xcode StoreKit oturumu gerektirir; yalnız kurulumla telefonda App Store ürünleri varmış gibi davranılmaz. Altın/elmasla oyun içi paketler telefonda kullanılabilir. Canlı satış için sonraki aşamada mağaza ürünleri ve sunucuda doğrulama gerekir.

Süreler oyuncu telemetrisi değildir. Gerçek motor simülasyonu en düzenli ücretsiz oyuncu için ilk geçişi yaklaşık 19,9 saat; New Haven'a gerçekten geçtikten sonraki aralığı yaklaşık 75 saat ölçmüştür. Oturum kaçırma, seçilen ilanlar ve isteğe bağlı harcamalar sonucu değiştirir. Daha ileri şehirler eklenirken 5/7/9/11 günlük aralıklar ayrıca dengelenecektir.

Üretim/keşif ekran görüntülerindeki parşömenler geçici bildirimdir; şehir tabelasının kalıcı adı değildir. Tam ekran için yüzde 100 piksel özdeşliği veya cihaz performansı ölçülmeden böyle bir iddia yapılmamıştır.


Son fiziksel takip: Kurulumdan sonraki ilk devicectl başlatması başarılı döndü. Daha sonra kısa konsol kontrolü için yeniden başlatma denemesi telefon ekran kilidi nedeniyle Locked hatasıyla engellendi. Kilit aşılmadı; bu son deneme fiziksel görsel doğrulama veya çökme kanıtı sayılmaz. Kullanıcı kilidi açıp normal Masterland uygulamasını başlatarak fiziksel kabul testine devam edebilir.
