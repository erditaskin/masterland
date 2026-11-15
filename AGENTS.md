# Masterland proje talimatları

## Devam etmeden önce

`README.md`, `docs/kararlar.md` ve `docs/acik-konular.md` dosyalarını okuyun. İlgili değişikliğin geçmişi için `docs/degisiklik-gecmisi.md` dosyasını kontrol edin.

## Kararların korunması

- Kullanıcının açık kararlarını ve düzeltmelerini `docs/kararlar.md` dosyasına işleyin.
- Önerileri kullanıcı onaylamadan kesin karar olarak kaydetmeyin. Bunları `docs/acik-konular.md` içinde tutun.
- Değişen kararın eski anlamını tarihçede koruyun. Tarih ve değişiklik nedenini ekleyin.
- Yeni oturumların önceki sohbeti bildiğini varsaymayın; gerekli bağlamı dokümanlarda koruyun.
- Nebula özelliklerini resmî Ultima Online veya başka shard özellikleriyle karıştırmayın. Kaynağı belirtin.
- Şehir ve kasaba temaları netleşmeden oyun kodlamasına başlamayın; kullanıcı bu sırayı değiştirirse güncelleyin.

## İletişim

Kullanıcı Türkçe, kısa ve kolay taranan yanıtlar istiyor. Uzun paragraflardan kaçının. Soruları mümkün olduğunca tek tek sorun. Kalıcı dokümanlarda açık, normal Türkçe kullanın.

## Ana tasarım sınırı

Şehirdeki rol yalnızca görev ve eşya temasını belirler. Oyunun temel etkileşimi tahtada toplama, iki aynı eşyayı birleştirme, sipariş teslimi ve ilerlemedir. Ayrı tarif veya üretim ekranı eklemeyin. MMORPG hissi, kendiliğinden çok oyunculu altyapı veya savaş gereksinimi anlamına gelmez.

## İsim referansları

Yeni içerik hazırlamadan önce `docs/isim-referanslari.md` ve `data/content-reference.json` dosyalarını okuyun. Şehir, eşya, üretici, müşteri, meslek, unvan ve ilan adlarını görünen isimden türetilmiş anahtarlarla kaydetmeyin. Sabit ID ve değiştirilebilir ad anahtarı kullanın. Görevler eşya isimlerini kopyalamaz; item_id ve quantity ile referans verir. Yeni şehir sırası Skara Brae, New Haven, Cove'dur. Eski tarihçe satırlarını güncel karar sanmayın.

## Aktif uygulama ve kalite

Aktif kök `/Users/erdi/masterland`, uygulama `mobile/` altındadır. Eski SwiftUI oyun kaynakları proje dışına arşivlenmiştir. Expo tarafından üretilen `mobile/ios` düzenlenmez; native ayarlar config plugin ile tekrar üretilebilir tutulur. Gerçek Release simülatöründe görsel ve etkileşim kontrolü olmadan teslim edildiğini belirtmeyin. Test geçmesi pixel-perfect kabulü değildir.

## Güncel görsel hedef

15 Kasım 2026 01.14.55 fotoğrafı assets/references/masterland-visual-target-v11.png içindedir. Kullanıcı fotoğraftaki hücre oranını açıkça seçmiştir; eski 1:1 şartını yeni çalışma için uygulamayın. Uniform ölçüm 122:88.75, aktif kapasite 6×9=54 olarak korunur. Hücreleri fiziksel piksele hizalayın; son satır diğerlerinden farklı olmaz. Bütün ekran için %100 piksel özdeşliği ile tek hücre dokusu benzerliğini karıştırmayın. Son ölçümler reference-fidelity-20261115.md içindedir.


## En son görsel karar — Skara konsept turu

Kullanıcı 15 Kasım 2026 akşamı hücrelerin her zaman kare olmasını açıkça istedi. Yukarıdaki fotoğraf kaynaklı 122:88.75 oranı tarihçedir; yeni hedef eşit kare hücrelerdir. 6×9 kayıt kapasitesi korunur. Üretici rafı kompakt, şehir başlığı yukarıda, tahta yanlara yakın ve uzun olacaktır. Konseptler assets/concepts/skara-v1 ve docs/skara-concept-v1.md içindedir. Konsept onayından sonraki native uygulama turunda kare standardı kodlanmıştır. Kanonik hedef kullanıcı tarafından tekrar belirtilen skara-concept-set-v1.zip paketidir. Güncel native ölçümler ve sınırlamalar docs/skara-native-fidelity.md içindedir.
