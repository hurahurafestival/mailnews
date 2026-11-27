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
- Pusat pertandingan menggunakan API-Football melalui Cloudflare Worker untuk liga yang terpetakan, dengan ESPN sebagai fallback bila tersedia.
- Navigasi tanggal jadwal dengan tombol hari sebelumnya/berikutnya dan kalender; setiap tanggal menyajikan rentang 8 hari serta cache terpisah agar jadwal lama tidak tertukar dengan tanggal lain.
- Filter **Semua Live** untuk skor pertandingan yang sedang berlangsung lintas kompetisi, serta **Jadwal Hari Ini** untuk pertandingan dari semua liga yang tersedia.
- Pilihan liga Indonesia, K League 1 Korea Selatan, A-League Men Australia, dan Chinese Super League menggunakan ID kompetisi API-Football yang terverifikasi.
- Pusat pertandingan memperbarui daftar skor setiap 60 detik saat tab jadwal terbuka, menyediakan tombol pembaruan manual, dan menangani pergantian kompetisi ketika permintaan sebelumnya masih berjalan; halaman detail pertandingan memeriksa pembaruan setiap 30 detik tanpa memakai cache browser.
- Klasemen diperiksa ulang saat hasil pertandingan selesai terdeteksi dan memiliki pembaruan cadangan setiap 5 menit saat panel klasemen terbuka; permintaan data klasemen dan skor memakai kebijakan tanpa cache browser agar tidak sengaja menampilkan respons cache lama.
- OpenLigaDB menjadi sumber cadangan klasemen Bundesliga jika ESPN gagal, dengan label sumber dan waktu pembaruan. OpenLigaDB dikelola komunitas, sehingga bukan pengganti verifikasi resmi.
- Halaman detail pertandingan API-Football: skor/status, kejadian (gol, kartu, pergantian pemain), statistik tim, susunan pemain, dan statistik pemain jika tersedia dari cakupan kompetisi.
- Statistik detail pertandingan memadankan statistik kandang/tandang berdasarkan identitas sisi tim, menormalkan nilai numerik untuk grafik perbandingan, dan menampilkan tanda — jika data tidak dikirim; posisi pemain pada visualisasi lapangan hanya digambar jika koordinat grid benar-benar tersedia.
- Pemetaan statistik API-Football memprioritaskan ID tim kandang/tandang dari fixture, sehingga data tidak salah sisi hanya karena urutan respons berubah; pembacaan nilai numerik juga mendukung persentase dan angka desimal.
- Halaman detail pertandingan ESPN kini juga mencoba menampilkan kronologi kejadian dan statistik pemain dari ringkasan pertandingan jika disediakan oleh ESPN; grafik perbandingan statistik tim dihitung dari nilai kandang/tandang yang tersedia.
- Susunan pemain API-Football kini memiliki visualisasi lapangan berdasarkan formasi dan koordinat grid pemain yang dikirim penyedia, disertai daftar pemain cadangan. Jika koordinat atau line-up tidak tersedia, halaman menampilkan keterangan bahwa data belum dirilis, bukan posisi rekaan.
- Kronologi API-Football memakai penanda visual berbeda untuk gol, kartu kuning/merah, pergantian pemain, dan VAR; nama pencetak gol serta assist tetap mengikuti data penyedia.
- Penyegaran detail pertandingan memiliki pengunci permintaan agar polling 30 detik dan pembukaan kembali tab tidak menumpuk permintaan ketika jaringan lambat.
- Klasemen dunia dengan pilihan 46 liga/kompetisi dari Asia, Eropa, Amerika Utara, Amerika Selatan, Afrika, dan turnamen internasional; data ditarik dari endpoint ESPN dan hanya ditampilkan jika tersedia.
- Filter wilayah dan kompetisi, tombol pembaruan manual, kolom main/menang/seri/kalah/gol memasukkan/gol kemasukan/selisih gol/poin, serta cache klasemen maksimal 5 menit.
- Direktori 26 klub dan halaman profil, berita klub, stadion, serta skuad untuk klub yang didukung penyedia data.

