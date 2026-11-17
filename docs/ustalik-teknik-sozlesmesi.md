# Ustalık içerik sözleşmesi

17 Kasım 2026. Bu belge teknik altyapıyı tanımlar; yeni meslek, kademe, ödül tutarı veya görsel tasarım onayı değildir.

## Kaydedilen teslim bilgisi

Save.deliveryProgress isteğe bağlıdır. Eski kayıtlar bu alan olmadan geçerlidir. Geçmişte hangi ürünlerden kaç sipariş teslim edildiği kaydedilmediği için eski XP'den ustalık sayısı uydurulmaz. Yeni başarılı teslimler alanı oluşturur. Şehir başına ürün adetleri ve siparişte birlikte bulunan üretici kümelerinin sayıları tutulur; büyüyen bir olay günlüğü saklanmaz.

Yalnız başarıyla teslim edilen ilan sayılır. İlanın gerektirdiği ürünün tahtadan veya depodan gelmesi sonucu değiştirmez. Merge, üretim, reklam, keşif ve başarısız/tekrar teslim bu sayaçları artırmaz. Karma ilandaki birden fazla ürün aynı mesleğe aitse görev sayısı yine birdir. Ürün adedi ayrı ölçüdür. Şehir sayaçları birbirine karışmaz.

## Başarı tanımı

Mevcut data/content-reference.json achievements listesi genişletilir. Yeni bir paralel başarı deposu oluşturulmaz. Mevcut id, city_id, enabled, target, reward, celebration alanları korunur. Aşağıdaki alanlar isteğe bağlıdır:

- profession_id: sabit meslek kimliği.
- rank_id: sabit kademe kimliği.
- badge_id: sabit rozet kimliği.
- requirements: bütün elemanları sağlanması gereken teslim koşulları.

Her koşulda metric delivery_orders veya delivery_items, producer_ids listesi, match ve pozitif tam sayı target vardır. delivery_orders + match:any seçili üreticilerden en az biri bulunan her siparişi bir kez sayar. match:all seçili üreticilerin aynı siparişte birlikte bulunmasını ister. delivery_items seçili üreticilere ait teslim edilen toplam ürün adedini sayar; her üretici için ayrı adet isteniyorsa ayrı koşullar yazılır. Üreticiler başarının şehrine ait olmalıdır.

Eski metric/subject_id tabanlı başarılar aynen çalışır. Çok koşullu başarıların ortak ilerleme çubuğu, en gerideki koşulun tamamlanma oranını gösterir. Ayrıntılı koşul satırları deliveryProgress seçicisini kullanabilir. UI, toplam target değerini yüzde ölçeği olarak kullanabilir; karma koşul sayıları tek bir görev adedi gibi sunulmamalıdır.

## Unvan, ödül ve profil

reward.title mevcut sabit unvan kimliğidir. Var olan claim-achievement eylemi altın, XP, elmas, enerji, unvan ve kutlama kuyruğunu tek geçişte işler. claimedAchievements tekrar ödemeyi engeller. earnedBadges(save), alınmış başarılardan profil için rozet/unvan/meslek/kademe/şehir referanslarını türetir; ayrı bir ödül veya rozet kopyası kaydedilmez. Rozet görseli ve TR/EN etiketleri içerik tesliminde bağlanacaktır.

## Tasarım ajanından gerekenler

Onaylı şehir ve üretici kimlikleri, meslek grupları, kademe kimlikleri ve TR/EN adları, her kademenin koşulları, ödülleri, ayrı rozet asset referansları ve kutlama türü gereklidir. Şehir başına 10–15 hedefinin nihai dağılımını kullanıcı onaylamalıdır. Bu altyapı kendi kendine şehir veya kademe eklemez. Önceki erken intro unvanları henüz kaldırılmadı; yeni içerik onaylanınca eski kazanımları koruyan geçişle ele alınacaktır.

## Kapsam sınırı

Bu tur yeni ustalık ekranı, profil vitrini veya 10 şehirlik içerik oluşturmaz. Bulut eşitleme, gerçek hesap silme kabulü ve canlı reklam ödülleri ayrı yayın açıklarıdır; bu dosya bunları tamamlandı saymaz.
