# Şehir teması ve bileşik ekran refaktörü

Durum: **çalışma sürüyor; piksel kabulü yok; yayın yapılmadı.**

Çalışma dalı: `codex/city-theme-composites-20261118`. Apple/TestFlight gönderimi kullanıcının son kararıyla beklemededir. Kanonik içerik kimlikleri, ekonomi değerleri, kayıt şeması ve sunucu ödül/silme sözleşmeleri bu turda değiştirilmedi.

## Referans sözleşmesi

Sanat yönü kaynakları `assets/concepts/city-refresh-v2` altındaki beş şehir panosu ve `assets/concepts/secondary-pages-v1` altındaki sekiz ikincil ekran panosudur. Hesap illüstrasyonu ortak, sırt sırta bir kadın ve bir erkektir; cinsiyet alanı veya seçimi yoktur. Kaynak panoların özgün PNG dosyaları korunur.

Bu panolar cihaz ölçüsünde değildir. Bazı örnek sayaçlar, depo yığın adetleri, hücre oranları ve navigasyon ayrıntıları birbiriyle veya mevcut oyun modeliyle tutarsızdır. Bunları mevcut oyun kurallarını koruyarak cihaz ölçülü nihai referanslara çevirme işlemi kullanıcı tarafından onaylanmıştır. Yeni native çıktılar kendiliğinden onaylı baseline yapılmaz.

Yeni manzara, çerçeve ve kontrol atlasları bu sanat yönünden üretilmiş uygulama adaylarıdır. Bunların üretilmiş olması özgün panolarla piksel eşitliği değildir. Tam istemler `production-layer-inputs.json`, `production-chrome-inputs.json` ve ikincil ekranların istem dosyalarındadır. Çalışma zamanı katmanları `mobile/assets/art/cities-v1` altındadır; boyut, alpha ve SHA-256 manifesti aynı klasördedir. Dinamik yazı, fiyat, sayaç ve şehir adları raster görüntü içine gömülmez.

## Bileşen sözleşmesi

| Kaynak | Sorumluluk |
| --- | --- |
| `cityTheme.ts` | Sabit şehir ID'sine bağlı değişmez malzeme, yazı, yüzey, seçim ve eylem renkleri; ortak durum renkleri |
| `CityThemeProvider.tsx` | Şehir değişiminde tema yayını; aynı şehirde bakiye/sayaç güncellemeleri için yeni tema nesnesi oluşturmaz |
| `cityArt.ts` | Metro'nun statik görsel referansları; sahne, çerçeve ve kontrol atlası birbirinden ayrıdır |
| `Skin.tsx` | Ölçülmüş atlas bölgeleri ve dokuz parçalı çerçeve; başlık, raf ve navigasyon için ortak malzeme katmanı |
| `PageShell.tsx` | Güvenli alanlar, sabit başlık/kapatma, kaydırma alanı ve sayfa geçişi; içeriği prop olarak alır |
| `PagePrimitives.tsx` | `PaperCard` header/content/footer yuvaları, seçim durumu, başlık ve fiziksel piksele hizalı kare ölçümü |
| `CityCard.tsx` | Şehir resmi, durum ve gerçek seyahat eylemi; seçme ile seyahat ayrı callback'lerdir |
| `CollectionPage.tsx`, `StoragePage.tsx`, `OrdersPage.tsx` | Oyun verisini ve eylemleri prop üzerinden alan ortak ekranlar |
| `Controls.tsx` | Tek buton, seçim, checkbox, ilerleme ve yazı dili; tema rengi ile durum rengi ayrıdır |
| `ProducerDetails.tsx` | Aynı ürün zincirini koleksiyon/üretici varyantlarıyla sunar; ayrı zincir ekranı kopyası yoktur |

Yeni şehir eklerken görünür isimden kimlik türetilmez. Kanonik ID için bir tema satırı, statik görsel referansları ve ölçülmüş atlas bölgeleri eklenir. Aynı ekranlar yeniden kullanılır; sayfa kopyası oluşturulmaz. Oyun içeriği ve kilitleri ayrı kanonik veri/kabul sürecine tabidir.

