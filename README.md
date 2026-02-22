# APW (Apertus Workspace) - Portfolio Snapshot

Bu repo, `APW` (Apertus Workspace) projesinin **portfolyo odaklı**, sanitize edilmiş bir sunumudur.

Amaç:
- ürünün arayüz/mimari kalitesini göstermek
- teknik kapsam ve engineering yaklaşımını anlatmak
- ticari olarak hassas olan kodları/promptları paylaşmadan proje seviyesini sergilemek

Bu repo, canlı ortamda çalışan ürünün birebir kopyası değildir.

## Neler Var?
- `frontend/`
  React + Vite tabanlı APW paneli (Dashboard, İstihbarat, İçerikler, Ayarlar vb.)
- `docs/ARCHITECTURE.md`
  sistem tasarım özeti, veri akışı ve katmanlar
- `docs/PORTFOLIO_SCOPE.md`
  bu repoda bilerek paylaşılmayan kritik alanlar
- `docs/SETUP_DEMO.md`
  lokal demo/inceleme adımları

## Neler Bilerek Yok?
Güvenlik ve fikri mülkiyet nedeniyle aşağıdaki alanlar bu repoda bilinçli olarak yer almaz:
- özel prompt stratejileri ve prompt zincirleri
- AI üretim/teyit motorlarının kritik servis implementasyonları
- gizli iş kuralları ve ağırlıklandırma mekanizmaları
- API anahtarları, secret'lar, production env dosyaları
- operasyonel scriptler ve ortam-özel dağıtım detayları

Detay: `docs/PORTFOLIO_SCOPE.md`

## APW Kısa Özeti
APW, haber/içerik operasyonu için tasarlanmış bir "workspace"tir.

Ana modüller:
- Dashboard: veri yoğunluğu, teyit metrikleri, gelişmeler paneli
- İstihbarat: haber tarama, durum takibi, tekrar teyit akışları
- İçerikler: AI destekli içerik üretimi ve editör akışına uygun kayıtlar
- Ayarlar: marka kimliği, ton, dil ve paylaşım tercihleri

## Teknoloji Yığını
- Frontend: React, Vite, TailwindCSS
- UI: Lucide Icons, Recharts
- Backend (private implementation): FastAPI + SQLAlchemy + SQLite/PostgreSQL uyumlu tasarım
- Deployment (private implementation): systemd + reverse proxy (Nginx)

## Güvenlik Notu
- Bu repoda `.env`, token, API key, şifre ve benzeri gizli bilgiler bulunmaz.
- Yine de lokalde çalıştırırken kendi güvenli env yönetimini kullanın.

## Lisans
Bu repo portfolyo sunumu amaçlıdır. Kodun yeniden kullanım/üretimi konusunda izin modeli ayrıca belirlenmelidir.
