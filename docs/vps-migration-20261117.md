# VPS geçişi — 17 Kasım 2026

Bu belge devam eden uygulamanın kaydıdır; kalan kabul adımları tamamlandı olarak sunulmaz.

## Güncel düzen

- Çalışma alanı `/Users/erdi/masterland`; mobil Git deposu `masterland-mobile`, Expo kökü `masterland-mobile/mobile`.
- API `masterland-api`, origin `https://github.com/erditaskin/masterland-api.git` kullanıcı tarafından verildi.
- Web `masterland-web`; mevcut repo geçmişi ve `https://github.com/erditaskin/masterland-web.git` origin'i korundu.
- Mobil `erditaskin/masterland` origin'i ve ca16812 checkpoint'i korundu. Taşımada 370 takipli dosyanın SHA-256 hash'i değişmedi.
- VPS `142.93.88.194`, Ubuntu24.04.5; başlangıçta yalnız SSH vardı. Soruders ayrı `64.227.9.234` sunucusundadır ve yalnız referans olarak okundu.

## Kullanıcı kararları

Başka ajan çalışmıyor. E-posta servisi/doğrulaması bu aşamada yok; üç sosyal sağlayıcı kullanılır. DNS Cloudflare'da kullanıcı tarafından yönetilir; GoDaddy domain kayıt operatörüdür. API ve web aynı VPS üzerinde ayrı servistir. Kullanıcı Google/Facebook secret'ları, Apple key, yeni DB kimlikleri ve Masterland Slack webhook'unun bu VPS'e aktarımını açıkça onayladı. Ek talebiyle Masaüstüne 0600 izinli tarihli secret arşivi alındı; değerler raporlanmaz.

## Uygulanan altyapı

Node24.22.1/pnpm10.28.0, Fastify5, Zod ve PostgreSQL16. API read-only/non-root UID10001 Docker konteyneri, ayrı özel Docker ağı, internet portu olmayan PostgreSQL, sınırlı DML runtime rolü ve ayrı migration admin'i. API160MB/DB128MB sınırı; 458MB VPS için1GB swap. Nginx loopback4200 proxy, sorgusuz access log, güvenilir Cloudflare ağlarıyla real-IP, SSH/HTTP/HTTPS firewall. Secret dizini root0700/env0600; Apple key masterland0400.

API, web ve www Let's Encrypt sertifikaları 15 Şubat2027'ye kadar geçerli. Certbot yenileme dry-run iki sertifikada da geçti. API restart/readiness, dış HTTPS erişimi, yasal sayfalar ve Meta crawler user-agent HTTP200 kontrol edildi. DB yedeği ayrı geçici DB'ye restore edildi;10 public tablo doğrulandı, geçici DB kaldırıldı. Günlük server backup timer kuruldu; bağımsız offsite DB yedek hedefi henüz yoktur.

İlk API artefaktı `20261117-a86bcde37fda`; Docker Desktop/export ile sunucu import'u farklı config ID verdi. Tüm sıralı içerik katmanları, platform, creation time ve null default'ları normalize edilmiş runtime config birebir doğrulandı. İlk deployer kontrolü bu farkta durdu; kontrol atlanmadı. Sonraki final release ayrıca kaydedilecektir.

## Mobil ve API sözleşmesi

Supabase SDK mobil paketinden kaldırıldı; `EXPO_PUBLIC_API_URL` ve native SecureStore opaque session istemcisi eklendi. Yeni oturum anahtarı `masterland.api.auth.*`; eski Supabase token'ları yeni API'de kullanılmaz. Oyun kayıtları/namespace'leri sıfırlanmadı. Kalıcı outbox, CAS, açık kayıt seçimi, toplu upload, guest bağlama ve eski owner cevabı korumaları korunur.

Apple native server nonce/JWKS; Google browser OAuth+PKCE/state/nonce; Facebook server code/debug_token/me doğrulaması. E-posta benzerliği kimlik bağlamaz. Yeni provider guest'i yükseltir; mevcut başka hesapta iki kayıt korunur. Guest silme yolu eklendi, yakın provider doğrulaması ve kalıcı receipt kurtarması kayıtlı hesapta korunur. Apple client secret özel key'den kısa ömürlü üretilir.

