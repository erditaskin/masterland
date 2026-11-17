# Masterland hesap kurulum durumu

16 Kasım 2026. Bu rapor dashboard yapılandırmasını kaydeder; gerçek cihazda giriş veya bulut eşitleme kabulü değildir.

## Supabase — kısmi

- Ortam: Kullanıcının açık kararıyla canlı. Ayrı test projesi oluşturulmadı.
- Dashboard: https://supabase.com/dashboard/project/qydeobqdselujkprmxpb
- Proje adı: masterland. Project ref: `qydeobqdselujkprmxpb`.
- Sahiplik: Kullanıcı Owner. Organizasyon ücretsiz planda.
- Bölge: `ap-south-1` (Mumbai).
- Dashboard provider ekranında doğrulanan callback: `https://qydeobqdselujkprmxpb.supabase.co/auth/v1/callback`.
- Publishable key alındı; yalnız public mobil ayarlara yazıldı. Veritabanı şeması, RLS ve Edge Functions bu ajan tarafından değiştirilmedi.
- GitHub: `erditaskin/masterland` bağlandı. Working directory `.`. Deploy to production kapalı; main merge işlemi otomatik canlı dağıtım yapmayacak. Kullanıcı elle tetikleme istedi; bu dağıtım akışı henüz kurulmadı.
- Anonim giriş ve manual linking son kontrolde kapalıydı; kod ajanıyla sözleşme eşleştirilmeli.

## Apple — kısmi

- Mevcut Bundle ID: `com.erditaskin.masterland`. Team ID: `F3F723W4SF`.
- Apple Developer üzerinde Sign in with Apple primary App ID olarak etkinleştirildi; kayıt tamamlanıp identifier listesine dönüldü.
- Dashboard: https://developer.apple.com/account/resources/identifiers/bundleId/edit/3QD4L9TMDB
- Supabase Apple sağlayıcısı etkin. Client IDs: `com.erditaskin.masterland`; yenileme sonrası kalıcı değer doğrulandı.
- Native giriş hedeflenir. Web OAuth için Service ID, key ve client secret oluşturulmadı. Web OAuth tamamlanmış değildir.
- Apple capability değişikliği gelecekteki provisioning profillerinin yeniden oluşturulmasını gerektirir. Mevcut TestFlight kaydı veya build değiştirilmedi.
- Kod ajanı: Native Apple token akışını, nonce ve hesap bağlamayı gerçek cihazda doğrulamalı.

## Google — kısmi

- Hesap sahipliği: Kullanıcının kişisel Google hesabı.
- Proje: `Masterland`, ID `masterland-514913`.
- Dashboard: https://console.cloud.google.com/auth/clients?project=masterland-514913
- OAuth uygulama kaydı oluşturuldu. Destek ve iletişim adresi kullanıcı onayıyla `erditaskin@gmail.com`.
- Audience External; yayın durumu Testing. Yalnız test kullanıcıları erişebilir. Test kullanıcı listesi henüz düzenlenmedi.
- iOS istemcisi: `Masterland iOS`.
- iOS client ID: `19731403987-f85og2dfmuqooecoeodaq9qp455pl5lk.apps.googleusercontent.com`.
- Bundle ID: `com.erditaskin.masterland`; Team ID: `F3F723W4SF`. App Store ID alanı, uygulama mağazada yayımlanmadığından boş bırakıldı.
- Web istemcisi: `Masterland Supabase`.
- Web client ID: `19731403987-3n78hvi6k46dmj0afhefe8gpe35o3hkt.apps.googleusercontent.com`.
- Authorized redirect URI: `https://qydeobqdselujkprmxpb.supabase.co/auth/v1/callback`.
- Web secret yalnız Supabase Google sağlayıcısının güvenli alanına aktarıldı. Yerel dosyaya, sohbete veya Git içine kaydedilmedi.
- Supabase Google sağlayıcısı etkin; web ID önce, iOS ID sonra girildi. Başarı bildirimi ve Enabled durumu görüldü.
- Skip nonce checks ve Allow users without an email kapalı bırakıldı.
- Kod ajanı: Gerçek istemciden reversed client ID sözleşmesini doğrulamalı; native giriş ve Supabase token doğrulamasını cihazda test etmeli. Global yayın öncesi Testing kısıtı kaldırılmalı ve gerekli marka/gizlilik adımları tamamlanmalı.

## Facebook — kısmi

