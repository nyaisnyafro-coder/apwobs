# APW Demo Setup

Bu repo portfolyo/sunum odaklı olduğu için production backend'i birebir içermez.
Yine de frontend'i lokal olarak açıp UI akışlarını inceleyebilirsiniz.

## Gereksinimler
- Node.js 18+
- npm 9+

## Çalıştırma
```bash
cd frontend
npm install
npm run dev
```

Varsayılan olarak uygulama backend endpointlerine istek atar.
Gerçek backend bu repoda olmadığından aşağıdaki yollar izlenebilir:

## Demo Modu Önerisi
1. Browser devtools network override/mock
2. Veya yerel bir mock API server
3. Veya sadece statik UI/komponent inceleme

## Build
```bash
cd frontend
npm run build
```

## Not
Bu repo "çalışan ürün paketi" değil, "teknik portfolio vitrini"dir.