Enerji+25/üretici80 kullanımlık yenileme ayrı target-bound intent'lerle, ortak4 günlük kota, orijinal query ECDSA, tek ödeme ve atomik CAS redeem kullanır. Farklı cihazlara aynı pending intent verilmez. Süreli aktif rezervasyon davranışının gerçek reklam kabulü ayrıca gerekir. Canlı SSV/hesap silme, mobil gerçek reklam ve canlı IAP kapıları kapalıdır.

## Sağlayıcılar

- Google yeni callback `https://api.masterland.app/v1/auth/google/callback` eklendi; OAuth client saved görüldü ve yeniden açılışta iki URI doğrulandı.
- Meta yeni callback `https://api.masterland.app/v1/auth/facebook/callback` eklendi; Changes saved görüldü. Meta hâlâ Unpublished ve business/person verification/yasal URL kabulü ayrı engeldir.
- Eski Supabase provider callback'leri yeni cihaz girişi doğrulanana kadar korunur.
- AdMob enerji ve üretici unit’lerinde yeni endpoint için Google imzalı konsol testleri geçti. Her iki kayıt yeniden açılıp URL doğrulandı. Ledger ve canlı payout kapalı kaldı.

## Kontroller ve kalanlar

21 API testi gerçek izole PostgreSQL ve ECDSA testleriyle geçti. 161 mobil testi, TypeScript ve ESLint geçti. İlk native derleme sandbox CoreSimulator erişiminde başarısız oldu; izinli çalışmada gerçek Release test build geçti. İlk altı native senaryoda üçü geçti, üçü başarısız: neden ve tekrar sonucu ayrıca kaydedilecektir. Bunlar tamamlanmış kabul olarak raporlanmaz.

Gerçek sağlayıcı girişleri, iki cihazda gerçek bulut seçimi, geç/iptal reklam, Apple revoke ve cihaz silme kabulü henüz tamamlanmadı. Final commit/push, final image kimliği, rollback alıştırması ve gerçek cihaz kabul sonuçları aşağıya eklenecektir.

## Release QA devam sonucu

Kontrollü TestFlight Release kanalında yerel kayıt/background, şehir/auth kabuğu ve test kredilerinin yokluğu kontrolleri geçti. Fixture isteyen üç testin bu kanalda başarısız olması, mevcut fixture korumasından kaynaklandı. Ayrı backend kapalı local Release QA turunda oynanış ve silme kurtarması geçti. Görsel test, daha önce kaldırılmış info düğmesinin frame’ini okumaya çalıştığından başarısız oldu; yalnız bu eski ölçüm hedefi listeden çıkarıldı. Tekrar ölçüm geçti:54 hücrenin tamamı56×56pt. Gerçek screenshot incelendi. Kanıtlar docs/verification/2026-11-17-vps içindedir.

Fiziksel iPhone için kontrollü imzalı Release build başarılıdır. Kurulum ve sağlayıcı kabulü ayrı kaydedilecektir. Mevcut web remote main’deki85273b4 atlas içeriği bulunup kayıpsız fast-forward alındı; /atlas da VPS’e taşındı. Atlasın mevcut inline scriptleri exact CSP hash’leriyle izinlidir; mevcut dinamik renk/opaklık style attribute davranışı korunur. Keyfi inline script açılmadı.

## Fiziksel kurulum ve sağlayıcı ayarları

Kontrollü Release iPhone13Pro’ya uygulama kaldırılmadan kuruldu. devicectl ilk launch’ı otomatik ekran kilidi nedeniyle reddetti; kullanıcı daha sonra uygulamayı kendisi açtığını bildirdi. Google girişi ve cihaz kaydı seçimi kabulü sürüyor. Bu aşama gerçek Apple/Facebook login veya revoke/silme kabulü değildir.

