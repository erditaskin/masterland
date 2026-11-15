# Referans ve gerçek ekran doğrulaması — 15 Kasım 2026

## Hedef ve kullanıcı kararı

Hedef `assets/references/masterland-visual-target-v11.png` dosyasıdır. Kullanıcı kare hücre seçeneği yerine bu fotoğrafın hücre oranını açıkça seçmiştir. Kaynak ekran 838×1440, yaklaşık oyun alanı x25/y27/800×1401 olarak ölçülmüştür.

Fotoğrafın iç grid alanı x59/y548/732×710 ve görünür düzeni 6×8’dir. Çizimdeki tekil satır farklılıklarını tekrar etmek yerine tüm hücreler için 122:88.75 oranı türetilmiştir. Oyuncunun 54 envanter slotu korunur; aktif düzen 6×9’dur. Fotoğraf nedeniyle kayıtların son altı slotu silinmez.

Hücreler fiziksel piksele yuvarlanır. Bu nedenle ekranda kullanılan oran hedefe en yakın tam piksel oranıdır; son satır farklı boyda çizilmez. Ekranın ek yüksekliği şehir manzarasına verilir. Arka plan tek, kesintisiz ve uniform ölçeklenen görüntüdür; gökyüzü/gövde birleşimi veya alt dolgu bandı yoktur. Deniz feneri noktası kameranın yerleşim referansıdır.

## Uygulanan sanat ve etkileşim

Şehir, temiz yazısız ilan panosu, parşömen kartları, seviye kalkanı ve saydam ortak çerçeve ayrı varlıklardır. Çerçevenin merkezi ve dışı alpha saydamlığı taşır. Köşeleri farklı oranlarda esnetmek yerine kenarlar ayrı dilimlerle çizilir. Tam ekran sayfaların içeriğini kapatan çerçeve dolgusu kullanılmaz.

Eşya atlaslarının şeffaf boşlukları `mobile/scripts/measure-item-bounds.py` ile ölçülür; özgün atlas pikselleri değiştirilmez. Nesneler kendi oranlarını koruyarak hücredeki gerçek çizim alanına sığar. Bu, önceden küçük görünen eşya sorununu giderir. Sabit hücre dokusu ayrı memoize katmandır.

iOS yazı eşlemesi Georgia/Georgia-Bold’dur. Sayaçlar, bakiyeler, ilan gereksinimleri ve XP/altın değerleri canlı metindir. Mockup değerleri gerçek oyuna zorlanmaz. Ana ilan ilk sırada kalır; ilk üç kartta farklı üreticilere ait mevcut ilanlar öne alınır. Hiçbir ilan kimliği, gereksinimi veya ödülü bu sıralama yüzünden değişmez.

Seçim ve geçerli bir eşleşme sabit boyutlu altın vurgu taşır. Kilitli sonraki ürün için eşleşme önerisi gösterilmez. Sürükleme native UI runtime’da kalır; JS her karede React state değiştirmez. Eski hareketin geciken sonucu yeni sürüklemeyi temizleyemez. Üretici tap/long press algılaması native gesture katmanındadır; animasyon, kaynak tüketimini belirlemez.

## Ölçüm yöntemi

Koordinatlar gerçek Release uygulamasından XCTest eki olarak alınır. Point ile fiziksel piksel ayrı tutulur. Simülatör görüntüsü ve monitör ICC profilli referans, karşılaştırmadan önce sRGB’ye çevrilir. Renk profili dönüşümü atlanırsa sahte renk farkları oluşur.

`mobile/scripts/measure-visual.py`, 54 hücreyi, hedef hücre oranını, eşit son satırı, en az 44 point hücreyi, tahta/alt menü ayrımını ve eşit gezinme genişliklerini denetler. Başarısız geometri varsa işlem hata koduyla biter. Boş 18. hücrenin dokusu referans kırpımıyla ayrıca karşılaştırılır; dört fiziksel piksellik köşe/kenar alanı antialias farkları nedeniyle dışarıda bırakılır.

Bu doku benzerliği tüm ekranın estetik skoru değildir. Canlı değerler, 54 slot, farklı ekran/safe-area oranları, gerçek font rasterizasyonu ve yeniden oluşturulan UI’siz arka plan nedeniyle bütün ekranın %100 piksel özdeşliği iddia edilmez. Ölçüm JSON’unda bu sınır açıkça `full_frame_pixel_identity_claimed: false` olarak kaydedilir.

