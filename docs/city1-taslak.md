# Birinci şehir görev ve koleksiyon taslağı

Güncelleme: Şehir bitirme sırası ve otomatik yüksek unvan eşikleri geçersizdir. Aşağıdaki tablo v1 içerik arşividir. Güncel kurallar `ilerleme-modeli.md` içindedir. İlk altı giriş görevi ve Apprentice kararı korunur.

14 Kasım 2026. Birinci şehir `city1`, görünen adı Skara Brae'dir. Ana tema ekin, değirmen ve fırındır. İkinci şehir `city2` New Haven, üçüncü şehir `city3` Cove olarak kesinleşmiştir. Minoc için dördüncü sıra henüz öneridir.

## Onaylı kurallar

- Birinci şehirde meslekler Farmer ve Baker olacaktır. Değirmencilik, fırıncılık zincirinin parçasıdır.
- İlk altı giriş görevinin ardından Apprentice Farmer ve Apprentice Baker unvanları kazanılır.
- Şehir, eşya, üretici, müşteri ve ilan isimleri değiştirilebilir referanslarla tutulur.
- Yalnızca iki aynı eşya birleşir. Değirmen veya fırın için ayrı tarif ya da üretim ekranı eklenmez.

## İncelenecek taslak

24 görev ve iki koleksiyon aşağıda önerilmiştir. Görev sayıları, eşyalar ve Apprentice sonrasındaki unvan eşikleri henüz onaylanmamıştır. Kesin altın ve XP ödülleri belirlenmemiştir. İlk şehrin yaklaşık bir günlük ücretsiz tamamlama hedefi ekonomi hesabıyla henüz doğrulanmamıştır.

## Tahıl ve ekmek

1. `item1` Buğday başağı
2. `item2` Buğday demeti
3. `item3` Buğday çuvalı
4. `item4` Un
5. `item5` Hamur
6. `item6` Somun ekmek
7. `item7` Ekmek sepeti
8. `item8` Ekmek kasası

## Sebze hasadı

1. `item9` Havuç
2. `item10` Havuç demeti
3. `item11` Sebze sepeti
4. `item12` Sebze kasası
5. `item13` Hasat sandığı
6. `item14` Hasat arabası

## Görev sırası

| Sıra | İlan referansı | İstenenler | Kazanılan unvan |
| --- | --- | --- | --- |
| 1 | `quest1` İlk hasat | 1 Buğday demeti | — |
| 2 | `quest2` Komşunun sofrası | 1 Havuç demeti | — |
| 3 | `quest3` Değirmene teslim | 1 Buğday çuvalı | — |
| 4 | `quest4` İlk un | 1 Un | — |
| 5 | `quest5` Hamur hazırlığı | 1 Hamur, 1 Havuç demeti | — |
| 6 | `quest6` İlk ekmek | 1 Somun ekmek, 1 Sebze sepeti | Apprentice Farmer, Apprentice Baker |
| 7 | `quest7` Pazar hazırlığı | 1 Buğday çuvalı, 1 Sebze sepeti | — |
| 8 | `quest8` Fırın yeniden dolsun | 2 Hamur | — |
| 9 | `quest9` Yolcu azığı | 1 Somun ekmek, 1 Sebze kasası | Journeyman Farmer, Journeyman Baker |
| 10 | `quest10` Hasat günü | 2 Sebze kasası | — |
| 11 | `quest11` Köy fırını | 2 Somun ekmek | — |
| 12 | `quest12` Ortak sofra | 1 Ekmek sepeti, 1 Sebze kasası | Expert Farmer, Expert Baker |
| 13 | `quest13` Yeni tarla siparişi | 1 Hasat sandığı | — |
| 14 | `quest14` Feribot erzağı | 1 Ekmek sepeti, 2 Sebze sepeti | — |
| 15 | `quest15` Kasaba pazarı | 1 Ekmek sepeti, 1 Hasat sandığı | Adept Farmer, Adept Baker |
| 16 | `quest16` Büyük fırın siparişi | 2 Ekmek sepeti | — |
| 17 | `quest17` Büyük hasat | 1 Hasat arabası | — |
| 18 | `quest18` Usta sofrası | 1 Ekmek kasası, 1 Hasat sandığı | Master Farmer, Master Baker |
| 19 | `quest19` Hasat şenliği hazırlığı | 1 Ekmek sepeti, 1 Hasat arabası | — |
| 20 | `quest20` Pazarın son siparişi | 2 Sebze kasası, 1 Hasat sandığı | — |
| 21 | `quest21` Fırının özel siparişi | 1 Ekmek kasası, 2 Somun ekmek | — |
| 22 | `quest22` Kasabanın erzağı | 1 Ekmek kasası, 1 Hasat arabası | — |
| 23 | `quest23` Şenlik hazırlığı | 2 Ekmek sepeti, 1 Hasat sandığı | — |
| 24 | `quest24` Hasat şenliği | 2 Ekmek kasası, 1 Hasat arabası | Grandmaster Farmer, Grandmaster Baker |

## Düzenleme dosyaları

- `tables/city1-inceleme.xlsx`: Görevler, zincirler ve düzenlenebilir isim referansları.
- `../data/content-reference.json`: Sabit kimlikler, isim sözlüğü ve görev referansları. Oyun kodu değil, tasarım verisidir.
- `isim-referanslari.md`: Kimlik ve adlandırma kuralları.

## Kaynak ayrımı

UO Cooking sayfası Skara Brae çevresindeki buğday ve sebze tarlalarını, un, hamur ve ekmek üretimini açıklar. Buradaki ikili birleştirme basamakları oyun tasarımı uyarlamasıdır. Sayfa, Skara Brae içindeki belirli bir değirmen veya fırın konumunun kanıtı olarak kullanılmaz.

- https://uo.com/wiki/ultima-online-wiki/skills/cooking/
- https://uo.com/wiki/ultima-online-wiki/world/cities-and-towns/cities-and-towns-skara-brae/
