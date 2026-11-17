# VPS sürümü TestFlight teslimi — 17 Kasım 2026

## Sonuç

**Arşiv hazır; TestFlight yüklemesi tamamlanmadı.** Release native kontrolü 18.715 saniyede geçti, cihaz arşivi doğru 0.2.0 (3) sürümüyle imzalandı. Üç Apple upload denemesi sırasıyla zaman aşımı, HTTP 500 ve HTTP 500 ile bitmiştir. Yeni build'in Apple'a ulaştığı veya processing tamamlandığı iddia edilmez. App Store production gönderimi yapılmamıştır. Beşli görsel yön onaylıdır; yeni haritalar bu arşivin içinde değildir.

## Kullanıcının talebi

Kullanıcı beşli görsel yönünü onayladı; production yayını beş harita hazır olunca yapılacaktır. Bundan önce mevcut uygulamanın yeni bir TestFlight build'iyle tekrar yüklenmesini istedi. Yeni harita konseptleri henüz uygulamaya alınmadığından bu beta beş haritanın hazır olduğu şeklinde sunulmaz.

## Hazırlanan sürüm

- Sürüm/build: 0.2.0 (3).
- App Store Connect uygulama ID: 6835346739; bundle com.erditaskin.masterland; Apple Team F3F723W4SF.
- Kanal testflight, kontrollü kabul true, test modu false.
- Masterland production API, backend ve doğrulanmış reklam akışı açık.
- Facebook yeni giriş seçeneği gizli; Apple/Google ve hesapsız oyun korunur. Mevcut Facebook kimliği/oturumu silinmez.
- Gerçek para satışı kapalı. Test enerji/altın/elmas/seviye eylemleri kapalı.
- Hesap silme arayüzü açık; fiziksel Apple revoke/silme kabulü servis sorunu nedeniyle hâlâ beklemededir. TestFlight yüklemesi bu kabulün yerine geçmez.
- AdMob 0.2.0 sürümüne özel test modu açık kalır; bu beta gelir elde eden reklam sürümü değildir.
- Kontrollü TestFlight oyun kaydı kullanılır. Önceki test kredili beta/normal oyun kaydı silinmez, işareti kaldırılıp production bulutuna yüklenmez. Eski beta tester'ı bu kontrollü alanda ayrı ilerleme görebilir.

`npm run ios:beta-vps` aynı bayrakları tekrar üretir. Eski `ios:beta` test kredili kanal tarihçesi için korunmuştur. Yeni beta için o komut kullanılmaz.

## Hazırlık ve mevcut durum

Expo config plugin'leriyle iOS projesi yeniden üretilmiş, CocoaPods kurulmuştur. Üretilen Info.plist 0.2.0 ve build 3 değerlerini doğrulamıştır. iOS kaynaklarına elle sürüm veya native ayar eklenmemiştir. TypeScript ve ESLint geçmiştir; ad düzeltmelerini içeren 170 mobil test önceki checkpoint'te geçmiştir.

App Store Connect TestFlight adresi mevcut tarayıcı oturumunda `authResult=FAILED` ile login sayfasına dönmüştür. Panelde son build durumu okunamamıştır. Bu nedenle önce imzalı arşiv hazırlanıp Xcode'un mevcut yetkili hesabıyla export/upload yolu denenecektir. Henüz yükleme veya Apple processing başarısı raporlanmaz.

Release simülatör hedefi: Masterland-Store-Release-QA, iOS 18.6, 86077B48-3F9F-4254-B954-AB7E9D40FAD0. `testVerifiedTestFlightReleasePolicy`, test kontrollerinin yokluğunu, fixture URL'lerinin gerçek kaydı değiştirmemesini, gerçek para satışının kapalılığını ve Facebook gizlemesini denetler. Simülatör derlemesi arşivden önce sıralı çalışır.

İlk native koşu başarılı sayılmadı: üreticiye dokunduktan hemen sonra test eski 100 enerji etiketini yakalamış, URL açılırken gerçek üretim sonucu 99 ekrana yansımıştır. Test harness'i üretimin beklenen enerji güncellemesini en çok 10 saniye bekleyecek şekilde düzeltildi. Bu düzeltmede oyun veya kayıt runtime kodu değiştirilmedi. İlk sonuç `/private/tmp/masterland-testflight-vps-policy-20261117.xcresult` içinde başarısız olarak korunur; düzeltilmiş koşu ayrıca raporlanacaktır.

Düzeltilmiş gerçek Release koşusu 18.715 saniyede geçti: `/private/tmp/masterland-testflight-vps-policy-final-20261117.xcresult`. Test düğmeleri yoktur, üretim sonrası enerji değeri fixture URL'leriyle değişmemiştir, gerçek para satın alma düğmeleri yoktur ve yeni giriş ekranında Facebook görünmez. Üç ekran görsel olarak incelenmiştir; Belenyaka adı gerçek uygulama ekranında görülmüştür. Kanıtlar `verification/2026-11-17-testflight-vps/` içindedir. Bu koşu yeni bir fiziksel Apple silme veya reklam videosu kabulü değildir; önceki ayrı kabul sınırları korunur.

Simülatör kontrolü tamamlandıktan sonra 0.2.0 (3) cihaz arşivi başlatılmıştır. Archive yolu `/private/tmp/masterland-testflight-vps-0.2.0-3.xcarchive`; günlük `/private/tmp/masterland-testflight-vps-archive-20261117.log`. Henüz Apple'a upload sonucu yoktur.

