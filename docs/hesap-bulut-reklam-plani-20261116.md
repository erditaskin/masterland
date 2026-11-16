# Masterland hesap bulut kayıt ve reklam planı

16 Kasım 2026. İlk hedef, mevcut oyunu koruyarak Apple, Google ve Facebook ile hesap bağlama, bulut kayıt ve tek bir ödüllü reklam alanı eklemektir. Ayrı bir sunucu işletilmeyecek; Supabase Auth, Postgres ve gerektiğinde Edge Functions kullanılacaktır. Gerçek para satışı bu çalışmada açılmayacaktır.

## Onaylanan kapsam

| Konu | Durum |
|---|---|
| Türkçe ve İngilizce ile TR ve global hedef | Kullanıcı kararı |
| Supabase ve Facebook dahil sosyal giriş | Kullanıcı kararı |
| Apple ve Google hızlı giriş | Kullanıcının istediği kapsam |
| Basit reklam başlangıcı, isteğe bağlı enerji ödülü | Kullanıcı onayıyla ilk reklam kapsamı |
| Uygun oyuncuya ara sıra ödül hatırlatması | Kullanıcı isteği; kendiliğinden reklam açılmaz |
| +15 enerji, günde 4 ödül | Kullanıcı onayıyla başlangıç ayarı |
| Hatırlatmalar arasında 30 dakika, oturumda en fazla 2 | Kullanıcı onayıyla başlangıç ayarı |
| Çevrimdışı oynama | Merge ve görevler çalışır; eşitleme ve reklam internet gerektirir |
| Supabase, AdMob ve Meta projeleri | Henüz hazır değil; kurulum kapsamda |

İlk reklam turunda başka ağ, mediation, üretici reklamı, sandık reklamı, banner ve zorunlu geçiş reklamı eklenmeyecek. Bunlar sonraki veriyle değerlendirilecek.

## Oyuncu akışı

Oyuncu giriş ekranında bekletilmeden oyuna ulaşır. Mevcut cihaz kaydı açılır. Bulut hesabı kurulurken veya bağlantı yokken cihazdaki kayıt korunur.

Profilde “İlerlemeni koru” alanı bulunur. Apple, Google ve Facebook seçenekleri aynı Masterland oyuncu kimliğine bağlanabilir. Tek bir sağlayıcıyla başlamak yeterlidir; diğerlerini bağlamak isteğe bağlıdır. Facebook girişi arkadaş listesi veya Facebook paylaşımı istemez. İlk kurulumdaki mevcut cihaz kaydı korunur; kullanıcı hesap oluşturmadığı sürece cihazdaki ilerlemeye erişebilir. İnternet yokken ilk açılış da yerel oyunla çalışır; anonim sunucu kimliği daha sonra alınabilir.

“Buluta kaydedildi” durumu ancak sunucu yazmayı doğruladığında gösterilir. Diğer durumlar “Cihazda kayıtlı”, “Eşitleniyor” ve “Bağlantı bekleniyor” olarak açıkça ayrılır. Giriş yapılmış olması tek başına başarılı bulut kaydı anlamına gelmez.

Enerji ödülüne enerji bölümünden ulaşılır. Uygun zamanda gösterilecek küçük, kapatılabilir hatırlatma reklamı otomatik başlatmaz. Kullanıcı kapattıysa bekleme süresi başlar. Günlük hak veya hazır reklam yoksa teklif gösterilmez. Giriş ve reklam hatırlatmaları aynı anda üst üste açılmaz.

## Uygulama sırası ve kabul ölçütleri

