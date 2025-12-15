<div align="center">
  <img src="logo.svg" alt="LearnCheck AI Logo" width="150"/>
  <h1><b>LearnCheck AI : Platform Evaluasi Belajar Cerdas & Adaptif</b></h1>
</div>

#### Unlock your true learning potential with AI-driven assessments.

**LearnCheck AI** adalah platform evaluasi pembelajaran berbasis Generative AI yang dirancang untuk membantu pengguna mengukur pemahaman materi secara mendalam. Aplikasi ini tidak hanya memberikan skor, tetapi juga menganalisis tingkat keyakinan (confidence level) untuk membedakan antara penguasaan materi yang murni dengan keberuntungan ("hoki"), serta menyediakan fitur aksesibilitas yang inklusif.

## Our Team

| Name | Asah-ID | Role |
| :--- | :--- | :--- |
| **Gericho Chandra Diva Pratama Hutagalung** | R429D5Y0684 | UI/UX & Styling |
| **Lucky Ferdiansyah** | R429D5Y1006 | React / Frontend Dev |
| **Mochammad Rifiq Surya Mulya Zarkasi** | R429D5Y1126 | Backend / AI Engineer |
| **M.Surya Dharma Khazinatul Azror** | R429D5Y1047 | Backend / AI Engineer |
| **Arya Leo Anggara** | R429D5Y0286 | React / Frontend Dev |

---

# Installation the App