Depo tek eşya/slot modelini korur. Görseldeki yığın adetleri uygulanmadı. Seçim taşınabilen dizi indeksi yerine eşyanın kalıcı tile kimliğine bağlıdır. Tahta doluyken geri alma kapalıdır. İlanlarda eksik ürün eylemi mevcut üretim rehberini açar; ayrı tarif veya üretim mekaniği eklenmez.

## Performans ve kapsam sınırı

- Tahtadaki 54 hücrenin her birinde bulunan büyük atlas `Image` katmanı kaldırıldı. Ortak yüzey ve kare geometri native katmanlarla çizilir.
- Taşınan eşyanın hareketi ve üretici dokunma tanıması UI runtime üzerinde korunur. Görsel refaktör sürükleme mantığını JS press-state akışına taşımaz.
- Tema nesneleri sabit ve değişmezdir. Tema kökü yalnız şehir kimliğini dinler; bakiye veya zamanlayıcı için tema yeniden oluşturulmaz.
- Artık kullanılmayan eski kabuk/harita varlıkları başlangıç ön yüklemesinden çıkarıldı. Gelecek şehirlerin sahneleri açılışı bekletmez; şehir kartları gibi kullanıldıkları yüzeylerde yüklenir.
- Bunlar somut uygulama değişiklikleridir. FPS, açılış süresi veya bellek için ölçülmüş karşılaştırma olmadan “en hızlı” ya da performans kabulü tamamlandı iddiası yapılmaz.

## Yerel tema önizlemesi

`masterland://city-theme-review/city1` ile `city5` arasındaki yollar yalnız `EXPO_PUBLIC_DISTRIBUTION_CHANNEL=local` ve test modu birlikte açıkken temayı değiştirir. Query, farklı host/şema, ek path ve geçersiz ID reddedilir. Production/TestFlight bu önizlemeyi açamaz. Önizleme kayda şehir eklemez, kilit açmaz, kaynak yazmaz ve API çağrısı gerektirmez.

Beş tema turunda aynı Belenyaka geçici test kaydı kullanılır. Bu yüzden Demirdere veya İpekyolu malzemesi üzerinde Belenyaka ürünlerinin görünmesi tema izolasyonu testidir; o şehirlerin oynanabilir içerik kabulü değildir. Çalışma zamanı üretici planları hâlâ ilk iki şehir içindir; kalan üç şehir bu turda açılmadı.

## Doğrulama ve kabul

TypeScript ve lint geçti. Mevcut 170 test ile yeni yayın kanalı sınır testi toplam **171/171** geçti. Görsel kapının kendisi, eksik dosya, farklı ölçü ve tek piksel değişikliğiyle sınandı; bu test geçti.

İlk Release turu üç etkileşim testinde 35 ekran üretti. Görsel inceleme çerçevenin ilk satıra taşmasını yakaladı; bu sonuç kabul edilmedi. İkinci tur dört testte 40 ekran üretti; sayfa/depo akışı, beş tema, kare hücre/sürükleme ve ilan/rehber/başarı detayları geçti. Üçüncü turda koleksiyon varyantı ve optik çerçeve ölçüsü doğrulandı; inceleme koleksiyon zincirinin yanlış sekmeyi seçtiğini yakaladı. Dördüncü turda bu eşleme düzeltildi ve dört test yeniden geçti. Son kaynakla 41 kayıpsız cihaz görüntüsü alındı. Aynı derlemeyle mevcut Belenyaka–Badınca gidiş dönüş testi de 48.091 saniyede geçti: şehir ücreti bir kez alındı, üretim çalıştı ve her iki tahta korundu. Son kaynak için seçili native kabul toplam 5/5 testtir; bütün native test takımı çalıştırılmış sayılmaz.

Kanıt klasörü: `docs/verification/2026-11-18-city-theme`. Son görsel tur `pass-4`, gerçek şehir geçişi `pass-travel` altındadır. Kaynak dosyaları ve Hermes bundle SHA-256 değerleri `pass-4/source-manifest.json` içindedir. Tekrarlanan tam çözünürlüklü PNG turları yerelde korunur ve Git dışında tutulur; manifestler ile seçili kayıpsız örnekler sürümlenir. İnceleme indeksi aynı klasörün README dosyasıdır. QA kanalı yerel test modudur; backend ve reklam SDK'sı bu görsel turda kapalıdır. Bu kanıtlar gerçek kayıtlı hesap, bulut seçimi, Apple silme veya reklam ödülü kabulünün tekrarı değildir. Eski reklam/sunucu kabul belgeleri ayrı korunur.

