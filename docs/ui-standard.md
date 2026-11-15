# ultima ana tahta standardı

14 Kasım 2026. Güncel ekran standardı sürüm 6'dır. Skara Brae uygulaması `../assets/ui/ui-city1-v6.png` içindedir. Bu çalışma statik arayüz tasarımıdır; düğmeler henüz çalışan oyun koduna bağlı değildir.

## Kullanıcı tarafından belirlenen değişiklikler

- Tahtanın altındaki seçili eşya adı, seviye ve Depo şeridi kaldırılır.
- Depo alt menüden erişilir. Eşya bilgisi üst bölümdeki küçük bilgi düğmesiyle açılır.
- Tarla, Değirmen, Fırın ve Hasat kutuları eşya açma düğmeleridir. Önceki koleksiyon erişim kısayolu yorumu geçersizdir.
- Eşya açma düğmeleri küçük, eşit boylu ve yalnızca ikonludur. Tarla, Değirmen, Fırın ve Hasat yazıları görünmez. İsim anahtarları bilgi/erişilebilirlik için korunur. Liste çoğalabilir; yatay kaydırma kullanılır, dört düğmelik sabit limit yoktur.
- Şehir manzarasının görsel ağırlığı özgün kullanıcı referansındaki gibi korunur. Yer kazanımı şehirden değil ilan başlığı, ilan kartları, küçük yazısız üretim düğmeleri ve gereksiz boşluklardan sağlanır.
- İlan alanı şehrin satın alma ilan panosu olarak gösterilir.
- Unvanlar ana tahtada sürekli yazmaz. Profil veya şehrin tüm ilanları alanından erişilebilir; unvan veren hedefler ilgili ilan ayrıntısında gösterilebilir.

## Güncel ekran sırası

1. Genel level ve XP, dayanıklılık ve sayaç, altın ve premium para.
2. Belirgin şehir manzarası, şehir seçici, üst bilgi düğmesi ve sağ üstte profil erişimi. Şehir resmi dar bir şeride sıkıştırılmaz.
3. Şehir adına bağlı ilan panosu ve Tüm ilanlar erişimi. Ana tahtadaki ilanlarda alıcı adı ve portresi yerine siparişin ürün görseli, mevcut miktar/hedef ve altın/XP ödülleri öne çıkar. Hazır sipariş Teslim et eylemi gösterir.
4. Küçük ve eşit boylu eşya açma düğmeleri. Görselde yalnızca tarla, değirmen, fırın ve hasat ikonları gösterilir; altlarında yazı bulunmaz. Devam oku yatay gezinmeyi anlatır.
5. Ortak birleştirme tahtası. Aynı üretici için tahta üzerinde ikinci bir büyük düğme gösterilmez. Üretilen ürünler boş karelere gelir.
6. Alt menü önerisi: Tahta, Koleksiyon, Şehirler, Depo, Market. Önceki Etkinlikler sekmesi bu yerleşimde kaldırılır; etkinlik erişimi profil/şehir menüsünde ayrıca konumlandırılabilir.

## Etkileşim ve açık ayrıntılar

- Üretim düğmesine basıldığında ilgili havuzdan tahtadaki boş kareye malzeme gelir. Kullanıcı bu düğmelerin süreyle hazır olacağını ve enerjiyle kullanılacağını netleştirdi. Hazır düğmede enerji simgesi ve kullanım maliyeti; bekleyende soluk ikon, saat ve geri sayım gösterilir. Kesin süreler, kullanım maliyetleri, çıktı havuzları ve yeniden dolumun hangi kullanımdan sonra başlayacağı henüz belirlenmemiştir.
- Değirmen ve fırının kaynak tüketen ayrı tarif sistemi olması tanımlanmaz. İki aynı eşyanın birleşmesi kuralı korunur.
- Bilgi düğmesi seçili eşyanın ayrıntısını açar; eşya seçili değilken davranışı uygulamada netleştirilecektir.
- Depo ve eşya bilgisi erişimleri ayrıdır; sırf alt şerit kaldırıldı diye mevcut eşyalar veya depolama özelliği kaldırılmaz.
- Meslek ilerlemesi ve unvan kazanımı sürer. Yalnızca sürekli görünen ana ekran etiketleri kaldırılmıştır.
- Tüm ilanlar görünümünde ilgili başarı için hangi görevin yapılacağı ve hangi unvanın kazanılacağı gösterilebilir. Bu alt ekran henüz görselleştirilmemiştir.
- V3 görselinde daha uzun 6 × 9 tahta önerisi bulunur. Kullanıcı daha uzun tahta istemiştir; 54 karelik kapasiteyi ayrıca onaylamamıştır. Nihai kapasite, bakiyeler ve ödüller ekonomi çalışmasında netleştirilecektir.

