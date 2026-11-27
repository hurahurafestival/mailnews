# Mailnews — API-Football Worker

Backend proxy Cloudflare Worker untuk menghubungkan website statis mailnews dengan API-Football tanpa menaruh API key di JavaScript publik.

## Keamanan dan batasan

- API key disimpan sebagai Cloudflare Worker secret bernama `APIFOOTBALL_KEY`.
- Worker hanya menerima GET dan OPTIONS.
- CORS dibatasi ke `https://hurahurafestival.github.io` dan localhost untuk pengembangan.
- Parameter dan endpoint dibatasi; URL upstream tidak bisa ditentukan oleh pengunjung.
- Cache edge: live 15 detik, fixture tanggal/detail 30–60 detik, klasemen dan pencarian liga 1 jam.
- Interval cache bukan jaminan bahwa penyedia sudah menerbitkan data terbaru. API-Football menyebut pembaruan fixture bisa setiap 15 detik, tetapi keterlambatan bervariasi menurut kompetisi.
- Cakupan livescore, susunan pemain, statistik, dan klasemen bergantung pada liga, musim, serta paket API.

## Deploy

1. Buat akun Cloudflare dan buka **Workers & Pages**.
2. Buat Worker baru, misalnya `mailnews-football-api`.
3. Salin isi `cloudflare-worker.js` ke editor Worker lalu deploy.
4. Di **Settings → Variables and Secrets**, tambahkan secret:
   - Name: `APIFOOTBALL_KEY`
   - Value: API key dari dashboard API-Football.
5. Deploy ulang jika diminta, lalu uji URL Worker:
   - `/health`
   - `/fixtures?live=all`
   - `/fixtures?date=2026-11-25`
   - `/standings?league=39&season=2026`
   - `/leagues?search=Premier League`

Jangan pernah menulis API key ke `index.html`, repository publik, URL, atau pesan chat.

## Pengayaan foto berita

- `GET /news-image?url=<URL artikel>` mengambil metadata `og:image`/`twitter:image` langsung dari halaman penerbit yang diizinkan.
- Host dibatasi ke domain penerbit berita yang digunakan Mailnews; redirect diperiksa satu per satu dan hanya HTTPS yang diterima.
- Respons gambar disimpan di cache edge hingga 24 jam; frontend membatasi pengayaan maksimal 12 artikel per pemuatan berita, tiga permintaan bersamaan, dan menyimpan hasil di browser selama maksimal 7 hari.
- Jika penerbit tidak menyediakan metadata foto atau halaman tidak dapat diakses, Mailnews tetap menampilkan latar netral tanpa foto stok.

## Endpoint proxy

| Endpoint | Fungsi | Cache |
|---|---|---:|
| `GET /health` | Status proxy | Tidak disimpan |
| `GET /fixtures?live=all` | Semua pertandingan live yang tersedia | 15 detik |
| `GET /fixtures?date=YYYY-MM-DD` | Jadwal/hasil tanggal tertentu, zona Asia/Jakarta | 60 detik |
| `GET /fixtures?id=ID` | Detail satu pertandingan | 30 detik |
| `GET /standings?league=ID&season=YYYY` | Klasemen liga | 1 jam |
| `GET /leagues?search=Nama` | Cari ID liga dan cakupan data | 1 jam |

## Integrasi ke mailnews

Setelah Worker berhasil dideploy, URL Worker perlu ditambahkan ke konfigurasi frontend. ID liga API-Football berbeda dari ID ESPN; buat pemetaan kompetisi secara eksplisit dan periksa coverage liga/musim sebelum menampilkan data. Jangan menganggap 46 kompetisi ESPN otomatis memiliki padanan API-Football.

Untuk saat ini, frontend mailnews tetap menggunakan ESPN dan fallback Bundesliga OpenLigaDB. Worker ini belum menjadi sumber aktif sampai URL Worker tersedia dan pengujian respons berhasil dilakukan.

Dokumentasi resmi: https://www.api-football.com/documentation-v3