`acceptance-manifest.json` beş şehir × on sekiz görünüm = 90 kabul durumu tanımlar. `scripts/verify-visual.py` aynı ölçü/renk metaverisini ve sıfır farklı pikseli arar; yeniden ölçekleme, maskeleme, tolerans veya otomatik baseline üretimi yapmaz. Son 90 durumun 33 tanesinde gerçek cihaz görüntüsü vardır; diğer durumların görüntüleri de açıktır. Şu an **0/90 kabul**, durum `not-accepted`: cihaz referansları hazırlanmıştır; eş durumlu uygulama karşılaştırması ve nihai piksel kabulü açıktır. Bu sayı benzerlik yüzdesi değildir; henüz piksel eşitliği ileri sürülmez.

```sh
python3 -m unittest scripts/test_verify_visual.py
python3 scripts/verify-visual.py docs/verification/2026-11-18-city-theme/acceptance-manifest.json --output docs/verification/2026-11-18-city-theme/acceptance-result.json
```

İkinci komut kabul tamamlanmadığı sürece sıfırdan farklı çıkış kodu verir. Eksik referansları mevcut ekranlardan kopyalamak kabul koşulunu karşılamaz.

## Açık işler

1. Kullanıcının cihaz ölçülü referans dönüşümü kararını almak ve özgün panolarla izlenebilir nihai referansları dondurmak.
2. Malzeme, ikon, hücre dokusu, tipografi, başlık/HUD yerleşimi ve ölçüleri referanslarla karşılaştırarak düzeltmek. Güncel native ekranlar özgün panolarla birebir değildir.
3. Kayıtlı hesap, bulut seçimi/silme, reklamın bekleme/iptal/ödül/günlük sınır ve tahta/depo dolu durumlarını aynı bileşenlerle sabit ve güvenli test verisi üzerinde görsel olarak doğrulamak.
4. Kompakt cihaz, TR/EN, büyük yazı ve azaltılmış hareket kontrollerini tamamlamak; performansı son görsel varlıklarla ölçmek.
5. Kalan üç şehrin kanonik oynanış içeriği ve ekonomi kabulünü tamamlamak. Görsel tema önizlemesi bu maddenin yerine geçmez.

Bu maddeler kapanmadan çalışma tamamlandı veya production'a hazır olarak işaretlenmez.

## Son Release sonuçları

| Kontrol | Sonuç | Süre |
| --- | --- | --- |
| Ortak sayfalar, seçili sekmeler, depo seçimi/geri alma | Geçti | 65.839 s |
| Beş şehir malzeme önizlemesi, bakiye ve kare geometri | Geçti | 80.511 s |
| Seçim, geçersiz sürükleme ve sonraki birleştirme | Geçti | 26.413 s |
| Koleksiyon varyantı, üretici, ilan/rehber, başarılar ve geri dönüş | Geçti | 27.059 s |
| Belenyaka–Badınca gerçek oynanabilir şehir gidiş dönüşü | Geçti | 48.091 s |

Son test paketleri `/private/tmp/masterland-city-theme-v4-20261118.xcresult` ve `/private/tmp/masterland-city-theme-travel-20261118.xcresult` altındadır. Bunlar görsel referans onayı değildir. Kanonik oyun/veri/hesap/reklam/kayıt dosyalarının Git diff'i bu turda boştur. Yerel çalışma dalı dışında deployment veya push yapılmadı.

## 18 Kasım gündüz — Referansa göre canlı bileşen yerleşimi

