# Masterland Release doğrulaması — 15 Kasım 2026

## Aktif teslim

Kök: `/Users/erdi/masterland`. Uygulama: `mobile/`. Bundle: `com.erditaskin.masterland`. Node 22, Expo 58, React Native 0.88, Hermes ve native Gesture Handler/Reanimated kullanılır.

Yeni ana simülatör: Masterland-QA, iPhone 17 Pro, iOS 26.3, UUID `79CE7236-EC0C-42C6-A937-1C3C016F6DEC`.

SwiftUI oyun kaynakları proje dışına `/Users/erdi/Documents/Codex/2026-11-14/kanki/work/swiftui-archive-20261115` altında arşivlenmiştir. Git deposuna SwiftUI oyun kaynakları, node_modules, Pods, üretilen native proje ve oyuncu kayıtları eklenmez. Native XCTest kaynakları otomatik UI kontrolü içindir.

## Kayıt aktarımı

Önceki RN kaydı kaynak dosya değiştirilmeden yeni uygulamanın Documents/migration-v2.json alanına kopyalandı. Kaynak SHA-256: `e81a77c7557f550a3e2d151a503f74350ec6f3d8a5425b887ffa31c241d797e5`. Aktarılan değerler XP 0, altın 0, elmas 0 idi. Uygulama schema 2 kaydını doğrular ve kendi normal kaydı yoksa bir kez alır. İnceleme ve QA oturumları bu normal kayda yazmaz.

## Kontrol kapsamı

TypeScript strict kontrolü ve lint geçti. 27 saf motor/tahta girdisi/kayıt dönüşümü testi geçti. Yeni Release derlemesi başarıyla tamamlandı. Hermes paketi production ve bytecode seçeneğiyle üretildi; uygulama Metro bağlantısı gerektirmez.

Seri üretimde önceki React Pressable sürümü 20 hızlı dokunuşun ikisini kaçırdı. Bu hata gizlenmedi; üretici girdisi native UI runtime Tap/LongPress algılamasına taşındı. Test, enerji ve eşya sayısını birlikte kontrol eder. Nihai simülatör sonuçları aşağıya eklenir.

## Kabul sınırı

Simülatör testleri gerçek cihaz FPS, ısı, pil veya haptik kalitesini kanıtlamaz. Masaüstü motor benchmarkı cihaz performansı değildir. Onaylı sanat hedefi V10’dur; yeni RN ekranının kullanıcı görsel kabulü henüz alınmamıştır. Test geçmesi pixel-perfect iddiası için yeterli değildir.

## Ana simülatör sonucu

Release iPhone 17 Pro üzerinde 6 UI testi, 0 hata, 82.528 saniye ile geçti. Sonuç paketi `/private/tmp/masterland-release-final.xcresult`; özet teslim klasöründe `release-test-summary.json` içindedir. Senaryolar: normal kayıt ve yeniden açma, tam ekran sayfalar ve depo, 54 hücrenin kare/eşit geometrisi ve yatay ilanlar, merge ile görev/üretici satın alma, 30 seri dokunuş ve üretici beklemesi, geçersiz bırakma ardından yeni sürükleme.

Son kaynakta sayfa açma/kapatma ve eşya seçimi için düşük sesli geri bildirim de eklendi. Tek native tap sesi, 65 ms hız sınırı ve aktif uygulama koşulu kullanılır. Ses kapalı tercihi korunur. Bu eklemeden sonra tip/lint yeniden geçti; son paket küçük ekran regresyonuna da alındı. Sesin estetik kalitesi için gerçek telefonda dinleme incelemesi hâlâ gereklidir.

Onaylı referansın nötr boş kâğıt bölgesi tek doku olarak tahtanın altında kullanılır. Karelerin çizgileri ve açık/koyu tonu ayrı katmandır; tahta nesneleri ve seçim alanı gerçek etkileşimli bileşenlerdir. İlan başlığı ahşap dokuludur; altın ödülü metin noktası yerine gerçek altın simgesi taşır. Seçili alt menüde sınırlı sıcak ışık vardır; yeşil basma parçası veya büyüyen seçim yoktur.

## Küçük ekran sonucu

Son ses eklemesini de içeren paket, Masterland-Compact-QA (iPhone 13 Pro, iOS 26.3.1, UUID 87EAC525-43A7-4F4A-8EDB-5626A5DA5F52) üzerinde 3/3 UI testini 41.540 saniyede geçti. Tam ekran sayfalar/depo, kare hücreler/yatay ilanlar ve 30 seri üretim/kapanan kapasite doğrulandı. Sonuç `/private/tmp/masterland-compact-final.xcresult`; teslim özeti compact-test-summary.json dosyasıdır. Ana simülatör de aynı son pakete güncellendi ve görsel inceleme oturumunda açık bırakıldı.

GitHub hedefi: https://github.com/erditaskin/masterland, dal main. Oyuncu kayıtları veya test videoları git deposuna konmaz. İkon özgün imagegen üretimidir; kaynak ve prompt mobile/assets/icon.png ile icon-prompt.txt içindedir. Font lisansları özgün OFL metinleriyle saklanır; lisans dosyalarındaki kaynak boşlukları değiştirilmemiştir.

