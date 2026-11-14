# ultima level ve şehir ustalığı modeli

14 Kasım 2026. Şehirler oyuncunun genel leveliyle açılır. Şehir uzmanlığı ayrı, uzun vadeli ilerlemedir. Önceki şehri bitirme veya Grandmaster olma şartı kaldırılmıştır.

## Şehir açılması

| Şehir kimliği | Görünen ad | Örnek açılma leveli |
| --- | --- | --- |
| city1 | Skara Brae | 1 |
| city2 | New Haven | 2 |
| city3 | Cove | 5 |

Skara Brae başlangıç şehridir. Level 2 ve 5 kullanıcı tarafından örnek olarak verilmiştir; sayısal XP ve süre dengesi henüz kesinleşmemiştir. Minoc için açılma leveli belirlenmemiştir.

Oyuncu açtığı şehirlere tekrar gidebilir. Şehir değişimi o şehirdeki ustalığı silmez. Mevcut tek tahta kuralı korunur; şehirler arasında aktif siparişlerin ve üreticilerin nasıl gösterileceği ayrıca tasarlanacaktır.

## İki ayrı ilerleme

- Genel XP oyuncunun levelini artırır ve yeni şehirleri açar.
- Meslek ustalığı meslek kimliğiyle ilerler. Farmer, Baker, Fisherman ve Carpenter ayrı ilerlemelerdir. New Haven’da daha iyi Baker olma açıklamasına dayanan güncel tasarım yorumunda Baker ilerlemesi Skara Brae’den New Haven’a taşınır; şehre girerken sıfırlanmaz. Şehirler ayrı koleksiyon ve ilan havuzları sunar.
- Bir şehirde kazanılan genel XP diğer şehirlerin açılmasına katkıda bulunur. Yalnızca başka şehirde level atlamak, eski şehirde otomatik Grandmaster yapmaz.
- İlk altı giriş görevinden sonra onaylanan Apprentice unvanları korunur. Apprentice sonrası eşikler henüz belirlenmemiştir.
- Grandmaster olmak, yeni şehre geçmekten daha uzun vadeli bir hedeftir.

## Tekrar eden siparişler

Açılmış şehirlerde farklı siparişler tekrar üretilir. Genel level yükseldikçe uygun sipariş havuzları, XP ve altın ödülleri büyür. Ustalık gerektiren ileri siparişlerde ilgili mesleğin seviyesi ayrıca yeterli olmalıdır.

Önerilen seçim kuralı: Şehir açık, genel level uygun ve ilgili meslek ustalığı yeterli ise ilan havuzuna alınır. Bu, yeni level kararını önceki ustalığın ilanları açması kararıyla birleştirir.

Ödül artışı, siparişin eşya üretim maliyeti ve zorluğuyla dengelenmelidir. Genel leveli yüksek bir oyuncunun en kolay siparişi sınırsız tekrarlayarak bütün ileri içeriği hızla açması denge hesabında kontrol edilecektir.

## Eski taslaktan değişenler

- 24. görevin New Haven açması kaldırıldı.
- 9, 12, 15, 18 ve 24. görevlerde otomatik yüksek unvan kazanma taslağı kaldırıldı.
- Önceki 24 görev, giriş görevleri ve sonraki sipariş havuzu için içerik adayları olarak korunur; şehri bitiren zorunlu sıra değildir.
- Önceki 1, 3, 7 ve 14 gün yaklaşımı şehir tamamlama süresi değildir. Yeni şehirlerin giderek zor açılması için level ve XP eğrisine uyarlanacaktır. Kesin süre hedefleri açık konudur.
- Önceki Excel dosyası v1 inceleme arşividir; bu yeni ilerleme kurallarını yansıtmaz. Güncel tasarım verisi `../data/content-reference.json` sürüm 2'dir.

## Sonraki denge çalışması

- Level 1–5 arasındaki toplam XP gereksinimleri.
- Şehir açılma aralıkları ve beklenen ücretsiz oyun süresi.
- Her mesleğin Apprentice sonrası ustalık eşikleri.
- Level ve ustalığa göre sipariş havuzları ile altın ve XP ödülleri.
- Şehir gezme sırasında tek tahtadaki eşya ve aktif sipariş davranışı.
