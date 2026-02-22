# APW Architecture (High-Level)

## 1) Layerlar
- Presentation Layer: React sayfalari ve component'ler
- API Layer (private): FastAPI endpoint'leri, auth ve validation
- Service Layer (private): icerik uretimi, teyit, istihbarat is akislari
- Data Layer (private): SQLAlchemy modelleri + kalici cache

## 2) Temel Akislar
- Haber akisi: kaynak -> normalize -> durumlama -> panel gosterimi
- Icerik akisi: secili haber -> AI destekli uretim -> editor duzenleme -> kayit
- Istatistik akisi: zaman araligi filtreleri -> aggregate metrikler -> dashboard

## 3) Frontend Mimari Notlari
- Sayfa bazli moduler yapi (`pages/*`)
- Tekrar kullanilabilir panel/component katmani (`components/*`)
- Lokal state + context tabanli veri yonetimi
- Yavas/degisken endpoint'ler icin yukleme ve hata durumlari

## 4) Guvenlik ve Operasyon
- Session bazli auth yaklaşımı (private backend implementation)
- Rate limiting / audit kaydi (private implementation)
- Production'da service manager + reverse proxy kurgusu

## 5) Neden Bu Ayrim?
Portfolio repoda:
- urunun mimari kalitesi ve frontend yetkinligi acik
- kritik backend know-how ve prompt IP'si kapali

Bu sayede APW hem teknik olarak anlatilabilir hem de ticari olarak korunur.