## Sanat ve isim standardı

Lacivert, ölçülü pirinç/altın, parşömen ve sıcak boyanmış Orta Çağ kasabası sanat yönü korunur. Ürün ikonları şehir temasına uyar. Skara Brae tarım ve temel fırıncılık, New Haven ileri Baker/pastalar, Cove balıkçılık ve carpentry içeriğidir.

Şehir panosu başlığı `ui21_label_tr = {city_name} İlanları` şablonundan çözülür; şehir adı metne gömülmez. Tüm ilanlar, Depo, Profil ve Eşya bilgisi metinleri de ad sözlüğündeki anahtarlardan alınır. Eşya açma düğmeleri görünen adla değil ilgili içerik kimliğiyle bağlanacaktır.

## Görsel sürümleri

- Güncel Skara Brae: `../assets/ui/ui-city1-v6.png`.
- Üretim istemi: `../assets/ui/ui-city1-v6-prompt.txt`.
- Önceki Skara Brae v1 ve Cove v2 korunur; yeni standardı temsil etmez.
- Üretim yöntemi yerleşik image_gen aracıdır.

## Dikey alan önceliği

Ana oyun alanı ekranda yaklaşık yüzde 60 yüksekliğe çıkarılmıştır. Bu görsel oran uygulamada cihaz boyutu ve güvenli alanlarla doğrulanacaktır. Şehir manzarası özgün referanstaki gibi belirgin kalır. İlanlar tek kısa kart sırasına, üretim kontrolleri yazısız küçük ikonlara iner. Büyük tekrar eden ilan başlığı kaldırılabilir; Tüm ilanlar erişimi korunur.

## Şehir manzarası düzeltmesi

Kullanıcı şehir görünümünün kısaltılmasını istemediğini açıkça belirtti. V3 dar şehir şeridi yaklaşımı geri alındı. V4, özgün 18.54.10 referansındaki manzarayı koruyan kompozisyonu esas alır.

## Üretici durumları ve ortak pano

- Üretim rafının iki yanında sağ ve sol gezinme oku bulunur. Bunlar üretici grubunu kaydırır; kendileri malzeme üretmez.
- Üretim düğmeleri küçük, aynı boyda ve birbirine yakın tutulur; adları ana ekranda yazılmaz. Maliyet ve sayaç metinleri durum bilgisi olarak kalır.
- Süre bekleyen üretim düğmesi kullanılabilir düğmeden görsel olarak ayrılır. Sayaç örnekleri olan 02:15, 00:48 ve 1 enerji kesin ekonomi parametreleri değildir.
- İlanlar pirinç çivilerle kısa ahşap panoya sabitlenen satın alma notlarıdır. Üretim rafı ve tahta bu panoyla aynı orta eksende, şehir ön planıyla bütünleşik görünür.
- Şehir resmi, açısı ve belirginliği korunur. İlan ve ikon grubu yukarı alınarak oyun alanının daha erken başlaması hedeflenir; tahta yüksekliği korunur ve mümkün olduğunca artırılır.

## Ürün odaklı ilan ve daha uzun tahta

Kullanıcı Skara Brae başlığının biraz yukarı alınmasını ve alıcı adlarının kaldırılmasını istedi. V6 tasarımında adlar ve portreler kaldırılarak ürün görselleri büyütüldü. Kısa ilanlar ve yukarı taşınan başlık/üretim grubu ile tahtaya daha fazla yükseklik ayrıldı. Şehir manzarasının açısı ve belirginliği korunur. Depo davranışı `depo-ve-oduller.md` içinde tanımlanır.


