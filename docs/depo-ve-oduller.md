# ultima depo koleksiyon ve keşif ödülleri

14 Kasım 2026. Kullanıcı depo ile koleksiyonun önceki tasarımda karıştığını düzeltti. Aşağıdaki ayrım günceldir; önceki şehir stok kataloğu yorumu geçersizdir.

## Depo

Depo, oyuncunun tahtadaki fazla ürünleri alıp sakladığı yerdir. Oyuncu tahtada birleştirmeye devam edeceği ürünleri depoya göndermek zorunda değildir.

- Kapasite slotlarla sınırlıdır ve level ile görev ihtiyaçlarına göre ölçeklenir.
- Önceki altın/elmasla kapasite genişletme kararı korunur. Kesin fiyatlar, başlangıç kapasitesi ve ödeme seçenekleri henüz belirlenmemiştir.
- Aynı ürünlerin tek slotta istiflenmesi kullanıcı tarafından olasılık olarak belirtildi. Kesin istif kuralı ve adet sınırı açık konudur.
- Şehir sekmeleri ve ürün grubu kartları artık deponun kesinleşmiş görünüm şartı değildir; koleksiyon görünümüne aittir.

## Koleksiyon kartı

Koleksiyon, o şehirde oyuncunun leveline göre açtığı bütün malzemeleri ve ürünleri kalıcı olarak gösteren karteladır. Ürünler ürün kutuları, yani ürün grupları altında toplanır.

- Şehir seçimi ve ürün grupları bulunur. Mevcut şehrin seçili açılması önceki gezinme tercihi olarak koleksiyona taşınır.
- Ürün keşfi, tüketilebilir stok değildir. Eşya birleşse, teslim edilse veya depoya taşınsa da keşif kaydı kalır.
- Örneğin Skara Brae altında tahıl/ekmek ve sebze grupları; Cove altında balıkçılık ve carpentry grupları gösterilir.
- Depoda kaç eşya olduğu, koleksiyon keşfiyle aynı kayıt olarak tutulmaz. İstenirse ürün ayrıntısında yardımcı stok bilgisi ayrıca gösterilebilir.

## Ürün açma ve keşif ödülü

- XP harcanmaz; genel oyuncu levelini belirler.
- Şehre özel ürün grubunda yeni ürün için hem gereken level hem de satın alınmış grup slotu bulunmalıdır.
- Grup slotları altın ve elmasla açılır. İki para biriminin birlikte mi, alternatif olarak mı kullanılacağı ve fiyatlar henüz belirlenmemiştir.
- Level yeterli olup slot açılmadığında ürün koleksiyonda soru işareti olarak kalır; tahtada üretilebilen ürün havuzuna girmez.
- Slot satın alınarak şartlar tamamlandığında ürün açılır ve tahtada belirebilir.
- Kullanıcının son açıklamasına göre yeni ürün açma ödülü XP ve şansa bağlı sürpriz elmastır. Kesin XP, elmas miktarı ve ihtimali belirlenmemiştir.
- Aynı ürün için açma ödülü yalnızca bir kez verilir. Yeniden üretme veya depoya taşıma yeni açma sayılmaz.
- Önceki altın ödülü açıklamasının son XP örneğine ek olarak korunup korunmayacağı açık konudur.

## Referans yapısı

Depo stokları item_id ve miktar ile, koleksiyon keşifleri ise oyuncunun açtığı item_id kayıtlarıyla ayrı tutulur. Koleksiyon görünümünde city_id ve collection_id üzerinden ürün grupları kurulur. Görünen şehir ve ürün adları değiştirilebilir ad anahtarlarından çözülür.

## Açık kararlar

- Depoda bir slot tek ürün mü, istif mi tutacak? İstifin sınırı ne olacak?
- Depo kapasitesi ortak mı, şehir başına mı olacak?
- İlan teslimi tahtadan mı, depodan mı veya ikisinin birleşiminden mi düşecek? Önceki yalnızca şehir deposundan düşme yorumu bu ayrım sonrasında kesin karar sayılmaz.
- Ürün slotla açıldığında ödülün otomatik verilmesi veya koleksiyon kartından toplanması davranışı.
- Keşif ödülünü otomatik verme veya koleksiyon kartından toplama davranışı nasıl olacak?
- Kapasite, fiyat ve keşif ödülü miktarları nasıl dengelenecek?

## Level ve satın alınan grup slotu

Bu bölüm önceki XP ile kapasite açma yorumunu düzeltir. XP tüketilmez. Level uygunluğu ve altın/elmasla satın alınan ürün grubu slotu birlikte kontrol edilir. Ürün grubu slotu, fazla eşya saklanan depo slotundan ve tahta boş karesinden ayrıdır.

Kullanıcının örneğinde level 1'de Saman görünür ve Farm kapasitesi 1'dir. Level 2'de Maydanoz için level koşulu sağlanır; Farm slotu satın alınmadıysa Maydanoz soru işareti olarak kalır ve tahtada gelmez. Slot satın alınınca Maydanoz açılabilir, tahtada gelebilir ve ilk açma ödülü kazanılır. Bu isimler ve leveller açıklayıcı örnektir, kesin içerik dengesi değildir.

Slot maliyetleri, başlangıç kapasitesi, ürün level eşikleri ve ödüller sonraki tasarım işidir. İlanların ürün isteme havuzu da bu erişim koşullarını dikkate almalıdır.

## Ürün grubu teriminin netleştirilmesi

Item grubu, tıklanınca tahtaya ürün çıkaran üretici kutusudur. Ürün grubu slotu, şehirdeki ilgili producer_id altında yeni ürün türü açar. Saf merge ve bağımsız üretici zincirleri onaylanmıştır; farklı zincirler aynı ilanda istenir. Ayrıntı `ureticiler-ve-zincirler.md` içindedir.


## 14 Kasım 2026 ilk oynanabilir prototip kapsamı onayı

Kullanıcı önce ajanın simülatörde test etmesini, testler geçtikten sonra kendisinin simülatörde denemesini, ardından Device Hub üzerinden gerçek cihaz testini istedi. İlk prototipte yalnız Skara oynanabilir; diğer şehirler haritada kilitli görünür. Açılan şehirlerin tahta durumları ayrı saklanır. Dayanıklılık ortaktır: kapasite 100, üretim başına 1, 120 saniyede 1 yenilenme. Üreticiler seri üretim kapasitesi bitince beklemeye girer; her dokunuşta bekleme yoktur. Üreticiler zincirin ilk ürününü çıkarır.

İlan teslimi tahta ve depoyu birlikte sayar; önce tahtayı tüketir. Depoda her eşya bir slot kaplar. İlk keşif ödülü ürün ilk kez gerçekten elde edilince verilir; yalnız ürün slotunu satın almak keşif ödülü vermez. Cihazda yerel kayıt prototip için yeterlidir. Gerçek reklam ve satın alma prototipten sonra eklenecektir. Son level, altın ve giriş görevi değerleri ilk deneme dengesi olarak kullanılabilir; oynanış testleriyle değiştirilebilir. Üretici kapasitesi/dolum süresi, depo fiyatları ve keşif ödül miktarları henüz kesinleşmemiştir; uygulamadaki ilk değerler açıkça deneme ayarıdır.
