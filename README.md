# mailnews — Berita Sepak Bola

Website berita sepak bola responsif dengan desain Glassy Sidebar V5, tema gelap/terang, pencarian, dan kategori liga.

## Menjalankan
Buka `index.html` di browser atau aktifkan GitHub Pages:
1. Buka **Settings → Pages** pada repositori.
2. Pada **Build and deployment**, pilih **Deploy from a branch**.
3. Pilih branch **main** dan folder **/(root)**, lalu Save.

## Sumber berita otomatis
Berita dimuat dari Google News RSS melalui layanan RSS2JSON. Koneksi internet diperlukan. Jika layanan pihak ketiga sedang tidak tersedia atau membatasi permintaan, daftar berita akan menampilkan pesan untuk mencoba kembali.

## Catatan
- Artikel dibuka pada situs penerbit asal; mailnews tidak menyalin isi penuh artikel.
- Gambar artikel mengikuti metadata feed dan dapat tidak tersedia untuk sebagian sumber.
- Jadwal, skor langsung, dan klasemen belum diintegrasikan; fitur tersebut memerlukan API sepak bola tersendiri.
