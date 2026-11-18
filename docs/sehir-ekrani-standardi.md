# Masterland şehir ekranı standardı

18 Kasım 2026 tarihinde onaylanan Belenyaka, diğer şehirler için uygulama referansıdır. Ortak standart katman yapısını, okunabilirliği ve etkileşim yerleşimini belirler. Şehrin sahnesi, malzemesi ve üretici görselleri kendi referansından ve [şehir görsel dilinden](sehir-gorsel-dili.md) gelir.

## Varlıklar ve canlı içerik

| Bölüm | Boş görsel varlık | Oyunun çizdiği içerik |
| --- | --- | --- |
| Şehir sahnesi | Kenardan kenara tek kesintisiz manzara. Tahtanın görünen yanlarına şehrin üretici ve ürün ailelerine ait ayrıntılar yerleştirilir. | Tümü dahil şehir içi sayfalar aynı sahneyi kullanır. |
| Üst bölüm ve cüzdan | Ayrı, şeffaf dış konturlu üst zemin, tabela, filtre, profil ve cüzdan kabukları. | Şehir adı, filtre yazısı, profil simgesi, seviye ve bakiyeler. Seviye görsel olarak güçlü kalır, enerji/altın/elmas değerleri daha küçük gösterilir. |
| İlan alanı | Hazır ve eksik durumlar için ayrı boş kart dokuları. Sol ve sağ köşeler sabit, orta yüzey yatayda esnek. | Kompakt ürün ikonları, her ürünün miktarı, altın/XP ve durum veya teslim eylemi. İki ve üç kart ile iki ve üç ürün isteyen ilanlar sığdıkları genişlikte gösterilir. |
| Üretici alanı | Şeffaf raf ve ayrı üretici görselleri. Raf, şehirdeki üretici sayısına ve yatay kaymaya uyum sağlar. | Enerji maliyeti, kilit, seviye, güç ve bekleme durumu. |
| Tahta | Şeffaf dış köşeli boş ızgara ve çerçeve. Belenyaka’nın uygulanan görsel referansı 6 × 9 hücredir. | Eşyalar, seçili ve ilan vurguları, hareketler, dokunma ve erişilebilir hücreler. |
| Alt menü | Şeffaf menü kabuğu ve ayrı seçili durum yüzeyi. | Tahta, Koleksiyon, Şehirler, Depo ve Market. Her ikon ve etiket kendi oyma yuvasında ortalanır. Alt güvenli alan korunur. |

İşlevlere ait yazı, sayı ve ikonlar yüzey PNG’lerine gömülmez. Şeffaf dış alan köy manzarasından örneklenmiş piksel taşımaz. Alt test düğmeleri oyuncu yerleşiminde bulunmaz. Tahtanın boş yüzeyi tek görsel olarak çizilebilir. Dinamik öğeler ve etkileşim katmanları ayrı işler.

## Belenyaka referansı ve ölçüler

Belenyaka’nın [uygulamadaki yerleşim verisi](../mobile/assets/art/belenyaka-html/layout.json) 1206 × 2622 iPhone referans uzayındadır. Üst panel açık, damarlı meşe dokusudur. Tahta çevresinde elma ağacı, meyve kasası, saman, süt kapları ve peynir görünür. Köy zemini bağımsızdır. İlan rayı, üst bölüm, tahta ve alt menü ortak merkez eksenine oturur. Piksel koordinatları, diğer şehirlerde aynı varlık dizilimini kurarken ölçü referansı olarak kullanılır.

Cihaz kanıtı için [Belenyaka kabul kaydı](verification/2026-11-18-belenyaka-standard/README.md) kullanılır.

## Sonraki bir şehre uygulama

