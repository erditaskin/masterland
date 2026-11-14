# ultima ana tahta arayüzü

Güncelleme: Bu dosya önceki tasarımı açıklar. Güncel kullanıcı değişiklikleri ve ekran standardı `ui-standard.md` içindedir. Alt eşya şeridi ve sürekli unvan etiketleri kaldırılmıştır; dört büyük kısayol yerine küçük, çoğalabilir eşya açma düğmeleri kullanılır.

14 Kasım 2026. Kullanıcının sunduğu deniz kasabası temalı mobil ekran, sanat yönü referansıdır. Aşağıdaki düzen senior tasarım değerlendirmesiyle hazırlanmış öneridir; çalışan oyun uygulaması değildir.

## Şehir ve meslek devamlılığı

- Skara Brae (`city1`): Ekin, değirmen ve temel ekmek üretimi. Farmer ve Baker başlangıcı.
- New Haven (`city2`): Baker eğitiminin ileri içeriği; pastalar ve bakery koleksiyonları. Yeni şehir açılması otomatik yüksek ustalık vermez.
- Cove (`city3`): Fishing ve Carpentry açılır. Balıkçılık ile ahşap eşya zincirleri aynı tahtada bulunur.
- Tasarım yorumu: Baker aynı meslek kimliğiyle Skara Brae'den New Haven'a devam eder. New Haven'a girişte Baker rütbesi Apprentice'a sıfırlanmaz. Şehirler farklı sipariş ve koleksiyon havuzları sunar. İleri tariflerin kesin ustalık ve level eşikleri belirlenmemiştir.

## Referanstaki düzeltmeler

- Balıkçılık ve carpentry içeren gösterim Cove olarak adlandırılır. Skara Brae ekranında tarım ve ekmek, New Haven ekranında pastacılık görülmelidir.
- Genel level ve XP, şehirde görülen meslek ustalığı etiketlerinden ayrı gösterilir.
- Sipariş kartlarında istenen eşya, mevcut miktar/hedef, altın ve XP bulunur. Hazır sipariş açık Teslim et eylemi gösterir.
- Onaylı zincirler için balık, kütük, tahta, tabure ve sandalye kullanılır. Yengeç, ıstakoz, kabuk ve pusula gibi ek içerikler bu ekran için çıkarılır; yeni koleksiyon kararı verilmez.
- Kaynak üreten nesneler tahtada bulunur. Ayrı bir tarif veya crafting ekranı eklenmez.
- Görsel gürültü ve altın süslemeler azaltılır. Tahtada boş alan, eşya siluetleri ve eşit kareler önceliklidir.

## Ekran düzeni önerisi

1. Üst kaynak satırı: Genel level, küçük XP çubuğu, dayanıklılık ve dolum zamanı, altın, premium para ve ayarlar.
2. Kısa şehir görseli ve mevcut şehir seçimi. Açılmış şehirlere erişim şehir seçicisinden veya Şehirler sekmesinden sağlanır.
3. Meslek ustalığını gösteren küçük etiketler.
4. En fazla üç görünür sipariş kartı. Daha fazla sipariş için yatay gezinme davranışı uygulamada değerlendirilecektir.
5. Kullanıcının isteğiyle geri eklenen dört kutulu koleksiyon/üretici erişim şeridi.
6. Altı sütun ve yedi satırdan oluşan tahta önerisi. Bu kapasite ekonomi kararı olarak kesinleştirilmemiştir.
7. Seçili eşya adı ve seviye bilgisi, bilgi düğmesi ve Depo erişimi.
8. Alt menü: Tahta, Koleksiyon, Şehirler, Etkinlikler ve Market.

## Etkileşim kuralları önerisi

- Aynı eşyanın üstüne sürükleme birleştirir. Dokunma eşya bilgisini seçer.
- Üreticiye dokunma, gerekli dayanıklılık ve boş kare varsa yeni eşya çıkarır.
- Tahta dolduğunda başarısız üretim dayanıklılık harcamaz.
- Sipariş hazır olduğunda teslim düğmesi etkinleşir. Eşyalar teslimde tüketilir; koleksiyon kaydı korunur.
- Şehir değiştirme ortak tahtayı silmez veya eşya kaybettirmez. Aktif üretici ve sipariş havuzu davranışı ayrıca netleştirilecektir.
- Dayanıklılık sıfır olduğunda dolum sayacı, reklamla ödül ve satın alma seçenekleri aynı kaynak panelinden erişilebilir olmalıdır. Ekranda sürekli kampanya penceresi açılmaz.

## İsim ve gösterim referansları

Şehir başlığı city_id üzerinden name_key ile çözülür. Ürün ikonları, görev hedefleri ve eşya bilgisi item_id üzerinden bağlanır. Metinlerde görünen şehir adları davranış koşulu olarak kullanılmaz. Görsel dosyasında raster metin bulunması, oyun arayüzünün metinleri sabitlemesi anlamına gelmez.

## Örnek değerler ve teslim

Level, bakiye, XP ödülü, enerji tavanı ve sayaç üzerindeki sayılar yalnızca görsel örneklerdir. Ekonomi dengesi veya satın alma fiyatı değildir. Statik görselin okunabilirliği kontrol edilir; gerçek cihazdaki dokunma ve erişilebilirlik davranışları uygulama sırasında doğrulanmalıdır.

Girdi görseli: `../assets/references/ui-reference-01.jpeg`.
Güncel Cove çıktısı: `../assets/ui/ui-city3-v2.png`. Önceki `ui1-board-v1.png` korunur. Skara Brae çıktısı: `../assets/ui/ui-city1-v1.png`.
Üretim istemi: `../assets/ui/ui1-prompt.txt`.
Üretim yöntemi: Yerleşik image_gen aracı. Özgün referans değiştirilmez.

## Dört kutulu şerit düzeltmesi

Kullanıcı özgün referanstaki şeridin korunmasını istedi. Cove için İskele, Ağlar, Kereste ve Atölye; Skara Brae için Tarla, Değirmen, Fırın ve Hasat gösterilir. Şerit mevcut koleksiyon veya üreticiye erişim önerisidir; ek kaynak üretim mekaniği kesinleştirilmedi. Gerçek üretici nesneleri tahta üzerinde korunur. Görsel kapasite, ödüller ve başlangıç bakiyesi örnektir.