- Masterland uygulaması oluşturuldu. App ID: `999025329335282`.
- Dashboard: https://developers.facebook.com/apps/999025329335282/dashboard/
- İletişim adresi kullanıcı tarafından `erditaskin@gmail.com` olarak seçildi.
- Yalnız Facebook Login use case seçildi; otomatik public_profile dışında ek izin eklenmedi. Email izni henüz eklenmedi.
- Valid OAuth Redirect URIs alanına gerçek Supabase callback adresi kaydedildi ve kayıt sonrası formda doğrulandı: `https://qydeobqdselujkprmxpb.supabase.co/auth/v1/callback`.
- Supabase Facebook sağlayıcısı App ID ve App Secret ile etkinleştirildi; Enabled durumu görüldü. Secret yalnız güvenli sağlayıcı alanına aktarıldı; dosyaya, rapora veya sohbete yazılmadı.
- HTTPS ve strict URI kontrolleri açık bırakıldı.
- Uygulama Unpublished durumundadır. İşletme doğrulaması ve App Review yayın gereksinimleri olarak gösterildi.
- Eksikler: Gizlilik politikası URL'si, kullanıcı verisi silme URL'si, kategori, gerçek giriş testi ve gerekiyorsa email izni.
- Kod ajanı: Facebook OAuth dönüşünü, hesap bağlamayı ve e-posta dönmemesi durumunu doğrulamalı. Global kullanıcı erişimi hazır değildir.

## Logo ve markalama

- Kaynak uygulama ikonu `mobile/assets/icon.png`; `mobile/app.json` bu dosyayı kullanıyor. Kaynak 1254×1254 piksel, kaynak dosya değiştirilmedi.
- Meta: 1024×1024 sürümü yüklendi, Save Changes uygulandı, sayfa yenilenince ikon ve dosya adı korundu. Eksik ikon uyarısı kalktı.
- Google OAuth Branding: 120×120 sürümü yüklendi; Current App logo ve Branding changes saved durumu görüldü. Yayın sırasında marka doğrulaması gerekebilir.
- GitHub: Repository Settings / Social preview alanına 1280×640 görsel yüklendi. İkonun tamamı ortada, yanlarda koyu mavi dolgu vardır; önizleme doğrulandı. Kişisel profil avatarı değiştirilmedi.
- Supabase organizasyon General ve proje General ayarlarında uygulama logosu yükleme alanı bulunmadı.

## Supabase özel adres araştırması

- Mevcut ücretsiz planda özel adres açılmadı; ödeme veya plan değişikliği yapılmadı.
- Resmî doküman: https://supabase.com/docs/guides/platform/custom-domains
- `masterland.supabase.co` gibi vanity subdomain ücretli planda ve isim müsaitse mümkün. `masterland.supabase.com` dokümandaki vanity biçimi değildir.
- Pro başlangıcı ayda 25 USD: https://supabase.com/pricing . Dashboard ücretli planlarda vanity subdomain'in ücretsiz olduğunu gösteriyor. Kendi alan adına custom domain eklemek ayrıca ayda 10 USD.
- Vanity subdomain CLI üzerinden ayarlanır. Müsaitlik henüz kontrol edilmedi.
- Alan adı değişirse OAuth callback'leri ve uygulama ortam sözleşmesi birlikte güncellenmelidir. Mevcut callback'ler değiştirilmedi.

## AdMob — kısmi

- Hesap oluşturuldu; kullanıcı sözleşmeyi ve Türkiye ödeme ülkesini açıkça onayladı.
- Dashboard: https://admob.google.com/v2/apps/5586706771/adunits/list
- Uygulama: Masterland, iOS. Henüz mağazada yayımlanmamış uygulama olarak eklendi; TestFlight, halka açık mağaza listesi sayılmadı.
- App ID: `ca-app-pub-2972187520207492~5586706771`.
- Tek rewarded unit: Masterland iOS Rewarded Energy.
- Rewarded unit ID: `ca-app-pub-2972187520207492/2927598891`.
- Ödül: 15 `energy`. Oluşturma başarı ekranı görüldü.
- Güncel durum: ödeme profili kullanıcı tarafından oluşturuldu; dashboard eksik ödeme uyarısı son kontrolde hâlâ görünüyordu. Hesap/uygulama incelemesi, halka açık mağaza bağlantısı ve native entegrasyon bekliyor.
- SSV endpoint hazır olmadığından girilmedi. Günlük 4 hak ve hatırlatma sınırlarını kod ajanı sunucuda uygulamalıdır.
- Kampanya, harcama, mediation veya ek reklam biçimi açılmadı. Geliştirmede test reklam kimlikleri kullanılmalıdır.
- Türkiye seçimi kimlik ve ödeme ülkesidir; global kullanıcıya reklam gösterimini Türkiye ile sınırlamaz. Bölgesel kısıtlar ve kullanıcı rızası gereklilikleri ayrıca geçerlidir.

