# mailnews — Berita Sepak Bola

Website berita sepak bola responsif dengan desain Glassy Sidebar, tema gelap/terang, pencarian, kategori liga, direktori klub, dan halaman profil klub.

## Menjalankan
Buka https://hurahurafestival.github.io/mailnews/ atau jalankan `index.html` melalui browser. Untuk GitHub Pages:
1. Buka **Settings → Pages** pada repositori.
2. Pilih **Deploy from a branch**.
3. Pilih branch **main** dan folder **/(root)**.

## Fitur
- Berita otomatis dari Google News RSS melalui RSS2JSON, dengan pencarian dari berbagai penerbit dan sumber sepak bola (termasuk media Indonesia, BBC, The Guardian, dan Sky Sports).
- Pencarian berita dan filter kategori.
- Cache berita otomatis selama 15 menit dan fallback ke berita tersimpan saat koneksi/API bermasalah.
- Berita utama pilihan otomatis berdasarkan berita terbaru yang berhasil dimuat, dengan ringkasan dan atribusi sumber di halaman utama.
- Pengelompokan laporan bertopik serupa dari beberapa penerbit agar satu peristiwa tidak memenuhi daftar sebagai berita duplikat.
- Rangkuman lintas sumber yang dirangkai dari judul dan cuplikan RSS, disertai atribusi serta tautan masing-masing penerbit.
- Rekomendasi berita terkait pada halaman artikel agar pembaca tetap menjelajah di mailnews.
- Halaman ringkasan artikel dengan tautan ke penerbit asli.
- Jadwal dan skor pertandingan dari ESPN untuk Premier League, La Liga, Serie A, Bundesliga, dan Liga Champions.
- Halaman detail pertandingan dengan statistik dan susunan pemain jika disediakan oleh ESPN.
- Klasemen liga ditampilkan sebagai tabel langsung di dalam mailnews.
- Direktori 26 klub dan halaman profil, berita klub, stadion, serta skuad untuk klub yang didukung penyedia data.

## Catatan dan batasan
- Koneksi internet diperlukan. RSS2JSON atau ESPN dapat membatasi permintaan atau tidak menyediakan data pada waktu tertentu.
- Berita dan skuad bergantung pada layanan pihak ketiga; kegagalan layanan dapat membuat sebagian data tidak tampil.
- Kartu berita dan halaman artikel dibuka di mailnews; nama penerbit dan tautan sumber asli dicantumkan sebagai atribusi. Mailnews tidak menyalin artikel penuh.
- Rangkuman lintas sumber dibuat otomatis dari cuplikan RSS yang tersedia, bukan dari teks lengkap artikel. Pengelompokan topik menggunakan kemiripan judul sehingga tidak selalu sempurna; jumlah sumber pembanding dapat berbeda untuk setiap berita.
- Data skuad klub Indonesia belum terintegrasi. Pelatih hanya ditampilkan jika tersedia sumber terverifikasi.
- Informasi stadion merupakan data referensi dan perlu diverifikasi kembali ke sumber resmi klub.
- Klasemen bergantung pada endpoint ESPN dan dapat kosong atau berubah sesuai format data kompetisi.
