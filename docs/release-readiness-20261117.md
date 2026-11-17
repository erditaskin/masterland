> Güncel karar: 17 Kasım 2026 tarihinde Supabase yerine bağımsız VPS/Fastify/PostgreSQL geçişi seçildi. Aşağıdaki Supabase dağıtım bilgileri tarihsel checkpoint bilgisidir; yeni yayın hedefi değildir. Son checkpoint 153 birim testi içerir. Misafir oturumu istemcisi eklendi ancak dashboard ve cihaz kabulü tamamlanmadı. 007 üretici reklamı migrationı kapalı dağıtıldı. Ayrıntılı yeni oturum aktarımı outputs içindeki masterland-vps-handover-20261117.md dosyasındadır.

# Canlı yayın hazırlığı — 17 Kasım 2026

## Bu tur tamamlanan yerel işler

- Bulut kayıt profilde açık cihaz/bulut seçimine bağlandı. İlk bağlantı ve çatışma otomatik üzerine yazmaz. Bir seçim daha yeni sunucu sürümüyle çakışırsa yeniden seçim gerekir.
- Bağlı hesap için kayıt kuyruğu, bağlantı geri gelişi, uygulama ön plana gelişi ve 5 saniyelik toplu gönderim bağlandı. Değişmeyen snapshot yeniden yazılmaz. Sunucu çağrıları 15 saniyede zaman aşımına uğrar.
- Hesap değişimi önceki hesaptan dönen yanıtı yeni hesaba uygulamaz. İstek sahibi token ile sabitlenir. Çıkış/silme sırasında eski işin tamamlanması beklenir.
- Disk yazımı başarısız olursa en son snapshot yeniden denemede korunur. Yeni snapshot varsa eskisinin yerine o yazılır.
- Test/QA kayıtları buluta yüklenmez; test işaretli uzak kayıtlar da kabul edilmez.
- 006 migrationı doğrulanmış reklam ödülünü kayıt sürümüyle aynı transaction içinde bir kez öder. Ödül doğrulanmadıysa pending; sürüm eskiyse conflict döner, ödül tüketilmez. Eski 15 ve yeni 25 kayıtları desteklenir.
- Reklam doğrulama anahtarı servisi geçici hata verirse HTTP 503 döner; yanlış imza HTTP 400 kalır. Böylece altyapı kesintisi yeniden denenebilir.
- Mobil reklam RPC/yanıt sözleşmesi reklam lifecycle ve bulut kuyruğuna bağlandı. Ödül miktarı, revision ve değişen kayıt alanları doğrulanır. SDK earned olayı tek başına ödeme kanıtı değildir. Sunucuda geç gelen ödüller yeniden bağlantı/ön plan/bulut hazır olduğunda bulunur. Ödeme sırasında yerel oyun değişmişse otomatik üzerine yazmak yerine açık kayıt seçimi gerekir.

## Doğrulama

- 147 birim/regresyon testi geçti; TypeScript ve ESLint temiz.
- Altı migration geçici PostgreSQL 17 üzerinde uygulandı. Hesap silme, silme kurtarma, RLS, reklam kotası, tekrar callback ve yeni ödül tüketimi SQL testleri geçti. Canlı veritabanı bu testlerde kullanılmadı.
- Yeni bulut modülüyle ilk Release simülatör turunda 3 test geçti: merge/cooldown, normal kayıt yeniden açılışı, çevrimdışı profil/TR-EN. Son kaynakla tekrar edilen 2 test geçti: soğuk açılış ve profil/TR-EN.
- Simülatör görüntüleri çıktı klasörüne alındı; profil görüntüsü görsel olarak incelendi. Bu kontroller iki gerçek hesabın canlı bulut aktarımı kabulü veya yeni tasarımın pixel-perfect onayı değildir.
- masterland.app/app-ads.txt HTTP 200, text/plain döndü; pub-2972187520207492 satırı mevcut. Gizlilik ve hesap silme sayfaları HTTP 200 döndü. Bu, AdMob tarayıcı onayı veya Meta URL kabulü anlamına gelmez.

## Bekleyen ve kapalı kalan işler