## Yerel ayar ve yedek

- Kullanıcının açık isteğiyle `mobile/.env` oluşturuldu; yalnız public mobil ayarlar içerir. Git ignore kuralı `.env*` ile kapsanır.
- Supabase publishable key dashboard'dan alındı ve yerel public ayarlara yazıldı. Ayrıcalıklı anahtar dışa aktarılmadı.
- Masaüstü yedeği: `/Users/erdi/Desktop/masterlands keyler`. Platform başına TXT ve mobile.env.txt kaydedildi; klasör 0700, dosyalar 0600.
- Provider secret'ları bu yedeğe veya mobile/.env dosyasına yazılmadı; Supabase güvenli provider alanlarında kalır.
- Backend ve Facebook çalışma bayrakları doğrulama tamamlanana kadar kapalı bırakıldı. AdMob env isimleri henüz uygulama koduyla eşleştirilmemiştir.
- Kullanıcı Supabase'in ücretsiz planda ve mevcut adreste kalmasını açıkça seçti.

## Kod ajanına kısa aktarım

Canlı Supabase ref yukarıdadır. GitHub bağlı, otomatik production deploy kapalıdır; elle tetiklenen dağıtım henüz kurulmadı. Apple native ve Google provider dashboard ayarları açıldı, ancak cihaz kabulü yapılmadı. Google Testing kısıtı sürüyor. Veritabanı şeması/RLS/function dağıtımı yapılmadı. Facebook provider kısmi olarak yapılandırıldı; yayın ve cihaz testi bekliyor. AdMob bekliyor. Mobil callback ve EXPO_PUBLIC değişken sözleşmesi kesinleştirilmelidir. Hiçbir secret bu raporda bulunmaz.

## Secret yedeği — kullanıcı onayıyla

Kullanıcı Google ve Facebook provider secret değerlerinin geçici dosya üzerinden Masaüstüne aktarılmasını açıkça onayladı. Değerler `/Users/erdi/Desktop/masterlands keyler/provider-secrets.env` ve `provider-secrets.txt` dosyalarına 0600 izinleriyle kaydedildi. İçerik bütünlüğü değerler yazdırılmadan doğrulandı ve geçici dosya silindi. Mobil `.env` dosyasında provider secret bulunmaz. Önceki yalnız Supabase içinde saklama ifadeleri bu açık kullanıcı kararıyla yerel yedek bakımından güncellenmiştir.


## 16 Kasım 2026 — Web, DNS, e-posta ve AdMob güncellemesi

- Kullanıcı siteyi herkese açık yayımlamayı açıkça onayladı. Netlify projesi etkin, GitHub `erditaskin/masterland-web` bağlıdır. Site reposu uygulama reposundan ayrıdır.
- Site: https://masterland.app/ ; gizlilik: https://masterland.app/privacy/ ; destek: https://masterland.app/support/ ; veri silme talimatı: https://masterland.app/delete-account/ . TR/EN dil seçimi vardır. Sayfalardan kişisel ad ve Gmail kaldırılmıştır; TR destek@ yerine gerçek ASCII adres `destek@masterland.app`, EN `support@masterland.app` kullanılır.
- Gizlilik metni geliştirme durumunu açıklar. Kesin saklama süreleri, etkin SDK veri kapsamı ve çocuklara yönelik dağıtım değerlendirmesi yayın öncesi tamamlanmalıdır. URL'nin hazır olması hukuki ve mağaza kabulünün tamamlandığı anlamına gelmez.
- Registrar GoDaddy, DNS Cloudflare Free, hosting Netlify mevcut ücretsiz plan. Nameserver: `lorna.ns.cloudflare.com`, `rocky.ns.cloudflare.com`.
- Apex A: `75.2.60.5`, DNS only. WWW CNAME: `sweet-chimera-eca143.netlify.app`, DNS only. Eski GoDaddy park A kayıtları kaldırıldı.
- Netlify her iki alan için Let's Encrypt HTTPS etkin durumunu gösterdi. Origin üzerinden sertifika doğrulamalı HTTPS 200 alındı. Kullanıcı cihazı/normal sistem çözümleyicisi eski GoDaddy IP'lerini önbellekte tuttuğundan erişim hatası görüldü; DNS araçları güncel kaydı döndürüyordu. Genel erişim sorunu her cihazda çözülmüş kabul edilmemelidir.
- Cloudflare Email Routing: `support@masterland.app` ve `destek@masterland.app` → `erditaskin@gmail.com`. Her iki kural Active, hedef Verified. MX/SPF/DKIM eklendi. Gerçek teslim testi yapılmadı; bu yapı gelen posta yönlendirmesidir, SMTP gönderim hizmeti değildir.
- Google/Meta dashboard destek adresleri otomatik değiştirilmedi. Yeni gizlilik ve silme URL'leri Meta/Google marka alanlarına henüz aktarılmadı.
- AdMob UMP mesajı `Masterland AB Rıza · TR / EN` yayımlandı; varsayılan İngilizce, ek Türkçe. İzin vermeme seçeneği açık, kapatma ile rıza kapalı. Gizlilik URL'si Masterland uygulamasına kaydedildi. Native UMP SDK entegrasyonu yapılmadan mesaj uygulamada görünmez.
- Resmî AdMob snippet'i `https://masterland.app/app-ads.txt` adresinde yayımlandı: `google.com, pub-2972187520207492, DIRECT, f08c47fec0942fa0`. Origin HTTPS üzerinden içerik doğrulandı. Web repo commit `7d5d6a1`. AdMob henüz taranmış uygulama/reklam isteği göstermiyor; mağaza geliştirici URL'si ve tarama bekleniyor.
- Mevcut ödüllü reklam birimi dashboard'da doğrulandı. Başka reklam formatı oluşturulmadı. Kullanıcı son yanıtında yalnız mevcut ödüllü enerji reklamını seçti. Ek reklam formatı oluşturulmayacak.