## Skara v7 güncel tasarım önerisi

Güncel inceleme görseli assets/ui/ui-city1-v7.png dosyasıdır. Statik tasarımdır; çalışan oyun ekranı değildir. Kullanıcının ilk şehirli referansı temel alınmıştır. Şehir manzarası korunur; kısa ahşap ilan panosu ve küçük ikon üreticilerinin altında uzun 6 × 9 tahta önerilir. Ürünler Skara'nın tarım, değirmen, ekmek ve süt temasına çevrilmiştir. Alt menü Tahta, Koleksiyon, Şehirler, Depo ve Market'tir. Bakiyeler, sayaç ve dayanıklılık maliyetleri görselleştirme değeridir.

### Üretici geliştirme akışı önerisi

Normal dokunuş hazır üreticiden enerji harcayarak ürün çıkarır. Üreticiye uzun basma veya küçük geliştirme rozeti üretici ayrıntısını açar. Ayrıntıda dört basamak, mevcut kapasite ve sıradaki ürünün level/altın şartı gösterilir. Ana tahtaya büyük geliştirme paneli yerleştirilmez. Rozet yalnızca alınabilir geliştirme varsa görünür. Kapalı üretici leveli gelene kadar kilitli görünür; leveli gelince satın alma ayrıntısı açılır, otomatik ödeme yapılmaz.

Durumlar yalnızca renkle anlatılmaz: hazır üreticide şimşek ve maliyet, bekleyende saat ve sayaç, kapalıda kilit ve level; leveli gelmiş ancak satın alınmamış üreticide altın şartı gösterilir. Üreticiyle ilişkili sabit ID kullanılır. Görselin Level 4 örneğinde ilk dört üretici açık, meyve bahçesi Level 5 kilitlidir. Bu anlık görünüm ilk altı görevin birebir ekran görüntüsü değildir; tekrar eden ilan havuzunu temsil eder.

İlanlarda alıcı adı veya unvan yerine istenen her ürünün kendi sayacı ve ilanın tek ortak altın/XP ödülü bulunur. Ayrı malzemeler aynı siparişte teslim edilir; yeni ürün oluşturulmaz. Üretici rafı yatay kayar; ikonlar çoğaldıkça tahta küçültülmez. Görseldeki 6 × 9 kapasite cihazda test edilmemiş tasarım önerisidir. Kullanılabilir dokunma alanları uygulamada en az 44 × 44 pt hedefiyle doğrulanacaktır.

Koleksiyon, ürün kapasitesi açılışına ve kalıcı keşiflere erişir. Depo yalnızca tahtadaki fazla ürünleri saklar; üretici ürün slotu ve depo slotu ayrı ekran metinleriyle anlatılır. Görsel üretimi yerleşik image_gen aracıyla yapıldı; istem assets/ui/ui-city1-v7-prompt.txt dosyasında korunur.


## 14 Kasım 2026 kare slotlar ve şehir temalı kenarlar

Kullanıcı v7 tasarımının genelini onayladı; tahta slotlarının kare veya kareye yakın olmasını istedi. Tahta ekranın yanlarına dayanmak zorunda değildir. Tahta yüksekliği korunarak genişliği azaltılır ve ortalanır. Yan boşluklar şehir temasına göre dekor taşır; Skara örneğinde sarmaşık ve buğday kullanılır. Dekor slotların ve etkileşimlerin üstüne taşmaz. Güncel görsel assets/ui/ui-city1-v8.png dosyasıdır. Önceki v7 korunur. Görsel altı sütun ve dokuz satır önerisini sürdürür; kapasite ayrıca onaylanmış değildir. Uygulamada hücreler en-boy oranı 1:1 ile boyutlandırılacak, cihazda dokunma alanı doğrulanacaktır.


## 14 Kasım 2026 tahta ve kenar referansları düzeltmesi

