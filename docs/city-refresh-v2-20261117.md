# İlk beş şehir görsel onay turu — 17 Kasım 2026

## Kullanıcı onayı

Kullanıcı son beş görselin genel yönünü onayladı. Bu dosyadaki önceki onay-bekleniyor ifadeleri üretim turlarının tarihsel durumudur. Güncel durum: görsel yön onaylı; asset ayrıştırması, kesin ekran ölçüleri, refaktör ve ölçülmüş piksel karşılaştırması bekleniyor. Production yayını beş harita hazırlandıktan sonra yapılacaktır. Önce mevcut uygulama ayrı bir yeni TestFlight build'i olarak teslim edilecektir.

## Son durum

Kullanıcının sonraki ad düzeltmeleriyle güncel beşli **Belenyaka, Badınca, Yalıkoru, Demirdere, İpekyolu** olmuştur. Kalan iki şehrin üretilmesi istenmiş ve beşli konsept paketine eklenmiştir. İpekyolu'nun manzarası dokuma/ticaret ailesi korunarak taş geçit ve kumaş tezgâhları boyunca uzanan ticaret yolu yerleşimi olarak yeniden çalışılmıştır. Bütün güncel pano etiketleri aynı adları kullanır. Alt bölümlerdeki ilk üçlü tur açıklamaları başlangıç aşamasının tarihçesidir; son durum bu bölümdür.

Ad değişiklikleri kanonik veri, mobil görünen ad/test referansları, belgeler ve web atlaslarına işlenmiştir. Sabit ID, kayıt, eşya/görev bağlantısı ve ekonomi değerleri korunur. Eski gerçek test ekranları geçmiş kanıtıdır ve ad düzeltmesi bahanesiyle değiştirilmez. Yeni konsept görüntüleri geçmiş test kanıtlarının yerine geçirilmez.

Yeni dosyalar: `assets/concepts/city-refresh-v2/04-demirdere-approval-v1.png` ve `assets/concepts/city-refresh-v2/05-ipekyolu-approval-v1.png`. Güncel beş görselin ölçü/hash bilgileri `manifest.json` içindedir. İlk üç istem setine ek olarak kalan iki üretimin normalize edilmiş istemleri ve son ad düzeltmelerinin istemleri aynı klasörde korunur. Yerleşik image_gen kullanılmıştır. Kullanıcı yeni panoları henüz onaylamamıştır.

## Kapsam ve durum

Kullanıcı, reklamlı ilk mağaza yayını öncesinde şehirler ekranını, butonları ve şehir temalarını yeniden ele almayı istedi. Önce ilk üç şehir için görseller üretilecek ve kullanıcı onayı alınacaktır. Ardından ilk beş şehir hedefi tamamlanıp production hazırlığına dönülecektir. Uygulama refaktörü onaylanan görselleri izleyecektir; bu tur uygulama, ekonomi, içerik kimlikleri veya canlı site değiştirilmemiştir.

Bu paketteki üç pano **öneridir; henüz kullanıcı onaylı değildir**. Her pano solda oyun ekranı, sağda şehir listesi, altta ortak kontrol örnekleri içerir. Bunlar uygulamadan alınmış ekran görüntüleri veya doğrudan üretime girecek ayrıştırılmış asset dosyaları değildir.

## Referanslar

