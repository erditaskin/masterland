# Test cüzdanı ve parşömen standardı — 16 Kasım 2026

Test altın/elmas düğmeleri mevcut bakiyeye her dokunuşta 10.000/100 ekler; XP, satın alma ve ödül kuyruğu oluşturmaz. Production motoru bu eylemleri reddeder. HUD eşit kaynak sayaçları, ortak ikon ve sayı ölçülerine geçmiştir. Üreticiler 52 ölçekli birimdir. İki ürünlü ilan 1,45 kat geniştir; gerçek genişliğe göre kaydırılır. Tahta geometrisi korunmuştur.

Ortak parşömen kontrol ailesi: AppButton, AppButtonStamp, AppCheckbox, AppInput, AppChoice, AppCloseButton, AppProgress. AppButtonStamp, mevcut tıklanabilir başarı kartında ikinci bir iç içe buton oluşturmaz. ActionButton aynı AppButton'dır. AppInput mevcut olmayan yeni bir alan yaratmaz; ortak input ihtiyacının standardını sağlar. Native switch yerine checkbox semantiği ve mürekkep işareti kullanılır.

## Doğrulama

- TypeScript ve ESLint geçti; 53 motor testi geçti. Test ve TestFlight kanallarında ardışık test kredisi ile production reddi doğrulandı.
- Release / iOS 18.6 / iPhone 16 Pro üzerinde beş farklı hedefli native test geçti: test cüzdanı/HUD/checkbox; rastgele üretim/geniş ilan; kare geometri/ilan kaydırma; ortak sayfa geometrisi; New Haven şehir geçişi ve dönüş.
- İki dokunuşla altın 20.000, elmas 200 oldu. Üç sayacın genişlik, yükseklik ve orta hizaları eşit ölçüldü. Üretici en az 52 birim, geniş ilan tekli ilanın en az 1,4 katı olarak ölçüldü.
- Son görüntüler görsel olarak incelendi. Geniş ilanın tümü görünür olacak konuma kaydırıldı; ilk uç kaydırma görüntüsündeki kısmi kesilmiş kart nihai görsel kanıt olarak kullanılmadı. Lint'in yakaladığı geçici mutable offset hesabı saf hesaplamayla değiştirildi ve tekrar geçti.
- Bütün tarihsel native test paketi veya fiziksel cihaz FPS/pil testi bu tur çalıştırılmadı. Yeni build telefona ve TestFlight'a yüklenmedi; mevcut incelemedeki 0.2.0 (2) aynıdır.

## Görseller

[Tahta ve geniş ilan](wide-orders.png)
[HUD ve test bakiyeleri](hud-test-wallet.png)
[Parşömen ayarları](parchment-settings.png)
[Harita alt eylemi](parchment-city-travel.png)