Kullanıcı v8 dar tahta ve kenar tasarımını reddetti. 13 Kasım tarihli iki yeni ekranı tahta ve çevre referansı olarak verdi. V8 güncel tasarım değildir; tarihçe olarak korunur. Yeni v9 önerisi, geniş oyun yüzeyi, ayrı yuvarlak kutular yerine düz ve ince kareli zemin, ince ahşap çerçeve, dar doğal çimen kenarları ve alt köşelerde sınırlı bitki kullanır. Koyu taş duvarlar ve simetrik uzun sarmaşıklar kaldırılır. Şehir manzarası ve önceki üst/alt kontroller korunur. Yeni referansların maden, kar, karakter portresi veya ayrı üretim eylemleri oyuna aktarılmaz. Görsel assets/ui/ui-city1-v9.png dosyasıdır ve henüz kullanıcı onayı almamıştır. Üretilmiş görselde hücreler tam geometrik kare değildir; uygulamada hedef kare oranı cihaz yerleşiminde doğrulanacaktır.


## 14 Kasım 2026 eşit kare hücreler ve seri üretim dokunuşları

Kullanıcı v9 genel sanat yönünü beğendi; yatay üretici düğmelerinin kareye yakın olmasını ve son satır dahil bütün tahta hücrelerinin aynı ölçüde kare olmasını istedi. Seri dokunma temel kullanım senaryosudur. Üretici düğmeleri sabit konum ve sabit dokunma alanı taşır; sayaç, rozet veya animasyon düğmenin konumunu ve boyunu değiştirmez. Kaydırma okları ayrı alandadır. Üretim animasyonları yeni geçerli dokunuşları gereksiz yere engellememelidir. Bu etkileşim uygulaması cihazda test edilecektir.

Uygulama yerleşim kuralı: bütün hücreler tek s kenar ölçüsünden türetilir; 6 × 9 önerisinde iç genişlik 6s, iç yükseklik 9s olur. Son satır kırpılmaz veya daraltılmaz. Kullanılabilir genişlik ve yükseklikten s = min(genişlik/6, yükseklik/9) hesaplanır ve tahta ortalanır. Üretici dokunma alanları en az 44 × 44 pt hedefler.

Güncel görsel assets/ui/ui-city1-v10.png dosyasıdır. Kareye yakın üretici düğmeleri ve daha dengeli hücreler gösterilir. Raster üretim, hücre ölçülerinin matematiksel eşitliğinin kanıtı değildir; kesin eşitlik yukarıdaki yerleşim kuralıyla uygulanmalıdır. Bu görsel inceleme önerisidir; oyun kodu yazılmadı.


## 14 Kasım 2026 ortak şehir şablonu onayı ve etkileşim standardı

Kullanıcı son üretilen Skara v10 tasarımını bütün şehirler için temel şablon olarak açıkça onayladı. Sonraki şehirler bu yerleşim üzerinde ilerler; şehir manzarası, ürünler, üretici ikonları ve çevre dekoru şehir temasına uyarlanır. Ortak HUD, ilan panosu, üretici rafı, tahta ve alt gezinme yapısı korunur. Görselin onayı, örnek bakiyeleri ve bütün ekonomi değerlerini otomatik olarak kesinleştirmez. Kare hücre ve eşit satır ölçüleri uygulamada korunacaktır.

Kullanıcı bütün butonların etkileşimli ve animasyonlu olmasını, küçük ve tatlı seslerle desteklenmesini istedi. Önerilen geri bildirimler: basmada küçük ölçek değişimi ve bırakmada yumuşak toparlanma; üretimde kısa ürün çıkış hareketi; başarılı birleşmede kısa birleşme vurgusu; ilan tesliminde altın/XP akışı; yeni keşifte kısa kutlama; level atlamada kısa kutlama. Animasyonlar seri dokunmayı engellemez, butonların yerleşim ölçüsünü değiştirmez ve etkileşim alanını kaydırmaz.