## Logo klub
- Logo SVG klub yang ditampilkan pada direktori utama disimpan di `assets/club-logos/` agar tersedia dari repositori Mailnews.
- Pemetaan logo dipakai pada direktori/profil klub, kartu jadwal dan skor, serta klasemen. Klub dinamis lain memakai logo dari sumber data; bila tidak tersedia, Mailnews memakai logo cadangan dari penyedia atau ikon teks.
- Atribusi koleksi logo: [JoseArroyave/football-logos](https://github.com/JoseArroyave/football-logos). Catatan lisensi dan hak merek ada di `assets/club-logos/README.md`.

## Catatan dan batasan
- Koneksi internet diperlukan. ESPN atau RSS2JSON dapat membatasi permintaan atau tidak menyediakan data pada waktu tertentu. Waktu polling adalah interval pemeriksaan aplikasi, bukan jaminan bahwa penyedia memperbarui datanya pada interval yang sama.
- Berita dan skuad bergantung pada layanan pihak ketiga; kegagalan layanan dapat membuat sebagian data tidak tampil.
- Kartu berita dan halaman artikel dibuka di mailnews; nama penerbit dan tautan sumber asli dicantumkan sebagai atribusi. Mailnews tidak menyalin artikel penuh.
- Rangkuman berita disusun otomatis menjadi 4–5 paragraf dari cuplikan RSS penerbit yang cocok; tiap cuplikan tetap diatribusikan dan keterbatasan sumber tunggal dinyatakan secara terbuka. Mailnews tidak mengarang skor, kutipan, atau fakta yang tidak tersedia. Foto thumbnail diambil dari metadata gambar RSS (thumbnail/enclosure/HTML gambar) dan ditampilkan pada kartu berita serta pilihan editorial bila penerbit menyediakannya. Pengelompokan topik menggunakan kemiripan judul sehingga tidak selalu sempurna.
- Pengambilan berita internasional juga memakai pencarian khusus penerbit BBC, The Guardian, dan ESPN; cuplikan RSS yang disimpan diperluas hingga 720 karakter bila sumber menyediakannya. Ringkasan menggunakan hingga empat cuplikan penerbit yang berbeda dan menyertakan catatan batas verifikasi.
- Data skuad klub Indonesia belum terintegrasi. Pelatih hanya ditampilkan jika tersedia sumber terverifikasi.
- Informasi stadion merupakan data referensi dan perlu diverifikasi kembali ke sumber resmi klub.
- Cakupan klasemen bergantung pada ketersediaan endpoint ESPN per kompetisi dan musim. Daftar 46 kompetisi adalah katalog pilihan, bukan jaminan semua liga dunia didukung; liga tanpa data akan diberi status belum tersedia. Data klasemen dapat kosong atau berubah mengikuti format penyedia.
- Cakupan statistik, susunan pemain, dan livescore berbeda per kompetisi dan musim. API-Football menyatakan sebagian kompetisi hanya menyediakan hasil akhir; statistik dan line-up dapat tidak tersedia.
- Klasemen API-Football diperbarui oleh penyedia sekitar setiap jam, bukan setiap detik. Fitur klasemen live yang benar-benar dihitung ulang selama pertandingan memerlukan snapshot sebelum matchday dan proses kalkulasi tersendiri; mailnews tidak akan mengarang posisi klasemen.
- API-Football Free dibatasi 100 request/hari dan 10 request/menit; paket berbayar memiliki kuota lebih besar. Aplikasi berskala publik dengan polling banyak liga dan statistik live membutuhkan paket yang memadai atau penyedia berlisensi lain. Jangan menaruh API key di JavaScript publik GitHub Pages.


## Backend data provider (opsional)

Direktori `backend/` berisi Cloudflare Worker proxy untuk API-Football. Proxy menyediakan endpoint livescore global, jadwal berdasarkan tanggal, detail pertandingan, pencarian liga, dan klasemen. API key harus disimpan sebagai Worker secret `APIFOOTBALL_KEY`, bukan di frontend atau repository publik.

Panduan deploy, daftar endpoint, aturan cache, dan batasan cakupan tersedia di [backend/README.md](backend/README.md). Worker belum dipakai oleh frontend secara otomatis: URL Worker dan pemetaan ID liga API-Football perlu dikonfigurasi serta diuji terlebih dahulu. Sampai tahap itu, ESPN tetap sumber utama dan OpenLigaDB hanya cadangan Bundesliga.


## Integrasi API-Football

Worker Cloudflare `mailnews-footbal-api.hurahurafestival.workers.dev` mem-proxy API-Football. ID yang digunakan untuk empat kompetisi Asia: Liga 1 Indonesia (194), K League 1 (219), A-League Men (49), dan Chinese Super League (118). Kompetisi Eropa utama tetap memiliki pemetaan API-Football. Endpoint `/fixtures?id=ID` menyediakan detail pertandingan terintegrasi jika tersedia, sedangkan `/fixtures?live=all` menyediakan pertandingan live lintas liga. Cakupan dan data aktual tetap mengikuti paket API-Football dan musim yang tersedia.

Worker menerima filter `/fixtures?live=all&league=ID`; Secret `APIFOOTBALL_KEY` dikonfigurasi sebagai Cloudflare Worker secret. Jangan menyimpan key di frontend. Frontend dan Worker sudah diperiksa sintaksnya, tetapi respons data runtime dari API-Football belum dapat dikonfirmasi dari sesi pengembangan ini.


### Pusat pertandingan dan detail live (25 November 2026)

- Ditambahkan pilihan Semua Live lintas liga dan Jadwal Hari Ini lintas liga melalui endpoint API-Football.
- Kartu pertandingan API-Football kini membuka halaman detail internal mailnews. Halaman detail mengambil fixture, kejadian, statistik, line-up, dan statistik pemain dalam satu permintaan fixture ID jika tersedia.
- Pencarian liga memperhitungkan variasi nama negara API-Football (Korea Republic, China PR) serta nama kompetisi Indonesia yang dapat berubah.

### Perbaikan jadwal dan penyegaran klasemen (25 November 2026)

- Worker `/fixtures` sekarang menerima rentang `from`, `to`, `league`, dan `season` untuk mengambil jadwal tujuh hari ke depan dari API-Football.
- Frontend menampilkan jadwal rentang tujuh hari dari API-Football untuk lima liga yang dipetakan; ESPN juga diminta menampilkan rentang tujuh hari sebagai sumber cadangan.
- Cache klasemen pada Worker dipersingkat menjadi 5 menit. Penyegaran otomatis frontend tetap berjalan ketika panel klasemen terbuka.
- Kode frontend dan Worker lulus pemeriksaan sintaks. Akses pengujian eksternal dari sesi ini dibatasi, sehingga respons live provider dan tampilan aktual di browser belum dapat diverifikasi.

### AFC Indonesia dan zona klasemen

- Worker menyediakan proxy halaman resmi AFC Indonesia untuk klasemen dan bagian jadwal mendatang. Mailnews membaca bagian **Upcoming Matches** jika AFC memublikasikan fixture mendatang; bila bagian tersebut kosong, jadwal beralih ke sumber cadangan ESPN dan statusnya menyebutkan alasan tersebut.
- Klasemen Indonesia menandai posisi 1 sebagai kualifikasi AFC, posisi 2 sebagai AFC Challenge League, dan posisi 16–18 sebagai zona degradasi sesuai regulasi BRI Super League 2026/27 (Article 7.8 untuk degradasi) serta penanda kualifikasi yang ditampilkan penyedia klasemen.
- BRI Super League adalah kasta tertinggi sehingga tidak memiliki zona promosi domestik. Posisi 16–18 terdegradasi ke Championship musim berikutnya.
- Kolom **Gerak** memakai snapshot klasemen sebelumnya yang disimpan lokal di browser pengunjung. ▲ berarti naik posisi, ▼ turun posisi; kunjungan pertama akan menampilkan tanda — karena belum ada snapshot pembanding.

### Optimasi pemuatan jadwal dan detail pertandingan (25 November 2026)

- Jadwal ESPN untuk rentang delapan tanggal kini diminta dalam dua kelompok paralel (maksimal empat tanggal sekaligus), dengan batas waktu 7 detik per tanggal, bukan delapan permintaan berurutan.
- Hasil jadwal ESPN disimpan pada perangkat pengunjung. Saat panel dibuka kembali, hasil tersimpan langsung ditampilkan sambil mengambil data terbaru; jika sumber gagal, hasil tersimpan tetap ditampilkan dengan label waktu agar tidak disalahartikan sebagai data live.
- Status jadwal menunjukkan jika sebagian tanggal gagal dimuat. Ini membantu membedakan jadwal kosong dari kegagalan sumber.
- Validasi ID numerik pada endpoint Worker /match diperbaiki. Worker berhasil di-deploy ke Cloudflare; pemeriksaan sintaks frontend dan Worker lulus.


### Pembaruan otomatis berita (27 November 2026)

- Berita otomatis diperbarui setiap 15 menit selama halaman Mailnews aktif, dan diperiksa kembali saat pengguna kembali ke tab setelah jeda.
- Tombol **Perbarui berita** memungkinkan pengambilan berita secara manual tanpa memuat ulang halaman.
- Cache berita versi baru menjaga berita terakhir tetap tampil ketika penyedia RSS gagal diakses; label waktu menunjukkan kapan data terakhir berhasil diperbarui.
- Penggabungan berita menghindari penghitungan ganda dari URL atau nama penerbit yang sama. Jumlah sumber yang tampil merujuk pada penerbit berbeda yang berhasil dicocokkan, bukan jumlah semua artikel di internet.
- Pemeriksaan sintaks JavaScript lulus. Pembaruan live pada GitHub Pages dan ketersediaan layanan RSS tetap perlu diuji dari browser pengguna.
