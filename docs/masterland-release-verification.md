# Masterland Release doğrulaması — 15 Kasım 2026

## Aktif teslim

Kök: `/Users/erdi/masterland`. Uygulama: `mobile/`. Bundle: `com.erditaskin.masterland`. Node 22, Expo 58, React Native 0.88, Hermes ve native Gesture Handler/Reanimated kullanılır.

Yeni ana simülatör: Masterland-QA, iPhone 17 Pro, iOS 26.3, UUID `79CE7236-EC0C-42C6-A937-1C3C016F6DEC`.

SwiftUI oyun kaynakları proje dışına `/Users/erdi/Documents/Codex/2026-11-14/kanki/work/swiftui-archive-20261115` altında arşivlenmiştir. Git deposuna SwiftUI oyun kaynakları, node_modules, Pods, üretilen native proje ve oyuncu kayıtları eklenmez. Native XCTest kaynakları otomatik UI kontrolü içindir.

## Kayıt aktarımı

Önceki RN kaydı kaynak dosya değiştirilmeden yeni uygulamanın Documents/migration-v2.json alanına kopyalandı. Kaynak SHA-256: `e81a77c7557f550a3e2d151a503f74350ec6f3d8a5425b887ffa31c241d797e5`. Aktarılan değerler XP 0, altın 0, elmas 0 idi. Uygulama schema 2 kaydını doğrular ve kendi normal kaydı yoksa bir kez alır. İnceleme ve QA oturumları bu normal kayda yazmaz.

## Kontrol kapsamı

TypeScript strict kontrolü ve lint geçti. 27 saf motor/tahta girdisi/kayıt dönüşümü testi geçti. Yeni Release derlemesi başarıyla tamamlandı. Hermes paketi production ve bytecode seçeneğiyle üretildi; uygulama Metro bağlantısı gerektirmez.

Seri üretimde önceki React Pressable sürümü 20 hızlı dokunuşun ikisini kaçırdı. Bu hata gizlenmedi; üretici girdisi native UI runtime Tap/LongPress algılamasına taşındı. Test, enerji ve eşya sayısını birlikte kontrol eder. Nihai simülatör sonuçları aşağıya eklenir.

## Kabul sınırı

Simülatör testleri gerçek cihaz FPS, ısı, pil veya haptik kalitesini kanıtlamaz. Masaüstü motor benchmarkı cihaz performansı değildir. Onaylı sanat hedefi V10’dur; yeni RN ekranının kullanıcı görsel kabulü henüz alınmamıştır. Test geçmesi pixel-perfect iddiası için yeterli değildir.

## Ana simülatör sonucu

Release iPhone 17 Pro üzerinde 6 UI testi, 0 hata, 82.528 saniye ile geçti. Sonuç paketi `/private/tmp/masterland-release-final.xcresult`; özet teslim klasöründe `release-test-summary.json` içindedir. Senaryolar: normal kayıt ve yeniden açma, tam ekran sayfalar ve depo, 54 hücrenin kare/eşit geometrisi ve yatay ilanlar, merge ile görev/üretici satın alma, 30 seri dokunuş ve üretici beklemesi, geçersiz bırakma ardından yeni sürükleme.

Son kaynakta sayfa açma/kapatma ve eşya seçimi için düşük sesli geri bildirim de eklendi. Tek native tap sesi, 65 ms hız sınırı ve aktif uygulama koşulu kullanılır. Ses kapalı tercihi korunur. Bu eklemeden sonra tip/lint yeniden geçti; son paket küçük ekran regresyonuna da alındı. Sesin estetik kalitesi için gerçek telefonda dinleme incelemesi hâlâ gereklidir.

Onaylı referansın nötr boş kâğıt bölgesi tek doku olarak tahtanın altında kullanılır. Karelerin çizgileri ve açık/koyu tonu ayrı katmandır; tahta nesneleri ve seçim alanı gerçek etkileşimli bileşenlerdir. İlan başlığı ahşap dokuludur; altın ödülü metin noktası yerine gerçek altın simgesi taşır. Seçili alt menüde sınırlı sıcak ışık vardır; yeşil basma parçası veya büyüyen seçim yoktur.

## Küçük ekran sonucu

Son ses eklemesini de içeren paket, Masterland-Compact-QA (iPhone 13 Pro, iOS 26.3.1, UUID 87EAC525-43A7-4F4A-8EDB-5626A5DA5F52) üzerinde 3/3 UI testini 41.540 saniyede geçti. Tam ekran sayfalar/depo, kare hücreler/yatay ilanlar ve 30 seri üretim/kapanan kapasite doğrulandı. Sonuç `/private/tmp/masterland-compact-final.xcresult`; teslim özeti compact-test-summary.json dosyasıdır. Ana simülatör de aynı son pakete güncellendi ve görsel inceleme oturumunda açık bırakıldı.

GitHub hedefi: https://github.com/erditaskin/masterland, dal main. Oyuncu kayıtları veya test videoları git deposuna konmaz. İkon özgün imagegen üretimidir; kaynak ve prompt mobile/assets/icon.png ile icon-prompt.txt içindedir. Font lisansları özgün OFL metinleriyle saklanır; lisans dosyalarındaki kaynak boşlukları değiştirilmemiştir.

## Güncel görsel/ses turu

15 Kasım 01.14.55 fotoğrafı ve kullanıcının hücre oranı seçimi sonrasında uygulama yeniden işlendi. Güncel ölçümler, 30 saf test, 8 ana ve 4 küçük ekran UI sonucu reference-fidelity-20261115.md dosyasındadır. Önceki ekranlar tarihçedir; son canlı sürümün görsel kanıtı olarak kullanılmaz. Yeni çerçeve, art sınırı metadata’sı, gerçek ilan çeşitliliği, birleşme ipucu ve özgün ses ailesi bu turda eklendi.
