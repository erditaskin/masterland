# Birinci şehir görsel kartelası

Güncelleme: Bu dosya önceki tasarımı açıklar. Güncel kullanıcı değişiklikleri ve ekran standardı `ui-standard.md` içindedir. Alt eşya şeridi ve sürekli unvan etiketleri kaldırılmıştır; dört büyük kısayol yerine küçük, çoğalabilir eşya açma düğmeleri kullanılır.

14 Kasım 2026. `city1` görünen adı Skara Brae olan başlangıç şehridir. Bu kartela, mevcut ana tahta standardının tarım ve temel fırıncılık temasına uygulanmış statik ekranıdır.

## Ortak ekran standardı

- Koyu lacivert arayüz, ölçülü pirinç/altın çerçeve, açık parşömen kareler ve boyanmış sıcak Orta Çağ kasabası sanat yönü korunur.
- Üstten alta sıra: kaynaklar, kısa şehir manzarası ve şehir seçimi, meslek etiketleri, üç sipariş kartı, dört kutulu erişim şeridi, tahta, eşya bilgisi/Depo ve alt menü.
- Kullanıcının işaret ettiği dört kutulu şerit korunacaktır. Önceki v1 ekranda kaldırılmış olması geri alınmıştır.
- Şeridin ayrı üretim sistemi olması onaylanmamıştır. Bu tasarımda mevcut koleksiyon/üreticiye erişim kısayolu olarak gösterilir. Görseldeki dört kutu dört yeni üretici veya dört yeni meslek anlamına gelmez.
- Aynı standart Cove ekranına da uygulanır. Grid 6 × 7 görsel önerisi olarak korunur; kesin kapasite kararı değildir.

## Şehir teması

- Manzara: Küçük ada kasabası, kıyı suyu, buğday tarlaları, sebze bahçesi, değirmen ve fırın. Bu yerleşim bir oyun uyarlamasıdır; gerçek UO harita koordinatı iddiası taşımaz.
- Meslekler: Farmer ve Baker. Kartelada giriş görevleri sonrasına uygun Çırak Çiftçi ve Çırak Fırıncı etiketleri kullanılır.
- Şerit: Tarla, Değirmen, Fırın ve Hasat. Bunlar mevcut iki koleksiyonun tema aşamalarını temsil eder.
- Tahıl ve ekmek: Buğday başağı, buğday demeti, buğday çuvalı, un, hamur, somun ekmek, ekmek sepeti, ekmek kasası.
- Sebze: Havuç, havuç demeti, sebze sepeti, sebze kasası, hasat sandığı, hasat arabası.
- Yeni eşya ve görevlerin tamamı hâlâ taslak statüsündedir. Bu görsel koleksiyon basamaklarını onaylanmış saymaz.
- Pasta ve ileri bakery içeriği New Haven için saklanır. Balıkçılık ve carpentry Cove içeriğidir.

## Kartelanın örnek durumu

Level 2, çıraklık etiketleri, 96/100 dayanıklılık, bakiye ve sipariş ödülleri gösterim örnekleridir. Başlangıç bakiyesi, kesin XP eğrisi veya ilk açılış ekranı gereksinimi değildir. Level 2 oyuncu açılmış Skara Brae'ye dönebilir; şehirler tekrar ziyaret edilebilir.

## Referans bağlantıları

- Şehir kimliği `city1`, adı `city1_name_tr`.
- Meslekler `profession1` Farmer ve `profession2` Baker.
- Koleksiyonlar `collection1` tahıl/ekmek ve `collection2` sebze hasadı.
- Üreticiler `producer1` buğday tarlası ve `producer2` sebze tarlası.
- Kartela: `../assets/ui/ui-city1-v1.png`.
- İstem: `../assets/ui/ui-city1-v1-prompt.txt`.
- Düzeltilen Cove kartelası: `../assets/ui/ui-city3-v2.png`.

Her görünen ad, uygulamada kimlik ve yerelleştirme anahtarıyla çözümlenecektir. Raster karteladaki yazılar nihai oyun metni mimarisi değildir.
