# Giriş ve şehir tasarımı doğrulaması — 17 Kasım 2026

## Kapsam

Diğer oturumun doğrulanmış Apple giriş, çıkış ve giriş sonrası doğrudan tahtaya dönüş çalışması `10b1dde` commitinde main üzerinde korunmuştur. Hesap silme/bulut altyapısı bu görsel turda açılmamıştır. Kurulum ajanının `account-setup-status.md` dosyası bu commitlerin kapsamına alınmamıştır.

İlk üç şehrin TR/EN görünen adları onaylı belgede belirtildiği gibi uygulanmıştır: Belenyaka / Meadowbrook, Badınca / Baker’s Market, Yalıkoru / Timberbay. city1/city2/city3, eşya, üretici ve görev kimlikleri değişmez. Sonraki onaylı şehir adayları “Yakında” listesinde gösterilir; liste yeni geliştirme sırası veya açılış sözü değildir.

## Tasarım

- Profilin ilk içeriği giriş alanıdır: Masterland işareti, hesap durumu, native Apple düğmesi ve ortak Google/Facebook düğmeleri. Yerel oyuna dönüş korunur. Google/Facebook aynı bileşenden ve 48 birim yükseklikten türer; native Apple aynı yüksekliği kullanır. Sağlayıcı işaretleri yeniden çizilmemiştir.
- Google logosu Google Identity'nin resmî görselidir. Facebook işareti standart 2023 ikonunun vektörden PNG dönüşümüdür. Kaynaklar aşağıdadır. Facebook özelliği kapalı kalır; düğmesi durumu belirtilerek devre dışıdır. Backend kapalı build'de hiçbir sağlayıcı eylemi çalışmaz.
- Şehir ekranındaki dar sağ navigasyon ve bölgeler arasında otomatik kayan harita yerine üç küçük şehir kartı vardır. Seçili şehrin başarıları iki sütunlu virtualized listede yer alır. Liste ahşap pano üzerindedir; şehir seçimi kaydırmadan etkilenmez. Gelecek şehirler aynı listenin sonunda bulunur. Seyahat eylemi iç genişliğe hizalıdır.
- imagegen ile aynı mevcut arka plan referansından üç yeni tam ekran sahne üretilmiştir. Ufuk üstte, tahta altındaki merkez boş, kenar ayrıntıları dış şeritte tutulmuştur. Yeşil kıyı/çiftlik, pembe pastane ve turkuaz balıkçılık/marangozluk temaları ayrılır. Arka plan `cover` ile tek katmandır. Tahta geometrisi değiştirilmemiştir.
- Ahşap başarı panosu ayrı üretilmiş ön cephe dokusu kullanır; kısa üretici rafı görseli uzun pano olarak esnetilmez.

## Doğrulama

97 birim testi, TypeScript ve lint geçti. Release iPhone 16 Pro simülatöründe şu kontroller geçti:

- `testCityCatalogAndAuthRefreshPreserveBoard`: doğru şehir adı ve seçimi, kilitli Yalıkoru, seyahatsiz seçimde aynı altın, değişmeyen tahta ölçüsü, eşit Google/Facebook düğme genişliği, profil kapatma.
- `testOfflineAccountPanelAndContentLanguage`: devre dışı sağlayıcılar, yerel kayıt ve TR/EN geçişi.
- `testMilestoneCityRoundTrip`: Badınca açılışı/üretimi ve şehirler arasında gidip gelince ayrı tahtaların korunması. Bu test mevcut seviye 12 / 6.000 altın ekonomisini sınar; sıraya alınan seviye 8 kararı henüz uygulanmamıştır.

Ekran görüntüleri çıkarılıp görsel olarak incelendi. İlk incelemede Google/Facebook iç yüzey genişliği farkı bulundu; `width: 100%` ile düzeltildi ve tekrar native test edildi.

Son test paketleri:
- `/private/tmp/masterland-city-refresh-final.xcresult`
- `/private/tmp/masterland-auth-width-final.xcresult`

Bu sonuç gerçek Google/Facebook giriş kabulü, telefon kurulumu, TestFlight yüklemesi, gerçek hesap silme veya canlı bulut eşitleme kabulü değildir. Apple girişinin önceki cihaz kabulü ayrı rapordadır. Native Apple düğmesinin dili işletim sistemi yerelleştirmesini izler.

## Sonraki sıra

Kullanıcının bu tur sırasında ilettiği ekonomi, üretici cooldown, keşif, güç etiketleri, sipariş çeşitliliği ve idle yönlendirme talepleri `kararlar.md` ve `acik-konular.md` içinde kayıtlıdır. Bu görsel turda oyun ekonomisine uygulanmamıştır.

## Sağlayıcı görsel kaynakları

- https://developers.google.com/identity/branding-guidelines
- https://developers.google.com/identity/images/g-logo.png
- https://upload.wikimedia.org/wikipedia/commons/b/b9/2023_Facebook_icon.svg
