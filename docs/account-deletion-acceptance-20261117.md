# Hesap silme kabulü — 17 Kasım 2026

## Misafir kabulü

Reklam işi tamamlandıktan sonra sıralamadaki hesap silme aşamasına geçildi. Yeni Masterland-Reward-Cancel-QA simülatöründeki boş misafir hedefi canlı DB’de sabitlendi: 100 enerji, sıfır sağlayıcı, sıfır reklam ödülü, tek iptal intent’i. Kullanıcı yalnız bu test hesabının kalıcı silinmesini açıkça onayladı.

DB yedeği alındı; önceki env 0600 dosyada korunarak `ACCOUNT_DELETION_ENABLED=true` yapıldı. Etkin API release’i 76f23907b6a53ee6b5d4d954fd045b85494df8cc olarak kaldı; API runtime değişmedi. Telefonun o andaki build’inde silme kapısı kapalıydı; ilk silme yalnız test simülatöründeydi.

Gerçek Release UI testi önce tek üretim hamlesiyle test ilerlemesini 99 enerjiye getirdi, misafir onayını açtı ve açık operatör onayına bağlı testi çalıştırdı. API silme tamamlandı; yerel kayıt yeni oyun olarak sıfırlandı. Yeniden açılışta enerji 100, eski auth ve bekleyen silme ekranı yoktu. Test 22.928 saniyede geçti. `MASTERLAND_APPROVED_GUEST_DELETION=true` test runner ortamı olmadan bu yıkıcı test varsayılan olarak atlanır. Tek kullanımlık onaylı xctestrun dosyası testten sonra kaldırıldı.

Canlı DB kontrolü: users, identities, sessions, game_saves, game_save_receipts, game_save_history, ad_intents ve ad_rewards için hedefin kayıt adetleri sıfır; capability receipt durumu completed. Kanıt paketi `/private/tmp/masterland-approved-guest-deletion-20261117.xcresult`; ekranlar `verification/2026-11-17-deletion/` içindedir.

## Apple kabulünün güvenli hazırlığı

Apple ile açılmış Masterland hesabı ayrı olarak denetlendi: tek sağlayıcı, bulut kaydı yok, ödül yok. Kullanıcı mevcut hesaptan çıkıp Apple ile giriş yaptığını doğruladı. Fiziksel telefon için silme onay arayüzü açık kontrollü Release hazırlandı ve uygulama kaldırılmadan kuruldu.

Apple testi yerel kayıtları da sıfırlayacağından önce normal ve kontrollü Save JSON dosyaları, kodda doğrulanmış iki sabit AsyncStorage anahtarının MD5 dosyalarından dar kapsamla kopyalandı. İki kayıt da validateSave ile doğrulandı; kimlik doğrulama alanı içermediği denetlendi. Kontrollü kayıt Facebook bulutunun 17. revizyonuyla kanonik SHA-256 karşılaştırmasında birebir eşleşti.

Tüm AsyncStorage klasörünün geniş kopyası otomatik onay denetiminde özel hesap/oturum verisi riski nedeniyle reddedildi. Bu geniş kopya yapılmadı. Dar kapsamlı iki Save dosyası başarılı oldu. Kullanıcı ardından yalnız manifest.json dosyasının özel uygulama ayarları içerebileceğini bilerek korumalı yerel klasöre yedeklenmesini ayrıca onayladı. Keychain ve oturum dosyaları kopyalanmadı.

Yedekler `/Users/erdi/masterland/.private-backups/phone-before-apple-20261117` altındadır; klasörler 0700, dosyalar 0600. Geri yükleme hazırlığı, Save hash’lerini doğrulayıp yalnız iki oyun anahtarını yeni manifest’e ekler; diğer mevcut manifest girişlerini değiştirmez. Geniş eski manifest veya eski auth verisi geri yüklenmez. Geri yükleme planı kuru çalışmada doğrulandı.

Kullanıcı bu boş Masterland Apple hesabının kalıcı silinmesini ve Masterland Apple yetkisinin iptalini ayrıca açıkça onayladı. Fiziksel sonuç ve oyun kayıtlarının geri yüklenmesi henüz beklenmektedir; tamamlandı sayılmaz.

## İlk fiziksel Apple denemesi: başarısız