API kaynakları81f0b7a ile kullanıcı tarafından sağlanan GitHub main’e pushlandı. Web c1e1feb ile mevcut85273b4 atlas geçmişinin devamına pushlandı. API final imajı ve sürümlü aktivasyon devam ediyor. Web için sürümlü aktivasyon/rollback alıştırması başlatıldı.

Google/Meta eski Supabase redirect’leri yalnız geri dönüş için tutuldu; yeni API’de kullanıcı veya veri taşınmadı. Supabase klasörü aktif deployment hedefi olmaktan çıkarılmış tarihsel test referansı olarak etiketlendi.

## Web yayını ve geri dönüş

Web c1e1feb-20261117 release'i etkinleştirildi; önceki20261117-atlas release'ine rollback ve tekrar final release'e geçiş başarılıdır. /atlas tarayıcıda açılıp Ballıca seçimi ve dinamik içerik doğrulandı; konsol hatası yoktu. Statik iç linkler ve asset yolları doğrulandı. API kaynaklarındaki final güvenlik kontrolü, guest yükseltmesinde eski guest token’larını iptal eder; aynı kayda yeni doğrulanmış token ile erişilir. Bu koruma gerçek PostgreSQL testine dahil edildi.

## Final API aktivasyonu ve ilk fiziksel giriş

API81f0b7a119e692c0fe4cc248ed84f798c567e4dd etkinleştirildi. İlk release’e rollback ve aynı final commit’e tekrar aktivasyon, release kimliği eşleşen readiness kontrolüyle geçti. İmaj doğrulamasında docker-save ham config’i kullanıldı; Docker Desktop inspect’in eklediği boş/false varsayılanlar kaynak config ile karıştırılmadı. Tüm içerik katmanları ve gerçek runtime config’i eşleşti.

Kullanıcı telefonda Google ile giriş, çıkış ve tekrar girişin başarılı olduğunu bildirdi. Apple/Facebook ve iki cihaz çakışması kabulü ayrı ilerliyor. Silme receipt sorgusunun bozuk/eski auth oturumuna bağımlı olmaması için anonim capability transport’u ayrıldı; bu son ek regresyon testiyle doğrulanacaktır.

## Son kontrollü doğrulama

Bozuk auth verisine rağmen silme receipt’inin anonim sorgulanması ve eski auth kaydının temizlenmesi testiyle mobil toplam162/162 oldu; TypeScript ve ESLint geçti. Bu kaynakla kontrollü Release’te3 native kontrol tekrar geçti. Kullanıcı Apple girişinin oyuna başarıyla döndüğünü bildirdi; sunucuda Google1 ve Apple1 provider kaydı aggregate olarak görüldü. Ham log aktarımı otomatik denetimde reddedildi; yalnız kişisel veri içermeyen toplamlarla devam edildi.

İlk telefon build’inde Facebook tester bayrağı false kaldığı için düğme pasifti. ios:acceptance komutuna EXPO_PUBLIC_FACEBOOK_LOGIN_ENABLED=true açıkça eklendi ve kontrollü telefon build’i tekrar hazırlanıyor. Bu, Meta uygulamasını yayınlama veya genel production Facebook bayrağını açma değildir.

## Facebook kontrollü derleme düzeltmesi

Facebook tester bayrağı açık, son162-testlik kaynakları içeren imzalı Release build başarılı oldu ve aynı iPhone’a uygulama kaldırılmadan kuruldu. Kullanıcıya Facebook girişi tekrar denemesi iletildi. Bu sırada API ve web final release’lerinde çalışır; iki servisin rollback ve son release’e geri dönüş testleri başarılıdır. Gerçek bulut kayıt seçimi/ilk upload henüz kabul edilmedi; aggregate kontrolde game_saves0 görüldüğü için giriş başarısı yedekleme başarısı olarak sunulmadı.


## Facebook dönüş hatasının incelemesi

