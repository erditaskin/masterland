# Skara native arayüz ve tam sayfa revizyonu

14 Kasım 2026. Kullanıcı ilk native prototipin görsel kalitesini reddetti. V10 onaylı ortak şehir şablonu değişmemiştir. Hedef, Travel Town referansındaki bütün ekranı kullanan düzen ve V10 sanat yönüne görsel sadakattir. Yalnızca oyun kurallarının testten geçmesi görsel kabul anlamına gelmez.

## Uygulanan değişiklikler

- İlk sürümdeki düz renkli tahta, sade sistem ikonları ve koyu bantlar yeniden işlendi. Tahta çerçevesi, zemin dokusu ve çevre, onaylı referansın görsel parçalarından gerçek arayüz bileşenleri olarak çizilir. Bu, bütün ekranın statik bir resim olarak gösterilmesi değildir; ürünler, sayılar, ilanlar ve dokunma alanları canlıdır.
- Şehir panoraması ve sekiz şeffaf UI ikonu yerleşik image_gen ile onaylı referansa bağlı olarak üretildi. Son varlıklar ios/Resources/Panorama.png ve UIIcons.png dosyalarıdır. İstemler pixel-art-prompts.txt içinde korunur.
- Ekran, kullanılabilir cihaz genişliği ve yüksekliğiyle yerleşir. Bütün tasarımı min(widthScale,heightScale) ile ortalayan ve boş bant bırakan önceki yöntem kaldırıldı. Tahta hücreleri tek ölçüden çizilir, kare oranı sabittir. Ek yükseklik şehir manzarasına verilir; alt gezinme ekranın kullanılabilir alt kenarına bağlanır.
- Şehir çizimi durum çubuğunun arkasına, çevre dokusu alt güvenli alana devam eder. Kontroller güvenli alan içinde kalır. HUD rakamları tek satırdır. Alt menü ve para ikonlarında önceki raster parçaların metin kalıntıları temizlendi; şeffaf ikonlar kullanılır.
- Kalıcı alt bilgi bandı kaldırıldı; geri bildirim geçici, dokunmayı engellemeyen bir mesaj olarak gösterilir. Birbirini izleyen mesajlar önceki beklemeyi iptal eder.
- Düğme basma animasyonu, üretim/birleşme vurguları, ses ve hareket azaltma ayarları korunur. Oyun modeline ve kayıt biçimine bu revizyonda dokunulmadı.

## Görsel kabul sınırı

Bu revizyon henüz kullanıcı tarafından görsel olarak onaylanmamıştır. Piksel düzeyinde yüzde yüz eşleşme ölçülmüş değildir; yeni native ekranı pixel-perfect tamamlandı diye nitelemeyin. Dinamik içerik, cihaz güvenli alanı ve ekran oranı nedeniyle referans ile gerçek ekran karşılaştırması aynı viewport ve eşdeğer içerikle yapılmalıdır. Uygulanan temel çizim alanı 933 tasarım birimi genişliğindedir; 1755 birim temel yükseklik cihazın kullanılabilir yüksekliğine uyarlanır. İlk kodlanmış ekran ve önceki test sonuçları tarihçedir, güncel görsel kabulü temsil etmez.

## Bekleyen işler

İlan parşömenlerinin kenarları, başlık levhası, font ağırlıkları, producer ikonlarının bağımsız son varlıklar haline getirilmesi ve nihai ses tasarımı için görsel/duyumsal kabul devam eder. Diğer şehirler aynı şablonun temasını değiştirecektir. Henüz ikinci şehir uygulaması veya gerçek cihaz testi yapılmadı.

Son çevre varlığı ios/Resources/FarmGround.png dosyasıdır; tekrarlanan kenar parçaları yerine tek parça çizim kullanılır. Başlık elmas süslemeleri küçültüldü. Son native ekran assets/ui/skara-fullscreen-native.png dosyasındadır.


## 14 Kasım 2026 onaylı ilk ekran ve esnetmenin kaldırılması

Kullanıcı 22.05.27 tarihli ilk ekranın onaylı hedef olduğunu, sonraki ekranların bozuk simülatör hali olduğunu açıkça belirtti. V10 şablonunun oranları esas alınır. Ek cihaz yüksekliğinin manzaraya eklenmesi kaldırıldı. Manzara kaynak görselden 933 × 246 tasarım birimi olarak çizilir; ilan panosu ve üretici rafının üst konumları sabittir. Değişen cihaz alanını kare hücreli tahta karşılar. Yan bitkiler, çit ve fıçı tek eksende esnetilmez; oran korunarak kırpılır. Alt menünün onaylı grafiği geri alınır. Bu karar, önceki esnetilebilir çevre yaklaşımının yerine geçer.