## Güncel görsel/ses turu

15 Kasım 01.14.55 fotoğrafı ve kullanıcının hücre oranı seçimi sonrasında uygulama yeniden işlendi. Güncel ölçümler, 30 saf test, 8 ana ve 4 küçük ekran UI sonucu reference-fidelity-20261115.md dosyasındadır. Önceki ekranlar tarihçedir; son canlı sürümün görsel kanıtı olarak kullanılmaz. Yeni çerçeve, art sınırı metadata’sı, gerçek ilan çeşitliliği, birleşme ipucu ve özgün ses ailesi bu turda eklendi.


## 15 Kasım 2026 — Merge hatası sonrası uygulama geneli inceleme

Kullanıcı geri bildirimi sonrasında yalnız ekran görünümü değil, gerçek dokunma akışları yeniden incelendi. Aşağıdaki sorunlar düzeltildi:

- Merkez dışından tutulan eşyanın hedefi, kaynak hücre merkezi üzerinden hesaplanıyordu. Hedef artık parmağın gerçek bırakma konumundan belirlenir.
- Uzun basma, sonradan başlayan sürüklemeyi engelleyebiliyordu. Hareketsiz uzun basma yalnız bırakılınca ayrıntı açar; sürükleme ile yarışmaz.
- Seçili eşya ile aynı ürüne dokunmak artık sürüklemeyle aynı merge kontrolünü kullanır. Farklı ürüne dokunmak seçimi değiştirir.
- Kapalı üst ürün basamağında eşyalar korunur ve ilgili üreticinin level/altın koşulları açılır. Kilit ücretsiz aşılmaz.
- Tam ekran sayfalardaki işlem mesajları sayfanın arkasında kalıyordu. Geri bildirim katmanı sayfaların üstüne taşındı; engellenen işlem mesajı 2,4 saniye görünür.
- Depoya gönderme başarısız olursa eşya ayrıntısı kapanmaz.

Strict TypeScript ve lint geçti; 30 motor/girdi/yerleşim testi geçti. Ana iPhone 17 Pro Release simülatöründe 12/12 UI testi 168.256 saniyede, iPhone 13 Pro'da dört kritik regresyon 51.286 saniyede geçti. Gerçek yürütülen test özetleri verification/2026-11-15/app-review-*-tests.json dosyalarındadır. Ana turdan sonra yalnız Switch callback'inin dönüşü void olarak açıklandı; bu son kaynak küçük ekran derlemesinde de test edildi.

Ana tur normal kayıt ve yeniden açma, görev teslimi ve üretici satın alma, depo ve tam ekran sayfalar, kaydırılan ilanlar ve geometri, 30 seri üretim ve cooldown, yanlış bırakma ardından sonraki hareket, ses tercihinde tahta korunması, görsel ölçüm, uzun basarak merge, merkez dışı bırakma, tıklayarak merge ve kilit açıklaması, başarısız satın alma mesajının görünürlüğünü kapsar. Küçük ekranda son dört merge/geri bildirim regresyonu ayrıca çalıştırıldı.

Masaüstü Device Hub üzerinden tıklayarak ve sürükleyerek merge elle görüldü. Ayrıca 150 altın karşılığında Tahıl çuvalı basamağı açıldı; iki Buğday demeti tıklamayla birleştirildi, altın 750'den 600'e düştü ve üst ürün tahtada oluştu. Bu işlemler geçici inceleme modunda yapıldı; normal oyuncu kaydı değiştirilmedi.

İnceleme, uygulanmamış özellikleri tamamlanmış yapmaz: New Haven/Cove yolculuğu henüz oynanabilir değildir; market gerçek satın alma içermez. Fiziksel cihaz performansı/ses algısı ve bütün ekran için pixel-perfect kabulü bu test sonuçlarından çıkarılamaz. Tüm hataların bulunmuş olduğu iddia edilmez.

## Temalı şehir haritası doğrulaması

15 Kasım 2026 şehir haritası turunda strict TypeScript ve lint geçti. Ana Masterland-QA Release simülatöründe tam ekran sayfa/depo regresyonu ve üç şehirli harita senaryosu 2/2, sıfır hatayla 34.461 saniyede geçti. İnceleme oyuncusu level 4 olmasına rağmen New Haven ve Cove kapalı kaldı; tıklamalar 2. ve 5. seviye mesajlarını gösterdi. Skara tıklaması tahtaya döndü; altın ve tahta ürünleri korundu. Gerçek ekran görsel olarak incelendi; şehir etiketleri, bağlantı yolu ve Cove kilit mesajı çerçeve içinde kaldı. Yalnız ana simülatör kullanıldı. Test özeti verification/2026-11-15/city-map-tests.json içindedir.

Harita çizimi yerleşik imagegen aracıyla üretildi; mobile/assets/art/world-map-v1.png ve üretim tarifi world-map-v1-prompt.txt proje içinde korunur. İsimler, native butonlar ve kilit mesajları çizimin parçası değildir.