1. Kullanıcının gönderdiği şehir referansında arka planı ve üst bölümü, cüzdanı, ilanları, üretici rafını, tahtayı ve alt menüyü belirle. Referansın o şehre özgü üretici ve ürün ayrıntılarını çıkar.
2. Şehir manzarasını tek tam ekran varlık olarak hazırla. Referanstaki arayüz bölümlerinin boş yüzeylerini ayrı RGBA varlıklar olarak üret ve dinamik içeriği var olan oyun bileşenlerinden çiz.
3. Varlıkları hedef şehre bağla. Simülatörde o şehri açıp ekranı kendi teması ve içerikleriyle göster. Her şehirde Belenyaka’nın malzemesi veya ürün görseli tekrarlanmaz.
4. iPhone Release simülatöründe iki ve üç ilan, iki ve üç ürün isteyen kart, Tümü ile aynı arka plan, tahta köşeleri ve alt menü hizasını kontrol et. Sonuçları hedef şehirden alınan ekran görüntüleriyle değerlendir.

## Tahta ikon ölçüsü ve ilan genişlikleri

Tahta ikonları kaynak atlasın görünür alfa sınırlarından ölçülür. Hücrenin hem yatay hem dikey ortasına oturur. İkon kutusu kısa hücre kenarının %79’u ölçüsündedir ve hazır ilan animasyonuna kenar payı bırakır. Sürükleme sırasında kaynak ikon gizlenir ve ayrı bir önizleme parmağı takip eder. Tek bir paylaşılan konum değeri önizlemenin dönüşümünü UI iş parçacığında günceller. Her hareket React render tetiklemez.

İlan rayında bir ürün 1×, iki ürün 1,25×, üç ürün 1,5× genişlik kullanır. Üç kartın birer farklı genişlikte aynı sıraya sığması hedeflenir. Daha fazla ilan yatay kaydırmayla erişilir.

6 × 9 tahtanın sol kenarı ve genişliği üst ilan paneliyle eşleşir. Tahtanın dikey ölçüsü yatay hizadan bağımsızdır. Üst panel ile tahta arasındaki boşluk, tahta ile alt menü arasındaki boşluğa eşittir. Tahtaya ayrılan yükseklik dokuz satıra dağıtılır. Ürün ilk temastan sürüklenebilir. Başka ürün üzerine bırakma yalnız eşleşmede değişiklik yapar, boş hücreye taşıma kullanılabilir.

Şehir içi sayfa başlıkları tek satırdır. Başlığın metni mevcut tabela genişliğini aştığında yazı boyutu otomatik küçülür. Ortalanmış başlık, tabela süsleri için ayrılan yatay boşluğu korur.

## Yalıkoru önizlemesi

Yalıkoru aynı yerleşim ve tahta etkileşimini kullanır. Liman sahnesi, halatlı tabela ve menü, beş üretici görseli ile altı kıyı ürünü Yalıkoru’ya özgüdür. Ortak cüzdan, ilan kartı ve tahta yüzeylerinde metinler ve ürünler canlı bileşenlerden gelir. Yerel test kanalında `masterland://presentation-review/yalikoru` geçici oynanabilir oturum açar.

## Ortak cüzdan, üretici rafı, menü ve şehir kartları

- Oynanabilir şehirler aynı üretici rafı yerleşimini kullanır. 1206 piksel referansında raf 1136 × 225, yatay iç pay 48, düşey iç pay 10 ve kart aralığı 14 pikseldir. Raf ortalıdır. Enerji ve geri sayım kartın alt bandında yer alır.
- Alt menüde beş yuva eşit genişliktedir. İki uç aynı iç payı kullanır. İkon, etiket ve seçili yüzey aynı yuvanın merkezine hizalanır.
- Şehir listesinde ardışık kartlar arasında 28 referans piksel ayırıcı boşluk vardır.
- Cüzdan soldan sağa seviye, enerji, altın, elmas ve Başarılar olarak sıralanır. Başarılar düğmesi açık şehrin kazanılmış sayısını gösterir. Ödülü alınabilecek ve alınmış kazanımlar bu sayıya dahildir.
- Her şehrin meslekleri ve birleşik unvanı `data/content-reference.json` içindeki `city_specialties` dizisinden, ortak eşik ve ödüller `city_delivery_ranks` dizisinden okunur. Her mesleğin kendi yedi basamağı vardır. Şehrin birleşik unvanı aynı basamak için bütün yerel meslek eşikleri karşılandığında açılır. Ödül detayda görünür ve bir kez alınır. Oynanabilir olmayan şehirlerin basamakları kilitli görünür.
- Kabul kontrolünü her oynanabilir şehirde tekrarlayın. Raf merkezini, beş eşit menü yuvasını, cüzdan sıralamasını, şehre özel başarı listesini ve önceki tahta davranışlarını kontrol edin. Şehir kartı aralığını ve en az bir hazır ödülün alınabildiğini de doğrulayın.