Facebook düğmesi açıldıktan sonra kullanıcı, sağlayıcıdan oyuna dönünce bağlantı hatası bildirdi. Aggregate sorguda iki Facebook attempt’inin verified_identity ve code_hash aşamalarına ulaştığı, fakat Facebook user identity kaydı oluşmadığı görüldü; sağlayıcı kimlik doğrulaması başarılı, native code exchange tamamlanmamıştı. Olası neden Facebook fragment’inin HTTP redirect sırasında miras kalmasıdır. RFC9110 bölüm10.2.2/17.11 uyarınca backend native Location’ına açık boş fragment eklenerek miras önlenir; mobilin state/PKCE/URL kontrolleri gevşetilmez. Regression test ve yeni API release hazırlığı sürüyor; fiziksel tekrar sonucu bekleniyor.


## Son kabul durumu — 17 Kasım 2026

Bu bölüm yukarıdaki ara durumların güncel sonucudur. Facebook dönüşüne açık boş fragment ekleyen ccab06d düzeltmesi dağıtıldı. Kullanıcı aynı iPhone üzerinde Facebook girişinin başarılı olduğunu doğruladı. Google giriş/çıkış/tekrar giriş ve Apple girişi de kullanıcı tarafından doğrulanmıştır. Aggregate sorguda her sağlayıcı için bir identity görüldü; kişisel veri veya ham log aktarılmadı.

Kullanıcı telefon kaydını buluta kaydetti ve “ilerlemen kaydedildi” mesajını bildirdi. Sunucuda bir game_saves kaydı, revizyon 1 doğrulandı. İki cihaz arasında geri yükleme/çakışma kabulü kullanıcı tarafından açıkça sonraya bırakıldı; başarılı sayılmaz. Eski Supabase OAuth callback’leri geri dönüş imkânı için hâlâ tutulmaktadır; proje veya verileri silinmedi.

Güncel API release kimliği cf6d5533e83f8092a05d83b8e561bc0fcffac144’tür. Uygulama imajı ccab06d kaynaklarını içerir; sonraki commit yalnız compose log sınırlarını ekler. Çalışan API ve DB konteynerlerinde json-file logları 10 MB × 3 ile sınırlandı; DB kalıcı volume korunarak yeniden başlatıldı. Web c1e1feb-20261117 release’indedir.

Sonuç: 162 mobil ve 21 API testi geçti. Son OAuth parser ek kontrolleriyle hedefli 9 test de geçti. Release simülatör kontrolleri ve 54 eşit kare hücre ölçümü yukarıdaki kanıtlarla doğrulandı. Fiziksel üç sağlayıcı ve ilk bulut upload kabul edildi. Canlı reklam ödülü, gerçek para satın alma ve hesap silme kapıları kapalıdır. Gerçek reklam/geç callback, Apple revoke/silme ve iki cihaz kabulü tamamlanmadı. Meta genel yayını/doğrulaması, AdMob mağaza incelemesi ve sunucu dışı DB yedekleme ayrıca beklemektedir. Sunucu içi günlük yedek/restore testi afet kurtarma yerine geçmez.


## Güncel canlı reklam kabulü — 17 Kasım 2026

Kullanıcının sonraki açık talebiyle SSV sunucu kapısı açıldı; önceki “canlı SSV kapalı” kayıtları bu andan önceki durumu anlatır. Eski env dosyası sunucuda korumalı olarak yedeklendi. Cihaz/Google imzalı callback/kalıcı bakiye kabulü sürmektedir; kapının açık olması kabulün geçtiği anlamına gelmez. Hesap silme ve gerçek satın alma kapıları kapalı kalır. İptal rezervasyonu düzeltmesi ve fiziksel sonuçlar tamamlandıkça ayrı rapora eklenecektir.


## Canlı reklam sonucu — 17 Kasım 2026

Reklam kabulü tamamlandı. Güncel API 76f23907b6a53ee6b5d4d954fd045b85494df8cc; SSV kapısı açık, silme ve gerçek satın alma kapıları kapalıdır. Kullanıcı fiziksel +25 ve arka plan kurtarmasını doğruladı. Gerçek Google callback’leri enerji ve üretici ledger/redeem hattında işlendi; Release kalıcılık, ortak kota ve temiz simülatörde terk etmede sıfır ödeme geçti. Ayrıntılı kanıt/sınırlar live-reward-acceptance-20261117.md içindedir. Sıradaki iş hesap silme kabulüdür.