## Hızlı başlangıç, hazır ilan ve bölgesel yol turu

15 Kasım 2026 son kaynak üzerinde strict TypeScript ve lint temizdir. 33/33 motor/girdi/yerleşim testi geçti. İlk teslimattan sonra Değirmen'in, ikinci teslimattan sonra Fırın'ın hem level hem altın yönünden açılabildiği ayrı testle doğrulandı. Her üreticinin her üst basamak çifti, açık slot koşulunda test edildi; en üst basamakta iki kaynak korunarak açıklamalı engelleme doğrulandı. Ürün alanını satın almak keşif ödülü vermez; XP harcanmaz.

Ana Masterland-QA Release simülatöründe 15/15 UI testi 206.156 saniyede sıfır hatayla geçti. Sonuç flow-review-tests.json, motor çıktısı flow-unit-tests.txt içindedir. Başarısız ilk harita turunda kısayolun hareketi bitmeden yapılan ilk dokunuşun kaydırmayı durdurmaya gittiği görüldü. Kısayol anlık konum geçişi kullanır; butonun basma animasyonu korunur. Düzeltmeden sonra tüm UI turu yeniden çalıştırıldı ve geçti.

Yeni UI senaryoları: hazır ilanda iki dokunuşun tek ilanı iki kez ödememesi veya eksik ilan ekranını istemeden açmaması; ilk ödülle Değirmen satın alıp üretme; iki ayrı ücretli üst alanı açıp en üst buğday ürününe ulaşma; sağ şehir kısayollarıyla kaydırma, gelecekteki görev kilitleri, New Haven/Cove mesajları ve tahtaya kayıpsız dönüş. Normal kayıt, depo, ses, seri üretim, taşımada yanlış bırakma ve geometri testleri de aynı turdadır.

Gerçek ekranlar ayrıca incelendi. Hazır üç kartta yeşil çerçeve ve Ver alanı göründü. Device Hub üzerinden New Haven kısayoluna dokunulduğunda pembe bölge ve başlık anında geldi; kapatınca aynı tahta geri döndü. Yalnız ana simülatör açıktır. Gerçek telefon ve uzun vadeli ekonomi dengesi bu testlerle tamamlandı sayılmaz; tüm olası hataların yokluğu iddia edilmez.

Yeni çizim yerleşik imagegen ile üretildi: mobile/assets/art/world-map-v2.png; üretim tarifi world-map-v2-prompt.txt. Yeni şehirlerdeki kilitli düğümler oynanabilir yeni şehir içeriği değildir. Harita kaydırması aktif oyuncu şehrini değiştirmez. Mevcut kayıtların altını ve XP'si sıfırlanmaz; yeni fiyatlar gelecekteki satın alımlara uygulanır.


## 2026-11-15 — Enerji gücü, özel başarılar ve ferman arayüzü

- Motor testleri: 40/40 geçti. TypeScript ve lint kontrolleri geçti.
- İlk enerji/başarı sürümünde genel native testler: 17/17 geçti.
- Son dropdown ve parşömen sürümünde hedefli native testler: 7/7 geçti; 0 hata. Kayıt: `verification/2026-11-15/power-parchment-tests.json`.
- Üreticiye basılı tutma bitişik renkli 1x–4x menüsünü açar. Modal kullanmaz; dışarı dokunma kapatır. Seçim üreticiye özeldir.
- 100 enerji sınırı, 1/2/4/8 tüketim, kapasite yükseltmesi, tek seferlik başarı ödülü, seri üretim, sayfalar ve harita konumuna dönüş doğrulandı.
- Harita ve başarı sayfaları kıvrık kenarlı parşömen kullanır. Son görünüm Device Hub üzerinden ayrıca incelendi.
- Yalnızca Masterland-QA simülatörü açık bırakıldı. Normal kullanıcı kaydı sıfırlanmadı.
- Elmas ve hediye ile kapasite artışı çalışır. Gerçek para satın alma entegrasyonu henüz yoktur. Elmas maliyetleri ve başarı ödülleri prototip denge değerleridir.


## 15 Kasım 2026 — Birleşik parşömen sayfaları

TypeScript, lint ve diff boşluk kontrolü geçti. Son uygulama kodunda sayfa/depo etkileşimi ve haritadan dönüş konumu testleri geçti. Yeni ortak yerleşim testi ayrıca geçti: Koleksiyon, Depo, Market, Şehirler ve Özel Başarı kapatma başlıkları aynı koordinatlardadır; içerik ekran kenarlarından içeridedir ve harita viewportu kâğıdın alt kıvrımına taşmaz. İlk test denemelerinde native ScrollView kimliğinin Other sarmalayıcısında bulunması nedeniyle test sorgusu düzeltildi; bu hatalar geçilmiş test olarak sayılmadı. Gerçek Release ekranları tek tek incelendi. Görsel kullanıcı kabulü yerine test başarısı kullanılmaz.