Sesler kısa ve yumuşak olmalıdır. Seri üretim sırasında sesler sınırsız üst üste binmez; eşzamanlı ses sınırı ve kısa ses varyasyonları uygulama önerisidir. Kilitli veya kullanılamayan butonlar durumunu açıklar ve uygun kısa geri bildirim verir; kaynak tüketmez. Ses açma/kapatma, hareket azaltma ve varsa titreşim ayarlarının kapsamı kodlama öncesi netleştirilecektir. Nihai ses varlıkları ve kesin animasyon süreleri henüz seçilmedi.


## 14 Kasım 2026 native görsel kabulü ve tam sayfa

Kullanıcı ilk çalışan native ekranın görsel kalitesini reddetti; onaylı V10 şablonuna pixel-perfect sadakat ve Travel Town benzeri tam sayfa kullanım istedi. Mekanik testlerin geçmesi görsel kabul değildir. V10 ortak sanat hedefi korunur. Native arayüz, referans dokuları ve resimli kontrollerle yeniden işlendi; üst/alt güvenli alanlar grafikle devam eder, alt menü kullanılabilir ekranın altına bağlanır, kare hücreler eşit kalır. Güncel native revizyon henüz kullanıcı görsel onayı almamıştır ve piksel eşitliği ölçülmüş değildir. Ayrıntı native-gorsel-revizyon.md içindedir.


## 14 Kasım 2026 onaylı ilk ekran ve esnetmenin kaldırılması

Kullanıcı 22.05.27 tarihli ilk ekranın onaylı hedef olduğunu, sonraki ekranların bozuk simülatör hali olduğunu açıkça belirtti. V10 şablonunun oranları esas alınır. Ek cihaz yüksekliğinin manzaraya eklenmesi kaldırıldı. Manzara kaynak görselden 933 × 246 tasarım birimi olarak çizilir; ilan panosu ve üretici rafının üst konumları sabittir. Değişen cihaz alanını kare hücreli tahta karşılar. Yan bitkiler, çit ve fıçı tek eksende esnetilmez; oran korunarak kırpılır. Alt menünün onaylı grafiği geri alınır. Bu karar, önceki esnetilebilir çevre yaklaşımının yerine geçer.

Karşılaştırma için --visual-review ayrı kayıt kullanır; oyuncu kaydı değiştirilmez. Bu oturumda level, bakiye, ilk on sekiz tahta ürünü ve üç gerçek giriş ilanı referansa uygun hazırlanır. Sayaçlar gerçek envanteri sayar; referanstaki 0 değerleri yapay olarak taklit edilmez. Karşılaştırma oturumunun verisi her açılışta yeniden oluşturulur; normal oyunun ilerlemesi ayrı save-v1.json dosyasındadır.

31 model kontrolü geçti. iPhone 17 Pro’da 4 UI testi, iPhone 13 Pro’da 2 yerleşim/görsel konum testi geçti. Üst bölümün profile göre konumunun ekran uzadıkça değişmediği, dokuz satırın eşit kare olduğu ve kontrollerin çalıştığı doğrulandı. Kaynak manzaranın x0,y82,w933,h80 bölümü gerçek ekranla sRGB karşılaştırıldı: ortalama mutlak kanal farkı 255 üzerinden 1,82; kayıt düzeltmesi 0 piksel. Bu dar bölge ölçümü bütün ekran için pixel-perfect onayı değildir. Tam görsel kullanıcı kabulü henüz verilmemiştir.

Güncel native görüntü assets/ui/skara-fidelity-native.png, ölçüm docs/reference-pixel-check.json dosyasıdır. UI test sonuçları /private/tmp/ultima-fidelity-uitests.xcresult ve /private/tmp/ultima-fidelity-compact.xcresult dosyalarıdır. Ürün ikonları onaylı görselden yerleşik image_gen ile şeffaf atlas olarak çıkarıldı; istem ios/Resources/approved-sprites-prompt.txt içindedir.


## 14 Kasım 2026 tek kesintisiz tam ekran arka plan

Kullanıcı gökyüzü/gövde birleşimlerini ve alt dolgu bandını reddetti. Katla Patla projesinin incelenmesini ve üst/alt ayrılmadan tek arka plan kullanılmasını istedi. İncelenen uygulama: /Users/erdi/Documents/ChatGPT/katlapatla/src/ui/components.tsx, Screen bileşeni, satır 206–239. Orada tek ImageBackground, resizeMode=cover ve yalnız çocuk kontrollere uygulanan safe-area boşlukları vardır. Katla Patla dosyaları değiştirilmedi.

