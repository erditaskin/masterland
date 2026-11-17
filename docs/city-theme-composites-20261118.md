# Şehir teması ve bileşik ekran refaktörü

Durum: **çalışma sürüyor; piksel kabulü yok; yayın yapılmadı.**

Çalışma dalı: `codex/city-theme-composites-20261118`. Apple/TestFlight gönderimi kullanıcının son kararıyla beklemededir. Kanonik içerik kimlikleri, ekonomi değerleri, kayıt şeması ve sunucu ödül/silme sözleşmeleri bu turda değiştirilmedi.

## Referans sözleşmesi

Sanat yönü kaynakları `assets/concepts/city-refresh-v2` altındaki beş şehir panosu ve `assets/concepts/secondary-pages-v1` altındaki sekiz ikincil ekran panosudur. Hesap illüstrasyonu ortak, sırt sırta bir kadın ve bir erkektir; cinsiyet alanı veya seçimi yoktur. Kaynak panoların özgün PNG dosyaları korunur.

Bu panolar cihaz ölçüsünde değildir. Bazı örnek sayaçlar, depo yığın adetleri, hücre oranları ve navigasyon ayrıntıları birbiriyle veya mevcut oyun modeliyle tutarsızdır. Bunları mevcut oyun kurallarını koruyarak cihaz ölçülü nihai referanslara çevirme sorusu kullanıcıya gönderilmiştir; yanıt beklenmektedir. Yeni native çıktılar kendiliğinden onaylı baseline yapılmaz.

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

`acceptance-manifest.json` beş şehir × on sekiz görünüm = 90 kabul durumu tanımlar. `scripts/verify-visual.py` aynı ölçü/renk metaverisini ve sıfır farklı pikseli arar; yeniden ölçekleme, maskeleme, tolerans veya otomatik baseline üretimi yapmaz. Son 90 durumun 33 tanesinde gerçek cihaz görüntüsü vardır; diğer durumların görüntüleri de açıktır. Şu an **0/90 kabul**, durum `not-accepted`: cihaz ölçülü referans onayı beklenmektedir. Bu sayı benzerlik yüzdesi değildir; henüz piksel eşitliği ileri sürülmez.

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