1. 005 +25 ve 006 atomik ödül tüketimi migrationları kullanıcı işlem anı onayıyla canlı Supabase'e uygulandı. Güncel SSV function dağıtıldı. ADMOB_SSV_ENABLED ve ACCOUNT_DELETION_ENABLED açılmadı. Anahtarsız probe reklam ve silme için 503/not_enabled döndü. CLI migration history henüz repair edilmedi; bu altı migration dashboard üzerinden uygulanmıştır.
2. Canlı reklam yükleme/gösterme hâlâ hard gate ile kapalıdır. Enerji için SSV user/customData, sunucu ödeme ve pending kurtarma kodu bağlıdır; sahte SDK/gerçek kuyruk sınırı testleri geçti. Gerçek kullanıcı/AdMob ödülü ve çok cihaz kabulü henüz tamamlanmadı. Üretici cooldown reklamı için ayrıca sunucuda hedef doğrulayan ödül sözleşmesi gereklidir; mevcut 006 yalnız enerji içindir. Test modu cooldown reklamı değişmedi; canlıda ödeme yapılamayan cooldown reklamı açılmaz.
3. AdMob oturumu kullanıcı tarafından açıldı. Ödül metadata 25 energy olarak kaydedildi. SSV URL gerçek Google imzası ile konsolda doğrulandı ve reklam birimine kaydedildi. Test sahte UUID'lerle ve ödeme kapalıyken yapıldı; kullanıcıya enerji ödenmedi. Google konsolunun sample ad_unit=1234567890 ve transaction_id=123456789 alanları üretim ödül kurallarından ayrıldı: kapalı modda yalnız kriptografik imza doğrulanır, ledger çağrılmaz; açık modda gerçek reklam birimi/miktar/zaman/kimlik kontrolleri zorunludur. AdMob hâlâ İnceleme gerekli durumunda ve halka açık mağaza ayrıntıları boş; app-ads.txt ekranında doğrulanmış uygulama satırı yok. Dosyanın webde bulunması AdMob onayı değildir.
4. Bulutun cihaz/bulut seçimleri gerçek oturum ve iki cihaz senaryosunda doğrulanmalıdır. Bu tur telefona yeni sürüm kurulmadı. Son kaynakla Release simülatöründe test reklamı/25 enerji, profil/TR-EN ve normal kayıt yeniden açılışı olmak üzere üç test daha geçti.
5. Gerçek hesap silme, yeni hesap UUID ve Apple revoke uçtan uca kabulü bekliyor. Yerel SQL/native kod kontrolleri gerçek Apple kabulü değildir.
6. Google marka sayfasında masterland.app anasayfa ve gizlilik URL'leri, masterland.app authorized domain kaydedildi. Kullanıcının ayrıca işlem anı onayıyla Google OAuth In production'a alındı. Yeni hassas izin eklenmedi. Verification Center data access için sensitive/restricted kapsam olmadığını, fakat branding'in henüz kullanıcılara gösterilmediğini söylüyor; logo/marka doğrulaması ayrı bekliyor.
7. Meta uygulaması Unpublished. Go live ekranı Data deletion URL ve Business verification istiyor. https://masterland.app/delete-account/ hem normal hem facebookexternalhit User-Agent ile HTTP 200 dönmesine rağmen Meta Save Changes, Data deletion instructions URL should represent a valid URL hatasını verdi. Denenen app-domain/URL taslakları Discard ile geri alındı; kabul edilmiş sayılmadı. Meta kişi/işletme doğrulaması kullanıcı tarafından tamamlanmalı. Şifre/kimlik belgesi alınmadı.
8. Mağaza TR/EN metadata, gizlilik beyanları ve tam İngilizce metin taraması bekliyor. Gerçek para satışları ilk yayın sonrasıdır; StoreKit/sunucu doğrulaması tamamlanmadan açılmaz. Yeni şehir/unvan/rozet tasarım içerikleri diğer ajanla bekleniyor.

## Devam giriş noktaları

mobile/src/account/cloudSyncController.ts, cloudSync.ts, ui/CloudSyncPanel.tsx; mobile/src/ads/verifiedEnergy.ts ve verifiedEnergyRepository.ts; supabase/migrations/202611170005_rewarded_energy_25.sql ve 202611170006_redeem_verified_energy.sql.

AdMob IAB sekmesi 14 app-ads.txt durumunda. Supabase SQL sekmesi 15 başarılı transaction sonucunda; sorgu 92812f36-b4b9-4f10-a8e7-bfc609e8a445. SSV source sekmesi 16, Google Verification Center 17 ve Meta Go live 19. Canlıya test fixture uygulanmadı. Güncel testler /private/tmp/masterland-release-unit.log, SQL sonucu /private/tmp/masterland-release-sql.log, native son tur /private/tmp/masterland-ssv-mobile-20261117.xcresult içindedir.