- Kullanıcının paylaştığı canlı [atlas ağacı](https://masterland.app/atlas/tree/) HTTP 200 ile okunmuştur. İlk üç şehir ve malzeme aileleri yerel onaylı belgelerle karşılaştırılmıştır. Atlasın öneri statüsündeki tekil ürünleri onaylanmış yeni oyun zinciri sayılmamıştır.
- `sehir-gorsel-dili.md`: onaylı çevre ve malzeme aileleri.
- `sehir-isimleri-ve-konseptleri.md`, `isim-referanslari.md`, `data/content-reference.json`: adlar ve sabit kimlik sınırı.
- Mevcut gerçek Release oyun ekranı: `verification/2026-11-17-store-release/production-board-no-test-controls.png`. Bu görüntü yapısal referanstır; kullanıcının eleştirdiği mevcut ağır çerçeveleri aynen koruma onayı değildir.

## Üretilen öneriler

| Dosya | Sanat yönü | Şehirler ve butonlar |
| --- | --- | --- |
| `assets/concepts/city-refresh-v2/01-belenyaka-approval-v1.png` | Yeşil bahçeli köy, alçak taş duvar, açık meşe ve sınırlı pirinç. Deniz baskın değildir. | Büyük manzara kartları; yeşil birincil, krem ikincil, gri pasif durumlar. |
| `assets/concepts/city-refresh-v2/02-badinca-approval-v1.png` | Çiçekli pastane sokağı, boyalı ahşap, krem seramik ve bakır. | Gül rengi vurgu; aynı kart ve kontrol hiyerarşisi. |
| `assets/concepts/city-refresh-v2/03-yalikoru-approval-v1.png` | Turkuaz kıyı, iskele ve tekne atölyesi; deniz aşındırmış ahşap, halat ve demir. | Turkuaz vurgu; Yalıkoru önizleme olarak işaretlenir. |
| `assets/concepts/city-refresh-v2/04-demirdere-approval-v1.png` | Dağlık yeşil vadide taş atölyeler, cevher ve sıcak ocak ışığı; kesme taş, dövme demir ve bakır perçin. | Kehribar/bakır vurgu; beş şehir kartıyla tutarlı liste. |
| `assets/concepts/city-refresh-v2/05-ipekyolu-approval-v1.png` | Kumaş tezgâhları ve taş geçit boyunca uzanan ticaret yolu yerleşimi; ince ahşap, kumaş ve pirinç. | Mor/indigo vurgu; aynı beşli kart ve kontrol ailesi. |

Üç pano 1086×1448 pikseldir. Şehir kartlarının içindeki durumlar sunum örnekleridir; mevcut seviye/fiyat/erişim kurallarını değiştirmez. Yalıkoru'nun oyun görünümünün çizilmesi, mevcut uygulamada yeni oynanabilir şehir açıldığı anlamına gelmez. Yeni ana ekran geometrisi veya ürün sırası bu önerilerle kesinleşmemiştir.

## Üretim ve inceleme

Yerleşik `image_gen` kullanılmıştır; API/CLI fallback kullanılmamıştır. Tam istemler `assets/concepts/city-refresh-v2/prompts.json` içinde, dosya ölçüleri ve SHA-256 değerleri aynı klasördeki `manifest.json` içindedir. Önce Belenyaka taslağında hücre oranı/telefon görünümü düzeltilmiş; Badınca'daki yanlış mevcut-şehir metni ve iki seçili sekme görünümü ayrıca düzeltilmiştir. Son üç pano görsel olarak incelenmiştir. Bu inceleme ölçülmüş yüzde yüz piksel eşleşmesi değildir.

## Onaydan sonraki teknik referans

Önce sanat yönü, şehir listesi ve buton hiyerarşisi onaylanmalıdır. Sonra seçilen yön gerçek hedef ekranın sabit ölçüsünde tek ekran referanslarına dönüştürülecek; arka plan, kart illüstrasyonu, şeffaf çerçeve ve kontrol asset'leri ayrı hazırlanacaktır. Dinamik metin, sayı, sayaç ve erişim durumu native arayüzde kalacaktır.

6×9 kayıt kapasitesi ve matematiksel olarak eşit kare hücreler korunur. AI panosundaki yaklaşık geometri, kilit etiketi veya örnek seviye motor kuralına dönüşmez. Onaylanan nihai ekranlar aynı çözünürlük ve renk uzayında Release simülatör görüntüleriyle karşılaştırılır; farklar ölçülmeden yüzde yüz pixel-perfect sonucu raporlanmaz. Farklı telefon ölçüleri için uyarlanabilir yerleşim ayrıca doğrulanır.

Demirdere ve İpekyolu bu ilk üçlü onay turunda üretilmemiştir. Kullanıcının üçlü yön onayından sonra aynı ailede çalışılacaktır.

## Son ad eşitlemesi ve canlı doğrulama

Kullanıcının son Badınca düzeltmesi beş panonun şehir etiketlerine de uygulanmıştır. Bu bölüm önceki ilk üçlü aşama notlarını günceller. Beşli paket yalnız görsel öneridir; refaktör henüz başlamadı. Yeni adlar kaynak veride ve mobil metin/test referanslarında vardır, ancak fiziksel telefona bu ad değişikliği için yeni bir build kurulmamıştır.

Web `bc36e91` kaynak commit'i, `city-names-bc36e91-20261117` release'iyle canlıya alınmıştır. Paket SHA-256 doğrulanmış, CSP inline hash'leri yeniden üretilmiş ve Nginx yapılandırma testi geçmiştir. Her iki atlas gerçek tarayıcıda açılmıştır: ilk beş ad Belenyaka, Badınca, Yalıkoru, Demirdere ve İpekyolu'dur; eski görünen adlar canlı sayfa metninde yoktur. Ağaçta farklı şehir seçip yenilemede Belenyaka'ya dönme davranışı korunmuştur.

Kanonik JSON'un değişim öncesi sürümüyle karşılaştırması yalnız üç görünen adın değiştiğini doğrulamıştır; anahtar/ID, kayıt ve ekonomi değerleri korunmuştur. TypeScript ve 170 mobil test geçmiştir. Yeni Docker test konteyneri oluşturulmamıştır. Geçmiş gerçek test ekranları yeniden boyanmamış; yalnız güncel konsept panoları düzeltilmiştir.
