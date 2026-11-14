# React Native geçişi — 15 Kasım 2026

## Kullanıcı kararı

Kullanıcı mevcut uygulamanın estetik kalitesini reddetti; tema uyumlu gerçek font, daha iyi tahta/gölge, Travel Town benzeri tahta aksiyonları ve teslim öncesi görsel/etkileşim doğrulaması istedi. Ardından React Native/Expo’ya geçilmesini açıkça onayladı. Katla Patla’nın bir örnek olduğunu, kalite sınırı olmadığını ayrıca belirtti.

Aktif uygulama `mobile/` altındadır. SwiftUI oyun kaynakları proje dışına güvenlik arşivine taşınmıştır. Uygulama adı Masterland, kök `/Users/erdi/masterland`, bundle kimliği `com.erditaskin.masterland` olmuştur. Eski `com.erdi.ultima.rn` ve `com.erdi.ultima.prototype` kayıtları kaynak değiştirilmeden aktarılabilir.

## Yapı ve veriler

Expo SDK 58, React Native 0.88.1, TypeScript strict, Hermes, Gesture Handler ve Reanimated kullanılır. Oyun kuralları `src/game`, yerel kayıt `src/state`, çizim ve etkileşim `src/ui` altındadır. Ürün, şehir, üretici ve ilan verileri kökteki `data/content-reference.json` dosyasından okunur; isimlerden türetilmiş yeni içerik anahtarları eklenmez.

Alan değişikliği bir kez sonuçlandırılır; animasyonlar eşya, XP veya para vermez. Tahta ürünleri kalıcı kimlik taşır. Kopyalama, eylem başına yalnız değişebilir kapları ayırır; ürün kimlikleri korunur. Her karede React state güncellenmez. Dokunma yüzeyi sabittir; sürükleme ve geri dönüş UI runtime’da çalışır. Seçim, eşyanın boyutunu değiştirmez. Kullanıcı veya işletim sistemi hareket azaltma tercihi desteklenir.

Yerel kayıt schema 2 ve `@masterland/save/v2` anahtarındadır. Yazılar sıraya alınır ve bekleyen en yeni durum saklanır. Bozuk kayıt sessizce silinmez. Hata görünür; tekrar deneme sunulur. Swift schema 1 kaydı ayrı import dosyasından bir kez dönüştürülebilir. Eski dosya değiştirilmez; Apple tarih başlangıcı ve ürünler yeni formata çevrilir. Betik: `mobile/scripts/import-swift-save.py`.

`masterland://review` ayrı, bellekte kalan görsel inceleme oturumudur. `masterland://qa-reset` ayrı test oturumudur. Bu modlar normal oyuncu kaydını silmez veya üzerine yazmaz. Üretim yayını öncesinde QA girişleri sınırlandırılmalıdır.

## Görsel çalışma

Alegreya 600 başlıklarda; Nunito 600 açıklamalarda, Nunito 800 sayılarda kullanılır. Bunlar gerçek OFL font dosyalarıdır; Türkçe harfler ve sayılar kontrol edilmiştir. Statik ağırlıkların iOS PostScript adları birbirinden ayrıdır. Kaynaklar ve lisanslar `mobile/assets/fonts`, tekrar üretim `mobile/scripts/prepare-fonts.py` içindedir.

Tahta tek bir nötr parşömen dokusu ve iki düşük opaklıklı hücre tonu kullanır. Her hücreye ayrı ekran resmi döşenmez. Hücre başına büyük bulanık gölge verilmez. Tek ahşap çerçeve ve düşük yoğunluklu tek tahta gölgesi vardır. Ürünlerin boyut ve ışık yönleri onaylı sanat varlıklarıyla korunur. Çerçevenin iç köşeleri tahtanın arkasında kalır; başka kâğıt renginden gelen köşe parçaları ürün alanının üzerine oturmaz.

Tek kesintisiz tam ekran şehir arka planı korunur. Kontroller güvenli alandadır. Gerçek resimler ile metin ve etkileşimli alanlar ayrıdır; tam ekran mockup uygulama yerine gösterilmez. Üretici geri sayımı yalnız ilgili kartta güncellenir. Değişmeyen ürün ve üretici görselleri memoize edilir. Global enerji saati sürekli bir saniyelik render döngüsü çalıştırmaz; sonraki yenileme anı beklenir.

Sayfalar tam ekran parşömen çerçevesi kullanır. İlan alanı üç eşit kart gösterir, devamı yatay kaydırılır. Ek gereksinimler +N daha ile belirtilir. Bunların görsel uygulaması hâlâ kullanıcı incelemesine açıktır; test başarısı estetik kabul sayılmaz.

## Travel Town ile karşılaştırma

Resmî yardım kaynakları üreticiye dokunarak ürün çıkarmayı, enerji tüketimini ve aynı ürünü sürükleyerek üst ürüne birleştirmeyi doğrular:

- https://support.traveltowngame.com/hc/en-us/articles/4833664499090-The-Merge-Board
- https://support.traveltowngame.com/hc/en-us/articles/4833684165522-What-are-Board-Items

Tahtada dokunma seçim yapar; birleştirme sürükleme ile yapılır. Üretici bir enerji tüketir. Boş yere taşıma, aynı eşya birleşmesi, kilitli basamak, en üst basamak ve tahta dışına bırakma ayrı ele alınır. Geçersiz bırakmada ürün korunur ve yerine döner. Kesin animasyon sürelerinin Travel Town ile aynı olduğu ölçülmüş değildir; uygulama süreleri kendi deneme ayarlarıdır.

Kullanıcının daha önce onayladığı farklılıklar korunur: üreticiler ayrı raftadır; ürün alanları seviye ve para ile açılır; keşif +1 XP ve olasılıklı elmas verir. Travel Town’ın resmî yardımında ilk keşif için bir elmas yazmaktadır; bu fark kullanıcı kararını sessizce değiştirmek için kullanılmaz. Şehir açılışı, meslek ustalığı, ilanlar ve eşya ekonomisi önceki proje kararlarına bağlıdır.

## Doğrulama sınırı

Tip kontrolü, lint ve model testleri ayrı raporlanır. Gerçek Release simülatör etkileşimi, seri dokunma, sürükleme, geçersiz bırakma, depolama, tam ekran sayfalar ve yaşam döngüsü ayrıca denenir. Masaüstü Node motor süresi cihaz FPS’i değildir. Simülatör gözlemleri gerçek telefonun ısı, pil, dokunma gecikmesi veya haptik kalitesini kanıtlamaz. Estetik değerlendirme gerçek boyutlu ekran görüntüsü ve hareket kaydı üzerinden yapılır. Kullanıcı onayı olmadan pixel-perfect veya kesin görsel kabul iddiasında bulunulmaz.