## React Native geliştiricisine uygulama sırası

1. Mevcut `account-integration-contract.md`, `account-foundation-progress-20261116.md` ve hesap/reklam planını okuyup repo değişikliklerini koruyun. Bu rapor dashboard kurulumu kanıtıdır; canlı cihaz kabulü değildir.
2. `mobile/.env` içindeki public değişken isimlerini kod sözleşmesiyle eşleştirin. Backend/Facebook bayrakları doğrulama öncesi kapalıdır. TestFlight/test modu canlı Supabase'e bağlanmamalıdır; yalnız canlı Supabase oluşturulduğu için güvenlik kontrolünü kaldırmayın.
3. Apple native token/nonce; Google iOS/web client ve reversed URL scheme; Facebook PKCE dönüşü ve email dönmemesi; hesap bağlama/iptal/hesap değiştirme/silme senaryolarını fiziksel cihazda doğrulayın. Google Testing ve Meta Unpublished kısıtları devam ediyor.
4. SQL migration/RLS/Edge Functions canlıya bu kurulum ajanı tarafından dağıtılmadı. Mevcut yerel kaydı ve pre-cloud yedeğini koruyun; çakışma seçimi, kalıcı kuyruk ve offline yeniden bağlanma doğrulanmadan otomatik bulut yazımını açmayın. Main merge otomatik production deploy yapmamalıdır; elle tetiklenen güvenli akış gereklidir.
5. React Native/Expo uyumlu reklam SDK'sı ve config plugin ile UMP akışını kurun. Her açılışta güncel izin bilgisini isteyin; reklam isteğini yalnız SDK izin verdiğinde başlatın. Gizlilik tercihlerini yeniden açma yolu ekleyin. Facebook login'i ATT izni saymayın. Üretilen mobile/ios dosyalarını elle kalıcı kaynak olarak düzenlemeyin.
6. Tek enerji rewarded servisini bağlayın: +15 enerji, günde 4; 30 dakika aralıkla, oturumda en fazla 2 kapatılabilir hatırlatma. Otomatik reklam açılmaz. Hata/iptal ödül veya hak tüketmez. Reklam kapandı olayı ödül değildir.
7. Canlı ödülü imzalı AdMob SSV doğrulaması, işlem kimliğiyle idempotency, sunucu günlük kota ve ledger ile yönetin. Endpoint henüz yok; gerçek endpoint oluşturulunca AdMob'a bağlanmalı. Callback gecikmesini bekleyen ödül olarak ele alın; istemci bakiyesine güvenmeyin.
8. Geliştirme/TestFlight sırasında test reklam kimlikleri veya test cihazı kullanın, canlı reklama tıklamayın. Mevcut kayıt koruma, TR/EN, offline, kota/çift callback, iptal ve gerçek iPhone kabulü sonrası canlı etkinleştirme yapın. Yeni para satışları kapsamda değildir.

