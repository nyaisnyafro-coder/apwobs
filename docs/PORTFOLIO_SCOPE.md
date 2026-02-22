# APW Portfolio Scope (Sanitize Policy)

Bu dosya, portfolyo repoya neyin dahil edilip neyin edilmediğini açıklar.

## Dahil Edilenler
- Frontend kaynak kodu (`frontend/src`) ve arayüz yapısı
- UI/UX kararlarını gösteren component yapısı
- Dashboard ve panel akışları
- Genel mimari ve modüler tasarım dokümantasyonu

## Dahil Edilmeyenler
- AI prompt metinleri, prompt zincirleri, role-based prompt stratejileri
- Üretim/teyit servislerinin kritik backend implementasyonları
- Özel scoring/ranking/heuristic mekanizmaları
- Production operasyon scriptleri ve ortam-özel deployment konfigleri
- Gizli anahtarlar, environment değerleri, hassas endpoint/config bilgileri

## Neden?
- Fikri mülkiyet koruması
- Güvenlik risklerinin azaltımı
- Public repo ile private ürün omurgasının ayrımı

## Public Repo Prensibi
Bu repo:
- "ne yaptığımızı" gösterir
- "bunu nasıl ticari avantaja çevirdiğimizi" tüm detayıyla açmaz

Yani APW'nin ürün kalitesi, arayüz mimarisi ve engineering disiplini görünür; kritik sos korunur.