| Aşama | Yapılacak iş | Geçme koşulu |
|---|---|---|
| 1. Hesap kurulumu, mevcut kaydı koruma ve ortamlar | Supabase, AdMob, Meta ve Google OAuth projelerini hazırlama; normal kayıt, görsel fixture ve test kredilerini ayırma; test ve canlı Supabase ortamlarını ayırma | Güncelleme sonrası mevcut ilerleme aynı kalır; test verisi canlı hesaba ulaşmaz |
| 2. Türkçe ve İngilizce temel | Metin çözümlemesini seçili dile bağlama; sosyal giriş, eşitleme ve reklam metinlerini çevirme | Dil değişince kimlikler ve ilerleme değişmez; yeni alanlarda sabit Türkçe metin kalmaz |
| 3. Supabase ve sosyal giriş | Auth, oturum saklama, Apple/Google/Facebook yapılandırmaları, hesap bağlama ve çıkış | Üç sağlayıcı gerçek cihazda başarılı, iptal ve hata yollarıyla çalışır; bağlama mevcut kaydı silmez |
| 4. Bulut kayıt ve cihaz değişimi | Sürümlü kayıt, revizyon kontrolü, yerel bekleyen yazma kuyruğu, ilk aktarım ve çakışma ekranı | İkinci cihazda aynı hesap doğru ilerlemeyi açar; eski cihaz yeni kaydı sessizce ezmez |
| 5. AdMob test reklamı | Tek enerji alanı, yükleme/hazır/gösterim/sonuç durumları, ses ve uygulama odağı yönetimi | Test reklamı açılır; hata/iptal hak veya enerji kaybettirmez; normal oyun kitlenmez |
| 6. Ödül doğrulama ve hatırlatma | Edge Function, imzalı AdMob callback doğrulaması, tek işlem kimliği, günlük hak ve teklif sıklığı | Aynı reklam ödülü iki kez ödenmez; yeniden açma veya iki cihaz günlük hakkı çoğaltmaz |
| 7. Görsel ve fiziksel kabul | Ortak parşömen kontrolleri, TR/EN taşma kontrolü, Release simülatörü ve gerçek iPhone | Temel merge, teslim, seyahat, kayıt, hesap ve reklam akışları birlikte çalışır |
| 8. TestFlight güncellemesi | Yeni build numarası, test reklam kimlikleri, test ortamı, sürüm notları | Mevcut testçi kaydı korunur; test ve canlı reklam ayrımı cihazda doğrulanır |

Aşama 2'de yalnız yeni ekranlar çevrilerek “oyun İngilizce hazır” denmeyecek. Ürün/üretici adları, ilanlar, başarılar, bildirimler, loading ve mevcut sayfalar da çeviri envanterine alınacak. Sabit item/city ID'leri ve mevcut ad anahtarları korunacak. Kodda ürün adını modül yüklenirken Türkçeye sabitleyen yapı seçili dilde çözümlemeye taşınacak.

## Hesap ve kayıt tasarımı

### Başlangıç ve hesap bağlama