Karşılaştırma için --visual-review ayrı kayıt kullanır; oyuncu kaydı değiştirilmez. Bu oturumda level, bakiye, ilk on sekiz tahta ürünü ve üç gerçek giriş ilanı referansa uygun hazırlanır. Sayaçlar gerçek envanteri sayar; referanstaki 0 değerleri yapay olarak taklit edilmez. Karşılaştırma oturumunun verisi her açılışta yeniden oluşturulur; normal oyunun ilerlemesi ayrı save-v1.json dosyasındadır.

31 model kontrolü geçti. iPhone 17 Pro’da 4 UI testi, iPhone 13 Pro’da 2 yerleşim/görsel konum testi geçti. Üst bölümün profile göre konumunun ekran uzadıkça değişmediği, dokuz satırın eşit kare olduğu ve kontrollerin çalıştığı doğrulandı. Kaynak manzaranın x0,y82,w933,h80 bölümü gerçek ekranla sRGB karşılaştırıldı: ortalama mutlak kanal farkı 255 üzerinden 1,82; kayıt düzeltmesi 0 piksel. Bu dar bölge ölçümü bütün ekran için pixel-perfect onayı değildir. Tam görsel kullanıcı kabulü henüz verilmemiştir.

Güncel native görüntü assets/ui/skara-fidelity-native.png, ölçüm docs/reference-pixel-check.json dosyasıdır. UI test sonuçları /private/tmp/ultima-fidelity-uitests.xcresult ve /private/tmp/ultima-fidelity-compact.xcresult dosyalarıdır. Ürün ikonları onaylı görselden yerleşik image_gen ile şeffaf atlas olarak çıkarıldı; istem ios/Resources/approved-sprites-prompt.txt içindedir.


## 14 Kasım 2026 tek kesintisiz tam ekran arka plan

Kullanıcı gökyüzü/gövde birleşimlerini ve alt dolgu bandını reddetti. Katla Patla projesinin incelenmesini ve üst/alt ayrılmadan tek arka plan kullanılmasını istedi. İncelenen uygulama: /Users/erdi/Documents/ChatGPT/katlapatla/src/ui/components.tsx, Screen bileşeni, satır 206–239. Orada tek ImageBackground, resizeMode=cover ve yalnız çocuk kontrollere uygulanan safe-area boşlukları vardır. Katla Patla dosyaları değiştirilmedi.

Ultima aynı ilkeyi uygular: CityBackdrop tek CityBackground1.png görüntüsünü tüm pencereye cover/tekdüze ölçekleme ile çizer. Kamera ve home-indicator alanı da aynı görüntünün devamıdır. Güvenli alan payları yalnızca etkileşimli ön plana uygulanır. SkyCap, ayrı manzara parçası, ApprovedFarmEdges ve alt renk dolgu bandı kaldırılmıştır. Panel grafiklerinin çevresindeki eski sahne parçaları silüet maskeleriyle dışarıda bırakılır. Tahta, HUD, ilanlar ve butonlar ayrı, gerçek etkileşimli kontrollerdir; bütün ekran bir mockup resmi olarak gösterilmez.

Kaynaklar: ios/Resources/CityBackground1.png ve single-background-prompt.txt. Görsel, yerleşik image_gen ile V10 sanat yönünden üretilmiş tek sahnedir. Yeni arka plan çiziminin kullanıcı görsel onayı henüz alınmamıştır. Önceki dar manzara ROI ölçümü (1,82) eski parçalı uygulamaya aittir ve güncel arka planın doğrulaması olarak kullanılamaz. Yeni kabul bütün ekranın birleşimsiz arka planına ve gerçek simülatör görünümüne göre yapılacaktır.


### Canlı arayüz güncellemesi

Tam ekran düzenleme sırasında üreticiye dokunmanın kayıt verisini değiştirdiği, ancak GeometryReader içinde oluşturulan oyun görünümünün eski veriyi göstermeye devam ettiği saptandı. CityCanvas adlı gözlenen çocuk görünüm, GameModel değişikliklerini doğrudan izler. Böylece enerji, hücreler, ilanlar ve sayaçlar aynı oturumda yenilenir. Üreticide kısa dokunma ve uzun basma davranışı korunmuştur. Yeni regresyon testi, iki kısa dokunuşun ekrandaki enerjiyi sırasıyla 99/100 ve 98/100 göstermesini doğrular.


Son doğrulama: 31 model kontrolü, ana simülatörde 6 UI testi ve küçük ekranda kapsama/geometri kontrolleri geçti. Ayrıntılar single-background-verification.md dosyasındadır. Güncel görüntü assets/ui/skara-single-background-native.png. Kullanıcı görsel onayı beklenmektedir.


### Canlı hücreler ve sürükleme

Hücre görünümü doğrudan GameModel değişikliklerini izler. Bu düzenleme, ürün doğru kaydedildiği hâlde hücrenin eski metnini veya seçim bilgisini korumasını önler. Sürükleme hedefi tahtanın adlandırılmış koordinat alanında hesaplanır; ekran ölçeği veya cihaz boyu hedef hücreyi değiştirmez. Sistem büyütme önizlemesi kullanılmaz.