Kullanıcının gönderdiği ekranda bekleyen silme kaydı ve yeniden Apple doğrulaması istenmektedir. Sunucuda hedef hesap hâlâ vardır, receipt failed durumundadır ve apple_revoked_at boş kalmıştır. Nginx kaydından yalnız endpoint durum kodlarının toplamı okunmuştur: misafir için bir 200, Apple denemesi için bir 503. Ham log, kullanıcı kimliği veya token aktarılmamıştır. Yerel ilerleme de ekranda korunmaktadır; silme kabulü tamamlanmamıştır.

Sunucuda özel anahtarın okunup imzalanabildiği, gerçek kullanıcıya ait olmayan sentetik geçersiz kodla ayrıca kontrol edilmiştir. Apple invalid_client yerine invalid_grant döndürmüştür. Bu kontrol gerçek kullanıcı kodunun neden başarısız olduğunu veya revoke işleminin tamamlandığını kanıtlamaz. Taze Apple doğrulamasından hemen sonra bir kontrollü tekrar istenmiştir; sonuç beklenmektedir.

## Apple yeniden doğrulamasında ağ bildirimi

Kullanıcı kontrollü tekrarda uzun beklemeden sonra Wi-Fi bağlantı hatası bildirdi. Bağımsız erişim kontrolünde Masterland `/health` 200 döndü (yaklaşık 0,52 saniye). Aynı Mac bağlantısından Apple JWKS endpoint'i 15 saniyede zaman aşımına uğradı; VPS'ten aynı herkese açık endpoint 200 döndü (yaklaşık 0,08 saniye). Bu bulgu yerel ağ yolunda Apple erişim sorunu olabileceğini gösterir; iPhone'daki hatanın kesin nedenini veya önceki 503'ün nedenini tek başına kanıtlamaz. Kullanıcıdan hücresel veriyle tek tekrar ve hata penceresinin kaynağı istendi. Başarılı silme veya yetki iptali henüz doğrulanmadı.

## İki ağda hata ve Apple servis kesintisi

Kullanıcı aynı Face ID sonrası başarısızlığın Wi-Fi kapalı ve hücresel veri açıkken de oluştuğunu doğruladı. Sunucunun yalnız endpoint/status adetlerine göre Apple challenge istekleri ulaşmaktadır; Apple kimlik token'ını API'ye teslim eden `/v1/auth/apple` için yeni başarısız HTTP kaydı yoktur. Son tekrarın Apple native yetkilendirme aşamasında tamamlanmadığı değerlendirilmiştir. Bu, önceki silme endpoint'i 503 hatasının kesin nedeni değildir.

Apple'ın resmî `https://www.apple.com/support/systemstatus/data/system_status_en_US.js` verisi 17 Kasım kontrolünde `iCloud Account & Sign In` için ongoing Issue bildirmiştir: başlangıç `11/17/2026 08:45 PST` (Türkiye 19.45), hizmetin yavaş veya erişilemez olabileceği ve tüm kullanıcıların etkilendiği belirtilmiştir. `Sign in with Apple` satırında ayrıca olay yoktur; iCloud kesintisinin Masterland hatasının kesin kök nedeni olduğu iddia edilmez. Kullanıcıdan yeni tekrar istenmemiştir. Apple revoke/fiziksel silme kabulü ve ardından dar kapsamlı oyun geri yüklemesi beklemektedir. Bekleyen journal nedeniyle çıkış engeli korunmuştur; hesap veya ilerleme silindi olarak işaretlenmemiştir.

## Apple sözleşme testlerinin sonucu

Üç bağımsız Node testi geçti; Docker veya gerçek Apple kimliği kullanılmadı. Testler gerçek ES256 client-secret imzasını ve en çok beş dakikalık ömrünü, RS256/JWKS ile Apple subject eşleşmesini, farklı subject için revoke yapılmamasını ve sağlayıcı hatasının başarı sayılmamasını kapsar. Anahtarlar sentetik olup yalnız geçici 0700 dizinde tutulur ve test sonunda kaldırılır. TypeScript, ESLint ve format kontrolleri geçti.

Kaynaklar: [Apple token revocation](https://developer.apple.com/documentation/signinwithapplerestapi/revoke-tokens), [Apple hesap silme ve token iptali](https://developer.apple.com/documentation/technotes/tn3194-handling-account-deletions-and-revoking-tokens-for-sign-in-with-apple).
