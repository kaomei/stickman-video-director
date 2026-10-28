<div align="center">

[🇺🇸 EN](README.en.md) · [🇨🇳 简中](README.zh-CN.md) · [🇯🇵 日本語](README.ja.md) · [🇰🇷 한국어](README.ko.md) · [🇫🇷 FR](README.fr.md) · [🇧🇷 PT-BR](README.pt-BR.md) · [🇹🇷 TR](README.tr.md) · [**🇮🇩 ID**](README.id.md)

# 🎬 Stickman Video Director

**Ubah naskah apa pun menjadi video animasi stickman viral dalam berbagai gaya untuk channel YouTube tanpa tampil di kamera. Sepenuhnya open source.**

[![GitHub Stars](https://img.shields.io/github/stars/kaomei/stickman-video-director?style=flat-square)](https://github.com/kaomei/stickman-video-director/stargazers)
![MIT License](https://img.shields.io/badge/License-MIT-16a34a?style=flat-square)

Cukup berikan topik, artikel, atau tautan untuk membuat video stickman lengkap secara otomatis, mulai dari visual, narasi, subtitle, dan efek suara hingga animasi ringan. **Bangun channel YouTube dengan ciri khas sendiri, tanpa tampil di kamera.**

Menghimpun berbagai gaya animasi stickman populer di internet, terus diperbarui dan tersedia secara open source — cocok untuk **sains dan pengetahuan umum, psikologi dan motivasi, edukasi dan kampanye kesadaran, konten yang menenangkan hati, cerita populer, dan beragam niche lainnya.**

</div>

<table width="100%">
<tr>
<td width="50%" align="center">
<strong>Hitam Putih Klasik</strong><br>
<a href="#a1"><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/dark-theme-demo.gif" alt="Animasi stickman hitam putih klasik dengan garis putih di latar hitam" width="90%"></a>
</td>
<td width="50%" align="center">
<strong>Pop Modern</strong><br>
<a href="#a2"><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-2a-demo.gif" alt="Stickman berkupluk merah dengan efek cahaya teknologi modern" width="90%"></a>
</td>
</tr>
<tr>
<td width="50%" align="center">
<strong>Gua Prasejarah</strong><br>
<a href="#a3"><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-3-demo.gif" alt="Cerita stickman di gua prasejarah dengan kejutan komedi" width="90%"></a>
</td>
<td width="50%" align="center">
<strong>Cerita Hangat</strong><br>
<a href="#a4"><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-4-cozy-cafe.gif" alt="Karakter stickman ekspresif di latar keseharian penuh warna" width="90%"></a>
</td>
</tr>
<tr>
<td width="50%" align="center">
<strong>Kartun Sejarah</strong><br>
<a href="#style-5"><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-5-japan-hero.gif" alt="Animasi stickman sejarah di Jepang zaman Edo" width="90%"></a>
</td>
<td width="50%" align="center">
<strong>Sketsa Tangan Minimalis</strong><br>
<a href="#b1"><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@fa0a68d1ccf9fd057230abab2af832f768debe86/assets/readme/previews/b1-minimal-handdrawn.gif" alt="Video stickman sketsa tangan minimalis dengan karakter ekspresif, teks utama, dan animasi ringan" width="90%"></a>
</td>
</tr>
</table>

<div align="center">

**6 gaya · 8 pilihan visual · Contoh yang sudah diuji · Gratis dan open source**

⭐ **Koleksi ini terus bertambah. Beri Star untuk mengikuti gaya-gaya berikutnya.**

[Mulai di sini](#quick-start) · [Gaya A](#a-styles) · [Gaya B](#b-styles) · [Tanya jawab](#faq)

</div>

<a id="creation-modes"></a>

## Dua mode pembuatan video

**Ingin mengatur setiap adegan? Pilih A · Director. Ingin video panjang tanpa merangkai klip satu per satu? Pilih B · Autopilot.** Satu proyek, dua cara produksi.

|  | <div align="center">A · Director</div> | <div align="center">B · Autopilot</div> |
|:---:|:---|:---|
| **Cara kerja** | **Anda mengendalikan produksi, AI menyusun arahan:** dapatkan storyboard dan prompt, lalu atur sendiri pembuatan klip dan editing. | **Berikan topik atau kebutuhan, terima video jadi:** ilustrasi, narasi, subtitle, animasi ringan, dan penggabungan video dikerjakan otomatis. |
| **Durasi** | **Diutamakan untuk video pendek**, misalnya 30 detik–3 menit; video lebih panjang juga bisa dibuat per bagian. | **Diutamakan untuk video panjang**, terutama video bernarasi **10 menit ke atas**; juga mendukung video pendek dan cerita bersambung. |
| **Alat** | Asisten AI yang mendukung Skill menyusun rancangan; **Google Flow** atau platform lain menghasilkan klip; **CapCut** atau editor lain merangkainya. | Dijalankan melalui agen seperti **Codex atau Claude Code** yang dapat membaca dan menulis file, memakai alat, serta menjalankan perintah untuk menghubungkan pembuatan materi dengan penggabungan video lokal. |
| **Visual** | **Animasi per adegan:** berfokus pada gerakan, arahan kamera, dan interaksi karakter. | **Storyboard ilustrasi + animasi ringan:** pergantian adegan, zoom, dan pergeseran kamera mengikuti narasi, tanpa harus menghasilkan animasi penuh untuk setiap bagian. |
| **Hasil** | Rancangan penyutradaraan, storyboard, prompt video per bagian, dan arahan suara. | **File video lengkap dengan narasi, subtitle, dan animasi ringan.** |
| **Mulai** | <div align="center"><a href="#director-start">Gunakan mode Director</a></div> | <div align="center"><a href="#autopilot-start">Gunakan mode Autopilot</a></div> |

Keduanya bisa dimulai dari **topik, teks, atau naskah lengkap**. **Seri A dan B memiliki penomoran, gaya visual, serta contoh masing-masing; gaya baru ditambahkan di serinya sendiri.** Rasio, bahasa narasi, dan suara dapat dipilih sesuai kebutuhan. Durasi di atas adalah saran, bukan batas wajib.

Autopilot memerlukan layanan gambar dan suara yang bisa digunakan, serta lingkungan lokal untuk merangkai video. Jendela chat biasa tidak menggantikan lingkungan tersebut. Skill ini gratis dan open source; layanan yang dihubungkan mungkin berbayar.

<a id="quick-start"></a>

## Mulai di sini

Kirim pesan di bawah ke asisten AI yang mendukung Skill. Setelah terpasang, asisten akan menjelaskan **hasil dari tiap mode dan cara memulainya**, lengkap dengan contoh permintaan yang bisa langsung Anda sesuaikan.

```text
Tolong pasangkan Skill ini:
https://github.com/kaomei/stickman-video-director

Setelah berhasil dipasang, segera baca SKILL.md yang terpasang.
Jelaskan dengan bahasa sederhana hasil dari kedua mode,
alat yang diperlukan, serta alur pembuatannya.
Berikan contoh permintaan yang bisa saya sesuaikan.
Berdasarkan kebutuhan saya, jelaskan apa yang masih kurang
dan langkah berikutnya secara konkret.
```

<a id="director-start"></a>

### A · Director: prompt video per adegan

Setelah memasang Skill, kirim pesan ini ke asisten AI dan ganti dengan topik Anda:

```text
Gunakan mode Director / mode A untuk mengubah topik,
teks, atau kebutuhan berikut menjadi video stickman:
[Tulis topik, tempel teks, atau jelaskan kebutuhan Anda]

Kebutuhan: horizontal 16:9, gaya A3 “Gua Prasejarah”.
Buat 30 detik dulu.
Berikan rancangan penyutradaraan terlebih dahulu.
Setelah saya setujui, berikan prompt video untuk setiap bagian.
```

**Alur: topik dan kebutuhan → naskah cerita → konfirmasi tiga tampak karakter bila diperlukan → prompt adegan terperinci → hasilkan klip dan edit menjadi video secara manual**

Rancangan mencakup struktur cerita, narasi per bagian, gerakan, kamera, dan arahan suara. Setelah menerima prompt, salin satu per satu ke [Google Flow](https://flow.google.com/) atau alat pembuat video lain. Gunakan CapCut atau editor lain untuk menambahkan subtitle dan menyelesaikan video.

Untuk percobaan pertama, ikuti [panduan produksi lengkap dalam bahasa Mandarin](https://x.com/CrazyKaomei/status/2102311241046008268).

<a id="autopilot-start"></a>

### B · Autopilot: dari satu permintaan menjadi video lengkap

Setelah memasang Skill di lingkungan yang bisa mengakses file dan menjalankan perintah, seperti Codex atau Claude Code, katakan:

```text
Gunakan mode Autopilot / mode B untuk mengubah topik, artikel,
postingan, berita, atau kebutuhan berikut menjadi video
yang menarik untuk YouTube:
[Tempel konten atau tautan, atau jelaskan kebutuhan video promosi]

Kebutuhan: 5–10 menit, horizontal 16:9, gaya B1
“Sketsa Tangan Minimalis”, dengan narasi, subtitle, dan efek suara.

Periksa dahulu konfigurasi gambar, suara, dan penggabungan video.
Lalu berikan naskah dan contoh video 20 detik dengan audio.
Setelah saya setujui, selesaikan seluruh video secara otomatis,
dengan visual mengikuti ritme narasi. Kirim file video lengkap,
tanpa perlu saya rangkai per bagian secara manual.
```

**Alur: topik, konten, atau kebutuhan → setujui naskah → setujui contoh 20 detik dengan audio → produksi otomatis → terima video lengkap**

Asisten AI merancang adegan, menghasilkan gambar dan narasi, menyiapkan subtitle dan efek suara, lalu merangkainya mengikuti ritme suara. Anda cukup menyetujui naskah dan contoh video, tanpa membuat serta menyambung setiap bagian sendiri.

Saat pertama digunakan, asisten memeriksa konfigurasi dan menjelaskan apa yang belum tersedia serta cara melengkapinya. Jika gambar atau suara kurang cocok, bagian tersebut bisa disesuaikan tanpa mengulang bagian yang sudah disetujui.

<a id="style-gallery"></a>

<a id="a-styles"></a>

## Pilihan gaya A · Director

Diperbarui dengan penomoran A1, A2, A3… Setiap gaya memiliki contoh animasinya sendiri.

<a id="a1"></a>

### A1: Hitam Putih Klasik

Ide besar bisa dijelaskan dengan beberapa garis saja. Di atas latar putih atau hitam polos, karakter, properti, dan warna aksen menjadi pembawa cerita. Pas untuk video penjelasan yang singkat dan mudah dipahami.

- **Tampilannya:** Kepala bulat, tangan dan kaki berupa garis, ketebalan garis konsisten, serta sesekali ekspresi sederhana. Maksimal tiga warna aksen cerah membedakan emosi, risiko, atau tindakan. Konsep abstrak menjadi gambar: rasa cemas sebagai sangkar, fokus sebagai indikator progres.
- **Cocok untuk:** Sains, psikologi, motivasi, pengelolaan diri, analisis bisnis, dan penjelasan konsep.
- **Pilih yang mana?** Latar putih terasa bersih dan lugas untuk pembelajaran sehari-hari. Latar hitam memberi kontras, ketegangan, dan kesan emosional yang lebih kuat.

| A1.1 · Stickman hitam di latar putih | A1.2 · Stickman putih di latar hitam |
|:---:|:---:|
| <!-- demo:light:start --><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/light-theme-demo.gif" alt="A1.1: animasi stickman hitam di latar putih" width="360"><!-- demo:light:end --> | <!-- demo:dark:start --><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/dark-theme-demo.gif" alt="A1.2: animasi stickman putih di latar hitam" width="360"><!-- demo:dark:end --> |
| Latar putih · Karakter hitam | Latar hitam · Karakter putih |

---

<a id="a2"></a>

### A2: Pop Modern

Kupluk merah dan kaus kuning membuat karakter ini mudah dikenali. Gunakan latar teknologi yang bersih untuk menjelaskan produk, atau ajak karakternya masuk ke kamar, jalanan, dan ruang terbuka untuk bercerita.

- **Tampilannya:** Satu karakter yang mudah dikenali, dua jenis dunia. Teknologi minimalis memadukan ruang putih, pola kisi samar, antarmuka melayang seperti kaca, dan cahaya biru sian. Cerita berwarna memakai latar berwarna, pencahayaan sinematik, dan kedalaman ruang.
- **Cocok untuk:** Teknologi minimalis untuk alat AI, produk teknologi, tutorial, dan demo fitur. Cerita berwarna untuk pengembangan diri, kejadian sehari-hari, petualangan, dan cerita motivasi.
- **Pilih yang mana?** Pilih teknologi minimalis untuk menjelaskan alat atau metode; pilih cerita berwarna untuk mengikuti pengalaman seorang karakter.

| A2.1 · Teknologi Minimalis | A2.2 · Cerita Berwarna |
|:---:|:---:|
| <img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-2a-demo.gif" alt="A2.1: animasi teknologi minimalis dengan karakter berkupluk merah" width="360"> | <img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-2b-demo.gif" alt="A2.2: karakter berkupluk merah di latar sinematik berwarna" width="360"> |
| Ruang putih · Kisi samar · Cahaya sian | Latar berwarna · Cahaya sinematik · Suasana cerita |

---

<a id="a3"></a>

### A3: Gua Prasejarah

Bawa masalah masa kini ke dunia tanpa ponsel dan kantor. Gua, pakaian kulit hewan, api unggun, dan ekspresi berlebihan mengubah keluh kesah dunia kerja serta tingkah manusia menjadi cerita dengan kejutan.

- **Tampilannya:** Garis kasar seperti gambar tangan, kepala berisi putih, tangan dan kaki berwarna gelap, pakaian kulit hewan, serta latar bernuansa tanah. Interaksi karakter, sorotan reaksi, dan jeda komedi jadi kunci. Pilih karakter dewasa, anak-anak, atau lansia sesuai cerita; tidak semua cerita harus memakai wajah yang sama.
- **Cocok untuk:** Skenario prasejarah, sindiran dunia kerja, pengamatan tentang sifat manusia, komedi gelap, fabel, dan cerita berbahasa Inggris untuk anak.
- **Pilih yang mana?** Untuk cerita singkat dengan akhir tak terduga, terutama saat hubungan ala masa kini terasa lucu sekaligus akrab di tengah suku prasejarah.

| Contoh 1: “Dari Mana Datangnya Pekerjaan Pertama Manusia?” | Contoh 2: “Manusia Pertama Kali Menemukan Api” |
|:---:|:---:|
| <img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-3-demo.gif" alt="Pratinjau Dari Mana Datangnya Pekerjaan Pertama Manusia?" width="360"> | <img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-3-community-fire.gif" alt="Manusia Pertama Kali Menemukan Api, animasi karya komunitas" width="360"> |
| Cerita prasejarah · Kejutan dunia kerja | Penemuan api · Karya komunitas |

---

<a id="a4"></a>

### A4: Cerita Hangat

Mug yang selalu disimpan untuk hari istimewa. Pesan yang rasanya harus segera dibalas. Sore yang akhirnya Anda luangkan untuk diri sendiri. Karakter sederhana hadir di latar keseharian yang berwarna; gerakan, ekspresi, dan kamera membawa ceritanya.

- **Tampilannya:** Kepala bulat berisi putih, tubuh ramping, tangan dan kaki berupa garis gelap, serta ekspresi kecil yang alami di lingkungan kartun 2D penuh warna. Gambar lebar mengenalkan tempat, close-up menangkap keraguan atau kelegaan, dan kamera yang mengikuti karakter menjaga cerita tetap bergerak.
- **Cocok untuk:** Cerita keseharian yang dekat dengan penonton, pengembangan diri, hubungan, momen hangat, membangun kebiasaan, dan konten berbahasa Inggris untuk anak.
- **Pilih yang mana?** Agar penonton merasa, “Ini aku banget,” lewat momen kecil. Warna dan cahaya mengikuti topik: kehangatan, kecemasan, kelelahan, atau awal yang baru.

| Contoh 1: Cemas Membalas Pesan Saat di Perjalanan | Contoh 2: Meluangkan Waktu untuk Diri Sendiri |
|:---:|:---:|
| <img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-4-cozy-station.gif" alt="Karakter yang cemas membalas pesan di stasiun" width="360"> | <img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-4-cozy-cafe.gif" alt="Beristirahat di kafe terbuka yang bermandikan sinar matahari" width="360"> |
| Stasiun · Kamera mengikuti karakter · Close-up emosional | Kafe terbuka · Cahaya hangat · Gerak keseharian |

---

<a id="style-5"></a>
<a id="a5"></a>

### A5: Kartun Sejarah

Ceritakan sejarah lewat karakter yang bisa diikuti. Temani samurai menyusuri jalanan Edo, jumpai kucing hitam di kuil Mesir, atau ikuti prajurit menuju perkemahan Romawi. Kostum zaman dulu, latar berwarna, dan kejutan kecil membuat masa lalu terasa seperti cerita, bukan kumpulan slide.

- **Tampilannya:** Kepala bulat berisi putih, mata oval hitam, garis tegas, serta tangan dan kaki tipis seperti stickman. Dipadukan dengan pakaian sesuai zaman, bayangan kartun yang lembut, dan latar bergaya lukisan. Ganti pakaian, bangunan, properti, dan musik sesuai era, bukan dasar gaya karakternya.
- **Cocok untuk:** Sejarah dunia, fakta mengejutkan, kehidupan sehari-hari di masa lalu, tokoh sejarah, dan komedi bertema sejarah.
- **Pilih yang mana?** Untuk mengubah fakta menjadi kejadian yang dialami karakter. Bangun penjelasan lewat situasi yang jelas, reaksi yang bermakna, atau kejutan cerita.

| Contoh 1: Keseharian di Jepang Zaman Edo | Contoh 2: Kucing dan Mumi di Mesir Kuno |
|:---:|:---:|
| <img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-5-japan.gif" alt="Keseharian seorang samurai di Jepang zaman Edo" width="360"> | <img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-5-egypt.gif" alt="Kucing hitam dan mumi di kuil Mesir Kuno" width="360"> |
| Jalanan Edo · Pakaian samurai · Kejutan sehari-hari | Latar kuil berwarna · Kucing hitam · Keunikan sejarah |

Kontribusi gaya dan prompt: [Lawal Ridwan / @leksautomate](https://github.com/leksautomate).

---

<a id="b-styles"></a>

## Pilihan gaya B · Autopilot

Diperbarui dengan penomoran B1, B2, B3… Setiap gaya memiliki contoh video dengan storyboard ilustrasi dan animasi ringan, dikelola terpisah dari seri A.

<a id="b1"></a>

### B1: Sketsa Tangan Minimalis

Visual mengikuti jalannya narasi. Stickman ekspresif, properti berwarna dengan sentuhan gambar tangan, dan teks utama yang menonjol membantu menjelaskan ide, cerita, atau keunggulan produk dengan jelas dan menarik.

- **Tampilannya:** Latar kertas hampir putih dengan kisi sangat samar, garis hitam seperti gambar tangan, dan sedikit properti berwarna. Ekspresi, animasi ringan pada bagian gambar, transisi yang mengalir, dan efek suara menggerakkan adegan. Teks utama menonjolkan informasi, sementara subtitle mengikuti narasi.
- **Cocok untuk:** Video penjelasan YouTube, psikologi dan pengembangan diri, cerita dunia kerja, konten edukasi, serta promosi produk.
- **Pilih yang mana?** Untuk mengubah topik, teks, atau naskah menjadi video lengkap dengan narasi dan subtitle. Visual mengikuti ritme suara, cocok untuk penjelasan berkelanjutan maupun cerita panjang.

Klik GIF untuk menonton atau mengunduh contoh dengan audio.

<table width="100%">
  <tr>
    <th width="50%" align="center">Contoh 1: Bikin Konten YouTube Tanpa Tampil di Kamera</th>
    <th width="50%" align="center">Contoh 2: Kenapa Tidak Ada yang Menonton?</th>
  </tr>
  <tr>
    <td width="50%" align="center"><a href="assets/readme/b1-minimal-handdrawn.mp4"><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@fa0a68d1ccf9fd057230abab2af832f768debe86/assets/readme/previews/b1-minimal-handdrawn.gif" alt="Contoh B1 Sketsa Tangan Minimalis: klik untuk menonton atau mengunduh contoh bersuara tentang membuat konten YouTube tanpa tampil di kamera" width="360"></a></td>
    <td width="50%" align="center"><a href="skills/directing-stickman-videos/assets/b1/approved-2026-10-23.mp4"><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@61e202ccecf9d9926cf76e13f3284181297729b8/assets/readme/previews/b1-minimal-handdrawn-2026-10-23.gif" alt="Contoh B1 Sketsa Tangan Minimalis: klik untuk menonton atau mengunduh contoh dengan suara Bodi, subtitle, karakter gambar tangan, dan animasi ringan" width="360"></a></td>
  </tr>
  <tr>
    <td align="center">Karakter gambar tangan · Teks utama · Animasi ringan</td>
    <td align="center">Narasi Bodi · Ekspresi hidup · Animasi ringan</td>
  </tr>
</table>

---

<a id="b2"></a>

### B2: Segera hadir…

Penjelasan gaya, contoh video tersendiri, dan contoh penggunaan akan ditambahkan di sini.

<!-- readme:reliability -->

<a id="faq"></a>

## Tanya jawab

### Q1. Bisa membuat video tanpa punya naskah?

Bisa. Berikan topik, artikel, tautan, atau kebutuhan yang spesifik. Asisten AI akan menyusunnya menjadi naskah video; naskah yang sudah ada juga bisa langsung digunakan. Sebaiknya jelaskan juga target penonton, platform, dan durasi yang diinginkan.

### Q2. Bisakah gaya Director dibuat sepenuhnya otomatis? Mengapa mode ini tetap ada?

Alur produksi gaya seri A saat ini masih relatif terpisah. Namun, Anda bisa meminta asisten AI membantu memadukan gaya seri A yang Anda sukai dengan alur produksi seri B untuk membuat versi DIY Anda sendiri.

Alasan utama mempertahankan Director adalah untuk mengendalikan biaya pembuatan video dan percobaan ulang. Untuk video berdurasi belasan menit, satu putaran pembuatan keseluruhan video bisa menghabiskan **puluhan dolar AS**, dan mengulang prosesnya akan menambah biaya. Karena itu, Director tetap menggunakan pembuatan dan pemeriksaan per adegan serta editing manual. Anda memegang kendali atas setiap shot dan bisa memastikan hasilnya sebelum memutuskan untuk melanjutkan.

### Q3. Bagaimana jika karakter di mode Director tidak konsisten?

Anda bisa meminta: “Bantu desain stickman yang sesuai dengan gaya pilihan saya terlebih dahulu. Saya ingin menyetujui tiga tampaknya — depan, samping, dan belakang — sebelum menerima prompt adegan.” Cara ini juga cocok untuk membuat karakter khas sendiri. Jika sudah ada referensi karakter yang disetujui, gunakan kembali; bila tidak perlu karakter khusus, langkah ini boleh dilewati.

Pada alat video yang mendukung gambar referensi, **lampirkan gambar karakter yang sudah disetujui setiap kali menghasilkan klip**. Gambar referensi hanya bantuan tambahan: tidak menggantikan prompt adegan atau mengubah aturan gaya yang dipilih. Tetap periksa konsistensi karakter antarklip sebelum menyelesaikan video.

### Q4. Harus memakai Codex?

Tidak. Mode Director bisa digunakan melalui asisten AI yang mendukung pemasangan dan penggunaan Skill.

Autopilot membutuhkan lingkungan seperti Codex atau Claude Code yang dapat membaca dan menulis file serta menjalankan perintah, dengan layanan gambar, suara, dan dependensi lokal yang sesuai.

<!-- readme:platforms -->

### Q5. Bagaimana mengubah artikel atau referensi menjadi video yang lebih menarik?

Jelaskan siapa yang ingin Anda tarik, apa poin utamanya, dan apa yang Anda ingin penonton lakukan setelah menonton. Asisten AI akan mencari sudut bahasan, merancang pembuka yang memancing perhatian, menyusun alur, dan menyiapkan ajakan penutup sebelum membuat storyboard.

Jika punya video referensi, sertakan dan jelaskan apakah Anda menyukai ritme, cara penyampaian, atau struktur ceritanya. Pelajari metodenya, tetapi pertahankan sudut pandang dan penyampaian sendiri. Fakta sejarah, bisnis, dan sains tetap perlu diperiksa sebelum dipublikasikan.

### Q6. Apakah berbayar?

Skill ini gratis dan open source. Layanan gambar, suara, dan pembuatan video dapat mengenakan biaya sesuai platform dan paket akun. Berlangganan suatu platform belum tentu termasuk kuota penggunaan API.

### Q7. Jika gambar atau narasinya kurang cocok, harus mengulang semua?

Tidak. Setujui naskah dan rencana produksi dahulu, lalu buat contoh singkat untuk memeriksa gaya, karakter, suara, subtitle, serta ritme. Setelah cocok, barulah lanjutkan video lengkap.

Jika hanya satu bagian yang perlu diperbaiki, ubah bagian tersebut dan gunakan kembali narasi serta materi yang sudah disetujui. Ini mengurangi pengerjaan ulang dan biaya berulang.

### Q8. Boleh dipublikasikan ke YouTube atau dipakai secara komersial?

Proyek ini memakai lisensi MIT yang mengizinkan penggunaan komersial. Gambar, musik, efek suara, dan layanan narasi pihak ketiga tetap mengikuti ketentuan lisensinya masing-masing. Kelayakan monetisasi YouTube ditentukan melalui peninjauan dan kebijakan platform.

<!-- readme:contribute -->

## Lebih banyak gaya, lebih banyak ruang berkarya

⭐ **Ingin membangun channel YouTube tanpa tampil di kamera dan mengeksplorasi monetisasi konten?** Beri Star untuk mengikuti gaya stickman, prompt video, dan alur produksi otomatis, supaya ide channel Anda tidak berhenti di pertanyaan “videonya dibuat bagaimana?”

🔔 **Ikuti [@CrazyKaomei](https://x.com/CrazyKaomei)** untuk alur otomatisasi dan alat praktis bagi video YouTube tanpa tampil di kamera: menghubungkan naskah, narasi, gambar, dan editing agar pekerjaan berulang berkurang dan kreator solo bisa terus berkarya. Ide topik, pertumbuhan channel, dan pendekatan monetisasi juga terus dibagikan.

<a id="whats-next"></a>

🎨 **Gaya yang direncanakan:** buku cerita bergambar, aksi grafiti, sitkom dua karakter, petualangan permainan kartu, perpaduan latar nyata dan ilustrasi, serta penjelasan dengan papan tulis atau presentasi.

💬 **Saran dan karya komunitas:** ingin mengusulkan gaya, membagikan karya, atau melaporkan masalah? Hubungi [@CrazyKaomei](https://t.me/CrazyKaomei) di Telegram. Usulan gaya sebaiknya menyertakan referensi dan topik yang ingin dicoba. Untuk kiriman karya, sertakan video, gaya yang digunakan, dan tautan kreator agar bisa ditampilkan dengan kredit yang sesuai.

<div align="center">
<a href="https://www.star-history.com/?repos=kaomei%2Fstickman-video-director&amp;type=date">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=kaomei/stickman-video-director&amp;type=Date&amp;theme=dark">
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=kaomei/stickman-video-director&amp;type=Date">
    <img src="https://api.star-history.com/svg?repos=kaomei/stickman-video-director&amp;type=Date" alt="Riwayat Star GitHub untuk kaomei/stickman-video-director" width="800">
  </picture>
</a>
</div>

## Lisensi

Proyek ini dirilis dengan [lisensi MIT](https://github.com/kaomei/stickman-video-director/blob/main/LICENSE). Anda boleh menggunakan, mengubah, mendistribusikan, dan memakainya secara komersial tanpa membayar Skill ini. Sertakan pemberitahuan hak cipta dan lisensi saat mendistribusikan proyek atau bagian pentingnya.

Disediakan “apa adanya”, tanpa jaminan. Lihat ketentuan lengkap di [LICENSE](https://github.com/kaomei/stickman-video-director/blob/main/LICENSE).
