# Şehir teması — inceleme kanıtları

**Taslak uygulama; piksel kabulü yoktur. Production veya TestFlight yayını yapılmadı.**

Son kaynakta 171 birim testi ve seçili 5 Release etkileşim testi geçti. Son görsel turda 41 kayıpsız 1206×2622 cihaz görüntüsü, ayrıca gerçek iki şehir geçişinde iki görüntü alındı. 90 görsel durumun 33'ünde görüntü vardır; 0/90 durum piksel kabulündedir. Eksik referans ve durumlar tamamlandı sayılmaz.

Detaylı kapsam ve sınırlamalar [refaktör raporunda](../../city-theme-composites-20261118.md) bulunur. [Katı kabul sonucu](acceptance-result.json) ve [durum matrisi](acceptance-manifest.json) ayrıca korunur.

## Gerçek seçili şehir

| Görünüm | Kayıpsız ekran |
| --- | --- |
| Belenyaka tahtası | [PNG](samples/theme-city1-board.png) |
| Badınca tahtası, gerçek seyahat ve üretim | [PNG](samples/milestone-haven-board.png) |
| Badınca koleksiyonu, gerçek seçili şehir | [PNG](samples/milestone-haven-collection.png) |

## Ortak ekranlar — Belenyaka

| Görünüm | Kayıpsız ekran |
| --- | --- |
| Hesapsız hesap görünümü | [PNG](samples/theme-belenyaka-account-guest.png) |
| Koleksiyon | [PNG](samples/theme-belenyaka-collection.png) |
| Ürün zinciri ve seçili Koleksiyon sekmesi | [PNG](samples/theme-belenyaka-collection-chain.png) |
| Depoda seçim ve geri alma | [PNG](samples/theme-belenyaka-storage-selected.png) |
| Market | [PNG](samples/theme-belenyaka-market.png) |

Bu güvenli QA kanalında backend ve reklam kapalı, yerel test modu açıktır. Bu nedenle giriş düğmeleri kapalıdır; markette Xcode test bölümü ve tahtada QA kontrolleri görünebilir. Bunlar production ekranının onaylı görünümü değildir. Gerçek para satışı bu çalışmayla açılmadı.

## Yalnız malzeme önizlemeleri

Bu görüntüler aynı Belenyaka test kaydına farklı şehir malzemeleri uygular. Belenyaka ürünleri ve adı görünür; üç yeni şehir oynanabilir kabul edilmez.

| Tema | Kayıpsız ekran |
| --- | --- |
| Badınca malzeme önizlemesi | [PNG](samples/theme-city2-board.png) |
| Yalıkoru malzeme önizlemesi | [PNG](samples/theme-city3-board.png) |
| Demirdere malzeme önizlemesi | [PNG](samples/theme-city4-board.png) |
| İpekyolu malzeme önizlemesi | [PNG](samples/theme-city5-board.png) |

## İzlenebilirlik

`pass-4/manifest.json` son 41 görüntünün hash'ini, `pass-4/source-manifest.json` kaynak dosyalarının ve Hermes bundle'ın hash'ini içerir. `pass-travel/manifest.json` gerçek şehir geçişi görüntülerini içerir. Önceki turlar `pass-1`, `pass-2` ve `pass-3` altında ayrı korunur. Tam çözünürlüklü tekrarlı PNG'ler yerelde kalır; Git'te manifestler ve bu indeksteki seçili örnekler tutulur. Görüntüler yeniden boyutlandırılmadı veya boyanmadı.

Kullanıcı kararı bekleyen konu: özgün panoların, kare hücre ve tek eşya/slot gibi mevcut oyun kuralları korunarak sabit cihaz ölçüsündeki nihai referanslara dönüştürülmesi. Yeni uygulama görüntüleri otomatik olarak referans veya onaylı baseline ilan edilmez.