## Kaydedilen geometri

| Kontrol | iPhone 17 Pro | iPhone 13 Pro |
| --- | --- | --- |
| Gerçek ekran | 1206×2622 px | 1170×2532 px |
| Hücre | 187×136 px | 181×132 px |
| Hücre point boyu | 62.333×45.333 | 60.333×44 |
| Referans oranından fark | 0.000352 | 0.003436 |
| Geometri kontrolleri | 6/6 | 6/6 |
| Boş hücre doku benzerliği | %99.919 | %99.874 |
| Ortalama kanal farkı | 0.207/255 | 0.322/255 |

Ham koordinatlar ve ölçüm JSON’ları `docs/verification/2026-11-15/` altında saklanır. Görüntüler gerçek uygulama ekranlarıdır; üzerlerine hizalama veya eşya resmi yapıştırılmaz.

## Ses ailesi

`mobile/scripts/prepare-audio.py` özgün 48 kHz mono PCM seslerini yeniden üretir. Arayüz 75 ms, üç uyumlu üretim varyasyonu 120 ms, merge 235 ms, ödül 400 ms, engellenen eylem 90 ms sürer. Yumuşak başlangıç ve bitiş, düşük üst armonikler ve sınırlı ses düzeyi kullanılır. Kaynak dosyalarda clipping yoktur; sayısal değerler `mobile/assets/audio/audio-metrics.json` içindedir.

Native oynatıcılar önceden oluşturulur ve tekrar kullanılır. En fazla bir kısa ses duyulur; olaylar arasında 65 ms sınırı vardır. Yeni eylem eski sesi sınırsız üst üste yığmaz. Uygulama arka plana geçtiğinde veya ses kapatıldığında sesler durur. Ses tercihi tahta veya kayıt yükleyicisini yeniden başlatmaz. Gerçek telefon dinlemesi, simülatör ve dalga biçimi ölçümünden ayrı bir kabul aşamasıdır.

## Yeniden üretim

Node 22.13+, Xcode ve `mobile/package-lock.json` kullanılır. Native proje Expo prebuild ile üretilir; UI test hedefi config plugin tarafından eklenir. Normal Release yolu Metro gerektirmeyen Hermes bytecode paketini oluşturur.

```sh
cd mobile
npm ci
npm run typecheck
npm run lint
npm test
npx expo run:ios --configuration Release --device Masterland-QA
```

Görsel ölçüm için Python 3.11+ ve `mobile/scripts/requirements-visual.txt` gerekir. XCTest `testVisualMeasurements` testi JSON koordinat ve PNG ekran eki üretir. Bu iki dosya `measure-visual.py --geometry ... --screen ... --out ...` komutuna verilir. Gerektiğinde kaynak atlas sınırları `measure-item-bounds.py` ile tekrar hesaplanır.

## Son test sonucu

30 TypeScript motor/girdi/kamera/sunum testi, strict tip kontrolü ve lint geçti. Normal Release/Hermes derleme yolunda iPhone 17 Pro’da 8/8 UI testi 121.856 saniyede geçti. Küçük iPhone 13 Pro’da 4/4 geometri, tam ekran sayfa/depo, seri üretim ve görsel ölçüm testi 63.329 saniyede geçti. Test filtrelerinin sıfır veya eksik senaryo çalıştırması başarı sayılmadı; gerçek yürütülen test sayıları JSON özetlerinde korunur.

Sekiz ana senaryo: normal kayıt/arka plan/yeniden açma, tam ekran sayfalar ve depo, ilan kaydırma/geometri, merge/görev/üretici satın alma, 30 seri üretim ve kapasite beklemesi, geçersiz bırakma ardından yeni hareket, ses tercihi değişiminde tahta bütünlüğü, gerçek ekran koordinatları. Normal oyuncu kaydı QA ve inceleme modlarından ayrıdır.

Otomatik turdan sonra yalnız seçim vurgusunun renk/ışık tonu görsel olarak açıldı; etkileşim ve yerleşim değiştirilmedi. Bu son ton gerçek simülatörde ayrıca görüntülenir. Kullanıcı estetik kabulü, fiziksel telefonda ses dinlemesi ve cihaz FPS/pil ölçümü bu raporun tamamlandı iddiaları arasında değildir.