Ultima aynı ilkeyi uygular: CityBackdrop tek CityBackground1.png görüntüsünü tüm pencereye cover/tekdüze ölçekleme ile çizer. Kamera ve home-indicator alanı da aynı görüntünün devamıdır. Güvenli alan payları yalnızca etkileşimli ön plana uygulanır. SkyCap, ayrı manzara parçası, ApprovedFarmEdges ve alt renk dolgu bandı kaldırılmıştır. Panel grafiklerinin çevresindeki eski sahne parçaları silüet maskeleriyle dışarıda bırakılır. Tahta, HUD, ilanlar ve butonlar ayrı, gerçek etkileşimli kontrollerdir; bütün ekran bir mockup resmi olarak gösterilmez.

Kaynaklar: ios/Resources/CityBackground1.png ve single-background-prompt.txt. Görsel, yerleşik image_gen ile V10 sanat yönünden üretilmiş tek sahnedir. Yeni arka plan çiziminin kullanıcı görsel onayı henüz alınmamıştır. Önceki dar manzara ROI ölçümü (1,82) eski parçalı uygulamaya aittir ve güncel arka planın doğrulaması olarak kullanılamaz. Yeni kabul bütün ekranın birleşimsiz arka planına ve gerçek simülatör görünümüne göre yapılacaktır.


## 14 Kasım 2026 — ilanlar, seçim ve tam ekran sayfalar

Kullanıcı üst HUD ve alt menünün onaylı referansla uyumlu olmasını istedi. İlan alanı üç eşit genişlikli kart gösterir; devamındaki ilanlar yatay kaydırılır. Kartta ilk ürünün simgesi, miktarı, altın ve XP ödülü bulunur. Başka ürünler varsa +N daha göstergesi kullanılır; tüm gereksinimler Tümü sayfasından görülebilir.

Alt menüdeki simge ve yazılar ayrı öğeler olarak her sekmenin merkezine yerleştirilir. Sekme grafiğinde çimen içeren ekran kırpımları kullanılmaz. Basma geri bildirimi boyut değiştirmez; hafif parlaklık değişimi ve kısa ses kullanılır. Tahtada seçilen eşya sabit boyutlu çerçeveyle gösterilir. Sistem sürükleme önizlemesi yerine aynı boyutta hücre içi sürükleme uygulanır.

Tüm ikincil sayfalar tam ekran, kaydırılabilir, ortak parşömen ve ahşap çerçeve içinde açılır. Alttan açılan yarım sayfa/drawer kullanılmaz. Kapatma düğmesi sağ üsttedir. Tek tam ekran arka plan standardı korunur.

Prototipte yatay ilan alanını doldurmak için bir ana ilan ve beş tekrar ilanı gösterilmektedir. Bu sayı deneme ayarıdır; kalıcı ekonomi kararı değildir. Yeni arka plan/üst alan için bütün ekran pixel-perfect onayı verilmiş sayılmaz; kullanıcı görsel değerlendirmesi beklenir.


## 15 Kasım 2026 — React Native geçişi ve kalite sınırı

Kullanıcı React Native/Expo’ya geçilmesini açıkça onayladı. Katla Patla’nın yalnızca örnek olduğunu, kalite sınırı olmadığını belirtti. Aktif kod mobile/ altındadır; eski SwiftUI ios/ kaynakları ve oyuncu kaydı korunur. Test başarısı görsel kalite veya kullanıcı kabulü olarak sunulmaz. Font, tahta, gölge ve hareket adayları gerçek Release ekranı üzerinde incelenir. Ayrıntılar react-native-migration.md dosyasındadır.


## 15 Kasım 2026 — yeni fotoğraf, hücre oranı ve ölçümlü RN turu

