# Leaflow 🌿

Leaflow adalah website eksplorasi dan perencana makan serta pelacak riwayat nutrisi. Website ini membantu pengguna memperkirakan kebutuhan kalori, protein, karbohidrat, dan lemak harian, menyusun rencana makan, lalu memantau asupan nutrisinya setiap hari.

## Fitur Utama

- **Dashboard**: ringkasan aktivitas perencanaan makanan, informasi nutrisi, dan akses cepat ke berbagai fitur utama.
- **Explore Meals**: menjelajahi inspirasi makanan dan menemukan pilihan menu sesuai kebutuhan pengguna.
- **Meal Planner**: menghasilkan rencana makan menggunakan AI berdasarkan jawaban kuesioner, seperti tujuan nutrisi, preferensi makanan, alergi, pilihan masakan, anggaran, dan waktu persiapan.
- **Meal Calendar**: melihat dan mengelola rencana makan berdasarkan tanggal.
- **Nutrition Tracking**: memantau konsumsi kalori, protein, karbohidrat, dan lemak berdasarkan makanan yang dikonsumsi.
- **Profile**: mengelola informasi akun pengguna.

## Flow Aplikasi

```text
Pengguna membuka website
  -> Landing Page
  -> Login / Register
  -> Dashboard
       |
       |-- Explore Meals
       |     -> Menjelajahi pilihan makanan
       |
       |-- Planner
       |     -> Mengisi kuesioner
       |     -> Generate meal plan menggunakan AI
       |     -> Menghasilkan rencana makan
       |
       |-- Calendar
       |     -> Melihat rencana makan berdasarkan tanggal
       |
       |-- Track
       |     -> Memantau konsumsi nutrisi
       |
       |-- Profile
             -> Mengelola informasi akun
```

## Tech Stack

| Bagian | Teknologi |
|---|---|
| Frontend | Vue.js, Tailwind CSS, Lucide Icons |
| Backend | Express.js |
| Database | Supabase |
| API | Gemini API (Google Gen AI), Pixabay API |
| Version Control | Git & GitHub |

## Cara Menjalankan

### Prasyarat

- Node.js 20 atau lebih baru
- npm
- Git
- Proyek Supabase
- Google Gemini API Key

### 1. Clone Repository

```bash
git clone https://github.com/witauuzu/leaflow.git
cd leaflow
```

### 2. Menjalankan Backend

Masuk ke direktori backend:

```bash
cd backend
npm install
```

Buat file `.env` di dalam folder `backend/`:

```env
PORT=5000
SUPABASE_URL=https://<project-id>.supabase.co
SUPABASE_KEY=<supabase-key>
FRONTEND_URL=http://localhost:5173
GEMINI_API_KEY=<your-gemini-api-key>
```
Sesuaikan nama environment variable dengan konfigurasi yang digunakan di dalam proyek.

Jalankan backend:

```bash
npm run dev
```

### 3. Menjalankan Frontend

Buka terminal baru dan masuk ke direktori frontend:

```bash
cd frontend
npm install
```

Jalankan development server:

```bash
npm run dev
```

Buka website melalui:

```text
http://localhost:5173
```

## Developer

Developed with 🌿 by **Leaflow Team**. ISCOMFEST 2026
