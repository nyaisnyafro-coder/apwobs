# APW Portfolio Scope (Sanitize Policy)

Bu dosya, portfolyo repoya neyin dahil edilip neyin edilmedigini aciklar.

## Dahil Edilenler
- Frontend kaynak kodu (`frontend/src`) ve arayuz yapisi
- UI/UX kararlarini gosteren component yapisi
- Dashboard ve panel akislari
- Genel mimari ve moduler tasarim dokumantasyonu

## Dahil Edilmeyenler
- AI prompt metinleri, prompt zincirleri, role-based prompt stratejileri
- Uretim/teyit servislerinin kritik backend implementasyonlari
- Ozel scoring/ranking/heuristic mekanizmalari
- Production operasyon scriptleri ve ortam-ozel deployment konfigleri
- Gizli anahtarlar, environment degerleri, hassas endpoint/config bilgileri

## Neden?
- Fikri mulkiyet korumasi
- Guvenlik risklerinin azaltimi
- Public repo ile private urun omurgasinin ayrimi

## Public Repo Prensibi
Bu repo:
- "ne yaptigimizi" gosterir
- "bunu nasil ticari avantaja cevirdigimizi" tum detayiyla acmaz

Yani APW'nin urun kalitesi, arayuz mimarisi ve engineering disiplini gorunur; kritik sos korunur.
