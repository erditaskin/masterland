# Tarihsel backend referansı

Bu klasör 17 Kasım 2026 öncesi Supabase migration/function davranışlarını ve eski regresyon testlerinin referans kaynaklarını korur. Aktif backend değildir ve yeni deployment hedefi olarak kullanılmaz. Mobil çalışma zamanında Supabase SDK'sı veya Supabase ağ çağrısı yoktur.

Aktif API `/Users/erdi/masterland/masterland-api`, origin `https://api.masterland.app` altındadır. Yeni veritabanı sıfırdan kurulmuştur; buradaki kullanıcı, UID veya migration geçmişi taşınmamıştır. Eski Supabase projesi kullanıcı hesabından otomatik silinmez. Sağlayıcıdaki eski callback adresleri yeni gerçek giriş kabulüne kadar geri dönüş için korunabilir.
