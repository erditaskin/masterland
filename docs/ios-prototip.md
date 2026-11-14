# ultima iOS prototipi

14 Kasım 2026. Native SwiftUI uygulaması ios/Ultima.xcodeproj içindedir. Ultima şeması kullanılır. İlk oynanabilir kapsam Skara'dır; diğer şehirler haritada kilitli görünür. SwiftUI seçimi yerel Xcode ve iOS simülatörü ortamına göre yapılmıştır. Android uygulaması henüz yoktur.

## Oynama

Tarlaya dokunarak ürün çıkarın. İki aynı ürünü sürükleyerek veya sırayla dokunarak birleştirin. İlan ürünleri tamamlandığında ilana dokunarak teslim edin. Yeni üreticiye dokunarak satın alma ekranını açın. Açık üreticiye basılı tutarak ürün alanlarını geliştirin. Tahtadaki ürüne basılı tutarak depoya gönderin. Depodaki ürüne dokunarak tahtaya geri alın. Profilde ses ve hareket azaltma ayarları bulunur.

## Deneme ayarları

Onaylı Dayanıklılık değerleri: 100 kapasite, üretim başına 1, 120 saniyede 1 yenilenme. Henüz kesinleşmemiş varsayımlar: üreticide 30 kullanım, sonrasında 120 saniye dolum; ilk keşifte +1 XP ve %10 ihtimalle +1 elmas; depoda başlangıç 12 slot, her genişletmede +4; ilk genişletme 100 altın veya 5 elmas, sonraki genişletmeler doğrusal artar. Bunlar prototip denge ayarlarıdır. Level 6–10 XP eşikleri 320/480/680/920/1200 olarak deneme amaçlı tamamlandı. İlk altı giriş görevi ve açılış fiyatları onaylanan başlangıç tablosundan alınır. Tekrar eden ilan ödülleri ürün basamağı, level ve ilgili meslek ustalık XP'siyle artar; uzun vadeli rütbe eşikleri henüz uygulanmamıştır.

## Kayıt ve içerik

Uygulama oyun davranışını data/content-reference.json içindeki sabit kimliklerle yükler. ios/Resources/content-reference.json derleme kaynağıdır; içerik değiştiğinde bu kopya güncellenmelidir. Veri şemasının referans alanları eski tarihsel taslakları içerebilir; çalışma kaynağı city1_opening_plan içindeki güncel ürünler ve görevlerdir. İlerleme cihazın Application Support/ultima/save-v1.json dosyasına atomik olarak yazılır. Bozuk kayıt üzerine sessizce yazılmaz; kurtarma kopyası korunur. UI testleri ayrı ui-test-save.json dosyasını kullanır. Reklam, gerçek satın alma, hesap, bulut kayıt ve ikinci oynanabilir şehir bu prototipte yoktur.

## Görsel ve ses

V10 ortak şablonu çalışma referansıdır. Tahtanın 54 hücresi aynı s kenar ölçüsünü kullanır; son satır dahil bütün hücreler gerçek karedir. Üretici butonları 47 × 47 pt ve sabit konumludur. Özgün şehir panoraması ve 20 ürünlü sprite atlası yerleşik image_gen ile üretildi. Üretici illüstrasyonları onaylı V10 görselinden uygulamada okunur; son sanat paketi ayrı üretici varlıklarıyla değiştirilebilir. Sesler 65 ms uzunluğunda düşük sesli oluşturulmuş tonlardır; sesler aynı anda yığılmaz. Üretim/birleşme vurgusu, basma geri bildirimi ve azaltılmış hareket desteği vardır. Onaylı resmin bütün dokuları ve süslemeleri native arayüzde birebir uygulanmış değildir; bu sürüm ilk oynanabilir prototiptir. Nihai ses tasarımı ve cihazda duyumsal değerlendirme bekler.

## Tekrar test

Oyun motoru kontrolleri:

swiftc ios/Sources/GameModel.swift ios/Tests/EngineTests.swift -o /tmp/ultima-engine-tests
/tmp/ultima-engine-tests data/content-reference.json

Xcode üzerinden Ultima şemasını seçip Product > Test ile UI testini çalıştırın. Simülatör hedefi seçilmelidir. Test, ilk üç ilanı, üretici satın almayı, kare hücre ölçülerini, son satır eşitliğini, 44 pt üzeri üretici dokunma alanlarını, alt ekranları, Apprentice Farmer unvanını ve kapatıp açınca kaydın sürmesini kontrol eder. Test çalıştırmaları kullanıcı ilerlemesini sıfırlamaz.

Gerçek cihaz için Apple geliştirici imzalama ayarları daha sonra bağlanacaktır. Device Hub testi henüz yapılmadı.

Bu Xcode sürümünde simülatör arayüzü Device Hub uygulamasıdır. Ultima-Skara-QA simülatörü seçili ve oyun Level 1 başlangıcında açıktır. Fiziksel telefon seçili değildir; gerçek cihaz yüklemesi/testi yapılmadı.
