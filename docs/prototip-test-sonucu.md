# Skara prototip test sonucu

14 Kasım 2026. iPhone 17 Pro, iOS 26.3, Ultima-Skara-QA simülatörü.

- Oyun motoru: 31 kontrol geçti.
- Xcode simülatör derlemesi: başarılı.
- Son gerçek UI testi: 1 senaryo, 0 hata, 45,6 saniye.
- Geometri: ilk hücre kare; son hücrenin yüksekliği ilk hücreyle eşit; üretici dokunma alanı en az 44 pt.
- Etkileşim: ilk üç giriş ilanı, üretici satın alma, Farmer unvanı ve üretici geliştirme ekranı doğrulandı.
- Koleksiyon, Depo, Şehirler ve Market ekranları açıldı.
- Uygulama kapatılıp yeniden açıldığında ilerleme ve enerji korundu.
- Şehir panoraması son derlemenin ekran görüntüsünde doğrulandı.

İlk simülatör koşusu sonrası görsel yerleşim düzeltildi. Son UI testi düzeltilmiş sürümde yeniden geçti. UI testi ayrı kayıt dosyası kullanır. Kullanıcı denemesi ilk seviyede başlar; önceki ajan test kaydı yedeklendi.

Test sonucu bütün olası durumların hatasızlığı anlamına gelmez. Gerçek cihaz, erişilebilirlik araçlarıyla tam tarama, uzun oturum performansı, bütün üst ürünlerin oynayarak açılması ve seslerin duyumsal kalitesi henüz doğrulanmadı. Görsel, onaylı sanat şablonunun ilk native uygulamasıdır; doku ve süslemelerin birebir son üretimi tamamlanmadı.

Xcode sonuç paketi: /private/tmp/ultima-uitests-final.xcresult. Test kaynakları ios/Tests dizinindedir. Prototipte reklam veya gerçek ödeme yoktur.

Device Hub arayüzünde Ultima-Skara-QA simülatörü ve çalışan başlangıç ekranı görsel olarak doğrulandı. Kullanıcı denemesine açık bırakıldı.


## Son tam sayfa doğrulaması

14 Kasım 2026. iPhone 17 Pro simülatöründe tam sayfa revizyonunun giriş görevleri, satın alma, alt ekranlar ve kayıt devamlılığı senaryosu geçti. iPhone 13 Pro simülatöründe aynı oynanış senaryosu ve ayrı responsive geometri senaryosu geçti: toplam iki senaryo, sıfır hata. Bütün dokuz satırın yüksekliği eşit, hücre en-boy oranı kare, üretici dokunma alanı en az 44 pt, HUD enerji metni tek satır ve alt menü ekran içinde doğrulandı. iPhone 17 Pro'da uzun basmayla üretici ayrıntısına girmenin enerji tüketmediği ayrı test de geçti. Sonrasında yapılan değişiklikler yalnız çevre görseli ve başlık süslemesidir; son derleme başarılıdır ve son ekran görüntüsü incelendi.

Sonuç paketleri: /private/tmp/ultima-fullscreen-tests2.xcresult, /private/tmp/ultima-iphone13-tests.xcresult, /private/tmp/ultima-longpress-tests.xcresult. Önceki 31 model kontrolü geçerlidir; bu revizyonda model değiştirilmedi. Testlerin geçmesi görsel pixel-perfect kabul anlamına gelmez. Onaylı hedef V10 olmaya devam eder. Güncel native ekran assets/ui/skara-fullscreen-native.png içindedir. Gerçek cihaz testi yapılmadı.


## 14 Kasım 2026 onaylı ilk ekran ve esnetmenin kaldırılması

Kullanıcı 22.05.27 tarihli ilk ekranın onaylı hedef olduğunu, sonraki ekranların bozuk simülatör hali olduğunu açıkça belirtti. V10 şablonunun oranları esas alınır. Ek cihaz yüksekliğinin manzaraya eklenmesi kaldırıldı. Manzara kaynak görselden 933 × 246 tasarım birimi olarak çizilir; ilan panosu ve üretici rafının üst konumları sabittir. Değişen cihaz alanını kare hücreli tahta karşılar. Yan bitkiler, çit ve fıçı tek eksende esnetilmez; oran korunarak kırpılır. Alt menünün onaylı grafiği geri alınır. Bu karar, önceki esnetilebilir çevre yaklaşımının yerine geçer.

Karşılaştırma için --visual-review ayrı kayıt kullanır; oyuncu kaydı değiştirilmez. Bu oturumda level, bakiye, ilk on sekiz tahta ürünü ve üç gerçek giriş ilanı referansa uygun hazırlanır. Sayaçlar gerçek envanteri sayar; referanstaki 0 değerleri yapay olarak taklit edilmez. Karşılaştırma oturumunun verisi her açılışta yeniden oluşturulur; normal oyunun ilerlemesi ayrı save-v1.json dosyasındadır.

31 model kontrolü geçti. iPhone 17 Pro’da 4 UI testi, iPhone 13 Pro’da 2 yerleşim/görsel konum testi geçti. Üst bölümün profile göre konumunun ekran uzadıkça değişmediği, dokuz satırın eşit kare olduğu ve kontrollerin çalıştığı doğrulandı. Kaynak manzaranın x0,y82,w933,h80 bölümü gerçek ekranla sRGB karşılaştırıldı: ortalama mutlak kanal farkı 255 üzerinden 1,82; kayıt düzeltmesi 0 piksel. Bu dar bölge ölçümü bütün ekran için pixel-perfect onayı değildir. Tam görsel kullanıcı kabulü henüz verilmemiştir.

Güncel native görüntü assets/ui/skara-fidelity-native.png, ölçüm docs/reference-pixel-check.json dosyasıdır. UI test sonuçları /private/tmp/ultima-fidelity-uitests.xcresult ve /private/tmp/ultima-fidelity-compact.xcresult dosyalarıdır. Ürün ikonları onaylı görselden yerleşik image_gen ile şeffaf atlas olarak çıkarıldı; istem ios/Resources/approved-sprites-prompt.txt içindedir.
