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


## 18 Kasım — Sonraki gerçek uygulama turları

Sekizinci Release turunda altı native test geçti. Bağlı depo/üretim/enerji eylemleri, 18 görünüm, hedefli altı görünüm, sürükleme regresyonu ve hesap hatası/silme onayı erişilebilirliği doğrulandı. Silme testi yalnız geçici sunumsal modelde çalışır; hesap veya sunucu silme çağrısı yapmaz. JavaScript tarafında 176 test geçti. Ortak butonlarda minimum 44 pt dokunma alanı, boyanan yüzün merkezi değiştirilmeden genişletilir. Bu geometri farklı ekran genişliklerinde sınanır. Android platformunda Apple düğmesi çizilmez; Google yerleşimi boşluğu kapatır.

`pass-live-8` bağımsız ikinci cihaz adayına karşı toleranssız ölçümü saklar. Depo ve dolu tahta deposu sıfır farklı piksel vermiştir. Diğer 16 görünüm eşleşmemiştir; örneğin tahta 2.900, şehir listesi 9.692 piksel farklıdır. Bunlar özgün onay panosuna sanat yönü kabulü değildir. Kabul 0/90 ve `not-accepted` kalır. Sonraki turda özgün panoda görülen hesap silüeti, şehir rengi ve HUD artı halkaları uygulamaya geri alınmaktadır. İkinci cihaz adayında bu ayrıntıların eksik olması, o adayın özgün kaynakla denetiminin henüz kapanmadığını gösterir. Uygulama ekranından referans üretilmez ve eşik gevşetilmez.

İlan ürünlerinin toplu yeşil vurgusu için henüz kullanıcı yanıtı yoktur. Son açık “panoya uy” talebine dayanan çalışma varsayımı, yalnız seçili eşyanın çerçevesini göstermektir. İlan kartlarının hazır/eksik bilgisi ve üretim rehberi korunur. Bu varsayım kesin kullanıcı kararı olarak kaydedilmez.


Onuncu gerçek uygulama turunda 18 görünüm ve erişilebilir hesap hata/silme onayı testi geçti. `pass-live-10` güncel PNG’leri, kaynak hash’lerini, Hermes hash’ini ve ikinci adayla toleranssız ölçümü içerir. HUD halkaları ve hesap silüeti artık uygulamada vardır; ikinci aday bunları eksik çizdiği için adayla fark sayıları artabilir. Bu nedenle aday güncel özgün pano kabulü olarak kullanılmaz. Kabul manifesti son gerçek görüntülere güncellenmiş, onay bayrakları kapalı bırakılmıştır.

Android production JavaScript/asset export’u `/private/tmp/masterland-android-ui-v10-20261118` altında başarıyla üretildi. Bu işlem native Android kabulü değildir. Export sırasında bulunan eksik Android AdMob uygulama kimliği için config plugin’e ayrı `EXPO_PUBLIC_ADMOB_ANDROID_APP_ID` alanı ve Google’ın resmî örnek kimliğiyle QA başlangıç değeri eklendi. Geçersiz/boş ve açık geçerli kimlik durumları doğrulandı. Android canlı reklam yayını öncesinde gerçek Android AdMob uygulama kimliği sağlanmalıdır. Kaynak: https://developers.google.com/admob/android/quick-start . iOS kimliği ve reklam ödül kapıları değişmedi.


## Özgün pano itirazından sonraki uygulama

Kullanıcının 15.28–15.29 yakın planlarıyla verdiği son düzeltme, türetilmiş cihaz hedeflerine karşı yüksek eşleşmeyi yeterli saymaz. Bu nedenle ikinci/üçüncü adayın eski yerleşimi kabul hedefi olarak kullanılmaz. Belenyaka hücre dokusu, çerçeve kenarları, üretici portreleri, şehir tabelası ve Türkçe filtre yüzü özgün onay panosundan ayrılmıştır. `tools/artwork/extract_approved_board.py` kaynak SHA, kesim koordinatları ve değişmeden ayrılan görüntü parçalarını yeniden üretir. Bütün ekranın görüntüsü uygulama olarak gösterilmez; tahta ve kontroller gerçek oyun verisi, jestleri ve ortak bileşenleriyle çalışır. Sabit Türkçe filtre yüzü erişilebilir gerçek Button üzerindedir; diğer dilde canlı metinli kontrol korunur. Şehir tabelası prop'u onaylı adla eşleşmezse canlı metinli ortak malzeme yolu çalışır.