Secret değerlerini bu rapora, mesaja, Git'e veya EXPO_PUBLIC değişkenlerine eklemeyin. Kullanıcının onayladığı yerel secret yedeği Masaüstündeki `masterlands keyler` klasöründedir; public mobil ayarlar mobile/.env içindedir. Önceki secret yalnız Supabase'de kalır ifadelerinin yerel yedek açısından son kullanıcı kararıyla geçersiz olduğu üstte kayıtlıdır.


## Apple hesap silme sunucu anahtarı — 16 Kasım 2026

Kullanıcının açık onayıyla Apple Developer üzerinde yalnız Sign in with Apple yetkili `Masterland Apple Account Deletion` anahtarı oluşturuldu. Primary App ID: `com.erditaskin.masterland`, Team: `F3F723W4SF`, Key ID: `CBA978X353`. Native Bundle ID akışı için web Service ID eklenmedi.

Private key kullanıcı isteğiyle `/Users/erdi/Desktop/masterlands keyler/AuthKey_CBA978X353.p8` konumuna 0600 izinleriyle yedeklendi. Downloads kopyasına da 0600 uygulandı. Anahtarın kendisi rapora, Git'e veya mobil yapılandırmaya yazılmadı.

ES256 sunucu JWT'si üretildi; issuer Team ID, subject native Bundle ID, audience https://appleid.apple.com. Süre 90 gün. Supabase qydeobqdselujkprmxpb Edge Function Secrets alanına `APPLE_CLIENT_SECRET` adıyla kaydedildi; custom secrets tablosunda kayıt doğrulandı. JWT/private key değeri sohbete yazdırılmadı.

JWT son kullanım: 14 Şubat 2027 17:07:40 UTC (Türkiye 20:07:40). En geç 7 Şubat 2027'de aynı private key ile yeni JWT üretilip secret değiştirilmelidir; otomatik rotasyon kurulmadı. Apple key süresiz olsa da JWT süreli olduğundan bu operasyon gereklidir.

Kullanıcı TestFlight için test modu kapalı kontrollü build'i kabul etti; reklamlar test kalacak. Test modu açık build'in canlı backend'e bağlanmasını engelleyen koruma kaldırılmayacak. TestFlight reklam seçimi bu bayraktan bağımsız test kimliğini zorunlu tutmalıdır.

Kod/migration/function dağıtımı yapılmadı; ACCOUNT_DELETION_ENABLED ve mobil/backend bayrakları açılmadı. Gerçek Apple code exchange/revoke, Auth hard-delete, aynı e-posta ile yeni UUID ve cihazdaki yerel sıfırlama kabulü kod ajanının sorumluluğunda bekliyor. Dashboard secret kaydı uçtan uca kabul anlamına gelmez.


## Uygulama ajanından dağıtım bildirimi — 16 Kasım 2026

Aşağıdakiler uygulama ajanının ilettiği dağıtım sonuçlarıdır; hesap kurulum ajanı bağımsız yeniden dağıtım veya cihaz testi yapmamıştır. Önceki “dağıtılmadı” ifadeleri önceki kontrol zamanını anlatır.

- Onaylı migrationlar qydeobqdselujkprmxpb projesine tek transaction halinde uygulandı.
- Yedi uygulama tablosunda RLS=true; anon/authenticated için record_energy_ssv execute=false doğrulandığı bildirildi.
- delete-account ve admob-ssv Edge Functions dağıtıldı. İlgili fonksiyonlar kendi Auth getUser / Google ECDSA doğrulamasını kullanır.
- Anahtarsız probe sonuçları: delete-account POST {} → 503 not_enabled; admob-ssv GET → 503 Not enabled. Bunlar özelliklerin kapalı olduğunu doğrular; işlevsel kabul testi değildir.
- Çalışma bayrakları kapalıdır. AdMob'a SSV endpoint'i girilmedi. Apple secret değiştirilmedi.
- Kontrollü, test modu kapalı ve test reklamı önizlemeli sürüm derlenip iPhone'a kuruldu. Telefon kilitli olduğu için açılış ve Apple girişi kabulü tamamlanmadı. Gerçek silme/yeni UUID/yerel sıfırlama kabulü hâlâ bekliyor.
- UI üzerinden uygulanan migrationların CLI migration history kaydı henüz repair edilmedi. Sonraki CLI dağıtımından önce geçmişle gerçek şema uzlaştırılmalıdır; migrationlar körlemesine yeniden çalıştırılmamalıdır.