Arşiv başarıyla tamamlanmıştır. ApplicationProperties/uygulama Info.plist; doğru bundle, 0.2.0 sürümü, build 3, Team F3F723W4SF ve imzalama kimliğini doğrulamıştır. UI test eklentisi app arşivine alınmamıştır. Simülatör ve cihaz Hermes kaynak hash'i aynıdır; bytecode dosyalarının SHA-256'sı derleme klasörü kaynak yolu ve buna bağlı footer nedeniyle farklıdır. İkili boyut farkı iki derleme yolu uzunluğunun 59 baytlık farkına eşittir; farklı kaynak bayrakları varmış gibi veya bytecode dosyaları birebir aynıymış gibi raporlanmamıştır.

Kullanıcının açık yetkisiyle `qa/ExportOptions-TestFlight.plist` (destination upload) üzerinden Apple yüklemesi başlatılmıştır. Export yolu `/private/tmp/masterland-testflight-vps-export-0.2.0-3`; korumalı günlük `/private/tmp/masterland-testflight-vps-upload-20261117.log`. Bu paragraf yüklemenin tamamlandığı anlamına gelmez; sonuç aşağıya eklenecektir.

İlk upload/export denemesi exit 70 ve `error: exportArchive The request timed out.` ile bitmiştir; başarılı yükleme sayılmamıştır. Yerel dağıtım günlüğünden yalnız adım isimleri, servis hostname'leri ve hata kodları çıkarılmıştır. Packaging/codesign hattında Apple developerservices3 servisi için NSURLErrorDomain -1001 görülmüştür. Ham dağıtım logu, account token veya provisioning içeriği paylaşılmamıştır. Kimliksiz kök URL probe'ları contentdelivery servisine erişmiş; developerservices3 IPv4 denemesi zaman aşımına uğramış, varsayılan bağlantı 403 dönmüştür. Bu, tek başına genel Apple kesintisi veya hatalı kimlik bilgisi kanıtı değildir.

Aynı imzalı arşivle bir kontrollü tekrar başlatılmıştır: `/private/tmp/masterland-testflight-vps-upload-retry-20261117.log`, export yolu `/private/tmp/masterland-testflight-vps-export-0.2.0-3-retry`. Önceki başarısız denemenin kanıtı korunmuştur. Tekrar sonucu henüz beklenmektedir.

İkinci deneme de exit 70 ile başarısızdır: `Error Downloading App Information`; Xcode uygulama kayıtlarını App Store Connect'ten indirirken beklenmeyen HTTP 500 aldığını bildirmiştir. Bu, başarılı upload veya processing değildir. Testleri geçen arşiv korunur; üçüncü deneme öncesinde hazırlık/kanıt checkpoint'i alınmaktadır.

Arşivin kalıcı yerel kopyası `/Users/erdi/masterland/.private-backups/testflight-0.2.0-3-20261117/` altında 0700 dizinde saklanmıştır. Manifest 0600'dür ve kopyanın main.jsbundle SHA-256'sı doğrulanmıştır. Bu yedek yalnız derlenmiş uygulama arşividir; telefonun oyun/oturum depolaması veya Keychain kopyası değildir. Git'e veya offsite depoya aktarılmamıştır.

Kısa aradan sonra üçüncü ve son kontrollü yükleme aynı arşivle başlatılmıştır: `/private/tmp/masterland-testflight-vps-upload-final-20261117.log`, export yolu `/private/tmp/masterland-testflight-vps-export-0.2.0-3-final`. Bu denemenin sonucu beklenmektedir; ilk iki hatadan başarı sonucu türetilmez.

Üçüncü deneme de exit 70 ile bitmiştir: App Store Connect uygulama kayıtları indirilirken HTTP 500. Bu son durum yukarıdaki Sonuç bölümünde kaydedilmiştir. Yeni kör retry başlatılmamıştır. Yeniden upload için mevcut imzalı arşiv yeterlidir; kaynak değişmeden yeniden build gerekmez. Apple processing, tester grup erişimi ve yeni beta inceleme durumu doğrulanamamıştır.

Günlükler: `/private/tmp/masterland-testflight-vps-prebuild-20261117.log`, `/private/tmp/masterland-testflight-vps-pods-20261117.log`, `/private/tmp/masterland-testflight-vps-sim-build-20261117.log`. Tam build günlükleri App Store'a veya başka hizmete ayrıca gönderilmez.

## Yükleme sınırı

### Beta yenilik metni taslağı

Bu build mevcut oyun arayüzüyle yeni Masterland sunucusuna bağlanır. Belenyaka, Badınca ve İpekyolu adları güncellenmiştir. Apple/Google girişi, bulut kayıt ve doğrulanmış test reklamı ödülleri yer alır. Test para/enerji/seviye düğmeleri ve gerçek para satışı kapalıdır. Facebook yeni giriş düğmesi bu sürümde gizlidir. Yeni beşli harita görselleri henüz oyunda değildir. Önceki test kredili beta ilerlemesi korunur; yeni kontrollü beta ayrı kayıt alanı kullanır.

Bu metin henüz App Store Connect'e kaydedilmemiştir.

Kullanıcının talebi mevcut sürümün TestFlight'a yüklenmesidir. App Store production gönderimi, yeni testçi daveti veya public link oluşturulması bu adımda yapılmaz. Beta testi, cihaz arşivi, Apple'a binary yüklemesi, Apple processing ve dış tester incelemesi ayrı sonuçlar olarak doğrulanmalıdır.
