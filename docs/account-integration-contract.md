# Hesap kurulum ajanı ile uygulama sözleşmesi

Bu dosya uygulama ajanına aittir. Dashboard sonuçları diğer ajanın `account-setup-status.md` raporunda kalır. Otomatik canlı dağıtım yapılmaz.

## Mobil yapılandırma

`mobile/.env.example` yalnız public ayarları içerir. Gerçek değerler Git dışında yerel ortam dosyasında tutulur.

| Alan | Kullanım |
|---|---|
| EXPO_PUBLIC_BACKEND_ENABLED | Açıkça true değilse Supabase istemcisi oluşturulmaz |
| EXPO_PUBLIC_BACKEND_ENV | disabled, test veya production |
| EXPO_PUBLIC_SUPABASE_URL | Gerçek projenin HTTPS URL'si |
| EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY | sb_publishable_ ile başlayan public key; service-role/JWT secret kabul edilmez |
| EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID | Native iOS istemcisi; config plugin URL scheme'i buradan üretir |
| EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID | Supabase token audience ile eşleştirilen web istemcisi |
| EXPO_PUBLIC_FACEBOOK_LOGIN_ENABLED | Facebook dashboard yayını hazır olduğunda true |

Test modu açık bir uygulama production Supabase'e bağlanamaz. Kullanıcının diğer ajanla tek canlı proje seçimi raporda görülmüştür; bu seçim burada değiştirilmemiştir. Test kredili sürümün canlı kayıtları kirletmemesi için guard korunur. Gerçek giriş denemesi için test modu kapalı kontrollü derleme veya ayrı test projesi gerekir; bu konu hesap tesliminde netleştirilir.

## Sağlayıcılar

- Apple: native Expo Apple Authentication; Bundle ID com.erditaskin.masterland, usesAppleSignIn capability ve SHA-256 nonce. ID token Supabase'e ham nonce ile doğrulatılır. Bu yol için web Service ID zorunlu değildir; Facebook dönüşüyle Apple web OAuth karıştırılmaz.
- Google: native Google Sign-In iOS. iOS ve web client ID gerekir. Reversed client scheme Expo app.config.js tarafından gerçek iOS client ID'den üretilir; kimlikler değişirse native prebuild gerekir.
- Facebook: Supabase OAuth PKCE ve sistem auth tarayıcısı. Supabase sağlayıcı callback'i dashboard'daki HTTPS URL'dir. Uygulamaya son dönüş adresi tam olarak `masterland://auth/callback` olacaktır; Supabase Redirect URLs alanında bu kesin adres izinli olmalıdır. Geniş wildcard gerekmez.
- İlk giriş mevcut yerel oyunu silmez. Aynı hesaba ikinci sağlayıcı eklemek linkIdentity kullanır; Supabase manual identity linking ayarı gerekir. Bu ayar henüz doğrulanmış sayılmaz. Zaten başka hesaba bağlı sağlayıcı hatası otomatik hesap/kayıt birleştirmeye dönüşmez.
- Facebook arkadaş listesi veya paylaşım izni gerekmez. Global dış kullanıcı erişimi dashboard test rolünden bağımsız olarak doğrulanmalıdır.

## Bulut verisi

`supabase/migrations/202611160001_cloud_saves.sql` hazırlanmıştır, uzak projeye uygulanmamıştır. Tablolar: game_saves, game_save_receipts, game_save_history. RLS sahibi dışında okumayı reddeder; istemciden doğrudan yazma izni verilmez. write_game_save RPC'si auth.uid üzerinden sahipliği belirler; beklenen revizyon, tek işlem kimliği ve on eski snapshot ile çalışır.

Bu şema istemcideki tüm oyun ekonomisini sunucu tarafından doğrulamaz. Satın alma/reklam cüzdan otoritesi için ek doğrulama gereklidir. Migration gerçek Postgres üzerinde henüz çalıştırılmadı. Yerel kayıt bu repository'ye otomatik bağlanmamıştır; kayıt seçimi/çakışma ekranı tamamlanmadan canlı yazma başlamaz.

Hesap silme Edge Function'ı, anonim hesap akışı, bulut otomatik eşitleme ve gerçek reklam henüz tamamlanmamıştır. Bu noktada hesap paneli açıkça “Cihazda kayıtlı / Bulut eşitleme henüz etkin değil” gösterir. Giriş yapılması yedeklendi anlamına gelmez.
