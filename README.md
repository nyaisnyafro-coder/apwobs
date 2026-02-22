# APW (Apertus Workspace) - Portfolio Snapshot

Bu repo, `APW` (Apertus Workspace) projesinin **portfolyo odakli**, sanitize edilmis bir sunumudur.

Amac:
- urunun arayuz/mimari kalitesini gostermek
- teknik kapsam ve engineering yaklasimini anlatmak
- ticari olarak hassas olan kodlari/promptlari paylasmadan proje seviyesini sergilemek

Bu repo, canli ortamda calisan urunun birebir kopyasi degildir.

## Neler Var?
- `frontend/`
  React + Vite tabanli APW paneli (Dashboard, Istihbarat, Icerikler, Ayarlar vb.)
- `docs/ARCHITECTURE.md`
  sistem tasarim ozeti, veri akisi ve katmanlar
- `docs/PORTFOLIO_SCOPE.md`
  bu repoda bilerek paylasilmayan kritik alanlar
- `docs/SETUP_DEMO.md`
  lokal demo/inceleme adimlari

## Neler Bilerek Yok?
Guvenlik ve fikri mulkiyet nedeniyle asagidaki alanlar bu repoda bilincli olarak yer almaz:
- ozel prompt stratejileri ve prompt zincirleri
- AI uretim/teyit motorlarinin kritik servis implementasyonlari
- gizli is kurallari ve agirliklandirma mekanizmalari
- API anahtarlari, secret'lar, production env dosyalari
- operasyonel scriptler ve ortam-ozel dagitim detaylari

Detay: `docs/PORTFOLIO_SCOPE.md`

## APW Kisa Ozeti
APW, haber/icerik operasyonu icin tasarlanmis bir "workspace"tir.

Ana moduller:
- Dashboard: veri yogunlugu, teyit metrikleri, gelismeler paneli
- Istihbarat: haber tarama, durum takibi, tekrar teyit akislari
- Icerikler: AI destekli icerik uretimi ve editor akisina uygun kayitlar
- Ayarlar: marka kimligi, ton, dil ve paylasim tercihleri

## Teknoloji Yigini
- Frontend: React, Vite, TailwindCSS
- UI: Lucide Icons, Recharts
- Backend (private implementation): FastAPI + SQLAlchemy + SQLite/PostgreSQL uyumlu tasarim
- Deployment (private implementation): systemd + reverse proxy (Nginx)

## Guvenlik Notu
- Bu repoda `.env`, token, API key, sifre ve benzeri gizli bilgiler bulunmaz.
- Yine de lokalde calistirirken kendi guvenli env yonetimini kullanin.

## Lisans
Bu repo portfolyo sunumu amaclidir. Kodun yeniden kullanim/uretimi konusunda izin modeli ayrica belirlenmelidir.