Bağlantı olduğunda Supabase anonim oyuncu kimliği oluşturulabilir. Anonim Supabase kimliği, veritabanının herkese açık `anon` erişimiyle aynı şey değildir. Anonim oturum kalıcı hesaba bağlanana kadar başka telefondan kurtarılabilir bir kimlik gibi sunulmayacaktır. [Supabase anonim giriş](https://supabase.com/docs/guides/auth/auth-anonymous)

Apple ve Google için uygun native giriş; Facebook için desteklenen mobil OAuth/SDK yolu küçük entegrasyon denemesiyle seçilecek. İptal veya dönüş bağlantısının kesilmesi mevcut oyunu sıfırlamayacak. E-posta eşitliği tek başına hesap birleştirme kanıtı sayılmayacak; Apple'ın gizli e-posta seçeneği de hesaba katılacak. [Expo sosyal giriş](https://supabase.com/docs/guides/auth/quickstarts/with-expo-react-native-social-sign-in), [kimlik bağlama](https://supabase.com/docs/guides/auth/auth-identity-linking), [Facebook girişi](https://supabase.com/docs/guides/auth/social-sign-in/auth-facebook)

Oyuncu mevcut bir hesaba giriş yaparsa cihaz ve bulut kayıtları karşılaştırılacak. İkisi de ilerlemişse seviye, şehir ve son eşitleme bilgileriyle seçim sunulacak. Altın, elmas, XP ve eşyalar iki kayıttan toplanmayacak. Seçim öncesi iki kopya da korunacak; eski hesaptaki doğrulanmış işlem geçmişi diğer hesaba kopyalanmayacak.

### Veriler ve erişim

Başlangıçta profil, sürümlü kayıt, revizyon ve küçük ödül işlem tablosu yeterlidir. Her merge için ağ çağrısı yapılmayacak. Aynı oturumdaki kayıt yazmaları birleştirilir; uygulama arka plana geçerken bekleyen kayıt gönderilmeye çalışılır, başarısızlık yerel kaydı silmez.

Kayıtta genel XP, enerji ve enerji zamanı, cüzdan, şehir başına tahta/depo/üreticiler, koleksiyon, unvanlar ve ödenmiş ödül kimlikleri bulunur. Ayarların hangilerinin cihazda kalacağı ayrıca belirtilir; dil seçimi yerelde anında uygulanır.

Her oyuncu yalnız kendi kaydına erişebilir. RLS ve fonksiyon yetkileri migration dosyalarıyla tanımlanır. Service-role anahtarı ve sağlayıcı sırları uygulamaya veya Git'e konulmaz. Mobil oturum güvenli cihaz deposunda tutulur. [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)

İlk bulut aktarımı eski yerel kaydı yedekleyerek tek kez yapılacak. Bozuk kayıt veya daha yeni, tanınmayan şema sürümü sessizce sıfırlanmayacak. Birden fazla cihazdaki yazmalar sunucu revizyonuna karşı koşullu olacak; yalnız cihaz saatine veya “yüksek level kazanır” kuralına güvenilmeyecek.

### Güvenlik kapsamı

Bulut yedekleme tek başına hile koruması değildir. Mevcut oyun motoru cihazda çalışır. İlk bulut kayıt turu bunu tamamen sunucu tarafından yönetilen ekonomi olarak sunmayacak.

Reklam hakları ve doğrulanmış ödüller sunucuda ayrı tutulacak. İstemcinin genel kayıt yüklemesi, sunucudaki ödül geçmişini veya günlük sayacı değiştiremeyecek. Ödül önce sunucuda kalıcı işlem olur; istemci bu işlemi yerel kayda tek kez uygular. Kayıtta uygulanan ödül kimlikleri/revizyonu tutulur; eski yedekten dönüş aynı ödülü yeniden üretmez. Bu yol ayrı hata testleriyle doğrulanacak.

Gerçek para satışı başlamadan önce satın alma doğrulaması, iadeler ve harcanabilir bakiyelerin yetkili sunucu işlemleriyle yönetilmesi ayrıca tamamlanmalıdır. Onaylanan çevrimdışı oyunda merge, üretim ve normal ilan/altın/XP işlemleri yerelde devam eder. Reklam, satın alma ve bunların doğrulaması internet gerektirir. Çevrimdışı oyun kaydı ilk aşamada sunucu tarafından tamamen doğrulanmış ekonomi sayılmaz; canlı para satışı bu ayrım çözülmeden açılmayacaktır.

## Reklam akışı

Tek bir küçük reklam servisi; hazır mı, yükle, göster ve sonuç bilgilerini sağlar. Enerji düğmeleri doğrudan AdMob SDK çağırmaz. İlk ve tek gerçek adaptör AdMob olur; çok sağlayıcılı seçim motoru şimdiden yazılmaz.

Reklam kapandı olayı ödül anlamına gelmez. Test ortamında SDK'nın ödül sonucu kullanılır; canlı akışta imzalı SSV callback doğrulanır. Callback gecikirse oyuncuya yeniden reklam izletmek yerine bekleyen ödül durumu gösterilir. [Ödüllü reklam](https://developers.google.com/admob/ios/rewarded), [AdMob SSV](https://developers.google.com/admob/ios/ssv)

Ödül talebi sunucuda oyuncuya ve kısa ömürlü bir talep kimliğine bağlanır. Günlük hak ayırma, ödül ödeme ve işlem kimliğinin kaydı atomik olmalıdır. İki cihazdan eşzamanlı deneme veya yinelenen callback ikinci ödeme yaratmaz. Süresi geçen talepler için geç callback ve hak iadesi davranışı test edilir.

Günlük hak ödül alınca tüketilir; hatırlatmayı görmek veya kapatmak hakkı tüketmez. Uygulama başlangıcında günlük hak sunucu UTC gününe göre yenilenecek; kullanıcıya kalan hak ve yenilenme zamanı gösterilecek. Bu, cihaz saatini değiştirmekle hak kazanılmasını önlemek için seçilen uygulama ayarıdır. Hatırlatma sıklığı ile ödül limiti farklı sayaçlardır. Bu sayılar tek konfigürasyondan gelir; uzaktan panel ilk sürüm için zorunlu değildir.

Onaylanan başlangıç değerleri: +15 enerji, günde 4 ödül; 30 dakika hatırlatma aralığı ve oturum başına 2 hatırlatma. İlk öğretici, merge sürüklemesi, teslim ve kutlama sırasında teklif gösterilmez. Reklamdan dönüşte oyun sesi ayara uygun devam eder. Enerji bonusu mevcut kural gereği 100 üzerine çıkabilir.

## Hesaplar ve dış yapılandırma

| Gereken | Nerede kullanılır |
|---|---|
| Supabase test ve canlı projeleri | Auth, kayıt, RLS, Edge Functions |
| Apple giriş capability ve gerekli OAuth ayarları | Apple hesap bağlantısı ve inceleme |
| Google OAuth istemcileri | Google mobil giriş |
| Meta uygulaması, Facebook Login ve uygun yayın ayarları | Facebook giriş; yalnız uygulama rollerindeki testçilerle sınırlı kalmaması kontrol edilir |
| AdMob uygulama ve ödüllü reklam birimi | Test ve sonraki canlı reklam |
| Geliştirici sitesi ve ilgili reklam doğrulama ayarları | Canlı reklam uygunluğu ve app-ads.txt |
| Gizlilik metinleri, destek adresi ve hesap silme akışı | TR/EN kullanıcı akışı ve mağaza bilgileri |

Hesap oturumları kullanıcı tarafından açılır. Şifre, private key veya secret sohbetten istenmez. Ücretli plan satın alınması bu planın uygulanması için verilmiş otomatik harcama yetkisi değildir.

Reklam izinleri UMP ve kullanılan veri işleme kapsamına uygun yapılandırılır. ATT gerekiyorsa ayrı ele alınır; Facebook ile giriş yapmak reklam takibi izni anlamına gelmez. Hesap oluşturma eklendiğinde uygulamadan hesap silmeyi başlatma ve sağlayıcı bağlantılarını kaldırma akışı da kapsam içindedir. [AdMob gizlilik akışı](https://developers.google.com/admob/ios/privacy), [Apple hesap silme](https://developer.apple.com/help/app-review/guideline-reference/5-1-1-account-deletion)

## Test ve teslim koşulları

- Mevcut 53 motor testi ve yeni hesap/reklam durum testleri geçer. Test sayısı uygulama ilerledikçe değişebilir.
- Gerçek Release simülatöründe normal oyun, kayıt geçişi ve TR/EN ekranlar kontrol edilir. Sosyal giriş ve gerçek reklam SDK davranışı ayrıca fiziksel iPhone'da test edilir.
- Bağlama iptali, süresi biten oturum, bağlantı kopması, iki cihaz çakışması, eski kayıt ve aynı ödülün yeniden gelmesi test edilir.
- Supabase test ortamında başka kullanıcıya erişim ve yetkisiz ödül yazma denemeleri reddedilir.
- AdMob test kimlikleriyle çalışılır; test sırasında canlı reklama tıklanmaz. Test reklam akışı gerçek gelir elde edildiği şeklinde raporlanmaz.
- Facebook'un yalnız geliştirici rolündeki hesaplarda çalışması tamamlanmış global giriş kabul edilmez; dış kullanıcı erişimi doğrulanır.
- Test kredi düğmeleri ve fixture'lar canlı bulut kaydını veya reklam haklarını değiştiremez. Mevcut TestFlight test modu için ayrı backend ortamı kullanılır.
- Sonuçlar ve native ekranlar kaydedilir; ardından yeni TestFlight build'i hazırlanır. Apple'ın dış inceleme süresi uygulama testinin parçası gibi garanti edilmez.

## Daha sonraki işler

Gerçek para satışları, RevenueCat veya doğrudan StoreKit sunucu doğrulaması seçimi, ek reklam ağları, mediation, üretici/sandık reklamları ve ileri ekonomi hile koruması sonraki kapsamdır. İlk sürüme bunlar sessizce eklenmeyecektir.