HUD, navigasyon, tahta üstü ilan/üretici rafı, sayfa kabuğu, koleksiyon, depo, market, hesap, eşya/üretici ayrıntıları, ilan/rehber, başarı, bulut seçimi ve hesap silme görünümleri ölçülü tasarım bileşenlerine taşınmıştır. Bağımsız tasarım sahnesi JSON’u üretim uygulamasında çizilmez. Üretim bileşenleri veri, eylem ve içerik prop’larıyla çalışır; hesap/reklam adaptörlerinin yerel hikâyeleri servis eylemi çağırmaz. Normal oyun kaydı veya API sözleşmesi değiştirilmemiştir. `presentation-review` bağlantıları ve doğrudan store çağrıları yalnız yerel test kanalında geçicidir; production ve TestFlight bunları reddeder.

174 birim testi, TypeScript ve lint geçti. Gerçek uygulama girişiyle ilk Release turu beş görünümü, ikinci tur 18 görünümü yakaladı. İkinci turda marketin aynı build ile tekrarlı yakalamaları sıfır farklı piksel verdi. Bu bir referans kabulü değildir. İlk cihaz referansına karşı markette 24 farklı piksel kalmıştır; bütün ekranlar kabul edilmiş değildir.

Kullanıcı açık simülatörde tasarım farkını tekrar vurguladı. Özgün onay panosuna dönülen denetim, ilk cihaz türetiminde Belenyaka seçili sekmesinin yanlış yeşil olduğunu ve silme sahnesinin yanlış dal nedeniyle misafir gövdesi çizdiğini buldu. `device-v1` bu nedenle tanısal/arşiv niteliğindedir; yüksek eşleşme yüzdeleri özgün panoya sanat yönü kabulü sayılamaz. Bu hatalar bağımsız `device-v2` hedeflerinde giderilir ve regresyon testleriyle korunur. Uygulama çıktısı hedefe dönüştürülmez; fark maskesi, yeniden ölçekleme veya tolerans eklenmez. Nihai görsel kabul hâlâ 0/90’dır.

İzlenen gerçek uygulama cihazı `Masterland-Store-Release-QA` (iPhone 16 Pro, iOS 18.6; 86077B48-3F9F-4254-B954-AB7E9D40FAD0) olarak açık tutulmuştur. Bağımsız referans çizicisi, karışmayı önlemek için ayrı `Masterland-Design-Reference-QA` cihazına (9B515014-32BB-4B21-B70F-F9FE5C8EC7BC) taşınmıştır. Referans çizicisi gerçek uygulama kabulü olarak gösterilmez. Android için ortak React Native/tema/veri sınırı korunur; Android çalıştırma ve piksel kabulü yapılmamıştır.

Son ara kontrol: 175 birim testi geçti; bunlardan biri, aynı depo indeksine gelen yinelenen geri alma eyleminin sonraki eşyayı taşımadığını doğrular. Depo eylemi beklenen tile kimliğini de denetler; kayıt şeması değişmez. Dördüncü Release turunda bağlı oyun eylemleri ve altı hedefli görünüm tekrar geçti. Bu turda yalnız Belenyaka depo görünümü ikinci cihaz hedefiyle sıfır farklı piksel verdi. Bu teknik sonuç, özgün panoya sanat yönü kabulü veya 90 durumun tamamının kabulü değildir. Diğer küçük farklar için kabul eşiği gevşetilmemiştir. Android production JS/asset export'u üretildi; native Android cihaz kabulü yapılmadı.

Beşinci Release turu üç testi geçti: 18 görünümün yakalanması (114,364 saniye), bağlı oyun eylemleri (15,791 saniye) ve seçim/geçersiz bırakma/sonraki sürükleme regresyonu (26,420 saniye). Aynı kaynakta depo ve tahta dolu depo, bağımsız ikinci cihaz hedefiyle sıfır farklı piksel vermiştir; markette 24 piksel farkı kalmıştır. Diğer görünümler ve sanat yönü denetimi açıktır. `pass-live-5` kaynak dosyası hash’lerini, gerçek uygulama Hermes hash’ini ve toleranssız karşılaştırmayı taşır. Kullanıcıya toplu ilan ürün vurgusu ile onay panosundaki yalnız seçili eşya vurgusu arasındaki tercih sorulmuştur; yanıt henüz gelmemiştir. Yanıt beklenirken diğer ekranlar uygulanmaya devam edilir.