Alt menünün görsel referansı Yalıkoru'dur. Belenyaka ve Badınca'da aynı ahşap derinliği, eşit oyma yuvalar ve ortak seçili yüzey ölçüsü kullanılır. Şehir başına ahşap tonu, çerçeve süsü ve seçili renk değişebilir.

## TR/EN ve üretici durum bandı

- Atlasın başarı sözlüğü Türkçede Hevesli, Çırak, Kalfa, Uzman, Üstat, Usta ve Büyük Usta; İngilizcede Novice, Apprentice, Journeyman, Specialist, Savant, Master ve Grandmaster olarak uygulanır. Liste, detay, ödül bildirimi ve erişilebilirlik etiketleri aynı tanımı kullanır.
- Şehir, üretici ve ürün adları sabit kimlikleri üzerinden iki dilde çözülür. Şehir teslimleri, kazanım sayıları, ilan durumları ve para biçimi seçili dile göre gösterilir. Yeni şehrin ekranı her iki dilde doğrulanır.
- Standart üretici kartında durum bandı kart yüksekliğinin %73'ünde başlar ve %22'sini kaplar. Enerji, kilit ve süre aynı alt banda sığar. Kartın ana görseli, boyutu ve raf ortalaması korunur.

## Ortak market ve hesap

- Market ve Hesap tüm şehirlerde ortak ekran bileşenlerinden açılır. Hesap kapalıyken Apple, Google ve Facebook seçenekleri ayarlardan önce görünür. Bağlı hesapta ad soyad, e-posta, sağlayıcı, oturumu kapatma ve ayarlar aynı sırada gösterilir. Sağlayıcı görselleri şehirden bağımsızdır. Giriş satırlarında büyük rozet solda, yazı rozetin hemen yanında sola hizalıdır. Gümüş, şeker pembesi ve deniz mavisi pastel zeminler rozetlerden alınır.
- Hesapta manuel bulut kaydetme düğmesi bulunmaz. Oturum açılışında sunucu kaydı kalıcı ilerleme göstergelerinin tamamında cihazdaki kayda yetişmiş ve en az birinde ilerideyse tüm şehirlerin kaydı birlikte yüklenir. Cihaz ilerlemesi üstünse veya kayıtlar farklı alanlarda ileriyse hesap üzerine yazmadan önce onay alınır.
- Bulut eşitleme, mevcut sürüm denetimli kuyruk ile oturum, ağ ve uygulama yaşam döngüsüne göre çalışır. Test kayıtları buluta gönderilmez. Market teklifleri ve ödeme koşulları aynı ortak akışı kullanır.

## Demirdere ve İpekyolu

Demirdere'nin taş, demir ve bakır yüzeyleri ile İpekyolu'nun ahşap, mor kumaş ve pirinç yüzeyleri aynı standart yerleşime oturur. İki şehir 6 × 9 tahta, beş üretici, ortak kompakt durum bantları, ilan oranları, menü, market ve hesap akışını kullanır. Demirdere'de Madenci ve Demirci birleşince Metal Sanatkârı, İpekyolu'nda Terzi ve Tüccar birleşince İpek Taciri unvanı açılır.

Yerel test oturumu `masterland://presentation-review/demirdere` veya `masterland://presentation-review/ipekyolu` bağlantısıyla açılır. İki şehir aynı önizleme oturumunda Şehirler menüsünden gezilir. Her şehrin tahtası geçişler arasında korunur. Üretim, teslim, ödül ve eşya değişiklikleri önizleme kaydında kalır.
