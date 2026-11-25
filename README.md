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
- Pusat pertandingan memperbarui daftar skor setiap 60 detik saat tab jadwal terbuka, menyediakan tombol pembaruan manual, dan menangani pergantian kompetisi ketika permintaan sebelumnya masih berjalan; halaman detail pertandingan memeriksa pembaruan setiap 30 detik tanpa memakai cache browser.
- Klasemen diperiksa ulang saat hasil pertandingan selesai terdeteksi dan memiliki pembaruan cadangan setiap 5 menit saat panel klasemen terbuka; permintaan data klasemen dan skor memakai kebijakan tanpa cache browser agar tidak sengaja menampilkan respons cache lama.
- OpenLigaDB menjadi sumber cadangan klasemen Bundesliga jika ESPN gagal, dengan label sumber dan waktu pembaruan. OpenLigaDB dikelola komunitas, sehingga bukan pengganti verifikasi resmi.
- Halaman detail pertandingan dengan statistik dan susunan pemain jika disediakan oleh ESPN.
- Klasemen dunia dengan pilihan 46 liga/kompetisi dari Asia, Eropa, Amerika Utara, Amerika Selatan, Afrika, dan turnamen internasional; data ditarik dari endpoint ESPN dan hanya ditampilkan jika tersedia.
- Filter wilayah dan kompetisi, tombol pembaruan manual, kolom main/menang/seri/kalah/gol memasukkan/gol kemasukan/selisih gol/poin, serta cache klasemen maksimal 5 menit.
- Direktori 26 klub dan halaman profil, berita klub, stadion, serta skuad untuk klub yang didukung penyedia data.

## Catatan dan batasan
- Koneksi internet diperlukan. ESPN atau RSS2JSON dapat membatasi permintaan atau tidak menyediakan data pada waktu tertentu. Waktu polling adalah interval pemeriksaan aplikasi, bukan jaminan bahwa penyedia memperbarui datanya pada interval yang sama.
- Berita dan skuad bergantung pada layanan pihak ketiga; kegagalan layanan dapat membuat sebagian data tidak tampil.
- Kartu berita dan halaman artikel dibuka di mailnews; nama penerbit dan tautan sumber asli dicantumkan sebagai atribusi. Mailnews tidak menyalin artikel penuh.
- Rangkuman lintas sumber dibuat otomatis dari cuplikan RSS yang tersedia, bukan dari teks lengkap artikel. Pengelompokan topik menggunakan kemiripan judul sehingga tidak selalu sempurna; jumlah sumber pembanding dapat berbeda untuk setiap berita.
- Data skuad klub Indonesia belum terintegrasi. Pelatih hanya ditampilkan jika tersedia sumber terverifikasi.
- Informasi stadion merupakan data referensi dan perlu diverifikasi kembali ke sumber resmi klub.
- Cakupan klasemen bergantung pada ketersediaan endpoint ESPN per kompetisi dan musim. Daftar 46 kompetisi adalah katalog pilihan, bukan jaminan semua liga dunia didukung; liga tanpa data akan diberi status belum tersedia. Data klasemen dapat kosong atau berubah mengikuti format penyedia.
- Sumber pertandingan utama saat ini adalah ESPN; OpenLigaDB dipakai sebagai sumber cadangan jadwal, hasil, dan klasemen Bundesliga. Belum ada feed kedua yang terverifikasi untuk seluruh liga. Untuk multi-provider global yang benar-benar saling memeriksa, diperlukan API berlisensi seperti Sportmonks atau API-Football beserta token dan backend server-side. Jangan menaruh API key di JavaScript publik GitHub Pages.