Kullanıcı Screenshot 2026-11-15 at 01.14.55.png görselini yeni hedef olarak belirledi. Kare hücre ile bu fotoğraftaki oran arasındaki seçenek soruldu; kullanıcı açıkça “Bu fotoğrafın hücre oranları da birebir uygulansın” yanıtını verdi. Bu karar eski 1:1 hücre oranının yerine geçer. Yeni hedef assets/references/masterland-visual-target-v11.png içinde korunur.

Kaynak görsel 838×1440; oyun alanı yaklaşık x25,y27,800×1401. Görünür 6×8 gridin iç alanı x59,y548,732×710 olarak ölçüldü. Çizimde tek tek satırlar eşit olmadığından, önceki eşit satır şartını koruyan tek tip hücre adımı 122×88.75, oran 1.374647887 olarak alınır. Oyundaki 54 slot silinmez; 6×9 kapasite ve kayıt kimlikleri korunur. Kullanıcı kapasiteyi 48’e düşürme talimatı vermedi.

Tahta genişliği kaynak oranından türetilir. Tahta alt menünün üstüne bağlanır. Ekran yüksekliği farkı şehir manzarasının görünür alanına verilir; arka planın x/y ölçeği ayrı ayrı değiştirilmez. Tek arka planın uniform kamera ölçeği deniz feneri referans noktasına bağlanır ve dört kenarı kaplar. Bu, eski sabit kare tahta uyarlamasının güncel yerine geçer.

Mevcut atlasların şeffaf kenarları metadata ile ölçülür. Eşya pikselleri değiştirilmez; nesne gerçek çizim sınırından, kendi oranını koruyarak hücreye sığdırılır. Üreticiye seri dokunma native UI runtime’da algılanır. Tahta seçimde büyümez. Yeni ortak çerçevenin hem merkezi hem dışı gerçek alpha saydamlığı taşır; sayfa içeriklerini örten kâğıt dolgusu yoktur.

İlan kartı ve ilan panosu yazısız ayrı varlıklardır. İlanların isimleri, miktarları, altın/XP değerleri ve teslim davranışı canlı bileşenlerdir. Referanstaki örnek bakiyeler veya görev sırası normal oyuna zorlanmaz.

Yeni font eşlemesi iOS Georgia/Georgia-Bold ailesidir. Önceki Alegreya/Nunito dosyaları ve lisansları arşiv olarak kalır, açılışta gereksiz yüklenmez. Bu tercih yeni görsel hedefin serif harflerine yakın uygulama seçimi olup kullanıcıdan ayrıca font adı onayı alınmış sayılmaz.

Sesler özgün kısa mallet/ahşap ailesidir: arayüz 75 ms, üç uyumlu üretim varyasyonu 120 ms, merge 235 ms, ödül 400 ms, engellenen eylem 90 ms. Tek ses kanalı, 65 ms hız sınırı, sessiz mod ve uygulama arka planında durdurma uygulanır. Ses kapatma tahtayı veya ilerlemeyi sıfırlamaz.

Piksel karşılaştırmasında monitör ICC profilli referans ile sRGB simülatör ekranı önce aynı sRGB uzayına çevrilir. Hücre dokusu benzerliği tüm ekranın estetik skoru olarak sunulmaz. Bütün ekran için %100 piksel özdeşliği veya kullanıcı görsel kabulü henüz iddia edilmez.


### Son etkileşim ve çizim ayrıntıları

Seçili eşyanın yanında, yalnız sonraki basamağı açık olan aynı türden bir başka eşya yumuşak altın çerçeveyle önerilir. En fazla iki vurgu çizilir; eşya veya hitbox büyümez. Sürükleme başlangıcında eşya seçilir. Eski hareketin geciken JS sonucu yeni native sürüklemeyi temizleyemez. Üretici sayaçları iki basamaklı dakika gösterir ve küçük ekranda tek satıra sığar.

Ana ilan ilk sırada kalır. İlk üç görünür kartta mevcut görevler arasından farklı üretim zincirleri öne alınır. Bu yalnız sunum sırasıdır: ilan kimlikleri, gereksinimleri ve ödülleri korunur; hiçbir canlı görev silinmez veya eklenmez. İnceleme örneği meşru bir tekrar ilanı adımında başlatılır; normal kayıt değiştirilmez.