## Prerequisites
Pastikan Anda telah menginstal software berikut sebelum memulai:
- [Node.js](https://nodejs.org/) (Versi 18+ direkomendasikan)
- [NPM](https://www.npmjs.com/) atau Yarn
- [Groq API Key](https://console.groq.com/) (Untuk backend AI)

## Getting Started

### 1. Setup Backend (Server)
Backend dibangun menggunakan Express.js dan bertugas menangani integrasi AI (Groq/Llama-3) serta scraping materi.

Link llama-3.3-70b-versatile via Groq : https://console.groq.com/playground?model=llama-3.3-70b-versatile

```bash
# Masuk ke folder backend (sesuaikan dengan struktur folder Anda)
cd backend

# Install dependencies
npm install
npm install groq-sdk

# Buat file .env dan isi konfigurasi berikut:
# GROQ_API_KEY= your_groq_api_key_here
# PORT=5000

# Jalankan Server
node index.js
```
### 2. Setup Frontend (Client)
Frontend dibangun menggunakan React + Vite dengan styling Tailwind CSS.

```bash
# Masuk ke folder frontend (terminal baru)
cd frontend

# Install dependencies
npm install

# Jalankan mode development
npm run dev
```
Akses aplikasi melalui browser di http://localhost:5173.

---

### Usage
How to Start a Quiz
- Pilih Tingkat Kesulitan:

  - Mudah: Fokus pada pemahaman dasar (Recall & Understand).

  - Sulit: Fokus pada studi kasus dan analisis (Analyze & Evaluate).

- Mulai Kuis:

- Klik tombol "Mulai Sekarang". Aplikasi akan mengambil materi dari sumber belajar dan AI akan men-generate soal secara real-time.

- Jawab Pertanyaan:

  - Pilih jawaban yang menurut Anda benar.

- Confidence Check: Tentukan apakah Anda "Sangat Yakin" atau "Masih Ragu". Ini mempengaruhi analisis akhir.

- Understanding the Result

- Setelah kuis selesai, Anda akan mendapatkan laporan analisis:

- Skor Akhir: Persentase jawaban benar.

- Matriks Pemahaman:

  - Paham: Jawaban benar & yakin.

  - Hoki: Jawaban benar tapi ragu (perlu dipelajari lagi).

  - Kurang Tepat: Jawaban hampir benar (parsial).

  - Salah: Jawaban salah & yakin (miskonsepsi).

- Rekomendasi: Daftar soal yang perlu ditinjau ulang beserta penjelasan AI.

---

### Features
🧠 AI-Powered Quiz Generation
Menggunakan Llama-3 via Groq untuk membuat soal otomatis dari materi pembelajaran. Backend dilengkapi sistem AI Audit untuk memastikan kualitas soal sebelum ditampilkan ke user.

🎯 Metacognitive Assessment
Menilai bukan hanya "benar atau salah", tapi juga tingkat keyakinan (Confidence Score). Membantu user menyadari area di mana mereka hanya "menebak".

♿ Accessibility First
Dyslexia Friendly: Dukungan font khusus untuk penderita disleksia.

🟩/🟥Question Difficulty
User dapat memilih tingkat kesulitan soal di tiap materi berdasarkan keinginannya.

🔊Text-to-Speech (TTS): Fitur pembacaan soal otomatis.

🌗Adaptive UI: Dark Mode & Light Mode, serta pengaturan ukuran font yang dinamis.

📊 Comprehensive Analytics
Visualisasi progress belajar menggunakan grafik riwayat dan breakdown analisis per soal.

---

<div align="center">
  <h2>📸 Screen Preview</h2>
  <table>
    <tr>
      <td align="center">
        <img src="/screenshots/page1.jfif" alt="Halaman Awal" width="200px" />
        <br /><b>Halaman Awal</b>
      </td>
      <td align="center">
        <img src="/screenshots/soal_kosong.jpeg" alt="Tampilan Soal" width="200px" />
        <br /><b>Tampilan Soal</b>
      </td>
      <td align="center">
        <img src="/screenshots/single_answer.jfif" alt="Pilih Jawaban" width="200px" />
        <br /><b>Single Answer</b>
      </td>
    </tr>
    <tr>
      <td align="center">
        <img src="/screenshots/single_correct.jfif" alt="Jawaban Benar" width="200px" />
        <br /><b>Feedback Single</b>
      </td>
      <td align="center">
        <img src="/screenshots/multiple_answer.jfif" alt="Multiple Answer" width="200px" />
        <br /><b>Multiple Choice</b>
      </td>
      <td align="center">
        <img src="/screenshots/multiple_correct.jfif" alt="Multiple Correct" width="200px" />
        <br /><b>Feedback Multiple</b>
      </td>
    </tr>
    <tr>
      <td align="center">
        <img src="/screenshots/result.jfif" alt="Hasil Quiz" width="200px" />
        <br /><b>Halaman Hasil</b>
      </td>
      <td align="center">
        <img src="/screenshots/ai_tutor.jfif" alt="AI Tutor" width="200px" />
        <br /><b>AI Tutor</b>
      </td>
      <td align="center">
        <img src="/screenshots/ringkasan_ai.jfif" alt="Ringkasan AI" width="200px" />
        <br /><b>Ringkasan Materi</b>
      </td>
    </tr>
  </table>
</div>


---


### Built With 🛠
### Frontend
[React](https://react.dev/) - Library JavaScript untuk antarmuka pengguna.

[Vite](https://vite.dev/) - Build tool frontend generasi berikutnya.

[Tailwind CSS](https://tailwindcss.com/) - Framework CSS utility-first untuk styling cepat.

[Axios](https://axios-http.com/) - HTTP Client untuk request ke backend.

### Backend
[Express.js](https://expressjs.com/) - Framework web minimalis untuk Node.js.

[Groq SDK](https://console.groq.com/) - Integrasi High-performance AI inference (Llama-3).

[Cheerio](https://cheerio.js.org/) - Scraping dan parsing konten HTML materi.

[Cors & Dotenv](https://www.npmjs.com/) - Keamanan dan manajemen konfigurasi.

---

### Contact
Project ini dibuat sebagai bagian dari tugas Capstone Project. Jika ada pertanyaan, silakan hubungi tim kami melalui GitHub profile masing-masing.

Visit:
- [Suryadhrma git's](https://github.com/Suryadhrma)
- [WansXNeo git's](https://github.com/WansXNeo)
- [luckyferd git's](https://github.com/luckyferd)
- [Geriii4 git's](https://github.com/Geriii4)
- [leoooooooooo1 git's](https://github.com/leoooooooooo1)

