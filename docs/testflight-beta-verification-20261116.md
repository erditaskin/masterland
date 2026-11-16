# TestFlight teslim sonucu — 16 Kasım 2026

Masterland 0.2.0 (2), App Store Connect'e başarıyla yüklendi. Apple işlemesi tamamlandı. Tarayıcıdaki Masterland TestFlight ekranında Version 0.2.0 altında Build 2 ve Ready to Submit durumu görüldü. Bu durum dış testçilere beta inceleme onayı alındığı veya davet gönderildiği anlamına gelmez.

## Bu sürüm

- Test enerji düğmesi açık; 100 üzerinde enerji azaltılmaz.
- Gerçek para satın alma arayüzü ve kredi eylemi kapalı.
- Altın/elmas ile oyun içi takaslar kullanılabilir.
- QA fixture bağlantıları beta oyuncusunun normal kaydını değiştiremez.
- Kayıt sistemi ve oyun içerikleri önceki doğrulanan sürümle devam eder.

52 motor testi, TypeScript ve ESLint geçti. Beta kanalıyla üretilen Release simülatöründe hedefli native politika testi geçti. Bu test enerji düğmesini, QA bağlantısının level değiştirmemesini ve gerçek para satın alma butonlarının yokluğunu kontrol etti. Önceki 10 senaryolu genel Release turu önceki temel sürümün kanıtıdır; beta kanalında yeniden 10 test çalıştırıldığı iddia edilmez.

İlk arşiv ve simülatör derlemeleri aynı Pods framework dosyalarına eşzamanlı yazdığı için çakıştı. İki işlem durduktan sonra sıralı derleme uygulandı; native test ve arşiv başarıyla tamamlandı.

## Apple tarafı

- Uygulama kaydı: 6835346739
- Bundle ID: com.erditaskin.masterland
- Team: F3F723W4SF
- SKU: masterland-ios
- Dil: Türkçe
- TestFlight build kimliği: 3fce16fa-69fd-43ca-9467-ada21e3c0a9b
- TestFlight: https://appstoreconnect.apple.com/teams/cbcc3501-be9e-4a5f-b194-1ef0e35c7e40/apps/6835346739/testflight

xcodebuild, Upload succeeded ve EXPORT SUCCEEDED döndürdü. Apple üçüncü taraf prebuilt React, ReactNativeDependencies ve Hermes frameworkleri için eksik vendor dSYM uyarıları verdi. Uygulamanın yüklenmesini ve işlenmesini engellemedi; bu frameworklerde native çökme sembolleştirmesi sınırlı kalabilir. Uygulamanın kendi arşivi ve dağıtım günlükleri korunmuştur. Eksik vendor sembolleri uyarısızmış gibi raporlanmadı.

## Sonraki aşama

Kullanıcı davet yöntemini daha sonra belirteceğini söylediği için testçi eklenmedi, public link açılmadı ve dış beta incelemesi gönderilmedi. Arkadaş erişimi istendiğinde beta test bilgileri ve Apple beta incelemesi tamamlanıp davet yöntemi uygulanacaktır. App Store canlı yayını yapılmadı.