## Basılı tutma ve dokunarak merge

Sürükleme öncesi basılı tutmak hareketi engellemez. Ayrıntı ekranı yalnız hareketsiz uzun basma bırakılınca açılır. Seçili eşyayla aynı ürüne dokunmak sürüklemeyle aynı motor kontrolünü kullanır. Farklı ürüne dokunmak seçim değiştirir; boş hücreye dokunmak ürün taşımaz. Sonraki basamak kilitliyse ürünler korunur ve üretici açma koşulları gösterilir.

## Güncel seçim vurgusu

Seçili eşya tek başına vurgulanır. Birleşebilecek başka üründe otomatik çerçeve veya öneri gösterilmez. Bu karar önceki eşleşme önerisi kuralının yerini alır.

## Temalı şehirler sayfası

Şehirler ortak tam ekran parşömen çerçevesinde gösterilir. Tek, kesintisiz çizim üç temalı yerleşimi ve bağlantı yolunu içerir. Şehir adları, roller, kilit simgeleri ve tıklama alanları çizime gömülmez; yerel arayüzde sabit city ID referanslarıyla eklenir. İlk şehir tahtaya döndürür. Diğer iki şehir, oyuncunun inceleme modundaki leveli yüksek olsa da bu aşamada kilitli kalır. Dokunulan şehrin hemen altında açılma seviyesi görünür; yeni drawer veya ekran eklenmez. Basma geri bildirimi ve kısa ses kullanılır, hareket azaltma tercihi korunur.

## Hazır ilan ve temalı görev yolu

Hazır ilanlar eksik ilanların önüne taşınır; kart yeşil çerçeve ve hafif renk dolgusu alır. Ver alanı kartın içindedir ve kartın tamamı teslim için tıklanabilir. Görünen ilk ikon tek başına hazır olma kararı vermez; bütün gereksinimler hem tahta hem depo üzerinden kontrol edilir. Seri teslimlerde güncel ilan kimliği doğrulanır. Teslimattan hemen sonra eksik karta denk gelen ikinci dokunuş sayfa açmaz; hazır başka ilana hızlı teslim engellenmez.

Şehir haritası tek uzun çizimin üç bölgesi üzerinde dikey kayar. Görünen merkez bölge üst başlığın tema rengini belirler. Sağdaki şehir kısayolları yalnız konuma kaydırır. Skara düğümleri mevcut giriş ilanlarını açar; gelecekteki şehirlerin düğümleri kilit mesajı gösterir. Harita gezinmesi yeni şehir oynanışını açmaz.

## Özel başarı yolu ve inscribe fermanı

Yol üzerindeki sıradan giriş ilanları, özel başarı kartlarıyla değiştirilir. İlanlar tahtadaki satın alma panosunda kalır. Yol kartları unvan, sandık, kapasite/enerji ve XP ödüllerini temsil eder. İlerleme sayısı ve çubuğu, Ödül hazır ve Alındı durumları renkten bağımsız metinle de gösterilir. Yeni başarı simgeleri özgün çizimdir. Şehirler ve başarı ayrıntıları kıvrık kenarlı ferman dokusu taşır; kartlarda küçük mühürler bulunur. Başarı ayrıntısı önceki tam ekran standardına uyar. Yola dönüş son kaydırma konumunu korur. Gelecek iki şehirdeki başarılar kilitli önizlemedir.

Güç menüsü ana tahta üzerinde gerçek üretici koordinatına bağlanır; üst bileşende çizildiği için yatay üretici listesinin sınırında kırpılmaz. Tam ekran modal veya alt drawer kullanılmaz, arka plan karartılmaz. 1x mavi, 2x yeşil, 3x mor, 4x kehribar renktedir. Üreticinin üstünde seçili mod, alt durumunda gerçek enerji maliyeti bulunur. 100 ve altında seçili üst mod korunur ama gerçek maliyet 1 olur. Şehirler sekmesi alınabilir başarı ödülü sayısını gösterir.
