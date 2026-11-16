# Talep karşılaştırması — 16 Kasım 2026

Kullanıcının yeniden gönderdiği ayrıntılı talep metni, daha sonra verdiği yedi kapsam cevabı ile birlikte karşılaştırıldı. İncelenen oyun kodu 03dc608 commit'idir; son başarılı testlerden sonra oyun kodunda değişiklik yoktur.

| Talep | Uygulamadaki durum |
|---|---|
| Pasif enerji yalnız 100'e kadar dolsun | Uygulandı; 125'ten 90'a düşüş sonrası 100'e dolum ve eski kapasite kayıtları motor testinde doğrulandı. |
| Ödül enerjisi 100 üzerinde biriksin | Uygulandı; enerji satışı ve başarı/level ödülleri aynı kuralı kullanır. |
| Kapasite satışı kalksın; enerji ucuzlasın | Kullanıcıya gösterilen kapasite paketi kaldırıldı. 25 enerji 3 elmas; 100 enerji 10 elmas. Eski alan ve eylem isimleri kayıt/kod uyumluluğu içindir; kalıcı kapasite artırmaz. |
| Altın harcama noktaları | Üretici, üst ürün alanı, depo, enerji ve tek seferlik şehir girişi mevcuttur. XP harcanmaz. |
| Skara'nın beş üreticisi 7–12 basamak olsun | 7, 8, 9, 10, 12 basamak; her ara merge motor testinde doğrulandı. |
| Eksik ürün görselleri app stilinde imagegen ile üretilecek | İki özgün alfa atlası ve New Haven arka planı üretildi; promptlar, koordinatlar ve görseller kayıtlıdır. |
| Her ilk keşifte ödül | İlk gerçek elde edişte bir kez altın ve XP; sürpriz elmas olasılığı. Kullanıcı cevabına göre alan satın alımı ayrıca keşif ödülü vermez. |
| Parşömen bildirimi; sıradan ilanlar hızlı kalsın | Keşif kısa/otomatik; level ve özel başarı dokunarak kapanır. Normal ilanlar seri teslim edilir. |
| Ödüller sıraya alınsın ve özelleştirilebilsin | Kalıcı kuyruk, işlem tekilliği, başarı mesajı ve süslemesi uygulanmıştır. Bildirimi kapatmak tekrar ödeme yapmaz. |
| Level alanı küçülsün, sayı ortalansın | HUD daraltıldı; kalkan sayısı ortalandı. |
| Enerji tek sayı ve 100'e kalan süre | Uygulandı. 100 ve üzerinde dolum sayacı gösterilmez. |
| Altın/elmas büyük; sayısal font standart | İkon/rakamlar büyütüldü; ortak sayısal font ve boyut standardı kullanılır. |
| Profil ve bilgi aşağı alınsın | Alt satıra taşındı; Tümü bağlantısıyla çakışma görsel incelemede düzeltildi. |
| Hazır olanlara küçük glow | Ortak Reanimated opaklık darbesi; kare/eşya büyümez. Hareketi azalt tercihi ve görünmeyen sayfa durumu korunur. |
| Yeni şehir level ve altınla açılsın; görev tamamlamak gerekmesin | New Haven seviye 12 + tek seferlik 6.000 altınla açılır. Başlangıç görevlerini bitirmek şart değildir. |
| Artan şehir süreleri dengelensin | Gerçek motor simülasyonu ilk geçişi yaklaşık 19,9 saat, New Haven'daki sonraki eşik aralığını yaklaşık 75 saat ölçtü. Daha sonraki şehirlerin 5/7/9/11 günlük hedefleri o şehirler eklenirken dengelenecektir. Canlı oyuncu verisi değildir. |
| New Haven oynanabilir ve ayrı temalı olsun | Pembe pastane teması, dört üretici, 7/8/9/10 basamak, ayrı tahta/depo/ilanlar mevcuttur. Cüzdan, enerji ve genel XP ortaktır. |
| Haritada şehre geç düğmesi | Level/altın koşulu ve ziyaret edilmiş şehre ücretsiz dönüş gösterilir; gidiş/dönüş native testinde doğrulandı. |
| Altın/elmas marketi ve satın alma örnekleri | Oyun içi takaslar ile 30 elmas/2.500 altın StoreKit test ürünleri mevcut. Native satın alma ve bakiye artışı doğrulandı. |
| Siparişe özel görsel üretim rehberi | Eksik ilana dokununca üretici ve iki aynı üründen oluşan adımlar gösterilir. Çok ürünlü ilanda ürün seçilir. Hazır ilan doğrudan teslim edilir; Tümü ayrı bağlantıdır. |
| Test enerji düğmesi; production'da gizli | Test sürümünde 100'e tamamlar, 100 üzerinde azaltmaz. Production varsayılanında görünüm ve motor eylemi kapalıdır. |
| Simülatör doğrulaması ve telefon kurulumu | 51 motor testi ve son toplu turda 10 Release native test geçti. Aynı imzalı Release bu kontrolden sonra iPhone'a yeniden kuruldu; uygulama silinmedi ve kayıt sıfırlanmadı. |

## Tamamlandı kapsamının sınırı

Onaylanan kapsam prototiptir. Kullanıcı gerçek para marketinde önce StoreKit test ortamını seçtiği için canlı satış, App Store Connect ürün yayını ve sunucuda doğrulama bu turun tamamlanmış özellikleri değildir. Telefona yalnız kurulum yapmak yerel StoreKit test oturumu başlatmaz. Altın/elmasla oyun içi paketler kullanılabilir.

Cove bu turda oynanabilir şehir olarak taahhüt edilmedi; önizlemedir. Fiziksel kullanıcı kabulü, canlı ekonomi telemetrisi ve cihaz FPS/pil/termal ölçümleri ayrıca yapılacaktır. Test başarısı yüzde 100 görsel eşleşme garantisi değildir.