Yeni hücre adımı kaynak 79:75 oranını fiziksel piksele hizalar. Üretici kutuları kaynak 84:87 oranını izler; referans metrikleri `data/ui-reference-layout.json` içindedir ve şehir bazında geçersiz kılınabilir. Normal oyuncu kaydı değiştirilmez. Karşılaştırmanın yalnız tahta örneği özgün panonun 15 eşyası, 99 enerji, 5 altın, 0 elmas ve ilk üretici açık durumuna taşınmıştır. Süt şişesi/yuvarlak ekmek gibi kanonik eşya resimleri özgün sürahi/uzun ekmek çiziminden hâlâ farklıdır; bütün ekran için kabul ileri sürülmez.

On beşinci Release turu tahta yakalaması, beş tema geçişi ve seçim/geçersiz bırakma/sonraki sürükleme testlerini geçti. 178 birim testi geçti. Önceki on dördüncü turdaki başarısızlık eski kare hücre beklentisiydi; yeni kaynak oranı beklenerek tekrar çalıştırıldı ve sürükleme geçti. Yeşil vurgu/pulse ve hareket azaltma testi on ikinci turda geçti. Sonraki tabela/filtre yüzü derlemesi ayrı kanıt olarak saklanır. Kabul hâlâ 0/90’dır.

## Son geçerli durum — 7×9 kare tahta ve şeffaf kabuk

Kullanıcının son kararı önceki 6×9/54 hücre ve 79:75 ölçümünden önceliklidir. Güncel tahta 63 kare hücredir; mevcut atlas korunur. Eski kayıt taşımaları yapılmaz. Normal kayıt alanı v3, kontrollü kayıt alanı v2 ile temiz başlangıç kullanılır. Canlı DB sıfırlanmamıştır; toplu sıfırlama lansmanda ayrı işlemdir.

Son onaylı sanat kaynağı `assets/references/approved-belenyaka-20261118/source.png` dosyasıdır. Kaynak 784×2007 pikseldir; kullanıcı sonradan mevcut atlası, 7×9 kare hücreleri ve yeşil ilan vurgularını kesinleştirmiştir. Önceki cihaz-v2/v3 karşılaştırmaları güncel kabul hedefi değildir. Kabul 0/90 olarak açıktır.

18.45–18.47 ekran görüntülerindeki sabit kesim izleri nedeniyle kontrol delikleri taşıyan ortam katmanı çalışma zamanından çıkarılmıştır. Temiz şehir manzarası kullanılır. `wood-composites-v2` altındaki raf ve menü built-in image_gen ile gerçek RGBA olarak üretilmiştir; metin, eşya veya sabit kilit içermez. Tam istemler `prompts.json` içindedir. Şeffaf dış pay yalnız paketleme sırasında kırpılır; alfa kanalı korunur. Raf şehir verisine göre beş veya altı kutuyu gösterir; altıdan fazla üreticide yatay kaydırılır. Koleksiyon ürünleri ve üretici grupları arasındaki boşluklar artırılmıştır.

177 birim testi, TypeScript ve lint geçti. On dokuzuncu gerçek Release turunda 63 hücre geometrisi, bağlı oyun eylemleri, tahta yakalaması ve sürükleme geçti. Yirminci turda üç native test geçti. Yirmi birinci turda büyük sayaç değerini tek satıra sığdıran düzeltme bağlı oyun eylemleriyle geçti. Bu testler piksel kabulü değildir; yeni şeffaf malzemelerin gerçek cihaz görüntüleri ayrıca incelenmektedir.

Yirmi ikinci Release turunda 18 sayfa görünümü ve 63 kare hücre geometrisi geçti. Koleksiyondaki sabit kesim izleri kaldırıldı; ürün ve grup aralıkları artırıldı. Yirmi üçüncü Release turunda tahta üzerindeki düz renk zemin de kaldırıldı; tabela, filtre, profil ve üretici köşeleri kırpıldı. Raf ile tahta arasındaki sabit şerit artık yoktur. Son gerçek görüntüler `pass-live-22` ve `pass-live-23` altındadır. Bu görsel düzeltmeler incelendi; beş şehrin tamamı için yüzde yüz piksel kabulü hâlâ verilmemiştir.
