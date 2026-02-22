# APW Architecture (High-Level)

## 1) Katmanlar
- Presentation Layer: React sayfaları ve component'ler
- API Layer (private): FastAPI endpoint'leri, auth ve validation
- Service Layer (private): içerik üretimi, teyit, istihbarat iş akışları
- Data Layer (private): SQLAlchemy modelleri + kalıcı cache

## 2) Temel Akışlar
- Haber akışı: kaynak -> normalize -> durumlama -> panel gösterimi
- İçerik akışı: seçili haber -> AI destekli üretim -> editör düzenleme -> kayıt
- İstatistik akışı: zaman aralığı filtreleri -> aggregate metrikler -> dashboard

## 3) Frontend Mimari Notları
- Sayfa bazlı modüler yapı (`pages/*`)
- Tekrar kullanılabilir panel/component katmanı (`components/*`)
- Lokal state + context tabanlı veri yönetimi
- Yavaş/değişken endpoint'ler için yükleme ve hata durumları

## 4) Güvenlik ve Operasyon
- Session bazlı auth yaklaşımı (private backend implementation)
- Rate limiting / audit kaydı (private implementation)
- Production'da service manager + reverse proxy kurgusu

## 5) Neden Bu Ayrım?
Portfolio repoda:
- ürünün mimari kalitesi ve frontend yetkinliği açık
- kritik backend know-how ve prompt IP'si kapalı

Bu sayede APW hem teknik olarak anlatılabilir hem de ticari olarak korunur.
