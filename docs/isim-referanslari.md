# ultima isim referansları

## Kimlik ile görünen ad ayrımı

Şehirler, koleksiyonlar, eşyalar, üreticiler, meslekler, unvanlar, müşteriler ve ilanlar sabit, isimden bağımsız kimlik taşır. Görünen ad bu kimlikten ayrı tutulur.

Örnek: `city1_name_tr = Skara Brae`. Daha sonra aynı anahtarın değeri Kısagöl olabilir. Kimlik, görev bağlantıları ve oyuncu ilerlemesi değişmez. `skara_name` veya `cove_name` gibi görünen isimden üretilmiş anahtarlar kullanılmaz.

## Şimdiki şehir referansları

| Kimlik | Türkçe ad anahtarı | Şimdiki değer | Sıra |
| --- | --- | --- | --- |
| city1 | city1_name_tr | Skara Brae | 1 onaylı |
| city2 | city2_name_tr | New Haven | 2 onaylı |
| city3 | city3_name_tr | Cove | 3 onaylı |
| city4 | city4_name_tr | Minoc | 4 öneri |

Kimlikteki sayı mevcut kayıt numarasıdır; ileride sıralama değişirse kimlikler yeniden numaralandırılmaz. Harita sırası `order` alanında ayrı tutulur.

## İçerik kayıtları

- `item1` gibi bir eşyanın adı `item1_name_tr` anahtarından alınır.
- Görev gereksinimi yalnızca `item_id` ve `quantity` taşır; eşya adını tekrar etmez.
- Görevler `city_id`, `npc_id`, `prerequisite_ids` ve `grants_title_ids` ile bağlanır.
- İlan adları `quest1_name_tr`, müşteri adları `npc1_name_tr` gibi anahtarlarda tutulur.
- Unvanların görünen metinleri ayrı ad anahtarlarıyla düzenlenebilir. Meslek adının değişmesi, unvan metinlerinde otomatik sözcük değişimi anlamına gelmez; ilgili unvan değerleri de düzenlenir.
- Yeni hikâye metinleri şehir veya eşya adını metne gömmez; ilgili kimlikten çözümlenen ad veya yer tutucu kullanır.
- Oyun davranışı hiçbir zaman görünen ad karşılaştırılarak seçilmez. Kayıtlar kimlik üzerinden çalışır.
- Kimliği silinen kayıt başka bir içerik için yeniden kullanılmaz.

## Şimdiki uygulama

`data/content-reference.json` tasarım verisini ve ad sözlüğünü içerir. Excel'in Isimler sekmesinde adlar tek noktadan düzenlenir. Gorevler ve Zincirler sekmeleri isimleri anahtarlı formüllerle okur. Şehir adını Kısagöl ve eşya adını başka bir değer yaparak değişikliğin yayıldığı test edilmiştir; teslim edilen dosyada özgün adlar geri yüklenmiştir.

Excel inceleme kopyası ile JSON arasında otomatik çift yönlü eşitleme yoktur. Excel'de onaylanan değişiklikler JSON'a ve karar dokümanlarına aktarılmalıdır. Geçmiş araştırmalar ve eski açıklama metinleri tarihsel kayıt olabilir; oyun içeriğinin adı için kaynak sözlük kullanılır.


Xcode kaynak bağlantısı artık doğrudan ../data/content-reference.json dosyasını paketler. ios/Resources altında ayrı düzenlenebilir JSON kopyası kaldırıldı; görünen isimler ve oyun içeriği tek kanonik kaynaktan derlenir.

## Masterland uygulama adı

Uygulama görünen adı `app1_name_tr = Masterland` anahtarındadır. React Native arayüzü bu sözlüğü okur. Expo mağaza/OS adı `mobile/app.json` içinde tutulur; marka değişikliğinde iki değer birlikte güncellenir. İçerik kimlikleri marka adından türetilmez.
